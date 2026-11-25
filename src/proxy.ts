import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_PREFERENCE_COOKIE,
  resolveUiLocale,
} from "@/i18n/resolve-ui-locale";
import { routing } from "@/i18n/routing";
import { signInPathFor } from "@/lib/auth/return-path";
import { refreshSession } from "@/lib/supabase/proxy";

// One proxy composes Supabase session refresh with next-intl's locale
// handling. next-intl rewrites unprefixed paths to `/en/...` and redirects
// `/en/...` to the unprefixed path.
const intl = createMiddleware(routing);

/** The path without its UI language prefix: `/ja/portal` gives `/portal`. */
function withoutLocale(pathname: string): string {
  const [, first = "", ...rest] = pathname.split("/");
  return routing.locales.some((locale) => locale === first)
    ? `/${rest.join("/")}`
    : pathname;
}

function isPortalPath(pathname: string): boolean {
  const path = withoutLocale(pathname);
  return path === "/portal" || path.startsWith("/portal/");
}

export async function proxy(request: NextRequest) {
  const { supabase, userId, applyCookies } = await refreshSession(request);
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
