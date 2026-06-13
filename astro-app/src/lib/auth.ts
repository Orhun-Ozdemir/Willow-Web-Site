import crypto from "node:crypto";
import { getPublicClient } from "./supabase";

const sessionTtlMs = 1000 * 60 * 60 * 12;

const adminUser = (typeof process !== "undefined" ? process.env?.ADMIN_USER : undefined) || import.meta.env.ADMIN_USER || "admin";
const adminPassword = (typeof process !== "undefined" ? process.env?.ADMIN_PASSWORD : undefined) || import.meta.env.ADMIN_PASSWORD || "willow-admin-2026";

const secret =
  (typeof process !== "undefined" ? process.env?.SESSION_SECRET : undefined) ||
  import.meta.env.SESSION_SECRET ||
  "willow-session-secret-dev-only";

// ── Password hashing (PBKDF2, used for creating new admin users) ─────────────

export function hashPassword(password: string, salt?: string): string {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, s, 100_000, 64, "sha512").toString("hex");
  return `pbkdf2:${s}:${hash}`;
}

// ── Credential check ──────────────────────────────────────────────────────────

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  try {
    const sb = getPublicClient();
    const { data, error } = await sb.rpc("verify_admin_login", {
      p_username: username,
      p_password: password,
    });
    if (!error && data && data.length > 0) return true;
  } catch {
    // fall through to env var fallback
  }

  // Fallback: env-var credentials
  return username === adminUser && password === adminPassword;
}

// ── HMAC-signed stateless session tokens ─────────────────────────────────────

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
  // Stateless tokens expire naturally.
}
