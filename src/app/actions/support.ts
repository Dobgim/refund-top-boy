"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { contactSchema } from "@/lib/validations/claim";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/supabase/authz";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { EMAIL_ADMIN, sendEmail } from "@/lib/email/client";
import { supportEnquiryAckEmail, supportEnquiryAdminEmail } from "@/lib/email/templates";

export interface SupportResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Contact form submission.
 *
 * Stored so it appears in the admin inbox, and emailed so support@ sees it
 * immediately. Both happen; neither depends on the other, and a failed email
 * never loses the message because the row is written first.
 */
export async function submitSupportEnquiry(
  raw: unknown,
  captchaToken?: string | null,
): Promise<SupportResult> {
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  const forwarded = (await headers()).get("x-forwarded-for");
  const passed = await verifyTurnstileToken(captchaToken, forwarded?.split(",")[0]?.trim());
  if (!passed) {
    return { ok: false, message: "The security check failed. Please try again." };
  }

  const values = parsed.data;
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Messaging is unavailable on this deployment." };
  }

  // Attach the account when the sender happens to be signed in, so a reviewer
  // can see the message came from a known customer.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("support_enquiries").insert({
    user_id: user?.id ?? null,
    name: values.name,
    email: values.email,
    subject: values.subject,
    message: values.message,
  });

  if (error) {
    return {
      ok: false,
      message: `Your message could not be saved: ${error.message}. If this mentions a missing table, run supabase/12_support_enquiries.sql.`,
    };
  }

  // Reply-to is the customer, so hitting Reply in the support inbox answers them.
  const toTeam = supportEnquiryAdminEmail({
    name: values.name,
    email: values.email,
    subject: values.subject,
    message: values.message,
    signedIn: Boolean(user),
  });
  await sendEmail({ to: EMAIL_ADMIN, ...toTeam, replyTo: values.email });

  const toSender = supportEnquiryAckEmail({ name: values.name, subject: values.subject });
  await sendEmail({ to: values.email, ...toSender });

  revalidatePath("/admin/support");
  return { ok: true };
}

/** Moves an enquiry through new -> in progress -> resolved. Reviewers only. */
export async function setEnquiryStatus(
  enquiryId: string,
  status: "new" | "in_progress" | "resolved",
) {
  const { supabase, userId, isAdmin, reason } = await getAdminAccess();
  if (!supabase || !userId) return { ok: false, message: reason ?? "Unavailable." };
  if (!isAdmin) return { ok: false, message: reason ?? "You are not a reviewer." };

  const { error } = await supabase
    .from("support_enquiries")
    .update({
      status,
      handled_by: status === "new" ? null : userId,
      handled_at: status === "new" ? null : new Date().toISOString(),
    })
    .eq("id", enquiryId);

  if (error) return { ok: false, message: `Could not update: ${error.message}` };

  revalidatePath("/admin/support");
  return { ok: true };
}

/**
 * Removes an enquiry outright. Reviewers only, and there is no undo: the row is
 * gone from the inbox for everyone. The emailed copy in the support mailbox is
 * unaffected, so nothing a customer sent is ever lost by clearing the page.
 */
export async function deleteEnquiry(enquiryId: string) {
  const { supabase, userId, isAdmin, reason } = await getAdminAccess();
  if (!supabase || !userId) return { ok: false, message: reason ?? "Unavailable." };
  if (!isAdmin) return { ok: false, message: reason ?? "You are not a reviewer." };

  const { error } = await supabase.from("support_enquiries").delete().eq("id", enquiryId);

  if (error) {
    return {
      ok: false,
      message: `Could not delete: ${error.message}. If this mentions a policy, run supabase/13_enquiry_delete.sql.`,
    };
  }

  revalidatePath("/admin/support");
  return { ok: true };
}
