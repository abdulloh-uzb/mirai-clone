import { localePrefix, splitLocalePath } from "@/i18n/locale-path";

const ORIGIN = "http://same-site.invalid";

/**
 * Returns `next` only if it is a same-site relative path (it starts at the
 * root and stays on this site), so a `?next=` parameter or an email link can
 * never send someone to another site. Anything else gives `null`.
 */
export function safeReturnPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/")) return null;
  // `//host` and `/\host` are read by browsers as another host.
  if (next.startsWith("//") || next.includes("\\")) return null;
  // Browsers strip tabs and newlines, which can turn `/\t/host` into `//host`.
  if ([...next].some((char) => char.charCodeAt(0) < 0x20 || char === "\x7f")) {
    return null;
  }
  return new URL(next, ORIGIN).origin === ORIGIN ? next : null;
}

/** The sign-in page in the UI language of `returnTo`, which returns there afterwards. */
export function signInPathFor(returnTo: string): string {
  const prefix = localePrefix(splitLocalePath(returnTo).locale);
  return `${prefix}/login?next=${encodeURIComponent(returnTo)}`;
}
