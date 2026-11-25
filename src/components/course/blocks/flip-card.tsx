"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function FlipCardBlock({
  front,
  back,
}: {
  front: string;
  back: string;
}) {
  const t = useTranslations("Player");
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={flipped}
      onClick={() => setFlipped((f) => !f)}
      className="block min-h-32 w-full rounded-xl border bg-card p-6 text-left shadow-sm transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {flipped ? t("cardBack") : t("cardFront")}
      </span>
      <span className="mt-2 block text-lg font-medium">
        {flipped ? back : front}
      </span>
      <span className="mt-3 block text-sm text-muted-foreground">
        {t("flipHint")}
      </span>
    </button>
  );
}
