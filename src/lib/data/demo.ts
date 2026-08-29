import type { ClaimStatus, ClaimType } from "@/types";

export interface DemoClaim {
  reference: string;
  claim_type: ClaimType;
  status: ClaimStatus;
  amount: number;
  currency: string;
  reason: string;
  description: string;
  transaction_date: string;
  transaction_type: string;
  transaction_reference: string;
  created_at: string;
  last_update: string;
  timeline: Array<{ status: ClaimStatus; note: string; created_at: string }>;
  documents: Array<{ file_name: string; size_bytes: number; created_at: string }>;
  messages: Array<{ sender_role: "user" | "admin"; body: string; created_at: string }>;
}

/**
 * Example case fixtures. These back the public tracker and the dashboard
 * preview while no database is connected. The people, merchants and
 * transactions in them are invented, not drawn from any real account.
 */
export const DEMO_CLAIMS: DemoClaim[] = [
  {
    reference: "RR-2019-0118",
    claim_type: "duplicate_charge",
    status: "under_review",
    amount: 486.5,
    currency: "USD",
    reason: "Charged twice for a single online order",
    description:
      "A single checkout produced two identical authorisations three minutes apart. The merchant confirmed only one order was created, but the second amount has not been released.",
    transaction_date: "2019-06-14",
    transaction_type: "Card payment",
    transaction_reference: "TXN-4471-DEMO",
    created_at: "2019-06-18T09:12:00.000Z",
    last_update: "2019-07-02T14:40:00.000Z",
    timeline: [
      { status: "submitted", note: "Case received and assigned reference RR-2019-0118.", created_at: "2019-06-18T09:12:00.000Z" },
      { status: "documents_required", note: "Requested the checkout confirmation and the card statement extract.", created_at: "2019-06-21T11:05:00.000Z" },
      { status: "under_review", note: "Evidence accepted. A case handler is reconciling both authorisations.", created_at: "2019-07-02T14:40:00.000Z" },
    ],
    documents: [
      { file_name: "statement-extract-june.pdf", size_bytes: 284120, created_at: "2019-06-20T16:22:00.000Z" },
      { file_name: "order-confirmation.png", size_bytes: 512880, created_at: "2019-06-20T16:24:00.000Z" },
    ],
    messages: [
      { sender_role: "admin", body: "Thanks for the statement extract, that is exactly what we needed. We will confirm within five working days.", created_at: "2019-07-02T14:41:00.000Z" },
      { sender_role: "user", body: "Understood, thank you. Let me know if the merchant reference helps.", created_at: "2019-07-02T18:03:00.000Z" },
    ],
  },
  {
    reference: "RR-2019-0119",
    claim_type: "subscription_refund",
    status: "resolved",
    amount: 129,
    currency: "EUR",
    reason: "Annual plan renewed after cancellation",
    description:
      "The subscription was cancelled inside the trial window, but the annual plan still renewed the following morning.",
    transaction_date: "2019-04-02",
    transaction_type: "Subscription billing",
    transaction_reference: "SUB-9903-DEMO",
    created_at: "2019-04-03T08:00:00.000Z",
    last_update: "2019-04-29T10:15:00.000Z",
    timeline: [
      { status: "submitted", note: "Case received.", created_at: "2019-04-03T08:00:00.000Z" },
      { status: "under_review", note: "Cancellation timestamp verified against the billing record.", created_at: "2019-04-09T13:30:00.000Z" },
      { status: "approved", note: "Case approved for full recovery of the renewal amount.", created_at: "2019-04-22T09:45:00.000Z" },
      { status: "resolved", note: "Outcome recorded. Funds returned to the original payment method.", created_at: "2019-04-29T10:15:00.000Z" },
    ],
    documents: [{ file_name: "cancellation-email.pdf", size_bytes: 96400, created_at: "2019-04-03T08:04:00.000Z" }],
    messages: [
      { sender_role: "admin", body: "The case is resolved and the outcome letter is attached to your dashboard.", created_at: "2019-04-29T10:16:00.000Z" },
    ],
  },
  {
    reference: "RR-2019-0120",
    claim_type: "service_not_rendered",
    status: "documents_required",
    amount: 1240,
    currency: "GBP",
    reason: "Prepaid service was never delivered",
    description:
      "A deposit was paid for a scheduled service that the provider later cancelled. No replacement date or refund has been offered since.",
    transaction_date: "2019-05-27",
    transaction_type: "Bank transfer",
    transaction_reference: "BT-2288-DEMO",
    created_at: "2019-06-01T15:20:00.000Z",
    last_update: "2019-06-11T09:00:00.000Z",
    timeline: [
      { status: "submitted", note: "Case received.", created_at: "2019-06-01T15:20:00.000Z" },
      { status: "documents_required", note: "Please upload the signed service agreement and the cancellation notice.", created_at: "2019-06-11T09:00:00.000Z" },
    ],
    documents: [],
    messages: [
      { sender_role: "admin", body: "We can progress as soon as the service agreement is uploaded.", created_at: "2019-06-11T09:01:00.000Z" },
    ],
  },
  {
    reference: "RR-2019-0121",
    claim_type: "unauthorised_transaction",
    status: "approved",
    amount: 315.75,
    currency: "USD",
    reason: "Transaction not recognised by the account holder",
    description:
      "An online purchase appeared on the statement from a merchant the account holder has never used, on a day the card was not in use.",
    transaction_date: "2019-07-08",
    transaction_type: "Online checkout",
    transaction_reference: "TXN-7710-DEMO",
    created_at: "2019-07-09T07:45:00.000Z",
    last_update: "2019-08-05T12:10:00.000Z",
    timeline: [
      { status: "submitted", note: "Case received and flagged as time sensitive.", created_at: "2019-07-09T07:45:00.000Z" },
      { status: "under_review", note: "Merchant descriptor checked against the account history.", created_at: "2019-07-16T10:30:00.000Z" },
      { status: "approved", note: "Case approved. Awaiting the resolution window to close.", created_at: "2019-08-05T12:10:00.000Z" },
    ],
    documents: [{ file_name: "card-activity-july.csv", size_bytes: 18220, created_at: "2019-07-09T07:50:00.000Z" }],
    messages: [],
  },
  {
    reference: "RR-2019-0122",
    claim_type: "merchant_refund",
    status: "submitted",
    amount: 72.4,
    currency: "USD",
    reason: "Returned item, refund not issued",
    description:
      "The item was returned inside the return window and marked as received by the courier, but no refund has been issued after four weeks.",
    transaction_date: "2019-08-02",
    transaction_type: "Card payment",
    transaction_reference: "TXN-8814-DEMO",
    created_at: "2019-08-24T11:00:00.000Z",
    last_update: "2019-08-24T11:00:00.000Z",
    timeline: [{ status: "submitted", note: "Case received and queued for triage.", created_at: "2019-08-24T11:00:00.000Z" }],
    documents: [{ file_name: "courier-receipt.jpg", size_bytes: 640100, created_at: "2019-08-24T11:02:00.000Z" }],
    messages: [],
  },
];

export function findDemoClaim(reference: string): DemoClaim | null {
  const needle = reference.trim().toUpperCase();
  return DEMO_CLAIMS.find((claim) => claim.reference === needle) ?? null;
}
