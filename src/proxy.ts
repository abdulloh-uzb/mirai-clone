import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_PREFERENCE_COOKIE,
  resolveUiLocale,
} from "@/i18n/resolve-ui-locale";
import { routing } from "@/i18n/routing";

// next-intl rewrites unprefixed paths to `/en/...` and redirects `/en/...` to the
// unprefixed path. Supabase session refresh is composed in here by later tickets.
const intl = createMiddleware(routing);

export function proxy(request: NextRequest) {
  // TODO(spec): for a signed-in Student the saved preference is the profile's
  // preferred language (ticket 03 owns profiles); Visitors use the cookie.
  const { redirectTo } = resolveUiLocale({
    pathname: request.nextUrl.pathname,
    preference: request.cookies.get(LOCALE_PREFERENCE_COOKIE)?.value,
  });
  if (redirectTo) {
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    return NextResponse.redirect(url);
  }
  return intl(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
