# 0004: Translations are linked by one shared English slug

**Status:** accepted (2026-11-25, phase 2)

## Context

Content tables (`faq_items`, `pages`, `posts`, `changelog`, `reviews`) store one row per UI language with `unique (locale, slug)`. Hreflang, the language switcher and the English fallback all need to know which rows are versions of the same item. A separate `translation_group_id` column, or per-language slugs, were the alternatives.

## Decision

Rows with the same slug are Translations of one item, and slugs are always English (e.g. `/ru/blog/how-traffic-school-works`). When the requested language has no row, the page shows the English row with a "not yet translated" notice and its canonical URL points to the English page, so search engines never index the duplicate.

## Consequences

- Renaming a slug means renaming it in every language at once (admin does this in phase 5).
- Non-English URLs are not localised. That is accepted for a demo; changing it later would need a group id and redirects.
