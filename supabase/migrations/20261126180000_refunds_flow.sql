-- Ticket 07: refunds (spec section 8). paid_at, the refund facts and the SQL
-- copy of the refund table, request/decide helpers and the refund event.

alter table public.orders add column paid_at timestamptz;
update public.orders set paid_at = created_at where status <> 'pending' and paid_at is null;

-- One open request per order.
create unique index refunds_one_open_per_order
  on public.refunds (order_id) where status in ('requested', 'approved');

-- fulfill_checkout now also stamps paid_at (rest unchanged from ticket 06).
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
        paid_at = now(),
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

create or replace function public.refund_facts(p_order_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_enrollment uuid;
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found then
    return null;
  end if;
  if v_order.user_id is distinct from (select auth.uid()) and not public.is_admin()
     and (select auth.role()) <> 'service_role' then
    return null;
  end if;
  select id into v_enrollment from public.enrollments where order_id = p_order_id;
  return jsonb_build_object(
    'paidAt', coalesce(v_order.paid_at, v_order.created_at),
    'amountCents', v_order.amount_cents,
    'status', v_order.status,
    'lessonsStarted', exists (
      select 1 from public.lesson_progress lp
      where lp.enrollment_id = v_enrollment and lp.seconds_spent > 0),
    'examStarted', exists (
      select 1 from public.exam_attempts ea where ea.enrollment_id = v_enrollment),
    'certificateIssued', exists (
      select 1 from public.certificates c where c.enrollment_id = v_enrollment)
  );
end;
$$;

revoke all on function public.refund_facts(uuid) from public, anon;
grant execute on function public.refund_facts(uuid) to authenticated, service_role;

-- The same table as src/lib/payments/refund.ts, computed from the DB facts.
create or replace function public.refund_pct(p_order_id uuid, p_now timestamptz default now())
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_enrollment uuid;
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found or v_order.status <> 'paid' then
    return 0;
  end if;
  if p_now - coalesce(v_order.paid_at, v_order.created_at) > interval '7 days' then
    return 0;
  end if;
  select id into v_enrollment from public.enrollments where order_id = p_order_id;
  if exists (select 1 from public.certificates c where c.enrollment_id = v_enrollment)
     or exists (select 1 from public.exam_attempts ea where ea.enrollment_id = v_enrollment) then
    return 0;
  end if;
  if exists (select 1 from public.lesson_progress lp
             where lp.enrollment_id = v_enrollment and lp.seconds_spent > 0) then
    return 50;
  end if;
  return 100;
end;
$$;

revoke all on function public.refund_pct(uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.refund_pct(uuid, timestamptz) to service_role;

create or replace function public.request_refund(
  p_order_id uuid,
  p_reason text,
  p_pct integer,
  p_amount_cents integer
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_pct integer;
  v_id uuid;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.user_id is distinct from (select auth.uid()) then
    raise exception 'order not found' using errcode = 'P0002';
  end if;
  if v_order.status <> 'paid' then
    raise exception 'order is not paid' using errcode = 'P0001';
  end if;
  v_pct := public.refund_pct(p_order_id);
  if v_pct = 0 then
    raise exception 'order is not refundable' using errcode = 'P0001';
  end if;
  if p_pct <> v_pct or p_amount_cents <> round(v_order.amount_cents * v_pct / 100.0)::integer then
    raise exception 'refund amount does not match the policy' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.refunds r
             where r.order_id = p_order_id and r.status in ('requested', 'approved')) then
    raise exception 'a refund request is already open' using errcode = '23505';
  end if;
  insert into public.refunds (order_id, amount_cents, pct, reason, status)
  values (p_order_id, p_amount_cents, v_pct, coalesce(p_reason, ''), 'requested')
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.request_refund(uuid, text, integer, integer) from public, anon;
grant execute on function public.request_refund(uuid, text, integer, integer) to authenticated;

create or replace function public.mark_refund(
  p_refund_id uuid,
  p_status text,
  p_actor uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_before public.refunds;
begin
  if p_status not in ('approved', 'rejected', 'failed') then
    raise exception 'invalid refund status' using errcode = 'P0001';
  end if;
  select * into v_before from public.refunds where id = p_refund_id for update;
  if not found
     or (p_status = 'failed' and v_before.status <> 'approved')
     or (p_status <> 'failed' and v_before.status <> 'requested') then
    raise exception 'refund is not awaiting a decision' using errcode = 'P0001';
  end if;
  update public.refunds
    set status = p_status, approved_by = p_actor, updated_at = now()
    where id = p_refund_id;
  insert into public.audit_log (actor_id, action, entity, entity_id, before, after)
  values (p_actor, 'refund.' || p_status, 'refund', p_refund_id,
          jsonb_build_object('status', v_before.status),
          jsonb_build_object('status', p_status, 'amount_cents', v_before.amount_cents));
end;
$$;

revoke all on function public.mark_refund(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.mark_refund(uuid, text, uuid) to service_role;

-- True when applied; false when replayed or the payment is unknown.
create or replace function public.apply_refund_event(
  p_event_id text,
  p_payment_intent text,
  p_amount_refunded integer
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inserted integer;
  v_order public.orders;
  v_refund uuid;
begin
  insert into public.stripe_events (event_id, type, processed_at)
  values (p_event_id, 'charge.refunded', now())
  on conflict (event_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  select * into v_order from public.orders
    where stripe_payment_intent = p_payment_intent for update;
  if not found then
    return false;
  end if;

  update public.orders
    set status = case when p_amount_refunded >= v_order.amount_cents
                      then 'refunded' else 'partially_refunded' end,
        updated_at = now()
    where id = v_order.id;
  -- Any refund ends access: the enrollment is revoked only on this path.
  update public.enrollments set status = 'refunded', updated_at = now()
    where order_id = v_order.id;

  select id into v_refund from public.refunds
    where order_id = v_order.id and status in ('requested', 'approved')
    order by created_at desc limit 1;
  if v_refund is not null then
    update public.refunds set status = 'processed', updated_at = now() where id = v_refund;
    insert into public.audit_log (actor_id, action, entity, entity_id, after)
    values (null, 'refund.processed', 'refund', v_refund,
            jsonb_build_object('amount_refunded', p_amount_refunded));
  end if;
  return true;
end;
$$;

revoke all on function public.apply_refund_event(text, text, integer) from public, anon, authenticated;
grant execute on function public.apply_refund_event(text, text, integer) to service_role;
