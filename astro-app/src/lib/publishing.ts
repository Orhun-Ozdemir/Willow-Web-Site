import { randomUUID, randomBytes, createCipheriv, createDecipheriv, createHash } from "node:crypto";
import { getServiceClient } from "./supabase";
import { loadContent, saveContentSection, bustContentCache } from "./content";

export const PUBLISHING_PLATFORMS = ["website", "linkedin", "instagram", "x"] as const;
export type PublishingPlatform = (typeof PUBLISHING_PLATFORMS)[number];

export type CanonicalPublicationContent = {
  id?: string;
  title: string;
  slug: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  images?: string[];
  featured?: boolean;
  locale?: string;
  localized?: Record<string, Record<string, string>>;
};

export type PublicationTargetInput = {
  platform: PublishingPlatform;
  enabled: boolean;
  accountId?: string | null;
  overrides?: Record<string, unknown>;
};

type StoredAccount = {
  id: string;
  platform: Exclude<PublishingPlatform, "website">;
  external_account_id: string;
  display_name: string;
  username?: string | null;
  status: string;
  scopes?: string[];
  token_ciphertext?: string | null;
  metadata?: Record<string, unknown>;
};

export type PublicAccount = {
  id: string;
  platform: PublishingPlatform;
  displayName: string;
  username?: string;
  status: "connected" | "expired" | "attention" | "disconnected";
  source: "builtin" | "database" | "environment";
  capabilities: string[];
};

const env = (key: string): string =>
  ((import.meta.env as Record<string, string | undefined>)?.[key] || process.env[key] || "").trim();

function platformCapabilities(platform: PublishingPlatform): string[] {
  if (platform === "website") return ["article", "gallery", "seo", "translations", "featured", "schedule"];
  if (platform === "linkedin") return ["text", "article", "image", "multi_image", "schedule"];
  if (platform === "instagram") return ["image", "carousel", "caption", "schedule"];
  return ["text", "reply_settings", "poll", "schedule"];
}

function envAccount(platform: Exclude<PublishingPlatform, "website">): PublicAccount | null {
  const prefix = platform === "x" ? "X" : platform.toUpperCase();
  const token = env(`${prefix}_ACCESS_TOKEN`);
  const externalId = env(`${prefix}_${platform === "linkedin" ? "ORGANIZATION_ID" : platform === "instagram" ? "USER_ID" : "USER_ID"}`);
  if (!token || !externalId) return null;
  return {
    id: `env:${platform}`,
    platform,
    displayName: env(`${prefix}_DISPLAY_NAME`) || (platform === "x" ? "WillowSoft on X" : `WillowSoft ${platform}`),
    username: env(`${prefix}_USERNAME`) || undefined,
    status: "connected",
    source: "environment",
    capabilities: platformCapabilities(platform),
  };
}

export async function listPublishingAccounts(): Promise<PublicAccount[]> {
  const accounts: PublicAccount[] = [{
    id: "website",
    platform: "website",
    displayName: "willowsoft.co",
    status: "connected",
    source: "builtin",
    capabilities: platformCapabilities("website"),
  }];

  try {
    const { data, error } = await getServiceClient()
      .from("social_accounts")
      .select("id,platform,external_account_id,display_name,username,status,scopes,metadata")
      .neq("status", "disconnected")
      .order("created_at", { ascending: true });
    if (error) throw error;
    for (const row of (data || []) as StoredAccount[]) {
      accounts.push({
        id: row.id,
        platform: row.platform,
        displayName: row.display_name,
        username: row.username || undefined,
        status: row.status as PublicAccount["status"],
        source: "database",
        capabilities: platformCapabilities(row.platform),
      });
    }
  } catch {
    // Migration may not be installed yet. Environment-backed company accounts
    // still make the screen usable without exposing tokens to the browser.
  }

  for (const platform of ["linkedin", "instagram", "x"] as const) {
    if (!accounts.some((item) => item.platform === platform)) {
      const fallback = envAccount(platform);
      if (fallback) accounts.push(fallback);
    }
  }
  return accounts;
}

export function validatePublication(
  content: CanonicalPublicationContent,
  targets: PublicationTargetInput[],
): Record<PublishingPlatform, string[]> {
  const errors: Record<PublishingPlatform, string[]> = {
    website: [], linkedin: [], instagram: [], x: [],
  };
  const selected = targets.filter((target) => target.enabled);
  if (!selected.length) errors.website.push("En az bir yayın kanalı seçin.");

  for (const target of selected) {
    const overrides = target.overrides || {};
    const text = String(overrides.text || content.excerpt || content.title || "").trim();
    if (target.platform !== "website" && !target.accountId) {
      errors[target.platform].push(`${target.platform} hesabı bağlı değil.`);
    }
    if (target.platform === "website") {
      if (!String(content.title || "").trim()) errors.website.push("Haber başlığı gerekli.");
      if (!String(content.slug || "").trim()) errors.website.push("Haber URL'si gerekli.");
      if (!String(content.date || "").trim()) errors.website.push("Yayın tarihi gerekli.");
      if (!String(content.excerpt || "").trim()) errors.website.push("Haber özeti gerekli.");
      if (!String(content.content || "").trim()) errors.website.push("Haber içeriği gerekli.");
      if (!String(content.image || "").trim()) errors.website.push("Kapak görseli gerekli.");
    } else if (target.platform === "linkedin") {
      if (!text) errors.linkedin.push("LinkedIn paylaşım metni gerekli.");
      if (text.length > 3000) errors.linkedin.push("LinkedIn metni 3.000 karakteri aşamaz.");
    } else if (target.platform === "instagram") {
      if (!text) errors.instagram.push("Instagram açıklaması gerekli.");
      if (text.length > 2200) errors.instagram.push("Instagram açıklaması 2.200 karakteri aşamaz.");
      const media = Array.isArray(overrides.media) ? overrides.media : content.images?.length ? content.images : [content.image];
      if (!media.filter(Boolean).length) errors.instagram.push("Instagram için en az bir görsel gerekli.");
      if (media.length > 10) errors.instagram.push("Instagram carousel en fazla 10 görsel içerebilir.");
    } else if (target.platform === "x") {
      if (!text) errors.x.push("X paylaşım metni gerekli.");
      if (text.length > 280) errors.x.push("X metni 280 karakteri aşamaz.");
      const poll = overrides.poll as { options?: string[]; durationMinutes?: number } | undefined;
      if (poll?.options && (poll.options.length < 2 || poll.options.length > 4)) {
        errors.x.push("X anketi 2–4 seçenek içermeli.");
      }
    }
  }
  return errors;
}

function decryptToken(ciphertext: string): string {
  const secret = env("SOCIAL_TOKEN_ENCRYPTION_KEY");
  if (!secret) throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY tanımlı değil.");
  const [ivValue, tagValue, payloadValue] = ciphertext.split(".");
  if (!ivValue || !tagValue || !payloadValue) throw new Error("Token şifre biçimi geçersiz.");
  const key = createHash("sha256").update(secret).digest();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(payloadValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function encryptPublishingToken(value: string): string {
  const secret = env("SOCIAL_TOKEN_ENCRYPTION_KEY");
  if (!secret) throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY tanımlı değil.");
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const payload = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), payload.toString("base64url")].join(".");
}

async function getAccount(target: any): Promise<{ token: string; externalId: string; metadata: Record<string, any> }> {
  const platform = target.platform as Exclude<PublishingPlatform, "website">;
  if (!target.account_id || String(target.account_id).startsWith("env:")) {
    const prefix = platform === "x" ? "X" : platform.toUpperCase();
    const token = env(`${prefix}_ACCESS_TOKEN`);
    const externalId = env(`${prefix}_${platform === "linkedin" ? "ORGANIZATION_ID" : "USER_ID"}`);
    if (!token || !externalId) throw new Error(`${platform} hesabı bağlı değil.`);
    return { token, externalId, metadata: {} };
  }
  const { data, error } = await getServiceClient()
    .from("social_accounts")
    .select("external_account_id,token_ciphertext,metadata,status")
    .eq("id", target.account_id)
    .single();
  if (error || !data) throw new Error(`${platform} hesabı bulunamadı.`);
  if (data.status !== "connected") throw new Error(`${platform} hesabının yeniden bağlanması gerekiyor.`);
  if (!data.token_ciphertext) throw new Error(`${platform} hesabında yayın token'ı yok.`);
  return { token: decryptToken(data.token_ciphertext), externalId: data.external_account_id, metadata: data.metadata || {} };
}

function publicAssetUrl(value: string): string {
  if (/^https:\/\//i.test(value)) return value;
  const origin = env("PUBLIC_SITE_URL") || "https://www.willowsoft.co";
  return `${origin.replace(/\/$/, "")}/${value.replace(/^\//, "")}`;
}

function websiteNewsUrl(content: CanonicalPublicationContent): string {
  const origin = env("PUBLIC_SITE_URL") || "https://www.willowsoft.co";
  return `${origin.replace(/\/$/, "")}/${content.locale || "en"}/news/${content.slug}`;
}

async function publishWebsite(content: CanonicalPublicationContent) {
  const current = await loadContent({ allowFallback: false });
  const id = content.id || `news-${Date.now()}`;
  const item = {
    id,
    title: content.title,
    slug: content.slug,
    date: content.date,
    category: content.category,
    excerpt: content.excerpt,
    content: content.content,
    image: content.image,
    images: content.images || [],
    featured: Boolean(content.featured),
    localized: content.localized || {},
    publicationStatus: "published",
  };
  const news = Array.isArray(current.news) ? [...current.news] : [];
  const index = news.findIndex((entry: any) => entry.id === id || entry.slug === content.slug);
  if (index >= 0) news[index] = { ...news[index], ...item, id: news[index].id || id };
  else news.unshift(item);
  await saveContentSection("news", news);
  bustContentCache();
  return { externalPostId: id, externalUrl: websiteNewsUrl(content), newsId: id };
}

async function uploadLinkedInImage(token: string, owner: string, url: string): Promise<string> {
  const version = env("LINKEDIN_API_VERSION") || "202607";
  const init = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": version,
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({ initializeUploadRequest: { owner } }),
  });
  const initData = await init.json();
  if (!init.ok) throw new Error(initData?.message || "LinkedIn görsel yüklemesi başlatılamadı.");
  const uploadUrl = initData?.value?.uploadUrl;
  const imageUrn = initData?.value?.image;
  if (!uploadUrl || !imageUrn) throw new Error("LinkedIn görsel yükleme adresi alınamadı.");
  const asset = await fetch(publicAssetUrl(url));
  if (!asset.ok) throw new Error("LinkedIn görseli kaynak sunucudan alınamadı.");
  const uploaded = await fetch(uploadUrl, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: await asset.arrayBuffer() });
  if (!uploaded.ok) throw new Error("LinkedIn görseli yüklenemedi.");
  return imageUrn;
}

async function publishLinkedIn(content: CanonicalPublicationContent, target: any) {
  const account = await getAccount(target);
  const overrides = target.overrides || {};
  const commentary = String(overrides.text || content.excerpt || content.title);
  const author = `urn:li:organization:${account.externalId.replace(/^urn:li:organization:/, "")}`;
  const payload: Record<string, any> = {
    author,
    commentary,
    visibility: "PUBLIC",
    distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: Boolean(overrides.disableReshare),
  };
  const media = String(overrides.image || content.image || "");
  if (media) {
    const imageUrn = await uploadLinkedInImage(account.token, author, media);
    payload.content = { media: { id: imageUrn, title: content.title } };
  } else if (overrides.includeWebsiteLink !== false) {
    payload.content = { article: { source: websiteNewsUrl(content), title: content.title, description: content.excerpt } };
  }
  const response = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${account.token}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": env("LINKEDIN_API_VERSION") || "202607",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`LinkedIn: ${body.slice(0, 280)}`);
  const postId = response.headers.get("x-restli-id") || "published";
  return { externalPostId: postId, externalUrl: null };
}

async function publishInstagram(content: CanonicalPublicationContent, target: any) {
  const account = await getAccount(target);
  const overrides = target.overrides || {};
  const caption = String(overrides.text || content.excerpt || content.title);
  const media = (Array.isArray(overrides.media) ? overrides.media : content.images?.length ? content.images : [content.image])
    .map(String).filter(Boolean).slice(0, 10);
  if (!media.length) throw new Error("Instagram için görsel bulunamadı.");
  const graphHost = String(account.metadata.graphHost || env("INSTAGRAM_GRAPH_HOST") || "https://graph.instagram.com").replace(/\/$/, "");
  const version = env("META_GRAPH_VERSION") || "v23.0";
  const base = `${graphHost}/${version}`;
  let creationId = "";
  if (media.length === 1) {
    const params = new URLSearchParams({ image_url: publicAssetUrl(media[0]), caption, access_token: account.token });
    const created = await fetch(`${base}/${account.externalId}/media?${params}`, { method: "POST" });
    const data = await created.json();
    if (!created.ok || !data.id) throw new Error(data?.error?.message || "Instagram medya container'ı oluşturulamadı.");
    creationId = data.id;
  } else {
    const children: string[] = [];
    for (const url of media) {
      const params = new URLSearchParams({ image_url: publicAssetUrl(url), is_carousel_item: "true", access_token: account.token });
      const created = await fetch(`${base}/${account.externalId}/media?${params}`, { method: "POST" });
      const data = await created.json();
      if (!created.ok || !data.id) throw new Error(data?.error?.message || "Instagram carousel görseli hazırlanamadı.");
      children.push(data.id);
    }
    const params = new URLSearchParams({ media_type: "CAROUSEL", children: children.join(","), caption, access_token: account.token });
    const created = await fetch(`${base}/${account.externalId}/media?${params}`, { method: "POST" });
    const data = await created.json();
    if (!created.ok || !data.id) throw new Error(data?.error?.message || "Instagram carousel hazırlanamadı.");
    creationId = data.id;
  }
  const publishParams = new URLSearchParams({ creation_id: creationId, access_token: account.token });
  const published = await fetch(`${base}/${account.externalId}/media_publish?${publishParams}`, { method: "POST" });
  const result = await published.json();
  if (!published.ok || !result.id) throw new Error(result?.error?.message || "Instagram yayını tamamlanamadı.");
  return { externalPostId: result.id, externalUrl: `https://www.instagram.com/p/${result.id}/` };
}

async function publishX(content: CanonicalPublicationContent, target: any) {
  const account = await getAccount(target);
  const overrides = target.overrides || {};
  const payload: Record<string, any> = { text: String(overrides.text || content.excerpt || content.title) };
  if (overrides.replySettings) payload.reply_settings = overrides.replySettings;
  if (overrides.madeWithAi === true) payload.made_with_ai = true;
  const poll = overrides.poll as { options?: string[]; durationMinutes?: number } | undefined;
  if (poll?.options?.length) payload.poll = { options: poll.options, duration_minutes: poll.durationMinutes || 1440 };
  const response = await fetch("https://api.x.com/2/tweets", {
    method: "POST",
    headers: { Authorization: `Bearer ${account.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok || !result?.data?.id) throw new Error(result?.detail || result?.title || "X paylaşımı başarısız.");
  return { externalPostId: result.data.id, externalUrl: `https://x.com/i/web/status/${result.data.id}` };
}

async function recordEvent(campaignId: string, targetId: string | null, eventType: string, message: string, metadata: Record<string, unknown> = {}) {
  await getServiceClient().from("publication_events").insert({
    campaign_id: campaignId,
    target_id: targetId,
    event_type: eventType,
    message,
    metadata,
  });
}

export async function processCampaign(campaignId: string, onlyPlatforms?: PublishingPlatform[]) {
  const sb = getServiceClient();
  const { data: campaign, error: campaignError } = await sb.from("publication_campaigns").select("*").eq("id", campaignId).single();
  if (campaignError || !campaign) throw new Error("Yayın bulunamadı.");
  let targetQuery = sb.from("publication_targets").select("*").eq("campaign_id", campaignId).eq("enabled", true);
  if (onlyPlatforms?.length) targetQuery = targetQuery.in("platform", onlyPlatforms);
  const { data: targets, error: targetsError } = await targetQuery;
  if (targetsError) throw targetsError;
  const content = campaign.canonical_content as CanonicalPublicationContent;
  const errors = validatePublication(content, (targets || []).map((t: any) => ({
    platform: t.platform,
    enabled: t.enabled,
    accountId: t.platform === "website" ? "website" : t.account_id || envAccount(t.platform)?.id || null,
    overrides: t.overrides,
  })));
  const invalid = Object.entries(errors).filter(([, messages]) => messages.length);
  if (invalid.length) throw new Error(invalid.flatMap(([platform, messages]) => messages.map((m) => `${platform}: ${m}`)).join(" "));

  await sb.from("publication_campaigns").update({ status: "publishing", updated_at: new Date().toISOString() }).eq("id", campaignId);
  await recordEvent(campaignId, null, "publishing_started", "Yayınlama başlatıldı.");

  const results = await Promise.all((targets || []).map(async (target: any) => {
    if (target.status === "published") return { platform: target.platform, status: "published", skipped: true };
    const now = new Date().toISOString();
    await sb.from("publication_targets").update({ status: "publishing", attempts: (target.attempts || 0) + 1, error_code: null, error_message: null, updated_at: now }).eq("id", target.id);
    try {
      const result = target.platform === "website"
        ? await publishWebsite(content)
        : target.platform === "linkedin"
          ? await publishLinkedIn(content, target)
          : target.platform === "instagram"
            ? await publishInstagram(content, target)
            : await publishX(content, target);
      await sb.from("publication_targets").update({
        status: "published",
        external_post_id: result.externalPostId,
        external_url: result.externalUrl,
        published_at: new Date().toISOString(),
        retryable: false,
        updated_at: new Date().toISOString(),
      }).eq("id", target.id);
      if (target.platform === "website" && "newsId" in result) {
        await sb.from("publication_campaigns").update({ news_id: result.newsId }).eq("id", campaignId);
      }
      await recordEvent(campaignId, target.id, "target_published", `${target.platform} yayınlandı.`, { externalPostId: result.externalPostId });
      return { platform: target.platform, status: "published", ...result };
    } catch (error: any) {
      const message = error?.message || "Bilinmeyen yayınlama hatası";
      await sb.from("publication_targets").update({
        status: "failed",
        error_code: "PUBLISH_FAILED",
        error_message: message.slice(0, 1000),
        retryable: true,
        updated_at: new Date().toISOString(),
      }).eq("id", target.id);
      await recordEvent(campaignId, target.id, "target_failed", `${target.platform} yayınlanamadı.`, { error: message.slice(0, 500) });
      return { platform: target.platform, status: "failed", error: message, retryable: true };
    }
  }));

  const publishedCount = results.filter((result) => result.status === "published").length;
  const finalStatus = publishedCount === results.length ? "published" : publishedCount > 0 ? "partially_published" : "failed";
  await sb.from("publication_campaigns").update({ status: finalStatus, updated_at: new Date().toISOString() }).eq("id", campaignId);
  return { campaignId, status: finalStatus, targets: results };
}

export function newIdempotencyKey() {
  return `publication_${randomUUID()}`;
}
