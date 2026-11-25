import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CurrentAccount = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  role: "student" | "admin";
};

/**
 * The signed-in Student or Admin, or null for a Visitor. Cached per request so
 * the header and the verify banner share one lookup.
 */
export const getCurrentAccount = cache(
  async (): Promise<CurrentAccount | null> => {
    const supabase = await createClient();
    // getClaims verifies the JWT; never trust getSession() on the server.
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!claims?.sub) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, email_verified_at, role")
      .eq("user_id", claims.sub)
      .maybeSingle();
    if (!profile) return null;

    return {
      userId: claims.sub,
      email: typeof claims.email === "string" ? claims.email : "",
      firstName: profile.first_name,
      lastName: profile.last_name,
      emailVerified: profile.email_verified_at !== null,
      role: profile.role,
    };
  },
);

export function initialsOf(
  account: Pick<CurrentAccount, "firstName" | "lastName" | "email">,
): string {
  const initials = [account.firstName, account.lastName]
    .map((part) => part.trim().charAt(0))
    .join("")
    .toUpperCase();
  return initials || account.email.charAt(0).toUpperCase();
}
