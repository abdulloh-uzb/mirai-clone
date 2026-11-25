/** Cookie listing the ids of announcements this browser has dismissed. */
export const DISMISSED_ANNOUNCEMENTS_COOKIE = "dismissed_announcements";
const MAX_REMEMBERED = 20;

export function parseDismissed(cookieValue: string | undefined): string[] {
  return cookieValue ? cookieValue.split(",").filter(Boolean) : [];
}

/** Adds an id to the cookie value, keeping only the most recent ids. */
export function addDismissed(
  cookieValue: string | undefined,
  id: string,
): string {
  const ids = parseDismissed(cookieValue).filter((other) => other !== id);
  return [...ids, id].slice(-MAX_REMEMBERED).join(",");
}
