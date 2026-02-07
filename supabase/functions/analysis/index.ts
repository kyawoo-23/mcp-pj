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

    // Create client - Supabase automatically injects auth context (sb.auth_user, sb.jwt.authorization)
    // when invoked from an authenticated context via functions.invoke()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // getUser() without parameters reads from Supabase's injected auth context
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError?.message }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
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
        .select("id, age_range, gender, technical_proficiency, ai_tool_frequency, created_at"),
      supabase
        .from("task_sessions")
        .select("id, user_id, system_type, status, started_at, completed_at, created_at"),
      supabase
        .from("task_progress")
        .select("id, session_id, task_definition_id, status, started_at, completed_at"),
      supabase
        .from("task_definitions")
        .select("id, task_code, title, system_type"),
      supabase
        .from("task_surveys")
        .select("id, survey_name, version"),
      supabase
        .from("task_survey_questions")
        .select("id, survey_id, question_text, scale_type, min_value, max_value, order_index, construct")
        .order("order_index", { ascending: true }),
      supabase
        .from("task_survey_responses")
        .select("id, session_id, question_id, response_value, response_text"),
      supabase
        .from("task_interview_questions")
        .select("id, question_text, order_index, options")
        .order("order_index", { ascending: true }),
      supabase
        .from("task_interview_responses")
        .select("id, user_id, question_id, response_text"),
    ])

    // Get never logged in count using database function (has access to auth.users)
    // Counts users who either:
    // 1. Never confirmed email (email_confirmed_at IS NULL)
    // 2. Confirmed email but never logged in (email_confirmed_at IS NOT NULL AND last_sign_in_at IS NULL)
    const { data: neverLoggedInCount, error: neverLoggedInError } = await supabase
      .rpc("get_never_logged_in_count")
    
    if (neverLoggedInError) {
      console.error("Error fetching never logged in count:", neverLoggedInError)
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

    // Return all data as a single JSON object
    return new Response(
      JSON.stringify({
        profiles: profiles ?? [],
        task_sessions: taskSessions ?? [],
        task_progress: taskProgress ?? [],
        task_definitions: taskDefinitions ?? [],
        task_surveys: taskSurveys ?? [],
        task_survey_questions: taskSurveyQuestions ?? [],
        task_survey_responses: taskSurveyResponses ?? [],
        task_interview_questions: taskInterviewQuestions ?? [],
        task_interview_responses: taskInterviewResponses ?? [],
        never_logged_in_count: neverLoggedInCount ?? 0,
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
    --header 'Content-Type: application/json'

*/
