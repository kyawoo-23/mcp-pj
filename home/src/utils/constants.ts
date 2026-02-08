import type { ProfileRow, TaskDefinitionRow } from "@/lib/types";

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

export const TECHNICAL_PROFICIENCY_OPTIONS: Array<{ value: ProfileRow["technical_proficiency"]; label: string }> = [
  { value: "none", label: "None" },
  { value: "limited", label: "Limited" },
  { value: "moderate", label: "Moderate" },
  { value: "advanced", label: "Advanced" },
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
export function getAiToolFrequencyLabel(value: string): string {
  return AI_TOOL_FREQUENCY_LABELS[value] ?? value;
}

export const TASK_ORDER: Record<string, number> = {
  register_course: 1,
  drop_course: 2,
  book_room: 3,
  cancel_booking: 4,
};

export function getTaskUrl(
  systemType: TaskDefinitionRow["system_type"],
  taskCode: string,
): string {
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel");

  if (systemType === "chat_agent") {
    if (isDevMode) {
      return `http://localhost:4000/c?task_code=${taskCode}`;
    }
    return isVercel
      ? `https://mcp-pj-chat-agent.vercel.app/c?task_code=${taskCode}`
      : `https://chat-agent.mcp-project.app/c?task_code=${taskCode}`;
  }

  if (taskCode === "register_course" || taskCode === "drop_course") {
    if (isDevMode) {
      return `http://localhost:4002?task_code=${taskCode}`;
    }
    return isVercel
      ? `https://mcp-pj-uni-registration.vercel.app?task_code=${taskCode}`
      : `https://uni-registration.mcp-project.app?task_code=${taskCode}`;
  }

  if (isDevMode) {
    return `http://localhost:4001?task_code=${taskCode}`;
  }
  return isVercel
    ? `https://mcp-pj-uni-booking.vercel.app/auth/login?task_code=${taskCode}`
    : `https://uni-booking.mcp-project.app?task_code=${taskCode}`;
}

export function getSurveyUrl(): string {
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel");

  if (isDevMode) {
    return "http://localhost:4003/survey";
  }

  return isVercel
    ? "https://mcp-pj.vercel.app/survey"
    : "https://mcp-project.app/survey";
}

export function getChatAgentBaseUrl(): string {
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel");

  if (isDevMode) {
    return "http://localhost:4000";
  }
  return isVercel
    ? "https://mcp-pj-chat-agent.vercel.app"
    : "https://chat-agent.mcp-project.app";
}

export function getUniBookingBaseUrl(): string {
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel");

  if (isDevMode) {
    return "http://localhost:4001";
  }
  return isVercel
    ? "https://mcp-pj-uni-booking.vercel.app"
    : "https://uni-booking.mcp-project.app";
}

export function getUniRegistrationBaseUrl(): string {
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel");

  if (isDevMode) {
    return "http://localhost:4002";
  }
  return isVercel
    ? "https://mcp-pj-uni-registration.vercel.app"
    : "https://uni-registration.mcp-project.app";
}
