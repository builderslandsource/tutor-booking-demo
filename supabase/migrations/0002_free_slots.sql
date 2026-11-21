-- T3: free Slot calculation. Slots are 60 minutes, back to back from the start of
-- each block of open time, in the Tutor's time zone.

-- Testable core: takes "now". Not callable by visitors (they could pass a fake now
-- and see Slots inside the Minimum Notice); only free_slots() below calls it.
create function free_slots_at(p_now timestamptz)
returns setof timestamptz
language sql stable
set search_path = pg_catalog, public
as $$
  with s as (select * from settings),
  windows as (
    select d::date as day, w.start_time, w.end_time
    from s,
      generate_series((p_now at time zone s.time_zone)::date,
                      ((p_now + s.booking_horizon) at time zone s.time_zone)::date,
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
  where l.local_start at time zone s.time_zone >= p_now + s.minimum_notice
    and l.local_start at time zone s.time_zone <= p_now + s.booking_horizon
    and not exists (
      select 1 from exceptions e
      where not e.opens
        and l.local_start < e.date + e.end_time
        and l.local_start + interval '1 hour' > e.date + e.start_time)
    and not exists (
      select 1 from bookings b
      where b.status = 'active'
        and b.slot_start < (l.local_start at time zone s.time_zone) + interval '1 hour'
        and b.slot_start + interval '1 hour' > l.local_start at time zone s.time_zone)
  order by 1
$$;

-- Public: free Slot start times only, always measured from the real now().
create function free_slots()
returns setof timestamptz
language sql stable security definer
set search_path = pg_catalog, public
as $$ select free_slots_at(now()) $$;

revoke execute on function free_slots_at(timestamptz) from public, anon, authenticated;
revoke execute on function free_slots() from public;
grant execute on function free_slots() to anon, authenticated;
