/** Blog categories, in the order the filter shows them. Same values as the `posts.category` check. */
export const POST_CATEGORIES = [
  "traffic-school",
  "california-driving",
  "after-your-ticket",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export function isPostCategory(value: unknown): value is PostCategory {
  return (
    typeof value === "string" &&
    (POST_CATEGORIES as readonly string[]).includes(value)
  );
}

/** The SVG cover for a category, used on cards and as the share image. */
export function coverImage(category: PostCategory): string {
  return `/placeholder/blog-${category}.svg`;
}
