import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TaskSessionClient } from "@/components/tasks/task-session-client";

export default async function TaskSessionPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_TASK !== "true") {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const systemType = "uni-booking" as const;
  const sessionPromise = supabase
    .from("task_sessions")
    .select("id, status, system_type, started_at, completed_at")
    .eq("user_id", user.id)
    .eq("system_type", systemType)
    .maybeSingle();
  const allSessionsPromise = supabase
    .from("task_sessions")
    .select("id, status, system_type")
    .eq("user_id", user.id)
    .in("system_type", ["chat_agent", "uni-registration", "uni-booking"]);
  const surveysPromise = supabase
    .from("task_surveys")
    .select("id, survey_name, version, created_at")
    .in("survey_name", ["SUS", "NASA_TLX"]);
  const interviewQuestionsPromise = supabase
    .from("task_interview_questions")
    .select("id, question_text, order_index, created_at")
    .order("order_index", { ascending: true });

  const [
    { data: session },
    { data: allSessions },
    { data: surveys },
    { data: interviewQuestions },
  ] = await Promise.all([
    sessionPromise,
    allSessionsPromise,
    surveysPromise,
    interviewQuestionsPromise,
  ]);

  if (!session) {
    redirect("/tasks");
  }

  const { data: taskDefinitions } = await supabase
    .from("task_definitions")
    .select("id, task_code, title, description, success_criteria, created_at, system_type")
    .eq("system_type", systemType)
    .order("task_code", { ascending: true });

  const surveyIds = (surveys || []).map((survey) => survey.id);
  const surveyQuestionsPromise = surveyIds.length
    ? supabase
        .from("task_survey_questions")
        .select(
          "id, survey_id, question_text, scale_type, min_value, max_value, order_index, created_at"
        )
        .in("survey_id", surveyIds)
        .order("order_index", { ascending: true })
    : Promise.resolve({ data: [] });

  const [
    { data: taskProgress },
    { data: surveyQuestions },
    { data: surveyResponses },
    { data: userInterviewResponses },
  ] = await Promise.all([
    supabase
      .from("task_progress")
      .select(
        "id, task_definition_id, status, started_at, completed_at, created_at, session_id, success_payload, updated_at"
      )
      .eq("session_id", session.id),
    surveyQuestionsPromise,
    supabase
      .from("task_survey_responses")
      .select("id, question_id, response_value, response_text, session_id, created_at")
      .eq("session_id", session.id),
    supabase
      .from("user_interview_responses")
      .select("id, question_id, response_text, user_id, created_at")
      .eq("user_id", user.id),
  ]);

  const sessionsBySystem = new Map(
    (allSessions || []).map((item) => [item.system_type, item])
  );
  const requiredSystems = [
    "chat_agent",
    "uni-registration",
    "uni-booking",
  ] as const;
  const allSystemsCompleted = requiredSystems.every(
    (item) => sessionsBySystem.get(item)?.status === "completed"
  );

  return (
    <TaskSessionClient
      session={session}
      taskDefinitions={taskDefinitions || []}
      taskProgress={taskProgress || []}
      surveys={surveys || []}
      surveyQuestions={surveyQuestions || []}
      interviewQuestions={interviewQuestions || []}
      existingSurveyResponses={surveyResponses || []}
      existingInterviewResponses={userInterviewResponses || []}
      allSystemsCompleted={allSystemsCompleted}
      systemType={systemType}
    />
  );
}
