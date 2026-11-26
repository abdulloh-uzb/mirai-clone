import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Pages that have a day and night hero picture in `public/reference/art/pages`. */
export type HeroArt =
  | "about"
  | "blog"
  | "contact"
  | "courses"
  | "courts"
  | "dmv"
  | "eligibility"
  | "faq"
  | "place"
  | "rules";

/** Wraps a public page in the reference design scope (`.v2`). */
export function V2Root({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("v2 v2-root", className)}>{children}</div>;
}

/**
 * The reference page hero (`.tool-top`): title, intro and actions on the left,
 * a day and night picture on the right. `children` sits under the intro
 * (search, buttons, notes). Render it inside <V2Root>.
 */
export function PageHero({
  title,
  intro,
  children,
  className,
  art = "courts",
  titleId,
}: {
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  art?: HeroArt;
  titleId?: string;
}) {
  return (
    <section className={cn("tool-top", className)}>
      <div className="tool-top-in">
        <div className="tool-lead">
          <h1 id={titleId}>{title}</h1>
          {intro ? <p className="tool-sub">{intro}</p> : null}
          {children}
        </div>
        <div className="tool-art" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pic-day"
            src={`/reference/art/pages/${art}.webp`}
            alt=""
            fetchPriority="high"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pic-night"
            src={`/reference/art/pages/${art}-night.webp`}
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
