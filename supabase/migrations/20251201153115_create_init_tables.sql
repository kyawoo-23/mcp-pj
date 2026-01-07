-- supabase gen types typescript --local > supabase/types/database.types.ts

-- ============================================================================
-- University Internal Web App - Database Schema Migration
-- ============================================================================
-- This migration creates tables for:
-- 1. Course Registration System
-- 2. University Facility Booking System
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CREATE ENUMS
-- ----------------------------------------------------------------------------

-- User roles
CREATE TYPE user_role AS ENUM ('student', 'admin');

-- Facility types
CREATE TYPE facility_type AS ENUM (
  'study_room',
  'lab',
  'meeting_room',
  'lecture_hall',
  'computer_lab',
  'library_space',
  'other'
);

-- Registration status
CREATE TYPE registration_status AS ENUM ('active', 'dropped', 'completed', 'waitlisted');

-- Booking status
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- ----------------------------------------------------------------------------
-- 2. CREATE TABLES
-- ----------------------------------------------------------------------------

-- Profiles table (linked to auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role user_role NOT NULL DEFAULT 'student',
  student_id text UNIQUE, -- Optional: for students
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_student_id CHECK (
    (role = 'student' AND student_id IS NOT NULL) OR
    (role != 'student')
  )
);

-- Courses table
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE, -- e.g., "CS101"
  title text NOT NULL,
  description text,
  credits integer NOT NULL DEFAULT 3,
  department text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Course sections table
CREATE TABLE course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  section_number text NOT NULL, -- e.g., "A", "B", "001"
  instructor text, -- e.g., Instructor name 
  semester text NOT NULL, -- e.g., "Fall 2024", "Spring 2025"
  year integer NOT NULL,
  schedule_days text[], -- e.g., ['Monday', 'Wednesday', 'Friday']
  start_time time,
  end_time time,
  room_location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, section_number, semester, year)
);

-- Student registrations table
CREATE TABLE student_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  status registration_status NOT NULL DEFAULT 'active',
  registered_at timestamptz NOT NULL DEFAULT now(),
  dropped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_drop CHECK (
    (status = 'dropped' AND dropped_at IS NOT NULL) OR
    (status != 'dropped')
  )
);

-- Facilities table
CREATE TABLE facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  facility_type facility_type NOT NULL,
  building text,
  room_number text,
  description text,
  amenities text[], -- e.g., ['projector', 'whiteboard', 'wifi']
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Facility bookings table
CREATE TABLE facility_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status booking_status NOT NULL DEFAULT 'confirmed',
  purpose text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_booking_date CHECK (booking_date = DATE(start_time))
);

-- ----------------------------------------------------------------------------
-- 3. CREATE TRIGGER FUNCTION FOR updated_at
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 4. ATTACH TRIGGERS
-- ----------------------------------------------------------------------------

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_course_sections_updated_at
  BEFORE UPDATE ON course_sections
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_student_registrations_updated_at
  BEFORE UPDATE ON student_registrations
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_facilities_updated_at
  BEFORE UPDATE ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_facility_bookings_updated_at
  BEFORE UPDATE ON facility_bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. CREATE INDEXES
-- ----------------------------------------------------------------------------

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_student_id ON profiles(student_id) WHERE student_id IS NOT NULL;

-- Courses indexes
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_department ON courses(department);

-- Course sections indexes
CREATE INDEX idx_course_sections_course_id ON course_sections(course_id);
CREATE INDEX idx_course_sections_semester_year ON course_sections(semester, year);

-- Student registrations indexes
CREATE INDEX idx_student_registrations_student_id ON student_registrations(student_id);
CREATE INDEX idx_student_registrations_section_id ON student_registrations(section_id);
CREATE INDEX idx_student_registrations_status ON student_registrations(status);
CREATE INDEX idx_student_registrations_student_section ON student_registrations(student_id, section_id);
-- Partial unique index to prevent duplicate active registrations
CREATE UNIQUE INDEX idx_student_registrations_unique_active 
  ON student_registrations(student_id, section_id) 
  WHERE status = 'active';

-- Facilities indexes
CREATE INDEX idx_facilities_type ON facilities(facility_type);
CREATE INDEX idx_facilities_is_active ON facilities(is_active);
CREATE INDEX idx_facilities_building_room ON facilities(building, room_number);
-- Partial unique index to prevent duplicate building/room combinations
CREATE UNIQUE INDEX idx_facilities_unique_building_room 
  ON facilities(building, room_number) 
  WHERE building IS NOT NULL AND room_number IS NOT NULL;

-- Facility bookings indexes
CREATE INDEX idx_facility_bookings_facility_id ON facility_bookings(facility_id);
CREATE INDEX idx_facility_bookings_student_id ON facility_bookings(student_id);
CREATE INDEX idx_facility_bookings_booking_date ON facility_bookings(booking_date);
CREATE INDEX idx_facility_bookings_status ON facility_bookings(status);
CREATE INDEX idx_facility_bookings_time_range ON facility_bookings USING gist (
  tstzrange(start_time, end_time, '[]')
);

-- ----------------------------------------------------------------------------
-- 6. CREATE SECURITY DEFINER FUNCTION TO CHECK ADMIN STATUS
-- ----------------------------------------------------------------------------
-- This function runs with elevated privileges and bypasses RLS,
-- preventing infinite recursion when checking admin status in policies.

CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_bookings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 8. CREATE RLS POLICIES
-- ----------------------------------------------------------------------------

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles (using security definer function to avoid recursion)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin(auth.uid()));

-- ============================================================================
-- COURSES POLICIES
-- ============================================================================

-- All users (including unauthenticated) can view courses
CREATE POLICY "Public can view courses"
  ON courses FOR SELECT
  USING (true);

-- Admins can insert courses
CREATE POLICY "Admins can insert courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Admins can update courses
CREATE POLICY "Admins can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can delete courses
CREATE POLICY "Admins can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================================
-- COURSE SECTIONS POLICIES
-- ============================================================================

-- All users (including unauthenticated) can view course sections
CREATE POLICY "Public can view course sections"
  ON course_sections FOR SELECT
  USING (true);

-- Admins can insert course sections
CREATE POLICY "Admins can insert course sections"
  ON course_sections FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Admins can update course sections
CREATE POLICY "Admins can update course sections"
  ON course_sections FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can delete course sections
CREATE POLICY "Admins can delete course sections"
  ON course_sections FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================================
-- STUDENT REGISTRATIONS POLICIES
-- ============================================================================

-- Students can view their own registrations or admins can view all
CREATE POLICY "Students can view own registrations"
  ON student_registrations FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    is_admin(auth.uid())
  );

-- Students can insert their own registrations
CREATE POLICY "Students can insert own registrations"
  ON student_registrations FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );

-- Students can update their own registrations (e.g., drop)
CREATE POLICY "Students can update own registrations"
  ON student_registrations FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid());

-- Admins can update any registration
CREATE POLICY "Admins can update any registration"
  ON student_registrations FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Students can delete their own registrations
CREATE POLICY "Students can delete own registrations"
  ON student_registrations FOR DELETE
  TO authenticated
  USING (student_id = auth.uid());

-- Admins can delete any registration
CREATE POLICY "Admins can delete any registration"
  ON student_registrations FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================================
-- FACILITIES POLICIES
-- ============================================================================

-- All users (including unauthenticated) can view facilities
CREATE POLICY "Public can view facilities"
  ON facilities FOR SELECT
  USING (true);

-- Admins can insert facilities
CREATE POLICY "Admins can insert facilities"
  ON facilities FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Admins can update facilities
CREATE POLICY "Admins can update facilities"
  ON facilities FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can delete facilities
CREATE POLICY "Admins can delete facilities"
  ON facilities FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================================
-- FACILITY BOOKINGS POLICIES
-- ============================================================================

-- Students can view their own bookings or admins can view all
CREATE POLICY "Students can view own bookings"
  ON facility_bookings FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    is_admin(auth.uid())
  );

-- Admins can view all bookings (redundant but kept for clarity)
CREATE POLICY "Admins can view all bookings"
  ON facility_bookings FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Students can insert their own bookings
CREATE POLICY "Students can insert own bookings"
  ON facility_bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );

-- Students can update their own bookings
CREATE POLICY "Students can update own bookings"
  ON facility_bookings FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid());

-- Admins can update any booking
CREATE POLICY "Admins can update any booking"
  ON facility_bookings FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Students can delete their own bookings
CREATE POLICY "Students can delete own bookings"
  ON facility_bookings FOR DELETE
  TO authenticated
  USING (student_id = auth.uid());

-- Admins can delete any booking
CREATE POLICY "Admins can delete any booking"
  ON facility_bookings FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 9. HELPER FUNCTIONS AND CONSTRAINTS
-- ----------------------------------------------------------------------------

-- Function to check for overlapping bookings
-- Note: This is a helper function. Actual overlap prevention should be
-- implemented at the application level or via a trigger/exclusion constraint.
-- For now, we rely on the application to check overlaps before inserting.

-- Example exclusion constraint for preventing overlapping bookings:
-- This requires the btree_gist extension
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create exclusion constraint to prevent overlapping bookings for the same facility
-- Only applies to confirmed bookings
ALTER TABLE facility_bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    facility_id WITH =,
    tstzrange(start_time, end_time, '[]') WITH &&
  )
  WHERE (status = 'confirmed');


