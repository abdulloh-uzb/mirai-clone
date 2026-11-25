# 12 AI assistant

**Status:** resolved
**Blocked by:** 07, 09, 13
**Plan:** `.scratch/lms/plans/12-ai-assistant.md`

Spec §10: widget panel, page-aware suggestions, streaming chat route, kb_chunks retrieval + re-index, account tools, guardrails (no exam answers, disabled during active exam), talk-to-a-person ticket with transcript, rate limits, logging, daily cost.

- [x] 'Did the DMV get my completion?' answered from real status; non-enrolled told so (unit/DB test)

## Comments

- Landed on `lms` (feature 212342e). Unit 223 pass, ai-tools DB 5 pass. Offline responder + FTS retrieval; AI SDK v7. TODO(spec): swap src/lib/ai/exam-path.ts for ticket 05 helper; cost constants; pgvector.
