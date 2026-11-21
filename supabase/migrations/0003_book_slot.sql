-- T4: booking function. Visitors book through book_slot(); they never read bookings.

-- Immutable so it can sit in the constraint below; adding a fixed 1 hour never depends on time zone.
create function slot_range(p_start timestamptz) returns tstzrange
language sql immutable
set search_path = pg_catalog
as $$ select tstzrange(p_start, p_start + interval '1 hour') $$;

-- Two active Bookings can never overlap, not just never share a start time.
alter table bookings add constraint bookings_no_overlap
  exclude using gist (slot_range(slot_start) with &&) where (status = 'active');

-- Returns only 'booked' | 'taken' | 'not_free' | 'invalid'; never name or email.
create function book_slot(p_slot_start timestamptz, p_name text, p_email text, p_website text default '')
returns text
language plpgsql volatile security definer
set search_path = pg_catalog, public
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_email text := btrim(coalesce(p_email, ''));
begin
  if coalesce(p_website, '') <> ''
     or v_name = '' or length(v_name) > 200
     or length(v_email) > 320 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return 'invalid';
  end if;

  if p_slot_start is null or p_slot_start not in (select free_slots()) then
    if exists (select 1 from bookings
               where status = 'active' and slot_range(slot_start) && slot_range(p_slot_start)) then
      return 'taken';
    end if;
    return 'not_free';
  end if;

  begin
    insert into bookings (slot_start, student_name, student_email) values (p_slot_start, v_name, v_email);
  exception when unique_violation or exclusion_violation then
    -- a booking made at the same moment won the race
    return 'taken';
  end;
  return 'booked';
end
$$;

revoke execute on function book_slot(timestamptz, text, text, text) from public;
grant execute on function book_slot(timestamptz, text, text, text) to anon, authenticated;
