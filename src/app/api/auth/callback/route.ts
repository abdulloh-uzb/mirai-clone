import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeReturnPath } from "@/lib/auth/return-path";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { localePrefix, splitLocalePath } from "@/i18n/locale-path";

// Every auth email link (verification, magic link, password reset) lands here.
// It lives under /api so the locale middleware leaves it alone.

const EMAIL_OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return EMAIL_OTP_TYPES.some((type) => type === value);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeReturnPath(searchParams.get("next")) ?? "/";
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createClient();
  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && isEmailOtpType(type)
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { data: { user: null }, error: new Error("missing code") };

  if (error || !data.user) {
    return NextResponse.redirect(
      new URL(
        `${localePrefix(splitLocalePath(next).locale)}/login?error=link`,
        origin,
      ),
    );
  }

  // Opening a link sent to the address proves the Student owns it. Only the
  // service role may set this column (see the profiles migration).
  await createServiceClient()
    .from("profiles")
    .update({ email_verified_at: new Date().toISOString() })
    .eq("user_id", data.user.id)
    .is("email_verified_at", null);

  return NextResponse.redirect(new URL(next, origin));
}
