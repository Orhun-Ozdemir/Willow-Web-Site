import type { Locale } from "@/lib/cms";

export type CelebrationStyle = "fireworks" | "confetti";
export type CelebrationMotif = "crescent" | "modules" | "horizon" | "rays" | "stars" | "harvest" | "cross" | "unity" | "bands" | "sun" | "geometry" | "serrated" | "orbit";

export type SpecialDayDate =
  | { type: "fixed"; month: number; day: number }
  | { type: "nth-weekday"; month: number; weekday: number; nth: number };

export interface SpecialDayGreeting {
  /** Lead-in text, rendered plain (e.g. "Happy" or a date). */
  title: string;
  /** Occasion name, rendered in the brand's italic serif accent style. */
  accent: string;
  /** Short congratulatory subline shown beneath the title. */
  subline: string;
}

export interface SpecialDay {
  id: string;
  /** Admin-controlled publication switch. Missing means enabled for backwards compatibility. */
  enabled?: boolean;
  /** ISO 3166-1 alpha-2 country codes this day applies to, or ["*"] for everyone. */
  countries: string[];
  date: SpecialDayDate;
  style: CelebrationStyle;
  /** Hex color sourced from the country's real flag (or brand color for the universal "*" day). */
  accentColor: string;
  secondaryColor?: string;
  /** ISO alpha-2 lowercase filename in public/assets/flags/, e.g. "tr" -> tr.svg. */
  flag: string;
  /** Optional visual override. Known event IDs still receive their curated default motif. */
  motif?: CelebrationMotif;
  greeting: Record<Locale, SpecialDayGreeting>;
}

export const specialDays: SpecialDay[] = [
  // ── Turkey ──────────────────────────────────────────────────────────────
  {
    id: "tr-republic-day",
    countries: ["TR"],
    date: { type: "fixed", month: 10, day: 29 },
    style: "fireworks",
    accentColor: "#E30A17",
    secondaryColor: "#FFFFFF",
    flag: "tr",
    greeting: {
      en: { title: "Happy", accent: "Republic Day", subline: "Celebrating Turkey's Republic Day with you — WillowSoft" },
      tr: { title: "29 Ekim", accent: "Cumhuriyet Bayramı", subline: "Kutlu olsun — WillowSoft" },
      de: { title: "Alles Gute zum", accent: "Tag der Republik", subline: "Wir feiern mit euch — WillowSoft" },
      fr: { title: "Joyeuse", accent: "Fête de la République", subline: "Nous célébrons avec vous — WillowSoft" },
      es: { title: "Feliz", accent: "Día de la República", subline: "Celebrando con vosotros — WillowSoft" },
      it: { title: "Buona", accent: "Festa della Repubblica", subline: "Festeggiamo con voi — WillowSoft" },
      ar: { title: "عيد", accent: "الجمهورية سعيد", subline: "نحتفل معكم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "共和国記念日", subline: "共に祝います — WillowSoft" },
    },
  },
  {
    id: "tr-national-sovereignty-day",
    countries: ["TR"],
    date: { type: "fixed", month: 4, day: 23 },
    style: "confetti",
    accentColor: "#E30A17",
    secondaryColor: "#FFFFFF",
    flag: "tr",
    greeting: {
      en: { title: "Happy", accent: "National Sovereignty & Children's Day", subline: "A day for the future — WillowSoft" },
      tr: { title: "23 Nisan", accent: "Ulusal Egemenlik ve Çocuk Bayramı", subline: "Kutlu olsun — WillowSoft" },
      de: { title: "Alles Gute zum", accent: "Tag der nationalen Souveränität", subline: "Für die Zukunft — WillowSoft" },
      fr: { title: "Bonne", accent: "Fête de la Souveraineté Nationale", subline: "Pour l'avenir — WillowSoft" },
      es: { title: "Feliz", accent: "Día de la Soberanía Nacional", subline: "Por el futuro — WillowSoft" },
      it: { title: "Buona", accent: "Festa della Sovranità Nazionale", subline: "Per il futuro — WillowSoft" },
      ar: { title: "عيد", accent: "السيادة الوطنية والطفل سعيد", subline: "من أجل المستقبل — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "国家主権と子供の日", subline: "未来のために — WillowSoft" },
    },
  },
  {
    id: "tr-youth-sports-day",
    countries: ["TR"],
    date: { type: "fixed", month: 5, day: 19 },
    style: "confetti",
    accentColor: "#E30A17",
    secondaryColor: "#FFFFFF",
    flag: "tr",
    greeting: {
      en: { title: "Happy", accent: "Youth and Sports Day", subline: "In memory of Atatürk — WillowSoft" },
      tr: { title: "19 Mayıs", accent: "Atatürk'ü Anma, Gençlik ve Spor Bayramı", subline: "Kutlu olsun — WillowSoft" },
      de: { title: "Alles Gute zum", accent: "Tag der Jugend und des Sports", subline: "Zum Gedenken an Atatürk — WillowSoft" },
      fr: { title: "Bonne", accent: "Fête de la Jeunesse et des Sports", subline: "En mémoire d'Atatürk — WillowSoft" },
      es: { title: "Feliz", accent: "Día de la Juventud y el Deporte", subline: "En memoria de Atatürk — WillowSoft" },
      it: { title: "Buona", accent: "Festa della Gioventù e dello Sport", subline: "In memoria di Atatürk — WillowSoft" },
      ar: { title: "عيد", accent: "الشباب والرياضة سعيد", subline: "في ذكرى أتاتورك — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "青年とスポーツの日", subline: "アタテュルクを偲んで — WillowSoft" },
    },
  },
  {
    id: "tr-victory-day",
    countries: ["TR"],
    date: { type: "fixed", month: 8, day: 30 },
    style: "fireworks",
    accentColor: "#E30A17",
    secondaryColor: "#FFFFFF",
    flag: "tr",
    greeting: {
      en: { title: "Happy", accent: "Victory Day", subline: "Honoring Turkey's Victory Day — WillowSoft" },
      tr: { title: "30 Ağustos", accent: "Zafer Bayramı", subline: "Kutlu olsun — WillowSoft" },
      de: { title: "Alles Gute zum", accent: "Tag des Sieges", subline: "Wir gedenken diesem Tag — WillowSoft" },
      fr: { title: "Bonne", accent: "Fête de la Victoire", subline: "En l'honneur de ce jour — WillowSoft" },
      es: { title: "Feliz", accent: "Día de la Victoria", subline: "Honrando este día — WillowSoft" },
      it: { title: "Buona", accent: "Festa della Vittoria", subline: "Onorando questo giorno — WillowSoft" },
      ar: { title: "عيد", accent: "النصر سعيد", subline: "تكريماً لهذا اليوم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "戦勝記念日", subline: "この日を称えて — WillowSoft" },
    },
  },

  // ── United States ───────────────────────────────────────────────────────
  {
    id: "us-independence-day",
    countries: ["US"],
    date: { type: "fixed", month: 7, day: 4 },
    style: "fireworks",
    accentColor: "#B22234",
    secondaryColor: "#3C3B6E",
    flag: "us",
    greeting: {
      en: { title: "Happy", accent: "Independence Day", subline: "Wishing you a bright 4th of July — WillowSoft" },
      tr: { title: "Mutlu", accent: "Bağımsızlık Günü", subline: "4 Temmuz kutlu olsun — WillowSoft" },
      de: { title: "Frohen", accent: "Unabhängigkeitstag", subline: "Alles Gute zum 4. Juli — WillowSoft" },
      fr: { title: "Joyeux", accent: "Jour de l'Indépendance", subline: "Bon 4 juillet — WillowSoft" },
      es: { title: "Feliz", accent: "Día de la Independencia", subline: "Feliz 4 de julio — WillowSoft" },
      it: { title: "Buon", accent: "Giorno dell'Indipendenza", subline: "Buon 4 luglio — WillowSoft" },
      ar: { title: "عيد", accent: "الاستقلال سعيد", subline: "الرابع من يوليو — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "独立記念日", subline: "素敵な7月4日を — WillowSoft" },
    },
  },
  {
    id: "us-thanksgiving",
    countries: ["US"],
    date: { type: "nth-weekday", month: 11, weekday: 4, nth: 4 },
    style: "confetti",
    accentColor: "#B22234",
    secondaryColor: "#3C3B6E",
    flag: "us",
    greeting: {
      en: { title: "Happy", accent: "Thanksgiving", subline: "Grateful for you — WillowSoft" },
      tr: { title: "Mutlu", accent: "Şükran Günü", subline: "Sizler için minnettarız — WillowSoft" },
      de: { title: "Frohes", accent: "Thanksgiving", subline: "Wir sind dankbar für euch — WillowSoft" },
      fr: { title: "Joyeux", accent: "Thanksgiving", subline: "Reconnaissants pour vous — WillowSoft" },
      es: { title: "Feliz", accent: "Día de Acción de Gracias", subline: "Agradecidos por vosotros — WillowSoft" },
      it: { title: "Felice", accent: "Giorno del Ringraziamento", subline: "Grati per voi — WillowSoft" },
      ar: { title: "عيد", accent: "الشكر سعيد", subline: "ممتنون لكم — WillowSoft" },
      ja: { title: "ハッピー", accent: "感謝祭", subline: "感謝を込めて — WillowSoft" },
    },
  },

  // ── United Kingdom ──────────────────────────────────────────────────────
  {
    id: "gb-st-georges-day",
    countries: ["GB"],
    date: { type: "fixed", month: 4, day: 23 },
    style: "confetti",
    accentColor: "#CF142B",
    secondaryColor: "#00247D",
    flag: "gb",
    greeting: {
      en: { title: "Happy", accent: "St George's Day", subline: "Celebrating England with you — WillowSoft" },
      tr: { title: "Mutlu", accent: "Aziz George Günü", subline: "Sizinle kutluyoruz — WillowSoft" },
      de: { title: "Frohen", accent: "St.-Georgs-Tag", subline: "Wir feiern mit euch — WillowSoft" },
      fr: { title: "Bonne", accent: "Saint-Georges", subline: "Nous célébrons avec vous — WillowSoft" },
      es: { title: "Feliz", accent: "Día de San Jorge", subline: "Celebrando con vosotros — WillowSoft" },
      it: { title: "Buon", accent: "Giorno di San Giorgio", subline: "Festeggiamo con voi — WillowSoft" },
      ar: { title: "عيد", accent: "القديس جورج سعيد", subline: "نحتفل معكم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "聖ジョージの日", subline: "共に祝います — WillowSoft" },
    },
  },

  // ── Germany ─────────────────────────────────────────────────────────────
  {
    id: "de-unity-day",
    countries: ["DE"],
    date: { type: "fixed", month: 10, day: 3 },
    style: "fireworks",
    accentColor: "#FFCE00",
    secondaryColor: "#DD0000",
    flag: "de",
    greeting: {
      en: { title: "Happy", accent: "German Unity Day", subline: "Wishing Germany a wonderful day — WillowSoft" },
      tr: { title: "Mutlu", accent: "Almanya Birlik Günü", subline: "Güzel bir gün dileriz — WillowSoft" },
      de: { title: "Alles Gute zum", accent: "Tag der Deutschen Einheit", subline: "Wir wünschen euch einen schönen Tag — WillowSoft" },
      fr: { title: "Bonne", accent: "Journée de l'Unité allemande", subline: "Une belle journée à vous — WillowSoft" },
      es: { title: "Feliz", accent: "Día de la Unidad Alemana", subline: "Un día maravilloso — WillowSoft" },
      it: { title: "Buona", accent: "Giornata dell'Unità Tedesca", subline: "Una giornata meravigliosa — WillowSoft" },
      ar: { title: "عيد", accent: "الوحدة الألمانية سعيد", subline: "نتمنى لكم يوماً رائعاً — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "ドイツ統一記念日", subline: "素敵な一日を — WillowSoft" },
    },
  },

  // ── France ──────────────────────────────────────────────────────────────
  {
    id: "fr-bastille-day",
    countries: ["FR"],
    date: { type: "fixed", month: 7, day: 14 },
    style: "fireworks",
    accentColor: "#0055A4",
    secondaryColor: "#EF4135",
    flag: "fr",
    greeting: {
      en: { title: "Happy", accent: "Bastille Day", subline: "Vive la France — WillowSoft" },
      tr: { title: "Mutlu", accent: "Bastille Günü", subline: "Vive la France — WillowSoft" },
      de: { title: "Frohen", accent: "Nationalfeiertag Frankreichs", subline: "Vive la France — WillowSoft" },
      fr: { title: "Joyeuse", accent: "Fête Nationale", subline: "Vive la France — WillowSoft" },
      es: { title: "Feliz", accent: "Día de la Bastilla", subline: "Vive la France — WillowSoft" },
      it: { title: "Buona", accent: "Festa della Bastiglia", subline: "Vive la France — WillowSoft" },
      ar: { title: "عيد", accent: "الباستيل سعيد", subline: "تحيا فرنسا — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "パリ祭", subline: "Vive la France — WillowSoft" },
    },
  },

  // ── Italy ───────────────────────────────────────────────────────────────
  {
    id: "it-republic-day",
    countries: ["IT"],
    date: { type: "fixed", month: 6, day: 2 },
    style: "fireworks",
    accentColor: "#008C45",
    secondaryColor: "#CD212A",
    flag: "it",
    greeting: {
      en: { title: "Happy", accent: "Festa della Repubblica", subline: "Celebrating Italy with you — WillowSoft" },
      tr: { title: "Mutlu", accent: "İtalya Cumhuriyet Bayramı", subline: "Sizinle kutluyoruz — WillowSoft" },
      de: { title: "Frohen", accent: "Tag der Republik", subline: "Wir feiern mit euch — WillowSoft" },
      fr: { title: "Bonne", accent: "Fête de la République", subline: "Nous célébrons avec vous — WillowSoft" },
      es: { title: "Feliz", accent: "Fiesta de la República", subline: "Celebrando con vosotros — WillowSoft" },
      it: { title: "Buona", accent: "Festa della Repubblica", subline: "Festeggiamo con voi — WillowSoft" },
      ar: { title: "عيد", accent: "الجمهورية الإيطالية سعيد", subline: "نحتفل معكم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "共和国記念日", subline: "共に祝います — WillowSoft" },
    },
  },

  // ── Spain ───────────────────────────────────────────────────────────────
  {
    id: "es-fiesta-nacional",
    countries: ["ES"],
    date: { type: "fixed", month: 10, day: 12 },
    style: "fireworks",
    accentColor: "#AA151B",
    secondaryColor: "#F1BF00",
    flag: "es",
    greeting: {
      en: { title: "Happy", accent: "Fiesta Nacional", subline: "Celebrating Spain with you — WillowSoft" },
      tr: { title: "Mutlu", accent: "İspanya Ulusal Günü", subline: "Sizinle kutluyoruz — WillowSoft" },
      de: { title: "Frohen", accent: "Nationalfeiertag Spaniens", subline: "Wir feiern mit euch — WillowSoft" },
      fr: { title: "Bonne", accent: "Fête Nationale d'Espagne", subline: "Nous célébrons avec vous — WillowSoft" },
      es: { title: "Feliz", accent: "Fiesta Nacional", subline: "Celebramos con vosotros — WillowSoft" },
      it: { title: "Buona", accent: "Festa Nazionale di Spagna", subline: "Festeggiamo con voi — WillowSoft" },
      ar: { title: "عيد", accent: "إسبانيا الوطني سعيد", subline: "نحتفل معكم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "スペイン建国記念日", subline: "共に祝います — WillowSoft" },
    },
  },

  // ── Portugal ────────────────────────────────────────────────────────────
  {
    id: "pt-liberty-day",
    countries: ["PT"],
    date: { type: "fixed", month: 4, day: 25 },
    style: "confetti",
    accentColor: "#DA020E",
    secondaryColor: "#046A38",
    flag: "pt",
    greeting: {
      en: { title: "Happy", accent: "Freedom Day", subline: "Celebrating Portugal's Freedom Day with you — WillowSoft" },
      tr: { title: "Mutlu", accent: "Özgürlük Günü", subline: "Portekiz'in Özgürlük Günü kutlu olsun — WillowSoft" },
      de: { title: "Frohen", accent: "Tag der Freiheit", subline: "Wir feiern mit euch — WillowSoft" },
      fr: { title: "Bonne", accent: "Journée de la Liberté", subline: "Nous célébrons avec vous — WillowSoft" },
      es: { title: "Feliz", accent: "Día de la Libertad", subline: "Celebrando con vosotros — WillowSoft" },
      it: { title: "Buona", accent: "Giornata della Libertà", subline: "Festeggiamo con voi — WillowSoft" },
      ar: { title: "عيد", accent: "الحرية سعيد", subline: "نحتفل معكم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "自由の日", subline: "共に祝います — WillowSoft" },
    },
  },
  {
    id: "pt-portugal-day",
    countries: ["PT"],
    date: { type: "fixed", month: 6, day: 10 },
    style: "fireworks",
    accentColor: "#DA020E",
    secondaryColor: "#046A38",
    flag: "pt",
    greeting: {
      en: { title: "Happy", accent: "Portugal Day", subline: "Celebrating Portugal, Camões & Communities with you — WillowSoft" },
      tr: { title: "Mutlu", accent: "Portekiz Günü", subline: "Sizinle kutluyoruz — WillowSoft" },
      de: { title: "Frohen", accent: "Tag Portugals", subline: "Wir feiern mit euch — WillowSoft" },
      fr: { title: "Bonne", accent: "Journée du Portugal", subline: "Nous célébrons avec vous — WillowSoft" },
      es: { title: "Feliz", accent: "Día de Portugal", subline: "Celebrando con vosotros — WillowSoft" },
      it: { title: "Buona", accent: "Giornata del Portogallo", subline: "Festeggiamo con voi — WillowSoft" },
      ar: { title: "عيد", accent: "البرتغال الوطني سعيد", subline: "نحتفل معكم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "ポルトガルの日", subline: "共に祝います — WillowSoft" },
    },
  },
  {
    id: "pt-republic-day",
    countries: ["PT"],
    date: { type: "fixed", month: 10, day: 5 },
    style: "fireworks",
    accentColor: "#DA020E",
    secondaryColor: "#046A38",
    flag: "pt",
    greeting: {
      en: { title: "Happy", accent: "Republic Day", subline: "Celebrating Portugal's Republic Day with you — WillowSoft" },
      tr: { title: "Mutlu", accent: "Portekiz Cumhuriyet Günü", subline: "Sizinle kutluyoruz — WillowSoft" },
      de: { title: "Frohen", accent: "Tag der Republik", subline: "Wir feiern mit euch — WillowSoft" },
      fr: { title: "Bonne", accent: "Journée de la République", subline: "Nous célébrons avec vous — WillowSoft" },
      es: { title: "Feliz", accent: "Día de la República", subline: "Celebrando con vosotros — WillowSoft" },
      it: { title: "Buona", accent: "Giornata della Repubblica", subline: "Festeggiamo con voi — WillowSoft" },
      ar: { title: "عيد", accent: "الجمهورية البرتغالية سعيد", subline: "نحتفل معكم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "共和国記念日", subline: "共に祝います — WillowSoft" },
    },
  },
  {
    id: "pt-restoration-day",
    countries: ["PT"],
    date: { type: "fixed", month: 12, day: 1 },
    style: "fireworks",
    accentColor: "#DA020E",
    secondaryColor: "#046A38",
    flag: "pt",
    greeting: {
      en: { title: "Happy", accent: "Restoration of Independence Day", subline: "Honoring Portugal's independence — WillowSoft" },
      tr: { title: "Mutlu", accent: "Bağımsızlığın Restorasyonu Günü", subline: "Bu günü onurlandırıyoruz — WillowSoft" },
      de: { title: "Frohen", accent: "Tag der Wiederherstellung der Unabhängigkeit", subline: "Wir ehren diesen Tag — WillowSoft" },
      fr: { title: "Bonne", accent: "Journée de la Restauration de l'Indépendance", subline: "Nous honorons ce jour — WillowSoft" },
      es: { title: "Feliz", accent: "Día de la Restauración de la Independencia", subline: "Honrando este día — WillowSoft" },
      it: { title: "Buona", accent: "Giornata della Restaurazione dell'Indipendenza", subline: "Onorando questo giorno — WillowSoft" },
      ar: { title: "عيد", accent: "استعادة الاستقلال سعيد", subline: "نكرم هذا اليوم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "独立回復記念日", subline: "この日を称えて — WillowSoft" },
    },
  },

  // ── Japan ───────────────────────────────────────────────────────────────
  {
    id: "jp-foundation-day",
    countries: ["JP"],
    date: { type: "fixed", month: 2, day: 11 },
    style: "confetti",
    accentColor: "#BC002D",
    secondaryColor: "#FFFFFF",
    flag: "jp",
    greeting: {
      en: { title: "Happy", accent: "National Foundation Day", subline: "Celebrating Japan with you — WillowSoft" },
      tr: { title: "Mutlu", accent: "Japonya Kuruluş Günü", subline: "Sizinle kutluyoruz — WillowSoft" },
      de: { title: "Frohen", accent: "Gründungstag Japans", subline: "Wir feiern mit euch — WillowSoft" },
      fr: { title: "Bonne", accent: "Fête de la Fondation", subline: "Nous célébrons avec vous — WillowSoft" },
      es: { title: "Feliz", accent: "Día de la Fundación", subline: "Celebrando con vosotros — WillowSoft" },
      it: { title: "Buona", accent: "Giorno della Fondazione", subline: "Festeggiamo con voi — WillowSoft" },
      ar: { title: "عيد", accent: "تأسيس اليابان سعيد", subline: "نحتفل معكم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "建国記念の日", subline: "共に祝います — WillowSoft" },
    },
  },

  // ── Saudi Arabia ────────────────────────────────────────────────────────
  {
    id: "sa-national-day",
    countries: ["SA"],
    date: { type: "fixed", month: 9, day: 23 },
    style: "fireworks",
    accentColor: "#006C35",
    secondaryColor: "#FFFFFF",
    flag: "sa",
    greeting: {
      en: { title: "Happy", accent: "Saudi National Day", subline: "Celebrating with our friends in Saudi Arabia — WillowSoft" },
      tr: { title: "Mutlu", accent: "Suudi Arabistan Ulusal Günü", subline: "Sizinle kutluyoruz — WillowSoft" },
      de: { title: "Frohen", accent: "Saudischer Nationalfeiertag", subline: "Wir feiern mit euch — WillowSoft" },
      fr: { title: "Bonne", accent: "Fête Nationale Saoudienne", subline: "Nous célébrons avec vous — WillowSoft" },
      es: { title: "Feliz", accent: "Día Nacional de Arabia Saudita", subline: "Celebrando con vosotros — WillowSoft" },
      it: { title: "Buona", accent: "Festa Nazionale Saudita", subline: "Festeggiamo con voi — WillowSoft" },
      ar: { title: "كل عام وأنتم بخير", accent: "اليوم الوطني السعودي", subline: "نحتفل معكم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "サウジアラビア建国記念日", subline: "共に祝います — WillowSoft" },
    },
  },
  {
    id: "sa-founding-day",
    countries: ["SA"],
    date: { type: "fixed", month: 2, day: 22 },
    style: "confetti",
    accentColor: "#006C35",
    secondaryColor: "#FFFFFF",
    flag: "sa",
    greeting: {
      en: { title: "Happy", accent: "Founding Day", subline: "Celebrating Saudi heritage with you — WillowSoft" },
      tr: { title: "Mutlu", accent: "Suudi Arabistan Kuruluş Günü", subline: "Sizinle kutluyoruz — WillowSoft" },
      de: { title: "Frohen", accent: "Gründungstag", subline: "Wir feiern mit euch — WillowSoft" },
      fr: { title: "Bonne", accent: "Journée de la Fondation", subline: "Nous célébrons avec vous — WillowSoft" },
      es: { title: "Feliz", accent: "Día de la Fundación", subline: "Celebrando con vosotros — WillowSoft" },
      it: { title: "Buona", accent: "Giorno della Fondazione", subline: "Festeggiamo con voi — WillowSoft" },
      ar: { title: "يوم", accent: "التأسيس سعيد", subline: "نحتفل معكم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "建国記念日", subline: "共に祝います — WillowSoft" },
    },
  },

  // ── Qatar ───────────────────────────────────────────────────────────────
  {
    id: "qa-national-day",
    countries: ["QA"],
    date: { type: "fixed", month: 12, day: 18 },
    style: "fireworks",
    accentColor: "#8D1B3D",
    secondaryColor: "#FFFFFF",
    flag: "qa",
    greeting: {
      en: { title: "Happy", accent: "Qatar National Day", subline: "Celebrating with our friends in Qatar — WillowSoft" },
      tr: { title: "Mutlu", accent: "Katar Ulusal Günü", subline: "Sizinle kutluyoruz — WillowSoft" },
      de: { title: "Frohen", accent: "Nationalfeiertag Katars", subline: "Wir feiern mit euch — WillowSoft" },
      fr: { title: "Bonne", accent: "Fête Nationale du Qatar", subline: "Nous célébrons avec vous — WillowSoft" },
      es: { title: "Feliz", accent: "Día Nacional de Catar", subline: "Celebrando con vosotros — WillowSoft" },
      it: { title: "Buona", accent: "Festa Nazionale del Qatar", subline: "Festeggiamo con voi — WillowSoft" },
      ar: { title: "كل عام وأنتم بخير", accent: "اليوم الوطني القطري", subline: "نحتفل معكم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "カタール建国記念日", subline: "共に祝います — WillowSoft" },
    },
  },

  // ── United Arab Emirates ────────────────────────────────────────────────
  {
    id: "ae-national-day",
    countries: ["AE"],
    date: { type: "fixed", month: 12, day: 2 },
    style: "fireworks",
    accentColor: "#009739",
    secondaryColor: "#FF0000",
    flag: "ae",
    greeting: {
      en: { title: "Happy", accent: "UAE National Day", subline: "Celebrating with our friends in the UAE — WillowSoft" },
      tr: { title: "Mutlu", accent: "BAE Ulusal Günü", subline: "Sizinle kutluyoruz — WillowSoft" },
      de: { title: "Frohen", accent: "Nationalfeiertag der VAE", subline: "Wir feiern mit euch — WillowSoft" },
      fr: { title: "Bonne", accent: "Fête Nationale des É.A.U.", subline: "Nous célébrons avec vous — WillowSoft" },
      es: { title: "Feliz", accent: "Día Nacional de los EAU", subline: "Celebrando con vosotros — WillowSoft" },
      it: { title: "Buona", accent: "Festa Nazionale degli EAU", subline: "Festeggiamo con voi — WillowSoft" },
      ar: { title: "كل عام وأنتم بخير", accent: "اليوم الوطني الإماراتي", subline: "نحتفل معكم — WillowSoft" },
      ja: { title: "おめでとうございます", accent: "UAE建国記念日", subline: "共に祝います — WillowSoft" },
    },
  },

  // ── Everyone ────────────────────────────────────────────────────────────
  {
    id: "new-year",
    countries: ["*"],
    date: { type: "fixed", month: 1, day: 1 },
    style: "fireworks",
    accentColor: "#F4CF72",
    secondaryColor: "#26348B",
    flag: "un",
    greeting: {
      en: { title: "Happy", accent: "New Year", subline: "Wishing you a bright year ahead — WillowSoft" },
      tr: { title: "Mutlu", accent: "Yıllar", subline: "Nice mutlu yıllara — WillowSoft" },
      de: { title: "Frohes", accent: "Neues Jahr", subline: "Alles Gute für das neue Jahr — WillowSoft" },
      fr: { title: "Bonne", accent: "Année", subline: "Tous nos vœux pour cette nouvelle année — WillowSoft" },
      es: { title: "Feliz", accent: "Año Nuevo", subline: "Os deseamos un año brillante — WillowSoft" },
      it: { title: "Felice", accent: "Anno Nuovo", subline: "Vi auguriamo un anno luminoso — WillowSoft" },
      ar: { title: "سنة", accent: "جديدة سعيدة", subline: "نتمنى لكم عاماً مشرقاً — WillowSoft" },
      ja: { title: "あけまして", accent: "おめでとうございます", subline: "素晴らしい一年になりますように — WillowSoft" },
    },
  },
];
