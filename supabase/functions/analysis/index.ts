// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept",
}

type StudyProtocolVersion = "v1_simple" | "v2_criteria"

const PROTOCOL_VERSIONS = new Set<StudyProtocolVersion>([
  "v1_simple",
  "v2_criteria",
])

type AnalysisRequestBody = {
  protocol_version?: string
}

type ProfileRow = {
  id: string
  age_range: string | null
  gender: string | null
  technical_proficiency: string | null
  technical_experience: string | null
  ai_tool_frequency: string | null
  created_at: string
}

type TaskSessionRow = {
  id: string
  user_id: string
  system_type: string
  status: string
  started_at: string | null
  completed_at: string | null
  created_at: string
}

type TaskProgressRow = {
  id: string
  session_id: string
  task_definition_id: string
  status: string
  started_at: string | null
  completed_at: string | null
  protocol_version: string
}

type TaskSurveyResponseRow = {
  id: string
  session_id: string
  question_id: string
  response_value: number | null
  response_text: string | null
  protocol_version: string
}

type TaskInterviewResponseRow = {
  id: string
  user_id: string
  question_id: string
  response_text: string | null
  protocol_version: string
}

// Keep in sync with home/src/lib/analysis-calculations.ts filterPayloadByProtocolVersion
// Exclude users who only have seeded not_started progress (v2 migration copies
// not_started rows for all v1 participants). Include users with in_progress/
// completed progress, survey responses, or interview responses.
function narrowPayloadByProtocol<
  TProfile extends ProfileRow,
  TSession extends TaskSessionRow,
  TProgress extends TaskProgressRow,
  TSurvey extends TaskSurveyResponseRow,
  TInterview extends TaskInterviewResponseRow,
>(
  profiles: TProfile[],
  taskSessions: TSession[],
  taskProgress: TProgress[],
  taskSurveyResponses: TSurvey[],
  taskInterviewResponses: TInterview[],
): { profiles: TProfile[]; taskSessions: TSession[] } {
  const sessionIdToUserId = new Map(
    taskSessions.map((s) => [s.id, s.user_id]),
  )

  const activeUserIds = new Set<string>()
  for (const row of taskProgress) {
    if (row.status === "in_progress" || row.status === "completed") {
      const userId = sessionIdToUserId.get(row.session_id)
      if (userId) activeUserIds.add(userId)
    }
  }
  for (const row of taskSurveyResponses) {
    const userId = sessionIdToUserId.get(row.session_id)
    if (userId) activeUserIds.add(userId)
  }
  for (const row of taskInterviewResponses) {
    activeUserIds.add(row.user_id)
  }

  const filteredTaskSessions = taskSessions.filter((s) =>
    activeUserIds.has(s.user_id),
  )
  const filteredProfiles = profiles.filter((p) => activeUserIds.has(p.id))

  return {
    profiles: filteredProfiles,
    taskSessions: filteredTaskSessions,
  }
}

function parseProtocolVersion(
  raw: string | undefined,
): StudyProtocolVersion | null {
  if (raw && PROTOCOL_VERSIONS.has(raw as StudyProtocolVersion)) {
    return raw as StudyProtocolVersion
  }
  return null
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    // Create client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header from the request (for client-side calls)
    const authHeader = req.headers.get("Authorization")

    let user
    let userError

    if (authHeader) {
      // Client-side call: extract token from Authorization header
      const token = authHeader.replace("Bearer ", "")
      const result = await supabase.auth.getUser(token)
      user = result.data.user
      userError = result.error
    } else {
      // Server-side call: use injected auth context
      const result = await supabase.auth.getUser()
      user = result.data.user
      userError = result.error
    }

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError?.message }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    let body: AnalysisRequestBody = {}
    if (req.method === "POST") {
      try {
        const text = await req.text()
        if (text) {
          body = JSON.parse(text) as AnalysisRequestBody
        }
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid JSON body" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        )
      }
    }

    const protocolVersion = body.protocol_version !== undefined
      ? parseProtocolVersion(body.protocol_version)
      : null

    if (
      body.protocol_version !== undefined &&
      body.protocol_version !== null &&
      protocolVersion === null
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid protocol_version",
          details: "Must be v1_simple or v2_criteria",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    let taskProgressQuery = supabase
      .from("task_progress")
      .select(
        "id, session_id, task_definition_id, status, started_at, completed_at, protocol_version",
      )
      .limit(100000)

    let taskSurveyResponsesQuery = supabase
      .from("task_survey_responses")
      .select(
        "id, session_id, question_id, response_value, response_text, protocol_version",
      )
      .limit(100000)

    let taskInterviewResponsesQuery = supabase
      .from("task_interview_responses")
      .select("id, user_id, question_id, response_text, protocol_version")
      .limit(100000)

    if (protocolVersion) {
      taskProgressQuery = taskProgressQuery.eq(
        "protocol_version",
        protocolVersion,
      )
      taskSurveyResponsesQuery = taskSurveyResponsesQuery.eq(
        "protocol_version",
        protocolVersion,
      )
      taskInterviewResponsesQuery = taskInterviewResponsesQuery.eq(
        "protocol_version",
        protocolVersion,
      )
    }

    // Fetch all required tables in parallel
    const [
      { data: profiles, error: profilesError },
      { data: taskSessions, error: taskSessionsError },
      { data: taskProgress, error: taskProgressError },
      { data: taskDefinitions, error: taskDefinitionsError },
      { data: taskSurveys, error: taskSurveysError },
      { data: taskSurveyQuestions, error: taskSurveyQuestionsError },
      { data: taskSurveyResponses, error: taskSurveyResponsesError },
      { data: taskInterviewQuestions, error: taskInterviewQuestionsError },
      { data: taskInterviewResponses, error: taskInterviewResponsesError },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, age_range, gender, technical_proficiency, technical_experience, ai_tool_frequency, created_at",
        )
        .limit(100000),
      supabase
        .from("task_sessions")
        .select(
          "id, user_id, system_type, status, started_at, completed_at, created_at",
        )
        .limit(100000),
      taskProgressQuery,
      supabase
        .from("task_definitions")
        .select("id, task_code, title, system_type")
        .limit(100000),
      supabase
        .from("task_surveys")
        .select("id, survey_name, version")
        .limit(100000),
      supabase
        .from("task_survey_questions")
        .select(
          "id, survey_id, question_text, scale_type, min_value, max_value, order_index, construct",
        )
        .order("order_index", { ascending: true })
        .limit(100000),
      taskSurveyResponsesQuery,
      supabase
        .from("task_interview_questions")
        .select("id, question_text, order_index, options")
        .order("order_index", { ascending: true })
        .limit(100000),
      taskInterviewResponsesQuery,
    ])

    // Get never logged in count using database function (has access to auth.users)
    const { data: neverLoggedInCount, error: neverLoggedInError } =
      await supabase.rpc("get_never_logged_in_count")

    if (neverLoggedInError) {
      console.error("Error fetching never logged in count:", neverLoggedInError)
    }

    // Get total auth users count using database function (has access to auth.users)
    const { data: totalAuthUsersCount, error: totalAuthUsersError } =
      await supabase.rpc("get_total_auth_users_count")

    if (totalAuthUsersError) {
      console.error("Error fetching total auth users count:", totalAuthUsersError)
    }

    // Check for errors
    const errors = [
      profilesError,
      taskSessionsError,
      taskProgressError,
      taskDefinitionsError,
      taskSurveysError,
      taskSurveyQuestionsError,
      taskSurveyResponsesError,
      taskInterviewQuestionsError,
      taskInterviewResponsesError,
    ].filter(Boolean)

    if (errors.length > 0) {
      console.error("Database errors:", errors)
      return new Response(
        JSON.stringify({
          error: "Failed to fetch data",
          details: errors.map((e) => e?.message),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    const progressRows = taskProgress ?? []
    const surveyResponseRows = taskSurveyResponses ?? []
    const interviewResponseRows = taskInterviewResponses ?? []
    let profileRows = profiles ?? []
    let sessionRows = taskSessions ?? []

    if (protocolVersion) {
      const narrowed = narrowPayloadByProtocol(
        profileRows,
        sessionRows,
        progressRows,
        surveyResponseRows,
        interviewResponseRows,
      )
      profileRows = narrowed.profiles
      sessionRows = narrowed.taskSessions
    }

    // Return all data as a single JSON object
    return new Response(
      JSON.stringify({
        profiles: profileRows,
        task_sessions: sessionRows,
        task_progress: progressRows,
        task_definitions: taskDefinitions ?? [],
        task_surveys: taskSurveys ?? [],
        task_survey_questions: taskSurveyQuestions ?? [],
        task_survey_responses: surveyResponseRows,
        task_interview_questions: taskInterviewQuestions ?? [],
        task_interview_responses: interviewResponseRows,
        never_logged_in_count: neverLoggedInCount ?? 0,
        total_auth_users_count: totalAuthUsersCount ?? 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Edge function error:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:23456/functions/v1/analysis' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"protocol_version":"v2_criteria"}'

*/
