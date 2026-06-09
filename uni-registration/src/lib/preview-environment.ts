/** True on Vercel preview deployments. Server-only (`VERCEL_ENV` is not exposed to the client). */
export function isPreviewEnvironment(): boolean {
  return process.env.VERCEL_ENV === "preview";
}
