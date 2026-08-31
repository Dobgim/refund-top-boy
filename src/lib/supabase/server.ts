import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";
import type { Profile } from "@/types";

/**
 * Request-scoped Supabase client. Returns null when the project has no
 * credentials so callers can render demo content instead of crashing.
 */
export async function getSupabaseServerClient() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — the middleware refreshes the session.
        }
      },
    },
  });
}

/**
 * The signed-in user, resolved once per request.
 *
 * `auth.getUser()` verifies the token against the Supabase auth server, so it
 * is a network call every time. A dashboard render used to make five or six of
 * them — layout, page, and each query helper asking independently. React's
 * cache collapses those into one for the lifetime of the request.
 */
export const getSessionUser = cache(async () => {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Loads the signed-in profile. The role is read from the database — never from
 * a client-supplied value — and RLS keeps a user scoped to their own row.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const user = await getSessionUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return data ?? null;
});

export async function requireProfile(): Promise<Profile | null> {
  return getCurrentProfile();
}
