export type ClaimStatus =
  | "submitted"
  | "under_review"
  | "documents_required"
  | "approved"
  | "resolved"
  | "closed";

export type ClaimType =
  | "card_dispute"
  | "duplicate_charge"
  | "service_not_rendered"
  | "unauthorised_transaction"
  | "subscription_refund"
  | "merchant_refund"
  | "crypto_wrong_address"
  | "crypto_failed_transfer"
  | "crypto_exchange_dispute"
  | "other";

export type UserRole = "user" | "admin";
export type AccountStatus = "active" | "pending" | "suspended";
export type ProfileVerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  username: string | null;
  gender: "female" | "male" | "non_binary" | "prefer_not_to_say" | null;
  email: string;
  phone: string | null;
  country: string | null;
  role: UserRole;
  account_status: AccountStatus;
  verification_status: ProfileVerificationStatus;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  reference: string;
  user_id: string;
  claim_type: ClaimType;
  status: ClaimStatus;
  amount: number;
  currency: string;
  transaction_date: string | null;
  transaction_reference: string | null;
  transaction_type: string | null;
  reason: string;
  description: string;
  supporting_details: string | null;
  contact_name: string;
  contact_email: string;
  country: string | null;
  last_update: string;
  created_at: string;
  updated_at: string;
}

export interface ClaimStatusEvent {
  id: string;
  claim_id: string;
  status: ClaimStatus;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ClaimDocument {
  id: string;
  claim_id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface ClaimMessage {
  id: string;
  claim_id: string;
  sender_id: string | null;
  sender_role: UserRole;
  body: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  read: boolean;
  claim_id: string | null;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface ClaimWithRelations extends Claim {
  claim_status_history?: ClaimStatusEvent[];
  claim_documents?: ClaimDocument[];
  claim_messages?: ClaimMessage[];
  profiles?: Pick<Profile, "full_name" | "email"> | null;
}

export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };
