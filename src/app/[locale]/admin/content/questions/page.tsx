import { PlusIcon, Trash2Icon } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { AdminCard } from "@/components/admin/ui/card";
import {
  AdminDisclosure,
  AdminDisclosureList,
} from "@/components/admin/ui/disclosure";
import { AdminEmpty } from "@/components/admin/ui/empty";
import { AdminField, adminCheckClass } from "@/components/admin/ui/field";
import { AdminInput } from "@/components/admin/ui/input";
import { AdminSelect } from "@/components/admin/ui/select";
import { AdminTextarea } from "@/components/admin/ui/textarea";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { deleteQuestion, saveQuestion } from "@/lib/admin/content-actions";
import { createServiceClient } from "@/lib/supabase/service";

type Q = {
  id: string;
  section_id: string | null;
  locale: string;
  text: string;
  explanation: string;
  answer_options: { id: string; text: string; is_correct: boolean }[];
} | null;

async function QuestionForm({
  q,
  sections,
  defaults,
  locale,
}: {
  locale: Locale;
  q: Q;
  sections: { id: string; label: string }[];
  defaults: { section: string; locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "Admin.questions" });
  const tc = await getTranslations({ locale, namespace: "Admin.common" });
  const options = q?.answer_options ?? [];
  const correct = options.findIndex((o) => o.is_correct);
  return (
    <form action={saveQuestion} className="flex flex-col gap-4">
      {q ? <input type="hidden" name="id" value={q.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label={t("pool")}>
          <AdminSelect
            name="sectionId"
            defaultValue={q ? (q.section_id ?? "") : defaults.section}
          >
            <option value="">{t("examPool")}</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label={tc("language")}>
          <AdminSelect
            name="locale"
            defaultValue={q?.locale ?? defaults.locale}
          >
            {["en", "ja", "es", "ru"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </AdminSelect>
        </AdminField>
      </div>
      <AdminField label={t("question")}>
        <AdminTextarea name="text" required rows={2} defaultValue={q?.text} />
      </AdminField>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            name="correct"
            value={i}
            required
            defaultChecked={i === correct}
            aria-label={t("optionCorrect", { n: i + 1 })}
            className={adminCheckClass}
          />
          <AdminInput
            name={`option${i}`}
            aria-label={t("optionText", { n: i + 1 })}
            required
            defaultValue={options[i]?.text}
            placeholder={t("option", { n: i + 1 })}
          />
        </div>
      ))}
      <AdminField label={t("explanation")}>
        <AdminTextarea
          name="explanation"
          rows={2}
          defaultValue={q?.explanation}
        />
      </AdminField>
      <AdminButton type="submit" size="sm" className="w-fit">
        {q ? t("save") : t("add")}
      </AdminButton>
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
  const t = await getTranslations({ locale, namespace: "Admin.questions" });
  const tc = await getTranslations({ locale, namespace: "Admin.common" });
  const tNav = await getTranslations({ locale, namespace: "Admin.nav" });
  const tDesc = await getTranslations({
    locale,
    namespace: "Admin.descriptions",
  });
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
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={tNav("questions")}
        description={tDesc("questions")}
      />
      <AdminCard className="overflow-hidden">
        <form className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
          <AdminSelect
            name="locale"
            aria-label={tc("language")}
            defaultValue={qLocale}
            wrapperClassName="w-auto"
          >
            {["en", "ja", "es", "ru"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </AdminSelect>
          <AdminSelect
            name="section"
            aria-label={t("pool")}
            defaultValue={section}
            wrapperClassName="w-auto sm:max-w-xs"
          >
            <option value="">{t("allPools")}</option>
            <option value="exam">{t("examPool")}</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </AdminSelect>
          <AdminButton type="submit" variant="outline" size="sm">
            {tc("filter")}
          </AdminButton>
        </form>
        {(data ?? []).length === 0 ? (
          <AdminEmpty title={tc("noResults")} />
        ) : (
          <AdminDisclosureList>
            {(data ?? []).map((q) => (
              <AdminDisclosure
                key={q.id}
                summary={<span className="min-w-0 font-medium">{q.text}</span>}
              >
                <QuestionForm
                  q={q}
                  sections={sections}
                  defaults={{ section, locale: qLocale }}
                  locale={locale}
                />
                <form
                  action={deleteQuestion}
                  className="mt-4 flex justify-end border-t pt-4"
                >
                  <input type="hidden" name="id" value={q.id} />
                  <AdminButton
                    type="submit"
                    variant="destructive-ghost"
                    size="sm"
                  >
                    <Trash2Icon aria-hidden />
                    {tc("delete")}
                  </AdminButton>
                </form>
              </AdminDisclosure>
            ))}
          </AdminDisclosureList>
        )}
        <div className="border-t">
          <AdminDisclosure
            summary={
              <span className="inline-flex items-center gap-1.5 font-medium text-link">
                <PlusIcon aria-hidden className="size-4" />
                {t("new")}
              </span>
            }
          >
            <QuestionForm
              q={null}
              locale={locale}
              sections={sections}
              defaults={{
                section: section === "exam" ? "" : section,
                locale: qLocale,
              }}
            />
          </AdminDisclosure>
        </div>
      </AdminCard>
    </div>
  );
}
