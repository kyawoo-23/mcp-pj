import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BASE_URL } from "@/lib/constants";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${BASE_URL}/api/auth/confirm`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
