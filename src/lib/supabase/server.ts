// ─────────────────────────────────────────────────────────────────────────────
//  Server-side Supabase client
//  ─────────────────────────────────────────────────────────────────────────
//  Use this in:  Server Components, Route Handlers, Server Actions
//  Never use in: "use client" components (use @/lib/supabase/client there)
//
//  The client is async because `cookies()` from next/headers is async in
//  Next.js 14.2+ (it returns a Promise<ReadonlyRequestCookies>).
//  Always await: `const sb = await createClient()`
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // set() is a no-op in Server Components (cookies are read-only).
          // It IS used in Server Actions and Route Handlers — both work fine.
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Intentionally swallowed — Server Component context.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Intentionally swallowed.
          }
        },
      },
    }
  );
}

// ── Convenience: service-role client for admin operations ─────────────────────
// WARNING: NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser.
// Only use this in Route Handlers that are protected by auth middleware.
export async function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "[createAdminClient] SUPABASE_SERVICE_ROLE_KEY is not set. " +
        "This client must only be called from protected server-side code."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {},    // Admin client never sets auth cookies
        remove: (_name: string, _options: CookieOptions) => {}, // Admin client never removes auth cookies
      },
      auth: {
        autoRefreshToken: false,
        persistSession:   false,
      },
    }
  );
}
