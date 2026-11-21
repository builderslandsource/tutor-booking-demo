-- T3 checks. Run after migrations 0001 and 0002:
--   psql -X -v ON_ERROR_STOP=1 -f supabase/tests/free_slots.sql
-- Everything runs in one transaction and is rolled back.
begin;

delete from bookings;
delete from exceptions;
delete from weekly_hours;
update settings set time_zone = 'Europe/London', minimum_notice = '12 hours', booking_horizon = '4 weeks';

-- Local hours of the free Slots on one local date, for a given now.
create function pg_temp.hours_on(p_now timestamptz, p_day date) returns int[] language sql as $$
  select coalesce(array_agg(extract(hour from s at time zone 'Europe/London')::int order by s), '{}')
  from free_slots_at(p_now) s where (s at time zone 'Europe/London')::date = p_day
$$;

-- 2027-03-01 is a Monday. Now = Saturday 2027-02-27 noon London.
insert into weekly_hours (day_of_week, start_time, end_time) values (1, '16:00', '20:00');

do $$ begin
  if pg_temp.hours_on('2027-02-27 12:00 Europe/London', '2027-03-01') <> '{16,17,18,19}' then
    raise exception 'FAIL weekly hours: %', pg_temp.hours_on('2027-02-27 12:00 Europe/London', '2027-03-01'); end if;
  raise notice 'PASS: Monday 4pm-8pm gives exactly 4 Slots (4, 5, 6, 7pm)';
end $$;

insert into exceptions (date, start_time, end_time, opens) values ('2027-03-08', '17:00', '19:00', false);
do $$ begin
  if pg_temp.hours_on('2027-02-27 12:00 Europe/London', '2027-03-08') <> '{16,19}' then
    raise exception 'FAIL closing exception: %', pg_temp.hours_on('2027-02-27 12:00 Europe/London', '2027-03-08'); end if;
  raise notice 'PASS: closing Exception removes the Slots it covers';
end $$;

insert into exceptions (date, start_time, end_time, opens) values ('2027-03-03', '10:00', '12:00', true);
do $$ begin
  if pg_temp.hours_on('2027-02-27 12:00 Europe/London', '2027-03-03') <> '{10,11}' then
    raise exception 'FAIL opening exception: %', pg_temp.hours_on('2027-02-27 12:00 Europe/London', '2027-03-03'); end if;
  raise notice 'PASS: opening Exception adds Slots';
end $$;

do $$ begin
  -- now 06:00 + 12h notice = 18:00, so 4pm and 5pm are too soon.
  if pg_temp.hours_on('2027-03-01 06:00 Europe/London', '2027-03-01') <> '{18,19}' then
    raise exception 'FAIL minimum notice: %', pg_temp.hours_on('2027-03-01 06:00 Europe/London', '2027-03-01'); end if;
  raise notice 'PASS: Slots inside the Minimum Notice are left out';
  -- now Sat 27 Feb noon + 4 weeks = Sat 27 Mar noon: Mon 22 Mar in, Mon 29 Mar out.
  if pg_temp.hours_on('2027-02-27 12:00 Europe/London', '2027-03-22') <> '{16,17,18,19}'
     or pg_temp.hours_on('2027-02-27 12:00 Europe/London', '2027-03-29') <> '{}' then
    raise exception 'FAIL booking horizon'; end if;
  raise notice 'PASS: Slots beyond the Booking Horizon are left out';
end $$;

insert into bookings (slot_start, student_name, student_email) values ('2027-03-01 17:00 Europe/London', 'A', 'a@example.com');
do $$ begin
  if pg_temp.hours_on('2027-02-27 12:00 Europe/London', '2027-03-01') <> '{16,18,19}' then
    raise exception 'FAIL active booking: %', pg_temp.hours_on('2027-02-27 12:00 Europe/London', '2027-03-01'); end if;
  raise notice 'PASS: Slot with an active Booking is left out';
end $$;
update bookings set status = 'cancelled', cancelled_at = now();
do $$ begin
  if pg_temp.hours_on('2027-02-27 12:00 Europe/London', '2027-03-01') <> '{16,17,18,19}' then
    raise exception 'FAIL cancelled booking: %', pg_temp.hours_on('2027-02-27 12:00 Europe/London', '2027-03-01'); end if;
  raise notice 'PASS: Slot comes back once its Booking is cancelled';
end $$;

-- A Booking blocks any Slot overlapping its hour, even after Weekly Hours shift.
insert into bookings (slot_start, student_name, student_email) values ('2027-03-01 17:00 Europe/London', 'B', 'b@example.com');
update weekly_hours set start_time = '16:30', end_time = '20:30' where day_of_week = 1;
do $$ declare got timestamptz[]; begin
  select array_agg(s order by s) into got from free_slots_at('2027-02-27 12:00 Europe/London') s
    where (s at time zone 'Europe/London')::date = '2027-03-01';
  if got <> array['2027-03-01 18:30 Europe/London', '2027-03-01 19:30 Europe/London']::timestamptz[]
     or (select status from bookings where student_name = 'B') <> 'active' then
    raise exception 'FAIL overlapping booking: %', got; end if;
  raise notice 'PASS: Slots overlapping an active Booking are left out after Weekly Hours change; Booking stays active';
end $$;
delete from bookings where student_name = 'B';
update weekly_hours set start_time = '16:00', end_time = '20:00' where day_of_week = 1;

-- Clock changes: Sunday 2027-03-28 (to BST, UTC+1) and Sunday 2027-10-31 (to GMT, UTC+0).
insert into weekly_hours (day_of_week, start_time, end_time) values (0, '10:00', '12:00');
do $$ declare got timestamptz[]; begin
  select array_agg(s order by s) into got from free_slots_at('2027-03-20 12:00Z') s
    where s::date between '2027-03-28' and '2027-03-29';
  if got <> array['2027-03-28 09:00Z', '2027-03-28 10:00Z', '2027-03-29 15:00Z', '2027-03-29 16:00Z',
                  '2027-03-29 17:00Z', '2027-03-29 18:00Z']::timestamptz[] then
    raise exception 'FAIL spring clock change: %', got; end if;
  select array_agg(s order by s) into got from free_slots_at('2027-10-23 12:00Z') s
    where s::date between '2027-10-31' and '2027-11-01';
  if got <> array['2027-10-31 10:00Z', '2027-10-31 11:00Z', '2027-11-01 16:00Z', '2027-11-01 17:00Z',
                  '2027-11-01 18:00Z', '2027-11-01 19:00Z']::timestamptz[] then
    raise exception 'FAIL autumn clock change: %', got; end if;
  raise notice 'PASS: on clock-change dates Slots keep their local times (10am, 11am Sunday; 4-7pm Monday)';
end $$;

-- Hours covering the missing local hour (01:00-02:00 on 28 Mar) give no duplicate Slots.
insert into exceptions (date, start_time, end_time, opens) values ('2027-03-28', '00:00', '03:00', true);
do $$ declare n int; d int; begin
  select count(*), count(distinct s) into n, d from free_slots_at('2027-03-20 12:00Z') s
    where s < '2027-03-28 03:00Z';
  if n <> d or n = 0 then raise exception 'FAIL spring gap duplicates: % rows, % distinct', n, d; end if;
  raise notice 'PASS: no duplicate Slots across the missing hour at the spring clock change';
end $$;

do $$ begin
  if pg_typeof((select free_slots() limit 1))::text <> 'timestamp with time zone'
     or not has_function_privilege('anon', 'free_slots()', 'execute')
     or has_function_privilege('anon', 'free_slots_at(timestamptz)', 'execute')
     or has_function_privilege('authenticated', 'free_slots_at(timestamptz)', 'execute') then
    raise exception 'FAIL public function shape or grants'; end if;
  raise notice 'PASS: free_slots() returns start times only; visitors cannot pass their own now';
end $$;

-- Open time warning: upcoming active Bookings not on an open Slot, from the same rule as free_slots_at.
delete from bookings; delete from exceptions; delete from weekly_hours;
insert into weekly_hours (day_of_week, start_time, end_time) values (1, '16:00', '20:00'), (2, '16:00', '20:00'), (0, '10:00', '12:00');
insert into bookings (slot_start, student_name, student_email) values
  ('2027-03-01 17:00 Europe/London', 'In', 'in@example.com'),
  ('2027-03-02 17:00 Europe/London', 'Out', 'out@example.com'),
  ('2027-03-28 09:00Z', 'Clock in', 'ci@example.com'),   -- 10am BST on the spring clock-change Sunday
  ('2027-03-28 11:00Z', 'Clock out', 'co@example.com');  -- 12pm BST, after Sunday 10am-12pm
delete from weekly_hours where day_of_week = 2;
do $$ declare got text[]; begin
  select array_agg(student_name order by slot_start) into got from bookings_outside_open_time();
  if got is distinct from array['Out', 'Clock out'] or (select status from bookings where student_name = 'Out') <> 'active'
     or has_function_privilege('anon', 'bookings_outside_open_time()', 'execute')
     or has_function_privilege('authenticated', 'open_slots(timestamptz, timestamptz)', 'execute') then
    raise exception 'FAIL bookings outside open time: %', got; end if;
  raise notice 'PASS: Bookings outside open time are listed (incl. clock-change day) and stay active; inside ones are not';
end $$;

rollback;
