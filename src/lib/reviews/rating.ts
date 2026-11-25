// Pure helpers for review ratings, shared by the home page and its JSON-LD.

export type Review = {
  slug: string;
  title: string;
  body: string;
  authorName: string;
  rating: number;
  isSample: boolean;
};

/** The mean rating, rounded to one decimal, or null with no reviews. */
export function averageRating(
  reviews: Pick<Review, "rating">[],
): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/**
 * Rating data for structured data, from real reviews only. Sample reviews are
 * demo content and never count (honesty rule), so with only samples this is null.
 */
export function aggregateRating(
  reviews: Pick<Review, "rating" | "isSample">[],
): { ratingValue: number; reviewCount: number } | null {
  const real = reviews.filter((review) => !review.isSample);
  const ratingValue = averageRating(real);
  return ratingValue === null
    ? null
    : { ratingValue, reviewCount: real.length };
}
