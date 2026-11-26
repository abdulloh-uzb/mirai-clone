import {
  COURSE_LOCALES,
  blockContentSchema,
  type BlockType,
  type CourseLocale,
} from "@/lib/course/blocks";

// The lesson-block editor posts plain fields named `<locale>.<field>` instead
// of JSON. This turns them back into `{ en: {...}, ja: {...} }` and checks each
// language with the block's schema. Pure, so it is unit tested.

/** Scenario blocks show this many choice rows; empty rows are ignored. */
export const SCENARIO_ROWS = 4;

export type BlockFormResult =
  | { ok: true; content: Partial<Record<CourseLocale, unknown>> }
  | { ok: false; locale: CourseLocale; message: string };

type Get = (name: string) => string;

function lines(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** The raw object for one language, or null when every field is blank. */
function readLocale(
  type: BlockType,
  l: CourseLocale,
  get: Get,
): Record<string, unknown> | null {
  const f = (name: string) => get(`${l}.${name}`).trim();
  const opt = (name: string) => f(name) || undefined;
  let raw: Record<string, unknown>;
  switch (type) {
    case "rich_text":
      raw = { markdown: f("markdown") };
      break;
    case "image":
      raw = { src: f("src"), alt: f("alt"), caption: opt("caption") };
      break;
    case "video":
      raw = {
        title: f("title"),
        src: opt("src"),
        captionsSrc: f("captionsSrc"),
        transcript: f("transcript"),
      };
      break;
    case "callout":
      raw = { tone: f("tone"), title: f("title"), markdown: f("markdown") };
      break;
    case "flip_card":
      raw = { front: f("front"), back: f("back") };
      break;
    case "scenario": {
      const best = f("best");
      const choices = [];
      for (let i = 0; i < SCENARIO_ROWS; i++) {
        const text = f(`choice${i}.text`);
        const feedback = f(`choice${i}.feedback`);
        if (!text && !feedback) continue;
        choices.push({ text, feedback, best: best === String(i) });
      }
      raw = { prompt: f("prompt"), choices };
      break;
    }
    case "drag_to_order":
      raw = { prompt: f("prompt"), items: lines(get(`${l}.items`)) };
      break;
  }
  // Select-like fields (image source, captions, tone) always have a value, so
  // they do not count as "filled in" for an untranslated language.
  const ignored = new Set(["src", "captionsSrc", "tone", "best"]);
  const filled = Object.entries(raw).some(([k, v]) => {
    if (ignored.has(k)) return false;
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" && v !== "";
  });
  return filled ? raw : null;
}

export function parseBlockForm(type: BlockType, get: Get): BlockFormResult {
  const content: Partial<Record<CourseLocale, unknown>> = {};
  for (const l of COURSE_LOCALES) {
    const raw = readLocale(type, l, get);
    if (!raw) {
      if (l === "en") {
        return { ok: false, locale: l, message: "English is required" };
      }
      continue; // untranslated: flagged in the translation status
    }
    const parsed = blockContentSchema(type).safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const where = issue?.path.join(".") || "content";
      return {
        ok: false,
        locale: l,
        message: `${where}: ${issue?.message ?? "invalid"}`,
      };
    }
    content[l] = parsed.data;
  }
  return { ok: true, content };
}
