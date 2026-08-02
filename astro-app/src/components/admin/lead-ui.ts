export type LeadSource = "contact" | "start-project" | "other";

export function daysWaiting(createdAt?: string): number {
  if (!createdAt) return 0;
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

export function leadSource(sourcePage?: string): LeadSource {
  const page = sourcePage || "";
  if (page.includes("start-project")) return "start-project";
  if (page.includes("contact")) return "contact";
  return "other";
}

export function cleanMessage(message?: string): string {
  return (message || "").replace(/\n\n--- Project brief ---[\s\S]*$/, "").trim();
}

export const STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  contacted: "Görüşüldü",
  qualified: "Uygun",
  won: "Kazanıldı",
  lost: "Kapandı",
  spam: "Spam",
};

export function statusChipClass(status: string): string {
  switch (status) {
    case "new":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "contacted":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "qualified":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "won":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "lost":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

export function sourceLabel(sourcePage?: string): string {
  const src = leadSource(sourcePage);
  if (src === "contact") return "Contact";
  if (src === "start-project") return "Start Project";
  return "Diğer";
}
