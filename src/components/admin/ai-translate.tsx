"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { SparklesIcon } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/button";
import { AdminSelect } from "@/components/admin/ui/select";
import { translateFields } from "@/lib/admin/translate-actions";
import { COURSE_LOCALES, type CourseLocale } from "@/lib/course/blocks";
import { LANGUAGE_NAMES } from "./lang-badge";

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/**
 * Field names in the editor forms: blocks use `<locale>.<field>`, titles
 * `title_<locale>`. Returns [locale, field] or null for other inputs.
 */
function split(name: string): [CourseLocale, string] | null {
  const block = /^(en|ja|es|ru)\.(.+)$/.exec(name);
  if (block) return [block[1] as CourseLocale, block[2] as string];
  const title = /^title_(en|ja|es|ru)$/.exec(name);
  if (title) return [title[1] as CourseLocale, "title"];
  return null;
}

function nameOf(l: CourseLocale, field: string, titles: boolean): string {
  return titles ? `title_${l}` : `${l}.${field}`;
}

const isText = (el: Control) =>
  el instanceof HTMLTextAreaElement ||
  (el instanceof HTMLInputElement && el.type === "text");

/**
 * "Translate with AI": reads the source language's fields from the form it
 * sits in and fills the other languages. The admin reviews and saves; nothing
 * is stored until then.
 */
export function AiTranslate({ titles = false }: { titles?: boolean }) {
  const t = useTranslations("Admin.editor.ai");
  const [source, setSource] = useState<CourseLocale>("en");
  const [message, setMessage] = useState<{
    tone: "ok" | "error";
    text: string;
  } | null>(null);
  const [pending, start] = useTransition();

  function run(form: HTMLFormElement) {
    const controls = Array.from(form.elements).filter(
      (el): el is Control =>
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement,
    );
    const byName = new Map(controls.map((el) => [el.name, el]));
    const fields: Record<string, string> = {};
    for (const el of controls) {
      const parts = split(el.name);
      if (parts?.[0] === source && isText(el) && el.value.trim()) {
        fields[parts[1]] = el.value;
      }
    }
    if (!Object.keys(fields).length) {
      setMessage({
        tone: "error",
        text: t("emptySource", { language: LANGUAGE_NAMES[source] }),
      });
      return;
    }
    const targets = COURSE_LOCALES.filter((l) => l !== source);
    const hasText = targets.some((l) =>
      Object.keys(fields).some((f) =>
        byName.get(nameOf(l, f, titles))?.value.trim(),
      ),
    );
    if (hasText && !window.confirm(t("overwrite"))) return;

    setMessage(null);
    start(async () => {
      const res = await translateFields({ source, targets, fields });
      if (!res.ok) {
        setMessage({ tone: "error", text: t(`errors.${res.error}`) });
        return;
      }
      for (const l of targets) {
        for (const [f, text] of Object.entries(res.translations[l] ?? {})) {
          const el = byName.get(nameOf(l, f, titles));
          if (el && text) el.value = text;
        }
        // Copy choices that are not text (callout style, best answer, picture).
        for (const el of controls) {
          const parts = split(el.name);
          if (parts?.[0] !== source || isText(el)) continue;
          if (el instanceof HTMLInputElement && el.type === "radio") {
            if (!el.checked) continue;
            const twin = controls.find(
              (c) =>
                c.name === nameOf(l, parts[1], titles) && c.value === el.value,
            );
            if (twin instanceof HTMLInputElement) twin.checked = true;
          } else if (
            el instanceof HTMLSelectElement &&
            parts[1] !== "captionsSrc"
          ) {
            const twin = byName.get(nameOf(l, parts[1], titles));
            if (twin) twin.value = el.value;
          }
        }
      }
      setMessage({ tone: "ok", text: t("done") });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed bg-muted/40 px-3 py-2">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium">
        <SparklesIcon aria-hidden className="size-4 text-primary" />
        {t("label")}
      </span>
      <AdminSelect
        aria-label={t("from")}
        value={source}
        onChange={(e) => setSource(e.target.value as CourseLocale)}
        wrapperClassName="w-auto"
        className="h-8"
      >
        {COURSE_LOCALES.map((l) => (
          <option key={l} value={l}>
            {t("fromLanguage", { language: LANGUAGE_NAMES[l] })}
          </option>
        ))}
      </AdminSelect>
      <AdminButton
        type="button"
        size="xs"
        disabled={pending}
        onClick={(e) => {
          const form = e.currentTarget.form;
          if (form) run(form);
        }}
      >
        {pending ? t("working") : t("button")}
      </AdminButton>
      {message ? (
        <span
          role={message.tone === "error" ? "alert" : "status"}
          className={
            message.tone === "error"
              ? "text-sm font-medium text-red-700 dark:text-red-400"
              : "text-sm font-medium text-emerald-700 dark:text-emerald-400"
          }
        >
          {message.text}
        </span>
      ) : null}
    </div>
  );
}
