import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("willow_admin")?.value;
  if (token) deleteSession(token);

  const cookieStore = await cookies();
  cookieStore.set("willow_admin", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });

  return NextResponse.json({ ok: true });
}
