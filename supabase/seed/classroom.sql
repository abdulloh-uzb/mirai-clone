-- Ticket 07: the Classroom course, not yet on sale (active = false).
-- TODO(spec): 12499 ($124.99) is the price from the spec; the classroom course has no sections yet.
insert into public.courses (state_code, slug, price_cents, list_price_cents, active)
values ('CA', 'california-classroom-course', 12499, null, false)
on conflict (slug) do nothing;
