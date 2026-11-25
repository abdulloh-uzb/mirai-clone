# Plan 03: Portal dashboard and course player

**Goal:** `.scratch/lms/issues/03-portal-and-player.md` — spec §6 Portal (dashboard, nav) and §7 course engine minus quizzes/identity/exam. Read `.scratch/lms/spec.md` first.

Builds on: ticket 01 (`src/lib/course/blocks.ts`: `parseBlockContent`, block types; seeded lessons), ticket 02 (`has_driver_details(enrollment_id)`, `/portal/details/[enrollmentId]`), ticket 06 (enrollments exist via mock checkout; `src/app/[locale]/portal/page.tsx` already shows the purchase panel / payment pending — keep those branches, replace only the "has enrollment" branch).

## Data — migration `course_progress`

- `lesson_progress`: add `last_heartbeat_at timestamptz`, `last_block_position integer not null default 0`.
- `public.section_unlocked(p_enrollment_id uuid, p_section_position int) returns boolean` (security definer, stable): position 1 → true; else every lesson of every earlier section has `completed_at`. **Ticket 04 will redefine this** to also require the earlier section's quiz passed — keep it a single function so that's a one-place change.
- `public.lesson_unlocked(p_enrollment_id, p_lesson_id) returns boolean`: its section is unlocked and all earlier lessons in the same section are completed.
- `public.assert_enrollment_usable(p_enrollment_id) returns public.enrollments` (internal helper, not granted): owned by `auth.uid()`; `status = 'active'` else raise `enrollment_not_active` (42501); `expires_at < now()` → set status `expired` and raise `enrollment_expired`; `has_driver_details` false → raise `details_required`.
- `public.record_lesson_time(p_enrollment_id uuid, p_lesson_id uuid, p_seconds int, p_block_position int) returns integer` (security definer, granted to `authenticated`): asserts usable + `lesson_unlocked`; sets `enrollments.started_at` if null; upserts `lesson_progress`; credit = `least(p_seconds, 30, extract(epoch from now() - coalesce(last_heartbeat_at, now() - interval '30 seconds'))::int + 5)` clamped ≥ 0; adds credit to `seconds_spent`; updates `last_heartbeat_at = now()`, `last_block_position = greatest(...)`. Returns new `seconds_spent`.
- `public.complete_lesson(p_enrollment_id, p_lesson_id) returns void`: usable + unlocked + `seconds_spent >= lessons.min_seconds` else raise `min_time_not_met`; sets `completed_at` once.
- Regenerate types.

## Files

- `src/lib/course/outline.ts` (pure): `computeOutline({ sections, lessons, progress, passedQuizSectionIds? })` → sections with `status: "locked" | "available" | "completed"`, lessons with status, seconds, min; `nextLesson(outline)`; `progressPct(outline)`. Mirrors the SQL rules (quiz rule optional so ticket 04 can pass it in).
- `src/lib/course/access.ts` (pure): `daysLeft(expiresAt, now)`, `accessBanner(daysLeft)` → `14 | 7 | 1 | null` (≤1 → 1, ≤7 → 7, ≤14 → 14), `dueDateWarning(courtDueDate, now)` → `"overdue" | "soon" (≤ 7 days) | null`.
- `src/lib/course/active-time.ts` (pure): `isActive(now, lastInputAt, visible)` — visible and `now - lastInputAt <= 120_000`.
- `src/lib/portal/enrollment.ts` (server-only, user client): `getCurrentEnrollment()` (latest non-refunded own enrollment), `getCourseOutline(enrollmentId)` (sections/lessons public; own `lesson_progress`), `getLesson(enrollmentId, sectionPosition, lessonPosition)` → lesson + blocks (RLS "enrolled read") parsed with `parseBlockContent(type, content, enrollment.course_locale)`.
- `src/lib/portal/progress-actions.ts` (`"use server"`): `recordLessonTime(enrollmentId, lessonId, seconds, blockPosition)`, `completeLesson(enrollmentId, lessonId)` with Zod; map DB errors to keys.
- `src/app/api/portal/progress/route.ts`: `POST` JSON body (same Zod) → `record_lesson_time` with the cookie client; for `navigator.sendBeacon` on tab close/`pagehide`.
- `src/components/portal/portal-nav.tsx` + `src/app/[locale]/portal/layout.tsx`: nav row under the site header: My course (`/portal`) · Account (`/portal/profile`) · Certificates (`/portal/certificates`) · Questions and answers (`/faq`) · Ask AI (button with `data-open-ai` / dispatches `window` event `open-ai-assistant`; ticket 12 listens). Active state with `aria-current`. Mobile: horizontal scroll.
- `src/app/[locale]/portal/page.tsx` enrolled branch → `src/components/portal/dashboard.tsx`: progress ring (SVG, `aria-label` with %), current section title, "Continue" (→ details page if `!has_driver_details`, else next lesson URL), days left of 90 + access banner, court due date countdown + warning, reporting status placeholder text ("Reported after you pass", ticket 09 replaces), course language. Status `paused` → "Paused for review — contact support"; `locked`/`expired` → explanation.
- `src/app/[locale]/portal/course/[enrollmentId]/[section]/page.tsx`: `section` = position (1–8). Redirect to details if missing, to `/portal` if section locked. Left: section list with lock icons (outline); main: lesson by `?lesson=<position>` (default first incomplete). Renders blocks via `src/components/course/blocks/*` and the lesson footer. Section's last lesson completed → "Take the section quiz" link to `/portal/course/<id>/<section>/quiz` (ticket 04 builds it; render the link only, it 404s until then) — **and** a "Next section" link when the next section is unlocked.
- `src/components/course/blocks/` (client where interactive): `rich-text.tsx` (reuse `src/components/content/markdown.tsx`), `image.tsx` (`next/image` with alt), `video.tsx` (`<video>` with `<track kind="captions">` if `src`, else a card with title + expandable transcript), `callout.tsx`, `flip-card.tsx` (button, `aria-pressed`, keyboard), `scenario.tsx` (radio group → feedback), `drag-to-order.tsx` (deterministic shuffle by block id; reorder with drag **and** up/down buttons for keyboard; "Check order"). `block-renderer.tsx` switches on type. All usable at 375 px.
- `src/components/course/lesson-timer.tsx` (client): uses `isActive`; tracks input events; every 15 s of active time calls `recordLessonTime`; on block scroll-into-view (IntersectionObserver) records `blockPosition`; `pagehide`/`visibilitychange→hidden` → `sendBeacon('/api/portal/progress', …)`. Shows "Next unlocks in m:ss" and enables Next when `seconds >= min`; Next → `completeLesson` → next lesson / section page.
- `messages/*.json`: `Dashboard`, `Player`, `PortalNav`.

## Test slices

1. Unit: `outline.test.ts` (order rules, next lesson, pct), `access.test.ts` (banners 14/7/1, due-date warning), `active-time.test.ts`.
2. DB `tests/db/course-progress.db.test.ts` (enrollment + details created via service client; call `save_driver_details` as the student or set fields with service client): `record_lesson_time` rejected without details; rejected for a locked lesson (lesson 2 before lesson 1 done; section 2 before section 1 done); credit capped at 30 per call and by elapsed time (two immediate calls ≠ 60 s); `complete_lesson` fails before `min_seconds`, succeeds after (set `seconds_spent` via service client to simulate time); expired enrollment rejected and marked `expired`; another student cannot record time on someone else's enrollment.

## Risks

- Minimum time is enforced in SQL, not only the UI. Never trust the client's `seconds` beyond the cap.
- Blocks render in the **Course language**, chrome in the UI language.
- `lesson_blocks` must only be read with the user's client (RLS enrolled read), never the service client.
