# 05 Final exam

**Status:** resolved
**Blocked by:** 04
**Plan:** `.scratch/lms/plans/05-final-exam.md`

Spec §7 final exam: unlock rules, confirm-details screen, 25 random questions, 70%, 2 attempts with different questions, lock after 2 fails, no feedback during, review only after pass, server grading, one active exam session, details lock on start.

- [x] Exam RPCs (start/submit) enforce all rules
- [x] DB test: correct answers never returned before submit
- [x] Exam UI

## Comments

- Landed on `lms` (feature a15f368). Unit 216 pass, final-exam + quizzes DB 10 pass. TODO(spec): 60-min limit. Dashboard/section links to exam still missing (follow-up).
