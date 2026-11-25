import "server-only";
import { routing, type Locale } from "@/i18n/routing";
import { cachedContent, contentTags } from "@/lib/content/cache";
import { createAnonClient } from "@/lib/supabase/anon";

export const ONLINE_COURSE_SLUG = "california-traffic-violator-course";
export const CLASSROOM_COURSE_SLUG = "california-classroom-course";
const STATE_CODE = "CA";

export type OnlineCourse = {
  id: string;
  priceCents: number;
  listPriceCents: number | null;
  sections: { position: number; title: Partial<Record<Locale, string>> }[];
};

/** Keeps only the languages we know, with non-empty text. */
function parseTitle(value: unknown): Partial<Record<Locale, string>> {
  const result: Partial<Record<Locale, string>> = {};
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return result;
  }
  const record = value as Record<string, unknown>;
  for (const locale of routing.locales) {
    const text = record[locale];
    if (typeof text === "string" && text.trim()) result[locale] = text;
  }
  return result;
}

/** The online California course with its 8 sections, in order. */
export const getOnlineCourse = cachedContent(
  async (): Promise<OnlineCourse> => {
    const { data, error } = await createAnonClient()
      .from("courses")
      .select("id, price_cents, list_price_cents, sections(position, title)")
      .eq("slug", ONLINE_COURSE_SLUG)
      .single();
    if (error) throw error;
    return {
      id: data.id,
      priceCents: data.price_cents,
      listPriceCents: data.list_price_cents,
      sections: [...data.sections]
        .sort((a, b) => a.position - b.position)
        .map((section) => ({
          position: section.position,
          title: parseTitle(section.title),
        })),
    };
  },
  "online-course",
  contentTags.courses,
);

/** The Classroom course (not on sale yet): only its price is shown. */
export const getClassroomCourse = cachedContent(
  async (): Promise<{ priceCents: number }> => {
    const { data, error } = await createAnonClient()
      .from("courses")
      .select("price_cents")
      .eq("slug", CLASSROOM_COURSE_SLUG)
      .single();
    if (error) throw error;
    return { priceCents: data.price_cents };
  },
  "classroom-course",
  contentTags.courses,
);

/** Every state (50 plus DC) by name, for the Citation-state selector. */
export const listStates = cachedContent(
  async (): Promise<{ code: string; name: string; active: boolean }[]> => {
    const { data, error } = await createAnonClient()
      .from("states")
      .select("code, name, active")
      .order("name");
    if (error) throw error;
    return data;
  },
  "list-states",
  contentTags.courses,
);

export type CourseRules = {
  examQuestions: number;
  passPct: number;
  maxAttempts: number;
  accessDays: number;
  reportTimes: string[];
};

/** California's course rules, for the rules and reporting sections. */
export const getCourseRules = cachedContent(
  async (): Promise<CourseRules> => {
    const { data, error } = await createAnonClient()
      .from("states")
      .select("exam_questions, pass_pct, max_attempts, access_days, report_times")
      .eq("code", STATE_CODE)
      .single();
    if (error) throw error;
    return {
      examQuestions: data.exam_questions,
      passPct: data.pass_pct,
      maxAttempts: data.max_attempts,
      accessDays: data.access_days,
      reportTimes: data.report_times,
    };
  },
  "course-rules",
  contentTags.courses,
);

/** "$24.99" from cents, in the page's language. */
export function formatUsd(cents: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
