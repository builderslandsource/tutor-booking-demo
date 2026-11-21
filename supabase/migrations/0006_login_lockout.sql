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

-- Counts every attempt before the password check; one UPDATE on the one row, so parallel
-- calls queue on the row lock and at most 5 get through before the lock.
-- Returns false while locked. record_login_success() undoes the count for a right password.
create function begin_login_attempt()
returns boolean
language sql security definer
set search_path = pg_catalog, public
as $$
  with u as (
    update login_lockout set
      failed_count = case when failed_count + 1 >= 5 then 0 else failed_count + 1 end,
      locked_until = case when failed_count + 1 >= 5 then now() + interval '15 minutes' else locked_until end
    where id and (locked_until is null or locked_until <= now())
    returning 1
  )
  select exists (select 1 from u)
$$;

create function record_login_success()
returns void
language sql security definer
set search_path = pg_catalog, public
as $$ update login_lockout set failed_count = 0, locked_until = null where id $$;

revoke execute on function begin_login_attempt(), record_login_success() from public, anon, authenticated;
grant execute on function begin_login_attempt() to anon, authenticated;
-- authenticated only, so an anonymous caller can't reset the counter.
grant execute on function record_login_success() to authenticated;
