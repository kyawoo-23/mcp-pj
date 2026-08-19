import { getAuthLinkErrorCopy, safeNextPath } from "@/lib/auth-link-error";

describe("getAuthLinkErrorCopy", () => {
  const hrefs = {
    loginHref: "/auth/login",
    recoveryHref: "/auth/password-recovery",
  };

  it("explains expired password reset links and points to recovery", () => {
    const copy = getAuthLinkErrorCopy({
      errorCode: "otp_expired",
      errorDescription: "Email link is invalid or has expired",
      next: "/auth/reset-password",
      ...hrefs,
    });

    expect(copy.title).toMatch(/expired/i);
    expect(copy.primaryHref).toBe(hrefs.recoveryHref);
    expect(copy.primaryLabel).toMatch(/reset link/i);
  });

  it("points signup confirmation expiries to sign in", () => {
    const copy = getAuthLinkErrorCopy({
      errorCode: "otp_expired",
      errorDescription: "Email link is invalid or has expired",
      next: "/survey",
      ...hrefs,
    });

    expect(copy.primaryHref).toBe(hrefs.loginHref);
  });
});

describe("safeNextPath", () => {
  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeNextPath("//evil.example", "/survey")).toBe("/survey");
    expect(safeNextPath("https://evil.example", "/survey")).toBe("/survey");
    expect(safeNextPath("/auth/reset-password", "/survey")).toBe(
      "/auth/reset-password",
    );
  });
});
