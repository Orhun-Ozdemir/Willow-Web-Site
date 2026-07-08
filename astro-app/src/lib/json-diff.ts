/**
 * JSON path tabanlı diff — UI özeti için.
 */

export interface DiffEntry {
  path: string;
  before: unknown;
  after: unknown;
}

const MAX_DEPTH = 12;
const SKIP_KEYS = new Set(["updatedAt", "_fallback"]);

export function diffJson(before: unknown, after: unknown, basePath = "", depth = 0): DiffEntry[] {
  if (depth > MAX_DEPTH) return [];

  if (before === after) return [];
  if (before == null && after == null) return [];

  const bType = typeof before;
  const aType = typeof after;

  if (Array.isArray(before) && Array.isArray(after)) {
    const out: DiffEntry[] = [];
    const maxLen = Math.max(before.length, after.length);
    for (let i = 0; i < maxLen; i++) {
      const p = basePath ? `${basePath}[${i}]` : `[${i}]`;
      if (i >= before.length) {
        out.push({ path: p, before: undefined, after: after[i] });
      } else if (i >= after.length) {
        out.push({ path: p, before: before[i], after: undefined });
      } else {
        out.push(...diffJson(before[i], after[i], p, depth + 1));
      }
    }
    return out;
  }

  if (bType === "object" && aType === "object" && before && after) {
    const bObj = before as Record<string, unknown>;
    const aObj = after as Record<string, unknown>;
    const keys = new Set([...Object.keys(bObj), ...Object.keys(aObj)]);
    const out: DiffEntry[] = [];

    for (const key of keys) {
      if (SKIP_KEYS.has(key)) continue;
      const p = basePath ? `${basePath}.${key}` : key;
      if (!(key in bObj)) {
        out.push({ path: p, before: undefined, after: aObj[key] });
      } else if (!(key in aObj)) {
        out.push({ path: p, before: bObj[key], after: undefined });
      } else {
        out.push(...diffJson(bObj[key], aObj[key], p, depth + 1));
      }
    }
    return out;
  }

  if (JSON.stringify(before) !== JSON.stringify(after)) {
    return [{ path: basePath || "(root)", before, after }];
  }
  return [];
}

export function summarizeDiff(entries: DiffEntry[], maxShow = 20): { count: number; paths: string[]; truncated: boolean } {
  return {
    count: entries.length,
    paths: entries.slice(0, maxShow).map((e) => e.path),
    truncated: entries.length > maxShow,
  };
}

export function formatDiffValue(v: unknown): string {
  if (v === undefined) return "(yok)";
  if (v === null) return "null";
  if (typeof v === "string") return v.length > 120 ? v.slice(0, 120) + "…" : v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    const s = JSON.stringify(v);
    return s.length > 120 ? s.slice(0, 120) + "…" : s;
  } catch {
    return String(v);
  }
}
