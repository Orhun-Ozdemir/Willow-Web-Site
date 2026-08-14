"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import VisualHtmlEditor from "./VisualHtmlEditor";
import TranslationEditor from "./TranslationEditor";
import { resolveAsset } from "@/lib/cms";

type Platform = "website" | "linkedin" | "instagram" | "x";
type Account = {
  id: string;
  platform: Platform;
  displayName: string;
  username?: string;
  status: string;
  source: string;
  capabilities: string[];
};
type ChannelDraft = {
  enabled: boolean;
  accountId: string;
  text: string;
  includeWebsiteLink?: boolean;
  disableReshare?: boolean;
  replySettings?: string;
  madeWithAi?: boolean;
  pollEnabled?: boolean;
  pollOptions?: string[];
  pollDuration?: number;
};
type Campaign = {
  id: string;
  title: string;
  status: string;
  canonical_content: any;
  idempotency_key?: string;
  scheduled_at?: string | null;
  timezone?: string;
  updated_at?: string;
  publication_targets?: any[];
};

const PLATFORM_META: Record<Platform, { label: string; short: string; color: string; hint: string }> = {
  website: { label: "Web Sitesi", short: "W", color: "#132175", hint: "Haber, SEO ve çeviriler" },
  linkedin: { label: "LinkedIn", short: "in", color: "#0a66c2", hint: "Şirket sayfası paylaşımı" },
  instagram: { label: "Instagram", short: "◎", color: "#c13584", hint: "Feed ve carousel" },
  x: { label: "X", short: "X", color: "#111827", hint: "Kısa kurumsal paylaşım" },
};

const PUBLICATION_TRANSLATION_FIELDS = [
  { key: "title", label: "Başlık" },
  { key: "category", label: "Kategori" },
  { key: "excerpt", label: "Özet", type: "textarea" as const },
  { key: "content", label: "İçerik", type: "richtext" as const, rows: 6 },
];

function slugify(value: string) {
  return value.toLocaleLowerCase("tr-TR").trim()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyContent() {
  return {
    title: "", slug: "", date: today(), category: "company-update", excerpt: "", content: "",
    image: "", images: [] as string[], featured: false, locale: "tr", localized: {},
  };
}

function defaultChannels(): Record<Platform, ChannelDraft> {
  return {
    website: { enabled: true, accountId: "website", text: "" },
    linkedin: { enabled: true, accountId: "", text: "", includeWebsiteLink: true, disableReshare: false },
    instagram: { enabled: true, accountId: "", text: "" },
    x: { enabled: true, accountId: "", text: "", replySettings: "everyone", madeWithAi: false, pollEnabled: false, pollOptions: ["", ""], pollDuration: 1440 },
  };
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Taslak", ready: "Hazır", scheduled: "Zamanlandı", queued: "Sırada",
    publishing: "Yayınlanıyor", partially_published: "Kısmen yayınlandı", published: "Yayınlandı",
    failed: "Hata", pending: "Bekliyor", retrying: "Yeniden deneniyor",
  };
  return labels[status] || status;
}

function channelText(channel: ChannelDraft, content: any) {
  return channel.text || content.excerpt || content.title || "";
}

export default function PublishingCenterPanel() {
  const { content: cmsContent } = useAdmin();
  const [content, setContent] = useState<any>(emptyContent());
  const [channels, setChannels] = useState<Record<Platform, ChannelDraft>>(defaultChannels());
  const [activePlatform, setActivePlatform] = useState<Platform>("website");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<Platform, string[]>>({ website: [], linkedin: [], instagram: [], x: [] });
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [mobileStep, setMobileStep] = useState<"content" | "channels" | "review">("content");

  const selectedPlatforms = (Object.keys(channels) as Platform[]).filter((platform) => channels[platform].enabled);
  const activeAccount = accounts.find((account) => account.id === channels[activePlatform].accountId);
  const cover = content.image ? resolveAsset(content.image) : "";

  const readiness = useMemo(() => {
    const checks = [content.title, content.slug, content.date, content.excerpt, content.content, content.image];
    return Math.round((checks.filter((value) => String(value || "").trim()).length / checks.length) * 100);
  }, [content]);

  async function loadData() {
    setLoading(true);
    try {
      const [accountRes, campaignRes] = await Promise.all([
        fetch("/api/publishing/accounts"),
        fetch("/api/publishing"),
      ]);
      const accountData = await accountRes.json();
      const campaignData = await campaignRes.json();
      if (accountRes.ok) {
        const nextAccounts = accountData.accounts || [];
        setAccounts(nextAccounts);
        setChannels((previous) => {
          const next = { ...previous };
          for (const platform of Object.keys(next) as Platform[]) {
            const account = nextAccounts.find((item: Account) => item.platform === platform && item.status === "connected");
            if (account && !next[platform].accountId) next[platform] = { ...next[platform], accountId: account.id };
          }
          return next;
        });
      }
      if (campaignRes.ok) setCampaigns(campaignData.campaigns || []);
      else if (campaignData.code === "PUBLISHING_MIGRATION_REQUIRED") {
        setMessage({ tone: "info", text: "Yayın Merkezi hazır. Kayıt ve yayınlama için 0008_publishing_center.sql migration'ı Supabase'e uygulanmalı." });
      }
      const query = new URLSearchParams(window.location.search);
      if (query.get("social") === "connected") {
        setMessage({ tone: "success", text: query.get("message") || "Sosyal medya hesabı bağlandı." });
        window.history.replaceState({}, "", "/admin/dashboard?tab=publishing");
      } else if (query.get("social") === "error") {
        setMessage({ tone: "error", text: query.get("message") || "Sosyal medya hesabı bağlanamadı." });
        window.history.replaceState({}, "", "/admin/dashboard?tab=publishing");
      }
    } catch {
      setMessage({ tone: "error", text: "Yayın bilgileri alınamadı. Ağ bağlantısını kontrol edin." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function updateContent(key: string, value: any) {
    setContent((previous: any) => {
      const next = { ...previous, [key]: value };
      if (key === "title" && (!previous.slug || previous.slug === slugify(previous.title || ""))) next.slug = slugify(value);
      return next;
    });
  }

  function updateChannel(platform: Platform, patch: Partial<ChannelDraft>) {
    setChannels((previous) => ({ ...previous, [platform]: { ...previous[platform], ...patch } }));
  }

  async function connectPlatform(platform: Exclude<Platform, "website">) {
    setMessage({ tone: "info", text: `${PLATFORM_META[platform].label} güvenli bağlantısı hazırlanıyor…` });
    try {
      const response = await fetch(`/api/publishing/oauth/${platform}/start`, { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.authorizationUrl) throw new Error(data.error || "Bağlantı başlatılamadı.");
      window.location.href = data.authorizationUrl;
    } catch (error: any) {
      setMessage({ tone: "error", text: error?.message || "Hesap bağlantısı başlatılamadı." });
    }
  }

  function targetsPayload() {
    return (Object.keys(channels) as Platform[]).map((platform) => {
      const channel = channels[platform];
      const overrides: Record<string, any> = { text: channelText(channel, content) };
      if (platform === "linkedin") {
        overrides.includeWebsiteLink = channel.includeWebsiteLink;
        overrides.disableReshare = channel.disableReshare;
        overrides.image = content.image;
      }
      if (platform === "instagram") overrides.media = content.images?.length ? content.images : [content.image].filter(Boolean);
      if (platform === "x") {
        overrides.replySettings = channel.replySettings;
        overrides.madeWithAi = channel.madeWithAi;
        if (channel.pollEnabled) overrides.poll = { options: (channel.pollOptions || []).filter(Boolean), durationMinutes: channel.pollDuration || 1440 };
      }
      return { platform, enabled: channel.enabled, accountId: channel.accountId || null, overrides };
    });
  }

  async function validate() {
    const response = await fetch("/api/publishing/validate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, targets: targetsPayload() }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "İçerik doğrulanamadı.");
    setErrors(data.errors);
    return data.valid as boolean;
  }

  async function saveDraft(options: { silent?: boolean; schedule?: boolean } = {}) {
    setSaving(true);
    if (!options.silent) setMessage(null);
    try {
      const body = {
        id: campaignId,
        content,
        targets: targetsPayload(),
        timezone: "Europe/Istanbul",
        scheduledAt: options.schedule && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        idempotencyKey,
      };
      const response = await fetch("/api/publishing", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Taslak kaydedilemedi.");
      setCampaignId(data.campaign.id);
      setIdempotencyKey(data.campaign.idempotency_key || idempotencyKey);
      if (!options.silent) setMessage({ tone: "success", text: options.schedule ? "Yayın planlandı." : "Taslak güvenle kaydedildi." });
      await loadData();
      return data.campaign as Campaign;
    } catch (error: any) {
      setMessage({ tone: "error", text: error?.message || "Taslak kaydedilemedi." });
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    setMessage(null);
    setPublishing(true);
    try {
      const valid = await validate();
      if (!valid) {
        const firstPlatform = (Object.keys(errors) as Platform[]).find((platform) => errors[platform]?.length);
        if (firstPlatform) setActivePlatform(firstPlatform);
        throw new Error("Yayınlamadan önce işaretli alanları tamamlayın.");
      }
      const campaign = await saveDraft({ silent: true });
      if (!campaign) throw new Error("Taslak kaydedilemediği için yayınlama başlatılmadı.");
      const response = await fetch(`/api/publishing/${campaign.id}/publish`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotencyKey: campaign.idempotency_key || idempotencyKey }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Yayınlama tamamlanamadı.");
      const failed = (data.targets || []).filter((target: any) => target.status === "failed");
      setMessage({
        tone: failed.length ? "info" : "success",
        text: failed.length
          ? `${data.targets.length - failed.length} kanal yayınlandı, ${failed.length} kanal yeniden denenmeli.`
          : `${data.targets.length} kanalın tamamında yayınlandı.`,
      });
      await loadData();
      setMobileStep("review");
    } catch (error: any) {
      setMessage({ tone: "error", text: error?.message || "Yayınlama tamamlanamadı." });
    } finally {
      setPublishing(false);
    }
  }

  function loadCampaign(campaign: Campaign) {
    setCampaignId(campaign.id);
    setIdempotencyKey(campaign.idempotency_key || null);
    setContent({ ...emptyContent(), ...(campaign.canonical_content || {}) });
    setScheduledAt(campaign.scheduled_at ? new Date(campaign.scheduled_at).toISOString().slice(0, 16) : "");
    const next = defaultChannels();
    for (const target of campaign.publication_targets || []) {
      const platform = target.platform as Platform;
      const overrides = target.overrides || {};
      next[platform] = {
        ...next[platform],
        enabled: target.enabled,
        accountId: target.account_id || accounts.find((account) => account.platform === platform)?.id || "",
        text: overrides.text || "",
        includeWebsiteLink: overrides.includeWebsiteLink,
        disableReshare: overrides.disableReshare,
        replySettings: overrides.replySettings,
        madeWithAi: overrides.madeWithAi,
        pollEnabled: Boolean(overrides.poll),
        pollOptions: overrides.poll?.options || ["", ""],
        pollDuration: overrides.poll?.durationMinutes || 1440,
      };
    }
    setChannels(next);
    setMessage({ tone: "info", text: `“${campaign.title}” yayını düzenlemeye açıldı.` });
    setMobileStep("content");
  }

  function newCampaign() {
    setCampaignId(null); setIdempotencyKey(null); setContent(emptyContent()); setChannels(defaultChannels());
    setScheduledAt(""); setErrors({ website: [], linkedin: [], instagram: [], x: [] }); setMessage(null);
    setMobileStep("content");
  }

  function importNews(id: string) {
    const news = (cmsContent?.news || []).find((item: any) => item.id === id);
    if (!news) return;
    setContent({ ...emptyContent(), ...news, locale: "tr" });
    setMessage({ tone: "info", text: `“${news.title}” ana içerik olarak aktarıldı.` });
  }

  function renderChannelEditor() {
    const channel = channels[activePlatform];
    const text = channelText(channel, content);
    const platformErrors = errors[activePlatform] || [];
    return (
      <div className="ws-pub-channel-editor">
        <div className="ws-pub-channel-heading">
          <div className="ws-pub-platform-mark" style={{ background: PLATFORM_META[activePlatform].color }}>{PLATFORM_META[activePlatform].short}</div>
          <div><strong>{PLATFORM_META[activePlatform].label}</strong><span>{PLATFORM_META[activePlatform].hint}</span></div>
          <label className="ws-pub-switch"><input type="checkbox" checked={channel.enabled} onChange={(event) => updateChannel(activePlatform, { enabled: event.target.checked })}/><span /></label>
        </div>

        {activePlatform !== "website" && (
          <div className={`ws-pub-account${activeAccount?.status === "connected" ? " is-connected" : ""}`}>
            <span className="ws-pub-account-dot" />
            <div><strong>{activeAccount?.displayName || "Hesap bağlı değil"}</strong><small>{activeAccount ? "Yayınlamaya hazır" : "Sunucu ortam değişkenlerinden veya güvenli hesap kaydından bağlayın"}</small></div>
            {!activeAccount && <button type="button" onClick={() => connectPlatform(activePlatform as Exclude<Platform, "website">)}>Hesabı bağla</button>}
          </div>
        )}

        {platformErrors.length > 0 && <div className="ws-pub-errors">{platformErrors.map((error) => <p key={error}>{error}</p>)}</div>}

        {activePlatform === "website" ? (
          <div className="ws-pub-options">
            <div className="ws-pub-option-row"><span>SEO uyumlu URL</span><strong>/{content.locale}/news/{content.slug || "haber-url"}</strong></div>
            <div className="ws-pub-option-row"><span>Çeviriler</span><strong>{Object.keys(content.localized || {}).length} dil</strong></div>
            <label className="ws-pub-check"><input type="checkbox" checked={Boolean(content.featured)} onChange={(event) => updateContent("featured", event.target.checked)}/><span>News sayfasında öne çıkar</span></label>
          </div>
        ) : (
          <div className="ws-pub-field">
            <div className="ws-pub-field-label"><span>Platform metni</span><button type="button" onClick={() => updateChannel(activePlatform, { text: content.excerpt || content.title })}>Ana metinden yenile</button></div>
            <textarea value={text} onChange={(event) => updateChannel(activePlatform, { text: event.target.value })} rows={activePlatform === "x" ? 5 : 8} />
            <small className={activePlatform === "x" && text.length > 280 ? "is-over" : ""}>{text.length}/{activePlatform === "linkedin" ? 3000 : activePlatform === "instagram" ? 2200 : 280}</small>
          </div>
        )}

        {activePlatform === "linkedin" && <div className="ws-pub-options">
          <label className="ws-pub-check"><input type="checkbox" checked={channel.includeWebsiteLink !== false} onChange={(event) => updateChannel("linkedin", { includeWebsiteLink: event.target.checked })}/><span>Website haber bağlantısını ekle</span></label>
          <label className="ws-pub-check"><input type="checkbox" checked={Boolean(channel.disableReshare)} onChange={(event) => updateChannel("linkedin", { disableReshare: event.target.checked })}/><span>Yeniden paylaşmayı kapat</span></label>
          <div className="ws-pub-option-row"><span>Medya</span><strong>{content.image ? "Kapak görseli" : "Metin / bağlantı"}</strong></div>
        </div>}

        {activePlatform === "instagram" && <div className="ws-pub-options">
          <div className="ws-pub-option-row"><span>Format</span><strong>{(content.images || []).length > 1 ? `Carousel · ${content.images.length} görsel` : "Feed · Tek görsel"}</strong></div>
          <p className="ws-pub-helper">Görseller ana içerikteki galeriden alınır. İlk görsel kapak olarak kullanılır.</p>
        </div>}

        {activePlatform === "x" && <div className="ws-pub-options">
          <label className="ws-pub-field compact"><span>Kimler yanıtlayabilir?</span><select value={channel.replySettings || "everyone"} onChange={(event) => updateChannel("x", { replySettings: event.target.value })}><option value="everyone">Herkes</option><option value="following">Takip edilen hesaplar</option><option value="mentionedUsers">Yalnızca bahsedilenler</option></select></label>
          <label className="ws-pub-check"><input type="checkbox" checked={Boolean(channel.madeWithAi)} onChange={(event) => updateChannel("x", { madeWithAi: event.target.checked })}/><span>AI ile oluşturuldu bildirimi</span></label>
          <label className="ws-pub-check"><input type="checkbox" checked={Boolean(channel.pollEnabled)} onChange={(event) => updateChannel("x", { pollEnabled: event.target.checked })}/><span>Anket ekle</span></label>
          {channel.pollEnabled && <div className="ws-pub-poll">{(channel.pollOptions || ["", ""]).map((option, index) => <input key={index} value={option} onChange={(event) => { const options = [...(channel.pollOptions || [])]; options[index] = event.target.value; updateChannel("x", { pollOptions: options }); }} placeholder={`Seçenek ${index + 1}`}/>)}</div>}
        </div>}

        <div className={`ws-pub-preview is-${activePlatform}`}>
          <div className="ws-pub-preview-top"><div className="ws-pub-avatar">W</div><div><strong>WillowSoft</strong><span>{activePlatform === "website" ? "willowsoft.co" : activeAccount?.username || PLATFORM_META[activePlatform].label}</span></div></div>
          {activePlatform === "website" ? <><h4>{content.title || "Haber başlığınız burada görünecek"}</h4><p>{content.excerpt || "Haber özetiniz burada görünecek."}</p></> : <p className="ws-pub-preview-copy">{text || "Platform paylaşım metniniz burada görünecek."}</p>}
          {cover && activePlatform !== "x" && <div className="ws-pub-preview-media"><img src={cover} alt="" /></div>}
          <div className="ws-pub-preview-meta"><span>{content.date || today()}</span><span>Önizleme</span></div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="ws-pub-loading"><span /><p>Yayın Merkezi hazırlanıyor…</p></div>;

  return (
    <div className="ws-pub-page">
      <header className="ws-pub-header">
        <div>
          <span className="ws-pub-eyebrow">İçerik Operasyonları</span>
          <h3>Yayın Merkezi</h3>
          <p>Haberi bir kez hazırlayın; her kanal için doğru formatta düzenleyip birlikte yayınlayın.</p>
        </div>
        <div className="ws-pub-header-actions"><button type="button" className="ws-pub-secondary" onClick={newCampaign}>Yeni yayın</button><button type="button" className="ws-pub-primary" onClick={() => saveDraft()} disabled={saving}>{saving ? "Kaydediliyor…" : "Taslağı kaydet"}</button></div>
      </header>

      {message && <div className={`ws-pub-message is-${message.tone}`}><span>{message.tone === "success" ? "✓" : message.tone === "error" ? "!" : "i"}</span><p>{message.text}</p><button type="button" onClick={() => setMessage(null)}>×</button></div>}

      <div className="ws-pub-mobile-steps"><button className={mobileStep === "content" ? "active" : ""} onClick={() => setMobileStep("content")}>1 İçerik</button><button className={mobileStep === "channels" ? "active" : ""} onClick={() => setMobileStep("channels")}>2 Kanallar</button><button className={mobileStep === "review" ? "active" : ""} onClick={() => setMobileStep("review")}>3 Önizleme</button></div>

      <section className="ws-pub-statusbar">
        <div className="ws-pub-progress"><div><strong>{readiness}%</strong><span>İçerik hazırlığı</span></div><i><b style={{ width: `${readiness}%` }} /></i></div>
        <div className="ws-pub-channel-statuses">{(Object.keys(channels) as Platform[]).map((platform) => {
          const account = accounts.find((item) => item.id === channels[platform].accountId);
          const ready = platform === "website" || account?.status === "connected";
          return <button key={platform} type="button" onClick={() => { setActivePlatform(platform); setMobileStep("channels"); }} className={`${channels[platform].enabled ? "is-selected" : ""}${ready ? " is-ready" : " is-missing"}`}><span style={{ background: PLATFORM_META[platform].color }}>{PLATFORM_META[platform].short}</span><em>{PLATFORM_META[platform].label}</em><i>{ready ? "Hazır" : "Bağlantı gerekli"}</i></button>;
        })}</div>
      </section>

      <div className="ws-pub-workspace">
        <main className={`ws-pub-compose ${mobileStep !== "content" ? "mobile-hidden" : ""}`}>
          <section className="ws-pub-card">
            <div className="ws-pub-card-title"><div><span>01</span><div><h4>Ana içerik</h4><p>Website haberinin ve sosyal metinlerin ortak kaynağı.</p></div></div><select value="" onChange={(event) => importNews(event.target.value)}><option value="">Mevcut haberden aktar…</option>{(cmsContent?.news || []).map((news: any) => <option key={news.id} value={news.id}>{news.title}</option>)}</select></div>
            <div className="ws-pub-form-grid">
              <FormField label="Haber başlığı" value={content.title} onChange={(value) => updateContent("title", value)} placeholder="Kurumsal haber başlığı" className="ws-pub-input" />
              <FormField label="URL" value={content.slug} onChange={(value) => updateContent("slug", slugify(value))} placeholder="haber-url" className="ws-pub-input" />
              <FormField label="Yayın tarihi" type="date" value={content.date} onChange={(value) => updateContent("date", value)} className="ws-pub-input" />
              <FormField label="Kategori" value={content.category} onChange={(value) => updateContent("category", value)} placeholder="company-update" className="ws-pub-input" />
              <div className="ws-pub-form-full"><FormField label="Kısa açıklama" type="textarea" rows={3} value={content.excerpt} onChange={(value) => updateContent("excerpt", value)} placeholder="Sosyal kanallar için de kullanılabilecek açık ve kurumsal özet" /></div>
              <div className="ws-pub-form-full"><FormField label="Kapak görseli" type="image" value={content.image} onChange={(value) => updateContent("image", value)} placeholder="assets/news/example.webp" /></div>
              <div className="ws-pub-form-full ws-pub-rich"><label>Haber içeriği</label><VisualHtmlEditor value={content.content} onChange={(value) => updateContent("content", value)} placeholder="Haber içeriğini yazın…" /></div>
              <details className="ws-pub-form-full ws-pub-translations">
                <summary><span>Website çevirileri</span><small>{Object.keys(content.localized || {}).length} dil hazır</small></summary>
                <div>
                  <TranslationEditor
                    item={content}
                    fields={PUBLICATION_TRANSLATION_FIELDS}
                    onChange={(locale, key, value) => setContent((previous: any) => ({
                      ...previous,
                      localized: {
                        ...(previous.localized || {}),
                        [locale]: { ...(previous.localized?.[locale] || {}), [key]: value },
                      },
                    }))}
                  />
                </div>
              </details>
            </div>
          </section>
        </main>

        <aside className={`ws-pub-studio ${mobileStep === "content" ? "mobile-hidden-studio" : ""}`}>
          <div className="ws-pub-tabs">{(Object.keys(channels) as Platform[]).map((platform) => <button key={platform} type="button" className={activePlatform === platform ? "active" : ""} onClick={() => setActivePlatform(platform)}><span style={{ background: PLATFORM_META[platform].color }}>{PLATFORM_META[platform].short}</span><em>{PLATFORM_META[platform].label}</em>{channels[platform].enabled && <i />}</button>)}</div>
          {renderChannelEditor()}
        </aside>
      </div>

      {campaigns.length > 0 && <section className="ws-pub-history"><div className="ws-pub-history-title"><div><h4>Son yayınlar</h4><p>Taslak, zamanlama ve kanal sonuçlarını tek yerden takip edin.</p></div><button type="button" onClick={loadData}>Yenile</button></div><div className="ws-pub-history-list">{campaigns.slice(0, 8).map((campaign) => <button type="button" key={campaign.id} onClick={() => loadCampaign(campaign)}><span className={`ws-pub-history-status is-${campaign.status}`}>{statusLabel(campaign.status)}</span><div><strong>{campaign.title}</strong><small>{campaign.updated_at ? new Date(campaign.updated_at).toLocaleString("tr-TR") : ""}</small></div><em>{(campaign.publication_targets || []).filter((target: any) => target.enabled).length} kanal</em><b>→</b></button>)}</div></section>}

      <footer className="ws-pub-actionbar">
        <div className="ws-pub-action-summary"><div className="ws-pub-mini-stack">{selectedPlatforms.map((platform) => <span key={platform} style={{ background: PLATFORM_META[platform].color }}>{PLATFORM_META[platform].short}</span>)}</div><div><strong>{selectedPlatforms.length} kanal seçildi</strong><span>{campaignId ? "Taslak kayıtlı" : "Yeni yayın"}</span></div></div>
        <div className="ws-pub-schedule">{scheduleOpen && <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} min={new Date().toISOString().slice(0, 16)} />}<button type="button" className="ws-pub-secondary" onClick={() => { if (scheduleOpen && scheduledAt) saveDraft({ schedule: true }); else setScheduleOpen(!scheduleOpen); }}>{scheduleOpen && scheduledAt ? "Planla" : "Zamanla"}</button><button type="button" className="ws-pub-primary is-publish" onClick={publish} disabled={publishing || saving || selectedPlatforms.length === 0}>{publishing ? "Yayınlanıyor…" : `${selectedPlatforms.length} kanalda yayınla`}</button></div>
      </footer>
    </div>
  );
}
