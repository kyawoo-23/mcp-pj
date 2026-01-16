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
