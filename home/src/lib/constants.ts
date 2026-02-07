export const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const Routes = {
  home: "/survey",
  login: "/auth/login",
  signup: "/auth/signup",
  passwordReset: "/auth/reset-password",
  passwordRecovery: "/auth/password-recovery",
};

export const APIRoutes = {
  passwordRecovery: "/api/reset-password",
};

/** Display labels for system_type enum (single source of truth for analysis UI). Keys match DB enum. */
export const SystemTypes = {
  chat_agent: "Chat-based System",
  traditional: "Traditional UI",
} as const;

export type SystemTypeKey = keyof typeof SystemTypes;

/** Ordered list of system type keys for iteration (e.g. building charts). */
export const SYSTEM_TYPE_KEYS: SystemTypeKey[] = ["chat_agent", "traditional"];

export function getSystemTypeLabel(systemType: string): string {
  return systemType in SystemTypes
    ? SystemTypes[systemType as SystemTypeKey]
    : systemType;
}