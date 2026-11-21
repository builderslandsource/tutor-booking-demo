-- Demo data for the LOCAL database only. Runs on `supabase db reset`.
-- Never run this against the hosted database.
-- Reloading wipes local Bookings, Weekly Hours and Exceptions and puts the demo ones back.

-- Tutor login (one user only). The password comes from SEED_TUTOR_PASSWORD, passed in as
-- seed.tutor_password by the load command in docs/setup.md.
do $$
declare
  v_email text := 'tutor@example.test';
  v_password text := nullif(current_setting('seed.tutor_password', true), '');
  v_id uuid;
begin
  if v_password is null then
    raise exception 'SEED_TUTOR_PASSWORD is not set. See docs/setup.md, "Local demo data".';
  end if;
  select id into v_id from auth.users where email = v_email;
  if v_id is not null then
    update auth.users set encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf')),
                          updated_at = now()
    where id = v_id;
  else
    v_id := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                            confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
            extensions.crypt(v_password, extensions.gen_salt('bf')), now(),
            '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
    insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (v_id::text, v_id, jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
            'email', now(), now(), now());
  end if;
end $$;

update login_lockout set failed_count = 0, locked_until = null;
update settings set display_name = 'Alex Morgan';

delete from bookings;
delete from weekly_hours;
delete from exceptions;

-- Weekly Hours: weekdays 09:00–12:00 and 14:00–18:00, Saturday 10:00–13:00 (1 = Monday).
insert into weekly_hours (day_of_week, start_time, end_time)
select d, t.s, t.e
from generate_series(1, 5) d, (values (time '09:00', time '12:00'), (time '14:00', time '18:00')) t(s, e)
union all
select 6, '10:00', '13:00';

-- Exceptions: one evening opened in 6 days, and a Wednesday at least a week away closed.
insert into exceptions (date, start_time, end_time, opens)
select (now() at time zone s.time_zone)::date + 6, time '18:00', time '20:00', true from settings s
union all
select d + 7 + ((10 - extract(dow from d)::int) % 7), time '09:00', time '18:00', false
from settings s, lateral (select (now() at time zone s.time_zone)::date d) t;

-- Upcoming active Bookings, picked from real free Slots so they follow every Slot rule.
insert into bookings (slot_start, student_name, student_email, created_at)
select f.slot_start, b.name, b.email, now() - interval '2 days'
from (select slot_start, row_number() over (order by slot_start) rn from free_slots_at(now()) slot_start) f
join (values (2, 'Priya Shah', 'priya@example.test'),
             (5, 'Tom Becker', 'tom@example.test'),
             (9, 'Lena Okafor', 'lena@example.test'),
             (14, 'Marco Rossi', 'marco@example.test'),
             (22, 'Hana Kim', 'hana@example.test'),
             (35, 'Priya Shah', 'priya@example.test')) b(rn, name, email) on b.rn = f.rn;

-- One cancelled Booking on a Slot that is now free again.
insert into bookings (slot_start, student_name, student_email, status, created_at, cancelled_at)
select slot_start, 'Ben Carter', 'ben@example.test', 'cancelled', now() - interval '3 days', now() - interval '1 day'
from free_slots_at(now()) slot_start
order by slot_start offset 6 limit 1;

-- Two past Bookings from last week.
insert into bookings (slot_start, student_name, student_email, created_at)
select o, b.name, b.email, o - interval '5 days'
from (select o, row_number() over (order by o) rn from open_slots(now() - interval '7 days', now() - interval '1 day') o) p
join (values (3, 'Lena Okafor', 'lena@example.test'), (10, 'Tom Becker', 'tom@example.test')) b(rn, name, email) on b.rn = p.rn;
