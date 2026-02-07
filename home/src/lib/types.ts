import type { Database, Json } from "../../../supabase/types/database.types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type TaskSessionRow = Database["public"]["Tables"]["task_sessions"]["Row"];
export type TaskDefinitionRow =
  Database["public"]["Tables"]["task_definitions"]["Row"];
export type TaskProgressRow = Database["public"]["Tables"]["task_progress"]["Row"];
export type SurveyRow = Database["public"]["Tables"]["task_surveys"]["Row"];
export type SurveyQuestionRow =
  Database["public"]["Tables"]["task_survey_questions"]["Row"];
export type SurveyResponseRow =
  Database["public"]["Tables"]["task_survey_responses"]["Row"];
export type InterviewQuestionRow =
  Database["public"]["Tables"]["task_interview_questions"]["Row"];
export type UserInterviewResponseRow =
  Database["public"]["Tables"]["task_interview_responses"]["Row"];
export type SystemType = Database["public"]["Enums"]["system_type"];

// Analysis payload from edge function
export interface AnalysisPayload {
  profiles: ProfileRow[];
  task_sessions: TaskSessionRow[];
  task_progress: TaskProgressRow[];
  task_definitions: TaskDefinitionRow[];
  task_surveys: SurveyRow[];
  task_survey_questions: SurveyQuestionRow[];
  task_survey_responses: SurveyResponseRow[];
  task_interview_questions: InterviewQuestionRow[];
  task_interview_responses: UserInterviewResponseRow[];
  never_logged_in_count: number;
}

export type { Json };
