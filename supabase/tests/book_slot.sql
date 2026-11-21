-- T4 checks. Run after migrations 0001-0003:
--   psql -X -v ON_ERROR_STOP=1 -f supabase/tests/book_slot.sql
-- Everything runs in one transaction and is rolled back.
begin;

delete from bookings;
delete from exceptions;
delete from weekly_hours;
update settings set time_zone = 'Europe/London', minimum_notice = '12 hours', booking_horizon = '4 weeks';
insert into weekly_hours (day_of_week, start_time, end_time) select d, '08:00', '20:00' from generate_series(0, 6) d;

-- Runs book_slot as a visitor would.
create function pg_temp.book(p_start timestamptz, p_name text, p_email text, p_website text default '')
returns text language plpgsql as $$
declare r text;
begin
  set local role anon;
  r := book_slot(p_start, p_name, p_email, p_website);
  reset role;
  return r;
end $$;

do $$
declare s timestamptz := (select min(f) from free_slots() f);
begin
  if s is null then raise exception 'FAIL setup: no free Slot'; end if;
  if pg_temp.book(s, ' Ann ', 'ann@example.com') <> 'booked' then raise exception 'FAIL first booking'; end if;
  if (select count(*) from bookings where slot_start = s and status = 'active' and student_name = 'Ann') <> 1 then
    raise exception 'FAIL no active Booking created'; end if;
  raise notice 'PASS: booking a free Slot returns booked and creates one active Booking';

  if pg_temp.book(s, 'Bob', 'bob@example.com') <> 'taken' then raise exception 'FAIL second booking not taken'; end if;
  if (select count(*) from bookings where slot_start = s) <> 1 then raise exception 'FAIL second Booking was stored'; end if;
  raise notice 'PASS: booking the same Slot again returns taken and leaves one Booking';

  -- Same moment: both attempts pass the free check, the loser's insert hits the table rules.
  begin
    insert into bookings (slot_start, student_name, student_email) values (s, 'Cy', 'cy@example.com');
    raise exception 'FAIL duplicate insert allowed';
  exception when unique_violation then null;
  end;
  begin
    insert into bookings (slot_start, student_name, student_email) values (s + interval '30 minutes', 'Di', 'di@example.com');
    raise exception 'FAIL overlapping insert allowed';
  exception when exclusion_violation then null;
  end;
  if (select count(*) from bookings) <> 1 then raise exception 'FAIL extra Booking stored'; end if;
  raise notice 'PASS: table refuses a second active Booking at the same or an overlapping time (book_slot maps both to taken)';

  if pg_temp.book(s + interval '30 minutes', 'Di', 'di@example.com') <> 'taken' then raise exception 'FAIL overlap not taken'; end if;
  if pg_temp.book(now() + interval '1 hour', 'Ed', 'ed@example.com') <> 'not_free' then raise exception 'FAIL inside notice'; end if;
  if pg_temp.book(now() + interval '60 days', 'Ed', 'ed@example.com') <> 'not_free' then raise exception 'FAIL beyond horizon'; end if;
  if pg_temp.book(date_trunc('hour', s) + interval '7 days 3 minutes', 'Ed', 'ed@example.com') <> 'not_free' then
    raise exception 'FAIL off-grid time'; end if;
  if (select count(*) from bookings) <> 1 then raise exception 'FAIL rejected Slot stored'; end if;
  raise notice 'PASS: a Slot that is not currently free is rejected (not_free)';

  s := (select min(f) from free_slots() f);
  if pg_temp.book(s, '  ', 'ed@example.com') <> 'invalid' then raise exception 'FAIL empty name'; end if;
  if pg_temp.book(s, 'Ed', '') <> 'invalid' then raise exception 'FAIL empty email'; end if;
  if pg_temp.book(s, 'Ed', 'ed@example') <> 'invalid' then raise exception 'FAIL bad email'; end if;
  if pg_temp.book(s, 'Ed', 'ed @example.com') <> 'invalid' then raise exception 'FAIL bad email with space'; end if;
  raise notice 'PASS: empty name, empty email and badly formed email are rejected (invalid)';

  if pg_temp.book(s, 'Ed', 'ed@example.com', 'http://spam') <> 'invalid' then raise exception 'FAIL bot field'; end if;
  if (select count(*) from bookings) <> 1 then raise exception 'FAIL invalid booking stored'; end if;
  raise notice 'PASS: a filled-in hidden bot field is rejected (invalid)';
end $$;

do $$ begin
  if (select prorettype from pg_proc where oid = 'book_slot(timestamptz, text, text, text)'::regprocedure) <> 'text'::regtype then
    raise exception 'FAIL book_slot does not return a plain status'; end if;
  raise notice 'PASS: book_slot returns only a status text, never a name or email';
end $$;

rollback;
