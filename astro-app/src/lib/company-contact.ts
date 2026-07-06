import { localizeItem, type Locale } from "@/lib/cms";

export type OfficeContact = {
  id: string;
  country: string;
  phone: string;
  email: string;
  address: string;
};

export function resolveOfficePhone(office: { id?: string; phone?: string }, facts: Record<string, any> = {}): string {
  if (office?.phone) return String(office.phone).trim();
  if (office?.id === "office-tr") return String(facts.turkeyPhone || "").trim();
  if (office?.id === "office-uk") return String(facts.ukPhone || "").trim();
  return "";
}

export function syncOfficePhonesInFacts(facts: Record<string, any>): Record<string, any> {
  const next = { ...facts };
  const offices = Array.isArray(next.officesList) ? next.officesList.map((office: any) => ({ ...office })) : [];

  for (const office of offices) {
    if (office.id === "office-tr") {
      if (next.turkeyPhone) office.phone = next.turkeyPhone;
      else if (office.phone) next.turkeyPhone = office.phone;
    }
    if (office.id === "office-uk") {
      if (next.ukPhone) office.phone = next.ukPhone;
      else if (office.phone) next.ukPhone = office.phone;
    }
  }

  next.officesList = offices;
  return next;
}

export function officesForContact(facts: Record<string, any> = {}, locale: Locale): OfficeContact[] {
  const synced = syncOfficePhonesInFacts(facts);

  return (synced.officesList || [])
    .slice()
    .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((office: any) => {
      const localized = localizeItem(office, locale);
      return {
        id: office.id,
        country: localized.country || office.country || "",
        phone: resolveOfficePhone(office, synced),
        email: office.email || synced.email || "",
        address: localized.address || office.address || "",
      };
    });
}

export function telHref(phone: string): string {
  return `tel:${String(phone || "").replace(/[^\d+]/g, "")}`;
}
