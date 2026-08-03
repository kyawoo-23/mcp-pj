import { SYSTEM_TYPE_KEYS, type SystemTypeKey } from "./constants";
import type { AnalysisPayload, TaskSessionRow } from "./types";
import {
  calculateSUS,
  calculateSDT,
  calculatePreferenceResponses,
  filterPayloadToCompletedUsers,
  filterPayloadByDemographics,
  buildPairedSurveyData,
  type StudyProtocolVersion,
} from "./analysis-calculations";

// ============================================================================
// Population Filtering
// ============================================================================

/** Get completed-only payload */
export function getCompletedPayload(payload: AnalysisPayload): AnalysisPayload {
  return filterPayloadToCompletedUsers(payload);
}

/** Filter payload to the advanced skill subgroup for the given protocol. */
export function getAdvancedPayload(
  payload: AnalysisPayload,
  protocolVersion: StudyProtocolVersion = "v2_criteria",
): AnalysisPayload {
  const criteria =
    protocolVersion === "v1_simple"
      ? { dimension: "technical_proficiency" as const, values: ["advanced"] }
      : {
          dimension: "technical_experience" as const,
          values: ["more_than_three_years"],
        };
  return filterPayloadByDemographics(payload, [criteria]);
}

export type AdvancedSubgroupCopy = {
  tabLabel: string;
  chartShortLabel: string;
  introLongLabel: string;
  susFindingLead: string;
  susFindingTail: string;
};

export function getAdvancedSubgroupCopy(
  protocolVersion: StudyProtocolVersion,
): AdvancedSubgroupCopy {
  if (protocolVersion === "v1_simple") {
    return {
      tabLabel: "Advanced Tech Skills",
      chartShortLabel: "Advanced Technical",
      introLongLabel: "advanced technical proficiency",
      susFindingLead: "technically advanced users",
      susFindingTail: "Experienced users",
    };
  }
  return {
    tabLabel: ">3 yrs technical",
    chartShortLabel: ">3 yrs technical",
    introLongLabel: "more than 3 years of technical/computer experience",
    susFindingLead:
      "participants with more than 3 years of technical/computer experience",
    susFindingTail: "Experienced participants",
  };
}

// ============================================================================
// A. SUS Comparison (Table IV)
// ============================================================================

export type SUSComparisonRow = {
  systemType: SystemTypeKey;
  allMean: number;
  allCount: number;
  advancedMean: number;
  advancedCount: number;
};

function computeSUSMeans(
  payload: AnalysisPayload,
): { systemType: SystemTypeKey; mean: number; count: number }[] {
  const { task_sessions, task_surveys, task_survey_questions, task_survey_responses } = payload;

  const susSurvey = task_surveys.find((s) => s.survey_name === "SUS");
  if (!susSurvey) return SYSTEM_TYPE_KEYS.map((st) => ({ systemType: st, mean: 0, count: 0 }));

  const susQuestions = task_survey_questions.filter((q) => q.survey_id === susSurvey.id);

  // Use paired sample for consistency
  const pairedRows = buildPairedSurveyData(payload);
  const pairedUserIds = new Set(pairedRows.map((r) => r.user_id));

  return SYSTEM_TYPE_KEYS.map((systemType) => {
    const sessions = task_sessions.filter(
      (s) => s.system_type === systemType && s.status === "completed" && pairedUserIds.has(s.user_id),
    );

    const scores: number[] = [];
    for (const session of sessions) {
      const score = calculateSUS(susQuestions, task_survey_responses, session.id);
      if (score !== null) scores.push(score);
    }

    const mean = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
    return { systemType, mean, count: scores.length };
  });
}

export function calculateSUSComparison(
  allPayload: AnalysisPayload,
  advancedPayload: AnalysisPayload,
): SUSComparisonRow[] {
  const allMeans = computeSUSMeans(allPayload);
  const advancedMeans = computeSUSMeans(advancedPayload);

  return SYSTEM_TYPE_KEYS.map((st) => ({
    systemType: st,
    allMean: allMeans.find((m) => m.systemType === st)?.mean ?? 0,
    allCount: allMeans.find((m) => m.systemType === st)?.count ?? 0,
    advancedMean: advancedMeans.find((m) => m.systemType === st)?.mean ?? 0,
    advancedCount: advancedMeans.find((m) => m.systemType === st)?.count ?? 0,
  }));
}

// ============================================================================
// B. TLX Dimension-Level Data (Radar Charts)
// ============================================================================

export const TLX_DIMENSIONS = [
  { orderIndex: 3, label: "Temporal Demand" },
  { orderIndex: 2, label: "Physical Demand" },
  { orderIndex: 1, label: "Mental Demand" },
  { orderIndex: 6, label: "Frustration" },
  { orderIndex: 5, label: "Effort" },
  { orderIndex: 4, label: "Performance*" },
] as const;

export type TLXRadarDataPoint = {
  dimension: string;
  chat: number;
  traditional: number;
  fullMark: number;
};

function computeTLXDimensionMeans(
  payload: AnalysisPayload,
): TLXRadarDataPoint[] {
  const { task_sessions, task_surveys, task_survey_questions, task_survey_responses } = payload;

  const tlxSurvey = task_surveys.find((s) => s.survey_name === "RAW_TLX");
  if (!tlxSurvey) {
    return TLX_DIMENSIONS.map((d) => ({
      dimension: d.label,
      chat: 0,
      traditional: 0,
      fullMark: 100,
    }));
  }

  const tlxQuestions = task_survey_questions
    .filter((q) => q.survey_id === tlxSurvey.id)
    .sort((a, b) => a.order_index - b.order_index);

  // Use paired sample
  const pairedRows = buildPairedSurveyData(payload);
  const pairedUserIds = new Set(pairedRows.map((r) => r.user_id));

  const sessionsBySystem: Record<SystemTypeKey, TaskSessionRow[]> = {
    chat_agent: [],
    traditional: [],
  };

  for (const session of task_sessions) {
    if (session.status === "completed" && pairedUserIds.has(session.user_id)) {
      sessionsBySystem[session.system_type].push(session);
    }
  }

  return TLX_DIMENSIONS.map((dim) => {
    const question = tlxQuestions.find((q) => q.order_index === dim.orderIndex);
    if (!question) {
      return { dimension: dim.label, chat: 0, traditional: 0, fullMark: 100 };
    }

    const getMean = (systemType: SystemTypeKey): number => {
      const values: number[] = [];
      for (const session of sessionsBySystem[systemType]) {
        const response = task_survey_responses.find(
          (r) => r.session_id === session.id && r.question_id === question.id,
        );
        if (response?.response_value != null) {
          // Performance (order_index 4): show raw value (higher = better performance)
          // For display in radar chart, we show it as-is with asterisk note
          values.push(response.response_value);
        }
      }
      return values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    };

    return {
      dimension: dim.label,
      chat: getMean("chat_agent"),
      traditional: getMean("traditional"),
      fullMark: 100,
    };
  });
}

export function calculateTLXComparison(
  allPayload: AnalysisPayload,
  advancedPayload: AnalysisPayload,
): { all: TLXRadarDataPoint[]; advanced: TLXRadarDataPoint[] } {
  return {
    all: computeTLXDimensionMeans(allPayload),
    advanced: computeTLXDimensionMeans(advancedPayload),
  };
}

// ============================================================================
// C. SDT Comparison
// ============================================================================

export type SDTComparisonDataPoint = {
  construct: string;
  chat: number;
  traditional: number;
  fullMark: number;
};

export type SDTComparisonData = {
  all: SDTComparisonDataPoint[];
  advanced: SDTComparisonDataPoint[];
};

function computeSDTMeans(payload: AnalysisPayload): SDTComparisonDataPoint[] {
  const { task_sessions, task_surveys, task_survey_questions, task_survey_responses } = payload;

  const sdtSurvey = task_surveys.find((s) => s.survey_name === "SDT");
  if (!sdtSurvey) {
    return ["Autonomy", "Competence", "Perf. Satisfaction", "Sys. Satisfaction"].map((c) => ({
      construct: c,
      chat: 0,
      traditional: 0,
      fullMark: 7,
    }));
  }

  const sdtQuestions = task_survey_questions.filter((q) => q.survey_id === sdtSurvey.id);

  const pairedRows = buildPairedSurveyData(payload);
  const pairedUserIds = new Set(pairedRows.map((r) => r.user_id));

  const sessionsBySystem: Record<SystemTypeKey, TaskSessionRow[]> = {
    chat_agent: [],
    traditional: [],
  };

  for (const session of task_sessions) {
    if (session.status === "completed" && pairedUserIds.has(session.user_id)) {
      sessionsBySystem[session.system_type].push(session);
    }
  }

  const constructs = [
    { label: "Autonomy", key: "autonomy" as const },
    { label: "Competence", key: "competence" as const },
    { label: "Perf. Satisfaction", key: "performanceSatisfaction" as const },
    { label: "Sys. Satisfaction", key: "systemSatisfaction" as const },
  ];

  return constructs.map((construct) => {
    const getSystemMean = (systemType: SystemTypeKey): number => {
      const values: number[] = [];
      for (const session of sessionsBySystem[systemType]) {
        const sdt = calculateSDT(sdtQuestions, task_survey_responses, session.id);
        const val = sdt[construct.key];
        if (val !== null) values.push(val);
      }
      return values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    };

    return {
      construct: construct.label,
      chat: getSystemMean("chat_agent"),
      traditional: getSystemMean("traditional"),
      fullMark: 7,
    };
  });
}

export function calculateSDTComparison(
  allPayload: AnalysisPayload,
  advancedPayload: AnalysisPayload,
): SDTComparisonData {
  return {
    all: computeSDTMeans(allPayload),
    advanced: computeSDTMeans(advancedPayload),
  };
}

// ============================================================================
// D. Preference Comparison (Q1-Q4)
// ============================================================================

export type PreferenceComparisonQuestion = {
  questionText: string;
  shortLabel: string;
  orderIndex: number;
  allResponses: { label: string; percentage: number; count: number }[];
  advancedResponses: { label: string; percentage: number; count: number }[];
};

const PREFERENCE_SHORT_LABELS: Record<number, string> = {
  1: "Control",
  2: "Clarity",
  3: "Predictability",
  4: "Trust",
  5: "Task Preference",
};

export function calculatePreferenceComparison(
  allPayload: AnalysisPayload,
  advancedPayload: AnalysisPayload,
): PreferenceComparisonQuestion[] {
  const allPrefs = calculatePreferenceResponses(allPayload);
  const advPrefs = calculatePreferenceResponses(advancedPayload);

  return allPrefs
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .filter((p) => p.orderIndex <= 4) // Q1-Q4 only for section D
    .map((allPref) => {
      const advPref = advPrefs.find((p) => p.orderIndex === allPref.orderIndex);
      return {
        questionText: allPref.questionText,
        shortLabel: PREFERENCE_SHORT_LABELS[allPref.orderIndex] || `Q${allPref.orderIndex}`,
        orderIndex: allPref.orderIndex,
        allResponses: allPref.responses,
        advancedResponses: advPref?.responses ?? [],
      };
    });
}

// ============================================================================
// E. Task-Based Preference (Q5 - Table V)
// ============================================================================

export type TaskPreferenceRow = {
  label: string;
  allPercentage: number;
  advancedPercentage: number;
};

export function calculateTaskPreference(
  allPayload: AnalysisPayload,
  advancedPayload: AnalysisPayload,
): TaskPreferenceRow[] {
  const allPrefs = calculatePreferenceResponses(allPayload);
  const advPrefs = calculatePreferenceResponses(advancedPayload);

  const q5All = allPrefs.find((p) => p.orderIndex === 5);
  const q5Adv = advPrefs.find((p) => p.orderIndex === 5);

  if (!q5All) return [];

  // Canonical order for Table V
  const ORDER = [
    "Chat for simple tasks, UI for complex tasks",
    "Traditional UI for most tasks",
    "Chat-based system for most tasks",
    "No clear preference",
  ];

  return ORDER.map((label) => {
    const allR = q5All.responses.find((r) => r.label === label);
    const advR = q5Adv?.responses.find((r) => r.label === label);
    return {
      label,
      allPercentage: allR?.percentage ?? 0,
      advancedPercentage: advR?.percentage ?? 0,
    };
  });
}

// ============================================================================
// Master function: compute all empirical comparison data
// ============================================================================

export function computeEmpiricalData(
  payload: AnalysisPayload,
  protocolVersion: StudyProtocolVersion = "v2_criteria",
) {
  const completed = filterPayloadToCompletedUsers(payload);
  const advanced = getAdvancedPayload(completed, protocolVersion);
  const advancedSubgroupCopy = getAdvancedSubgroupCopy(protocolVersion);

  return {
    allCount: completed.profiles.length,
    advancedCount: advanced.profiles.length,
    advancedSubgroupCopy,
    sus: calculateSUSComparison(completed, advanced),
    tlx: calculateTLXComparison(completed, advanced),
    sdt: calculateSDTComparison(completed, advanced),
    preferences: calculatePreferenceComparison(completed, advanced),
    taskPreference: calculateTaskPreference(completed, advanced),
  };
}

export type EmpiricalData = ReturnType<typeof computeEmpiricalData>;
