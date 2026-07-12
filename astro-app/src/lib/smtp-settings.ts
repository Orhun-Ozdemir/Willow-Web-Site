import { getServiceClient, hasSupabaseEnv } from "./supabase";

const env = (key: string): string | undefined =>
  (import.meta.env as any)?.[key] ?? (typeof process !== "undefined" ? process.env?.[key] : undefined);

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  source: "database" | "env" | "none";
};

const KEYS = {
  host: "smtp_host",
  port: "smtp_port",
  user: "smtp_user",
  pass: "smtp_pass",
} as const;

async function readDbMap(): Promise<Record<string, string>> {
  if (!hasSupabaseEnv) return {};
  try {
    const { data, error } = await getServiceClient()
      .from("app_settings")
      .select("key, value")
      .in("key", Object.values(KEYS));
    // Table may not exist yet — treat as empty and fall back to env.
    if (error || !data) return {};
    const map: Record<string, string> = {};
    for (const row of data) map[row.key] = row.value ?? "";
    return map;
  } catch {
    return {};
  }
}

/** DB values override env. Empty DB fields fall back to env. */
export async function getSmtpConfig(): Promise<SmtpConfig> {
  const db = await readDbMap();
  const host = (db[KEYS.host] || env("SMTP_HOST") || "smtp.hostinger.com").trim();
  const portRaw = (db[KEYS.port] || env("SMTP_PORT") || "465").trim();
  const user = (db[KEYS.user] || env("SMTP_USER") || "").trim();
  const pass = (db[KEYS.pass] || env("SMTP_PASS") || "").trim();
  const port = Number(portRaw) || 465;

  let source: SmtpConfig["source"] = "none";
  if (db[KEYS.user] && db[KEYS.pass]) source = "database";
  else if (env("SMTP_USER") && env("SMTP_PASS")) source = "env";

  return { host, port, user, pass, source };
}

export async function getSmtpPublicStatus() {
  const cfg = await getSmtpConfig();
  const db = await readDbMap();
  return {
    host: cfg.host,
    port: String(cfg.port),
    user: cfg.user,
    passSet: Boolean(cfg.pass),
    passMasked: cfg.pass ? "••••••••••••" : "",
    source: cfg.source,
    storedInDb: Boolean(db[KEYS.user] || db[KEYS.pass] || db[KEYS.host] || db[KEYS.port]),
  };
}

export async function saveSmtpSettings(input: {
  host?: string;
  port?: string | number;
  user?: string;
  pass?: string;
}): Promise<void> {
  const sb = getServiceClient();
  const now = new Date().toISOString();
  const rows: { key: string; value: string; updated_at: string }[] = [];

  if (input.host !== undefined) {
    rows.push({ key: KEYS.host, value: String(input.host).trim(), updated_at: now });
  }
  if (input.port !== undefined) {
    rows.push({ key: KEYS.port, value: String(input.port).trim(), updated_at: now });
  }
  if (input.user !== undefined) {
    rows.push({ key: KEYS.user, value: String(input.user).trim(), updated_at: now });
  }
  // Empty pass means "keep existing" — only write when a new value is provided.
  if (typeof input.pass === "string" && input.pass.trim() !== "") {
    rows.push({ key: KEYS.pass, value: input.pass.trim(), updated_at: now });
  }

  if (!rows.length) return;
  const { error } = await sb.from("app_settings").upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);
}
