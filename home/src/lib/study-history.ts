import type { StudyProtocolVersion } from "@/lib/analysis-calculations";
import {
  calculateRawTLX,
  calculateSDT,
  calculateSUS,
  formatDuration,
} from "@/lib/analysis-calculations";
import {
  COMPARE_PROTOCOL_LABELS,
  PROTOCOL_VERSIONS,
} from "@/lib/study-protocol-labels";
import type {
  InterviewQuestionRow,
  SurveyQuestionRow,
  SurveyResponseRow,
  SurveyRow,
  SystemType,
  TaskDefinitionRow,
  TaskProgressRow,
  TaskSessionRow,
} from "@/lib/types";

export const HISTORY_SYSTEM_LABELS: Record<SystemType, string> = {
  traditional: "Traditional portal",
  chat_agent: "Chat agent",
};

export const HISTORY_SURVEY_LABELS: Record<string, string> = {
  SUS: "System Usability",
  RAW_TLX: "Workload Assessment",
  SDT: "User Experience",
};

const HISTORY_SURVEY_ORDER = ["SUS", "RAW_TLX", "SDT"];

export type StudyHistoryTask = TaskProgressRow & {
  task_definitions: Pick<
    TaskDefinitionRow,
    "task_code" | "title" | "description" | "system_type"
  >;
  task_sessions: Pick<TaskSessionRow, "system_type">;
};

export type StudyHistorySurveyResponse = {
  id: string;
  question_id: string;
  response_value: number | null;
  response_text: string | null;
  session_id: string;
  protocol_version: StudyProtocolVersion;
  task_survey_questions: Pick<
    SurveyQuestionRow,
    "question_text" | "order_index" | "construct" | "scale_type"
  > & {
    task_surveys: Pick<SurveyRow, "survey_name" | "version">;
  };
  task_sessions: Pick<TaskSessionRow, "system_type">;
};

export type StudyHistoryInterview = {
  id: string;
  question_id: string;
  response_text: string;
  created_at: string;
  protocol_version: StudyProtocolVersion;
  task_interview_questions: Pick<
    InterviewQuestionRow,
    "question_text" | "order_index"
  >;
};

export function groupHistoryTasksBySystem(tasks: StudyHistoryTask[]) {
  const grouped: Record<SystemType, StudyHistoryTask[]> = {
    traditional: [],
    chat_agent: [],
  };
  for (const task of tasks) {
    const systemType = task.task_sessions.system_type;
    grouped[systemType].push(task);
  }
  return grouped;
}

const STATUS_LABELS: Record<TaskProgressRow["status"], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export function formatHistoryStatus(status: TaskProgressRow["status"]): string {
  return STATUS_LABELS[status];
}

export function formatHistoryDate(
  iso: string | null | undefined,
): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatHistoryResponse(
  responseValue: number | null,
  responseText: string | null,
  scaleType: string,
): string {
  const text = responseText?.trim();
  if (text) return text;
  if (responseValue === null) return "No answer recorded";

  switch (scaleType) {
    case "likert_5":
      return `Rating ${responseValue} of 5`;
    case "likert_7":
      return `Rating ${responseValue} of 7`;
    case "numeric_0_100":
      return `${responseValue} out of 100`;
    default:
      return String(responseValue);
  }
}

export function countCompletedTasks(tasks: StudyHistoryTask[]): {
  completed: number;
  total: number;
} {
  const completed = tasks.filter((t) => t.status === "completed").length;
  return { completed, total: tasks.length };
}

export function groupSurveyResponsesBySurvey(
  rows: StudyHistorySurveyResponse[],
): Map<string, StudyHistorySurveyResponse[]> {
  const grouped = new Map<string, StudyHistorySurveyResponse[]>();
  for (const row of rows) {
    const surveyName = row.task_survey_questions.task_surveys.survey_name;
    const list = grouped.get(surveyName) ?? [];
    list.push(row);
    grouped.set(surveyName, list);
  }
  for (const list of grouped.values()) {
    list.sort(
      (a, b) =>
        a.task_survey_questions.order_index -
        b.task_survey_questions.order_index,
    );
  }
  return grouped;
}

export function sortSurveyNames(names: string[]): string[] {
  return [...names].sort((a, b) => {
    const ai = HISTORY_SURVEY_ORDER.indexOf(a);
    const bi = HISTORY_SURVEY_ORDER.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

export function surveyDisplayTitle(surveyName: string): string {
  return HISTORY_SURVEY_LABELS[surveyName] ?? surveyName;
}

export function systemsWithHistoryData(
  tasksBySystem: Record<SystemType, StudyHistoryTask[]>,
  surveysBySystem: Record<string, StudyHistorySurveyResponse[]>,
): SystemType[] {
  const systems: SystemType[] = [];
  for (const system of ["traditional", "chat_agent"] as const) {
    if (
      tasksBySystem[system].length > 0 ||
      (surveysBySystem[system]?.length ?? 0) > 0
    ) {
      systems.push(system);
    }
  }
  return systems;
}

export type ProtocolParticipationData = {
  tasks: StudyHistoryTask[];
  surveyResponses: StudyHistorySurveyResponse[];
  interviewResponses: StudyHistoryInterview[];
};

export type ProtocolParticipationSummary = {
  tasksCompleted: number;
  tasksTotal: number;
  surveyAnswers: number;
  interviewAnswers: number;
};

function filterByProtocol<T extends { protocol_version: StudyProtocolVersion }>(
  rows: T[],
  version: StudyProtocolVersion,
): T[] {
  return rows.filter((row) => row.protocol_version === version);
}

export function groupHistoryByProtocol(
  tasks: StudyHistoryTask[],
  surveyResponses: StudyHistorySurveyResponse[],
  interviewResponses: StudyHistoryInterview[],
): Map<StudyProtocolVersion, ProtocolParticipationData> {
  const grouped = new Map<StudyProtocolVersion, ProtocolParticipationData>();

  for (const version of PROTOCOL_VERSIONS) {
    const versionTasks = filterByProtocol(tasks, version);
    const versionSurveys = filterByProtocol(surveyResponses, version);
    const versionInterviews = filterByProtocol(interviewResponses, version);

    grouped.set(version, {
      tasks: versionTasks,
      surveyResponses: versionSurveys,
      interviewResponses: versionInterviews,
    });
  }

  return grouped;
}

export function protocolSectionHasData(
  tasks: StudyHistoryTask[],
  surveyResponses: StudyHistorySurveyResponse[],
  interviewResponses: StudyHistoryInterview[],
): boolean {
  return (
    tasks.length > 0 ||
    surveyResponses.length > 0 ||
    interviewResponses.length > 0
  );
}

export function buildProtocolSummary(
  tasks: StudyHistoryTask[],
  surveyResponses: StudyHistorySurveyResponse[],
  interviewResponses: StudyHistoryInterview[],
): ProtocolParticipationSummary {
  const taskStats = countCompletedTasks(tasks);
  return {
    tasksCompleted: taskStats.completed,
    tasksTotal: taskStats.total,
    surveyAnswers: surveyResponses.length,
    interviewAnswers: interviewResponses.length,
  };
}

export function protocolsWithParticipationData(
  grouped: Map<StudyProtocolVersion, ProtocolParticipationData>,
): StudyProtocolVersion[] {
  return PROTOCOL_VERSIONS.filter((version) => {
    const data = grouped.get(version);
    if (!data) return false;
    return protocolSectionHasData(
      data.tasks,
      data.surveyResponses,
      data.interviewResponses,
    );
  });
}

export function getAvailableProtocols(
  grouped: Map<StudyProtocolVersion, ProtocolParticipationData>,
): StudyProtocolVersion[] {
  return protocolsWithParticipationData(grouped);
}

// ============================================================================
// Compare view: modality filter, metrics, deltas, construct groups
// ============================================================================

export type HistoryModalityFilter = "all" | SystemType;

/** User-facing labels for the study-history modality filter. */
export const HISTORY_MODALITY_FILTER_LABELS: Record<
  HistoryModalityFilter,
  string
> = {
  all: "Traditional + Chat",
  traditional: HISTORY_SYSTEM_LABELS.traditional,
  chat_agent: HISTORY_SYSTEM_LABELS.chat_agent,
};

export const HISTORY_MODALITY_FILTER_HEADING = "Show results for";

export const HISTORY_MODALITY_FILTER_INFO = {
  title: "How you used the study",
  description:
    "You could complete tasks through a standard web interface (Traditional portal) or an AI chat assistant (Chat agent). Filter results by interface, or combine both.",
  options: {
    all: "Combined metrics from Traditional portal and Chat agent sessions.",
    traditional:
      "Only results from the standard web forms and buttons interface.",
    chat_agent: "Only results from the conversational chat assistant.",
  } satisfies Record<HistoryModalityFilter, string>,
} as const;

type HistoryRowWithSystem = {
  task_sessions: Pick<TaskSessionRow, "system_type">;
};

export function filterHistoryByModality<T extends HistoryRowWithSystem>(
  rows: T[],
  modality: HistoryModalityFilter,
): T[] {
  if (modality === "all") return rows;
  return rows.filter((row) => row.task_sessions.system_type === modality);
}

/** True when the modality has started tasks or recorded survey answers (not bare rows). */
export function modalityHasMeaningfulCompareData(
  tasks: StudyHistoryTask[],
  surveyResponses: StudyHistorySurveyResponse[],
  modality: HistoryModalityFilter,
): boolean {
  const filteredTasks = filterHistoryByModality(tasks, modality);
  const filteredSurveys = filterHistoryByModality(surveyResponses, modality);

  const hasTaskProgress = filteredTasks.some(
    (task) => task.status === "completed" || task.status === "in_progress",
  );
  const hasSurveyAnswers = filteredSurveys.some(
    (response) =>
      response.response_value !== null ||
      Boolean(response.response_text?.trim()),
  );

  return hasTaskProgress || hasSurveyAnswers;
}

export type ProtocolMetrics = {
  hasData: boolean;
  taskCompletionRate: number | null;
  tasksCompleted: number;
  tasksTotal: number;
  avgTaskTimeMs: number | null;
  avgTaskTimeFormatted: string | null;
  susScore: number | null;
  rawTlx: number | null;
  autonomy: number | null;
  systemSatisfaction: number | null;
  competence: number | null;
  performanceSatisfaction: number | null;
  incompleteTaskCount: number;
  surveyAnswerCount: number;
  interviewAnswerCount: number;
  overallProgress: number | null;
};

function toScorerQuestions(
  rows: StudyHistorySurveyResponse[],
  surveyName: string,
): SurveyQuestionRow[] {
  const map = new Map<string, SurveyQuestionRow>();
  for (const row of rows) {
    if (row.task_survey_questions.task_surveys.survey_name !== surveyName) {
      continue;
    }
    if (!map.has(row.question_id)) {
      map.set(row.question_id, {
        id: row.question_id,
        survey_id: "",
        question_text: row.task_survey_questions.question_text,
        scale_type: row.task_survey_questions.scale_type,
        min_value: null,
        max_value: null,
        order_index: row.task_survey_questions.order_index,
        construct: row.task_survey_questions.construct,
        created_at: "",
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.order_index - b.order_index);
}

function toScorerResponses(
  rows: StudyHistorySurveyResponse[],
  surveyName: string,
): SurveyResponseRow[] {
  return rows
    .filter(
      (row) =>
        row.task_survey_questions.task_surveys.survey_name === surveyName,
    )
    .map(
      (row): SurveyResponseRow => ({
        id: row.id,
        session_id: row.session_id,
        question_id: row.question_id,
        response_value: row.response_value,
        response_text: row.response_text,
        created_at: "",
        protocol_version: row.protocol_version,
      }),
    );
}

function meanNullable(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

function sessionIdsFromSurveys(rows: StudyHistorySurveyResponse[]): string[] {
  return [...new Set(rows.map((r) => r.session_id))];
}

function meanSusScore(rows: StudyHistorySurveyResponse[]): number | null {
  const questions = toScorerQuestions(rows, "SUS");
  const responses = toScorerResponses(rows, "SUS");
  const sessionIds = sessionIdsFromSurveys(
    rows.filter(
      (r) => r.task_survey_questions.task_surveys.survey_name === "SUS",
    ),
  );
  return meanNullable(
    sessionIds.map((sid) => calculateSUS(questions, responses, sid)),
  );
}

function meanRawTlx(rows: StudyHistorySurveyResponse[]): number | null {
  const questions = toScorerQuestions(rows, "RAW_TLX");
  const responses = toScorerResponses(rows, "RAW_TLX");
  const sessionIds = sessionIdsFromSurveys(
    rows.filter(
      (r) => r.task_survey_questions.task_surveys.survey_name === "RAW_TLX",
    ),
  );
  return meanNullable(
    sessionIds.map((sid) => calculateRawTLX(questions, responses, sid)),
  );
}

function meanSdtSubscale(
  rows: StudyHistorySurveyResponse[],
  key:
    | "autonomy"
    | "competence"
    | "performanceSatisfaction"
    | "systemSatisfaction",
): number | null {
  const questions = toScorerQuestions(rows, "SDT");
  const responses = toScorerResponses(rows, "SDT");
  const sessionIds = sessionIdsFromSurveys(
    rows.filter(
      (r) => r.task_survey_questions.task_surveys.survey_name === "SDT",
    ),
  );
  return meanNullable(
    sessionIds.map((sid) => calculateSDT(questions, responses, sid)[key]),
  );
}

function averageTaskDurationMs(tasks: StudyHistoryTask[]): number | null {
  const durations: number[] = [];
  for (const task of tasks) {
    if (task.status !== "completed" || !task.started_at || !task.completed_at) {
      continue;
    }
    const start = new Date(task.started_at).getTime();
    const end = new Date(task.completed_at).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) continue;
    durations.push(end - start);
  }
  if (durations.length === 0) return null;
  return durations.reduce((sum, d) => sum + d, 0) / durations.length;
}

export function buildProtocolMetrics(
  tasks: StudyHistoryTask[],
  surveyResponses: StudyHistorySurveyResponse[],
  interviewResponses: StudyHistoryInterview[],
  modality: HistoryModalityFilter = "all",
): ProtocolMetrics {
  const filteredTasks = filterHistoryByModality(tasks, modality);
  const filteredSurveys = filterHistoryByModality(surveyResponses, modality);

  const taskStats = countCompletedTasks(filteredTasks);
  const hasData =
    filteredTasks.length > 0 ||
    filteredSurveys.length > 0 ||
    interviewResponses.length > 0;

  const taskCompletionRate =
    taskStats.total > 0
      ? (taskStats.completed / taskStats.total) * 100
      : null;

  const avgTaskTimeMs = averageTaskDurationMs(filteredTasks);
  const incompleteTaskCount = filteredTasks.filter(
    (t) => t.status !== "completed",
  ).length;

  const expectedSurveyItems = 26;
  const expectedTasks = taskStats.total > 0 ? taskStats.total : 4;
  const expectedInterview = 5;
  const progressParts = [
    taskStats.completed / expectedTasks,
    filteredSurveys.length / expectedSurveyItems,
    interviewResponses.filter((r) => r.response_text?.trim()).length /
      expectedInterview,
  ];
  const overallProgress =
    hasData
      ? Math.min(
          100,
          Math.round(
            (progressParts.reduce((s, p) => s + p, 0) / progressParts.length) *
              100,
          ),
        )
      : null;

  return {
    hasData,
    taskCompletionRate,
    tasksCompleted: taskStats.completed,
    tasksTotal: taskStats.total,
    avgTaskTimeMs,
    avgTaskTimeFormatted:
      avgTaskTimeMs !== null ? formatDuration(avgTaskTimeMs) : null,
    susScore: meanSusScore(filteredSurveys),
    rawTlx: meanRawTlx(filteredSurveys),
    autonomy: meanSdtSubscale(filteredSurveys, "autonomy"),
    systemSatisfaction: meanSdtSubscale(filteredSurveys, "systemSatisfaction"),
    competence: meanSdtSubscale(filteredSurveys, "competence"),
    performanceSatisfaction: meanSdtSubscale(
      filteredSurveys,
      "performanceSatisfaction",
    ),
    incompleteTaskCount,
    surveyAnswerCount: filteredSurveys.length,
    interviewAnswerCount: interviewResponses.filter((r) =>
      r.response_text?.trim(),
    ).length,
    overallProgress,
  };
}

export type DeltaDirection = "better" | "worse" | "same" | "unavailable";

export type DeltaIndicator = {
  direction: DeltaDirection;
  label: string;
  ariaLabel: string;
};

export function formatDelta(
  criteriaValue: number | null,
  simpleValue: number | null,
  options: {
    higherIsBetter: boolean;
    mode?: "percent" | "absolute";
    unit?: string;
    decimals?: number;
  },
): DeltaIndicator {
  if (criteriaValue === null || simpleValue === null) {
    return {
      direction: "unavailable",
      label: "—",
      ariaLabel: "Comparison unavailable",
    };
  }

  if (criteriaValue === simpleValue) {
    return {
      direction: "same",
      label: "Same",
      ariaLabel: "Same as Simple Tasks",
    };
  }

  const criteriaBetter = options.higherIsBetter
    ? criteriaValue > simpleValue
    : criteriaValue < simpleValue;

  const arrow = criteriaBetter ? "↑" : "↓";
  const delta = criteriaValue - simpleValue;
  const decimals = options.decimals ?? 1;

  let label = arrow;
  if (options.mode === "absolute") {
    const amount = Math.abs(delta).toFixed(decimals);
    label = `${arrow} ${amount}${options.unit ?? ""}`;
  } else {
    const pctChange =
      simpleValue === 0
        ? null
        : Math.round((delta / Math.abs(simpleValue)) * 100);
    label = pctChange !== null ? `${arrow} ${Math.abs(pctChange)}%` : arrow;
  }

  return {
    direction: criteriaBetter ? "better" : "worse",
    label,
    ariaLabel: `Criteria Tasks ${criteriaBetter ? "higher" : "lower"} than Simple Tasks`,
  };
}

export type CompareRowFormat =
  | "percent"
  | "duration"
  | "score"
  | "count"
  | "sus"
  | "tlx"
  | "likert7";

export type CompareRow = {
  id: string;
  label: string;
  description: string;
  simpleValue: number | null;
  criteriaValue: number | null;
  simpleDisplay: string;
  criteriaDisplay: string;
  simpleBarPercent: number | null;
  criteriaBarPercent: number | null;
  higherIsBetter: boolean;
  delta: DeltaIndicator;
};

function formatMetricValue(
  value: number | null,
  format: CompareRowFormat,
  tasksCompleted?: number,
  tasksTotal?: number,
): string {
  if (value === null) return "—";
  switch (format) {
    case "percent":
      return `${value.toFixed(1)}%`;
    case "duration":
      return formatDuration(value);
    case "sus":
      return `${value.toFixed(1)}`;
    case "tlx":
      return `${value.toFixed(1)}`;
    case "likert7":
      return `${value.toFixed(1)} / 7`;
    case "count":
      return String(Math.round(value));
    case "score":
    default:
      if (
        tasksTotal !== undefined &&
        tasksCompleted !== undefined &&
        tasksTotal > 0
      ) {
        return `${value.toFixed(0)}% (${tasksCompleted}/${tasksTotal})`;
      }
      return `${Math.round(value)}%`;
  }
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function getBarPercent(
  value: number | null,
  format: CompareRowFormat,
): number | null {
  if (value === null) return null;
  switch (format) {
    case "percent":
      return clampPercent(value);
    case "duration":
      return null;
    case "sus":
    case "tlx":
      return clampPercent(value);
    case "likert7":
      return clampPercent((value / 7) * 100);
    case "score":
      return clampPercent(value);
    case "count":
      return null;
    default:
      return null;
  }
}

function buildOverallScore(metrics: ProtocolMetrics): number | null {
  const parts: number[] = [];
  if (metrics.taskCompletionRate !== null) {
    parts.push(metrics.taskCompletionRate);
  }
  if (metrics.rawTlx !== null) {
    parts.push(100 - metrics.rawTlx);
  }
  if (metrics.susScore !== null) {
    parts.push(metrics.susScore);
  }
  if (metrics.systemSatisfaction !== null) {
    parts.push((metrics.systemSatisfaction / 7) * 100);
  }
  if (parts.length === 0) return null;
  return parts.reduce((sum, part) => sum + part, 0) / parts.length;
}

function buildErrorRate(metrics: ProtocolMetrics): number | null {
  if (metrics.tasksTotal === 0) return null;
  return (metrics.incompleteTaskCount / metrics.tasksTotal) * 100;
}

export function compareProtocols(
  simple: ProtocolMetrics,
  criteria: ProtocolMetrics,
): CompareRow[] {
  const rows: Array<{
    id: string;
    label: string;
    description: string;
    simpleVal: number | null;
    criteriaVal: number | null;
    format: CompareRowFormat;
    higherIsBetter: boolean;
    tasksCompleted?: number;
    tasksTotal?: number;
    criteriaTasksCompleted?: number;
    criteriaTasksTotal?: number;
    deltaMode?: "percent" | "absolute";
    deltaUnit?: string;
    deltaDecimals?: number;
  }> = [
    {
      id: "overall_score",
      label: "Overall score",
      description: "Composite of completion, usability, workload, and satisfaction",
      simpleVal: buildOverallScore(simple),
      criteriaVal: buildOverallScore(criteria),
      format: "percent",
      higherIsBetter: true,
    },
    {
      id: "overall_progress",
      label: "Overall progress",
      description: "Tasks, surveys, and interview completion combined",
      simpleVal: simple.overallProgress,
      criteriaVal: criteria.overallProgress,
      format: "percent",
      higherIsBetter: true,
    },
    {
      id: "task_completion",
      label: "Task completion rate",
      description: "Share of assigned tasks marked completed",
      simpleVal: simple.taskCompletionRate,
      criteriaVal: criteria.taskCompletionRate,
      format: "score",
      higherIsBetter: true,
      tasksCompleted: simple.tasksCompleted,
      tasksTotal: simple.tasksTotal,
      criteriaTasksCompleted: criteria.tasksCompleted,
      criteriaTasksTotal: criteria.tasksTotal,
    },
    {
      id: "avg_task_time",
      label: "Average completion time",
      description: "Mean duration from task start to completion",
      simpleVal: simple.avgTaskTimeMs,
      criteriaVal: criteria.avgTaskTimeMs,
      format: "duration",
      higherIsBetter: false,
      deltaMode: "absolute",
      deltaUnit: "s",
      deltaDecimals: 0,
    },
    {
      id: "error_rate",
      label: "Error rate",
      description: "Incomplete or failed tasks as a share of total tasks",
      simpleVal: buildErrorRate(simple),
      criteriaVal: buildErrorRate(criteria),
      format: "percent",
      higherIsBetter: false,
    },
    {
      id: "incomplete_tasks",
      label: "Incomplete tasks",
      description: "Count of tasks not yet completed",
      simpleVal: simple.incompleteTaskCount,
      criteriaVal: criteria.incompleteTaskCount,
      format: "count",
      higherIsBetter: false,
      deltaMode: "absolute",
      deltaDecimals: 0,
    },
    {
      id: "sus",
      label: "System Usability (SUS)",
      description: "System Usability Scale score (0–100)",
      simpleVal: simple.susScore,
      criteriaVal: criteria.susScore,
      format: "sus",
      higherIsBetter: true,
      deltaMode: "absolute",
      deltaDecimals: 1,
    },
    {
      id: "raw_tlx",
      label: "Workload (Raw TLX)",
      description: "NASA Raw Task Load Index (0–100, lower is better)",
      simpleVal: simple.rawTlx,
      criteriaVal: criteria.rawTlx,
      format: "tlx",
      higherIsBetter: false,
      deltaMode: "absolute",
      deltaDecimals: 1,
    },
    {
      id: "autonomy",
      label: "Autonomy",
      description: "SDT autonomy subscale (1–7)",
      simpleVal: simple.autonomy,
      criteriaVal: criteria.autonomy,
      format: "likert7",
      higherIsBetter: true,
      deltaMode: "absolute",
      deltaDecimals: 1,
    },
    {
      id: "confidence",
      label: "Competence",
      description: "SDT competence subscale (1–7)",
      simpleVal: simple.competence,
      criteriaVal: criteria.competence,
      format: "likert7",
      higherIsBetter: true,
      deltaMode: "absolute",
      deltaDecimals: 1,
    },
    {
      id: "performance_satisfaction",
      label: "Performance satisfaction",
      description: "SDT performance satisfaction subscale (1–7)",
      simpleVal: simple.performanceSatisfaction,
      criteriaVal: criteria.performanceSatisfaction,
      format: "likert7",
      higherIsBetter: true,
      deltaMode: "absolute",
      deltaDecimals: 1,
    },
    {
      id: "user_satisfaction",
      label: "System satisfaction",
      description: "SDT system satisfaction subscale (1–7)",
      simpleVal: simple.systemSatisfaction,
      criteriaVal: criteria.systemSatisfaction,
      format: "likert7",
      higherIsBetter: true,
      deltaMode: "absolute",
      deltaDecimals: 1,
    },
    {
      id: "survey_responses",
      label: "Survey responses",
      description: "Total recorded survey answers",
      simpleVal: simple.surveyAnswerCount,
      criteriaVal: criteria.surveyAnswerCount,
      format: "count",
      higherIsBetter: true,
      deltaMode: "absolute",
      deltaDecimals: 0,
    },
    {
      id: "interview_responses",
      label: "Interview responses",
      description: "Total recorded interview answers",
      simpleVal: simple.interviewAnswerCount,
      criteriaVal: criteria.interviewAnswerCount,
      format: "count",
      higherIsBetter: true,
      deltaMode: "absolute",
      deltaDecimals: 0,
    },
  ];

  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    description: row.description,
    simpleValue: row.simpleVal,
    criteriaValue: row.criteriaVal,
    higherIsBetter: row.higherIsBetter,
    simpleBarPercent: getBarPercent(row.simpleVal, row.format),
    criteriaBarPercent: getBarPercent(row.criteriaVal, row.format),
    simpleDisplay: formatMetricValue(
      row.simpleVal,
      row.format,
      row.tasksCompleted,
      row.tasksTotal,
    ),
    criteriaDisplay: formatMetricValue(
      row.criteriaVal,
      row.format,
      row.criteriaTasksCompleted,
      row.criteriaTasksTotal,
    ),
    delta: formatDelta(
      row.format === "duration" && row.criteriaVal !== null
        ? row.criteriaVal / 1000
        : row.criteriaVal,
      row.format === "duration" && row.simpleVal !== null
        ? row.simpleVal / 1000
        : row.simpleVal,
      {
        higherIsBetter: row.higherIsBetter,
        mode: row.deltaMode,
        unit: row.deltaUnit,
        decimals: row.deltaDecimals,
      },
    ),
  }));
}

export type SectionCompareGroup = {
  id: string;
  label: string;
  description: string;
  metricId: string;
  surveyName?: string;
  construct?: string;
};

export const SECTION_COMPARE_GROUPS: SectionCompareGroup[] = [
  {
    id: "usability",
    label: "System Usability",
    description: "SUS aggregate score and individual items",
    metricId: "sus",
    surveyName: "SUS",
  },
  {
    id: "workload",
    label: "Workload",
    description: "Perceived mental and temporal demand (Raw TLX)",
    metricId: "raw_tlx",
    surveyName: "RAW_TLX",
  },
  {
    id: "task_success",
    label: "Task success",
    description: "Completion rate across all study tasks",
    metricId: "task_completion",
  },
  {
    id: "efficiency",
    label: "Efficiency",
    description: "How quickly tasks were completed",
    metricId: "avg_task_time",
  },
  {
    id: "autonomy",
    label: "Autonomy",
    description: "Sense of choice and control (SDT)",
    metricId: "autonomy",
    surveyName: "SDT",
    construct: "Autonomy",
  },
  {
    id: "competence",
    label: "Competence",
    description: "Confidence in using the system (SDT)",
    metricId: "confidence",
    surveyName: "SDT",
    construct: "Competence",
  },
  {
    id: "performance",
    label: "Performance satisfaction",
    description: "Satisfaction with task performance (SDT)",
    metricId: "performance_satisfaction",
    surveyName: "SDT",
    construct: "Performance Satisfaction",
  },
  {
    id: "satisfaction",
    label: "System satisfaction",
    description: "Overall satisfaction with the system (SDT)",
    metricId: "user_satisfaction",
    surveyName: "SDT",
    construct: "System Satisfaction",
  },
  {
    id: "progress",
    label: "Study progress",
    description: "Combined tasks, surveys, and interview completion",
    metricId: "overall_progress",
  },
];

export function getSectionCompareRow(
  rows: CompareRow[],
  section: SectionCompareGroup,
): CompareRow | undefined {
  return rows.find((row) => row.id === section.metricId);
}

const SECTION_LABEL_BY_METRIC_ID = new Map(
  SECTION_COMPARE_GROUPS.map((section) => [section.metricId, section.label]),
);

const SECTION_DESCRIPTION_BY_METRIC_ID = new Map(
  SECTION_COMPARE_GROUPS.map((section) => [section.metricId, section.description]),
);

/** Prefer section compare label; fall back to the compare-row label. */
export function getCompareMetricDisplayLabel(
  metricId: string,
  rowLabel: string,
): string {
  return SECTION_LABEL_BY_METRIC_ID.get(metricId) ?? rowLabel;
}

/** Prefer section compare description; fall back to the compare-row description. */
export function getCompareMetricDescription(
  metricId: string,
  rowDescription: string,
): string {
  return SECTION_DESCRIPTION_BY_METRIC_ID.get(metricId) ?? rowDescription;
}

export type InsightMetricInfo = {
  label: string;
  description: string;
  context: string;
};

export type InsightEmphasis = "simple" | "criteria" | "metric";

export type InsightContentPart =
  | string
  | { text: string; emphasis?: InsightEmphasis };

export function insightContentToText(content: InsightContentPart[]): string {
  return content
    .map((part) => (typeof part === "string" ? part : part.text))
    .join("");
}

export type InsightTrend = "better" | "worse";

export function getBiggestChangeInsightParts(row: CompareRow): {
  text: string;
  content: InsightContentPart[];
  trend: InsightTrend;
  metricInfo: InsightMetricInfo;
} | null {
  if (row.delta.direction !== "better" && row.delta.direction !== "worse") {
    return null;
  }
  if (row.simpleValue === null || row.criteriaValue === null) {
    return null;
  }

  const label = getCompareMetricDisplayLabel(row.id, row.label);
  const description = getCompareMetricDescription(row.id, row.description);
  const isBetter = row.delta.direction === "better";
  const prefix = isBetter ? "Biggest improvement in " : "Largest decline in ";
  const suffix = ".";
  const context = isBetter
    ? "This metric had the largest positive gap between Criteria Task and Simple Task among all compared metrics."
    : "This metric had the largest negative gap between Criteria Task and Simple Task among all compared metrics.";

  return {
    text: `${prefix}${label}${suffix}`,
    content: [prefix, { text: label, emphasis: "metric" }, suffix],
    trend: row.delta.direction,
    metricInfo: { label, description, context },
  };
}

export function getOutperformsInsightParts(): {
  text: string;
  content: InsightContentPart[];
} {
  const criteria = COMPARE_PROTOCOL_LABELS.criteria;
  const simple = COMPARE_PROTOCOL_LABELS.simple;
  return {
    text: `${criteria} outperforms ${simple} in most key metrics.`,
    content: [
      { text: criteria, emphasis: "criteria" },
      " outperforms ",
      { text: simple, emphasis: "simple" },
      " in most key metrics.",
    ],
  };
}

export function getCompetenceInsightParts(): {
  text: string;
  content: InsightContentPart[];
} {
  const criteria = COMPARE_PROTOCOL_LABELS.criteria;
  return {
    text: `Users report higher competence with ${criteria}.`,
    content: [
      "Users report higher competence with ",
      { text: criteria, emphasis: "criteria" },
      ".",
    ],
  };
}

export function getSusChangeInsightParts(row: CompareRow): {
  text: string;
  content: InsightContentPart[];
  trend: InsightTrend;
} | null {
  if (row.simpleValue === null || row.criteriaValue === null) {
    return null;
  }
  if (row.criteriaValue === row.simpleValue) {
    return null;
  }

  const isBetter = row.criteriaValue > row.simpleValue;
  const trend: InsightTrend = isBetter ? "better" : "worse";
  const metricLabel = getCompareMetricDisplayLabel(row.id, row.label);
  const deltaLabel = `${Math.abs(row.criteriaValue - row.simpleValue).toFixed(1)} points`;
  const protocolLabel = COMPARE_PROTOCOL_LABELS.criteria;
  const middle = isBetter ? " improved by " : " declined by ";
  const trailing = " with ";
  const suffix = ".";

  return {
    text: `${metricLabel}${middle}${deltaLabel}${trailing}${protocolLabel}${suffix}`,
    content: [
      { text: metricLabel, emphasis: "metric" },
      middle,
      { text: deltaLabel, emphasis: "metric" },
      trailing,
      { text: protocolLabel, emphasis: "criteria" },
      suffix,
    ],
    trend,
  };
}

export const SUMMARY_CARD_METRIC_IDS = [
  "overall_score",
  "task_completion",
  "avg_task_time",
  "user_satisfaction",
] as const;

export const HIDDEN_COMPARE_METRIC_IDS = [
  "error_rate",
  "incomplete_tasks",
  "survey_responses",
  "interview_responses",
] as const;

export function filterDisplayCompareRows(rows: CompareRow[]): CompareRow[] {
  const hidden = new Set<string>(HIDDEN_COMPARE_METRIC_IDS);
  return rows.filter((row) => !hidden.has(row.id));
}

export type ConstructGroupId =
  | "efficiency"
  | "accuracy"
  | "confidence"
  | "satisfaction"
  | "progress_gaps";

export type ConstructGroupConfig = {
  id: ConstructGroupId;
  label: string;
  description: string;
  metricIds: string[];
};

export const CONSTRUCT_GROUPS: ConstructGroupConfig[] = [
  {
    id: "efficiency",
    label: "Efficiency",
    description: "Task speed and perceived workload",
    metricIds: ["avg_task_time", "raw_tlx"],
  },
  {
    id: "accuracy",
    label: "Accuracy",
    description: "Task completion success",
    metricIds: ["task_completion"],
  },
  {
    id: "confidence",
    label: "Confidence",
    description: "Sense of competence and autonomy",
    metricIds: ["confidence", "autonomy"],
  },
  {
    id: "satisfaction",
    label: "Satisfaction",
    description: "Usability and satisfaction scores",
    metricIds: [
      "sus",
      "user_satisfaction",
      "performance_satisfaction",
    ],
  },
  {
    id: "progress_gaps",
    label: "Progress gaps",
    description: "Incomplete or in-progress tasks",
    metricIds: ["overall_progress"],
  },
];

export function getConstructCompareRows(
  simple: ProtocolMetrics,
  criteria: ProtocolMetrics,
  group: ConstructGroupConfig,
): CompareRow[] {
  const allMetrics = compareProtocols(simple, criteria);
  const byId = new Map(allMetrics.map((row) => [row.id, row]));

  return group.metricIds
    .map((id) => byId.get(id))
    .filter((row): row is CompareRow => Boolean(row));
}

export type UnifiedCompareQuestion = {
  question_id: string;
  question_text: string;
  scale_type: string;
  construct: string | null;
  order_index: number;
  survey_name: string;
  simpleResponses: StudyHistorySurveyResponse[];
  criteriaResponses: StudyHistorySurveyResponse[];
};

export function buildUnifiedCompareQuestions(
  simpleSurveys: StudyHistorySurveyResponse[],
  criteriaSurveys: StudyHistorySurveyResponse[],
  modality: HistoryModalityFilter,
): UnifiedCompareQuestion[] {
  const simpleFiltered = filterHistoryByModality(simpleSurveys, modality);
  const criteriaFiltered = filterHistoryByModality(criteriaSurveys, modality);

  const map = new Map<string, UnifiedCompareQuestion>();

  const ingest = (
    row: StudyHistorySurveyResponse,
    side: "simple" | "criteria",
  ) => {
    const key = `${row.task_survey_questions.task_surveys.survey_name}:${row.task_survey_questions.order_index}`;
    const existing = map.get(key) ?? {
      question_id: row.question_id,
      question_text: row.task_survey_questions.question_text,
      scale_type: row.task_survey_questions.scale_type,
      construct: row.task_survey_questions.construct,
      order_index: row.task_survey_questions.order_index,
      survey_name: row.task_survey_questions.task_surveys.survey_name,
      simpleResponses: [],
      criteriaResponses: [],
    };

    if (side === "simple") {
      existing.simpleResponses.push(row);
    } else {
      existing.criteriaResponses.push(row);
    }
    map.set(key, existing);
  };

  for (const row of simpleFiltered) ingest(row, "simple");
  for (const row of criteriaFiltered) ingest(row, "criteria");

  return Array.from(map.values()).sort((a, b) => {
    const surveyOrder =
      sortSurveyNames([a.survey_name, b.survey_name]).indexOf(a.survey_name) -
      sortSurveyNames([a.survey_name, b.survey_name]).indexOf(b.survey_name);
    if (surveyOrder !== 0) return surveyOrder;
    return a.order_index - b.order_index;
  });
}

export function questionsForConstructGroup(
  questions: UnifiedCompareQuestion[],
  groupId: ConstructGroupId,
): UnifiedCompareQuestion[] {
  const constructMap: Record<ConstructGroupId, string[]> = {
    efficiency: ["Workload"],
    accuracy: [],
    confidence: ["Competence", "Autonomy"],
    satisfaction: [
      "Usability",
      "Performance Satisfaction",
      "System Satisfaction",
    ],
    progress_gaps: [],
  };

  if (groupId === "accuracy" || groupId === "progress_gaps") {
    return [];
  }

  const constructs = constructMap[groupId];
  return questions.filter(
    (q) => q.construct !== null && constructs.includes(q.construct),
  );
}

export function normalizedScoreChip(
  responseValue: number | null,
  responseText: string | null,
  scaleType: string,
): string {
  const text = responseText?.trim();
  if (text) return "Text";
  if (responseValue === null) return "—";
  switch (scaleType) {
    case "likert_5":
      return `${responseValue}/5`;
    case "likert_7":
      return `${responseValue}/7`;
    case "numeric_0_100":
      return `${responseValue}/100`;
    default:
      return String(responseValue);
  }
}

export function averageResponseValue(
  responses: StudyHistorySurveyResponse[],
): number | null {
  const values = responses
    .map((r) => r.response_value)
    .filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export type UnifiedTaskCompareRow = {
  task_code: string;
  title: string;
  description: string;
  simpleTraditional?: StudyHistoryTask;
  simpleChat?: StudyHistoryTask;
  criteriaTraditional?: StudyHistoryTask;
  criteriaChat?: StudyHistoryTask;
};

export function buildUnifiedTaskCompareRows(
  simpleTasks: StudyHistoryTask[],
  criteriaTasks: StudyHistoryTask[],
): UnifiedTaskCompareRow[] {
  const map = new Map<string, UnifiedTaskCompareRow>();

  const ingest = (
    task: StudyHistoryTask,
    protocol: "simple" | "criteria",
  ) => {
    const code = task.task_definitions.task_code;
    const existing = map.get(code) ?? {
      task_code: code,
      title: task.task_definitions.title,
      description: task.task_definitions.description || "",
    };

    const system = task.task_sessions.system_type;
    if (protocol === "simple") {
      if (system === "traditional") existing.simpleTraditional = task;
      else existing.simpleChat = task;
    } else {
      if (system === "traditional") existing.criteriaTraditional = task;
      else existing.criteriaChat = task;
    }
    map.set(code, existing);
  };

  for (const t of simpleTasks) ingest(t, "simple");
  for (const t of criteriaTasks) ingest(t, "criteria");

  return Array.from(map.values());
}
