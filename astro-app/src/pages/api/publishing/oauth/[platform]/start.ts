import type { APIRoute } from "astro";
import { requireAdmin, jsonResponse } from "@/lib/admin-auth";
import { callbackUrl, createOAuthState, createPkce, oauthConfiguration, secureCookie, type SocialOAuthPlatform } from "@/lib/social-oauth";

export const prerender = false;

const PLATFORMS = new Set(["linkedin", "instagram", "x"]);

export const POST: APIRoute = async ({ request, params }) => {
  const auth = await requireAdmin(request, "social_accounts.manage");
  if (!auth.ok) return jsonResponse({ ok: false, error: auth.error }, auth.status);
  const platform = params.platform as SocialOAuthPlatform;
  if (!PLATFORMS.has(platform)) return jsonResponse({ ok: false, error: "Geçersiz platform." }, 404);
  try {
    const config = oauthConfiguration(platform);
    if (!config.clientId || !config.clientSecret) {
      return jsonResponse({
        ok: false,
        code: "OAUTH_APP_NOT_CONFIGURED",
        error: `${platform} Developer App bilgileri production ortamında tanımlı değil.`,
      }, 503);
    }
    if (platform === "linkedin" && !config.accountId) {
      return jsonResponse({ ok: false, code: "ORGANIZATION_ID_REQUIRED", error: "LinkedIn Organization ID tanımlı değil." }, 503);
    }
    const state = createOAuthState(platform);
    const redirectUri = callbackUrl(request, platform);
    let authorizationUrl = "";
    const headers = new Headers({ "Content-Type": "application/json" });
    if (platform === "linkedin") {
      const query = new URLSearchParams({ response_type: "code", client_id: config.clientId, redirect_uri: redirectUri, state, scope: "openid profile w_organization_social rw_organization_admin" });
      authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?${query}`;
    } else if (platform === "instagram") {
      const query = new URLSearchParams({ enable_fb_login: "0", force_authentication: "1", client_id: config.clientId, redirect_uri: redirectUri, response_type: "code", scope: "instagram_business_basic,instagram_business_content_publish", state });
      authorizationUrl = `https://www.instagram.com/oauth/authorize?${query}`;
    } else {
      const pkce = createPkce();
      headers.append("Set-Cookie", secureCookie("willow_x_pkce", pkce.verifier));
      const query = new URLSearchParams({ response_type: "code", client_id: config.clientId, redirect_uri: redirectUri, scope: "tweet.read tweet.write users.read offline.access", state, code_challenge: pkce.challenge, code_challenge_method: "S256" });
      authorizationUrl = `https://x.com/i/oauth2/authorize?${query}`;
    }
    return new Response(JSON.stringify({ ok: true, authorizationUrl }), { status: 200, headers });
  } catch (error: any) {
    return jsonResponse({ ok: false, error: error?.message || "OAuth başlatılamadı." }, 500);
  }
};
