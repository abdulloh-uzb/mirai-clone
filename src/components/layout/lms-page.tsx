import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Art in `public/reference/art` with a day and a night version. */
export type LmsArt =
  "lesson" | "exam" | "certificate" | "finish" | "ticket" | "filed";

/** The page frame for Portal, auth and Admin pages: the reference `.v2` scope. */
export function LmsRoot({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("v2 v2-root lms-root", className)}>{children}</div>;
}

/** Content width used by every LMS page. */
export function LmsWrap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>
      {children}
    </div>
  );
}

/**
 * The page hero: the reference gradient band with a kicker, the h1, an intro
 * and optional actions, plus a day and night picture on wide screens.
 */
export function LmsHero({
  title,
  kicker,
  intro,
  children,
  art,
  className,
}: {
  title: ReactNode;
  kicker?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  art?: LmsArt;
  className?: string;
}) {
  return (
    <section className={cn("lms-band", className)}>
      <LmsWrap className="flex items-center gap-10 pt-6 pb-8 sm:pt-8 sm:pb-10">
        <div className="min-w-0 flex-1">
          {kicker ? <p className="kick">{kicker}</p> : null}
          <h1 className="text-[34px] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-[44px]">
            {title}
          </h1>
          {intro ? (
            <p className="mt-3 max-w-2xl text-lg text-pretty text-muted-foreground sm:text-[19px]">
              {intro}
            </p>
          ) : null}
          {children ? <div className="mt-5">{children}</div> : null}
        </div>
        {art ? (
          <div
            aria-hidden="true"
            className="lms-art relative hidden aspect-[4/3] w-[280px] shrink-0 overflow-hidden rounded-[22px] bg-hero shadow-panel md:block lg:w-[320px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="pic-day absolute inset-0 size-full object-cover transition-opacity duration-700"
              src={`/reference/art/${art}.webp`}
              alt=""
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="pic-night absolute inset-0 size-full object-cover transition-opacity duration-700"
              src={`/reference/art/${art}-night.webp`}
              alt=""
              loading="lazy"
            />
          </div>
        ) : null}
      </LmsWrap>
    </section>
  );
}

/** The page body under the hero. */
export function LmsBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <LmsWrap className={cn("py-8 sm:py-10", className)}>{children}</LmsWrap>
  );
}
