import { SYSTEM_TYPE_KEYS } from "./constants";
import type {
  AnalysisPayload,
  SurveyQuestionRow,
  SurveyResponseRow,
  TaskSessionRow,
  TaskDefinitionRow,
  SystemType,
} from "./types";

// ============================================================================
// SUS (System Usability Scale) Calculation
// ============================================================================

/**
 * Calculate SUS score for a single session
 * SUS uses 10 items, likert 1-5
 * Odd items (1,3,5,7,9): contribution = score - 1
 * Even items (2,4,6,8,10): contribution = 5 - score
 * SUS = sum × 2.5 (range 0-100)
 */
export function calculateSUS(
  questions: SurveyQuestionRow[],
  responses: SurveyResponseRow[],
  sessionId: string,
): number | null {
  // Get SUS questions (order_index 1-10)
  const susQuestions = questions
    .filter((q) => q.order_index >= 1 && q.order_index <= 10)
    .sort((a, b) => a.order_index - b.order_index);

  if (susQuestions.length !== 10) {
    return null;
  }

  // Get responses for this session
  const sessionResponses = responses.filter(
    (r) => r.session_id === sessionId,
  );

  // Calculate contribution for each item
  let sum = 0;
  for (const question of susQuestions) {
    const response = sessionResponses.find(
      (r) => r.question_id === question.id,
    );

    if (!response || response.response_value === null) {
      return null; // Missing response
    }

    const score = response.response_value;
    const orderIndex = question.order_index;

    // Odd items: (score - 1), Even items: (5 - score)
    if (orderIndex % 2 === 1) {
      // Odd (1,3,5,7,9)
      sum += score - 1;
    } else {
      // Even (2,4,6,8,10)
      sum += 5 - score;
    }
  }

  // SUS = sum × 2.5
  return sum * 2.5;
}

// ============================================================================
// NASA-TLX (Raw TLX) Calculation
// ============================================================================

/**
 * Calculate Raw NASA-TLX score for a single session
 * Six dimensions 0-100
 * Performance (order_index 4) is reverse-coded: (100 - value)
 * Raw TLX = mean(mental, physical, temporal, (100-performance), effort, frustration)
 */
export function calculateRawTLX(
  questions: SurveyQuestionRow[],
  responses: SurveyResponseRow[],
  sessionId: string,
): number | null {
  // Get RAW_TLX questions (order_index 1-6)
  const tlxQuestions = questions
    .filter((q) => q.order_index >= 1 && q.order_index <= 6)
    .sort((a, b) => a.order_index - b.order_index);

  if (tlxQuestions.length !== 6) {
    return null;
  }

  // Get responses for this session
  const sessionResponses = responses.filter(
    (r) => r.session_id === sessionId,
  );

  const values: number[] = [];

  for (const question of tlxQuestions) {
    const response = sessionResponses.find(
      (r) => r.question_id === question.id,
    );

    if (!response || response.response_value === null) {
      return null; // Missing response
    }

    let value = response.response_value;

    // Performance (order_index 4) is reverse-coded
    if (question.order_index === 4) {
      value = 100 - value;
    }

    values.push(value);
  }

  // Raw TLX = average of 6 values
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// ============================================================================
// SDT (Self-Determination Theory) Calculation
// ============================================================================

/**
 * Calculate SDT subscale scores for a single session
 * Mean of response_value per construct:
 * - Autonomy (items 1-3)
 * - Competence (items 4-6)
 * - Performance Satisfaction (items 7-8)
 * - System Satisfaction (items 9-10)
 * Scale is 1-7
 */
export function calculateSDT(
  questions: SurveyQuestionRow[],
  responses: SurveyResponseRow[],
  sessionId: string,
): {
  autonomy: number | null;
  competence: number | null;
  performanceSatisfaction: number | null;
  systemSatisfaction: number | null;
} {
  // Get SDT questions
  const sdtQuestions = questions
    .filter((q) => q.order_index >= 1 && q.order_index <= 10)
    .sort((a, b) => a.order_index - b.order_index);

  // Get responses for this session
  const sessionResponses = responses.filter(
    (r) => r.session_id === sessionId,
  );

  const calculateSubscale = (
    startIndex: number,
    endIndex: number,
  ): number | null => {
    const subscaleQuestions = sdtQuestions.filter(
      (q) => q.order_index >= startIndex && q.order_index <= endIndex,
    );

    const values: number[] = [];

    for (const question of subscaleQuestions) {
      const response = sessionResponses.find(
        (r) => r.question_id === question.id,
      );

      if (!response || response.response_value === null) {
        return null; // Missing response
      }

      values.push(response.response_value);
    }

    if (values.length === 0) {
      return null;
    }

    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  return {
    autonomy: calculateSubscale(1, 3),
    competence: calculateSubscale(4, 6),
    performanceSatisfaction: calculateSubscale(7, 8),
    systemSatisfaction: calculateSubscale(9, 10),
  };
}

// ============================================================================
// User Metrics
// ============================================================================

export function calculateUserMetrics(payload: AnalysisPayload) {
  const { task_sessions, task_interview_responses, never_logged_in_count, total_auth_users_count } = payload;

  // Total users - use total auth users count from Supabase
  const totalUsers = total_auth_users_count;

  // In Progress Logic (based on SQL):
  // SELECT DISTINCT p.id AS user_id FROM task_sessions ts
  // JOIN profiles p ON p.id = ts.user_id
  // WHERE ts.status IN ('in_progress', 'not_started')
  const inProgressUserIds = new Set(
    task_sessions
      .filter((s) => s.status === "in_progress" || s.status === "not_started")
      .map((s) => s.user_id)
  );

  // Users who completed all tasks: user_id exists in task_interview_responses
  const usersCompletedAllTasks = new Set(
    task_interview_responses.map((r) => r.user_id),
  );

  return {
    totalUsers,
    neverLoggedIn: never_logged_in_count,
    inProgress: inProgressUserIds.size,
    completedAllTasks: usersCompletedAllTasks.size,
  };
}

// ============================================================================
// Task Duration Formatting Helper
// ============================================================================

/**
 * Format milliseconds to "Xh Ym Zs" format
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) return "0s";
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`);
  }
  
  return parts.join(" ");
}

// ============================================================================
// Task Performance Duration
// ============================================================================

export type TaskDurationData = {
  taskCode: string;
  taskTitle: string;
  avgDurationMs: number;
  avgDurationFormatted: string;
  completedCount: number;
};

export type SystemDurationData = {
  systemType: SystemType;
  tasks: TaskDurationData[];
  overallAvgDurationMs: number;
  overallAvgDurationFormatted: string;
};

/**
 * Calculate average task completion durations grouped by system type
 * Duration = completed_at - started_at for each task
 */
export function calculateTaskDurations(
  payload: AnalysisPayload,
): SystemDurationData[] {
  const { task_sessions, task_progress, task_definitions } = payload;

  // Create lookup maps
  const sessionById = new Map(task_sessions.map((s) => [s.id, s]));
  const definitionById = new Map(task_definitions.map((d) => [d.id, d]));

  // Group durations by system_type and task_definition_id
  const durationsBySystemAndTask: Record<
    SystemType,
    Record<string, { durations: number[]; definition: TaskDefinitionRow }>
  > = {
    chat_agent: {},
    traditional: {},
  };

  for (const progress of task_progress) {
    // Only count completed tasks with valid timestamps
    if (
      progress.status !== "completed" ||
      !progress.started_at ||
      !progress.completed_at
    ) {
      continue;
    }

    const session = sessionById.get(progress.session_id);
    const definition = definitionById.get(progress.task_definition_id);

    if (!session || !definition) {
      continue;
    }

    const systemType = session.system_type;
    const taskDefId = progress.task_definition_id;

    // Calculate duration in ms
    const startedAt = new Date(progress.started_at).getTime();
    const completedAt = new Date(progress.completed_at).getTime();
    const duration = completedAt - startedAt;

    const ONE_HOUR_MS = 60 * 60 * 1000;

    // Skip negative, zero, or >1hr durations
    if (duration <= 0 || duration > ONE_HOUR_MS) {
      continue;
    }

    if (!durationsBySystemAndTask[systemType][taskDefId]) {
      durationsBySystemAndTask[systemType][taskDefId] = {
        durations: [],
        definition,
      };
    }

    durationsBySystemAndTask[systemType][taskDefId].durations.push(duration);
  }

  // Calculate averages and format results
  return SYSTEM_TYPE_KEYS.map((systemType) => {
    const taskData = durationsBySystemAndTask[systemType];
    const tasks: TaskDurationData[] = [];
    let allDurations: number[] = [];

    // Get all task definitions for this system type (for ordering)
    const systemDefinitions = task_definitions
      .filter((d) => d.system_type === systemType)
      .sort((a, b) => a.task_code.localeCompare(b.task_code));

    for (const definition of systemDefinitions) {
      const data = taskData[definition.id];
      
      if (data && data.durations.length > 0) {
        const avgDurationMs =
          data.durations.reduce((sum, d) => sum + d, 0) / data.durations.length;

        tasks.push({
          taskCode: definition.task_code,
          taskTitle: definition.title,
          avgDurationMs,
          avgDurationFormatted: formatDuration(avgDurationMs),
          completedCount: data.durations.length,
        });

        allDurations = allDurations.concat(data.durations);
      } else {
        // Task exists but no completed data
        tasks.push({
          taskCode: definition.task_code,
          taskTitle: definition.title,
          avgDurationMs: 0,
          avgDurationFormatted: "N/A",
          completedCount: 0,
        });
      }
    }

    const overallAvgDurationMs =
      allDurations.length > 0
        ? allDurations.reduce((sum, d) => sum + d, 0) / allDurations.length
        : 0;

    return {
      systemType,
      tasks,
      overallAvgDurationMs,
      overallAvgDurationFormatted:
        allDurations.length > 0 ? formatDuration(overallAvgDurationMs) : "N/A",
    };
  });
}

// ============================================================================
// Demographics
// ============================================================================

export function calculateDemographics(payload: AnalysisPayload) {
  const { profiles } = payload;

  // Age range distribution
  const ageRangeCounts: Record<string, number> = {};
  for (const profile of profiles) {
    const ageRange = profile.age_range || "unknown";
    ageRangeCounts[ageRange] = (ageRangeCounts[ageRange] || 0) + 1;
  }

  // Gender distribution
  const genderCounts: Record<string, number> = {};
  for (const profile of profiles) {
    const gender = profile.gender || "unknown";
    genderCounts[gender] = (genderCounts[gender] || 0) + 1;
  }

  // Technical proficiency distribution
  const techProficiencyCounts: Record<string, number> = {};
  for (const profile of profiles) {
    const proficiency = profile.technical_proficiency || "unknown";
    techProficiencyCounts[proficiency] =
      (techProficiencyCounts[proficiency] || 0) + 1;
  }

  // AI usage frequency distribution
  const aiFrequencyCounts: Record<string, number> = {};
  for (const profile of profiles) {
    const frequency = profile.ai_tool_frequency || "unknown";
    aiFrequencyCounts[frequency] = (aiFrequencyCounts[frequency] || 0) + 1;
  }

  const total = profiles.length;

  return {
    ageRange: Object.entries(ageRangeCounts).map(([key, count]) => ({
      label: key,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    })),
    gender: Object.entries(genderCounts).map(([key, count]) => ({
      label: key,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    })),
    technicalProficiency: Object.entries(techProficiencyCounts).map(
      ([key, count]) => ({
        label: key,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }),
    ),
    aiFrequency: Object.entries(aiFrequencyCounts).map(([key, count]) => ({
      label: key,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    })),
  };
}

// ============================================================================
// Survey Scores by System Type
// ============================================================================

export function calculateSurveyScoresBySystem(
  payload: AnalysisPayload,
): {
  sus: { systemType: SystemType; mean: number; scores: number[] }[];
  rawTlx: { systemType: SystemType; mean: number; scores: number[] }[];
  sdt: {
    systemType: SystemType;
    autonomy: number;
    competence: number;
    performanceSatisfaction: number;
    systemSatisfaction: number;
  }[];
} {
  const {
    task_sessions,
    task_surveys,
    task_survey_questions,
    task_survey_responses,
  } = payload;

  // Get survey IDs
  const susSurvey = task_surveys.find((s) => s.survey_name === "SUS");
  const tlxSurvey = task_surveys.find((s) => s.survey_name === "RAW_TLX");
  const sdtSurvey = task_surveys.find((s) => s.survey_name === "SDT");

  if (!susSurvey || !tlxSurvey || !sdtSurvey) {
    return {
      sus: [],
      rawTlx: [],
      sdt: [],
    };
  }

  // Get questions for each survey
  const susQuestions = task_survey_questions.filter(
    (q) => q.survey_id === susSurvey.id,
  );
  const tlxQuestions = task_survey_questions.filter(
    (q) => q.survey_id === tlxSurvey.id,
  );
  const sdtQuestions = task_survey_questions.filter(
    (q) => q.survey_id === sdtSurvey.id,
  );

  // Group sessions by system_type
  const sessionsBySystem = Object.fromEntries(
    SYSTEM_TYPE_KEYS.map((k) => [k, [] as TaskSessionRow[]]),
  ) as Record<SystemType, TaskSessionRow[]>;

  for (const session of task_sessions) {
    if (session.status === "completed") {
      sessionsBySystem[session.system_type].push(session);
    }
  }

  // Calculate SUS scores
  const susScores = Object.fromEntries(
    SYSTEM_TYPE_KEYS.map((k) => [k, [] as number[]]),
  ) as Record<SystemType, number[]>;

  for (const [systemType, sessions] of Object.entries(sessionsBySystem)) {
    for (const session of sessions) {
      const score = calculateSUS(
        susQuestions,
        task_survey_responses,
        session.id,
      );
      if (score !== null) {
        susScores[systemType as SystemType].push(score);
      }
    }
  }

  // Calculate Raw TLX scores
  const tlxScores = Object.fromEntries(
    SYSTEM_TYPE_KEYS.map((k) => [k, [] as number[]]),
  ) as Record<SystemType, number[]>;

  for (const [systemType, sessions] of Object.entries(sessionsBySystem)) {
    for (const session of sessions) {
      const score = calculateRawTLX(
        tlxQuestions,
        task_survey_responses,
        session.id,
      );
      if (score !== null) {
        tlxScores[systemType as SystemType].push(score);
      }
    }
  }

  // Calculate SDT scores
  const sdtScores = Object.fromEntries(
    SYSTEM_TYPE_KEYS.map((k) => [
      k,
      {
        autonomy: [] as number[],
        competence: [] as number[],
        performanceSatisfaction: [] as number[],
        systemSatisfaction: [] as number[],
      },
    ]),
  ) as Record<
    SystemType,
    {
      autonomy: number[];
      competence: number[];
      performanceSatisfaction: number[];
      systemSatisfaction: number[];
    }
  >;

  for (const [systemType, sessions] of Object.entries(sessionsBySystem)) {
    for (const session of sessions) {
      const sdt = calculateSDT(
        sdtQuestions,
        task_survey_responses,
        session.id,
      );

      if (sdt.autonomy !== null) {
        sdtScores[systemType as SystemType].autonomy.push(sdt.autonomy);
      }
      if (sdt.competence !== null) {
        sdtScores[systemType as SystemType].competence.push(sdt.competence);
      }
      if (sdt.performanceSatisfaction !== null) {
        sdtScores[systemType as SystemType].performanceSatisfaction.push(
          sdt.performanceSatisfaction,
        );
      }
      if (sdt.systemSatisfaction !== null) {
        sdtScores[systemType as SystemType].systemSatisfaction.push(
          sdt.systemSatisfaction,
        );
      }
    }
  }

  // Calculate means
  const calculateMean = (scores: number[]): number => {
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  return {
    sus: SYSTEM_TYPE_KEYS.map((systemType) => ({
      systemType,
      mean: calculateMean(susScores[systemType]),
      scores: susScores[systemType],
    })),
    rawTlx: SYSTEM_TYPE_KEYS.map((systemType) => ({
      systemType,
      mean: calculateMean(tlxScores[systemType]),
      scores: tlxScores[systemType],
    })),
    sdt: SYSTEM_TYPE_KEYS.map((systemType) => ({
      systemType,
      autonomy: calculateMean(sdtScores[systemType].autonomy),
      competence: calculateMean(sdtScores[systemType].competence),
      performanceSatisfaction: calculateMean(
        sdtScores[systemType].performanceSatisfaction,
      ),
      systemSatisfaction: calculateMean(
        sdtScores[systemType].systemSatisfaction,
      ),
    })),
  };
}

// ============================================================================
// Preference Questions (Interview Responses)
// ============================================================================

export function calculatePreferenceResponses(payload: AnalysisPayload) {
  const { task_interview_questions, task_interview_responses } = payload;

  return task_interview_questions.map((question) => {
    const responses = task_interview_responses.filter(
      (r) => r.question_id === question.id,
    );

    // Count responses by response_text
    const counts: Record<string, number> = {};
    for (const response of responses) {
      const text = response.response_text || "unknown";
      counts[text] = (counts[text] || 0) + 1;
    }

    const total = responses.length;

    return {
      questionId: question.id,
      questionText: question.question_text,
      orderIndex: question.order_index,
      options: question.options as string[] | null,
      responses: Object.entries(counts).map(([label, count]) => ({
        label,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      })),
    };
  });
}

// ============================================================================
// Filter Payload to Completed Users
// ============================================================================

/**
 * Filters the analysis payload to only include data from users who completed all tasks.
 * A user is considered to have "completed all tasks" if their user_id exists in
 * task_interview_responses (i.e. they submitted the final interview/preference questions).
 */
export function filterPayloadToCompletedUsers(
  payload: AnalysisPayload,
): AnalysisPayload {
  // Get set of user IDs who have interview responses
  const completedUserIds = new Set(
    payload.task_interview_responses.map((r) => r.user_id),
  );

  // Filter profiles
  const filteredProfiles = payload.profiles.filter((p) =>
    completedUserIds.has(p.id),
  );

  // Filter task_sessions
  const filteredTaskSessions = payload.task_sessions.filter((s) =>
    completedUserIds.has(s.user_id),
  );

  // Get set of session IDs from filtered sessions
  const filteredSessionIds = new Set(
    filteredTaskSessions.map((s) => s.id),
  );

  // Filter task_progress (keep rows whose session_id is in filtered sessions)
  const filteredTaskProgress = payload.task_progress.filter((tp) =>
    filteredSessionIds.has(tp.session_id),
  );

  // Filter task_survey_responses (keep rows whose session_id is in filtered sessions)
  const filteredTaskSurveyResponses = payload.task_survey_responses.filter(
    (r) => filteredSessionIds.has(r.session_id),
  );

  // Filter task_interview_responses (keep rows whose user_id is in completed users)
  const filteredTaskInterviewResponses =
    payload.task_interview_responses.filter((r) =>
      completedUserIds.has(r.user_id),
    );

  return {
    profiles: filteredProfiles,
    task_sessions: filteredTaskSessions,
    task_progress: filteredTaskProgress,
    task_definitions: payload.task_definitions, // Reference data, unchanged
    task_surveys: payload.task_surveys, // Reference data, unchanged
    task_survey_questions: payload.task_survey_questions, // Reference data, unchanged
    task_survey_responses: filteredTaskSurveyResponses,
    task_interview_questions: payload.task_interview_questions, // Reference data, unchanged
    task_interview_responses: filteredTaskInterviewResponses,
    never_logged_in_count: payload.never_logged_in_count, // Pass through unchanged
    total_auth_users_count: payload.total_auth_users_count, // Pass through unchanged
  };
}

// ============================================================================
// Filter Payload by Demographic
// ============================================================================

export type DemographicDimension =
  | "age_range"
  | "gender"
  | "technical_proficiency"
  | "ai_tool_frequency";

export type DemographicCriterion = {
  dimension: DemographicDimension;
  values: string[];
};

/**
 * Filters the analysis payload to only include data from users who match ALL
 * of the given demographic criteria (AND across dimensions).
 * Within each dimension, multiple values use OR logic (match any selected value).
 */
export function filterPayloadByDemographics(
  payload: AnalysisPayload,
  criteria: DemographicCriterion[],
): AnalysisPayload {
  if (criteria.length === 0) return payload;

  const validCriteria = criteria.filter((c) => c.values.length > 0);
  if (validCriteria.length === 0) return payload;

  // Get set of user IDs whose profile matches ALL criteria (AND)
  // For each criterion, profile matches if it matches ANY of the values (OR)
  const matchingUserIds = new Set(
    payload.profiles
      .filter((p) =>
        validCriteria.every(({ dimension, values }) => {
          const profileValue = p[dimension];
          if (profileValue == null) return false;
          const valueSet = new Set(values);
          return valueSet.has(profileValue);
        }),
      )
      .map((p) => p.id),
  );

  const filteredProfiles = payload.profiles.filter((p) =>
    matchingUserIds.has(p.id),
  );

  const filteredTaskSessions = payload.task_sessions.filter((s) =>
    matchingUserIds.has(s.user_id),
  );

  const filteredSessionIds = new Set(
    filteredTaskSessions.map((s) => s.id),
  );

  const filteredTaskProgress = payload.task_progress.filter((tp) =>
    filteredSessionIds.has(tp.session_id),
  );

  const filteredTaskSurveyResponses = payload.task_survey_responses.filter(
    (r) => filteredSessionIds.has(r.session_id),
  );

  const filteredTaskInterviewResponses =
    payload.task_interview_responses.filter((r) =>
      matchingUserIds.has(r.user_id),
    );

  return {
    profiles: filteredProfiles,
    task_sessions: filteredTaskSessions,
    task_progress: filteredTaskProgress,
    task_definitions: payload.task_definitions,
    task_surveys: payload.task_surveys,
    task_survey_questions: payload.task_survey_questions,
    task_survey_responses: filteredTaskSurveyResponses,
    task_interview_questions: payload.task_interview_questions,
    task_interview_responses: filteredTaskInterviewResponses,
    never_logged_in_count: payload.never_logged_in_count,
    total_auth_users_count: payload.total_auth_users_count,
  };
}
