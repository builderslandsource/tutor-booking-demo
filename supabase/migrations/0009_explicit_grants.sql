-- Explicit table grants. Newer Supabase projects no longer give logged-in users
-- select/insert/update/delete on new tables, so the Tutor screens got "permission denied".
-- Older projects gave everything. After this file both end in the same state.
-- Grants decide which operations a role may run; row level security (is_tutor(), 0008) decides which rows.

-- Start from nothing: removes older projects' broad defaults and newer projects' TRUNCATE (which skips row level security).
revoke all on bookings, weekly_hours, exceptions, settings, login_lockout from anon, authenticated;

-- Bookings page lists Bookings with name and email.
grant select on bookings to authenticated;
-- Cancel is the only change: Bookings are made by book_slot() and never deleted or rewritten.
grant update (status, cancelled_at) on bookings to authenticated;
-- Open time page adds, changes and removes Weekly Hours and Exceptions.
grant select, insert, update, delete on weekly_hours, exceptions to authenticated;
-- Open time page reads Settings.
grant select on settings to authenticated;
-- Open time page saves Minimum Notice and Booking Horizon; tutor_id stays out so the Tutor role can't be handed to another user.
grant update (minimum_notice, booking_horizon) on settings to authenticated;
-- No grants on login_lockout: only begin_login_attempt() and record_login_success() (security definer) touch it.
-- No table grants to anon: visitors use free_slots(), book_slot(), public_settings() and begin_login_attempt() (0002-0006).
-- Identity columns need no sequence grants for inserts (0004).

-- Tables made by later migrations start with no access for logged-in users on old and new projects alike;
-- each migration grants what its screen needs.
alter default privileges for role postgres in schema public revoke all on tables from authenticated;
