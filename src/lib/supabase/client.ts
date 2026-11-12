// ─────────────────────────────────────────────────────────────────────────────
//  Browser-side Supabase client
//  ─────────────────────────────────────────────────────────────────────────
//  Use this ONLY inside "use client" components.
//  It uses the public anon key — safe to expose to the browser.
//
//  To prevent multiple GoTrueClient instances (which cause a console warning),
//  we memoize the client in module scope. The same instance is reused across
//  every component that imports this file.
// ─────────────────────────────────────────────────────────────────────────────

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Module-level singleton — created once, reused everywhere
let _client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (_client) return _client;

  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return _client;
}
