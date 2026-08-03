import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudyHistoryClient } from "@/components/survey/study-history-client";
import type {
  StudyHistoryInterview,
  StudyHistorySurveyResponse,
  StudyHistoryTask,
} from "@/lib/study-history";
export default async function StudyHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: sessions } = await supabase
    .from("task_sessions")
    .select("id, system_type")
    .eq("user_id", user.id);

  const sessionIds = (sessions || []).map((s) => s.id);

  const progressPromise = sessionIds.length
    ? supabase
        .from("task_progress")
        .select(
          `
        id,
        status,
        started_at,
        completed_at,
        success_payload,
        protocol_version,
        task_definitions ( task_code, title, description, system_type ),
        task_sessions ( system_type )
      `,
        )
        .in("session_id", sessionIds)
    : Promise.resolve({ data: [] });

  const surveyPromise = sessionIds.length
    ? supabase
        .from("task_survey_responses")
        .select(
          `
        id,
        question_id,
        response_value,
        response_text,
        session_id,
        protocol_version,
        task_survey_questions (
          question_text,
          order_index,
          construct,
          scale_type,
          task_surveys ( survey_name, version )
        ),
        task_sessions ( system_type )
      `,
        )
        .in("session_id", sessionIds)
    : Promise.resolve({ data: [] });

  const [progressResult, surveyResult, interviewResult] = await Promise.all([
    progressPromise,
    surveyPromise,
    supabase
      .from("task_interview_responses")
      .select(
        `
        id,
        question_id,
        response_text,
        created_at,
        protocol_version,
        task_interview_questions ( question_text, order_index )
      `,
      )
      .eq("user_id", user.id),
  ]);

  const tasks = (progressResult.data || []) as StudyHistoryTask[];
  const surveyResponses = (surveyResult.data ||
    []) as StudyHistorySurveyResponse[];
  const interviewResponses = (interviewResult.data ||
    []) as StudyHistoryInterview[];

  return (
    <StudyHistoryClient
      tasks={tasks}
      surveyResponses={surveyResponses}
      interviewResponses={interviewResponses}
    />
  );
}
