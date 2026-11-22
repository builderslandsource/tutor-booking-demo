-- Table grants (0009). Run after all migrations:
--   psql -X -v ON_ERROR_STOP=1 -f supabase/tests/grants.sql
-- Everything runs in one transaction and is rolled back.
begin;

-- Exactly these grants. More widens what a stolen login or the public key can do
-- (TRUNCATE even skips row level security); less breaks a Tutor screen on a fresh Supabase project.
do $$
declare got text;
begin
  select string_agg(g, ', ' order by g) into got from (
    select format('%s %s %s', a.grantee::regrole, c.relname, a.privilege_type) g
    from pg_class c, aclexplode(c.relacl) a
    where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
      and a.grantee in ('anon'::regrole, 'authenticated'::regrole)
    union all
    select format('%s %s.%s %s', a.grantee::regrole, c.relname, t.attname, a.privilege_type)
    from pg_class c join pg_attribute t on t.attrelid = c.oid, aclexplode(t.attacl) a
    where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
      and a.grantee in ('anon'::regrole, 'authenticated'::regrole)) x;
  if got is distinct from
     'authenticated bookings SELECT, authenticated bookings.cancelled_at UPDATE, authenticated bookings.status UPDATE, '
     'authenticated exceptions DELETE, authenticated exceptions INSERT, authenticated exceptions SELECT, '
     'authenticated exceptions UPDATE, authenticated settings SELECT, authenticated settings.booking_horizon UPDATE, '
     'authenticated settings.minimum_notice UPDATE, authenticated weekly_hours DELETE, authenticated weekly_hours INSERT, '
     'authenticated weekly_hours SELECT, authenticated weekly_hours UPDATE' then
    raise exception 'FAIL table grants are: %', got;
  end if;
  raise notice 'PASS: anon has no table grants; authenticated has only what the Tutor screens use';
end $$;

-- New tables made by postgres (as migrations are) start with no access for logged-in users.
create table grants_probe (id int);
do $$
begin
  if has_table_privilege('authenticated', 'grants_probe', 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER') then
    raise exception 'FAIL authenticated gets default privileges on new tables'; end if;
  raise notice 'PASS: authenticated gets no privilege on new tables';
end $$;
drop table grants_probe;

-- Seed as postgres: the Tutor is ...0001, one Booking.
delete from bookings;
delete from exceptions;
delete from weekly_hours;
update settings set minimum_notice = '12 hours', booking_horizon = '4 weeks',
  tutor_id = '00000000-0000-0000-0000-000000000001';
insert into weekly_hours (day_of_week, start_time, end_time) select d, '08:00', '20:00' from generate_series(0, 6) d;
insert into exceptions (date, start_time, end_time, opens) values (current_date + 10, '09:00', '10:00', false);
insert into bookings (slot_start, student_name, student_email) select max(f), 'Secret Sam', 'sam@example.com' from free_slots() f;

-- Tutor: the statements the Tutor screens send (web/app/tutor) all work.
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';
do $$
declare id_ bigint;
begin
  if not exists (select id, slot_start, student_name, student_email, status from bookings) then
    raise exception 'FAIL Tutor cannot list Bookings'; end if;
  update bookings set status = 'cancelled', cancelled_at = now() where status = 'active';
  if not found then raise exception 'FAIL Tutor cannot cancel a Booking'; end if;
  perform time_zone, minimum_notice, booking_horizon from settings;
  if not found then raise exception 'FAIL Tutor cannot read Settings'; end if;
  update settings set minimum_notice = '2 hours', booking_horizon = '14 days' where id;
  if not found then raise exception 'FAIL Tutor cannot save Settings'; end if;
  perform id, day_of_week, start_time, end_time from weekly_hours;
  insert into weekly_hours (day_of_week, start_time, end_time) values (1, '06:00', '07:00') returning id into id_;
  update weekly_hours set end_time = '07:30' where id = id_;
  delete from weekly_hours where id = id_;
  if not found then raise exception 'FAIL Tutor cannot change Weekly Hours'; end if;
  perform id, date, start_time, end_time, opens from exceptions;
  insert into exceptions (date, start_time, end_time, opens) values (current_date + 5, '21:00', '22:00', true) returning id into id_;
  update exceptions set opens = false where id = id_;
  delete from exceptions where id = id_;
  if not found then raise exception 'FAIL Tutor cannot change Exceptions'; end if;
  raise notice 'PASS: Tutor lists and cancels Bookings, reads and saves Settings, changes Weekly Hours and Exceptions';
end $$;
reset role;

-- Another logged-in user: the same grants, but row level security shows no rows.
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000002","role":"authenticated"}';
do $$
declare t text; n bigint;
begin
  foreach t in array array['bookings', 'weekly_hours', 'exceptions', 'settings'] loop
    execute format('select count(*) from %I', t) into n;
    if n > 0 then raise exception 'FAIL other user read % rows from %', n, t; end if;
  end loop;
  raise notice 'PASS: other user reads no rows from bookings, weekly_hours, exceptions, settings';
end $$;
reset role;

-- Visitor: no table reads, but the public booking functions work.
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
do $$
declare t text;
begin
  foreach t in array array['bookings', 'weekly_hours', 'exceptions', 'settings', 'login_lockout'] loop
    begin
      execute format('select 1 from %I', t);
      raise exception 'FAIL anon can select from %', t;
    exception when insufficient_privilege then null;
    end;
  end loop;
  if (select count(*) from free_slots()) = 0 then raise exception 'FAIL anon got no free Slots'; end if;
  if (select display_name from public_settings()) is null then raise exception 'FAIL anon cannot read public_settings()'; end if;
  if book_slot((select min(f) from free_slots() f), 'Ann', 'ann@example.com') <> 'booked' then
    raise exception 'FAIL anon cannot book'; end if;
  raise notice 'PASS: anon cannot select any table but can call free_slots(), public_settings() and book_slot()';
end $$;
reset role;

rollback;
