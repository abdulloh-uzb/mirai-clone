import { routing, type Locale } from "@/i18n/routing";

/** A `?course=` value that is one of the Course languages, else null. */
export function parseCourseLanguage(value: unknown): Locale | null {
  return typeof value === "string" &&
    (routing.locales as readonly string[]).includes(value)
    ? (value as Locale)
    : null;
}

/**
 * Where a buy button goes: sign-up for a Visitor, the Portal for a Student.
 * Both keep the chosen Course language. Payments arrive in phase 4.
 */
export function buyHref(courseLanguage: Locale, signedIn: boolean): string {
  return `${signedIn ? "/portal" : "/signup"}?course=${courseLanguage}`;
}
