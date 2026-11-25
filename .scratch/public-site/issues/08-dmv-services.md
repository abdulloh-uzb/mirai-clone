# 08: DMV services

**What to build:** `/dmv-services`, a hub of scenario tiles linking to official dmv.ca.gov pages, with client-side search and a "not affiliated with the DMV" notice near the top. Copy lives in messages. See `.scratch/public-site/spec.md` (Pages).

**Blocked by:** 01

**Status:** ready-for-agent

- [x] About 20 tiles in groups (moving to CA, renewals, REAL ID, buying or selling a vehicle, replacing documents, checking status or paying), each with title, short text, keywords and an official dmv.ca.gov URL, in 4 languages
- [x] Notice near the top; links open in a new tab with an accessible "opens in a new tab" label
- [x] Client-side search over title and keywords; full list without JavaScript
- [x] Metadata; sitemap entry
- [x] E2E: renders in en + one other; search filters; mobile; axe clean
- [x] `pnpm check:locked` passes
