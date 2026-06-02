-- ============================================================================
-- Study protocol versions (v1 simple tasks, v2 criteria-based) + seed sets
-- ============================================================================

CREATE TYPE study_protocol_version AS ENUM ('v1_simple', 'v2_criteria');

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS study_protocol_version study_protocol_version NOT NULL DEFAULT 'v2_criteria',
  ADD COLUMN IF NOT EXISTS migrated_from_simple_tasks_at timestamptz,
  ADD COLUMN IF NOT EXISTS criteria_migration_notice_dismissed_at timestamptz;

ALTER TABLE task_progress
  ADD COLUMN IF NOT EXISTS protocol_version study_protocol_version NOT NULL DEFAULT 'v2_criteria';

ALTER TABLE task_survey_responses
  ADD COLUMN IF NOT EXISTS protocol_version study_protocol_version NOT NULL DEFAULT 'v2_criteria';

ALTER TABLE task_interview_responses
  ADD COLUMN IF NOT EXISTS protocol_version study_protocol_version NOT NULL DEFAULT 'v2_criteria';

-- Replace UNIQUE constraints so v1 and v2 rows can coexist
ALTER TABLE task_progress
  DROP CONSTRAINT IF EXISTS task_progress_session_id_task_definition_id_key;

ALTER TABLE task_progress
  ADD CONSTRAINT uq_task_progress_session_task_protocol
  UNIQUE (session_id, task_definition_id, protocol_version);

ALTER TABLE task_survey_responses
  DROP CONSTRAINT IF EXISTS task_survey_responses_session_id_question_id_key;

ALTER TABLE task_survey_responses
  ADD CONSTRAINT uq_task_survey_responses_session_q_protocol
  UNIQUE (session_id, question_id, protocol_version);

ALTER TABLE task_interview_responses
  DROP CONSTRAINT IF EXISTS task_interview_responses_user_id_question_id_key;

ALTER TABLE task_interview_responses
  ADD CONSTRAINT uq_task_interview_responses_user_q_protocol
  UNIQUE (user_id, question_id, protocol_version);

CREATE INDEX IF NOT EXISTS idx_task_progress_session_protocol
  ON task_progress (session_id, protocol_version);

CREATE INDEX IF NOT EXISTS idx_task_survey_responses_session_protocol
  ON task_survey_responses (session_id, protocol_version);

CREATE INDEX IF NOT EXISTS idx_task_interview_responses_user_protocol
  ON task_interview_responses (user_id, protocol_version);

-- Only enforce single in-progress task within v2 (do not reset frozen v1 rows)
CREATE OR REPLACE FUNCTION enforce_single_task_in_progress()
RETURNS trigger AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NEW.status = 'in_progress' AND NEW.protocol_version = 'v2_criteria' THEN
    SELECT user_id INTO v_user_id
    FROM task_sessions
    WHERE id = NEW.session_id;

    UPDATE task_progress
    SET status = 'not_started',
        updated_at = now()
    WHERE session_id IN (
      SELECT id FROM task_sessions WHERE user_id = v_user_id
    )
      AND protocol_version = 'v2_criteria'
      AND status = 'in_progress'
      AND (session_id <> NEW.session_id OR task_definition_id <> NEW.task_definition_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Seed assignment sets (idempotent)
INSERT INTO task_assignment_sets (set_label, targets) VALUES
(
  'Set A',
  '{
    "register_course": {
      "title": "Register for CS201 — Object-Oriented Programming (Section A)",
      "description": "Find and register for CS201 Object-Oriented Programming, Section A taught by Dr. Robert Martinez (Mon/Wed/Fri 11:00–11:50 AM, Room E102).",
      "criteria": { "course_code": "CS201", "section_number": "A" }
    },
    "drop_course": {
      "title": "Drop CS201 — Object-Oriented Programming (Section A)",
      "description": "Drop your CS201 Object-Oriented Programming, Section A registration that you just made.",
      "criteria": { "course_code": "CS201", "section_number": "A" }
    },
    "book_room": {
      "title": "Book Study Room 201 for tomorrow, 10:00 AM–12:00 PM",
      "description": "Book Study Room 201 in the Library building for tomorrow from 10:00 AM to 12:00 PM for group study.",
      "criteria": { "facility_name": "Study Room 201", "booking_date": "tomorrow", "start_time": "10:00", "end_time": "12:00" }
    },
    "cancel_booking": {
      "title": "Cancel your Study Room 201 booking for tomorrow, 10:00 AM–12:00 PM",
      "description": "Cancel the Study Room 201 booking you just made for tomorrow from 10:00 AM to 12:00 PM.",
      "criteria": { "facility_name": "Study Room 201", "booking_date": "tomorrow", "start_time": "10:00", "end_time": "12:00" }
    }
  }'::jsonb
),
(
  'Set B',
  '{
    "register_course": {
      "title": "Register for MATH102 — Calculus II (Section A)",
      "description": "Find and register for MATH102 Calculus II, Section A taught by Dr. Christopher Moore (Mon/Wed/Fri 10:00–10:50 AM, Room M102).",
      "criteria": { "course_code": "MATH102", "section_number": "A" }
    },
    "drop_course": {
      "title": "Drop MATH102 — Calculus II (Section A)",
      "description": "Drop your MATH102 Calculus II, Section A registration that you just made.",
      "criteria": { "course_code": "MATH102", "section_number": "A" }
    },
    "book_room": {
      "title": "Book Meeting Room A for tomorrow, 2:00 PM–4:00 PM",
      "description": "Book Meeting Room A in the Administration building for tomorrow from 2:00 PM to 4:00 PM for a group meeting.",
      "criteria": { "facility_name": "Meeting Room A", "booking_date": "tomorrow", "start_time": "14:00", "end_time": "16:00" }
    },
    "cancel_booking": {
      "title": "Cancel your Meeting Room A booking for tomorrow, 2:00 PM–4:00 PM",
      "description": "Cancel the Meeting Room A booking you just made for tomorrow from 2:00 PM to 4:00 PM.",
      "criteria": { "facility_name": "Meeting Room A", "booking_date": "tomorrow", "start_time": "14:00", "end_time": "16:00" }
    }
  }'::jsonb
),
(
  'Set C',
  '{
    "register_course": {
      "title": "Register for CS101 — Introduction to Computer Science (Section A)",
      "description": "Find and register for CS101 Introduction to Computer Science, Section A taught by Dr. Sarah Johnson (Mon/Wed/Fri 9:00–9:50 AM, Room M101).",
      "criteria": { "course_code": "CS101", "section_number": "A" }
    },
    "drop_course": {
      "title": "Drop CS101 — Introduction to Computer Science (Section A)",
      "description": "Drop your CS101 Introduction to Computer Science, Section A registration that you just made.",
      "criteria": { "course_code": "CS101", "section_number": "A" }
    },
    "book_room": {
      "title": "Book Study Room 301 for tomorrow, 9:00 AM–11:00 AM",
      "description": "Book Study Room 301 in the Student Center for tomorrow from 9:00 AM to 11:00 AM for individual study.",
      "criteria": { "facility_name": "Study Room 301", "booking_date": "tomorrow", "start_time": "09:00", "end_time": "11:00" }
    },
    "cancel_booking": {
      "title": "Cancel your Study Room 301 booking for tomorrow, 9:00 AM–11:00 AM",
      "description": "Cancel the Study Room 301 booking you just made for tomorrow from 9:00 AM to 11:00 AM.",
      "criteria": { "facility_name": "Study Room 301", "booking_date": "tomorrow", "start_time": "09:00", "end_time": "11:00" }
    }
  }'::jsonb
)
ON CONFLICT (set_label) DO UPDATE SET targets = EXCLUDED.targets;

-- Migrate legacy participants: sessions exist but no assignment set yet
DO $$
DECLARE
  v_user_id uuid;
  v_set_id uuid;
  v_session_ids uuid[];
BEGIN
  FOR v_user_id IN
    SELECT DISTINCT ts.user_id
    FROM task_sessions ts
    LEFT JOIN task_user_assignments tua ON tua.user_id = ts.user_id
    WHERE tua.id IS NULL
  LOOP
    SELECT ARRAY_AGG(id) INTO v_session_ids
    FROM task_sessions
    WHERE user_id = v_user_id;

    IF v_session_ids IS NULL THEN
      CONTINUE;
    END IF;

    -- Freeze existing rows as v1
    UPDATE task_progress
    SET protocol_version = 'v1_simple', updated_at = now()
    WHERE session_id = ANY(v_session_ids)
      AND protocol_version = 'v2_criteria';

    UPDATE task_survey_responses
    SET protocol_version = 'v1_simple'
    WHERE session_id = ANY(v_session_ids)
      AND protocol_version = 'v2_criteria';

    UPDATE task_interview_responses
    SET protocol_version = 'v1_simple'
    WHERE user_id = v_user_id
      AND protocol_version = 'v2_criteria';

    UPDATE profiles
    SET
      migrated_from_simple_tasks_at = COALESCE(migrated_from_simple_tasks_at, now()),
      study_protocol_version = 'v2_criteria',
      updated_at = now()
    WHERE id = v_user_id;

    -- Balanced assignment set pick
    SELECT tas.id INTO v_set_id
    FROM task_assignment_sets tas
    LEFT JOIN task_user_assignments tua ON tua.assignment_set_id = tas.id
    GROUP BY tas.id
    ORDER BY COUNT(tua.id) ASC, RANDOM()
    LIMIT 1;

    IF v_set_id IS NOT NULL THEN
      INSERT INTO task_user_assignments (user_id, assignment_set_id)
      VALUES (v_user_id, v_set_id)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;

    -- Fresh v2 progress rows (one per v1 task progress row)
    INSERT INTO task_progress (
      session_id,
      task_definition_id,
      protocol_version,
      status,
      success_payload
    )
    SELECT
      tp.session_id,
      tp.task_definition_id,
      'v2_criteria'::study_protocol_version,
      'not_started'::task_progress_status,
      '{}'::jsonb
    FROM task_progress tp
    WHERE tp.session_id = ANY(v_session_ids)
      AND tp.protocol_version = 'v1_simple'
    ON CONFLICT (session_id, task_definition_id, protocol_version) DO NOTHING;

    -- Re-open completed sessions so v2 survey flow can continue
    UPDATE task_sessions
    SET
      status = 'in_progress',
      completed_at = NULL,
      updated_at = now()
    WHERE user_id = v_user_id
      AND status = 'completed';

    DELETE FROM task_events
    WHERE session_id = ANY(v_session_ids);
  END LOOP;
END $$;
