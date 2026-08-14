import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export type SocialOAuthPlatform = "linkedin" | "instagram" | "x";

const env = (key: string): string =>
  ((import.meta.env as Record<string, string | undefined>)?.[key] || process.env[key] || "").trim();

function stateSecret() {
  const value = env("SOCIAL_OAUTH_STATE_SECRET") || env("SESSION_SECRET");
  if (!value) throw new Error("SOCIAL_OAUTH_STATE_SECRET veya SESSION_SECRET tanımlı değil.");
  return value;
}

export function createOAuthState(platform: SocialOAuthPlatform) {
  const payload = `${platform}:${Date.now()}:${randomBytes(18).toString("base64url")}`;
  const signature = createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifyOAuthState(state: string, platform: SocialOAuthPlatform) {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 4 || parts[0] !== platform) return false;
    const payload = parts.slice(0, 3).join(":");
    const expected = createHmac("sha256", stateSecret()).update(payload).digest("base64url");
    const given = Buffer.from(parts[3]);
    const wanted = Buffer.from(expected);
    if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return false;
    return Date.now() - Number(parts[1]) < 10 * 60 * 1000;
  } catch {
    return false;
  }
}

export function createPkce() {
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function callbackUrl(request: Request, platform: SocialOAuthPlatform) {
  const configured = env("PUBLIC_SITE_URL");
  const origin = configured || new URL(request.url).origin;
  return `${origin.replace(/\/$/, "")}/api/publishing/oauth/${platform}/callback`;
}

export function oauthConfiguration(platform: SocialOAuthPlatform) {
  if (platform === "linkedin") return {
    clientId: env("LINKEDIN_CLIENT_ID"), clientSecret: env("LINKEDIN_CLIENT_SECRET"),
    accountId: env("LINKEDIN_ORGANIZATION_ID"),
  };
  if (platform === "instagram") return {
    clientId: env("INSTAGRAM_CLIENT_ID"), clientSecret: env("INSTAGRAM_CLIENT_SECRET"), accountId: "",
  };
  return { clientId: env("X_CLIENT_ID"), clientSecret: env("X_CLIENT_SECRET"), accountId: "" };
}

export function secureCookie(name: string, value: string, maxAge = 600) {
  return `${name}=${encodeURIComponent(value)}; Path=/api/publishing/oauth; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${import.meta.env.PROD ? "; Secure" : ""}`;
}

export function readCookie(request: Request, name: string) {
  const match = request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : "";
}
