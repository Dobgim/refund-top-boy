import type { ClaimStatus, ClaimType } from "@/types";

export const CLAIM_STATUS_META: Record<
  ClaimStatus,
  { label: string; description: string; tone: "neutral" | "info" | "warn" | "good" | "done"; step: number }
> = {
  submitted: {
    label: "Submitted",
    description: "We have received the case and queued it for triage.",
    tone: "neutral",
    step: 1,
  },
  under_review: {
    label: "Under Review",
    description: "A case handler is assessing the details and evidence.",
    tone: "info",
    step: 2,
  },
  documents_required: {
    label: "Documents Required",
    description: "Additional supporting documents are needed to continue.",
    tone: "warn",
    step: 2,
  },
  approved: {
    label: "Approved",
    description: "The case met the review criteria and is moving to resolution.",
    tone: "good",
    step: 3,
  },
  resolved: {
    label: "Resolved",
    description: "The case has been completed and the outcome recorded.",
    tone: "done",
    step: 4,
  },
  closed: {
    label: "Closed",
    description: "The case was closed without further action.",
    tone: "neutral",
    step: 4,
  },
};

export const CLAIM_STATUSES = Object.keys(CLAIM_STATUS_META) as ClaimStatus[];

export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  card_dispute: "Card dispute",
  duplicate_charge: "Duplicate charge",
  service_not_rendered: "Service not rendered",
  unauthorised_transaction: "Unauthorised transaction",
  subscription_refund: "Subscription refund",
  merchant_refund: "Merchant refund",
  crypto_wrong_address: "Crypto sent to the wrong address",
  crypto_failed_transfer: "Failed or stuck crypto transfer",
  crypto_exchange_dispute: "Exchange or withdrawal dispute",
  other: "Other",
};

export const CLAIM_TYPES = Object.keys(CLAIM_TYPE_LABELS) as ClaimType[];

/**
 * Transaction types, grouped so the form can render optgroups. RoyalRefund
 * handles both conventional payment rails and on-chain transfers.
 */
export const TRANSACTION_TYPE_GROUPS = [
  {
    label: "Bank & card",
    options: [
      "Card payment",
      "Bank transfer",
      "Direct debit",
      "Online checkout",
      "Subscription billing",
      "Mobile money",
    ],
  },
  {
    label: "Crypto",
    options: [
      "Crypto transfer",
      "Exchange withdrawal",
      "Exchange deposit",
      "Wallet-to-wallet transfer",
      "P2P trade",
      "Smart contract / DeFi",
      "Crypto payment to merchant",
    ],
  },
  { label: "Other", options: ["Other"] },
] as const;

export const TRANSACTION_TYPES = TRANSACTION_TYPE_GROUPS.flatMap(
  (group) => group.options,
) as unknown as readonly string[];

export const FIAT_CURRENCIES = [
  "USD", "EUR", "GBP", "CAD", "AUD", "NGN", "GHS", "XAF", "ZAR",
] as const;

/** Not ISO-4217, so these are formatted by hand rather than by Intl. */
export const CRYPTO_CURRENCIES = [
  "BTC", "ETH", "USDT", "USDC", "BNB", "SOL", "XRP", "TRX",
] as const;

export const CURRENCIES = [...FIAT_CURRENCIES, ...CRYPTO_CURRENCIES] as const;

export const CURRENCY_GROUPS = [
  { label: "Fiat", options: FIAT_CURRENCIES },
  { label: "Crypto", options: CRYPTO_CURRENCIES },
] as const;

export function isCryptoCurrency(code: string): boolean {
  return (CRYPTO_CURRENCIES as readonly string[]).includes(code.toUpperCase());
}

export const CLAIM_STAGES: Array<{ key: string; label: string; statuses: ClaimStatus[] }> = [
  { key: "received", label: "Received", statuses: ["submitted"] },
  { key: "review", label: "Review", statuses: ["under_review", "documents_required"] },
  { key: "decision", label: "Decision", statuses: ["approved"] },
  { key: "resolution", label: "Resolution", statuses: ["resolved", "closed"] },
];

export function stageIndexFor(status: ClaimStatus): number {
  return Math.max(
    0,
    CLAIM_STAGES.findIndex((stage) => stage.statuses.includes(status)),
  );
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const ALLOWED_UPLOAD_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/csv",
] as const;

export const ALLOWED_UPLOAD_LABEL = "PDF, PNG, JPG, WEBP or CSV up to 8 MB";
