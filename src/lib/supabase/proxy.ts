import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/database.types";
import { publicEnv } from "@/lib/env";

type CookieToSet = {
  name: string;
  value: string;
  options: Parameters<NextResponse["cookies"]["set"]>[2];
};

/**
 * Refreshes the Supabase session for a request in the proxy. Refreshed tokens
 * are written onto the request (so pages rendered for it see them) and must be
 * copied onto whatever response the proxy returns with `applyCookies`, or the
 * browser keeps the old tokens and the user is signed out.
 */
export async function refreshSession(request: NextRequest) {
  const pending: CookieToSet[] = [];
  let extraHeaders: Record<string, string> = {};

  const supabase = createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          pending.push(...cookiesToSet);
          extraHeaders = headers;
        },
      },
    },
  );

  // Nothing may run between creating the client and getClaims(): it is what
  // refreshes an expired token. getClaims() also verifies the JWT.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub ?? null;

  function applyCookies<T extends NextResponse>(response: T): T {
    pending.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options),
    );
    Object.entries(extraHeaders).forEach(([key, value]) =>
      response.headers.set(key, value),
    );
    return response;
  }

  return { supabase, userId, applyCookies };
}
