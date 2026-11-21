-- T7 privacy checks. Run after migrations 0001-0003:
--   psql -X -v ON_ERROR_STOP=1 -f supabase/tests/privacy.sql
-- Everything runs in one transaction and is rolled back.
begin;

-- Seed as postgres: open every day, one Booking with a name and email.
delete from bookings;
delete from exceptions;
delete from weekly_hours;
update settings set time_zone = 'Europe/London', minimum_notice = '12 hours', booking_horizon = '4 weeks';
insert into weekly_hours (day_of_week, start_time, end_time) select d, '08:00', '20:00' from generate_series(0, 6) d;
insert into exceptions (date, start_time, end_time, opens) values (current_date + 10, '09:00', '10:00', false);
insert into bookings (slot_start, student_name, student_email)
  select max(f), 'Secret Sam', 'sam@example.com' from free_slots() f;
select set_config('test.sam_slot', (select slot_start::text from bookings), true);

-- Anonymous visitor
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';

do $$
declare t text; n bigint;
begin
  foreach t in array array['bookings', 'weekly_hours', 'exceptions', 'settings'] loop
    begin
      execute format('select count(*) from %I', t) into n;
      if n > 0 then raise exception 'FAIL anon read % rows from %', n, t; end if;
    exception when insufficient_privilege then null;
    end;
  end loop;
  raise notice 'PASS: anon reading bookings, weekly_hours, exceptions, settings gets an error or no rows';
end $$;

do $$
declare t text; sql text;
begin
  foreach sql in array array[
    'insert into bookings default values', 'insert into weekly_hours default values',
    'insert into exceptions default values', 'insert into settings default values',
    'update bookings set status = status', 'update weekly_hours set day_of_week = day_of_week',
    'update exceptions set opens = opens', 'update settings set display_name = ''Hacked''',
    'delete from bookings', 'delete from weekly_hours', 'delete from exceptions', 'delete from settings'] loop
    begin
      execute sql;
      raise exception 'FAIL anon allowed: %', sql;
    exception when insufficient_privilege then null;
    end;
  end loop;
  raise notice 'PASS: anon insert, update and delete on all 4 tables fail';
end $$;

do $$
begin
  if (select count(*) from free_slots()) = 0 then raise exception 'FAIL anon got no free Slots'; end if;
  if not exists (select 1 from pg_proc where proname = 'free_slots' and pronargs = 0
                 and prorettype = 'timestamptz'::regtype and proretset and proallargtypes is null) then
    raise exception 'FAIL free_slots() does not return a single timestamptz column';
  end if;
  raise notice 'PASS: anon free_slots() returns only Slot start times (setof timestamptz)';
end $$;

do $$
begin
  perform free_slots_at(now() - interval '1 day');
  raise exception 'FAIL anon can execute free_slots_at';
exception when insufficient_privilege then
  raise notice 'PASS: anon cannot execute free_slots_at';
end $$;

do $$
declare s timestamptz := (select min(f) from free_slots() f); r text;
begin
  if (select prorettype from pg_proc where proname = 'book_slot') <> 'text'::regtype then
    raise exception 'FAIL book_slot does not return text';
  end if;
  foreach r in array array[
    book_slot(s, 'Zed Private', 'zed@example.com'),
    book_slot(s, 'Zed Private', 'zed@example.com'),
    book_slot(current_setting('test.sam_slot')::timestamptz, 'Zed Private', 'zed@example.com')] loop
    if r not in ('booked', 'taken', 'not_free', 'invalid') then raise exception 'FAIL book_slot returned %', r; end if;
    if r ilike '%zed%' or r ilike '%sam%' or r like '%@%' then raise exception 'FAIL book_slot leaked: %', r; end if;
  end loop;
  raise notice 'PASS: anon book_slot returns only a status word, no name or email';
end $$;

reset role;

-- Tutor
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';

do $$
declare id_ bigint;
begin
  if not exists (select 1 from bookings where student_name = 'Secret Sam' and student_email = 'sam@example.com') then
    raise exception 'FAIL Tutor cannot read Booking name and email'; end if;
  insert into bookings (slot_start, student_name, student_email) values (now() + interval '100 days', 'T', 't@example.com')
    returning id into id_;
  update bookings set status = 'cancelled', cancelled_at = now() where id = id_;
  if not found then raise exception 'FAIL Tutor cannot update bookings'; end if;
  delete from bookings where id = id_;
  if not found then raise exception 'FAIL Tutor cannot delete bookings'; end if;
  raise notice 'PASS: Tutor can read, insert, update and delete bookings';

  if not exists (select 1 from weekly_hours) then raise exception 'FAIL Tutor cannot read weekly_hours'; end if;
  insert into weekly_hours (day_of_week, start_time, end_time) values (1, '06:00', '07:00') returning id into id_;
  update weekly_hours set end_time = '07:30' where id = id_;
  if not found then raise exception 'FAIL Tutor cannot update weekly_hours'; end if;
  delete from weekly_hours where id = id_;
  if not found then raise exception 'FAIL Tutor cannot delete weekly_hours'; end if;
  raise notice 'PASS: Tutor can read, insert, update and delete weekly_hours';

  if not exists (select 1 from exceptions) then raise exception 'FAIL Tutor cannot read exceptions'; end if;
  insert into exceptions (date, start_time, end_time, opens) values (current_date + 5, '21:00', '22:00', true) returning id into id_;
  update exceptions set opens = false where id = id_;
  if not found then raise exception 'FAIL Tutor cannot update exceptions'; end if;
  delete from exceptions where id = id_;
  if not found then raise exception 'FAIL Tutor cannot delete exceptions'; end if;
  raise notice 'PASS: Tutor can read, insert, update and delete exceptions';

  -- settings is a single row: no insert or delete by design, "changed" means update.
  if not exists (select 1 from settings) then raise exception 'FAIL Tutor cannot read settings'; end if;
  update settings set minimum_notice = '2 hours';
  if not found then raise exception 'FAIL Tutor cannot update settings'; end if;
  raise notice 'PASS: Tutor can read and update settings';
end $$;

rollback;
