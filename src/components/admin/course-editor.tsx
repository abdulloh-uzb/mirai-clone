"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? t("saving") : (label ?? t("save"))}
    </Button>
  );
}

function Status({ state }: { state: FormState }) {
  const t = useTranslations("Admin.editor");
  if (state.status === "saved") {
    return (
      <span role="status" className="text-sm font-bold text-green-ink">
        ✓ {t("saved")}
      </span>
    );
  }
  if (state.status === "error") {
    const key = `errors.${state.error}`;
    return (
      <span role="alert" className="text-sm font-bold text-alert">
        {t.has(key as never) ? t(key as never) : state.error}
      </span>
    );
  }
  return null;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[15px] font-bold">{label}</span>
      {children}
      {hint ? (
        <span className="text-sm text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
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
        className="flex flex-wrap gap-1 border-b border-line-blue"
      >
        {COURSE_LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={active === l}
            onClick={() => setActive(l)}
            className={cn(
              "-mb-px flex items-center gap-2 rounded-t-[12px] border border-b-0 px-3 py-2 text-sm font-bold",
              active === l
                ? "border-line-blue bg-card text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
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
                "size-2 rounded-full",
                filled[l] ? "bg-brand-green" : "bg-alert-line",
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
          <Field
            key={l}
            label={t("titleIn", { locale: LOCALE_NAMES[l] })}
            hint={l === "en" ? t("titleHintRequired") : undefined}
          >
            <Input
              name={`title_${l}`}
              defaultValue={titles[l] ?? ""}
              required={l === "en"}
            />
          </Field>
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
        <Field label={t("sectionField")}>
          <Select name="sectionId" defaultValue={lesson.sectionId}>
            {sections.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("position")}>
          <Input
            name="position"
            type="number"
            min={1}
            defaultValue={lesson.position}
            required
          />
        </Field>
        <Field label={t("minMinutes")} hint={t("minMinutesHint")}>
          <Input
            name="minMinutes"
            type="number"
            min={0}
            step="0.5"
            defaultValue={lesson.minSeconds / 60}
            required
          />
        </Field>
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
        <Field label={t("markdown")} hint={t("markdownHint")}>
          <Textarea
            name={n("markdown")}
            rows={8}
            defaultValue={s(c, "markdown")}
          />
        </Field>
      );
    case "image":
      return (
        <>
          <Field label={t("src")}>
            <Select name={n("src")} defaultValue={s(c, "src") || images[0]}>
              {images.map((src) => (
                <option key={src} value={src}>
                  {src.split("/").pop()}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("alt")} hint={t("altHint")}>
            <Input name={n("alt")} defaultValue={s(c, "alt")} />
          </Field>
          <Field label={t("caption")}>
            <Input name={n("caption")} defaultValue={s(c, "caption")} />
          </Field>
        </>
      );
    case "video": {
      const own = captions.filter((p) => p.endsWith(`.${l}.vtt`));
      return (
        <>
          <Field label={t("videoTitle")}>
            <Input name={n("title")} defaultValue={s(c, "title")} />
          </Field>
          <Field label={t("videoSrc")}>
            <Input name={n("src")} defaultValue={s(c, "src")} />
          </Field>
          <Field label={t("captionsSrc")}>
            <Select
              name={n("captionsSrc")}
              defaultValue={s(c, "captionsSrc") || own[0] || captions[0]}
            >
              {(own.length ? own : captions).map((src) => (
                <option key={src} value={src}>
                  {src.split("/").pop()}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("transcript")}>
            <Textarea
              name={n("transcript")}
              rows={6}
              defaultValue={s(c, "transcript")}
            />
          </Field>
        </>
      );
    }
    case "callout":
      return (
        <>
          <Field label={t("tone")}>
            <Select name={n("tone")} defaultValue={s(c, "tone") || "info"}>
              {(["info", "tip", "warning"] as const).map((tone) => (
                <option key={tone} value={tone}>
                  {t(`tones.${tone}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("calloutTitle")}>
            <Input name={n("title")} defaultValue={s(c, "title")} />
          </Field>
          <Field label={t("markdown")} hint={t("markdownHint")}>
            <Textarea
              name={n("markdown")}
              rows={4}
              defaultValue={s(c, "markdown")}
            />
          </Field>
        </>
      );
    case "flip_card":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("front")}>
            <Textarea name={n("front")} rows={4} defaultValue={s(c, "front")} />
          </Field>
          <Field label={t("back")}>
            <Textarea name={n("back")} rows={4} defaultValue={s(c, "back")} />
          </Field>
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
          <Field label={t("prompt")}>
            <Textarea
              name={n("prompt")}
              rows={3}
              defaultValue={s(c, "prompt")}
            />
          </Field>
          {Array.from({ length: SCENARIO_ROWS }, (_, i) => (
            <fieldset
              key={i}
              className="grid gap-3 rounded-[14px] border border-line-blue p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <legend className="px-1 text-sm font-bold">
                {t("choice", { n: i + 1 })}
              </legend>
              <Field label={t("choiceText")}>
                <Input
                  name={n(`choice${i}.text`)}
                  defaultValue={s(choices[i], "text")}
                />
              </Field>
              <Field label={t("feedback")}>
                <Input
                  name={n(`choice${i}.feedback`)}
                  defaultValue={s(choices[i], "feedback")}
                />
              </Field>
              <label className="flex items-center gap-2 self-end pb-3 text-sm font-bold">
                <input
                  type="radio"
                  name={n("best")}
                  value={String(i)}
                  defaultChecked={i === bestIndex}
                  className="size-4"
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
          <Field label={t("prompt")}>
            <Input name={n("prompt")} defaultValue={s(c, "prompt")} />
          </Field>
          <Field label={t("items")} hint={t("itemsHint")}>
            <Textarea
              name={n("items")}
              rows={6}
              defaultValue={items.join("\n")}
            />
          </Field>
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
          <legend className="mb-2 text-[15px] font-bold">
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
                  "flex flex-col items-start gap-0.5 rounded-[14px] border-2 p-3 text-left",
                  type === bt
                    ? "border-primary bg-blue-tint"
                    : "border-line-blue hover:border-primary/60",
                )}
              >
                <span className="font-bold">{t(`types.${bt}`)}</span>
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
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            {t("cancel")}
          </Button>
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
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        + {t("addBlock")}
      </Button>
    );
  }
  return (
    <div className="rounded-[22px] border-2 border-dashed border-primary p-5">
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
      <Button
        type="button"
        variant={open ? "secondary" : "outline"}
        size="xs"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? t("cancel") : label}
      </Button>
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
    <Button
      type="submit"
      variant="ghost"
      size={size}
      className="text-alert hover:bg-alert-bg"
      onClick={(e) => {
        if (!window.confirm(question)) e.preventDefault();
      }}
    >
      {label}
    </Button>
  );
}
