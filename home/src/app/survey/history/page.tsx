import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudyHistoryClient } from "@/components/survey/study-history-client";
import type {
  StudyHistoryInterview,
  StudyHistorySurveyResponse,
  StudyHistoryTask,
} from "@/lib/study-history";
import { CURRENT_STUDY_PROTOCOL_VERSION } from "@/utils/study-protocol";

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

  if (!sessionIds.length) {
    return (
      <StudyHistoryClient
        tasks={[]}
        surveyResponses={[]}
        interviewResponses={[]}
        archivedLabel='Simple tasks (pre-criteria protocol)'
      />
    );
  }

  const [progressResult, surveyResult, interviewResult] = await Promise.all([
    supabase
      .from("task_progress")
      .select(
        `
        id,
        status,
        started_at,
        completed_at,
        success_payload,
        task_definitions ( task_code, title, description, system_type ),
        task_sessions ( system_type )
      `,
      )
      .in("session_id", sessionIds)
      .neq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION),
    supabase
      .from("task_survey_responses")
      .select(
        `
        id,
        question_id,
        response_value,
        response_text,
        session_id,
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
      .neq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION),
    supabase
      .from("task_interview_responses")
      .select(
        `
        id,
        question_id,
        response_text,
        created_at,
        task_interview_questions ( question_text, order_index )
      `,
      )
      .eq("user_id", user.id)
      .neq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION),
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
      archivedLabel='Simple tasks (pre-criteria protocol)'
    />
  );
}
