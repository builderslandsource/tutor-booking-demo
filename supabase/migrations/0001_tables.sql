-- T2: tables and privacy rules. Only the Tutor (authenticated) touches tables;
-- visitors (anon) get no table access and will use functions in later tasks.

create table bookings (
  id bigint generated always as identity primary key,
  slot_start timestamptz not null,
  student_name text not null,
  student_email text not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);
-- Two active Bookings can never hold the same Slot; cancelled ones don't count.
create unique index bookings_one_active_per_slot on bookings (slot_start) where status = 'active';

create table weekly_hours (
  id bigint generated always as identity primary key,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null,
  check (start_time < end_time)
);

create table exceptions (
  id bigint generated always as identity primary key,
  date date not null,
  start_time time not null,
  end_time time not null,
  opens boolean not null, -- true = opens time, false = closes time
  check (start_time < end_time)
);

create table settings (
  id boolean primary key default true check (id), -- only one row can exist
  display_name text not null default 'Tutor',
  time_zone text not null default 'Europe/London',
  minimum_notice interval not null default '12 hours',
  booking_horizon interval not null default '4 weeks'
);
insert into settings default values;

alter table bookings enable row level security;
alter table weekly_hours enable row level security;
alter table exceptions enable row level security;
alter table settings enable row level security;

revoke all on bookings, weekly_hours, exceptions, settings from anon;

create policy tutor_all on bookings for all to authenticated using (true) with check (true);
create policy tutor_all on weekly_hours for all to authenticated using (true) with check (true);
create policy tutor_all on exceptions for all to authenticated using (true) with check (true);
create policy tutor_read on settings for select to authenticated using (true);
create policy tutor_update on settings for update to authenticated using (true) with check (true);
