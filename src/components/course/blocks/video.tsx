"use client";

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
    <div className="rounded-xl border bg-card p-4">
      <h3 className="font-semibold">{title}</h3>
      {src ? (
        <video controls className="mt-3 w-full rounded-lg" aria-label={title}>
          <source src={src} />
          <track kind="captions" src={captionsSrc} default />
        </video>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{t("videoSoon")}</p>
      )}
      <details className="mt-3" open={!src}>
        <summary className="cursor-pointer text-sm font-medium">
          {t("transcript")}
        </summary>
        <p className="mt-2 text-sm whitespace-pre-line">{transcript}</p>
      </details>
    </div>
  );
}
