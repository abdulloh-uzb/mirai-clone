# Plan 04: Section quizzes and identity checks

**Goal:** `.scratch/lms/issues/04-quizzes-identity.md` (spec §7 "Section quiz", "Identity checks"). Read `.scratch/lms/spec.md` (decisions 6, 7).

Builds on ticket 03 (`section_unlocked`, `assert_enrollment_usable`, outline, section page) and ticket 02 (`security_questions` with bcrypt `answer_hash`, profile `dob`, `license_no`).

## Data — migration `quizzes_identity`

Quizzes:
- `public.start_quiz(p_enrollment_id uuid, p_section_position int) returns jsonb` (security definer, `authenticated`): usable; all lessons of the section completed (else `lessons_incomplete`). If an unsubmitted attempt for that section exists, return it (same questions). Else pick `n = 8` (TODO(spec): 5–10, pick 8) random questions with `section_id` = that section and `locale = enrollment.course_locale` (`order by random()`), insert `quiz_attempts` (`question_ids`), and return `{ attemptId, questions: [{ id, text, options: [{ id, text }] }] }` — options in random order, **no `is_correct`, no explanation**.
- `public.submit_quiz(p_attempt_id uuid, p_answers jsonb) returns jsonb` (`{ "<questionId>": "<optionId>" }`): own, unsubmitted attempt; grade server-side; `score` = correct count, `passed = score * 100 >= n * states.pass_pct`; sets `answers`, `submitted_at`. Returns `{ score, total, passed, results: [{ questionId, chosenOptionId, correctOptionId, correct, explanation }] }` (explanations after answering is allowed by spec).
- Redefine `public.section_unlocked`: earlier sections' lessons all completed **and** a passed `quiz_attempts` row exists for each earlier section.
- `public.section_quiz_passed(p_enrollment_id, p_section_position) returns boolean` helper (used by exam unlock in 05).

Identity checks:
- `public.identity_check_due(p_enrollment_id) returns jsonb | null` (security definer): plan of 4 checks per enrollment (TODO(spec): 3–5 → 4), due when the count of completed lessons reaches 3, 9, 15, 21 and fewer checks than that milestone index have been asked. Returns `{ questionKey, prompt }` where `questionKey` ∈ `dob` | `license_last4` | `security_question` (rotate; `security_question` returns the question key so the UI can show its translated text). Never returns the answer.
- `public.answer_identity_check(p_enrollment_id uuid, p_question_key text, p_answer text) returns jsonb`: compares (dob as `YYYY-MM-DD`; license last 4 case-insensitive; security answer via `extensions.crypt(lower(trim(answer)), answer_hash) = answer_hash`); inserts `identity_checks`; if this and the previous check are both wrong → enrollment `status = 'paused'`; returns `{ correct, paused }`. A wrong answer asks again (the next due call returns a check until one is answered correctly for that milestone).
- `record_lesson_time`/`complete_lesson` (ticket 03): add a guard — if `identity_check_due` is not null, raise `identity_check_required` (redefine via `create or replace`, keeping everything else).

## Files

- `src/lib/course/quiz.ts` (pure): `type QuizQuestion = { id; text; options: {id; text}[] }` (asserted to have no `isCorrect` key — add a Zod schema with `.strict()` used to parse the RPC output before it goes to the client), `allAnswered(questions, answers)`.
- `src/lib/portal/quiz-actions.ts` (`"use server"`): `startQuiz(enrollmentId, section)`, `submitQuiz(attemptId, answers)`.
- `src/app/[locale]/portal/course/[enrollmentId]/[section]/quiz/page.tsx` + `src/components/course/quiz-runner.tsx` (client): one question per screen or all on one page (pick all on one page with fieldsets + radio groups, accessible), submit enabled when all answered, results with per-question correct/incorrect + explanation, "Try again (new questions)" on fail, "Continue to section N+1" on pass. Section 8's quiz pass → "Go to the final exam" link (`/portal/exam/<id>`).
- `src/lib/portal/identity-actions.ts` + `src/components/course/identity-check-dialog.tsx`: the lesson page (ticket 03) asks `identity_check_due` on load; if due, a modal (non-dismissable) asks the question (DOB date input / last-4 input / security question text field); wrong → "That doesn't match" + next question; paused → message + link to contact.
- Update `computeOutline` call sites to pass `passedQuizSectionIds`; section page shows quiz status.
- `messages/*.json`: `Quiz`, `IdentityCheck`.

## Test slices

1. Unit: `quiz.ts` strict schema rejects an option with `is_correct`/`isCorrect`; `allAnswered`.
2. DB `tests/db/quizzes.db.test.ts`: start before lessons done → error; start returns 8 questions in course language with no correctness fields anywhere in the JSON; restarting returns the same attempt; submit grades correctly (build answers from `answer_options` via service client); pass at ≥70%; retry gives a new attempt; section 2 unlocked only after section 1 quiz passed; another student cannot submit someone's attempt; `quiz_attempts` unsubmitted not readable by the student via REST.
3. DB `tests/db/identity-checks.db.test.ts`: due after 3 completed lessons; correct dob answer clears it; two wrong in a row pauses enrollment and further `record_lesson_time` fails; security answer compared via hash; rows logged.

## Risks

- Correct options must never appear in `start_quiz` output (spec rule; tested).
- Pausing must block progress server-side, not just the UI.
