import { z } from "zod";
import {
  CLAIM_TYPES,
  CURRENCIES,
  MAX_UPLOAD_BYTES,
  ALLOWED_UPLOAD_TYPES,
  SETTLEMENT_METHODS,
} from "@/lib/claims";
import type { ClaimType } from "@/types";

export const claimSchema = z.object({
  // Personal information
  contactName: z.string().trim().min(2, "Enter the full name on the account").max(80),
  contactEmail: z.email("Enter a valid email address").trim().toLowerCase(),
  country: z.string().trim().min(2, "Select a country"),

  // Transaction information
  transactionDate: z
    .string()
    .min(1, "Select the transaction date")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .refine(
      (value) => Date.parse(value) <= Date.now() + 86_400_000,
      "The transaction date cannot be in the future",
    ),
  transactionType: z.string().trim().min(2, "Select a transaction type"),
  amount: z
    .number({ message: "Enter the disputed amount" })
    .positive("Amount must be greater than zero")
    // Crypto amounts are routinely fractional, so allow 8 decimal places.
    .max(10_000_000, "Amount is above the maximum a single case can cover"),
  currency: z.enum(CURRENCIES),
  // Long enough for a 0x-prefixed EVM hash (66) or a Solana signature (88).
  transactionReference: z
    .string()
    .trim()
    .max(120, "Reference is too long")
    .optional()
    .or(z.literal("")),

  // Case information
  claimType: z.enum(CLAIM_TYPES as [ClaimType, ...ClaimType[]]),
  reason: z.string().trim().min(4, "Give a short reason").max(140, "Keep the reason under 140 characters"),
  description: z
    .string()
    .trim()
    .min(40, "Describe what happened in at least 40 characters")
    .max(4000, "Description is too long"),
  supportingDetails: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type ClaimValues = z.infer<typeof claimSchema>;

export const newsletterSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
});

export const trackSchema = z.object({
  reference: z
    .string()
    .trim()
    .toUpperCase()
    .min(6, "Enter a claim reference")
    .max(32, "Reference is too long")
    .regex(/^[A-Z0-9-]+$/, "References contain letters, numbers and dashes only"),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  subject: z.string().trim().min(3, "Add a subject").max(120),
  message: z.string().trim().min(20, "Tell us a little more").max(2000),
});

export const messageSchema = z.object({
  body: z.string().trim().min(2, "Write a message").max(2000, "Message is too long"),
});

/** Client-side guard mirrored by the storage policy and bucket limits. */
export function validateUploadFile(file: File): string | null {
  if (file.size > MAX_UPLOAD_BYTES) return `${file.name} is larger than 8 MB`;
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type as (typeof ALLOWED_UPLOAD_TYPES)[number])) {
    return `${file.name} is not an accepted file type`;
  }
  if (file.name.length > 150) return "File name is too long";
  return null;
}

/** Fields a reviewer may correct on an existing case. */
export const adminClaimEditSchema = z.object({
  claimType: z.enum(CLAIM_TYPES as [ClaimType, ...ClaimType[]]),
  amount: z.number().positive("Amount must be greater than zero").max(10_000_000),
  currency: z.enum(CURRENCIES),
  transactionDate: z.string().optional().or(z.literal("")),
  transactionType: z.string().trim().max(64).optional().or(z.literal("")),
  transactionReference: z.string().trim().max(120).optional().or(z.literal("")),
  reason: z.string().trim().min(4).max(140),
  description: z.string().trim().min(40).max(4000),
  supportingDetails: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type AdminClaimEditValues = z.infer<typeof adminClaimEditSchema>;

/**
 * Recording money returned to the customer. `approvedAmount` is capped against
 * the claimed amount by a database constraint as well as here.
 */
export const settlementSchema = z
  .object({
    approvedAmount: z
      .number({ message: "Enter the amount being returned" })
      .nonnegative("Amount cannot be negative"),
    /** Currency actually paid out. Crypto claims settle in USDT. */
    payoutCurrency: z.enum(CURRENCIES),
    /** Units of payoutCurrency per 1 unit of the claim currency. */
    conversionRate: z
      .number()
      .positive("Enter the rate used")
      .optional()
      .or(z.literal(0).transform(() => undefined)),
    method: z.enum(SETTLEMENT_METHODS),
    reference: z.string().trim().max(120).optional().or(z.literal("")),
    note: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .refine(
    (v) => !v.conversionRate || v.conversionRate > 0,
    { path: ["conversionRate"], message: "The rate must be greater than zero" },
  );

export type SettlementValues = z.infer<typeof settlementSchema>;
