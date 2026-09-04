"use server";

import { revalidatePath } from "next/cache";
import {
  adminClaimEditSchema,
  claimSchema,
  messageSchema,
  settlementSchema,
} from "@/lib/validations/claim";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/supabase/authz";
import { ADMIN_RECIPIENTS, sendEmail } from "@/lib/email/client";
import {
  claimDecisionEmail,
  claimMessageAdminEmail,
  claimReceivedEmail,
  newClaimAdminEmail,
  payoutRecordedEmail,
} from "@/lib/email/templates";
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

  // Identity gate. Also enforced by a trigger on `claims`, so a request that
  // skips the UI entirely still cannot file a claim on an unverified account.
  const { data: gate } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", user.id)
    .maybeSingle();

  const verification = (gate as { verification_status?: string } | null)?.verification_status;
  if (verification !== "verified") {
    return {
      ok: false,
      message:
        "Your identity has not been verified yet. Upload an identity document before submitting a claim.",
    };
  }

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

  const reference = data.reference as string;

  // Both emails are best effort: the case is already saved, and a bounced
  // receipt must not report the submission as failed.
  const receipt = claimReceivedEmail({
    reference,
    claim_type: values.claimType,
    amount: values.amount,
    currency: values.currency,
    reason: values.reason,
    contact_name: values.contactName,
  });
  await sendEmail({ to: values.contactEmail, ...receipt });

  const alert = newClaimAdminEmail({
    reference,
    claim_type: values.claimType,
    amount: values.amount,
    currency: values.currency,
    reason: values.reason,
    description: values.description,
    contact_name: values.contactName,
    contact_email: values.contactEmail,
    country: values.country,
    // Evidence uploads happen after this returns, so the count is not final.
    documentCount: 0,
  });
  await sendEmail({ to: ADMIN_RECIPIENTS, ...alert, replyTo: values.contactEmail });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/claims");

  return { ok: true, claimId: data.id as string, reference };
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

  // A reviewer writing to a customer already reaches them through the case
  // thread and the notification trigger. It is the other direction that had no
  // route out of the database, so only a customer's message is emailed on.
  if ((profile?.role ?? "user") !== "admin") {
    const { data: claim } = await supabase
      .from("claims")
      .select("reference, contact_name, contact_email")
      .eq("id", claimId)
      .maybeSingle<{ reference: string; contact_name: string; contact_email: string }>();

    if (claim) {
      const notice = claimMessageAdminEmail({
        reference: claim.reference,
        fullName: claim.contact_name,
        email: claim.contact_email,
        body: parsed.data.body,
      });
      // Reply-to is the customer, so answering the email reaches them directly.
      await sendEmail({ to: ADMIN_RECIPIENTS, ...notice, replyTo: claim.contact_email });
    }
  }

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

  const { supabase, userId, isAdmin, reason } = await getAdminAccess();
  if (!supabase || !userId) return { ok: false, message: reason ?? "Unavailable." };
  if (!isAdmin) return { ok: false, message: reason ?? "You are not a reviewer on this project." };

  const { error } = await supabase
    .from("claims")
    .update({ status, last_update: new Date().toISOString() })
    .eq("id", claimId);

  // Surface what Postgres actually said, rather than a generic failure.
  if (error) return { ok: false, message: `The status could not be updated: ${error.message}` };

  // Every change writes a history row, with or without a note. A database
  // trigger turns that row into a notification for the case owner.
  await supabase
    .from("claim_status_history")
    .insert({ claim_id: claimId, status, note: note.trim() || null, created_by: userId });

  await supabase.from("admin_activity").insert({
    admin_id: userId,
    action: "claim.status_changed",
    target_type: "claim",
    target_id: claimId,
    detail: { status, note: note.trim() || null },
  });

  // Tell the customer directly, not just in-app: approve, reject and every
  // other move sends an email from the business address.
  const { data: owner } = await supabase
    .from("claims")
    .select("reference, contact_name, contact_email")
    .eq("id", claimId)
    .maybeSingle();

  const target = owner as
    | { reference: string; contact_name: string; contact_email: string }
    | null;

  if (target?.contact_email) {
    const message = claimDecisionEmail({
      reference: target.reference,
      status: status as ClaimStatus,
      contact_name: target.contact_name,
      note: note.trim() || null,
    });
    await sendEmail({ to: target.contact_email, ...message });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/claims");
  revalidatePath("/dashboard/claims");
  return { ok: true };
}

/** Thin adapter so the existing call sites keep their shape. */
async function requireAdmin() {
  const { supabase, userId, isAdmin, reason } = await getAdminAccess();
  if (!supabase || !userId) return { supabase: null, user: null, error: reason ?? "Unavailable." };
  if (!isAdmin) return { supabase, user: null, error: reason ?? "You are not a reviewer." };
  return { supabase, user: { id: userId }, error: null };
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

  if (updateError) {
    return { ok: false, message: `The case could not be updated: ${updateError.message}` };
  }

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

  // A crypto claim is paid out in USDT. Store the payout currency, the amount
  // actually sent and the rate used, so the customer can check the arithmetic
  // instead of being handed a converted number to take on trust.
  const payoutCurrency = v.payoutCurrency;
  const converted = payoutCurrency !== claim.currency;
  const rate = converted ? v.conversionRate : undefined;

  if (converted && !rate) {
    return {
      ok: false,
      message: `Enter the rate used to convert ${claim.currency} to ${payoutCurrency}.`,
    };
  }

  const settlementAmount = converted
    ? Number((v.approvedAmount * (rate as number)).toFixed(8))
    : v.approvedAmount;

  const { error: updateError } = await supabase
    .from("claims")
    .update({
      approved_amount: v.approvedAmount,
      settlement_currency: payoutCurrency,
      settlement_amount: settlementAmount,
      settlement_rate: rate ?? null,
      settlement_method: v.method,
      settlement_reference: v.reference || null,
      settlement_note: v.note || null,
      settled_at: new Date().toISOString(),
      last_update: new Date().toISOString(),
    })
    .eq("id", claimId);

  if (updateError) {
    return {
      ok: false,
      message: `The payout could not be saved: ${updateError.message}. If this mentions a missing column, run supabase/05_settlements.sql.`,
    };
  }

  await supabase.from("admin_activity").insert({
    admin_id: user.id,
    action: "claim.settlement_recorded",
    target_type: "claim",
    target_id: claimId,
    detail: {
      approved_amount: v.approvedAmount,
      settlement_amount: settlementAmount,
      settlement_currency: payoutCurrency,
      rate: rate ?? null,
      method: v.method,
    },
  });

  const conversionLine = converted
    ? ` Your ${claim.currency} claim was converted to ${payoutCurrency} at 1 ${claim.currency} = ${rate} ${payoutCurrency}.`
    : "";

  await supabase.from("notifications").insert({
    user_id: claim.user_id,
    title: `${settlementAmount} ${payoutCurrency} approved for case ${claim.reference}`,
    body: `${v.note || "The payout has been recorded against your case."}${conversionLine}`,
    claim_id: claimId,
  });

  const { data: payee } = await supabase
    .from("claims")
    .select("contact_name, contact_email")
    .eq("id", claimId)
    .maybeSingle();

  const recipient = payee as { contact_name: string; contact_email: string } | null;

  if (recipient?.contact_email) {
    const message = payoutRecordedEmail({
      reference: claim.reference,
      contact_name: recipient.contact_name,
      approvedAmount: v.approvedAmount,
      claimCurrency: claim.currency,
      settlementAmount,
      settlementCurrency: payoutCurrency,
      rate: rate ?? null,
      method: v.method.replace(/_/g, " "),
      note: v.note || null,
    });
    await sendEmail({ to: recipient.contact_email, ...message });
  }

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


/**
 * One-click decision from the review queue. A thin wrapper over
 * updateClaimStatus with a default note, so the common actions do not require
 * filling in a form.
 */
export async function decideClaim(
  claimId: string,
  decision: "approve" | "reject" | "review" | "request_documents",
) {
  const map = {
    approve: {
      status: "approved" as ClaimStatus,
      note: "Case approved. The recovered amount will be recorded shortly.",
    },
    reject: {
      status: "closed" as ClaimStatus,
      note: "Case closed. It did not meet the criteria for recovery.",
    },
    review: {
      status: "under_review" as ClaimStatus,
      note: "A case handler is now assessing the evidence.",
    },
    request_documents: {
      status: "documents_required" as ClaimStatus,
      note: "Further documents are needed before the review can continue.",
    },
  }[decision];

  return updateClaimStatus(claimId, map.status, map.note);
}

/**
 * Lets the case owner correct their own claim and resubmit it.
 *
 * Only while the case is still open to change: once a reviewer has approved,
 * resolved or closed it, the record is frozen so the decision refers to the
 * evidence it was actually made on. RLS grants update on `claims` to reviewers
 * only, so this runs through a SECURITY DEFINER-free path by re-checking
 * ownership here and writing via the owner's own session.
 */
const OWNER_EDITABLE: ClaimStatus[] = ["submitted", "documents_required", "under_review"];

export async function updateOwnClaim(claimId: string, raw: unknown): Promise<CreateClaimResult> {
  const parsed = claimSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Editing is unavailable in this preview." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session expired. Please sign in again." };

  const { data: claim, error: readError } = await supabase
    .from("claims")
    .select("id, user_id, status, reference")
    .eq("id", claimId)
    .maybeSingle();

  if (readError) return { ok: false, message: `The case could not be read: ${readError.message}` };
  if (!claim) return { ok: false, message: "That case no longer exists." };

  const row = claim as { user_id: string; status: ClaimStatus; reference: string };

  if (row.user_id !== user.id) {
    return { ok: false, message: "You can only edit your own case." };
  }

  if (!OWNER_EDITABLE.includes(row.status)) {
    return {
      ok: false,
      message:
        "This case has already been decided, so it can no longer be edited. Send a message on the case if something is wrong.",
    };
  }

  const v = parsed.data;
  const { data: updated, error: updateError } = await supabase
    .from("claims")
    .update({
      claim_type: v.claimType,
      amount: v.amount,
      currency: v.currency,
      transaction_date: v.transactionDate,
      transaction_type: v.transactionType,
      transaction_reference: v.transactionReference || null,
      reason: v.reason,
      description: v.description,
      supporting_details: v.supportingDetails || null,
      contact_name: v.contactName,
      contact_email: v.contactEmail,
      country: v.country,
      last_update: new Date().toISOString(),
    })
    .eq("id", claimId)
    .eq("user_id", user.id)
    .select("id");

  if (updateError) {
    return { ok: false, message: `The case could not be saved: ${updateError.message}` };
  }

  // RLS reports a blocked update as zero rows rather than an error, so an
  // empty result here means the policy refused it, not that nothing changed.
  if (!updated || updated.length === 0) {
    return {
      ok: false,
      message:
        "The case could not be saved. If this persists, the database may be missing supabase/06_owner_edit.sql.",
    };
  }

  // Resubmitting puts the case back in the queue and tells the reviewer why.
  await supabase.from("claim_messages").insert({
    claim_id: claimId,
    sender_id: user.id,
    sender_role: "user",
    body: "I have corrected the details on this case and resubmitted it for review.",
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/claims");
  revalidatePath(`/dashboard/claims/${row.reference}`);
  return { ok: true, claimId, reference: row.reference };
}
