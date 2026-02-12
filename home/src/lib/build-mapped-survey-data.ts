import type { AnalysisPayload } from "./types";

type FiltersApplied = Array<{ dimension: string; values: string[] }>;

const SYSTEM_TYPE_LABELS: Record<string, string> = {
  traditional: "Traditional UI",
  chat_agent: "Chat-based system",
};

function countByValue<T extends string | number>(
  values: (T | null)[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const v of values) {
    if (v !== null && v !== undefined) {
      const key = String(v);
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return counts;
}

function formatSurveyTotals(
  totals: Record<string, number>,
  scaleType: string
): Record<string, number> {
  const entries = Object.entries(totals);
  const numKeys = entries.filter(([k]) => /^\d+$/.test(k));
  const strKeys = entries.filter(([k]) => !/^\d+$/.test(k));
  numKeys.sort((a, b) => Number(a[0]) - Number(b[0]));
  const prefix =
    scaleType === "likert_5"
      ? "Likert "
      : scaleType === "likert_7"
        ? "Likert "
        : "";
  const withLabels = numKeys.map(([k, v]) => [prefix ? `${prefix}${k}` : k, v]);
  const sorted = [...withLabels, ...strKeys];
  return Object.fromEntries(sorted);
}

export type MappedSurveyQuestion = {
  orderIndex: number;
  text: string;
  construct: string | null;
  scaleType: string;
  totals: Record<string, number>;
};

export type MappedSurvey = {
  name: string;
  scaleInfo: string;
  questions: MappedSurveyQuestion[];
};

export type MappedSystemTypeData = {
  label: string;
  sessionCount: number;
  surveys: MappedSurvey[];
};

export type MappedInterviewQuestion = {
  questionText: string;
  orderIndex: number;
  totals: Record<string, number>;
};

export type MappedSurveyData = {
  tab: "all" | "completed";
  filtersApplied: FiltersApplied;
  bySystemType: {
    traditional: MappedSystemTypeData;
    chat_agent: MappedSystemTypeData;
  };
  /** Interview/preference totals (one answer per user, not per session) */
  interviewTotals: MappedInterviewQuestion[];
};

const SCALE_LABELS: Record<string, string> = {
  likert_5: "Likert 1–5",
  likert_7: "Likert 1–7",
  numeric_0_100: "0–100",
  free_text: "Free text",
};

/**
 * Builds aggregated survey and interview data grouped by system type.
 * Survey: raw totals per scale value (e.g. Likert 1: 3, Likert 2: 5).
 * Interview: totals per option (e.g. Traditional: 2, Both equally: 4).
 */
export function buildMappedSurveyData(
  payload: AnalysisPayload,
  tab: "all" | "completed",
  filtersApplied: FiltersApplied
): MappedSurveyData {
  const surveyOrder = ["SUS", "RAW_TLX", "SDT"] as const;

  function buildForSystemType(
    systemType: "traditional" | "chat_agent"
  ): MappedSystemTypeData {
    const sessions = payload.task_sessions.filter((s) => s.system_type === systemType);
    const sessionIds = new Set(sessions.map((s) => s.id));

    const responsesForSessions = payload.task_survey_responses.filter((r) =>
      sessionIds.has(r.session_id)
    );

    const surveys: MappedSurvey[] = surveyOrder
      .filter((name) => payload.task_surveys.some((s) => s.survey_name === name))
      .map((surveyName) => {
        const survey = payload.task_surveys.find((s) => s.survey_name === surveyName);
        if (!survey) return null;
        const questions = payload.task_survey_questions
          .filter((q) => q.survey_id === survey.id)
          .toSorted((a, b) => a.order_index - b.order_index);

        const scaleLabel =
          SCALE_LABELS[questions[0]?.scale_type ?? ""] ??
          (questions[0]
            ? `${questions[0].min_value ?? "?"}–${questions[0].max_value ?? "?"}`
            : "—");

        const mappedQuestions: MappedSurveyQuestion[] = questions.map((q) => {
          const questionResponses = responsesForSessions.filter(
            (r) => r.question_id === q.id
          );
          const values = questionResponses.map((r) =>
            r.response_value !== null ? r.response_value : r.response_text ?? null
          );
          const totals = formatSurveyTotals(
            countByValue(values),
            q.scale_type
          );
          return {
            orderIndex: q.order_index,
            text: q.question_text,
            construct: q.construct,
            scaleType: q.scale_type,
            totals,
          };
        });

        return {
          name: survey.survey_name,
          scaleInfo: scaleLabel,
          questions: mappedQuestions,
        };
      })
      .filter((s): s is MappedSurvey => s !== null);

    return {
      label: SYSTEM_TYPE_LABELS[systemType] ?? systemType,
      sessionCount: sessions.length,
      surveys,
    };
  }

  const userIdsInPayload = new Set(payload.profiles.map((p) => p.id));
  const interviewTotals: MappedSurveyData["interviewTotals"] =
    payload.task_interview_questions
      .toSorted((a, b) => a.order_index - b.order_index)
      .map((q) => {
        const responses = payload.task_interview_responses
          .filter(
            (r) => r.question_id === q.id && userIdsInPayload.has(r.user_id)
          )
          .map((r) => r.response_text);
        const totals = formatSurveyTotals(countByValue(responses), "choice");
        return {
          questionText: q.question_text,
          orderIndex: q.order_index,
          totals,
        };
      });

  return {
    tab,
    filtersApplied,
    bySystemType: {
      traditional: buildForSystemType("traditional"),
      chat_agent: buildForSystemType("chat_agent"),
    },
    interviewTotals,
  };
}
