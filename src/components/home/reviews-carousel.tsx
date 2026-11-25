"use client";

import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import type { Review } from "@/lib/reviews/rating";

/**
 * Reviews one at a time (two or three on wider screens). No autoplay: the
 * visitor moves with the buttons or the arrow keys when the carousel has focus.
 */
export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const t = useTranslations("Home.reviews");
  const [index, setIndex] = useState(0);
  const regionId = useId();
  const count = reviews.length;
  if (count === 0) return null;

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };
  // The current review first, then the next ones for wider screens.
  const visible = [0, 1, 2].map((offset) => reviews[(index + offset) % count]);

  return (
    <div
      role="region"
      aria-roledescription={t("carousel")}
      aria-label={t("carouselLabel")}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div
        id={regionId}
        aria-live="polite"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((review, offset) => (
          <figure
            key={`${review.slug}-${offset}`}
            aria-roledescription={t("slide")}
            aria-label={t("slideLabel", {
              current: ((index + offset) % count) + 1,
              total: count,
            })}
            className={
              offset === 0
                ? "rounded-xl border bg-card p-5"
                : offset === 1
                  ? "hidden rounded-xl border bg-card p-5 md:block"
                  : "hidden rounded-xl border bg-card p-5 lg:block"
            }
          >
            <p
              className="flex gap-0.5 text-amber-500"
              aria-label={t("stars", { rating: review.rating })}
            >
              {Array.from({ length: 5 }, (_, star) => (
                <StarIcon
                  key={star}
                  aria-hidden
                  className={
                    star < review.rating ? "size-4 fill-current" : "size-4"
                  }
                />
              ))}
            </p>
            <blockquote className="mt-3">
              <p className="font-semibold">{review.title}</p>
              <p className="mt-2 text-muted-foreground">{review.body}</p>
            </blockquote>
            <figcaption className="mt-3 text-sm font-medium">
              {review.authorName}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-controls={regionId}
          aria-label={t("previous")}
          onClick={() => go(-1)}
        >
          <ChevronLeftIcon aria-hidden />
        </Button>
        <span className="text-sm text-muted-foreground">
          {t("position", { current: index + 1, total: count })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-controls={regionId}
          aria-label={t("next")}
          onClick={() => go(1)}
        >
          <ChevronRightIcon aria-hidden />
        </Button>
      </div>
    </div>
  );
}
