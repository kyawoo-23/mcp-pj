import {
  isPreviewEnvironment,
  toPreviewOrigin,
} from "@/lib/preview-environment";

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
  courses: "/courses",
};

export const APIRoutes = {
  passwordRecovery: "/api/reset-password",
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

export function getSurveyUrl(): string {
  const base = resolveAppOrigin(
    "http://localhost:4003",
    "https://mcp-project.app",
    "https://mcp-pj.vercel.app",
  );
  return `${base}/survey`;
}
