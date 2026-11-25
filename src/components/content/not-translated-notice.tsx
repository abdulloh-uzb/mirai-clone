import { LanguagesIcon } from "lucide-react";
import { useTranslations } from "next-intl";

/** Shown above content that falls back to English (ADR 0004). */
export function NotTranslatedNotice() {
  const t = useTranslations("Content");
  return (
    <p
      role="note"
      className="flex items-start gap-2 rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground"
    >
      <LanguagesIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
      {t("notTranslated")}
    </p>
  );
}
