# 04 Section quizzes and identity checks

**Status:** resolved
**Blocked by:** 03
**Plan:** `.scratch/lms/plans/04-quizzes-identity.md`

Spec §7: section quiz (5–10 random, 70%, unlimited retries, explanations after answering), identity checks (3–5 during course, 2 wrong in a row pauses the enrollment, logged).

- [x] Server-graded quiz, answers never sent before submit
- [x] Identity checks + pause

## Comments

- Landed on `lms` (merge 79af421). Unit 211 pass, quiz/identity/progress DB 15 pass. 8 quiz questions, 4 identity checks (TODO(spec)). Test helper tests/support/course.ts.
