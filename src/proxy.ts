import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  LOCALE_PREFERENCE_COOKIE,
  resolveUiLocale,
} from "@/i18n/resolve-ui-locale";
import { splitLocalePath } from "@/i18n/locale-path";
import { routing } from "@/i18n/routing";
import { signInPathFor } from "@/lib/auth/return-path";
import { buildCsp, createNonce } from "@/lib/security/csp";
import { refreshSession } from "@/lib/supabase/proxy";

// One proxy composes Supabase session refresh with next-intl's locale
// handling. next-intl rewrites unprefixed paths to `/en/...` and redirects
// `/en/...` to the unprefixed path.
const intl = createMiddleware(routing);

function isPortalPath(pathname: string): boolean {
  const { path } = splitLocalePath(pathname);
  return path === "/portal" || path.startsWith("/portal/");
}

export async function proxy(original: NextRequest) {
  // A fresh nonce per request. Next reads it from the request's CSP header and
  // puts it on its own scripts; pages read it from `x-nonce`.
  const nonce = createNonce();
  const csp = buildCsp({
    nonce,
    isDev: process.env.NODE_ENV !== "production",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    posthogHost:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  });
  const {
    supabase,
    userId,
    applyCookies: applySession,
  } = await refreshSession(original);
  const applyCookies = <T extends NextResponse>(response: T): T => {
    applySession(response);
    response.headers.set("Content-Security-Policy", csp);
    return response;
  };
  // Built after the session refresh so refreshed cookies are carried along.
  const headers = new Headers(original.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const request = new NextRequest(original, { headers });
  const { pathname, search } = request.nextUrl;

  // Portal pages need a signed-in user; the Portal layout checks again.
  if (!userId && isPortalPath(pathname)) {
    const url = new URL(signInPathFor(`${pathname}${search}`), request.url);
    return applyCookies(NextResponse.redirect(url));
  }

  // The saved preference only matters at the bare root, so only look it up
  // there: the profile for a signed-in Student, the cookie for a Visitor.
  let preference = request.cookies.get(LOCALE_PREFERENCE_COOKIE)?.value;
  if (pathname === "/" && userId) {
    const { data } = await supabase
      .from("profiles")
      .select("preferred_locale")
      .eq("user_id", userId)
      .maybeSingle();
    preference = data?.preferred_locale ?? preference;
  }

  const { redirectTo } = resolveUiLocale({ pathname, preference });
  if (redirectTo) {
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    return applyCookies(NextResponse.redirect(url));
  }
  return applyCookies(intl(request));
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
