import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared inner-page hero: gradient band, title and intro on the left, a masked
 * decorative road-and-hills scene on the right. `children` sits under the
 * intro (search, chips, notes).
 */
export function PageHero({
  title,
  intro,
  children,
  className,
}: {
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-surface-sky via-surface-sky to-surface-mint",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 600 300"
        preserveAspectRatio="xMaxYMax slice"
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[55%] [mask-image:linear-gradient(to_right,transparent,black_45%)] md:block"
      >
        <circle cx="470" cy="70" r="34" fill="#ffd966" opacity="0.85" />
        <path
          d="M0 230 Q120 130 250 200 T520 170 T600 190 V300 H0Z"
          fill="#9be07a"
          opacity="0.55"
        />
        <path
          d="M0 260 Q150 190 300 245 T600 230 V300 H0Z"
          fill="#58b947"
          opacity="0.6"
        />
        <path d="M0 285 H600 V300 H0Z" fill="#3a3f47" opacity="0.75" />
        <path
          d="M0 293 H600"
          stroke="#fff"
          strokeWidth="3"
          strokeDasharray="22 16"
        />
      </svg>
      <div className="relative mx-auto max-w-[1200px] px-6 py-12 md:min-h-[320px] md:py-20 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-balance md:text-5xl">
            {title}
          </h1>
          {intro ? (
            <p className="mt-4 text-lg text-pretty text-muted-foreground">
              {intro}
            </p>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
