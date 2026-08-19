export type AuthLinkErrorCopy = {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
};

function isPasswordResetFlow(next: string | null): boolean {
  if (!next) return false;
  return next.includes("reset-password") || next.includes("password-recovery");
}

export function getAuthLinkErrorCopy(input: {
  errorCode: string | null;
  errorDescription: string | null;
  next: string | null;
  loginHref: string;
  recoveryHref: string;
}): AuthLinkErrorCopy {
  const code = (input.errorCode ?? "").toLowerCase();
  const description = (input.errorDescription ?? "").toLowerCase();
  const expired =
    code === "otp_expired" ||
    description.includes("expired") ||
    description.includes("invalid");

  if (expired && isPasswordResetFlow(input.next)) {
    return {
      title: "This password reset link has expired",
      description:
        "Reset links expire after a short time and can only be used once. Request a new email and open it promptly.",
      primaryHref: input.recoveryHref,
      primaryLabel: "Request a new reset link",
    };
  }

  if (expired) {
    return {
      title: "This email link has expired",
      description:
        "The link may have already been used, or it may have expired. Sign in if your account is already confirmed, or request a new email from the sign-in page.",
      primaryHref: input.loginHref,
      primaryLabel: "Back to sign in",
    };
  }

  return {
    title: "We couldn't complete this request",
    description:
      "The email link is missing or no longer valid. Try signing in, or request a new email if you were resetting your password.",
    primaryHref: isPasswordResetFlow(input.next)
      ? input.recoveryHref
      : input.loginHref,
    primaryLabel: isPasswordResetFlow(input.next)
      ? "Request a new reset link"
      : "Back to sign in",
  };
}

export function safeNextPath(next: string | null, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}

export function authErrorPageUrl(
  origin: string,
  params: {
    error?: string | null;
    errorCode?: string | null;
    errorDescription?: string | null;
    next?: string | null;
  },
): URL {
  const dest = new URL("/auth/error", origin);
  if (params.error) dest.searchParams.set("error", params.error);
  if (params.errorCode) dest.searchParams.set("error_code", params.errorCode);
  if (params.errorDescription) {
    dest.searchParams.set("error_description", params.errorDescription);
  }
  if (params.next) dest.searchParams.set("next", params.next);
  return dest;
}

export const AUTH_ERROR_HASH_BRIDGE_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting…</title>
  </head>
  <body>
    <p>Redirecting…</p>
    <script>
      (function () {
        var dest = new URL("/auth/error", window.location.origin);
        var search = new URLSearchParams(window.location.search);
        var hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        ["error", "error_code", "error_description", "next"].forEach(function (key) {
          var value = search.get(key) || hash.get(key);
          if (value) dest.searchParams.set(key, value);
        });
        window.location.replace(dest.toString());
      })();
    </script>
  </body>
</html>`;
