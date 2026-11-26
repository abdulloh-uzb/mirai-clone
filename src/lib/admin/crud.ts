// Field config for the simple Admin CRUD tables (content, courts, site
// content). One generic form + server action reads this; nothing else knows the
// column lists. Pure, so it is unit tested.

export type FieldKind =
  "text" | "textarea" | "int" | "bool" | "json" | "locale" | "select" | "list";

export type Field = {
  name: string;
  kind: FieldKind;
  optional?: boolean;
  /** Allowed values; renders a select. */
  choices?: readonly string[];
  /** Fixed value for fields the form does not show (e.g. state_code). */
  fixed?: string;
};

export type CrudConfig = {
  tag:
    | "courts"
    | "faq"
    | "pages"
    | "posts"
    | "changelog"
    | "reviews"
    | "courses"
    | null;
  /** Rebuild the AI knowledge base after a change. */
  reindex: boolean;
  label: string;
  fields: Field[];
  /** Column that names a row in lists. */
  titleField: string;
  /** Sets `published_at` when first published. */
  publishedAt?: boolean;
};

const POST_CATEGORIES: readonly string[] = [
  "traffic-school",
  "california-driving",
  "after-your-ticket",
];
const locale: Field = { name: "locale", kind: "locale" };
const published: Field = { name: "published", kind: "bool" };

export const CRUD = {
  faq_items: {
    tag: "faq",
    reindex: true,
    label: "FAQ item",
    titleField: "title",
    fields: [
      locale,
      { name: "slug", kind: "text" },
      { name: "title", kind: "text" },
      { name: "body", kind: "textarea" },
      {
        name: "category",
        kind: "text",
        choices: [
          "about",
          "course",
          "exam",
          "certificates",
          "payments",
          "eligibility",
          "language",
          "ai",
          "classroom",
          "contact",
        ],
      },
      { name: "position", kind: "int" },
      { name: "featured", kind: "bool" },
      published,
    ],
  },
  pages: {
    tag: "pages",
    reindex: true,
    label: "Page",
    titleField: "title",
    fields: [
      locale,
      { name: "slug", kind: "text" },
      { name: "title", kind: "text" },
      { name: "body", kind: "textarea" },
      published,
    ],
  },
  posts: {
    tag: "posts",
    reindex: true,
    label: "Blog post",
    titleField: "title",
    publishedAt: true,
    fields: [
      locale,
      { name: "slug", kind: "text" },
      { name: "title", kind: "text" },
      { name: "category", kind: "text", choices: POST_CATEGORIES },
      { name: "excerpt", kind: "textarea" },
      { name: "body", kind: "textarea" },
      published,
    ],
  },
  changelog: {
    tag: "changelog",
    reindex: false,
    label: "What's new entry",
    titleField: "title",
    publishedAt: true,
    fields: [
      locale,
      { name: "slug", kind: "text" },
      { name: "title", kind: "text" },
      { name: "body", kind: "textarea" },
      published,
    ],
  },
  reviews: {
    tag: "reviews",
    reindex: false,
    label: "Review",
    titleField: "title",
    fields: [
      locale,
      { name: "slug", kind: "text" },
      { name: "title", kind: "text" },
      { name: "body", kind: "textarea" },
      { name: "author_name", kind: "text" },
      { name: "rating", kind: "int" },
      published,
    ],
  },
  announcements: {
    tag: null,
    reindex: false,
    label: "Announcement",
    titleField: "message",
    fields: [locale, { name: "message", kind: "text" }, published],
  },
  counties: {
    tag: "courts",
    reindex: true,
    label: "County",
    titleField: "name",
    fields: [
      { name: "state_code", kind: "text", fixed: "CA" },
      { name: "name", kind: "text" },
      { name: "slug", kind: "text" },
      { name: "seat_city", kind: "text" },
      { name: "case_lookup_url", kind: "text", optional: true },
      { name: "instructions", kind: "json" },
    ],
  },
  courts: {
    tag: "courts",
    reindex: true,
    label: "Courthouse",
    titleField: "name",
    fields: [
      { name: "state_code", kind: "text", fixed: "CA" },
      { name: "county_id", kind: "select" },
      { name: "slug", kind: "text" },
      { name: "name", kind: "text" },
      { name: "city", kind: "text", optional: true },
      { name: "court_code", kind: "text", optional: true },
      { name: "address", kind: "text", optional: true },
      { name: "citation_regex", kind: "text", optional: true },
    ],
  },
  courses: {
    tag: "courses",
    reindex: false,
    label: "Course price",
    titleField: "slug",
    fields: [
      { name: "price_cents", kind: "int" },
      { name: "list_price_cents", kind: "int", optional: true },
      { name: "active", kind: "bool" },
    ],
  },
  states: {
    tag: null,
    reindex: false,
    label: "State config",
    titleField: "name",
    fields: [
      { name: "min_course_minutes", kind: "int" },
      { name: "exam_questions", kind: "int" },
      { name: "pass_pct", kind: "int" },
      { name: "max_attempts", kind: "int" },
      { name: "access_days", kind: "int" },
      { name: "report_times", kind: "list" },
      { name: "active", kind: "bool" },
    ],
  },
  sections: {
    tag: null,
    reindex: false,
    label: "Section",
    titleField: "position",
    fields: [
      { name: "course_id", kind: "select" },
      { name: "position", kind: "int" },
      { name: "title", kind: "json" },
    ],
  },
  lessons: {
    tag: null,
    reindex: false,
    label: "Lesson",
    titleField: "position",
    fields: [
      { name: "section_id", kind: "select" },
      { name: "position", kind: "int" },
      { name: "min_seconds", kind: "int" },
      { name: "title", kind: "json" },
    ],
  },
} as const satisfies Record<string, CrudConfig>;

export type CrudTable = keyof typeof CRUD;

export function isCrudTable(name: unknown): name is CrudTable {
  return typeof name === "string" && Object.hasOwn(CRUD, name);
}

export type ParseResult =
  { ok: true; values: Record<string, unknown> } | { ok: false; error: string };

/** Turns submitted form data into column values for one table. */
export function parseCrudForm(
  fields: readonly Field[],
  get: (name: string) => string | null,
): ParseResult {
  const values: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = get(f.name);
    if (f.fixed !== undefined) {
      values[f.name] = f.fixed;
      continue;
    }
    switch (f.kind) {
      case "bool":
        values[f.name] = raw === "on" || raw === "true";
        break;
      case "int": {
        if (f.optional && (raw === null || raw.trim() === "")) {
          values[f.name] = null;
          break;
        }
        const n = Number(raw);
        if (raw === null || raw.trim() === "" || !Number.isInteger(n)) {
          return { ok: false, error: `${f.name} must be a whole number` };
        }
        values[f.name] = n;
        break;
      }
      case "json": {
        try {
          const parsed: unknown = JSON.parse(raw?.trim() || "{}");
          if (
            typeof parsed !== "object" ||
            parsed === null ||
            Array.isArray(parsed)
          ) {
            return { ok: false, error: `${f.name} must be a JSON object` };
          }
          values[f.name] = parsed;
        } catch {
          return { ok: false, error: `${f.name} is not valid JSON` };
        }
        break;
      }
      case "list":
        values[f.name] = (raw ?? "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        break;
      case "locale":
        if (!["en", "ja", "es", "ru"].includes(raw ?? "")) {
          return { ok: false, error: "unknown locale" };
        }
        values[f.name] = raw;
        break;
      default: {
        const v = (raw ?? "").trim();
        if (f.choices && !f.choices.includes(v)) {
          return { ok: false, error: `${f.name} is not an allowed value` };
        }
        if (!v && !f.optional && f.kind !== "textarea") {
          return { ok: false, error: `${f.name} is required` };
        }
        values[f.name] = v === "" && f.optional ? null : v;
      }
    }
  }
  return { ok: true, values };
}
