-- Create a function to count users who either:
-- 1. Never confirmed email (email_confirmed_at IS NULL)
-- 2. Confirmed email but never logged in (email_confirmed_at IS NOT NULL AND last_sign_in_at IS NULL)
-- This requires access to auth.users which is not available via PostgREST

CREATE OR REPLACE FUNCTION get_never_logged_in_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::bigint
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  WHERE au.email_confirmed_at IS NULL
    OR (au.email_confirmed_at IS NOT NULL AND au.last_sign_in_at IS NULL);
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION get_never_logged_in_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_never_logged_in_count() TO service_role;
