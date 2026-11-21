-- T8: the public sees only the Tutor's display name and time zone from Settings.
create or replace function public_settings()
returns table (display_name text, time_zone text)
language sql stable security definer
set search_path = pg_catalog, public
as $$ select display_name, time_zone from settings $$;

revoke execute on function public_settings() from public;
grant execute on function public_settings() to anon, authenticated;
