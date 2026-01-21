import { Database, Json } from "../../../supabase/types/database.types";

// Re-export for convenience
export type { Database, Json };

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

// Task-related table types
export type TaskDefinition = Database["public"]["Tables"]["task_definitions"]["Row"];
export type TaskProgress = Database["public"]["Tables"]["task_progress"]["Row"];
export type TaskSession = Database["public"]["Tables"]["task_sessions"]["Row"];
export type TaskEvent = Database["public"]["Tables"]["task_events"]["Row"];
export type TaskSurvey = Database["public"]["Tables"]["task_surveys"]["Row"];
export type TaskSurveyQuestion = Database["public"]["Tables"]["task_survey_questions"]["Row"];
export type TaskSurveyResponse = Database["public"]["Tables"]["task_survey_responses"]["Row"];
export type TaskInterviewQuestion = Database["public"]["Tables"]["task_interview_questions"]["Row"];
export type UserInterviewResponse = Database["public"]["Tables"]["user_interview_responses"]["Row"];

// Enums
export type RegistrationStatus = Database["public"]["Enums"]["registration_status"];
export type UserRole = Database["public"]["Enums"]["user_role"];
export type SystemType = Database["public"]["Enums"]["system_type"];
export type TaskEventType = Database["public"]["Enums"]["task_event_type"];
export type TaskProgressStatus = Database["public"]["Enums"]["task_progress_status"];
export type TaskSessionStatus = Database["public"]["Enums"]["task_session_status"];
export type AgeRange = Database["public"]["Enums"]["age_range"];
export type GenderIdentity = Database["public"]["Enums"]["gender_identity"];

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
