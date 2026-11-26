import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { deleteQuestion, saveQuestion } from "@/lib/admin/content-actions";
import { createServiceClient } from "@/lib/supabase/service";

const field = "rounded-md border bg-background px-2 py-1 text-sm";

type Q = {
  id: string;
  section_id: string | null;
  locale: string;
  text: string;
  explanation: string;
  answer_options: { id: string; text: string; is_correct: boolean }[];
} | null;

function QuestionForm({
  q,
  sections,
  defaults,
}: {
  q: Q;
  sections: { id: string; label: string }[];
  defaults: { section: string; locale: string };
}) {
  const options = q?.answer_options ?? [];
  const correct = options.findIndex((o) => o.is_correct);
  return (
    <form action={saveQuestion} className="mt-2 flex flex-col gap-3">
      {q ? <input type="hidden" name="id" value={q.id} /> : null}
      <div className="flex gap-3">
        <label className="flex flex-col gap-1 text-sm">
          pool
          <select
            name="sectionId"
            defaultValue={q ? (q.section_id ?? "") : defaults.section}
            className={field}
          >
            <option value="">Final exam pool</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          locale
          <select
            name="locale"
            defaultValue={q?.locale ?? defaults.locale}
            className={field}
          >
            {["en", "ja", "es", "ru"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        question
        <textarea
          name="text"
          required
          rows={2}
          defaultValue={q?.text}
          className={field}
        />
      </label>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="correct"
            value={i}
            required
            defaultChecked={i === correct}
            aria-label={`Option ${i + 1} is correct`}
          />
          <input
            name={`option${i}`}
            required
            defaultValue={options[i]?.text}
            placeholder={`Option ${i + 1}`}
            className={`${field} w-full`}
          />
        </div>
      ))}
      <label className="flex flex-col gap-1 text-sm">
        explanation
        <textarea
          name="explanation"
          rows={2}
          defaultValue={q?.explanation}
          className={field}
        />
      </label>
      <button
        type="submit"
        className="w-fit rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
      >
        {q ? "Save question" : "Add question"}
      </button>
    </form>
  );
}

// Correct answers are shown here on purpose: this page is Admin only and
// server-rendered, and never reaches a student.
export default async function AdminQuestionsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/content/questions">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const sp = await searchParams;
  const qLocale = ["en", "ja", "es", "ru"].includes(String(sp.locale))
    ? String(sp.locale)
    : "en";
  const section = typeof sp.section === "string" ? sp.section : "";
  const svc = createServiceClient();
  const { data: sectionRows } = await svc
    .from("sections")
    .select("id, position, title")
    .order("position");
  const sections = (sectionRows ?? []).map((s) => ({
    id: s.id,
    label: `${s.position}. ${(s.title as Record<string, string>).en ?? ""}`,
  }));
  let query = svc
    .from("questions")
    .select(
      "id, section_id, locale, text, explanation, answer_options(id, text, is_correct)",
    )
    .eq("locale", qLocale)
    .order("created_at")
    .limit(200);
  query =
    section === "exam"
      ? query.is("section_id", null)
      : section
        ? query.eq("section_id", section)
        : query;
  const { data } = await query;

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">Question bank</h1>
      <form className="mt-4 flex gap-2">
        <select name="locale" defaultValue={qLocale} className={field}>
          {["en", "ja", "es", "ru"].map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <select name="section" defaultValue={section} className={field}>
          <option value="">All pools</option>
          <option value="exam">Final exam pool</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="submit" className={field}>
          Filter
        </button>
      </form>
      <div className="mt-4 flex flex-col gap-2">
        {(data ?? []).map((q) => (
          <details key={q.id} className="rounded-md border p-3">
            <summary className="cursor-pointer text-sm font-medium">
              {q.text}
            </summary>
            <QuestionForm
              q={q}
              sections={sections}
              defaults={{ section, locale: qLocale }}
            />
            <form action={deleteQuestion} className="mt-2">
              <input type="hidden" name="id" value={q.id} />
              <button type="submit" className="text-sm text-destructive">
                Delete
              </button>
            </form>
          </details>
        ))}
        <details className="rounded-md border border-dashed p-3">
          <summary className="cursor-pointer text-sm font-medium">
            New question
          </summary>
          <QuestionForm
            q={null}
            sections={sections}
            defaults={{
              section: section === "exam" ? "" : section,
              locale: qLocale,
            }}
          />
        </details>
      </div>
    </section>
  );
}
