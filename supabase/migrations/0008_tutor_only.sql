-- Only the Tutor reads or changes tutor data. Until now every logged-in user could.
-- The Tutor is the user whose id is in settings.tutor_id. Unset or stale means nobody
-- gets in (fails closed); docs/setup.md says how to set it.

alter table settings add column tutor_id uuid;

-- A project that already has its one user (docs/setup.md): that user is the Tutor.
-- No users yet (a fresh project): left unset until the Tutor user is made.
-- Several users: stop rather than guess which one is the Tutor.
do $$
begin
  if (select count(*) from auth.users) > 1 then
    raise exception 'More than one user exists; only the Tutor should. Remove the others, then push again.';
  end if;
  update settings set tutor_id = (select id from auth.users);
end $$;

-- security definer: reads settings past its own row level security (a policy on settings
-- that queried settings as the caller would loop).
create function is_tutor()
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
as $$ select coalesce(auth.uid() = (select tutor_id from settings), false) $$;

revoke execute on function is_tutor() from public, anon;
grant execute on function is_tutor() to authenticated;

-- (select ...) runs is_tutor() once per query, not once per row.
alter policy tutor_all on bookings using ((select is_tutor())) with check ((select is_tutor()));
alter policy tutor_all on weekly_hours using ((select is_tutor())) with check ((select is_tutor()));
alter policy tutor_all on exceptions using ((select is_tutor())) with check ((select is_tutor()));
alter policy tutor_read on settings using ((select is_tutor()));
alter policy tutor_update on settings using ((select is_tutor())) with check ((select is_tutor()));

-- Returns Student names past row level security, so it checks for the Tutor itself.
create or replace function bookings_outside_open_time()
returns table (id bigint, slot_start timestamptz, student_name text)
language sql stable security definer
set search_path = pg_catalog, public
as $$
  select b.id, b.slot_start, b.student_name
  from bookings b
  where (select is_tutor()) and b.status = 'active' and b.slot_start >= now()
    and b.slot_start not in (
      select open_slots(now(), (select max(slot_start) + interval '1 hour' from bookings
                                where status = 'active' and slot_start >= now())))
  order by b.slot_start
$$;
