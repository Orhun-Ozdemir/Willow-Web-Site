import { specialDays, type SpecialDay, type SpecialDayDate } from "@/data/special-days";

/** Converts an instant to a stable UTC-backed calendar date in the visitor's IANA timezone. */
export function calendarDateForTimeZone(now: Date, timeZone: string): Date {
  if (!timeZone) return now;
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value || 0);
    const year = value("year");
    const month = value("month");
    const day = value("day");
    if (!year || !month || !day) return now;
    return new Date(Date.UTC(year, month - 1, day, 12));
  } catch {
    return now;
  }
}

/** Resolves the Nth occurrence of a weekday in a given month/year (UTC), e.g. the 4th Thursday of November. */
export function resolveNthWeekday(year: number, month: number, weekday: number, nth: number): Date {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  return new Date(Date.UTC(year, month - 1, day));
}

function matchesDate(rule: SpecialDayDate, date: Date): boolean {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  if (rule.type === "fixed") return rule.month === month && rule.day === day;
  const resolved = resolveNthWeekday(date.getUTCFullYear(), rule.month, rule.weekday, rule.nth);
  return resolved.getUTCMonth() + 1 === month && resolved.getUTCDate() === day;
}

/** Finds the special day (if any) active for a given date + visitor country. Country-specific entries win over the universal "*" entry when both match the same date. */
export function configuredSpecialDays(value: unknown): SpecialDay[] {
  if (!Array.isArray(value) || value.length === 0) return specialDays;
  const valid = value.filter((entry: any) => {
    if (!entry || typeof entry !== "object" || typeof entry.id !== "string") return false;
    if (!Array.isArray(entry.countries) || entry.countries.length === 0) return false;
    if (!entry.date || !["fixed", "nth-weekday"].includes(entry.date.type)) return false;
    if (!entry.greeting || typeof entry.greeting !== "object") return false;
    return true;
  }) as SpecialDay[];
  return valid.length > 0 ? valid : specialDays;
}

export function getActiveSpecialDay(date: Date, countryCode: string, entries: SpecialDay[] = specialDays): SpecialDay | null {
  const cc = (countryCode || "").toUpperCase();
  const matches = entries.filter((entry) => entry.enabled !== false && matchesDate(entry.date, date));
  return (
    matches.find((entry) => entry.countries.includes(cc)) ||
    matches.find((entry) => entry.countries.includes("*")) ||
    null
  );
}

/** Builds the localStorage key used to ensure the hero celebration plays at most once per visitor per day. */
export function dedupeKey(specialDayId: string, countryCode: string, date: Date): string {
  const iso = date.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  return `willow-celebrated-${specialDayId}-${(countryCode || "").toUpperCase()}-${iso}`;
}

export interface SpecialDayResolutionInput {
  now: Date;
  countryCode: string;
}

/**
 * Resolves the effective date/country to use for special-day detection, honoring an
 * opt-in `?willow-preview-day=YYYY-MM-DD&willow-preview-country=XX` override. The call
 * site must only enable this for local development or an authenticated Admin session.
 */
export function resolvePreviewOverride(
  allowPreview: boolean,
  searchParams: URLSearchParams,
  realNow: Date,
  realCountry: string,
): SpecialDayResolutionInput {
  if (!allowPreview) return { now: realNow, countryCode: realCountry };
  const previewDay = searchParams.get("willow-preview-day");
  const previewCountry = searchParams.get("willow-preview-country");
  const now = previewDay && /^\d{4}-\d{2}-\d{2}$/.test(previewDay) ? new Date(`${previewDay}T12:00:00Z`) : realNow;
  const countryCode = previewCountry ? previewCountry.toUpperCase() : realCountry;
  return { now, countryCode };
}
