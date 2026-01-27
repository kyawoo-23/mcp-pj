import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SurveyPageClient } from "@/components/survey/survey-client";

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
    .select("id, age_range, gender")
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
    .select("id, question_text, order_index, created_at")
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
          "id, task_definition_id, status, started_at, completed_at, created_at, session_id, success_payload, updated_at",
        )
        .in("session_id", sessionIds)
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
          "id, question_id, response_value, response_text, session_id, created_at",
        )
        .in("session_id", sessionIds)
    : Promise.resolve({ data: [] });

  const interviewResponsesPromise = supabase
    .from("task_interview_responses")
    .select("id, question_id, response_text, user_id, created_at")
    .eq("user_id", user.id);

  const [
    { data: taskProgress },
    { data: surveyQuestions },
    { data: surveyResponses },
    { data: interviewResponses },
  ] = await Promise.all([
    taskProgressPromise,
    surveyQuestionsPromise,
    surveyResponsesPromise,
    interviewResponsesPromise,
  ]);

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
    />
  );
}
