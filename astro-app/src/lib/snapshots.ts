import { getServiceClient } from "./supabase";
import { loadContent, saveContent, bustContentCache } from "./content";
import type { AdminProfile } from "./admin-auth";

export const SNAPSHOT_RETENTION = 100;

export interface SnapshotMeta {
  section?: string;
  page?: string;
  itemCount?: number;
  ip_hint?: string | null;
  user_agent?: string | null;
  [key: string]: unknown;
}

export interface SnapshotRow {
  id: string;
  created_at: string;
  actor_id: string | null;
  actor_name: string;
  reason: string;
  scope: string;
  content?: Record<string, unknown>;
  meta: SnapshotMeta;
}

function buildReason(section: string | null, page: string | null): string {
  if (section === "pageContent" && page) return `content.update: pageContent.${page}`;
  if (section) return `content.update: ${section}`;
  return "content.update: all";
}

/**
 * Kayıt sonrası CMS snapshot oluşturur. Hata olursa kaydı bloklamaz.
 */
export async function createCmsSnapshot(
  profile: AdminProfile,
  opts: {
    section?: string | null;
    page?: string | null;
    itemCount?: number;
    ip_hint?: string | null;
    user_agent?: string | null;
  } = {},
): Promise<void> {
  try {
    const content = await loadContent({ allowFallback: false });
    const sb = getServiceClient();

    const meta: SnapshotMeta = {
      section: opts.section || undefined,
      page: opts.page || undefined,
      itemCount: opts.itemCount,
      ip_hint: opts.ip_hint ?? null,
      user_agent: opts.user_agent ?? null,
    };

    const { error } = await sb.from("admin_snapshots").insert({
      actor_id: profile.id,
      actor_name: profile.username,
      reason: buildReason(opts.section ?? null, opts.page ?? null),
      scope: "cms",
      content,
      meta,
    });

    if (error) {
      console.warn("[snapshots] skip:", error.message);
      return;
    }

    await pruneOldSnapshots(sb);
  } catch (err) {
    console.warn("[snapshots] skip:", err);
  }
}

async function pruneOldSnapshots(sb: ReturnType<typeof getServiceClient>) {
  const { data, error } = await sb
    .from("admin_snapshots")
    .select("id")
    .order("created_at", { ascending: false })
    .range(SNAPSHOT_RETENTION, SNAPSHOT_RETENTION + 500);

  if (error || !data?.length) return;

  const ids = data.map((r) => r.id);
  await sb.from("admin_snapshots").delete().in("id", ids);
}

export async function listSnapshots(opts: {
  page?: number;
  limit?: number;
  actor?: string;
  from?: string;
  to?: string;
  reason?: string;
}): Promise<{ snapshots: SnapshotRow[]; total: number }> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(50, Math.max(1, opts.limit ?? 20));
  const offset = (page - 1) * limit;

  const sb = getServiceClient();
  let query = sb
    .from("admin_snapshots")
    .select("id, created_at, actor_id, actor_name, reason, scope, meta", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (opts.actor) query = query.ilike("actor_name", `%${opts.actor}%`);
  if (opts.reason) query = query.ilike("reason", `%${opts.reason}%`);
  if (opts.from) query = query.gte("created_at", opts.from);
  if (opts.to) query = query.lte("created_at", opts.to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    snapshots: (data ?? []) as SnapshotRow[],
    total: count ?? 0,
  };
}

export async function getSnapshot(id: string): Promise<SnapshotRow | null> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("admin_snapshots")
    .select("id, created_at, actor_id, actor_name, reason, scope, content, meta")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as SnapshotRow | null;
}

export async function restoreSnapshot(id: string): Promise<void> {
  const snapshot = await getSnapshot(id);
  if (!snapshot?.content) {
    throw new Error("Snapshot bulunamadı veya içerik boş.");
  }

  if ((snapshot.content as Record<string, unknown>)._fallback) {
    throw new Error("Snapshot geçersiz fallback verisi içeriyor — geri yükleme reddedildi.");
  }

  await saveContent(snapshot.content);
  bustContentCache();
}
