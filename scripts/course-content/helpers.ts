import type { BlockType, CourseLocale } from "../../src/lib/course/blocks";

// Authoring helpers for the course content. Texts are tuples in the order
// en, ja, es, ru so a translation can't be forgotten.

export type T = readonly [string, string, string, string];
const ORDER: CourseLocale[] = ["en", "ja", "es", "ru"];

export function byLocale<V>(
  pick: (index: number) => V,
): Record<CourseLocale, V> {
  return Object.fromEntries(ORDER.map((l, i) => [l, pick(i)])) as Record<
    CourseLocale,
    V
  >;
}

export type Block = {
  type: BlockType;
  content: Record<CourseLocale, Record<string, unknown>>;
};

export type Lesson = { title: T; blocks: Block[] };
export type Option = { text: Record<CourseLocale, string>; correct: boolean };
export type Question = {
  key: string;
  text: Record<CourseLocale, string>;
  explanation: Record<CourseLocale, string>;
  options: Option[];
};
export type SectionContent = { lessons: Lesson[]; quiz: Question[] };

export const richText = (md: T): Block => ({
  type: "rich_text",
  content: byLocale((i) => ({ markdown: md[i] })),
});

export const callout = (
  tone: "info" | "tip" | "warning",
  title: T,
  md: T,
): Block => ({
  type: "callout",
  content: byLocale((i) => ({ tone, title: title[i], markdown: md[i] })),
});

export const flipCard = (front: T, back: T): Block => ({
  type: "flip_card",
  content: byLocale((i) => ({ front: front[i], back: back[i] })),
});

export const image = (slug: string, alt: T, caption: T): Block => ({
  type: "image",
  content: byLocale((i) => ({
    src: `/placeholder/course/${slug}.svg`,
    alt: alt[i],
    caption: caption[i],
  })),
});

export const video = (slug: string, title: T, transcript: T): Block => ({
  type: "video",
  content: byLocale((l) => ({
    title: title[l],
    captionsSrc: `/placeholder/course/captions/${slug}.${ORDER[l]}.vtt`,
    transcript: transcript[l],
  })),
});

export const dragToOrder = (prompt: T, items: readonly T[]): Block => ({
  type: "drag_to_order",
  content: byLocale((i) => ({
    prompt: prompt[i],
    items: items.map((s) => s[i]),
  })),
});

/** choices: [text, feedback]; the first choice is the best one. */
export const scenario = (prompt: T, choices: readonly [T, T][]): Block => ({
  type: "scenario",
  content: byLocale((i) => ({
    prompt: prompt[i],
    choices: choices.map(([text, feedback], n) => ({
      text: text[i],
      feedback: feedback[i],
      best: n === 0,
    })),
  })),
});

export const lesson = (title: T, ...blocks: Block[]): Lesson => ({
  title,
  blocks,
});

// ---- Questions ----

/** An option is one text for every language (numbers, times) or a tuple. */
export type Opt = string | T;

const CORRECT_PREFIX: T = [
  "Correct answer: ",
  "正解: ",
  "Respuesta correcta: ",
  "Правильный ответ: ",
];

const opt = (o: Opt, i: number) => (typeof o === "string" ? o : o[i]);

/** The correct option goes first; the server shuffles when it serves questions. */
export function q(
  key: string,
  stem: T,
  correct: Opt,
  wrong: readonly [Opt, Opt, Opt],
): Question {
  return {
    key,
    text: byLocale((i) => stem[i]),
    explanation: byLocale((i) => `${CORRECT_PREFIX[i]}${opt(correct, i)}`),
    options: [
      { text: byLocale((i) => opt(correct, i)), correct: true },
      ...wrong.map((w) => ({
        text: byLocale((i) => opt(w, i)),
        correct: false,
      })),
    ],
  };
}

// Common localized options.
export const YES: T = ["Yes", "はい", "Sí", "Да"];
export const NO: T = ["No", "いいえ", "No", "Нет"];
