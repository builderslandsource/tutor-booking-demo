-- T6: lock Tutor login for 15 minutes after 5 wrong passwords in a row.
-- Known gap: calling Supabase's auth API directly with the public key skips this lockout;
-- Supabase's own auth rate limits are the backstop there.

create table login_lockout (
  id boolean primary key default true check (id), -- only one row can exist
  failed_count int not null default 0,
  locked_until timestamptz
);
insert into login_lockout default values;

alter table login_lockout enable row level security;
revoke all on login_lockout from anon, authenticated;

create function login_allowed()
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
as $$ select coalesce(locked_until <= now(), true) from login_lockout $$;

create function record_login_failure()
returns void
language sql security definer
set search_path = pg_catalog, public
as $$
  update login_lockout set
    failed_count = case when failed_count + 1 >= 5 then 0 else failed_count + 1 end,
    locked_until = case when failed_count + 1 >= 5 then now() + interval '15 minutes' else locked_until end
  where id
$$;

create function record_login_success()
returns void
language sql security definer
set search_path = pg_catalog, public
as $$ update login_lockout set failed_count = 0 where id $$;

revoke execute on function login_allowed(), record_login_failure(), record_login_success() from public, anon, authenticated;
grant execute on function login_allowed() to anon, authenticated;
grant execute on function record_login_failure() to anon;
-- authenticated only, so an anonymous caller can't reset the counter.
grant execute on function record_login_success() to authenticated;
