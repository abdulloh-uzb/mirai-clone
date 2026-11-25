import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// next-intl rewrites unprefixed paths to `/en/...` and redirects `/en/...` to the
// unprefixed path. Supabase session refresh is composed in here by later tickets.
export const proxy = createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
