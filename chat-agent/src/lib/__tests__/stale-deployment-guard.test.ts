import {
  getNextActionHeader,
  isMissingServerActionResponse,
  readPageDeploymentId,
  shouldReloadForDeployment,
} from "../stale-deployment-guard";
import { DEPLOYMENT_ID_ATTR } from "../deployment-id";

describe("shouldReloadForDeployment", () => {
  it("reloads when the page was rendered by a different deployment", () => {
    expect(shouldReloadForDeployment("dpl_old", "dpl_new")).toBe(true);
  });

  it("does not reload when ids match", () => {
    expect(shouldReloadForDeployment("dpl_same", "dpl_same")).toBe(false);
  });

  it("does not reload for local/dev ids", () => {
    expect(shouldReloadForDeployment("dev", "dpl_new")).toBe(false);
    expect(shouldReloadForDeployment("dpl_old", "dev")).toBe(false);
  });

  it("does not reload when either id is missing", () => {
    expect(shouldReloadForDeployment(null, "dpl_new")).toBe(false);
    expect(shouldReloadForDeployment("dpl_old", null)).toBe(false);
  });
});

describe("isMissingServerActionResponse", () => {
  it("detects Next.js missing-action errors", () => {
    expect(
      isMissingServerActionResponse(
        500,
        "Failed to find Server Action `abc123`. This request might be from an older or newer deployment.",
      ),
    ).toBe(true);
    expect(isMissingServerActionResponse(404, "Failed to find Server Action")).toBe(
      true,
    );
  });

  it("ignores unrelated failures", () => {
    expect(isMissingServerActionResponse(500, "Internal Server Error")).toBe(
      false,
    );
    expect(isMissingServerActionResponse(200, "Failed to find Server Action")).toBe(
      false,
    );
  });
});

describe("readPageDeploymentId", () => {
  it("reads the root html data attribute", () => {
    const html = { getAttribute: (name: string) => (name === DEPLOYMENT_ID_ATTR ? "dpl_abc" : null) };
    expect(readPageDeploymentId({ documentElement: html as Element })).toBe(
      "dpl_abc",
    );
  });

  it("returns null when the attribute is absent", () => {
    const html = { getAttribute: () => null };
    expect(readPageDeploymentId({ documentElement: html as Element })).toBeNull();
  });
});

describe("getNextActionHeader", () => {
  it("reads Next-Action from init headers", () => {
    expect(
      getNextActionHeader("/survey", { headers: { "Next-Action": "deadbeef" } }),
    ).toBe("deadbeef");
  });

  it("returns null for ordinary fetches", () => {
    expect(getNextActionHeader("/api/deployment")).toBeNull();
  });
});
