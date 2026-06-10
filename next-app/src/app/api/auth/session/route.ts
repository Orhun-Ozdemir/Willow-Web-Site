import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = getSession(req);
  return NextResponse.json({
    ok: true,
    authenticated: !!session,
    user: session ? { name: session.user } : null
  });
}
