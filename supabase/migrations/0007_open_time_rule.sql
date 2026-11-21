-- One open-time rule. free_slots_at() and the Open time warning both use open_slots().

-- Slot starts inside open time between p_from and p_to: no notice, horizon or bookings filter.
create function open_slots(p_from timestamptz, p_to timestamptz)
returns setof timestamptz
language sql stable
set search_path = pg_catalog, public
as $$
  with s as (select * from settings),
  windows as (
    select d::date as day, w.start_time, w.end_time
    from s,
      generate_series((p_from at time zone s.time_zone)::date,
                      (p_to at time zone s.time_zone)::date,
                      interval '1 day') d
      join weekly_hours w on w.day_of_week = extract(dow from d)
    union all
    select date, start_time, end_time from exceptions where opens
  ),
  local_slots as (
    -- ponytail: overlapping windows with different start minutes give overlapping Slots; fine while the Tutor doesn't enter those
    select w.day + w.start_time + n * interval '1 hour' as local_start
    from windows w,
      generate_series(0, floor(extract(epoch from w.end_time - w.start_time) / 3600)::int - 1) n
  )
  -- distinct on the final time: the missing local hour at the spring clock change maps onto its neighbour
  select distinct l.local_start at time zone s.time_zone as slot_start
  from local_slots l, s
  where l.local_start at time zone s.time_zone >= p_from
    and l.local_start at time zone s.time_zone <= p_to
    and not exists (
      select 1 from exceptions e
      where not e.opens
        and l.local_start < e.date + e.end_time
        and l.local_start + interval '1 hour' > e.date + e.start_time)
$$;

create or replace function free_slots_at(p_now timestamptz)
returns setof timestamptz
language sql stable
set search_path = pg_catalog, public
as $$
  select o
  from settings s, open_slots(p_now + s.minimum_notice, p_now + s.booking_horizon) o
  where not exists (
    select 1 from bookings b
    where b.status = 'active'
      and b.slot_start < o + interval '1 hour'
      and b.slot_start + interval '1 hour' > o)
  order by 1
$$;

-- Upcoming active Bookings not on an open Slot. Checks past the horizon too: those Bookings can exist.
create function bookings_outside_open_time()
returns table (id bigint, slot_start timestamptz, student_name text)
language sql stable security definer
set search_path = pg_catalog, public
as $$
  select b.id, b.slot_start, b.student_name
  from bookings b
  where b.status = 'active' and b.slot_start >= now()
    and b.slot_start not in (
      select open_slots(now(), (select max(slot_start) + interval '1 hour' from bookings
                                where status = 'active' and slot_start >= now())))
  order by b.slot_start
$$;

revoke execute on function open_slots(timestamptz, timestamptz) from public, anon, authenticated;
revoke execute on function free_slots_at(timestamptz) from public, anon, authenticated;
revoke execute on function bookings_outside_open_time() from public, anon;
grant execute on function bookings_outside_open_time() to authenticated;
