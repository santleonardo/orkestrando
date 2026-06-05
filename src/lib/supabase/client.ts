// ─── ORKESTRANDO — Supabase Browser Client ───

import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function isSupabaseConfigured(): boolean {
  return isConfigured;
}

export function createSupabaseBrowserClient() {
  if (!isConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}

let browserClient: ReturnType<typeof createSupabaseBrowserClient> | undefined;

export function getSupabaseBrowserClient() {
  if (!isConfigured) return null;
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient();
  }
  return browserClient;
}
