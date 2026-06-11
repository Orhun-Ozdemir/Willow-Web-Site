import crypto from "node:crypto";

const sessionTtlMs = 1000 * 60 * 60 * 12;
const sessions = new Map<string, { user: string; expiresAt: number }>();

export const adminUser = import.meta.env.ADMIN_USER || "admin";
export const adminPassword = import.meta.env.ADMIN_PASSWORD || "willow-admin-2026";

export function getSession(cookieHeader: string | null): { user: string; expiresAt: number } | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/willow_admin=([^;]+)/);
  if (!match) return null;
  const token = match[1];
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

export function deleteSession(cookieHeader: string | null): void {
  if (!cookieHeader) return;
  const match = cookieHeader.match(/willow_admin=([^;]+)/);
  if (match) sessions.delete(match[1]);
}
