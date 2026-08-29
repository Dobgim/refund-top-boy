"use server";

import { revalidatePath } from "next/cache";
import {
  adminClaimEditSchema,
  claimSchema,
  messageSchema,
  settlementSchema,
} from "@/lib/validations/claim";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CLAIM_STATUSES } from "@/lib/claims";
import type { ClaimStatus } from "@/types";

export interface CreateClaimResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  claimId?: string;
  reference?: string;
}

/** Creates a claim owned by the signed-in user. The reference is issued by Postgres. */
export async function createClaim(raw: unknown): Promise<CreateClaimResult> {
  const parsed = claimSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message:
        "Supabase is not connected in this preview, so the case was validated but not saved. Add credentials to .env.local to submit for real.",
    };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "The case service is unavailable right now." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session expired. Please sign in again." };

  const values = parsed.data;

  const { data, error } = await supabase
    .from("claims")
    .insert({
      user_id: user.id,
      claim_type: values.claimType,
      amount: values.amount,
      currency: values.currency,
      transaction_date: values.transactionDate,
      transaction_type: values.transactionType,
      transaction_reference: values.transactionReference || null,
      reason: values.reason,
      description: values.description,
      supporting_details: values.supportingDetails || null,
      contact_name: values.contactName,
      contact_email: values.contactEmail,
      country: values.country,
    })
    .select("id, reference")
    .single();

  if (error || !data) {
    return { ok: false, message: "We could not save the case. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/claims");

  return { ok: true, claimId: data.id as string, reference: data.reference as string };
}

/** Posts a message from the case owner onto their own case. */
export async function postClaimMessage(claimId: string, body: string) {
  const parsed = messageSchema.safeParse({ body });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Write a message" };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Messaging is unavailable in this preview." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session expired. Please sign in again." };

  // sender_role is derived server-side from the profile, never from the client.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: "user" | "admin" }>();

  const { error } = await supabase.from("claim_messages").insert({
    claim_id: claimId,
    sender_id: user.id,
    sender_role: profile?.role ?? "user",
    body: parsed.data.body,
  });

  if (error) return { ok: false, message: "The message could not be sent." };

  revalidatePath("/dashboard/claims");
  revalidatePath("/admin/claims");
  return { ok: true };
}

/**
 * Admin-only status change. The role is re-checked here and again by the RLS
 * policy on `claims`, so a forged client request cannot get through.
 */
export async function updateClaimStatus(claimId: string, status: string, note: string) {
  if (!CLAIM_STATUSES.includes(status as ClaimStatus)) {
    return { ok: false, message: "Unknown status." };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Status changes are unavailable in this preview." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session expired. Please sign in again." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: "user" | "admin" }>();

  if (profile?.role !== "admin") {
    return { ok: false, message: "You do not have permission to change a case status." };
  }

  const { error } = await supabase
    .from("claims")
    .update({ status, last_update: new Date().toISOString() })
    .eq("id", claimId);

  if (error) return { ok: false, message: "The status could not be updated." };

  // Every change writes a history row, with or without a note. A database
  // trigger turns that row into a notification for the case owner.
  await supabase
    .from("claim_status_history")
    .insert({ claim_id: claimId, status, note: note.trim() || null, created_by: user.id });

  await supabase.from("admin_activity").insert({
    admin_id: user.id,
    action: "claim.status_changed",
    target_type: "claim",
    target_id: claimId,
    detail: { status, note: note.trim() || null },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/claims");
  revalidatePath("/dashboard/claims");
  return { ok: true };
}

/** Re-reads the caller's role from the database. Never trust the client. */
async function requireAdmin() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { supabase: null, user: null, error: "Unavailable in preview mode." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "Your session expired. Please sign in again." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: "user" | "admin" }>();

  if (profile?.role !== "admin") {
    return { supabase, user, error: "You do not have permission to do that." };
  }
  return { supabase, user, error: null };
}

/** Admin-only correction of the case record itself. */
export async function updateClaimDetails(claimId: string, raw: unknown) {
  const parsed = adminClaimEditSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the highlighted fields." };
  }

  const { supabase, user, error } = await requireAdmin();
  if (error || !supabase || !user) return { ok: false, message: error ?? "Unavailable." };

  const v = parsed.data;
  const { error: updateError } = await supabase
    .from("claims")
    .update({
      claim_type: v.claimType,
      amount: v.amount,
      currency: v.currency,
      transaction_date: v.transactionDate || null,
      transaction_type: v.transactionType || null,
      transaction_reference: v.transactionReference || null,
      reason: v.reason,
      description: v.description,
      supporting_details: v.supportingDetails || null,
      last_update: new Date().toISOString(),
    })
    .eq("id", claimId);

  if (updateError) return { ok: false, message: "The case could not be updated." };

  await supabase.from("admin_activity").insert({
    admin_id: user.id,
    action: "claim.details_edited",
    target_type: "claim",
    target_id: claimId,
    detail: { amount: v.amount, currency: v.currency, claim_type: v.claimType },
  });

  // Tell the owner their case was amended, rather than changing it silently.
  const { data: claim } = await supabase
    .from("claims")
    .select("user_id, reference")
    .eq("id", claimId)
    .maybeSingle<{ user_id: string; reference: string }>();

  if (claim) {
    await supabase.from("notifications").insert({
      user_id: claim.user_id,
      title: `Case ${claim.reference} was updated by a reviewer`,
      body: "The case details were amended. Open the case to see the current record.",
      claim_id: claimId,
    });
  }

  revalidatePath("/admin/claims");
  revalidatePath("/dashboard/claims");
  return { ok: true };
}

/**
 * Records money returned to the customer once a case is approved.
 * This is a payout record. It never debits a customer and holds no card data.
 */
export async function recordSettlement(claimId: string, raw: unknown) {
  const parsed = settlementSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the highlighted fields." };
  }

  const { supabase, user, error } = await requireAdmin();
  if (error || !supabase || !user) return { ok: false, message: error ?? "Unavailable." };

  const { data: claim } = await supabase
    .from("claims")
    .select("user_id, reference, amount, currency")
    .eq("id", claimId)
    .maybeSingle<{ user_id: string; reference: string; amount: number; currency: string }>();

  if (!claim) return { ok: false, message: "That case no longer exists." };

  const v = parsed.data;
  if (v.approvedAmount > Number(claim.amount)) {
    return { ok: false, message: "The approved amount cannot exceed the amount claimed." };
  }

  const { error: updateError } = await supabase
    .from("claims")
    .update({
      approved_amount: v.approvedAmount,
      settlement_method: v.method,
      settlement_reference: v.reference || null,
      settlement_note: v.note || null,
      settled_at: new Date().toISOString(),
      last_update: new Date().toISOString(),
    })
    .eq("id", claimId);

  if (updateError) {
    return { ok: false, message: "The settlement could not be saved. Has migration 05 been run?" };
  }

  await supabase.from("admin_activity").insert({
    admin_id: user.id,
    action: "claim.settlement_recorded",
    target_type: "claim",
    target_id: claimId,
    detail: { approved_amount: v.approvedAmount, method: v.method },
  });

  await supabase.from("notifications").insert({
    user_id: claim.user_id,
    title: `A payout was recorded for case ${claim.reference}`,
    body: v.note || "Open the case to see the amount and how it is being returned.",
    claim_id: claimId,
  });

  revalidatePath("/admin/claims");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/claims");
  return { ok: true };
}

/** Marks the signed-in user's notifications as read. RLS scopes this to them. */
export async function markNotificationsRead(ids?: string[]) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  let query = supabase.from("notifications").update({ read: true }).eq("user_id", user.id);
  if (ids?.length) query = query.in("id", ids);

  await query;
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
  return { ok: true };
}
