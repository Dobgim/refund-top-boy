"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

let cached: ReturnType<typeof createBrowserClient> | null = null;

/** Browser Supabase client. Returns null when the project is unconfigured. */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  cached ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cached;
}
