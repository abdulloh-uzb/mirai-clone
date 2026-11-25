import "server-only";
import { unstable_cache } from "next/cache";

/**
 * Cache tag per kind of database content. Phase 5 admin edits call
 * `revalidateTag(<tag>)` so the next request reads fresh rows.
 */
export const contentTags = {
  courts: "courts",
  faq: "faq",
  pages: "pages",
  posts: "posts",
  changelog: "changelog",
  reviews: "reviews",
  courses: "courses",
} as const;

export type ContentTag = (typeof contentTags)[keyof typeof contentTags];

/** Upper bound on staleness if a revalidation is ever missed. */
const MAX_AGE_SECONDS = 300;

/**
 * Caches a public content read across requests, keyed by `key` plus the
 * arguments, and tagged so admin edits can refresh it.
 *
 * Pages render per request because the page frame reads cookies; only these
 * reads are cached. `unstable_cache` is used instead of `"use cache"`, which
 * needs `cacheComponents` (phase 2 spec, Rendering and caching).
 * TODO(spec): move to `"use cache"` + `cacheTag` if the app adopts cacheComponents.
 */
export function cachedContent<Args extends unknown[], Result>(
  read: (...args: Args) => Promise<Result>,
  key: string,
  tag: ContentTag,
): (...args: Args) => Promise<Result> {
  return unstable_cache(read, [key], {
    tags: [tag],
    revalidate: MAX_AGE_SECONDS,
  });
}
