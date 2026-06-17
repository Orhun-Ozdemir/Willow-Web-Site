import { getServiceClient } from "./supabase";
import type { AdminProfile } from "./admin-auth";

export interface AuditEntry {
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
  ip_hint?: string | null;
  user_agent?: string | null;
}

/**
 * Fire-and-forget audit log. Never throws — a missing table must not break admin ops.
 */
export async function logAdminAction(profile: AdminProfile, entry: AuditEntry): Promise<void> {
  try {
    const sb = getServiceClient();
    const { error } = await sb.from("admin_audit_logs").insert({
      actor_id: profile.id,
      actor_name: profile.username,
      action: entry.action,
      resource: entry.resource,
      resource_id: entry.resourceId ?? null,
      metadata: entry.metadata ?? {},
      ip_hint: entry.ip_hint ?? null,
      user_agent: entry.user_agent ?? null,
    });
    if (error) {
      // Table not migrated yet — silently skip
      console.warn("[audit] skip:", error.message);
    }
  } catch (err) {
    console.warn("[audit] skip:", err);
  }
}
