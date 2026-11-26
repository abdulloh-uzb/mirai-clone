"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/admin-write";
import { translateEnv } from "@/lib/ai/env";
import { COURSE_LOCALES, type CourseLocale } from "@/lib/course/blocks";

// Machine translation for the course editor. The admin writes one language,
// presses Translate, reviews the filled-in fields and saves. Nothing is saved
// here. Uses OpenAI through the AI SDK; the key stays on the server.

const NAMES: Record<CourseLocale, string> = {
  en: "English",
  ja: "Japanese",
  es: "Spanish (Latin American)",
  ru: "Russian",
};

const locale = z.enum(COURSE_LOCALES);

const inputSchema = z.object({
  source: locale,
  targets: z.array(locale).min(1).max(3),
  // Field name -> text. Kept small: one block or one set of titles.
  fields: z
    .record(z.string().max(100), z.string().max(8000))
    .refine((f) => Object.keys(f).length > 0 && Object.keys(f).length <= 30),
});

export type TranslateResult =
  | {
      ok: true;
      translations: Partial<Record<CourseLocale, Record<string, string>>>;
    }
  | { ok: false; error: "no_key" | "invalid" | "failed" };

export async function translateFields(
  input: unknown,
): Promise<TranslateResult> {
  await requireAdmin();
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { apiKey, model } = translateEnv();
  if (!apiKey) return { ok: false, error: "no_key" };
  const { source, fields } = parsed.data;
  const targets = parsed.data.targets.filter((t) => t !== source);
  if (!targets.length) return { ok: false, error: "invalid" };

  // Plain property names for the JSON schema; mapped back afterwards.
  const names = Object.keys(fields);
  const keyOf = (i: number) => `f${i}`;
  const one = z.object(
    Object.fromEntries(names.map((_, i) => [keyOf(i), z.string()])),
  );
  const schema = z.object(Object.fromEntries(targets.map((t) => [t, one])));
  const sourceJson = Object.fromEntries(
    names.map((n, i) => [keyOf(i), fields[n]]),
  );

  try {
    const openai = createOpenAI({ apiKey });
    const { object } = await generateObject({
      model: openai(model),
      schema,
      system:
        "You translate lessons of an online California traffic school. " +
        "Write natural, plain language a driver understands. Keep Markdown " +
        "(**bold**, list dashes, ## headings), line breaks, numbers, units " +
        "and names such as DMV or California Vehicle Code. Translate every " +
        "field; never add or drop content.",
      prompt:
        `Translate each field from ${NAMES[source]} into: ` +
        targets.map((t) => `${t} = ${NAMES[t]}`).join(", ") +
        `. Return one object per language code with the same field keys.\n\n` +
        JSON.stringify(sourceJson, null, 2),
    });
    const result = object as Record<string, Record<string, string>>;
    const translations: Partial<Record<CourseLocale, Record<string, string>>> =
      {};
    for (const t of targets) {
      const out = result[t] ?? {};
      translations[t] = Object.fromEntries(
        names.map((n, i) => [n, out[keyOf(i)] ?? ""]),
      );
    }
    return { ok: true, translations };
  } catch (error) {
    console.error("translateFields failed", error);
    return { ok: false, error: "failed" };
  }
}
