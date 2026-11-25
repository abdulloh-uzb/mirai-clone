# Plan 05: Final exam

**Goal:** `.scratch/lms/issues/05-final-exam.md` (spec §7 "Final exam", §17 exam items). Read `.scratch/lms/spec.md` (decisions 6, 7).

Builds on 02 (`lock_driver_details`, details page, `has_driver_details`), 03 (`assert_enrollment_usable`, outline), 04 (`section_quiz_passed`).

## Data — migration `final_exam`

- `exam_attempts`: add `attempt_no int not null default 1`, `expires_at timestamptz` (start + 60 min, TODO(spec): time limit not in spec; 60 min).
- `enrollments`: add `exam_resets int not null default 0` (admin grants in ticket 10 increase allowed attempts: allowed = `states.max_attempts + exam_resets * states.max_attempts`... keep simple: allowed = `max_attempts * (1 + exam_resets)`).
- `public.exam_eligibility(p_enrollment_id) returns jsonb` (security definer, `authenticated`, own or admin): `{ eligible, reasons: [...], attemptsUsed, attemptsAllowed, minutesSpent, minutesRequired, passed }`. Reasons: `sections_incomplete` (all 8 quizzes passed), `min_time` (sum of `lesson_progress.seconds_spent` ≥ `states.min_course_minutes * 60`), `details_required`, `no_attempts_left`, `already_passed`, `not_active`.
- `public.start_exam(p_enrollment_id uuid) returns jsonb`: usable + eligible (raise the first reason). **One active exam session per user**: if any unsubmitted, unexpired attempt exists for this enrollment, return it (same questions, same order). Expired unsubmitted attempt → auto-submit (grade what's saved) before deciding. Else: call `public.lock_driver_details(auth.uid())`; pick `states.exam_questions` (25) random exam-pool questions (`section_id is null`, course locale) **excluding question ids used in this enrollment's earlier attempts** when enough remain (fill from used ones otherwise); insert attempt with `attempt_no`. Return `{ attemptId, attemptNo, expiresAt, questions: [{id, text, options:[{id,text}]}] }` — shuffled options, no correctness, no explanations.
- `public.save_exam_answer(p_attempt_id, p_question_id, p_option_id) returns void`: own, unsubmitted, unexpired; question in `question_ids`; merges into `answers`. (Autosave; no feedback.)
- `public.submit_exam(p_attempt_id) returns jsonb`: grades server-side; `passed = score * 100 >= total * pass_pct` (18/25); sets `submitted_at`, `score`, `passed`. On pass: enrollment `status = 'completed'`, `completed_at = now()`. On fail and no attempts left: enrollment `status = 'locked'`. Returns `{ score, total, passed, attemptsLeft }` only — **no per-question data**.
- `public.exam_review(p_attempt_id) returns jsonb`: only when that attempt `passed`; returns questions with chosen/correct option and explanation.
- Ticket 08 hooks certificate issuing onto a pass: expose nothing extra here, but keep the pass branch in one place (comment `-- ticket 08: certificate issued by server code after submit_exam returns passed`).
- Regenerate types.

## Files

- `src/lib/exam/exam.ts` (pure): reuse the strict question schema from `src/lib/course/quiz.ts`; `formatRemaining(ms)`.
- `src/lib/portal/exam-actions.ts` (`"use server"`): `getExamEligibility`, `startExam`, `saveExamAnswer`, `submitExam`, `getExamReview`. Rate limit `start`/`submit` via `hit_rate_limit` (`exam:user:<id>`, 20/10 min).
- `src/app/[locale]/portal/exam/[enrollmentId]/page.tsx` — states:
  1. Not eligible → checklist of reasons with links (continue course / enter details).
  2. Eligible, no active attempt → **"Confirm your details"** screen: legal name, DOB, license (masked except last 4), court county, citation, due date, with "Edit details" (→ details page `?next=` back here) and a checkbox "These are correct; I understand they lock when the exam starts" → Start button (server action `startExam`).
  3. Active attempt → `src/components/exam/exam-runner.tsx` (client): question navigator (1–25), one question per screen with radio group, autosave each choice (`saveExamAnswer`), countdown, "Submit exam" with confirm dialog listing unanswered count. No correctness feedback.
  4. Result → score, pass/fail, attempts left; on fail with attempts left: "Start attempt 2"; locked: options text ("Contact support to request a reset") ; pass: "View your answers" (review) + "Get your certificate" (→ `/portal/certificates`, ticket 08).
- Dashboard/section 8 links point here. AI widget (ticket 12) must be hidden on `/portal/exam/*` — add `data-exam-active` attribute on the page root when an attempt is running (ticket 12 reads it) and export `isExamPath(pathname)` from `src/lib/exam/exam.ts`.
- `messages/*.json`: `Exam`.

## Test slices

1. Unit: strict schema, `formatRemaining`, `isExamPath`.
2. DB `tests/db/final-exam.db.test.ts` (set up a fully completed course with service client: progress rows with `completed_at` and enough seconds, passed quiz attempts, details): not eligible before quizzes/min time; start returns 25 questions and the **serialized JSON contains no `is_correct`, no `explanation`, no option marked correct**; start locks details (`details_locked_at` set; student can no longer change legal name); calling start again returns the same attempt; save + submit with all correct → passed, enrollment completed; with 17/25 correct → failed; attempt 2 question set disjoint from attempt 1 (pool 50); 2 fails → enrollment locked and start raises; review refused for a failed attempt, allowed for passed; another student cannot read/submit the attempt; `exam_attempts` unsubmitted not readable via REST.

## Risks

- §17: correct answers never in a network response before submit — every RPC that returns questions must be tested for it.
- Grading only in SQL.
- Exam locked after 2 fails must be enforced in `start_exam`, not the UI.
