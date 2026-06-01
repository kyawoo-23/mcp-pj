-- Required for Supabase Realtime postgres_changes filters on non-PK columns (e.g. session_id).
-- See https://supabase.com/docs/guides/realtime/postgres-changes#replica-identity
ALTER TABLE task_progress REPLICA IDENTITY FULL;
