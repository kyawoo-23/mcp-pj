-- ============================================================================
-- Add programming_experience as a new demographic covariate
-- Replaces the subjective technical_proficiency self-rating with concrete
-- time-anchored experience buckets. The legacy technical_proficiency column
-- is kept intact for historical rows.
-- ============================================================================

CREATE TYPE programming_experience AS ENUM (
  'none',
  'under_1_year',
  'one_to_two_years',
  'three_plus_years'
);

ALTER TABLE profiles
  ADD COLUMN programming_experience programming_experience;
