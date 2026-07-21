-- ============================================================================
-- Rename programming_experience → technical_experience and redefine year buckets.
-- Legacy technical_proficiency (subjective scale) is unchanged.
-- ============================================================================

CREATE TYPE technical_experience AS ENUM (
  'none',
  'under_1_year',
  'one_to_three_years',
  'more_than_three_years'
);

ALTER TABLE profiles
  ADD COLUMN technical_experience technical_experience;

UPDATE profiles
SET technical_experience = CASE programming_experience::text
  WHEN 'none' THEN 'none'::technical_experience
  WHEN 'under_1_year' THEN 'under_1_year'::technical_experience
  WHEN 'one_to_two_years' THEN 'one_to_three_years'::technical_experience
  WHEN 'three_plus_years' THEN 'more_than_three_years'::technical_experience
  ELSE NULL
END;

ALTER TABLE profiles
  DROP COLUMN programming_experience;

DROP TYPE programming_experience;
