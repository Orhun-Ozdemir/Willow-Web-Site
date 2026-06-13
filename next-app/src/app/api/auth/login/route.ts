import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSession } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "Missing credentials" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc("verify_admin_login", {
      p_username: username,
      p_password: password,
    });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    const user = data[0];
    const { token } = createSession(user.username);
    const cookieStore = await cookies();
    cookieStore.set("willow_admin", token, {
      path: "/",
      maxAge: 43200,
      httpOnly: true,
      sameSite: "lax",
    });

    return NextResponse.json({ ok: true, user: { name: user.username } });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
