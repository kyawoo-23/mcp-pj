import {
  DEPLOYMENT_ENDPOINT,
  DEPLOYMENT_ID_ATTR,
} from "@/lib/deployment-id";

const RELOAD_GUARD_KEY = "mcp-deployment-reload";
const MISSING_SERVER_ACTION_RE = /Failed to find Server Action/i;

type FetchLike = typeof fetch;

let originalFetch: FetchLike | null = null;
let installed = false;

export function readPageDeploymentId(
  root: Pick<Document, "documentElement"> | null | undefined,
): string | null {
  const value = root?.documentElement.getAttribute(DEPLOYMENT_ID_ATTR);
  return value && value.length > 0 ? value : null;
}

export function shouldReloadForDeployment(
  pageId: string | null,
  liveId: string | null,
): boolean {
  if (!pageId || !liveId) return false;
  if (pageId === "dev" || liveId === "dev") return false;
  return pageId !== liveId;
}

export function isMissingServerActionResponse(
  status: number,
  body: string,
): boolean {
  return status >= 400 && MISSING_SERVER_ACTION_RE.test(body);
}

export function getNextActionHeader(
  input: RequestInfo | URL,
  init?: RequestInit,
): string | null {
  if (init?.headers) {
    const fromInit = new Headers(init.headers).get("Next-Action");
    if (fromInit) return fromInit;
  }
  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.headers.get("Next-Action");
  }
  return null;
}

function reloadToCurrentDeployment(liveId: string): void {
  try {
    if (sessionStorage.getItem(RELOAD_GUARD_KEY) === liveId) return;
    sessionStorage.setItem(RELOAD_GUARD_KEY, liveId);
  } catch {
    // Private mode / disabled storage: still attempt a one-shot reload.
  }
  window.location.reload();
}

async function fetchLiveDeploymentId(fetchImpl: FetchLike): Promise<string | null> {
  try {
    const response = await fetchImpl(DEPLOYMENT_ENDPOINT, {
      method: "GET",
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "id" in data &&
      typeof data.id === "string" &&
      data.id.length > 0
    ) {
      return data.id;
    }
    return null;
  } catch {
    return null;
  }
}

async function reloadIfDeploymentStale(fetchImpl: FetchLike): Promise<boolean> {
  const pageId = readPageDeploymentId(document);
  const liveId = await fetchLiveDeploymentId(fetchImpl);
  if (!shouldReloadForDeployment(pageId, liveId) || !liveId) return false;
  reloadToCurrentDeployment(liveId);
  return true;
}

function hangingReloadResponse(): Promise<Response> {
  return new Promise(() => {});
}

export function installStaleDeploymentGuard(): void {
  if (installed || typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;

  originalFetch = window.fetch.bind(window);
  const fetchImpl = originalFetch;

  const patchedFetch: FetchLike = async (input, init) => {
    const isServerAction = Boolean(getNextActionHeader(input, init));

    if (isServerAction && (await reloadIfDeploymentStale(fetchImpl))) {
      return hangingReloadResponse();
    }

    const response = await fetchImpl(input, init);

    if (isServerAction && !response.ok) {
      let body = "";
      try {
        body = await response.clone().text();
      } catch {
        body = "";
      }
      if (isMissingServerActionResponse(response.status, body)) {
        const liveId = (await fetchLiveDeploymentId(fetchImpl)) ?? "unknown";
        reloadToCurrentDeployment(liveId);
        return hangingReloadResponse();
      }
    }

    return response;
  };

  window.fetch = patchedFetch;
  installed = true;

  const onMaybeStale = () => {
    if (document.visibilityState !== "visible") return;
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      const tag = active.tagName;
      if (
        active.isContentEditable ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
      ) {
        return;
      }
    }
    void reloadIfDeploymentStale(fetchImpl);
  };

  document.addEventListener("visibilitychange", onMaybeStale);
  window.addEventListener("focus", onMaybeStale);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) onMaybeStale();
  });
}
