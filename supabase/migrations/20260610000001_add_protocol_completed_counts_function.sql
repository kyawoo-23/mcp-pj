-- Per-protocol completed participant counts for the /analysis version picker.
-- Completion = distinct user_id in task_interview_responses (matches analysis-calculations).

CREATE OR REPLACE FUNCTION get_protocol_completed_counts()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'v1_simple',
    (SELECT COUNT(DISTINCT user_id)::bigint
     FROM task_interview_responses
     WHERE protocol_version = 'v1_simple'),
    'v2_criteria',
    (SELECT COUNT(DISTINCT user_id)::bigint
     FROM task_interview_responses
     WHERE protocol_version = 'v2_criteria')
  );
$$;

GRANT EXECUTE ON FUNCTION get_protocol_completed_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_protocol_completed_counts() TO service_role;
