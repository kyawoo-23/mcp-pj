-- Create a function to count total auth users
-- This requires access to auth.users which is not available via PostgREST

CREATE OR REPLACE FUNCTION get_total_auth_users_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::bigint
  FROM auth.users;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION get_total_auth_users_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_auth_users_count() TO service_role;
