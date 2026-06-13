import { NextRequest } from "next/server";
import crypto from "node:crypto";

const sessionTtlMs = 1000 * 60 * 60 * 12;

const secret = process.env.SESSION_SECRET || "willow-session-secret-dev-only";

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSession(username: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + sessionTtlMs;
  const payload = `${username}:${expiresAt}`;
  const sig = sign(payload);
  const token = Buffer.from(`${payload}:${sig}`).toString("base64url");
  return { token, expiresAt };
}

export function getSession(req: NextRequest): { user: string; expiresAt: number } | null {
  const token = req.cookies.get("willow_admin")?.value;
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastColon = decoded.lastIndexOf(":");
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);

    if (sign(payload) !== sig) return null;

    const colonIdx = payload.indexOf(":");
    const user = payload.slice(0, colonIdx);
    const expiresAt = Number(payload.slice(colonIdx + 1));

    if (!user || isNaN(expiresAt) || Date.now() > expiresAt) return null;

    return { user, expiresAt };
  } catch {
    return null;
  }
}

export function deleteSession(_token: string) {
  // Stateless tokens expire naturally — no action needed.
}

export function isAuthenticated(req: NextRequest): boolean {
  return !!getSession(req);
}
