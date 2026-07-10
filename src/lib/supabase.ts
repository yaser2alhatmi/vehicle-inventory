import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client. All database access goes through
 * Next.js API routes, so the browser never talks to Supabase directly.
 */
export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase env vars — see README (.env.local setup)");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
