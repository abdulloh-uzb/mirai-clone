# 05: The rest of the database

**What to build:** Every remaining table from section 13 of `spec.md` exists with row-level security, plus `stripe_events` and `security_questions`, so later phases build features on a reviewed structure. Seed data gives California and the course with its eight sections. Tests prove the sensitive tables are invisible to every client. See `.scratch/foundation/spec.md` (Database).

**Blocked by:** 03 (Accounts) — admin policies need `is_admin()`

**Status:** ready-for-agent

- [ ] Tables: states, state_waitlist, courts, courses, sections, lessons, lesson_blocks, questions, answer_options, orders, enrollments, lesson_progress, quiz_attempts, exam_attempts, identity_checks, security_questions, certificates, completion_reports, report_attempts, refunds, stripe_events, faq_items, pages, posts, changelog, reviews, ai_conversations, ai_messages, kb_chunks (pgvector), tickets, audit_log
- [ ] Every table: UUID primary key, created/updated timestamps via the shared trigger, RLS enabled, policies matching the access column of `spec.md` section 13; server-only tables have no client policies; answer options readable by no client role
- [ ] Do not create the driver-details lock trigger (phase 3)
- [ ] Seed: CA active (25 questions, 70%, 2 attempts, 90 days, report times 09:00/13:00/17:00), other states inactive, the one course row and its eight section titles in all four languages
- [ ] Database types regenerated and committed
- [ ] Database tests: answer options and every server-only table return nothing to Visitor, Student and Admin clients; public tables readable by a Visitor; `state_waitlist` insertable by a Visitor but not readable; a Student reads only their own orders, enrollments and certificates
- [ ] Migrations only move forward; never edit an applied migration
- [ ] `pnpm check` passes
