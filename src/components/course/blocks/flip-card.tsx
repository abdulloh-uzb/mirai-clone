"use client";

import { RotateCwIcon } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

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
      className={cn(
        "block min-h-40 w-full rounded-[22px] border-2 p-6 text-left transition-colors sm:p-7",
        flipped
          ? "border-brand-green bg-green-tint"
          : "border-line-blue bg-hero hover:border-primary",
      )}
    >
      <span
        className={cn(
          "inline-flex rounded-full px-3 py-1 text-[13px] font-extrabold tracking-[0.06em] uppercase",
          flipped ? "bg-brand-green text-[#0f1217]" : "bg-card text-blue-text",
        )}
      >
        {flipped ? t("cardBack") : t("cardFront")}
      </span>
      <span className="mt-3 block text-xl leading-snug font-extrabold tracking-tight text-balance">
        {flipped ? back : front}
      </span>
      <span className="mt-4 flex items-center gap-2 text-[15px] font-semibold text-muted-foreground">
        <RotateCwIcon aria-hidden className="size-4 shrink-0" />
        {t("flipHint")}
      </span>
    </button>
  );
}
