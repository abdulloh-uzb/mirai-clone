-- Ticket 06: checkout. The Course language on an order, and the one place an
-- enrollment is created: fulfill_checkout, called only by the payment event
-- handler with the service role.

alter table public.orders
  add column course_locale text check (course_locale in ('en', 'ja', 'es', 'ru'));

create or replace function public.fulfill_checkout(
  p_event_id text,
  p_event_type text,
  p_order_id uuid,
  p_session_id text default null,
  p_payment_intent text default null
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inserted integer;
  v_order public.orders;
  v_course_id uuid;
  v_days integer;
begin
  insert into public.stripe_events (event_id, type, processed_at)
  values (p_event_id, p_event_type, now())
  on conflict (event_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.status <> 'pending' or v_order.product <> 'online_course' then
    return true;
  end if;

  update public.orders
    set status = 'paid',
        stripe_session_id = coalesce(p_session_id, stripe_session_id),
        stripe_payment_intent = p_payment_intent
    where id = v_order.id;

  select c.id, s.access_days into v_course_id, v_days
    from public.courses c
    join public.states s on s.code = c.state_code
    where c.slug = 'california-traffic-violator-course';

  insert into public.enrollments (user_id, course_id, order_id, course_locale, status, started_at, expires_at)
  values (
    v_order.user_id, v_course_id, v_order.id, coalesce(v_order.course_locale, 'en'),
    'active', now(), now() + make_interval(days => v_days)
  )
  on conflict (order_id) do nothing;
  return true;
end;
$$;

revoke all on function public.fulfill_checkout(text, text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.fulfill_checkout(text, text, uuid, text, text) to service_role;
