import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminUser, adminPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if ((body.username || "admin") !== adminUser || body.password !== adminPassword) {
      return NextResponse.json({ ok: false, error: "Invalid admin credentials" }, { status: 401 });
    }

    const { token } = createSession(adminUser);
    const cookieStore = await cookies();
    cookieStore.set("willow_admin", token, {
      path: "/",
      maxAge: 43200, // 12 hours
      httpOnly: true,
      sameSite: "lax",
    });

    return NextResponse.json({ ok: true, user: { name: adminUser } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
