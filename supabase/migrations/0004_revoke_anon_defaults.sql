-- T7: close grants Supabase gives by default. Visitors (anon) use only free_slots() and book_slot().

-- Sequences: anon could read last_value (Booking count) or setval them. GENERATED ALWAYS identity
-- columns don't need sequence grants for inserts, so the Tutor doesn't need them either.
revoke all on all sequences in schema public from anon, authenticated;

-- Future objects made by migrations (run as postgres) no longer auto-grant to anon.
-- supabase_admin's defaults can't be changed as postgres; migrations don't create objects as it.
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon;
-- PUBLIC's execute on functions is a global default; a schema-scoped revoke can't remove it.
alter default privileges for role postgres revoke all on functions from public;
