/**
 * Returns `next` only if it is a same-site relative path, so an email link or
 * redirect parameter can never send someone to another site.
 * TODO(spec): ticket 04 owns the return-path validator and its unit tests;
 * fold this into it there.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  if (next.includes("\\")) return null;
  if ([...next].some((char) => char.charCodeAt(0) < 0x20)) return null;
  return next;
}
