import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const sessionTtlMs = 1000 * 60 * 60 * 12;
const sessions = new Map<string, { user: string; expiresAt: number }>();

export const adminUser = process.env.ADMIN_USER || "admin";
export const adminPassword = process.env.ADMIN_PASSWORD || "willow-admin-2026";

if (
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build" &&
  (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "willow-admin-2026")
) {
  throw new Error("ADMIN_PASSWORD environment variable must be set in production, and cannot be the default value.");
}

export function getSession(req: NextRequest) {
  const token = req.cookies.get("willow_admin")?.value;
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function createSession(username: string): { token: string; expiresAt: number } {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + sessionTtlMs;
  sessions.set(token, { user: username, expiresAt });
  return { token, expiresAt };
}

export function deleteSession(token: string) {
  sessions.delete(token);
}

export function isAuthenticated(req: NextRequest): boolean {
  return !!getSession(req);
}
