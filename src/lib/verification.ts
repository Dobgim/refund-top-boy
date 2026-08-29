export const ID_DOCUMENT_TYPES = [
  "national_id",
  "passport",
  "drivers_licence",
  "residence_permit",
] as const;

export type IdDocumentType = (typeof ID_DOCUMENT_TYPES)[number];

export const ID_DOCUMENT_LABELS: Record<IdDocumentType, string> = {
  national_id: "National ID card",
  passport: "Passport",
  drivers_licence: "Driving licence",
  residence_permit: "Residence permit",
};

/**
 * A passport carries everything on the photo page, so only that side is asked
 * for. Every card-format document needs both sides.
 */
export const DOCUMENTS_WITH_BACK: IdDocumentType[] = [
  "national_id",
  "drivers_licence",
  "residence_permit",
];

export function needsBackSide(type: IdDocumentType): boolean {
  return DOCUMENTS_WITH_BACK.includes(type);
}

export const VERIFICATION_STATUSES = ["unverified", "pending", "verified", "rejected"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const VERIFICATION_META: Record<
  VerificationStatus,
  { label: string; description: string; tone: "neutral" | "info" | "good" | "warn" }
> = {
  unverified: {
    label: "Not verified",
    description: "Upload an identity document to unlock claim submission.",
    tone: "neutral",
  },
  pending: {
    label: "Under review",
    description: "Your document is with a reviewer. This usually takes one working day.",
    tone: "info",
  },
  verified: {
    label: "Verified",
    description: "Your identity is confirmed. You can submit claims.",
    tone: "good",
  },
  rejected: {
    label: "Needs attention",
    description: "Your document could not be accepted. Upload a clearer copy to try again.",
    tone: "warn",
  },
};

export const ID_BUCKET = "identity-documents";
export const MAX_ID_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ALLOWED_ID_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
] as const;
export const ALLOWED_ID_LABEL = "PNG, JPG, WEBP or PDF up to 8 MB";

/** Client-side guard, mirrored by the bucket limits and storage policy. */
export function validateIdFile(file: File, side: string): string | null {
  if (file.size > MAX_ID_UPLOAD_BYTES) return `The ${side} image is larger than 8 MB`;
  if (!ALLOWED_ID_TYPES.includes(file.type as (typeof ALLOWED_ID_TYPES)[number])) {
    return `The ${side} image must be a PNG, JPG, WEBP or PDF`;
  }
  return null;
}
