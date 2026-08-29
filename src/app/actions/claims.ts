"use server";

import { revalidatePath } from "next/cache";
import { claimSchema, messageSchema } from "@/lib/validations/claim";
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
