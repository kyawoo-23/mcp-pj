import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SurveyPageClient } from "@/components/survey/survey-client";
import type { UserAssignmentWithSet } from "@/lib/types";
import { CURRENT_STUDY_PROTOCOL_VERSION } from "@/utils/study-protocol";

export default async function SurveyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profilePromise = supabase
    .from("profiles")
    .select(
      "id, age_range, gender, programming_experience, ai_tool_frequency, migrated_from_simple_tasks_at, criteria_migration_notice_dismissed_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  const sessionsPromise = supabase
    .from("task_sessions")
    .select(
      "id, status, system_type, started_at, completed_at, user_id, created_at, updated_at",
    )
    .eq("user_id", user.id)
    .in("system_type", ["chat_agent", "traditional"]);

  const taskDefinitionsPromise = supabase
    .from("task_definitions")
    .select(
      "id, task_code, title, description, success_criteria, created_at, system_type",
    )
    .in("system_type", ["chat_agent", "traditional"])
    .order("task_code", { ascending: true });

  const surveysPromise = supabase
    .from("task_surveys")
    .select("id, survey_name, version, created_at")
    .in("survey_name", ["SUS", "RAW_TLX", "SDT"]);

  const interviewQuestionsPromise = supabase
    .from("task_interview_questions")
    .select("id, question_text, order_index, options, created_at")
    .order("order_index", { ascending: true });

  const [
    { data: profile },
    { data: sessions },
    { data: taskDefinitions },
    { data: surveys },
    { data: interviewQuestions },
  ] = await Promise.all([
    profilePromise,
    sessionsPromise,
    taskDefinitionsPromise,
    surveysPromise,
    interviewQuestionsPromise,
  ]);

  const sessionIds = (sessions || []).map((session) => session.id);
  const surveyIds = (surveys || []).map((survey) => survey.id);

  const taskProgressPromise = sessionIds.length
    ? supabase
        .from("task_progress")
        .select(
          "id, task_definition_id, status, started_at, completed_at, created_at, session_id, success_payload, updated_at, protocol_version",
        )
        .in("session_id", sessionIds)
        .eq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION)
    : Promise.resolve({ data: [] });

  const surveyQuestionsPromise = surveyIds.length
    ? supabase
        .from("task_survey_questions")
        .select(
          "id, survey_id, question_text, scale_type, min_value, max_value, order_index, created_at, construct",
        )
        .in("survey_id", surveyIds)
        .order("order_index", { ascending: true })
    : Promise.resolve({ data: [] });

  const surveyResponsesPromise = sessionIds.length
    ? supabase
        .from("task_survey_responses")
        .select(
          "id, question_id, response_value, response_text, session_id, created_at, protocol_version",
        )
        .in("session_id", sessionIds)
        .eq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION)
    : Promise.resolve({ data: [] });

  const interviewResponsesPromise = supabase
    .from("task_interview_responses")
    .select("id, question_id, response_text, user_id, created_at, protocol_version")
    .eq("user_id", user.id)
    .eq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION);

  const priorProtocolProgressCountPromise = sessionIds.length
    ? supabase
        .from("task_progress")
        .select("id", { count: "exact", head: true })
        .in("session_id", sessionIds)
        .neq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION)
    : Promise.resolve({ count: 0 });

  const assignmentPromise = supabase
    .from("task_user_assignments")
    .select(`
      id,
      task_assignment_sets (
        id,
        set_label,
        targets
      )
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  const [
    { data: taskProgress },
    { data: surveyQuestions },
    { data: surveyResponses },
    { data: interviewResponses },
    { data: assignment },
    { count: priorProtocolProgressCount },
  ] = await Promise.all([
    taskProgressPromise,
    surveyQuestionsPromise,
    surveyResponsesPromise,
    interviewResponsesPromise,
    assignmentPromise,
    priorProtocolProgressCountPromise,
  ]);

  const showMigrationNotice =
    !!profile?.migrated_from_simple_tasks_at &&
    !profile?.criteria_migration_notice_dismissed_at;
  const hasStudyHistory =
    (priorProtocolProgressCount ?? 0) > 0 ||
    !!profile?.migrated_from_simple_tasks_at;

  return (
    <SurveyPageClient
      profile={profile}
      sessions={sessions || []}
      taskDefinitions={taskDefinitions || []}
      taskProgress={taskProgress || []}
      surveys={surveys || []}
      surveyQuestions={surveyQuestions || []}
      surveyResponses={surveyResponses || []}
      interviewQuestions={interviewQuestions || []}
      interviewResponses={interviewResponses || []}
      assignment={assignment as unknown as UserAssignmentWithSet | null}
      showMigrationNotice={showMigrationNotice}
      hasStudyHistory={hasStudyHistory}
      userId={user.id}
    />
  );
}
