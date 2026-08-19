-- Restore the standard Supabase API-role privileges on the public schema.
--
-- Some Supabase local Postgres images ship default privileges for the public
-- schema that grant only TRUNCATE/REFERENCES/TRIGGER/MAINTAIN (Dxtm) to the
-- anon/authenticated/service_role API roles, omitting INSERT/SELECT/UPDATE/DELETE
-- (arwd). The storage schema is granted correctly, confirming the intended state
-- is full table privileges gated by RLS. This script re-applies those grants and
-- fixes default privileges for future objects. It is idempotent and safe to run
-- after every `supabase start` / `supabase db reset`. Row access is still
-- governed by the RLS policies defined in the migrations.

-- Silence expected "no privileges were granted" notices for extension-owned
-- objects (e.g. pg_trgm) that postgres cannot grant on.
set client_min_messages to error;

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on routines to anon, authenticated, service_role;
