# Plan 12: AI assistant

**Goal:** `.scratch/lms/issues/12-ai-assistant.md` (spec §10, §17 AI item). Read `.scratch/lms/spec.md` decision 2 (offline responder, full-text retrieval).

Builds on 13 (help widget shell dispatching `open-ai-assistant`; portal nav "Ask AI" dispatches the same event), 05 (`isExamPath`, active exam), 07 (`calculateRefund`, `refund_facts`), 09 (report statuses).

## Dependencies
`pnpm add ai @ai-sdk/anthropic @ai-sdk/react` (latest).

## Data — migration `ai_assistant`
- `kb_chunks`: add `title text`, `url text`, `fts tsvector generated always as (to_tsvector('simple', coalesce(title,'') || ' ' || content)) stored` + GIN index; `public.search_kb(p_query text, p_locale text, p_limit int)` (security definer, service role only) → rows ranked by `ts_rank` using `websearch_to_tsquery('simple', p_query)`, preferring `p_locale`, falling back to `en`.
- `ai_conversations`: add `ip_hash text`, `flagged boolean default false`, `handed_off_at timestamptz`, `page text`. `ai_messages`: add `tokens_in int`, `tokens_out int`, `cost_usd numeric(10,6)`, `flagged boolean default false`.
- `public.ai_usage_daily` view (admin read via function) — sum cost per day.

## Files
- `src/lib/ai/kb/index.ts` (server-only): `reindexKnowledgeBase()` — deletes and rebuilds `kb_chunks` from published `faq_items`, `pages` (school-rules, refund-policy, terms, privacy), `posts`, `counties` (+ courthouses: instructions per locale) — chunk to ~800 chars, `url` = public path with locale prefix. `scripts/reindex-kb.ts` + `"ai:reindex"` script; also call it at the end of `supabase/seed`? No — run from the admin "Re-index" button (ticket 11 AI page calls it) and lazily: if `kb_chunks` is empty on first chat, reindex.
- `src/lib/ai/tools.ts` (server-only, uses the **user's** Supabase client so RLS scopes everything): `getMyEnrollment`, `getMyReportStatus`, `getMyRefundEligibility`, `getMyCourtDeadline`. Each returns `{ enrolled: false }` when the user has no enrollment, so the model/offline responder says "you have not enrolled yet". Visitors get no tools.
- `src/lib/ai/guardrails.ts` (pure): `detectIntent(text, locale)` → `"report_status" | "enrollment" | "refund" | "deadline" | "exam_answers" | "legal_advice" | null` by keyword lists in en/ja/es/ru (e.g. "DMV", "completion", "reported", "получил", "DMV に", "recibió"); `refusalFor(intent, locale)` for `exam_answers` / `legal_advice`; system prompt builder `systemPrompt({ locale, signedIn, page })` (answer in the user's language, educational only, cite official dmv.ca.gov, no legal advice, refuse exam answers, never claim access to the question bank, use tools for account questions).
- `src/lib/ai/offline.ts` (pure + injected deps): `offlineAnswer({ text, locale, tools, search })` — intent → tool → templated sentence in the locale (e.g. report accepted: "Yes — the DMV confirmed your completion on {date}."; not enrolled: "You have not enrolled yet…"); else top KB chunk excerpt + link; else "I'm not sure — talk to a person".
- `src/app/api/ai/chat/route.ts` (`POST`, nodejs runtime): Zod body `{ conversationId?, messages (last 20, each ≤ 2000 chars), locale, page }`. Rate limit via `hit_rate_limit` per IP (20/10 min) and per user (60/10 min). **Disabled during an active exam**: if signed in and the user has an unsubmitted, unexpired `exam_attempts` row → 423 with a localized message. Guardrail intents short-circuit. Retrieval via `search_kb` → context. With `AI_API_KEY`: `streamText({ model: anthropic(AI_MODEL ?? 'claude-haiku-5-5'), system, messages, tools (signed-in only, AI SDK `tool()` with zod input schemas), stopWhen: stepCountIs(4) })` → `toUIMessageStreamResponse()`; on finish log messages + usage/cost (rough $ per token constants, `TODO(spec)`). Without key: stream the `offlineAnswer` text as a UI message stream (`createUIMessageStream` / `createUIMessageStreamResponse`) so the client code is the same. Create/continue `ai_conversations` (service client; user_id or null + ip hash), store user + assistant messages.
- `src/app/api/ai/handoff/route.ts` (`POST` `{ conversationId, email?, note? }`): creates a `tickets` row type `ai_handoff` with the transcript in `body` (email from account or required for visitors), sets `handed_off_at`.
- `src/components/ai/assistant-panel.tsx` (client, `useChat` from `@ai-sdk/react` with `DefaultChatTransport({ api: '/api/ai/chat', body: { locale, page } })`): right side Sheet (`src/components/ui/sheet.tsx`) opened by the `open-ai-assistant` window event; title, language picker (4 languages, defaults to UI language), reset (new chat), minimize; "Watch the tour" card (placeholder, original); 3–4 **page-aware suggested questions** from `src/lib/ai/suggestions.ts` (pure: by pathname — home, courses, courts/[slug], faq, portal, portal/status, portal/orders, default; texts in messages); disclaimer "Educational only · Official info: dmv.ca.gov · AI can make mistakes. Not legal advice."; "Talk to a person" (→ handoff form inline); input; streaming messages with `aria-live="polite"`. Hidden and refuses to open on `/portal/exam/*` (`isExamPath`).
- Mount the panel once in `src/app/[locale]/layout.tsx` next to the widget shell.
- `messages/*.json`: `Assistant`.

## Test slices
1. Unit: `detectIntent` (each language, "Did the DMV get my completion?" → report_status in en/es/ru/ja), `offlineAnswer` (accepted status → mentions confirmed; `{enrolled:false}` → "not enrolled"; exam_answers → refusal), `suggestions` by path.
2. DB `tests/db/ai-tools.db.test.ts`: tools with a student client: not enrolled → `{enrolled:false}`; enrolled with an accepted report → status accepted; another student's data never visible; `search_kb` returns chunks after reindex (call `reindexKnowledgeBase` via relative import) and is not executable by `authenticated`.
3. Route unit test optional.

## Risks
- §17: real status for enrolled users, "no enrollment" for others — tested via tools + offline responder.
- Never pass question bank data into prompts or tools; never use the service client inside account tools.
- Disabled during an active exam on the server, not only hidden.
