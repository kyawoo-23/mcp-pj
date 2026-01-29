import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Routes } from "@/lib/constants";
import { EmailOtpType } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const supabase = await createClient();
  const url = new URL(req.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? Routes.home;

  const origin = url.origin;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (!token_hash || !type) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as EmailOtpType,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
