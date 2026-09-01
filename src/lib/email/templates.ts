import "server-only";

import { CLAIM_STATUS_META, CLAIM_TYPE_LABELS } from "@/lib/claims";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SITE } from "@/lib/site";
import type { ClaimStatus, ClaimType } from "@/types";

/**
 * Email markup, written for mail clients rather than browsers: tables, inline
 * styles, no flexbox or grid, no external stylesheet, no SVG. Gmail strips
 * most of what a modern page relies on, and Outlook renders with Word.
 */

const INK = "#080c1c";
const MUTED = "#465684";
const ROYAL = "#4338ca";
const BORDER = "#e6eaf4";

/** Anything a customer typed must be escaped before it lands in an email. */
function esc(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shell(options: {
  heading: string;
  intro: string;
  rows?: Array<[string, string]>;
  callout?: { label: string; body: string; tone?: "good" | "warn" | "info" };
  cta?: { label: string; href: string };
  footerNote?: string;
}): string {
  const { heading, intro, rows = [], callout, cta, footerNote } = options;

  const toneColour =
    callout?.tone === "good" ? "#0d9a72" : callout?.tone === "warn" ? "#b45309" : ROYAL;
  const toneBackground =
    callout?.tone === "good" ? "#ecfdf5" : callout?.tone === "warn" ? "#fffbeb" : "#eef2ff";

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f6f8fd;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fd;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background:#ffffff;border:1px solid ${BORDER};border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

        <tr><td style="background:${ROYAL};padding:20px 28px;">
          <span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.3px;">Royal</span><span style="color:#f2c866;font-size:18px;font-weight:800;letter-spacing:-0.3px;">Refund</span>
        </td></tr>

        <tr><td style="padding:32px 28px 8px 28px;">
          <h1 style="margin:0;font-size:21px;line-height:1.3;font-weight:800;color:${INK};">${esc(heading)}</h1>
          <p style="margin:14px 0 0 0;font-size:15px;line-height:1.6;color:${MUTED};">${intro}</p>
        </td></tr>

        ${
          rows.length
            ? `<tr><td style="padding:20px 28px 0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:12px;">
            ${rows
              .map(
                ([label, value], index) => `<tr>
              <td style="padding:11px 16px;font-size:13px;color:${MUTED};${index ? `border-top:1px solid ${BORDER};` : ""}">${esc(label)}</td>
              <td style="padding:11px 16px;font-size:13px;font-weight:700;color:${INK};text-align:right;${index ? `border-top:1px solid ${BORDER};` : ""}">${esc(value)}</td>
            </tr>`,
              )
              .join("")}
          </table>
        </td></tr>`
            : ""
        }

        ${
          callout
            ? `<tr><td style="padding:20px 28px 0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${toneBackground};border-radius:12px;">
            <tr><td style="padding:14px 16px;">
              <p style="margin:0;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${toneColour};">${esc(callout.label)}</p>
              <p style="margin:6px 0 0 0;font-size:14px;line-height:1.6;color:${INK};">${esc(callout.body)}</p>
            </td></tr>
          </table>
        </td></tr>`
            : ""
        }

        ${
          cta
            ? `<tr><td style="padding:26px 28px 0 28px;">
          <a href="${cta.href}" style="display:inline-block;background:${ROYAL};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:13px 26px;border-radius:999px;">${esc(cta.label)}</a>
        </td></tr>`
            : ""
        }

        <tr><td style="padding:28px;">
          <p style="margin:24px 0 0 0;padding-top:18px;border-top:1px solid ${BORDER};font-size:12px;line-height:1.6;color:#9aa8c9;">
            ${footerNote ? `${esc(footerNote)}<br><br>` : ""}
            RoyalRefund manages refund and payment dispute cases. We are not a bank and never hold your funds.
            We will never ask you for a banking password, card PIN, one-time code or recovery phrase.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

/* ------------------------------------------------------------ to the customer */

export function claimReceivedEmail(claim: {
  reference: string;
  claim_type: ClaimType;
  amount: number;
  currency: string;
  reason: string;
  contact_name: string;
}) {
  const firstName = claim.contact_name.trim().split(/\s+/)[0] || "there";

  return {
    subject: `We have your case — ${claim.reference}`,
    html: shell({
      heading: `Thanks ${firstName}, your case is in.`,
      intro:
        "We have received your claim and queued it for triage. You can follow every stage from your dashboard, and we will email you whenever the status changes.",
      rows: [
        ["Reference", claim.reference],
        ["Case type", CLAIM_TYPE_LABELS[claim.claim_type]],
        ["Amount claimed", formatCurrency(claim.amount, claim.currency)],
        ["Reason", claim.reason],
      ],
      cta: { label: "View your case", href: `${SITE.url}/dashboard/claims/${claim.reference}` },
      footerNote: `Keep your reference ${claim.reference} — you can check progress at ${SITE.url}/track without signing in.`,
    }),
  };
}

export function claimDecisionEmail(claim: {
  reference: string;
  status: ClaimStatus;
  contact_name: string;
  note?: string | null;
}) {
  const meta = CLAIM_STATUS_META[claim.status];
  const firstName = claim.contact_name.trim().split(/\s+/)[0] || "there";

  const headings: Record<ClaimStatus, string> = {
    submitted: `Your case ${claim.reference} has been received`,
    under_review: `Your case ${claim.reference} is now under review`,
    documents_required: `We need one more thing for ${claim.reference}`,
    approved: `Good news — ${claim.reference} has been approved`,
    resolved: `Your case ${claim.reference} is resolved`,
    closed: `Your case ${claim.reference} has been closed`,
  };

  const tone =
    claim.status === "approved" || claim.status === "resolved"
      ? "good"
      : claim.status === "documents_required" || claim.status === "closed"
        ? "warn"
        : "info";

  return {
    subject: headings[claim.status],
    html: shell({
      heading: headings[claim.status],
      intro: `Hello ${esc(firstName)}, the status of your case has changed to <strong style="color:${INK};">${esc(meta.label)}</strong>. ${esc(meta.description)}`,
      rows: [
        ["Reference", claim.reference],
        ["New status", meta.label],
        ["Updated", formatDate(new Date())],
      ],
      callout: claim.note
        ? { label: "Note from your reviewer", body: claim.note, tone }
        : undefined,
      cta: { label: "Open your case", href: `${SITE.url}/dashboard/claims/${claim.reference}` },
    }),
  };
}

export function payoutRecordedEmail(claim: {
  reference: string;
  contact_name: string;
  approvedAmount: number;
  claimCurrency: string;
  settlementAmount: number;
  settlementCurrency: string;
  rate?: number | null;
  method: string;
  note?: string | null;
}) {
  const firstName = claim.contact_name.trim().split(/\s+/)[0] || "there";
  const converted = claim.settlementCurrency !== claim.claimCurrency;

  const rows: Array<[string, string]> = [
    ["Reference", claim.reference],
    ["Amount approved", formatCurrency(claim.approvedAmount, claim.claimCurrency)],
  ];

  if (converted) {
    rows.push(["Paid out as", formatCurrency(claim.settlementAmount, claim.settlementCurrency)]);
    if (claim.rate) {
      rows.push(["Rate used", `1 ${claim.claimCurrency} = ${claim.rate} ${claim.settlementCurrency}`]);
    }
  }
  rows.push(["Returned via", claim.method]);

  return {
    subject: `A payout has been recorded for ${claim.reference}`,
    html: shell({
      heading: `${firstName}, your recovery has been recorded.`,
      intro: converted
        ? "Your case has been settled. Because the claim was in crypto, the payout was converted to a stablecoin — the original amount, the converted amount and the rate used are all below so you can check the arithmetic."
        : "Your case has been settled and the payout recorded against it.",
      rows,
      callout: claim.note ? { label: "Note from your reviewer", body: claim.note, tone: "good" } : undefined,
      cta: { label: "See the payout", href: `${SITE.url}/dashboard/claims/${claim.reference}` },
      footerNote:
        "Funds are paid into your own bank account or wallet by the paying party. RoyalRefund does not hold funds on your behalf.",
    }),
  };
}

/* --------------------------------------------------------------- to the team */

export function newClaimAdminEmail(claim: {
  reference: string;
  claim_type: ClaimType;
  amount: number;
  currency: string;
  reason: string;
  description: string;
  contact_name: string;
  contact_email: string;
  country: string | null;
  documentCount: number;
}) {
  return {
    subject: `New claim ${claim.reference} — ${formatCurrency(claim.amount, claim.currency)}`,
    html: shell({
      heading: `New claim: ${claim.reference}`,
      intro: `${esc(claim.contact_name)} has submitted a case for review.`,
      rows: [
        ["Reference", claim.reference],
        ["From", `${claim.contact_name} (${claim.contact_email})`],
        ["Country", claim.country ?? "Not given"],
        ["Case type", CLAIM_TYPE_LABELS[claim.claim_type]],
        ["Amount", formatCurrency(claim.amount, claim.currency)],
        ["Evidence attached", `${claim.documentCount} file${claim.documentCount === 1 ? "" : "s"}`],
      ],
      callout: { label: "Reason given", body: claim.reason, tone: "info" },
      cta: { label: "Review this case", href: `${SITE.url}/admin/claims/${claim.reference}` },
      footerNote: `Description: ${claim.description.slice(0, 400)}${claim.description.length > 400 ? "…" : ""}`,
    }),
  };
}


/* --------------------------------------------------- customer service inbox */

export function supportEnquiryAdminEmail(enquiry: {
  name: string;
  email: string;
  subject: string;
  message: string;
  signedIn: boolean;
}) {
  return {
    subject: `Support: ${enquiry.subject}`,
    html: shell({
      heading: "New message from customer service",
      intro: `${esc(enquiry.name)} has written in through the contact form. Reply to this email and it goes straight back to them.`,
      rows: [
        ["From", enquiry.name],
        ["Email", enquiry.email],
        ["Account", enquiry.signedIn ? "Signed in" : "Not signed in"],
        ["Subject", enquiry.subject],
      ],
      callout: { label: "Message", body: enquiry.message, tone: "info" },
      cta: { label: "Open the support inbox", href: `${SITE.url}/admin/support` },
    }),
  };
}

export function supportEnquiryAckEmail(enquiry: { name: string; subject: string }) {
  const firstName = enquiry.name.trim().split(/\s+/)[0] || "there";

  return {
    subject: `We have your message — ${enquiry.subject}`,
    html: shell({
      heading: `Thanks ${firstName}, we have your message.`,
      intro:
        "A member of the team will read it and reply to this address. You do not need to send it again.",
      rows: [["Subject", enquiry.subject]],
      callout: {
        label: "A reminder",
        body: "We will never ask you for a banking password, card PIN, one-time code or recovery phrase — not by email, not on a call.",
        tone: "warn",
      },
      footerNote: "If your question is about a specific case, quoting its reference helps us answer faster.",
    }),
  };
}
