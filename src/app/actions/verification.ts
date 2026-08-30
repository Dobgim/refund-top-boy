"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/supabase/authz";
import { ID_DOCUMENT_TYPES, type IdDocumentType } from "@/lib/verification";

const submitSchema = z.object({
  documentType: z.enum(ID_DOCUMENT_TYPES as unknown as [IdDocumentType, ...IdDocumentType[]]),
  /** What the document is called where it was issued, e.g. "Ghana Card". */
  documentLabel: z.string().trim().max(80).optional().or(z.literal("")),
  fullName: z
    .string()
    .trim()
    .min(2, "Enter the full name exactly as printed on the document")
    .max(120),
  documentNumber: z.string().trim().max(64).optional().or(z.literal("")),
  frontPath: z.string().trim().min(1, "Upload the front of the document"),
  backPath: z.string().trim().optional().or(z.literal("")),
});

/**
 * Records a submitted identity document.
 *
 * The files are uploaded straight from the browser into the private bucket
 * under the user's own prefix; this only stores the paths. `status` is fixed at
 * 'pending' by the insert policy and clamped by a trigger on update, so a
 * customer can never mark themselves verified.
 */
export async function submitVerification(raw: unknown) {
  const parsed = submitSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the highlighted fields." };
  }

  const v = parsed.data;

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Verification is unavailable on this deployment." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session expired. Please sign in again." };

  const { error } = await supabase.from("identity_verifications").upsert(
    {
      user_id: user.id,
      document_type: v.documentType,
      document_label: v.documentLabel || null,
      full_name: v.fullName,
      document_number: v.documentNumber || null,
      front_path: v.frontPath,
      back_path: v.backPath || null,
      status: "pending",
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false, message: `Your document could not be submitted: ${error.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/verification");
  revalidatePath("/admin/verifications");
  return { ok: true };
}

/** Reviewer decision on a submitted document. */
export async function reviewVerification(
  verificationId: string,
  decision: "verified" | "rejected",
  reason: string,
) {
  if (decision === "rejected" && reason.trim().length < 4) {
    return { ok: false, message: "Tell the customer what was wrong, so they can fix it." };
  }

  const { supabase, userId, isAdmin, reason: refusal } = await getAdminAccess();
  if (!supabase || !userId) return { ok: false, message: refusal ?? "Unavailable." };
  if (!isAdmin) return { ok: false, message: refusal ?? "You are not a reviewer." };

  const { error } = await supabase
    .from("identity_verifications")
    .update({
      status: decision,
      rejection_reason: decision === "rejected" ? reason.trim() : null,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", verificationId);

  if (error) return { ok: false, message: `The decision could not be saved: ${error.message}` };

  await supabase.from("admin_activity").insert({
    admin_id: userId,
    action: "verification.reviewed",
    target_type: "identity_verification",
    target_id: verificationId,
    detail: { decision, reason: decision === "rejected" ? reason.trim() : null },
  });

  revalidatePath("/admin/verifications");
  revalidatePath("/dashboard");
  return { ok: true };
}
