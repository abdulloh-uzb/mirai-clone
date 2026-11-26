# 16 Admin UI in four languages

**Status:** ready-for-agent
**Blocked by:** 11

Admin pages (tickets 10, 11, 09 reporting) use hard-coded English in places. Move all admin UI strings to `messages/*.json` (`Admin.*` namespaces) with ja/es/ru translations; `tests/unit/messages.test.ts` parity must pass. No behaviour changes.

- [ ] No hard-coded user-visible English in src/app/[locale]/admin/** and src/components/admin/**
