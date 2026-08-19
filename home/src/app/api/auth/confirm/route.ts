import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Routes } from "@/lib/constants";
import { EmailOtpType } from "@supabase/supabase-js";
import {
  AUTH_ERROR_HASH_BRIDGE_HTML,
  authErrorPageUrl,
  safeNextPath,
} from "@/lib/auth-link-error";

function redirectToAuthError(
  origin: string,
  params: {
    error?: string | null;
    errorCode?: string | null;
    errorDescription?: string | null;
    next?: string | null;
  },
) {
  return NextResponse.redirect(authErrorPageUrl(origin, params));
}

function hashBridgeResponse() {
  return new NextResponse(AUTH_ERROR_HASH_BRIDGE_HTML, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const url = new URL(req.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const code = url.searchParams.get("code");
  const authError = url.searchParams.get("error");
  const errorCode = url.searchParams.get("error_code");
  const errorDescription = url.searchParams.get("error_description");
  const next = safeNextPath(
    url.searchParams.get("next"),
    type === "recovery" ? Routes.passwordReset : Routes.home,
  );
  const origin = url.origin;

  if (authError || errorCode) {
    return redirectToAuthError(origin, {
      error: authError,
      errorCode,
      errorDescription,
      next,
    });
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return redirectToAuthError(origin, {
      error: "access_denied",
      errorCode: error.code ?? "otp_expired",
      errorDescription: error.message,
      next,
    });
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return redirectToAuthError(origin, {
      error: "access_denied",
      errorCode: error.code ?? "otp_expired",
      errorDescription: error.message,
      next,
    });
  }

  return hashBridgeResponse();
}
