import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv, isSupabaseConfigured } from "@/lib/env";

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.next();

  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabasePublicEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isProtected = pathname === "/onboarding" || pathname.startsWith("/dashboard");
  const isAuthPage = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(pathname);

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && user) return NextResponse.redirect(new URL("/dashboard", request.url));
  return response;
}

export const config = {
  matcher: ["/onboarding", "/dashboard/:path*", "/login", "/signup", "/forgot-password", "/reset-password"],
};
