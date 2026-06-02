import type {
  InterviewQuestionRow,
  SurveyQuestionRow,
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
