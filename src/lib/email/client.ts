import "server-only";

/**
 * Transactional email through Resend.
 *
 * Deliberately a plain fetch against the REST API rather than the SDK: it is a
 * single POST, and this keeps the dependency list honest.
 *
 * Sending is best-effort. A failed email must never fail the action that
 * triggered it — a claim that saved but whose receipt bounced is still a saved
 * claim, and throwing here would tell the customer their submission failed.
 */

const API_URL = "https://api.resend.com/emails";

/** `RoyalRefund <support@getroyalrefund.com>` */
export const EMAIL_FROM = process.env.EMAIL_FROM ?? "RoyalRefund <support@getroyalrefund.com>";

/** Where new-claim notifications land. The first address is the canonical one. */
export const EMAIL_ADMIN = (process.env.EMAIL_ADMIN ?? "support@getroyalrefund.com")
  .split(",")[0]
  .trim();

/**
 * Every address that should receive an operational notice.
 *
 * EMAIL_ADMIN accepts a comma-separated list, so the business address and a
 * personal inbox can both be copied without standing up forwarding rules:
 *
 *   EMAIL_ADMIN=support@getroyalrefund.com,someone@gmail.com
 *
 * Resend rejects the whole request if any recipient is malformed, so blank
 * entries left by a trailing comma are dropped rather than sent.
 */
export const ADMIN_RECIPIENTS: string[] = (
  process.env.EMAIL_ADMIN ?? "support@getroyalrefund.com"
)
  .split(",")
  .map((address) => address.trim())
  .filter(Boolean);

/** Replies from customers should reach a human, not the no-reply sender. */
export const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO ?? "support@getroyalrefund.com";

export const isEmailConfigured = Boolean(process.env.RESEND_API_KEY);

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo = EMAIL_REPLY_TO,
}: SendEmailInput): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    // Unconfigured deployments stay usable; the email is simply not sent.
    console.warn(`[email] RESEND_API_KEY missing — not sending "${subject}"`);
    return { ok: false, skipped: true };
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: replyTo,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error(`[email] Resend returned ${response.status}: ${detail.slice(0, 300)}`);
      return { ok: false, error: `Resend returned ${response.status}` };
    }

    return { ok: true };
  } catch (error) {
    console.error("[email] send failed", error);
    return { ok: false, error: error instanceof Error ? error.message : "unknown error" };
  }
}
