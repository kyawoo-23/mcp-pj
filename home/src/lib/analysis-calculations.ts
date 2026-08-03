import { SYSTEM_TYPE_KEYS } from "./constants";
import type {
  AnalysisPayload,
  SurveyQuestionRow,
  SurveyResponseRow,
  TaskSessionRow,
  TaskDefinitionRow,
  SystemType,
  UserInterviewResponseRow,
} from "./types";

// Analysis payloads include all protocol_version rows from the edge function.
// Callers filter by version via filterPayloadByProtocolVersion before metrics.

// ============================================================================
// Completed Users (canonical definition)
// ============================================================================

/**
 * Users who completed all tasks: user_id exists in task_interview_responses
 * (submitted the final interview/preference questions).
 * Used consistently across metrics, filtering, and paired analysis.
 */
export function getCompletedUserIds(
  task_interview_responses: UserInterviewResponseRow[],
): Set<string> {
  return new Set(task_interview_responses.map((r) => r.user_id));
}

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

/**
 * Compute user metrics from a payload.
 * For unfiltered data, uses server counts; for filtered views, derives from payload.
 */
export function calculateUserMetricsFromPayload(
  payload: AnalysisPayload,
  options?: { isFiltered: boolean },
): {
  totalUsers: number;
  neverLoggedIn: number;
  inProgress: number;
  completedAllTasks: number;
} {
  const { task_sessions, task_interview_responses } = payload;

  const totalUsers = options?.isFiltered
    ? payload.profiles.length
    : payload.total_auth_users_count;

  const neverLoggedIn = options?.isFiltered
    ? 0
    : payload.never_logged_in_count;

  const inProgressUserIds = new Set(
    task_sessions
      .filter((s) => s.status === "in_progress" || s.status === "not_started")
      .map((s) => s.user_id),
  );

  const completedUserIds = getCompletedUserIds(task_interview_responses);

  return {
    totalUsers,
    neverLoggedIn,
    inProgress: inProgressUserIds.size,
    completedAllTasks: completedUserIds.size,
  };
}

/** Alias for full unfiltered payload metrics. */
export function calculateUserMetrics(payload: AnalysisPayload) {
  return calculateUserMetricsFromPayload(payload, { isFiltered: false });
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

  // Technical proficiency distribution (v1_simple cohorts)
  const techProficiencyCounts: Record<string, number> = {};
  for (const profile of profiles) {
    const proficiency = profile.technical_proficiency || "unknown";
    techProficiencyCounts[proficiency] =
      (techProficiencyCounts[proficiency] || 0) + 1;
  }

  // Programming experience distribution (v2_criteria cohorts)
  const programmingExpCounts: Record<string, number> = {};
  for (const profile of profiles) {
    const experience = profile.programming_experience || "unknown";
    programmingExpCounts[experience] =
      (programmingExpCounts[experience] || 0) + 1;
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
    programmingExperience: Object.entries(programmingExpCounts).map(
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
  const { task_sessions, task_survey_responses } = payload;

  const setup = getSurveySetup(payload);
  if (!setup) {
    return { sus: [], rawTlx: [], sdt: [] };
  }
  const { susQuestions, tlxQuestions, sdtQuestions } = setup;

  // Use same sample as Paired Analysis: only users with both sessions and valid
  // scores for all constructs. This ensures Survey Results matches Paired section.
  const pairedRows = buildPairedSurveyData(payload);
  const pairedUserIds = new Set(pairedRows.map((r) => r.user_id));

  // Group sessions by system_type (only from paired users)
  const sessionsBySystem = Object.fromEntries(
    SYSTEM_TYPE_KEYS.map((k) => [k, [] as TaskSessionRow[]]),
  ) as Record<SystemType, TaskSessionRow[]>;

  for (const session of task_sessions) {
    if (session.status === "completed" && pairedUserIds.has(session.user_id)) {
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
// Survey Setup (shared by paired analysis and survey scores)
// ============================================================================

type SurveySetup = {
  susQuestions: SurveyQuestionRow[];
  tlxQuestions: SurveyQuestionRow[];
  sdtQuestions: SurveyQuestionRow[];
};

function getSurveySetup(payload: AnalysisPayload): SurveySetup | null {
  const { task_surveys, task_survey_questions } = payload;

  const susSurvey = task_surveys.find((s) => s.survey_name === "SUS");
  const tlxSurvey = task_surveys.find((s) => s.survey_name === "RAW_TLX");
  const sdtSurvey = task_surveys.find((s) => s.survey_name === "SDT");

  if (!susSurvey || !tlxSurvey || !sdtSurvey) return null;

  return {
    susQuestions: task_survey_questions.filter(
      (q) => q.survey_id === susSurvey.id,
    ),
    tlxQuestions: task_survey_questions.filter(
      (q) => q.survey_id === tlxSurvey.id,
    ),
    sdtQuestions: task_survey_questions.filter(
      (q) => q.survey_id === sdtSurvey.id,
    ),
  };
}

// ============================================================================
// Paired Survey Data (for within-subject statistical analysis)
// ============================================================================

export type PairedSurveyRow = {
  user_id: string;
  SUS_trad: number;
  SUS_chat: number;
  TLX_trad: number;
  TLX_chat: number;
  autonomy_trad: number;
  autonomy_chat: number;
  competence_trad: number;
  competence_chat: number;
  performanceSatisfaction_trad: number;
  performanceSatisfaction_chat: number;
  systemSatisfaction_trad: number;
  systemSatisfaction_chat: number;
};

/**
 * Build paired survey data for within-subject analysis.
 * Only includes users who: (1) have user_id in task_interview_responses
 * (same "completed" definition as filterPayloadToCompletedUsers), (2) have BOTH
 * completed sessions (traditional AND chat_agent), (3) valid survey scores for both.
 * Caller should pass already-filtered payload (e.g. filterPayloadByDemographics).
 */
export function buildPairedSurveyData(
  payload: AnalysisPayload,
): PairedSurveyRow[] {
  const {
    task_sessions,
    task_survey_responses,
    task_interview_responses,
  } = payload;

  const completedUserIds = getCompletedUserIds(task_interview_responses);

  const setup = getSurveySetup(payload);
  if (!setup) return [];

  const { susQuestions, tlxQuestions, sdtQuestions } = setup;

  // Group completed sessions by user_id and system_type
  type UserSessions = Partial<{
    traditional: TaskSessionRow;
    chat_agent: TaskSessionRow;
  }>;
  const sessionsByUser = new Map<string, UserSessions>();

  for (const session of task_sessions) {
    if (session.status !== "completed") continue;
    if (!completedUserIds.has(session.user_id)) continue;

    const existing: UserSessions = sessionsByUser.get(session.user_id) ?? {};
    if (session.system_type === "traditional") {
      existing.traditional = session;
    } else if (session.system_type === "chat_agent") {
      existing.chat_agent = session;
    }
    sessionsByUser.set(session.user_id, existing);
  }

  const rows: PairedSurveyRow[] = [];

  for (const [userId, sessions] of sessionsByUser) {
    const tradSession = sessions.traditional;
    const chatSession = sessions.chat_agent;

    if (!tradSession || !chatSession) continue;

    const susTrad = calculateSUS(
      susQuestions,
      task_survey_responses,
      tradSession.id,
    );
    const susChat = calculateSUS(
      susQuestions,
      task_survey_responses,
      chatSession.id,
    );
    const tlxTrad = calculateRawTLX(
      tlxQuestions,
      task_survey_responses,
      tradSession.id,
    );
    const tlxChat = calculateRawTLX(
      tlxQuestions,
      task_survey_responses,
      chatSession.id,
    );
    const sdtTrad = calculateSDT(
      sdtQuestions,
      task_survey_responses,
      tradSession.id,
    );
    const sdtChat = calculateSDT(
      sdtQuestions,
      task_survey_responses,
      chatSession.id,
    );

    if (
      susTrad === null ||
      susChat === null ||
      tlxTrad === null ||
      tlxChat === null ||
      sdtTrad.autonomy === null ||
      sdtChat.autonomy === null ||
      sdtTrad.competence === null ||
      sdtChat.competence === null ||
      sdtTrad.performanceSatisfaction === null ||
      sdtChat.performanceSatisfaction === null ||
      sdtTrad.systemSatisfaction === null ||
      sdtChat.systemSatisfaction === null
    ) {
      continue;
    }

    rows.push({
      user_id: userId,
      SUS_trad: susTrad,
      SUS_chat: susChat,
      TLX_trad: tlxTrad,
      TLX_chat: tlxChat,
      autonomy_trad: sdtTrad.autonomy,
      autonomy_chat: sdtChat.autonomy,
      competence_trad: sdtTrad.competence,
      competence_chat: sdtChat.competence,
      performanceSatisfaction_trad: sdtTrad.performanceSatisfaction,
      performanceSatisfaction_chat: sdtChat.performanceSatisfaction,
      systemSatisfaction_trad: sdtTrad.systemSatisfaction,
      systemSatisfaction_chat: sdtChat.systemSatisfaction,
    });
  }

  return rows;
}

// ============================================================================
// Paired Task Time Data (for H4 — Behavioral Efficiency)
// ============================================================================

export type PairedTaskTimeRow = {
  user_id: string;
  time_trad_ms: number;
  time_chat_ms: number;
};

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Build paired task completion time data for within-subject analysis (H4).
 * For each user with both system sessions, computes mean duration per system
 * across completed tasks. Excludes durations > 1 hour and requires started_at/completed_at.
 * Only includes users with at least one valid task duration per system.
 * Note: caller should pass an already-filtered payload (e.g. completed users only).
 */
export function buildPairedTaskTimeData(
  payload: AnalysisPayload,
): PairedTaskTimeRow[] {
  const { task_sessions, task_progress } = payload;

  type UserSessions = Partial<{
    traditional: TaskSessionRow;
    chat_agent: TaskSessionRow;
  }>;
  const sessionsByUser = new Map<string, UserSessions>();

  for (const session of task_sessions) {
    const existing: UserSessions = sessionsByUser.get(session.user_id) ?? {};
    if (session.system_type === "traditional") {
      existing.traditional = session;
    } else if (session.system_type === "chat_agent") {
      existing.chat_agent = session;
    }
    sessionsByUser.set(session.user_id, existing);
  }

  const rows: PairedTaskTimeRow[] = [];

  for (const [userId, sessions] of sessionsByUser) {
    const tradSession = sessions.traditional;
    const chatSession = sessions.chat_agent;

    if (!tradSession || !chatSession) continue;

    const computeMeanDuration = (sessionId: string): number | null => {
      const durations: number[] = [];
      for (const progress of task_progress) {
        if (
          progress.session_id !== sessionId ||
          progress.status !== "completed" ||
          !progress.started_at ||
          !progress.completed_at
        ) {
          continue;
        }
        const startedAt = new Date(progress.started_at).getTime();
        const completedAt = new Date(progress.completed_at).getTime();
        const duration = completedAt - startedAt;
        if (duration > 0 && duration <= ONE_HOUR_MS) {
          durations.push(duration);
        }
      }
      if (durations.length === 0) return null;
      return durations.reduce((sum, d) => sum + d, 0) / durations.length;
    };

    const timeTrad = computeMeanDuration(tradSession.id);
    const timeChat = computeMeanDuration(chatSession.id);

    if (timeTrad === null || timeChat === null) continue;

    rows.push({
      user_id: userId,
      time_trad_ms: timeTrad,
      time_chat_ms: timeChat,
    });
  }

  return rows;
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
// Filter Payload by Study Protocol Version
// ============================================================================

export type StudyProtocolVersion = "v1_simple" | "v2_criteria";

function rowMatchesProtocolVersion(
  protocolVersion: string | null | undefined,
  version: StudyProtocolVersion,
): boolean {
  const effective = protocolVersion ?? "v1_simple";
  return effective === version;
}

/**
 * Filters the analysis payload to rows for a single study protocol version.
 * Rows missing protocol_version are treated as v1_simple (pre-migration snapshots).
 */
export function filterPayloadByProtocolVersion(
  payload: AnalysisPayload,
  version: StudyProtocolVersion,
): AnalysisPayload {
  const filteredTaskProgress = payload.task_progress.filter((tp) =>
    rowMatchesProtocolVersion(tp.protocol_version, version),
  );
  const filteredTaskSurveyResponses = payload.task_survey_responses.filter(
    (r) => rowMatchesProtocolVersion(r.protocol_version, version),
  );
  const filteredTaskInterviewResponses =
    payload.task_interview_responses.filter((r) =>
      rowMatchesProtocolVersion(r.protocol_version, version),
    );

  const activeSessionIds = new Set<string>();
  for (const row of filteredTaskProgress) {
    activeSessionIds.add(row.session_id);
  }
  for (const row of filteredTaskSurveyResponses) {
    activeSessionIds.add(row.session_id);
  }

  const filteredTaskSessions = payload.task_sessions.filter((s) =>
    activeSessionIds.has(s.id),
  );

  const activeUserIds = new Set(filteredTaskSessions.map((s) => s.user_id));
  for (const row of filteredTaskInterviewResponses) {
    activeUserIds.add(row.user_id);
  }

  const filteredProfiles = payload.profiles.filter((p) =>
    activeUserIds.has(p.id),
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
  const completedUserIds = getCompletedUserIds(payload.task_interview_responses);

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
  | "programming_experience"
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
