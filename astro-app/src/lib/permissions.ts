export type AdminRole = "super_admin" | "content_editor" | "sales" | "viewer";

export type AdminPermission =
  | "audit.read"
  | "content.read"
  | "content.write"
  | "leads.read"
  | "leads.write"
  | "media.upload"
  | "users.manage"
  | "settings.write"
  | "backups.manage";

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[] | ["*"]> = {
  super_admin: ["*"],
  content_editor: ["content.read", "content.write", "media.upload", "leads.read"],
  sales: ["leads.read", "leads.write"],
  viewer: ["content.read", "leads.read"],
};

export function hasPermission(role: AdminRole, permission: AdminPermission): boolean {
  const perms = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.super_admin;
  if ((perms as readonly string[]).includes("*")) return true;
  return (perms as AdminPermission[]).includes(permission);
}

/** Map admin shell tabs to required read permission. Omitted = visible to all authenticated admins. */
export const TAB_PERMISSIONS: Partial<Record<string, AdminPermission>> = {
  leads: "leads.read",
  kanban: "leads.read",
  products: "content.read",
  news: "content.read",
  faqs: "content.read",
  glossary: "content.read",
  solutions: "content.read",
  clients: "content.read",
  company: "content.read",
  services_page: "content.read",
  seo: "content.read",
  translations: "content.read",
  health: "content.read",
  settings: "settings.write",
  backups: "backups.manage",
  users: "users.manage",
  audit: "audit.read",
};

export function canAccessTab(role: AdminRole, tab: string): boolean {
  const required = TAB_PERMISSIONS[tab];
  if (!required) return true;
  return hasPermission(role, required);
}
