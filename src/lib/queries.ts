import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEMO_CLAIMS, findDemoClaim, type DemoClaim } from "@/lib/data/demo";
import type { SettlementMethod } from "@/lib/claims";
import type {
  Claim,
  ClaimDocument,
  ClaimMessage,
  ClaimStatus,
  ClaimStatusEvent,
  ClaimType,
  Profile,
} from "@/types";

/* --------------------------------------------------------------- view models */

export interface ClaimSummary {
  id: string;
  reference: string;
  claim_type: ClaimType;
  status: ClaimStatus;
  amount: number;
  currency: string;
  created_at: string;
  last_update: string;
  reason: string;
  owner?: { full_name: string; email: string } | null;
}

export interface ClaimDetail extends ClaimSummary {
  description: string;
  supporting_details: string | null;
  transaction_date: string | null;
  transaction_type: string | null;
  transaction_reference: string | null;
  contact_name: string;
  contact_email: string;
  country: string | null;
  approved_amount: number | null;
  settlement_method: SettlementMethod | null;
  settlement_reference: string | null;
  settlement_note: string | null;
  settled_at: string | null;
  timeline: Array<Pick<ClaimStatusEvent, "id" | "status" | "note" | "created_at">>;
  documents: Array<Pick<ClaimDocument, "id" | "file_name" | "size_bytes" | "created_at" | "storage_path">>;
  messages: Array<Pick<ClaimMessage, "id" | "sender_role" | "body" | "created_at">>;
}

export interface DataResult<T> {
  data: T;
  /** True when the value came from the bundled demo fixtures. */
  demo: boolean;
}

/* -------------------------------------------------------------- demo mapping */

function demoToSummary(claim: DemoClaim): ClaimSummary {
  return {
    id: claim.reference,
    reference: claim.reference,
    claim_type: claim.claim_type,
    status: claim.status,
    amount: claim.amount,
    currency: claim.currency,
    created_at: claim.created_at,
    last_update: claim.last_update,
    reason: claim.reason,
    owner: { full_name: "Amara Osei", email: "amara.osei@example.com" },
  };
}

function demoToDetail(claim: DemoClaim): ClaimDetail {
  return {
    ...demoToSummary(claim),
    description: claim.description,
    supporting_details: null,
    transaction_date: claim.transaction_date,
    transaction_type: claim.transaction_type,
    transaction_reference: claim.transaction_reference,
    contact_name: "Amara Osei",
    contact_email: "amara.osei@example.com",
    country: "United States",
    approved_amount: null,
    settlement_method: null,
    settlement_reference: null,
    settlement_note: null,
    settled_at: null,
    timeline: claim.timeline.map((entry, index) => ({
      id: `${claim.reference}-t${index}`,
      status: entry.status,
      note: entry.note,
      created_at: entry.created_at,
    })),
    documents: claim.documents.map((document, index) => ({
      id: `${claim.reference}-d${index}`,
      file_name: document.file_name,
      size_bytes: document.size_bytes,
      created_at: document.created_at,
      storage_path: "",
    })),
    messages: claim.messages.map((message, index) => ({
      id: `${claim.reference}-m${index}`,
      sender_role: message.sender_role,
      body: message.body,
      created_at: message.created_at,
    })),
  };
}

const SUMMARY_COLUMNS =
  "id, reference, claim_type, status, amount, currency, created_at, last_update, reason";

/* ---------------------------------------------------------------- user scope */

export async function getMyClaims(): Promise<DataResult<ClaimSummary[]>> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { data: DEMO_CLAIMS.map(demoToSummary), demo: true };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], demo: false };

  // RLS restricts this to the caller's own rows; the filter is belt and braces.
  const { data, error } = await supabase
    .from("claims")
    .select(SUMMARY_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return { data: [], demo: false };
  return { data: data as unknown as ClaimSummary[], demo: false };
}

export async function getMyClaim(reference: string): Promise<DataResult<ClaimDetail | null>> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    const demo = findDemoClaim(reference);
    return { data: demo ? demoToDetail(demo) : null, demo: true };
  }

  const { data, error } = await supabase
    .from("claims")
    .select(
      `*,
       claim_status_history ( id, status, note, created_at ),
       claim_documents ( id, file_name, size_bytes, created_at, storage_path ),
       claim_messages ( id, sender_role, body, created_at )`,
    )
    .eq("reference", reference.toUpperCase())
    .maybeSingle();

  if (error || !data) return { data: null, demo: false };

  const row = data as unknown as Claim & {
    approved_amount: number | null;
    settlement_method: SettlementMethod | null;
    settlement_reference: string | null;
    settlement_note: string | null;
    settled_at: string | null;
    claim_status_history: ClaimStatusEvent[];
    claim_documents: ClaimDocument[];
    claim_messages: ClaimMessage[];
  };

  return {
    data: {
      id: row.id,
      reference: row.reference,
      claim_type: row.claim_type,
      status: row.status,
      amount: Number(row.amount),
      currency: row.currency,
      created_at: row.created_at,
      last_update: row.last_update,
      reason: row.reason,
      description: row.description,
      supporting_details: row.supporting_details,
      transaction_date: row.transaction_date,
      transaction_type: row.transaction_type,
      transaction_reference: row.transaction_reference,
      contact_name: row.contact_name,
      contact_email: row.contact_email,
      country: row.country,
      approved_amount: row.approved_amount === null || row.approved_amount === undefined
        ? null
        : Number(row.approved_amount),
      settlement_method: row.settlement_method ?? null,
      settlement_reference: row.settlement_reference ?? null,
      settlement_note: row.settlement_note ?? null,
      settled_at: row.settled_at ?? null,
      timeline: (row.claim_status_history ?? []).sort(
        (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at),
      ),
      documents: (row.claim_documents ?? []).sort(
        (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
      ),
      messages: (row.claim_messages ?? []).sort(
        (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at),
      ),
    },
    demo: false,
  };
}

/* --------------------------------------------------------------- public track */

export interface TrackedClaim {
  reference: string;
  status: ClaimStatus;
  claim_type: ClaimType;
  created_at: string;
  last_update: string;
  timeline: Array<{ status: ClaimStatus; note: string | null; created_at: string }>;
}

/**
 * Public lookup. Returns only non-identifying fields: no amount, no contact
 * details, no documents.
 */
export async function trackClaim(reference: string): Promise<DataResult<TrackedClaim | null>> {
  const normalised = reference.trim().toUpperCase();

  if (!isSupabaseConfigured) {
    const demo = findDemoClaim(normalised);
    return {
      data: demo
        ? {
            reference: demo.reference,
            status: demo.status,
            claim_type: demo.claim_type,
            created_at: demo.created_at,
            last_update: demo.last_update,
            timeline: demo.timeline.map(({ status, note, created_at }) => ({ status, note, created_at })),
          }
        : null,
      demo: true,
    };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { data: null, demo: false };

  const { data } = await supabase
    .from("claim_public_status")
    .select("reference, status, claim_type, created_at, last_update")
    .eq("reference", normalised)
    .maybeSingle();

  if (!data) {
    // Fall back to the bundled fixtures so the example references still resolve.
    const demo = findDemoClaim(normalised);
    if (!demo) return { data: null, demo: false };
    return {
      data: {
        reference: demo.reference,
        status: demo.status,
        claim_type: demo.claim_type,
        created_at: demo.created_at,
        last_update: demo.last_update,
        timeline: demo.timeline.map(({ status, note, created_at }) => ({ status, note, created_at })),
      },
      demo: true,
    };
  }

  const row = data as unknown as Omit<TrackedClaim, "timeline">;

  const { data: history } = await supabase
    .from("claim_public_history")
    .select("status, note, created_at")
    .eq("reference", normalised)
    .order("created_at", { ascending: true });

  return {
    data: { ...row, timeline: (history as TrackedClaim["timeline"]) ?? [] },
    demo: false,
  };
}

/* --------------------------------------------------------------- admin scope */

export interface AdminStats {
  total: number;
  pending: number;
  active: number;
  resolved: number;
  users: number;
  amount: number;
}

export async function getAdminStats(): Promise<DataResult<AdminStats>> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    const demo = DEMO_CLAIMS;
    return {
      data: {
        total: demo.length,
        pending: demo.filter((claim) => claim.status === "submitted").length,
        active: demo.filter((claim) =>
          ["under_review", "documents_required", "approved"].includes(claim.status),
        ).length,
        resolved: demo.filter((claim) => ["resolved", "closed"].includes(claim.status)).length,
        users: 42,
        amount: demo.reduce((sum, claim) => sum + claim.amount, 0),
      },
      demo: true,
    };
  }

  const { data: claims } = await supabase.from("claims").select("status, amount");
  const { count: users } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const rows = (claims as Array<{ status: ClaimStatus; amount: number }> | null) ?? [];

  return {
    data: {
      total: rows.length,
      pending: rows.filter((row) => row.status === "submitted").length,
      active: rows.filter((row) =>
        ["under_review", "documents_required", "approved"].includes(row.status),
      ).length,
      resolved: rows.filter((row) => ["resolved", "closed"].includes(row.status)).length,
      users: users ?? 0,
      amount: rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0),
    },
    demo: false,
  };
}

export async function getAdminClaims(options: {
  search?: string;
  status?: ClaimStatus | "all";
  sort?: "newest" | "oldest" | "amount";
}): Promise<DataResult<ClaimSummary[]>> {
  const { search = "", status = "all", sort = "newest" } = options;
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    let rows = DEMO_CLAIMS.map(demoToSummary);
    if (status !== "all") rows = rows.filter((row) => row.status === status);
    if (search) {
      const needle = search.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.reference.toLowerCase().includes(needle) || row.reason.toLowerCase().includes(needle),
      );
    }
    rows.sort((a, b) =>
      sort === "amount"
        ? b.amount - a.amount
        : sort === "oldest"
          ? Date.parse(a.created_at) - Date.parse(b.created_at)
          : Date.parse(b.created_at) - Date.parse(a.created_at),
    );
    return { data: rows, demo: true };
  }

  let query = supabase
    .from("claims")
    .select(`${SUMMARY_COLUMNS}, profiles ( full_name, email )`);

  if (status !== "all") query = query.eq("status", status);
  if (search) query = query.or(`reference.ilike.%${search}%,reason.ilike.%${search}%`);

  query =
    sort === "amount"
      ? query.order("amount", { ascending: false })
      : query.order("created_at", { ascending: sort === "oldest" });

  const { data } = await query.limit(100);

  const rows = ((data as unknown as Array<ClaimSummary & { profiles: ClaimSummary["owner"] }>) ?? []).map(
    (row) => ({ ...row, owner: row.profiles ?? null }),
  );

  return { data: rows, demo: false };
}

export async function getAdminUsers(): Promise<DataResult<Profile[]>> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    const now = new Date();
    const demoUsers: Profile[] = [
      "Nadia Haddad",
      "Amara Osei",
      "Daniel Reyes",
      "Priya Raman",
      "Lukas Brenner",
    ].map((name, index) => ({
      id: `sample-user-${index}`,
      full_name: name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      country: ["United States", "Ghana", "Spain", "United Kingdom", "Germany"][index] ?? null,
      role: index === 0 ? "admin" : "user",
      account_status: index === 4 ? "pending" : "active",
      avatar_url: null,
      created_at: new Date(now.getTime() - index * 86_400_000 * 9).toISOString(),
      updated_at: now.toISOString(),
    }));
    return { data: demoUsers, demo: true };
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return { data: (data as Profile[]) ?? [], demo: false };
}

export interface AdminDocumentRow {
  id: string;
  file_name: string;
  size_bytes: number;
  created_at: string;
  storage_path: string;
  reference: string;
}

export async function getAdminDocuments(): Promise<DataResult<AdminDocumentRow[]>> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    const rows = DEMO_CLAIMS.flatMap((claim) =>
      claim.documents.map((document, index) => ({
        id: `${claim.reference}-d${index}`,
        file_name: document.file_name,
        size_bytes: document.size_bytes,
        created_at: document.created_at,
        storage_path: "",
        reference: claim.reference,
      })),
    ).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    return { data: rows, demo: true };
  }

  const { data } = await supabase
    .from("claim_documents")
    .select("id, file_name, size_bytes, created_at, storage_path, claims ( reference )")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = ((data as unknown as Array<AdminDocumentRow & { claims: { reference: string } | null }>) ?? []).map(
    (row) => ({ ...row, reference: row.claims?.reference ?? "—" }),
  );

  return { data: rows, demo: false };
}

export interface AdminMessageRow {
  id: string;
  body: string;
  sender_role: "user" | "admin";
  created_at: string;
  reference: string;
}

export async function getAdminMessages(): Promise<DataResult<AdminMessageRow[]>> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    const rows = DEMO_CLAIMS.flatMap((claim) =>
      claim.messages.map((message, index) => ({
        id: `${claim.reference}-m${index}`,
        body: message.body,
        sender_role: message.sender_role,
        created_at: message.created_at,
        reference: claim.reference,
      })),
    ).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    return { data: rows, demo: true };
  }

  const { data } = await supabase
    .from("claim_messages")
    .select("id, body, sender_role, created_at, claims ( reference )")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = ((data as unknown as Array<AdminMessageRow & { claims: { reference: string } | null }>) ?? []).map(
    (row) => ({ ...row, reference: row.claims?.reference ?? "—" }),
  );

  return { data: rows, demo: false };
}


/* ------------------------------------------------------------ notifications */

export interface NotificationRow {
  id: string;
  title: string;
  body: string | null;
  read: boolean;
  claim_id: string | null;
  created_at: string;
  reference?: string | null;
}

/** The signed-in user's notifications. RLS scopes this to their own rows. */
export async function getMyNotifications(limit = 30): Promise<DataResult<NotificationRow[]>> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { data: [], demo: true };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], demo: false };

  const { data } = await supabase
    .from("notifications")
    .select("id, title, body, read, claim_id, created_at, claims ( reference )")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = ((data as unknown as Array<NotificationRow & { claims: { reference: string } | null }>) ?? [])
    .map((row) => ({ ...row, reference: row.claims?.reference ?? null }));

  return { data: rows, demo: false };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return 0;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return count ?? 0;
}
