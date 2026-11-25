-- Ticket 09: seeded reviews are Sample reviews. The home carousel labels them,
-- and AggregateRating JSON-LD is built only from rows where is_sample = false.
alter table public.reviews
  add column is_sample boolean not null default true;

comment on column public.reviews.is_sample is
  'True for demo reviews written for the seed; only real reviews (false) count toward the public rating.';
