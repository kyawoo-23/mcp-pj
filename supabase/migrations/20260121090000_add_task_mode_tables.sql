-- ============================================================================
-- Task Mode - Data Collection Schema
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CREATE ENUMS
-- ----------------------------------------------------------------------------

-- Demographics
CREATE TYPE age_range AS ENUM (
  'under_18',
  '18_24',
  '25_34',
  '35_44',
  '45_54',
  '55_plus',
  'prefer_not_say'
);

CREATE TYPE gender_identity AS ENUM (
  'female',
  'male',
  'prefer_not_say'
);

-- Task mode
CREATE TYPE system_type AS ENUM ('chat_agent', 'traditional');
CREATE TYPE task_session_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE task_progress_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE task_event_type AS ENUM ('step', 'turn', 'survey', 'interview', 'system');

-- Survey scales
CREATE TYPE survey_scale_type AS ENUM ('likert_5', 'likert_7', 'numeric_0_100', 'free_text');

-- ----------------------------------------------------------------------------
-- 2. ALTER EXISTING TABLES
-- ----------------------------------------------------------------------------

ALTER TABLE profiles
  ADD COLUMN age_range age_range,
  ADD COLUMN gender gender_identity;

-- ----------------------------------------------------------------------------
-- 3. CREATE TASK MODE TABLES
-- ----------------------------------------------------------------------------

CREATE TABLE task_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_type system_type NOT NULL,
  task_code text NOT NULL,
  title text NOT NULL,
  description text,
  success_criteria text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (system_type, task_code)
);

CREATE TABLE task_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  system_type system_type NOT NULL,
  status task_session_status NOT NULL DEFAULT 'not_started',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, system_type)
);

CREATE TABLE task_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES task_sessions(id) ON DELETE CASCADE,
  task_definition_id uuid NOT NULL REFERENCES task_definitions(id) ON DELETE CASCADE,
  status task_progress_status NOT NULL DEFAULT 'not_started',
  started_at timestamptz,
  completed_at timestamptz,
  success_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, task_definition_id)
);

CREATE TABLE task_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES task_sessions(id) ON DELETE CASCADE,
  event_type task_event_type NOT NULL,
  event_name text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE task_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_name text NOT NULL,
  version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (survey_name, version)
);

CREATE TABLE task_survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES task_surveys(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  scale_type survey_scale_type NOT NULL,
  min_value integer,
  max_value integer,
  order_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (survey_id, order_index)
);

CREATE TABLE task_survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES task_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES task_survey_questions(id) ON DELETE CASCADE,
  response_value numeric,
  response_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, question_id)
);

CREATE TABLE task_interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_index)
);

CREATE TABLE user_interview_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES task_interview_questions(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

-- ----------------------------------------------------------------------------
-- 4. ATTACH TRIGGERS
-- ----------------------------------------------------------------------------

CREATE TRIGGER set_task_sessions_updated_at
  BEFORE UPDATE ON task_sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_task_progress_updated_at
  BEFORE UPDATE ON task_progress
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. CREATE INDEXES
-- ----------------------------------------------------------------------------

CREATE INDEX idx_task_sessions_user_id ON task_sessions(user_id);
CREATE INDEX idx_task_sessions_status ON task_sessions(status);
CREATE INDEX idx_task_progress_session_id ON task_progress(session_id);
CREATE INDEX idx_task_progress_status ON task_progress(status);
CREATE INDEX idx_task_events_session_id ON task_events(session_id);
CREATE INDEX idx_task_events_type ON task_events(event_type);
CREATE INDEX idx_task_survey_questions_survey ON task_survey_questions(survey_id);
CREATE INDEX idx_task_survey_responses_session ON task_survey_responses(session_id);
CREATE INDEX idx_task_interview_questions_order ON task_interview_questions(order_index);
CREATE INDEX idx_user_interview_responses_user_id ON user_interview_responses(user_id);
CREATE INDEX idx_user_interview_responses_question_id ON user_interview_responses(question_id);


-- ----------------------------------------------------------------------------
-- 6. ENABLE RLS
-- ----------------------------------------------------------------------------

ALTER TABLE task_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interview_responses ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 7. RLS POLICIES
-- ----------------------------------------------------------------------------

-- Task definitions and survey metadata are read-only for all users
CREATE POLICY "Public can read task definitions"
  ON task_definitions FOR SELECT
  USING (true);

CREATE POLICY "Public can read task surveys"
  ON task_surveys FOR SELECT
  USING (true);

CREATE POLICY "Public can read task survey questions"
  ON task_survey_questions FOR SELECT
  USING (true);

-- Task sessions: users can manage their own sessions
CREATE POLICY "Users can view own task sessions"
  ON task_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own task sessions"
  ON task_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own task sessions"
  ON task_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Task progress: users can manage progress within their sessions
CREATE POLICY "Users can view own task progress"
  ON task_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM task_sessions
      WHERE task_sessions.id = task_progress.session_id
      AND task_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task progress"
  ON task_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM task_sessions
      WHERE task_sessions.id = task_progress.session_id
      AND task_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own task progress"
  ON task_progress FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM task_sessions
      WHERE task_sessions.id = task_progress.session_id
      AND task_sessions.user_id = auth.uid()
    )
  );

-- Task events: users can insert/view events within their sessions
CREATE POLICY "Users can view own task events"
  ON task_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM task_sessions
      WHERE task_sessions.id = task_events.session_id
      AND task_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task events"
  ON task_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM task_sessions
      WHERE task_sessions.id = task_events.session_id
      AND task_sessions.user_id = auth.uid()
    )
  );

-- Survey responses: users can insert/view responses within their sessions
CREATE POLICY "Users can view own task survey responses"
  ON task_survey_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM task_sessions
      WHERE task_sessions.id = task_survey_responses.session_id
      AND task_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task survey responses"
  ON task_survey_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM task_sessions
      WHERE task_sessions.id = task_survey_responses.session_id
      AND task_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own task survey responses"
  ON task_survey_responses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM task_sessions
      WHERE task_sessions.id = task_survey_responses.session_id
      AND task_sessions.user_id = auth.uid()
    )
  );


-- Interview questions are public read
CREATE POLICY "Public can read task interview questions"
  ON task_interview_questions FOR SELECT
  USING (true);

-- User interview responses: users can manage their own responses
CREATE POLICY "Users can view own user interview responses"
  ON user_interview_responses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own user interview responses"
  ON user_interview_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own user interview responses"
  ON user_interview_responses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 8. DELETE POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can delete own task progress"
  ON task_progress FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM task_sessions
      WHERE task_sessions.id = task_progress.session_id
      AND task_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own task events"
  ON task_events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM task_sessions
      WHERE task_sessions.id = task_events.session_id
      AND task_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own task survey responses"
  ON task_survey_responses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM task_sessions
      WHERE task_sessions.id = task_survey_responses.session_id
      AND task_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own interview responses"
  ON user_interview_responses FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 9. FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION enforce_single_task_in_progress()
RETURNS trigger AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NEW.status = 'in_progress' THEN
    SELECT user_id INTO v_user_id
    FROM task_sessions
    WHERE id = NEW.session_id;

    UPDATE task_progress
    SET status = 'not_started',
        updated_at = now()
    WHERE session_id IN (
      SELECT id FROM task_sessions WHERE user_id = v_user_id
    )
      AND status = 'in_progress'
      AND (session_id <> NEW.session_id OR task_definition_id <> NEW.task_definition_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER enforce_single_task_progress
  BEFORE INSERT OR UPDATE ON task_progress
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_task_in_progress();

-- ----------------------------------------------------------------------------
-- 10. REALTIME
-- ----------------------------------------------------------------------------

-- Enable realtime for task_progress table
alter publication supabase_realtime add table task_progress;
