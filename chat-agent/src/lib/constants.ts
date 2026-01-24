export const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const Routes = {
  home: "/",
  login: "/auth/login",
  signup: "/auth/signup",
  passwordReset: "/auth/reset-password",
  passwordRecovery: "/auth/password-recovery",
};

export const APIRoutes = {
  passwordRecovery: "/api/reset-password",
};

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
