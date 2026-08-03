import type { ProfileRow, TaskDefinitionRow } from "@/lib/types";
import {
  isPreviewEnvironment,
  toPreviewOrigin,
} from "@/lib/preview-environment";

export const AGE_OPTIONS: Array<{ value: ProfileRow["age_range"]; label: string }> = [
  { value: "under_18", label: "Under 18" },
  { value: "18_24", label: "18-24" },
  { value: "25_34", label: "25-34" },
  { value: "35_44", label: "35-44" },
  { value: "45_54", label: "45-54" },
  { value: "55_plus", label: "55+" },
  { value: "prefer_not_say", label: "Prefer not to say" },
];

export const GENDER_OPTIONS: Array<{ value: ProfileRow["gender"]; label: string }> = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "prefer_not_say", label: "Prefer not to say" },
];

export const TECHNICAL_PROFICIENCY_OPTIONS: Array<{
  value: ProfileRow["technical_proficiency"];
  label: string;
}> = [
  { value: "none", label: "None" },
  { value: "limited", label: "Limited" },
  { value: "moderate", label: "Moderate" },
  { value: "advanced", label: "Advanced" },
];

export const PROGRAMMING_EXPERIENCE_OPTIONS: Array<{ value: ProfileRow["programming_experience"]; label: string }> = [
  { value: "none", label: "Never programmed before" },
  { value: "under_1_year", label: "Less than 1 year" },
  { value: "one_to_two_years", label: "1–2 years" },
  { value: "three_plus_years", label: "3 years or more" },
];

export const AI_TOOL_FREQUENCY_OPTIONS: Array<{ value: ProfileRow["ai_tool_frequency"]; label: string }> = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "rarely", label: "Rarely" },
  { value: "never", label: "Never" },
];

// Value → display label mappers for analysis (age, gender, technical proficiency, AI tool frequency)
export const AGE_RANGE_LABELS: Record<string, string> = Object.fromEntries(
  AGE_OPTIONS.map((o) => [o.value, o.label]),
);
export const GENDER_LABELS: Record<string, string> = Object.fromEntries(
  GENDER_OPTIONS.map((o) => [o.value, o.label]),
);
export const TECHNICAL_PROFICIENCY_LABELS: Record<string, string> =
  Object.fromEntries(
    TECHNICAL_PROFICIENCY_OPTIONS.map((o) => [o.value, o.label]),
  );
export const PROGRAMMING_EXPERIENCE_LABELS: Record<string, string> =
  Object.fromEntries(
    PROGRAMMING_EXPERIENCE_OPTIONS.map((o) => [o.value, o.label]),
  );
export const AI_TOOL_FREQUENCY_LABELS: Record<string, string> =
  Object.fromEntries(
    AI_TOOL_FREQUENCY_OPTIONS.map((o) => [o.value, o.label]),
  );

export function getAgeRangeLabel(value: string): string {
  return AGE_RANGE_LABELS[value] ?? value;
}
export function getGenderLabel(value: string): string {
  return GENDER_LABELS[value] ?? value;
}
export function getTechnicalProficiencyLabel(value: string): string {
  return TECHNICAL_PROFICIENCY_LABELS[value] ?? value;
}
export function getProgrammingExperienceLabel(value: string): string {
  return PROGRAMMING_EXPERIENCE_LABELS[value] ?? value;
}
export function getAiToolFrequencyLabel(value: string): string {
  return AI_TOOL_FREQUENCY_LABELS[value] ?? value;
}

export const TASK_ORDER: Record<string, number> = {
  register_course: 1,
  drop_course: 2,
  book_room: 3,
  cancel_booking: 4,
};

function isDevMode(): boolean {
  return process.env.NEXT_PUBLIC_DEV_MODE === "true";
}

function isLegacyVercelDeployment(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.hostname.includes("vercel")
  );
}

function resolveAppOrigin(
  localOrigin: string,
  productionOrigin: string,
  legacyVercelOrigin: string,
): string {
  if (isDevMode()) {
    return localOrigin;
  }

  if (isPreviewEnvironment()) {
    return toPreviewOrigin(productionOrigin);
  }

  if (isLegacyVercelDeployment()) {
    return legacyVercelOrigin;
  }

  return productionOrigin;
}

export function getTaskUrl(
  systemType: TaskDefinitionRow["system_type"],
  taskCode: string,
): string {
  if (systemType === "chat_agent") {
    const base = resolveAppOrigin(
      "http://localhost:4000",
      "https://chat-agent.mcp-project.app",
      "https://mcp-pj-chat-agent.vercel.app",
    );
    return `${base}/c?task_code=${taskCode}`;
  }

  if (taskCode === "register_course" || taskCode === "drop_course") {
    const base = resolveAppOrigin(
      "http://localhost:4002",
      "https://uni-registration.mcp-project.app",
      "https://mcp-pj-uni-registration.vercel.app",
    );
    return `${base}?task_code=${taskCode}`;
  }

  const base = resolveAppOrigin(
    "http://localhost:4001",
    "https://uni-booking.mcp-project.app",
    "https://mcp-pj-uni-booking.vercel.app",
  );
  const loginPath =
    isLegacyVercelDeployment() && !isPreviewEnvironment() ? "/auth/login" : "";
  return `${base}${loginPath}?task_code=${taskCode}`;
}

export function getSurveyUrl(): string {
  const base = resolveAppOrigin(
    "http://localhost:4003",
    "https://mcp-project.app",
    "https://mcp-pj.vercel.app",
  );
  return `${base}/survey`;
}

export function getChatAgentBaseUrl(): string {
  return resolveAppOrigin(
    "http://localhost:4000",
    "https://chat-agent.mcp-project.app",
    "https://mcp-pj-chat-agent.vercel.app",
  );
}

export function getUniBookingBaseUrl(): string {
  return resolveAppOrigin(
    "http://localhost:4001",
    "https://uni-booking.mcp-project.app",
    "https://mcp-pj-uni-booking.vercel.app",
  );
}

export function getUniRegistrationBaseUrl(): string {
  return resolveAppOrigin(
    "http://localhost:4002",
    "https://uni-registration.mcp-project.app",
    "https://mcp-pj-uni-registration.vercel.app",
  );
}
