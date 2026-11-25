// The "Where is your ticket from?" choice, kept in a cookie so every page
// and the home hero (ticket 09) agree. California is the default.

export const TICKET_STATE_COOKIE = "ticket_state";
export const TICKET_STATE_MAX_AGE = 60 * 60 * 24 * 365;
export const DEFAULT_TICKET_STATE = "CA";

/** A two-letter uppercase state code, else California. */
export function parseTicketState(value: unknown): string {
  return typeof value === "string" && /^[A-Z]{2}$/.test(value)
    ? value
    : DEFAULT_TICKET_STATE;
}
