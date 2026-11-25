-- Blog posts belong to one of three categories (public-site ticket 05).
-- The table is empty at this point, so the column can be required straight away.
alter table public.posts
  add column category text not null
  check (category in ('traffic-school', 'california-driving', 'after-your-ticket'));

create index posts_locale_category_published_at_idx
on public.posts (locale, category, published_at desc);
