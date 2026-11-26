import type { Messages } from "./fallback";

/**
 * The message namespaces read by client components (`useTranslations` in a
 * file marked "use client"). Only these are sent to the browser: the rest are
 * rendered on the server, and sending every message made each page's payload
 * and hydration much heavier. Add a namespace here when a client component
 * starts using it.
 */
export const CLIENT_NAMESPACES = [
  "Accessibility.form",
  "Account",
  "Assistant",
  "Auth",
  "BugReport",
  "CitationState",
  "Checkout",
  "Consent",
  "Contact.form",
  "DmvServices",
  "DriverDetails",
  "Courts",
  "Eligibility",
  "Exam",
  "Faq",
  "Forms",
  "Header",
  "HelpWidget",
  "Home.reviews",
  "IdentityCheck",
  "LanguageSuggestion",
  "LanguageSwitcher",
  "Player",
  "PortalNav",
  "Quiz",
  "VerifyEmail",
  "Waitlists",
] as const;

/** Copies the given dotted paths (for example `Home.reviews`) into a new object. */
export function pickNamespaces(
  messages: Messages,
  namespaces: readonly string[],
): Messages {
  const result: Messages = {};
  for (const namespace of namespaces) {
    const path = namespace.split(".");
    let source: unknown = messages;
    for (const key of path) {
      source =
        source && typeof source === "object"
          ? (source as Record<string, unknown>)[key]
          : undefined;
    }
    if (source === undefined) continue;
    let target = result as Record<string, unknown>;
    path.slice(0, -1).forEach((key) => {
      target = (target[key] ??= {}) as Record<string, unknown>;
    });
    target[path[path.length - 1]!] = source;
  }
  return result;
}
