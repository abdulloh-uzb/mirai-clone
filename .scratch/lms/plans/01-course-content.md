# Plan 01: Course content seed

**Goal:** `.scratch/lms/issues/01-course-content.md` — original course content for the 8 seeded sections, in en/ja/es/ru, plus quiz and exam question pools. Read `.scratch/lms/spec.md` first (decision 9).

## Files

- `src/lib/course/blocks.ts` (new, pure, shared by seed generator and the player in ticket 03): Zod schemas + TS types for each block's per-language content. `lesson_blocks.content` is `{ "en": <BlockContent>, "ja": ..., "es": ..., "ru": ... }`. Shapes:
  - `rich_text`: `{ markdown: string }`
  - `image`: `{ src: string, alt: string, caption?: string }` — `src` under `/placeholder/course/…svg`
  - `video`: `{ title: string, src?: string, captionsSrc: string, transcript: string }` — no real video yet: `src` omitted, `captionsSrc` points at a WebVTT file under `/placeholder/course/captions/<slug>.<lang>.vtt`. `TODO(spec)`: real videos.
  - `callout`: `{ tone: "info" | "tip" | "warning", title: string, markdown: string }`
  - `flip_card`: `{ front: string, back: string }`
  - `scenario`: `{ prompt: string, choices: { text: string, feedback: string, best: boolean }[] }` (exactly one `best`; practice only, not graded)
  - `drag_to_order`: `{ prompt: string, items: string[] }` (items in the correct order; the player shuffles)
  - Export `blockContentSchema(type)` and `parseBlockContent(type, content, locale)` that returns the locale's content, falling back to `en`.
- `scripts/course-content/` (new): TypeScript source of the content, one file per section (`section-1.ts` … `section-8.ts`) exporting `{ position, lessons: [{ position, minSeconds: 60, title: {en,ja,es,ru}, blocks: [{ type, content: {en,ja,es,ru} }] }], quiz: Question[] }` and `exam.ts` exporting the exam pool. `Question = { key: string, text: Record<Locale,string>, explanation: Record<Locale,string>, options: { text: Record<Locale,string>, correct: boolean }[] }` (4 options, exactly one correct).
- `scripts/generate-course-seed.ts` (new, run with `tsx`): validates everything with the Zod schemas (every locale present, exactly one correct option, one `best` scenario choice) and writes `supabase/seed/course.sql`. Add `"db:seed:course": "tsx scripts/generate-course-seed.ts"` to package.json. Commit the generated SQL.
- `supabase/seed/course.sql` (generated): looks up section ids by `(course slug 'california-traffic-violator-course', position)`; inserts lessons, lesson_blocks, questions (one row per locale per question; `section_id` null for exam pool), answer_options; then `update public.states set min_course_minutes = <sum of minSeconds/60> where code = 'CA'`. Use dollar-quoting (`$q$...$q$`) or proper escaping for text. Seed files run alphabetically after `seed.sql` (see `supabase/config.toml`), so sections exist.
- `public/placeholder/course/*.svg` (new, original simple illustrations, a few only, e.g. `intersection.svg`, `following-distance.svg`, `tire-check.svg`) and the VTT caption files.

## Content

- 3 lessons per section, each 3–5 blocks. Across the course every block type appears at least once; each section has at least one interactive block (flip card, scenario or drag-to-order).
- Original, factual-sounding but generic California driving safety content (right-of-way, 3-second following distance, school zones 25 mph, phone hands-free law, DUI risks, tire tread, etc.). Short: this is a demo. Don't copy any third-party course text.
- Quiz pool: **10 questions per section**. Exam pool: **50 questions** (so attempt 2 can use 25 different ones). Each question exists in all 4 languages (one `questions` row per locale; the same `key` order across locales).
- Translations: write natural ja/es/ru versions (machine-quality is acceptable for the demo).

## Test slices

1. Unit `src/lib/course/blocks.test.ts`: each schema accepts a valid sample and rejects a bad one; `parseBlockContent` falls back to `en`.
2. Unit `scripts/course-content/content.test.ts` (add the path to the vitest `unit` project include if needed): every section has 3 lessons; all 7 block types used; every block has 4 locales; 10 quiz questions per section, 50 exam questions; exactly one correct option each.
3. DB `tests/db/course-content.db.test.ts` (after `scripts/with-stack-lock.sh 'pnpm db:reset'`): 24 lessons, 8×10×4 section questions, 50×4 exam questions, every question has exactly one correct option, CA `min_course_minutes` = 24.

## Risks

- `answer_options` must stay unreadable by clients (no grants change here).
- Generated SQL must be deterministic (no random ids) so re-running the generator makes no diff.
- Keep the file sizes reasonable; the seed must run inside `pnpm db:reset`.
