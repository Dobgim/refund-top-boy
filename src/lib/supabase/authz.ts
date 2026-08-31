import "server-only";

import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface AdminAccess {
  supabase: SupabaseClient | null;
  userId: string | null;
  email: string | null;
  role: string | null;
  isAdmin: boolean;
  /** Populated only when access is refused, and says precisely why. */
  reason: string | null;
}

/**
 * Single source of truth for "is the caller a reviewer?".
 *
 * Asks the database the exact question its own row level security asks, by
 * calling `public.is_admin()`. Previously the actions read `profiles.role`
 * themselves and discarded the query error, so a failed read was
 * indistinguishable from a genuine refusal and surfaced as "you do not have
 * permission" to a real administrator.
 *
 * Falls back to reading the profile directly if the RPC is missing, and always
 * reports the underlying error rather than swallowing it.
 */
export const getAdminAccess = cache(async (): Promise<AdminAccess> => {
  const empty: AdminAccess = {
    supabase: null,
    userId: null,
    email: null,
    role: null,
    isAdmin: false,
    reason: null,
  };

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { ...empty, reason: "The database is not connected on this deployment." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ...empty,
      supabase,
      reason: "Your session has expired. Sign in again.",
    };
  }

  const base = { supabase, userId: user.id, email: user.email ?? null };

  // 1. The database's own predicate, identical to the one in every RLS policy.
  const { data: rpcResult, error: rpcError } = await supabase.rpc("is_admin");

  if (!rpcError && typeof rpcResult === "boolean") {
    // Read the role too, purely so the UI can explain a refusal.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = (profile as { role?: string } | null)?.role ?? null;

    return {
      ...empty,
      ...base,
      role,
      isAdmin: rpcResult,
      reason: rpcResult
        ? null
        : role
          ? `This account has the role "${role}", not "admin".`
          : "Your session could not be verified against the database — sign out and back in.",
    };
  }

  // 2. Fallback: read the profile directly, and surface any error honestly.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      ...empty,
      ...base,
      reason: `Your profile could not be read: ${profileError.message}`,
    };
  }

  if (!profile) {
    // Row level security returns zero rows rather than an error when the
    // request is unauthenticated, so an expired access token looks identical
    // to a missing profile. Say both, and point at the fix.
    return {
      ...empty,
      ...base,
      reason:
        "Your profile could not be read. This usually means the session expired — sign out and back in.",
    };
  }

  const role = (profile as { role?: string }).role ?? null;

  return {
    ...empty,
    ...base,
    role,
    isAdmin: role === "admin",
    reason: role === "admin" ? null : `This account has the role "${role}", not "admin".`,
  };
});
