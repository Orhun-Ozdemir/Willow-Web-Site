import type { APIRoute } from "astro";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceClient } from "@/lib/supabase";
import { encryptPublishingToken } from "@/lib/publishing";
import { callbackUrl, oauthConfiguration, readCookie, secureCookie, verifyOAuthState, type SocialOAuthPlatform } from "@/lib/social-oauth";

export const prerender = false;

function finish(request: Request, status: "connected" | "error", message?: string, headers?: Headers) {
  const url = new URL("/admin/dashboard", new URL(request.url).origin);
  url.searchParams.set("tab", "publishing");
  url.searchParams.set("social", status);
  if (message) url.searchParams.set("message", message.slice(0, 180));
  return new Response(null, { status: 302, headers: new Headers([...(headers?.entries() || []), ["Location", url.toString()]]) });
}

export const GET: APIRoute = async ({ request, params }) => {
  const auth = await requireAdmin(request, "social_accounts.manage");
  if (!auth.ok) return finish(request, "error", "Admin oturumu doğrulanamadı.");
  const platform = params.platform as SocialOAuthPlatform;
  if (!["linkedin", "instagram", "x"].includes(platform)) return finish(request, "error", "Geçersiz platform.");
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const providerError = url.searchParams.get("error_description") || url.searchParams.get("error");
  if (providerError) return finish(request, "error", providerError);
  if (!code || !verifyOAuthState(state, platform)) return finish(request, "error", "OAuth doğrulaması geçersiz veya süresi dolmuş.");

  try {
    const config = oauthConfiguration(platform);
    const redirectUri = callbackUrl(request, platform);
    let token = "";
    let refreshToken = "";
    let expiresIn: number | null = null;
    let externalId = config.accountId;
    let displayName: string = platform;
    let username = "";
    let scopes: string[] = [];
    const metadata: Record<string, unknown> = {};

    if (platform === "linkedin") {
      const body = new URLSearchParams({ grant_type: "authorization_code", code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: redirectUri });
      const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      const data = await response.json();
      if (!response.ok || !data.access_token) throw new Error(data.error_description || "LinkedIn token alınamadı.");
      token = data.access_token; refreshToken = data.refresh_token || ""; expiresIn = data.expires_in || null; scopes = String(data.scope || "").split(" ").filter(Boolean);
      displayName = process.env.LINKEDIN_DISPLAY_NAME || "WillowSoft LinkedIn";
      username = process.env.LINKEDIN_USERNAME || "";
    } else if (platform === "instagram") {
      const form = new FormData();
      form.set("client_id", config.clientId); form.set("client_secret", config.clientSecret); form.set("grant_type", "authorization_code"); form.set("redirect_uri", redirectUri); form.set("code", code);
      const response = await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok || !data.access_token) throw new Error(data.error_message || data.error?.message || "Instagram token alınamadı.");
      token = data.access_token; externalId = String(data.user_id || ""); scopes = ["instagram_business_basic", "instagram_business_content_publish"];
      const profileResponse = await fetch(`https://graph.instagram.com/me?fields=id,user_id,username,name&access_token=${encodeURIComponent(token)}`);
      const profile = await profileResponse.json();
      externalId = String(profile.user_id || profile.id || externalId); username = profile.username || ""; displayName = profile.name || profile.username || "Instagram";
      metadata.graphHost = "https://graph.instagram.com";
    } else {
      const verifier = readCookie(request, "willow_x_pkce");
      if (!verifier) throw new Error("X PKCE doğrulama bilgisi bulunamadı.");
      const body = new URLSearchParams({ code, grant_type: "authorization_code", redirect_uri: redirectUri, code_verifier: verifier, client_id: config.clientId });
      const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
      if (config.clientSecret) headers.Authorization = `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`;
      const response = await fetch("https://api.x.com/2/oauth2/token", { method: "POST", headers, body });
      const data = await response.json();
      if (!response.ok || !data.access_token) throw new Error(data.detail || data.error_description || "X token alınamadı.");
      token = data.access_token; refreshToken = data.refresh_token || ""; expiresIn = data.expires_in || null; scopes = String(data.scope || "").split(" ").filter(Boolean);
      const profileResponse = await fetch("https://api.x.com/2/users/me?user.fields=name,username", { headers: { Authorization: `Bearer ${token}` } });
      const profile = await profileResponse.json();
      externalId = profile?.data?.id || ""; username = profile?.data?.username || ""; displayName = profile?.data?.name || username || "X";
    }
    if (!externalId) throw new Error("Platform hesap kimliği alınamadı.");

    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;
    const { error } = await getServiceClient().from("social_accounts").upsert({
      platform, external_account_id: externalId, display_name: displayName, username: username || null,
      status: "connected", scopes, token_ciphertext: encryptPublishingToken(token),
      refresh_ciphertext: refreshToken ? encryptPublishingToken(refreshToken) : null,
      token_expires_at: expiresAt, metadata, connected_by: auth.profile.id, updated_at: new Date().toISOString(),
    }, { onConflict: "platform,external_account_id" });
    if (error) throw error;
    const headers = new Headers();
    if (platform === "x") headers.append("Set-Cookie", secureCookie("willow_x_pkce", "", 0));
    return finish(request, "connected", `${displayName} bağlandı.`, headers);
  } catch (error: any) {
    return finish(request, "error", error?.message || "Hesap bağlanamadı.");
  }
};
