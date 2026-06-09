-- Idempotent fix for production: task_progress must be in supabase_realtime
-- and use REPLICA IDENTITY FULL for filtered postgres_changes subscriptions.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'task_progress'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.task_progress;
  END IF;
END $$;

ALTER TABLE public.task_progress REPLICA IDENTITY FULL;
