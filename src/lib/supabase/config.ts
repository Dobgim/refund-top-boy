export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * The project is designed to build and run without credentials so the UI can be
 * reviewed offline. Every data path checks this flag and falls back to clearly
 * labelled demo data instead of throwing.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const DOCUMENTS_BUCKET = "claim-documents";
