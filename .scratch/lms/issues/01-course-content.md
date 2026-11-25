# 01 Course content seed

**Status:** resolved
**Blocked by:** none
**Plan:** `.scratch/lms/plans/01-course-content.md`

Seed original course content (spec §7): 8 sections × 3 lessons, blocks of every type, per-locale content in en/ja/es/ru, section quiz pools and the final exam pool.

- [x] Lessons + blocks in 4 languages
- [x] Quiz pool ≥ 10 questions per section per language, exam pool ≥ 60 per language
- [x] CA min_course_minutes matches lesson minimums
- [x] DB test: counts, every block type present, each question has exactly one correct option

## Comments

- Landed on `lms` (feature 9db0359). Unit 168 pass, course-content DB 6 pass. Exam pool 60/locale.
