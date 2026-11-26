export const CONSENT_COOKIE = "consent";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;
export const CONSENT_OPEN_EVENT = "roadready:open-consent";

export type Consent = "analytics" | "none";

/** Reads the consent choice from a cookie header or `document.cookie`. Unknown values mean "not chosen yet". */
export function parseConsent(
  cookieHeader: string | null | undefined,
): Consent | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name !== CONSENT_COOKIE) continue;
    const value = rest.join("=");
    return value === "analytics" || value === "none" ? value : null;
  }
  return null;
}

export function serializeConsent(value: Consent): string {
  return `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax`;
}
