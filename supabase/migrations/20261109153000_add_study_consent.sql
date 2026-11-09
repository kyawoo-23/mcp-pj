-- Record the study information version a participant agreed to, and when.

ALTER TABLE public.profiles
  ADD COLUMN consent_version text,
  ADD COLUMN consented_at timestamptz;

COMMENT ON COLUMN public.profiles.consent_version IS
  'Version of the study information the participant agreed to.';
COMMENT ON COLUMN public.profiles.consented_at IS
  'When the participant agreed to that study information.';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_consent_version text;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  v_consent_version := NULLIF(NEW.raw_user_meta_data->>'consent_version', '');

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    student_id,
    consent_version,
    consented_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE
      WHEN v_role = 'admin' THEN 'admin'::user_role
      ELSE 'student'::user_role
    END,
    NEW.raw_user_meta_data->>'student_id',
    v_consent_version,
    CASE
      WHEN v_consent_version IS NOT NULL THEN now()
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
