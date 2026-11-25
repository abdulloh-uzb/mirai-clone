-- FAQ categories and featured flag (public-site ticket 03).
-- TODO(spec): spec.md says "9 categories" but lists 10 groups; all 10 are used.
-- Keep this list in sync with FAQ_CATEGORIES in src/lib/faq/categories.ts.

alter table public.faq_items
  add column category text not null default 'about'
    check (category in (
      'about', 'course', 'exam', 'certificates', 'payments',
      'eligibility', 'language', 'ai', 'classroom', 'contact'
    )),
  add column featured boolean not null default false;

-- No row should rely on a default category: every item names its own.
alter table public.faq_items alter column category drop default;

create index faq_items_locale_category_position_idx
  on public.faq_items (locale, category, position);
