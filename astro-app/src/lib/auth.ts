import crypto from "node:crypto";
import { getPublicClient, getServiceClient } from "./supabase";

const sessionTtlMs = 1000 * 60 * 60 * 12;

const adminUser = (typeof process !== "undefined" ? process.env?.ADMIN_USER : undefined) || import.meta.env.ADMIN_USER || "admin";
const adminPasswordEnv = (typeof process !== "undefined" ? process.env?.ADMIN_PASSWORD : undefined) || import.meta.env.ADMIN_PASSWORD;
const adminPassword = adminPasswordEnv || "willow-admin-2026";

const providedSecret =
  (typeof process !== "undefined" ? process.env?.SESSION_SECRET : undefined) ||
  import.meta.env.SESSION_SECRET;
const secret = providedSecret || "willow-session-secret-dev-only";
// In production the baked-in dev secret must NEVER be used — otherwise anyone could
// forge a valid `willow_admin` token (HMAC of public data with a public key) and bypass
// login entirely. When unset in prod we hard-fail session creation/validation instead.
const secretIsInsecure = !providedSecret && import.meta.env.PROD;

// ── Password hashing (PBKDF2, used for creating new admin users) ─────────────

export function hashPassword(password: string, salt?: string): string {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, s, 100_000, 64, "sha512").toString("hex");
  return `pbkdf2:${s}:${hash}`;
}

function verifyPbkdf2(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "pbkdf2") return false;
  const [, salt, expected] = parts;
  const actual = crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  try {
    const a = Buffer.from(actual, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ── Credential check ──────────────────────────────────────────────────────────

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const user = username.trim();
  if (!user || !password) return false;

  // 1) bcrypt hashes via SQL RPC (legacy `admin` user and future bcrypt rows)
  try {
    const sb = getPublicClient();
    const { data, error } = await sb.rpc("verify_admin_login", {
      p_username: user,
      p_password: password,
    });
    if (!error && data && data.length > 0) return true;
  } catch {
    // continue
  }

  // 2) PBKDF2 hashes created by admin UI (`hashPassword`) — RPC only understands bcrypt.
  try {
    const { data } = await getServiceClient()
      .from("admin_users")
      .select("password_hash, active")
      .eq("username", user)
      .maybeSingle();
    if (data?.active !== false && typeof data?.password_hash === "string") {
      if (data.password_hash.startsWith("pbkdf2:") && verifyPbkdf2(password, data.password_hash)) {
        return true;
      }
    }
  } catch {
    // continue
  }

  // Fallback: env-var credentials. In production, only honor this path when an
  // ADMIN_PASSWORD is explicitly configured — never the baked-in dev default,
  // which would otherwise be a public backdoor.
  if (!adminPasswordEnv && import.meta.env.PROD) return false;
  return user === adminUser && password === adminPassword;
}

// ── HMAC-signed stateless session tokens ─────────────────────────────────────

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSession(username: string): { token: string; expiresAt: number } {
  if (secretIsInsecure) {
    throw new Error("SESSION_SECRET is not configured in production — refusing to issue a forgeable session.");
  }
  const expiresAt = Date.now() + sessionTtlMs;
  const payload = `${username}:${expiresAt}`;
  const sig = sign(payload);
  const token = Buffer.from(`${payload}:${sig}`).toString("base64url");
  return { token, expiresAt };
}

export function getSession(cookieHeader: string | null): { user: string; expiresAt: number } | null {
  if (secretIsInsecure) return null;
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
