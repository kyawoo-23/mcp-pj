/** True on Vercel preview deployments (`VERCEL_ENV`) or preview.* hostnames in the browser. */
export function isPreviewEnvironment(): boolean {
  if (process.env.VERCEL_ENV === "preview") {
    return true;
  }

  if (typeof window !== "undefined") {
    return window.location.hostname.startsWith("preview.");
  }

  return false;
}

export function toPreviewOrigin(productionOrigin: string): string {
  const url = new URL(productionOrigin);
  if (!url.hostname.startsWith("preview.")) {
    url.hostname = `preview.${url.hostname}`;
  }
  return url.origin;
}
