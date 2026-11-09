/**
 * Opaque id for the currently running deployment.
 *
 * Vercel sets `VERCEL_DEPLOYMENT_ID` at build and runtime. Local `next dev`
 * / `next start` fall back to `"dev"` so the client guard never reloads.
 */
export function getDeploymentId(): string {
  return (
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    "dev"
  );
}

export const DEPLOYMENT_ID_ATTR = "data-mcp-deployment-id";
export const DEPLOYMENT_ENDPOINT = "/api/deployment";
