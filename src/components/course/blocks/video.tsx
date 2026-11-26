"use client";

import { ChevronDownIcon, PlayIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function VideoBlock({
  title,
  src,
  captionsSrc,
  transcript,
}: {
  title: string;
  src?: string;
  captionsSrc: string;
  transcript: string;
}) {
  const t = useTranslations("Player");
  return (
    <div className="overflow-hidden rounded-[22px] border border-line-blue bg-card">
      {src ? (
        <video controls className="block w-full bg-black" aria-label={title}>
          <source src={src} />
          <track kind="captions" src={captionsSrc} default />
        </video>
      ) : (
        <div className="lms-band flex aspect-video flex-col items-center justify-center gap-3 p-6 text-center">
          <span
            aria-hidden
            className="grid size-14 place-items-center rounded-full bg-primary text-[#0f1217] shadow-[0_8px_20px_-6px_#00000073]"
          >
            <PlayIcon className="ml-0.5 size-6 fill-current" />
          </span>
          <p className="max-w-sm text-[15px] font-semibold text-muted-foreground">
            {t("videoSoon")}
          </p>
        </div>
      )}
      <div className="p-5 sm:p-6">
        <h3 className="text-xl leading-tight font-extrabold tracking-tight">
          {title}
        </h3>
        <details className="group mt-3" open={!src}>
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full bg-hero px-4 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
            {t("transcript")}
            <ChevronDownIcon
              aria-hidden
              className="size-4 text-blue-text transition-transform group-open:rotate-180"
            />
          </summary>
          <p className="mt-3 text-[16px] leading-relaxed whitespace-pre-line text-muted-foreground">
            {transcript}
          </p>
        </details>
      </div>
    </div>
  );
}
