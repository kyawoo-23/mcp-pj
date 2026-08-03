-- ============================================================================
-- Task Assignment Sets — randomized specific tasks per participant
-- ============================================================================

-- Pool of complete task-set variants.
-- Each row defines specific targets for all 4 task codes as JSONB.
CREATE TABLE task_assignment_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_label text NOT NULL UNIQUE,
  targets jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Maps each user to their randomly assigned task set.
-- One row per user — both modalities share the same set.
CREATE TABLE task_user_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assignment_set_id uuid NOT NULL REFERENCES task_assignment_sets(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
CREATE INDEX idx_task_user_assignments_user_id ON task_user_assignments(user_id);
CREATE INDEX idx_task_user_assignments_set_id ON task_user_assignments(assignment_set_id);

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
ALTER TABLE task_assignment_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_user_assignments ENABLE ROW LEVEL SECURITY;

-- Assignment sets are read-only reference data
CREATE POLICY "Public can read assignment sets"
  ON task_assignment_sets FOR SELECT
  USING (true);

-- Users can view their own assignment
CREATE POLICY "Users can view own assignment"
  ON task_user_assignments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own assignment (happens on survey start)
CREATE POLICY "Users can insert own assignment"
  ON task_user_assignments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
