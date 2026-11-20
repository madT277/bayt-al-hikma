import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Validate session with Supabase Auth server (retry once on transient fetch timeout)
  let {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user && authError && (authError.name === "AuthRetryableFetchError" || authError.status === 0)) {
    const retry = await supabase.auth.getUser();
    user = retry.data.user;
    authError = retry.error;
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      if (authError && (authError.name === "AuthRetryableFetchError" || authError.status === 0)) {
        loginUrl.searchParams.set("reason", "network");
      }
      const redirectResponse = NextResponse.redirect(loginUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      return redirectResponse;
    }

    // Check role in profiles table + is_editor() RPC + app_metadata fallback
    const [{ data: profile }, { data: isEditorRpc }] = await Promise.all([
      supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.rpc("is_editor"),
    ]);

    const role =
      profile?.role ??
      (typeof user.app_metadata?.role === "string"
        ? user.app_metadata.role
        : null);

    const allowed = role === "admin" || role === "editor" || isEditorRpc === true;

    if (!allowed) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("reason", "unauthorized");
      const redirectResponse = NextResponse.redirect(loginUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      return redirectResponse;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
