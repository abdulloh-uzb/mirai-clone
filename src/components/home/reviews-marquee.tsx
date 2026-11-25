import { StarIcon } from "lucide-react";
import type { Review } from "@/lib/reviews/rating";

/**
 * Decorative two-lane strip of review headlines drifting in opposite
 * directions. Hidden from assistive tech (the carousel below is the accessible
 * copy) and static under `prefers-reduced-motion`.
 */
export function ReviewsMarquee({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const lanes = [reviews, [...reviews].reverse()];
  return (
    <div aria-hidden className="mt-8 grid gap-3 overflow-hidden">
      {lanes.map((lane, laneIndex) => (
        <div key={laneIndex} className="marquee-mask overflow-hidden">
          <div
            className={`marquee-track flex w-max gap-3 ${
              laneIndex === 1 ? "marquee-reverse" : ""
            }`}
          >
            {[...lane, ...lane].map((review, i) => (
              <span
                key={`${review.slug}-${i}`}
                className="flex shrink-0 items-center gap-2 rounded-full border-2 bg-card px-4 py-2 text-sm font-semibold shadow-sm"
              >
                <StarIcon className="size-4 fill-amber-500 text-amber-500" />
                {review.title}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="h-3 rounded-full bg-[#3a3f47]">
        <div className="mx-4 h-full border-t-2 border-dashed border-white/80" />
      </div>
    </div>
  );
}
