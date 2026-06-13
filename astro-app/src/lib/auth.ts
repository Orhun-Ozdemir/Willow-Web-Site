import crypto from "node:crypto";

const sessionTtlMs = 1000 * 60 * 60 * 12;

export const adminUser = import.meta.env.ADMIN_USER || "admin";
export const adminPassword = import.meta.env.ADMIN_PASSWORD || "willow-admin-2026";

const secret = import.meta.env.ADMIN_PASSWORD || "willow-admin-2026-dev-only";

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

export function getSession(cookieHeader: string | null): { user: string; expiresAt: number } | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/willow_admin=([^;]+)/);
  if (!match) return null;
  const token = match[1];

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

export function deleteSession(_cookieHeader: string | null): void {
  // Stateless tokens expire naturally — no action needed.
}
