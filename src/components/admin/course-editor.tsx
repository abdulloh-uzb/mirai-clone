"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { CheckIcon, PlusIcon } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/button";
import { AdminField, adminCheckClass } from "@/components/admin/ui/field";
import { AdminInput } from "@/components/admin/ui/input";
import { AdminSelect } from "@/components/admin/ui/select";
import { adminTabClass, adminTabListClass } from "@/components/admin/ui/tabs";
import { AdminTextarea } from "@/components/admin/ui/textarea";
import { AiTranslate } from "@/components/admin/ai-translate";
import { LANGUAGE_NAMES } from "@/components/admin/lang-badge";
import { SCENARIO_ROWS } from "@/lib/admin/block-form";
import {
  saveBlockFields,
  saveLesson,
  saveSection,
  type FormState,
} from "@/lib/admin/course-actions";
import {
  BLOCK_TYPES,
  COURSE_LOCALES,
  type BlockType,
  type CourseLocale,
} from "@/lib/course/blocks";
import { cn } from "@/lib/utils";

// Client parts of Admin › Content: the forms with language tabs and a save
// status. The server actions in course-actions do the validation and writes.

const LOCALE_NAMES = LANGUAGE_NAMES;

const idle: FormState = { status: "idle" };

type Titles = Partial<Record<CourseLocale, string>>;

function SaveButton({ label }: { label?: string }) {
  const t = useTranslations("Admin.editor");
  const { pending } = useFormStatus();
  return (
    <AdminButton type="submit" size="sm" disabled={pending}>
      {pending ? t("saving") : (label ?? t("save"))}
    </AdminButton>
  );
}

function Status({ state }: { state: FormState }) {
  const t = useTranslations("Admin.editor");
  if (state.status === "saved") {
    return (
      <span
        role="status"
        className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400"
      >
        <CheckIcon aria-hidden className="size-4" />
        {t("saved")}
      </span>
    );
  }
  if (state.status === "error") {
    const key = `errors.${state.error}`;
    return (
      <span
        role="alert"
        className="text-sm font-medium text-red-700 dark:text-red-400"
      >
        {t.has(key as never) ? t(key as never) : state.error}
      </span>
    );
  }
  return null;
}

/** Language tabs. Every panel stays in the form, so all four are submitted. */
function LocaleTabs({
  filled,
  render,
}: {
  filled: Partial<Record<CourseLocale, boolean>>;
  render: (l: CourseLocale) => React.ReactNode;
}) {
  const t = useTranslations("Admin.editor");
  const [active, setActive] = useState<CourseLocale>("en");
  return (
    <div>
      <div
        role="tablist"
        aria-label={t("languages")}
        className={adminTabListClass}
      >
        {COURSE_LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={active === l}
            onClick={() => setActive(l)}
            className={adminTabClass}
          >
            {LOCALE_NAMES[l]}
            <span
              aria-label={t(filled[l] ? "langDone" : "blockMissing", {
                language: LOCALE_NAMES[l],
              })}
              title={t(filled[l] ? "langDone" : "blockMissing", {
                language: LOCALE_NAMES[l],
              })}
              className={cn(
                "size-1.5 rounded-full",
                filled[l] ? "bg-emerald-500" : "bg-red-500",
              )}
            />
          </button>
        ))}
      </div>
      {COURSE_LOCALES.map((l) => (
        <div
          key={l}
          role="tabpanel"
          hidden={active !== l}
          className="flex flex-col gap-4 pt-4"
        >
          {l !== "en" ? (
            <p className="text-sm text-muted-foreground">
              {t("titleHintOptional")}
            </p>
          ) : null}
          {render(l)}
        </div>
      ))}
    </div>
  );
}

function TitleInputs({ titles }: { titles: Titles }) {
  const t = useTranslations("Admin.editor");
  return (
    <div className="flex flex-col gap-3">
      <AiTranslate titles />
      <div className="grid gap-3 sm:grid-cols-2">
        {COURSE_LOCALES.map((l) => (
          <AdminField
            key={l}
            label={t("titleIn", { locale: LOCALE_NAMES[l] })}
            hint={l === "en" ? t("titleHintRequired") : undefined}
          >
            <AdminInput
              name={`title_${l}`}
              defaultValue={titles[l] ?? ""}
              required={l === "en"}
            />
          </AdminField>
        ))}
      </div>
    </div>
  );
}

// ---- Section ---------------------------------------------------------------

export function SectionTitleForm({
  id,
  titles,
}: {
  id: string;
  titles: Titles;
}) {
  const [state, action] = useActionState(saveSection, idle);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <TitleInputs titles={titles} />
      <div className="flex items-center gap-3">
        <SaveButton />
        <Status state={state} />
      </div>
    </form>
  );
}

// ---- Lesson ----------------------------------------------------------------

export function LessonDetailsForm({
  lesson,
  sections,
}: {
  lesson: {
    id: string;
    sectionId: string;
    position: number;
    minSeconds: number;
    titles: Titles;
  };
  sections: { value: string; label: string }[];
}) {
  const t = useTranslations("Admin.editor");
  const [state, action] = useActionState(saveLesson, idle);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={lesson.id} />
      <TitleInputs titles={lesson.titles} />
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminField label={t("sectionField")}>
          <AdminSelect name="sectionId" defaultValue={lesson.sectionId}>
            {sections.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label={t("position")}>
          <AdminInput
            name="position"
            type="number"
            min={1}
            defaultValue={lesson.position}
            required
          />
        </AdminField>
        <AdminField label={t("minMinutes")} hint={t("minMinutesHint")}>
          <AdminInput
            name="minMinutes"
            type="number"
            min={0}
            step="0.5"
            defaultValue={lesson.minSeconds / 60}
            required
          />
        </AdminField>
      </div>
      <div className="flex items-center gap-3">
        <SaveButton />
        <Status state={state} />
      </div>
    </form>
  );
}

// ---- Blocks ----------------------------------------------------------------

type Content = Record<string, unknown>;

function s(c: Content | undefined, key: string): string {
  const v = c?.[key];
  return typeof v === "string" ? v : "";
}

function BlockFields({
  type,
  l,
  c,
  images,
  captions,
}: {
  type: BlockType;
  l: CourseLocale;
  c: Content | undefined;
  images: string[];
  captions: string[];
}) {
  const t = useTranslations("Admin.editor.fields");
  const n = (field: string) => `${l}.${field}`;
  switch (type) {
    case "rich_text":
      return (
        <AdminField label={t("markdown")} hint={t("markdownHint")}>
          <AdminTextarea
            name={n("markdown")}
            rows={8}
            defaultValue={s(c, "markdown")}
          />
        </AdminField>
      );
    case "image":
      return (
        <>
          <AdminField label={t("src")}>
            <AdminSelect
              name={n("src")}
              defaultValue={s(c, "src") || images[0]}
            >
              {images.map((src) => (
                <option key={src} value={src}>
                  {src.split("/").pop()}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label={t("alt")} hint={t("altHint")}>
            <AdminInput name={n("alt")} defaultValue={s(c, "alt")} />
          </AdminField>
          <AdminField label={t("caption")}>
            <AdminInput name={n("caption")} defaultValue={s(c, "caption")} />
          </AdminField>
        </>
      );
    case "video": {
      const own = captions.filter((p) => p.endsWith(`.${l}.vtt`));
      return (
        <>
          <AdminField label={t("videoTitle")}>
            <AdminInput name={n("title")} defaultValue={s(c, "title")} />
          </AdminField>
          <AdminField label={t("videoSrc")}>
            <AdminInput name={n("src")} defaultValue={s(c, "src")} />
          </AdminField>
          <AdminField label={t("captionsSrc")}>
            <AdminSelect
              name={n("captionsSrc")}
              defaultValue={s(c, "captionsSrc") || own[0] || captions[0]}
            >
              {(own.length ? own : captions).map((src) => (
                <option key={src} value={src}>
                  {src.split("/").pop()}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label={t("transcript")}>
            <AdminTextarea
              name={n("transcript")}
              rows={6}
              defaultValue={s(c, "transcript")}
            />
          </AdminField>
        </>
      );
    }
    case "callout":
      return (
        <>
          <AdminField label={t("tone")}>
            <AdminSelect name={n("tone")} defaultValue={s(c, "tone") || "info"}>
              {(["info", "tip", "warning"] as const).map((tone) => (
                <option key={tone} value={tone}>
                  {t(`tones.${tone}`)}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label={t("calloutTitle")}>
            <AdminInput name={n("title")} defaultValue={s(c, "title")} />
          </AdminField>
          <AdminField label={t("markdown")} hint={t("markdownHint")}>
            <AdminTextarea
              name={n("markdown")}
              rows={4}
              defaultValue={s(c, "markdown")}
            />
          </AdminField>
        </>
      );
    case "flip_card":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label={t("front")}>
            <AdminTextarea
              name={n("front")}
              rows={4}
              defaultValue={s(c, "front")}
            />
          </AdminField>
          <AdminField label={t("back")}>
            <AdminTextarea
              name={n("back")}
              rows={4}
              defaultValue={s(c, "back")}
            />
          </AdminField>
        </div>
      );
    case "scenario": {
      const choices = (Array.isArray(c?.choices) ? c.choices : []) as Content[];
      const bestIndex = Math.max(
        0,
        choices.findIndex((ch) => ch.best === true),
      );
      return (
        <>
          <AdminField label={t("prompt")}>
            <AdminTextarea
              name={n("prompt")}
              rows={3}
              defaultValue={s(c, "prompt")}
            />
          </AdminField>
          {Array.from({ length: SCENARIO_ROWS }, (_, i) => (
            <fieldset
              key={i}
              className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <legend className="px-1 text-xs font-medium text-muted-foreground">
                {t("choice", { n: i + 1 })}
              </legend>
              <AdminField label={t("choiceText")}>
                <AdminInput
                  name={n(`choice${i}.text`)}
                  defaultValue={s(choices[i], "text")}
                />
              </AdminField>
              <AdminField label={t("feedback")}>
                <AdminInput
                  name={n(`choice${i}.feedback`)}
                  defaultValue={s(choices[i], "feedback")}
                />
              </AdminField>
              <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium">
                <input
                  type="radio"
                  name={n("best")}
                  value={String(i)}
                  defaultChecked={i === bestIndex}
                  className={adminCheckClass}
                />
                {t("best")}
              </label>
            </fieldset>
          ))}
        </>
      );
    }
    case "drag_to_order": {
      const items = Array.isArray(c?.items) ? (c.items as string[]) : [];
      return (
        <>
          <AdminField label={t("prompt")}>
            <AdminInput name={n("prompt")} defaultValue={s(c, "prompt")} />
          </AdminField>
          <AdminField label={t("items")} hint={t("itemsHint")}>
            <AdminTextarea
              name={n("items")}
              rows={6}
              defaultValue={items.join("\n")}
            />
          </AdminField>
        </>
      );
    }
  }
}

/**
 * Edits one block, or creates one when `block` is null (then the type can be
 * picked first). Fields are per type, one tab per language.
 */
export function BlockEditor({
  lessonId,
  block,
  images,
  captions,
  onDone,
}: {
  lessonId: string;
  block: { id: string; type: BlockType; content: unknown } | null;
  images: string[];
  captions: string[];
  onDone?: () => void;
}) {
  const t = useTranslations("Admin.editor");
  const [type, setType] = useState<BlockType>(block?.type ?? "rich_text");
  const [state, action] = useActionState(
    async (prev: FormState, data: FormData) => {
      const next = await saveBlockFields(prev, data);
      if (next.status === "saved" && !block) onDone?.();
      return next;
    },
    idle,
  );
  const content = (block?.content ?? {}) as Record<string, Content>;
  const filled = Object.fromEntries(
    COURSE_LOCALES.map((l) => [l, Boolean(content[l])]),
  );
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="type" value={type} />
      {block ? <input type="hidden" name="id" value={block.id} /> : null}
      {!block ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">
            {t("chooseType")}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {BLOCK_TYPES.map((bt) => (
              <button
                key={bt}
                type="button"
                aria-pressed={type === bt}
                onClick={() => setType(bt)}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-md border p-3 text-left transition-colors",
                  type === bt
                    ? "border-primary bg-accent"
                    : "hover:bg-muted/50",
                )}
              >
                <span className="text-sm font-medium">{t(`types.${bt}`)}</span>
                <span className="text-xs text-muted-foreground">
                  {t(`typeHints.${bt}`)}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
      <AiTranslate />
      <LocaleTabs
        key={type}
        filled={filled}
        render={(l) => (
          <BlockFields
            type={type}
            l={l}
            c={content[l]}
            images={images}
            captions={captions}
          />
        )}
      />
      <div className="flex flex-wrap items-center gap-3">
        <SaveButton label={block ? undefined : t("createBlock")} />
        {onDone ? (
          <AdminButton type="button" variant="ghost" size="sm" onClick={onDone}>
            {t("cancel")}
          </AdminButton>
        ) : null}
        <Status state={state} />
      </div>
    </form>
  );
}

/** "Add a block" button that opens a new-block editor in place. */
export function AddBlock(props: {
  lessonId: string;
  images: string[];
  captions: string[];
}) {
  const t = useTranslations("Admin.editor");
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <AdminButton
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <PlusIcon aria-hidden />
        {t("addBlock")}
      </AdminButton>
    );
  }
  return (
    <div className="rounded-lg border border-dashed border-primary/60 bg-card p-4">
      <BlockEditor {...props} block={null} onDone={() => setOpen(false)} />
    </div>
  );
}

/** Opens a block's editor under its preview. */
export function EditToggle({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const t = useTranslations("Admin.editor");
  const [open, setOpen] = useState(false);
  return (
    <>
      <AdminButton
        type="button"
        variant={open ? "secondary" : "outline"}
        size="xs"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? t("cancel") : label}
      </AdminButton>
      {open ? <div className="order-last basis-full">{children}</div> : null}
    </>
  );
}

/** A submit button that asks first. */
export function ConfirmSubmit({
  label,
  question,
  size = "xs",
}: {
  label: string;
  question: string;
  size?: "xs" | "sm";
}) {
  return (
    <AdminButton
      type="submit"
      size={size}
      variant={size === "sm" ? "destructive-outline" : "destructive-ghost"}
      onClick={(e) => {
        if (!window.confirm(question)) e.preventDefault();
      }}
    >
      {label}
    </AdminButton>
  );
}
