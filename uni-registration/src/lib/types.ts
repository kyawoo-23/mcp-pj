import { Database } from "../../supabase/types/database.types";

// Database table types
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];
export type CourseUpdate = Database["public"]["Tables"]["courses"]["Update"];

export type CourseSection = Database["public"]["Tables"]["course_sections"]["Row"];
export type CourseSectionInsert = Database["public"]["Tables"]["course_sections"]["Insert"];
export type CourseSectionUpdate = Database["public"]["Tables"]["course_sections"]["Update"];

export type StudentRegistration = Database["public"]["Tables"]["student_registrations"]["Row"];
export type StudentRegistrationInsert = Database["public"]["Tables"]["student_registrations"]["Insert"];
export type StudentRegistrationUpdate = Database["public"]["Tables"]["student_registrations"]["Update"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// Enums
export type RegistrationStatus = Database["public"]["Enums"]["registration_status"];
export type UserRole = Database["public"]["Enums"]["user_role"];

// Extended types with relations
export type CourseWithSections = Course & {
  course_sections?: CourseSection[];
};

export type CourseSectionWithCourse = CourseSection & {
  courses?: Course;
};

export type StudentRegistrationWithDetails = StudentRegistration & {
  course_sections?: CourseSection & {
    courses?: Course;
  };
  profiles?: Profile;
};

// Form types
export interface CourseFilters {
  search?: string;
  department?: string;
}

export interface RegistrationFormData {
  section_id: string;
}

