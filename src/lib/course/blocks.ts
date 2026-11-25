import { z } from "zod";

// Lesson block content (spec section 7). `lesson_blocks.content` is
// { "en": <content>, "ja": ..., "es": ..., "ru": ... }. Shared by the seed
// generator and the course player.

export const COURSE_LOCALES = ["en", "ja", "es", "ru"] as const;
export type CourseLocale = (typeof COURSE_LOCALES)[number];

export const BLOCK_TYPES = [
  "rich_text",
  "image",
  "video",
  "callout",
  "flip_card",
  "scenario",
  "drag_to_order",
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

const text = z.string().min(1);

const placeholderSrc = z
  .string()
  .regex(
    /^\/placeholder\/course\/[\w./-]+$/,
    "must be under /placeholder/course/",
  );

const schemas = {
  rich_text: z.object({ markdown: text }),
  image: z.object({
    src: placeholderSrc,
    alt: text,
    caption: text.optional(),
  }),
  // TODO(spec): real videos. Until then `src` is omitted and the player shows
  // the transcript with a captions track.
  video: z.object({
    title: text,
    src: z.string().optional(),
    captionsSrc: placeholderSrc,
    transcript: text,
  }),
  callout: z.object({
    tone: z.enum(["info", "tip", "warning"]),
    title: text,
    markdown: text,
  }),
  flip_card: z.object({ front: text, back: text }),
  // Practice only, not graded.
  scenario: z.object({
    prompt: text,
    choices: z
      .array(z.object({ text, feedback: text, best: z.boolean() }))
      .min(2)
      .refine((choices) => choices.filter((c) => c.best).length === 1, {
        message: "exactly one choice must be best",
      }),
  }),
  // Items are in the correct order; the player shuffles them.
  drag_to_order: z.object({ prompt: text, items: z.array(text).min(2) }),
} as const;

export type BlockContentByType = {
  [T in BlockType]: z.infer<(typeof schemas)[T]>;
};

export function blockContentSchema<T extends BlockType>(
  type: T,
): (typeof schemas)[T] {
  return schemas[type];
}

/** The per-language content of a block as stored: every locale present. */
export function blockContentByLocaleSchema(type: BlockType) {
  const one = schemas[type];
  return z.object({ en: one, ja: one, es: one, ru: one });
}

/** Returns the locale's content, falling back to English. Throws if neither is valid. */
export function parseBlockContent<T extends BlockType>(
  type: T,
  content: unknown,
  locale: string,
): BlockContentByType[T] {
  const schema = schemas[type];
  const byLocale =
    typeof content === "object" && content !== null
      ? (content as Record<string, unknown>)
      : {};
  const own = schema.safeParse(byLocale[locale]);
  if (own.success) return own.data as BlockContentByType[T];
  return schema.parse(byLocale.en) as BlockContentByType[T];
}
