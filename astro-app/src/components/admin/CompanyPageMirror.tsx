"use client";

import { localizeItem, pageText, itemText, type Locale } from "@/lib/cms";
import { officesForContact, resolveOfficePhone, syncOfficePhonesInFacts } from "@/lib/company-contact";
import { resolveAdminImageSrc } from "@/lib/admin-media";
import { Hit, ItemHit, MirrorShell, locVal } from "./mirrorShared";

const SVGS: Record<string, string> = {
  cpu: `<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>`,
  globe: `<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  server: `<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`,
  shield: `<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  terminal: `<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
  phone: `<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
  gear: `<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  database: `<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path></svg>`,
  water: `<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"></path></svg>`,
  mail: `<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-10 5L2 7"></path></svg>`,
  pin: `<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
};

function getSvg(name: string, size = 20) {
  const template = SVGS[name] || SVGS.globe;
  return template.replace(/SIZE/g, String(size));
}

function SvgIcon({ name, size = 20 }: { name: string; size?: number }) {
  return <span style={{ display: "inline-flex" }} dangerouslySetInnerHTML={{ __html: getSvg(name, size) }} />;
}

const UI: Record<string, Record<string, string>> = {
  heroEyebrow: { en: "About WillowSoft", tr: "WillowSoft Hakkında", de: "Über WillowSoft", fr: "À propos de WillowSoft", es: "Sobre WillowSoft", it: "Su WillowSoft", ar: "عن WillowSoft", ja: "WillowSoftについて" },
  heroLine1: { en: "Smart", tr: "Akıllı", de: "Kluge", fr: "Des équipes", es: "Equipos", it: "Team", ar: "فرق", ja: "スマートな" },
  heroAccent: { en: "Teams.", tr: "Ekipler.", de: "Teams.", fr: "intelligentes.", es: "inteligentes.", it: "intelligenti.", ar: "ذكية.", ja: "チーム。" },
  heroLine2: { en: "Resilient Systems.", tr: "Dayanıklı Sistemler.", de: "Robuste Systeme.", fr: "Des systèmes résilients.", es: "Sistemas resilientes.", it: "Sistemi resilienti.", ar: "أنظمة مرنة.", ja: "堅牢なシステム。" },
  startProject: { en: "Start a project", tr: "Proje başlatın", de: "Projekt starten", fr: "Démarrer un projet", es: "Iniciar proyecto", it: "Avvia un progetto", ar: "ابدأ مشروعاً", ja: "プロジェクトを始める" },
  getInTouch: { en: "Get in touch", tr: "İletişime geçin", de: "Kontakt aufnehmen", fr: "Nous contacter", es: "Ponerse en contacto", it: "Contattaci", ar: "تواصل معنا", ja: "お問い合わせ" },
  yearFounded: { en: "Year founded", tr: "Kuruluş Yılı", de: "Gründungsjahr", fr: "Année de création", es: "Año de fundación", it: "Anno di fondazione", ar: "سنة التأسيس", ja: "設立年" },
  countriesDeployed: { en: "Countries deployed", tr: "Ülkeye İhracat", de: "Einsatzländer", fr: "Pays de déploiement", es: "Países de despliegue", it: "Paesi di distribuzione", ar: "دول التصدير", ja: "展開国数" },
  continuousRnD: { en: "Continuous R&D", tr: "Sürekli Ar-Ge", de: "Kontinuierliche F&E", fr: "R&D continue", es: "I+D continua", it: "R&S continua", ar: "بحث وتطوير مستمر", ja: "継続的な研究開発" },
  aboutUs: { en: "About us", tr: "Hakkımızda", de: "Über uns", fr: "Qui sommes-nous", es: "Sobre nosotros", it: "Chi siamo", ar: "من نحن", ja: "私たちについて" },
  mission: { en: "MISSION", tr: "MİSYON", de: "MISSION", fr: "MISSION", es: "MISIÓN", it: "MISSIONE", ar: "المهمة", ja: "ミッション" },
  vision: { en: "VISION", tr: "VİZYON", de: "VISION", fr: "VISION", es: "VISIÓN", it: "VISIONE", ar: "الرؤية", ja: "ビジョン" },
  theTeam: { en: "The team", tr: "Ekibimiz", de: "Das Team", fr: "L'équipe", es: "El equipo", it: "Il team", ar: "الفريق", ja: "チーム" },
  teamLead: {
    en: "Our core team of hardware engineers, firmware developers, and cloud architects.",
    tr: "Kurucu mühendislerimiz ve IIoT mimarlarımız.",
    de: "Unser Kernteam aus Hardware-Ingenieuren, Firmware-Entwicklern und Cloud-Architekten.",
    fr: "Notre équipe de fondation : ingénieurs hardware, développeurs firmware et architectes cloud.",
    es: "Nuestro equipo central de ingenieros de hardware, desarrolladores de firmware y arquitectos cloud.",
    it: "Il nostro team di ingegneri hardware, sviluppatori firmware e architetti cloud.",
    ar: "فريقنا الأساسي من مهندسي الأجهزة ومطوري البرامج الثابتة ومهندسي السحابة.",
    ja: "ハードウェア、ファームウェア、クラウドのコアエンジニアチーム。",
  },
  globalPresence: { en: "Global presence", tr: "Küresel Varlık", de: "Globale Präsenz", fr: "Présence mondiale", es: "Presencia global", it: "Presenza globale", ar: "حضور عالمي", ja: "グローバル展開" },
  workWithUs: { en: "Work with us", tr: "Bizimle Çalışın", de: "Mit uns arbeiten", fr: "Travailler avec nous", es: "Trabaja con nosotros", it: "Lavora con noi", ar: "اعمل معنا", ja: "一緒に働く" },
  workWithUsLead: {
    en: "Tell us what you're building. We'll tell you how we'd approach it.",
    tr: "Ne üretmek istediğinizi bize anlatın. Size mühendislik yaklaşımımızı sunalım.",
    de: "Erzählen Sie uns, was Sie bauen. Wir zeigen Ihnen unseren technischen Ansatz.",
    fr: "Dites-nous ce que vous construisez. Nous vous expliquerons notre approche d'ingénierie.",
    es: "Cuéntenos qué está construyendo. Le explicaremos nuestro enfoque de ingeniería.",
    it: "Raccontaci cosa stai costruendo. Ti spiegheremo il nostro approccio ingegneristico.",
    ar: "أخبرنا بما تبنيه. وسنوضح لك كيف نتعامل معه هندسياً.",
    ja: "作りたいものをお聞かせください。当社のエンジニアリングアプローチをご提案します。",
  },
  howWeWork: { en: "How we work", tr: "Nasıl Çalışırız", de: "Wie wir arbeiten", fr: "Notre façon de travailler", es: "Cómo trabajamos", it: "Come lavoriamo", ar: "كيف نعمل", ja: "私たちの進め方" },
  historyTimeline: { en: "History timeline", tr: "Tarihçe zaman çizelgesi", de: "Zeitleiste", fr: "Chronologie", es: "Línea de tiempo", it: "Cronologia", ar: "الجدول الزمني", ja: "沿革タイムライン" },
  historyLead: {
    en: "Six years of steady growth — from a focused engineering studio to an internationally deployed IoT company.",
    tr: "6 yıllık istikrarlı büyüme — odaklanmış bir mühendislik stüdyosundan uluslararası ölçekte konuşlandırılmış bir IoT şirketine.",
    de: "Sechs Jahre stetiges Wachstum — von einem fokussierten Engineering-Studio zu einem international eingesetzten IoT-Unternehmen.",
    fr: "Six ans de croissance régulière — d'un studio d'ingénierie ciblé à une entreprise IoT déployée à l'international.",
    es: "Seis años de crecimiento constante — de un estudio de ingeniería enfocado a una empresa IoT desplegada internacionalmente.",
    it: "Sei anni di crescita costante — da uno studio di ingegneria focalizzato a un'azienda IoT distribuita a livello internazionale.",
    ar: "ست سنوات من النمو المستقر — من استوديو هندسي متخصص إلى شركة إنترنت أشياء منتشرة دولياً.",
    ja: "着実な成長の6年間 — 集中型エンジニアリングスタジオから国際展開するIoT企業へ。",
  },
  expertiseEyebrow: { en: "Core expertise", tr: "Uzmanlık Alanlarımız", de: "Kernkompetenzen", fr: "Expertise clé", es: "Experiencia principal", it: "Competenze chiave", ar: "الخبرات الأساسية", ja: "コア領域" },
  expertiseTitleHtml: {
    en: 'What we are actually <span class="serif-accent">good</span> at.',
    tr: 'Asıl <span class="serif-accent">iyi</span> olduğumuz işler.',
    de: 'Worin wir wirklich <span class="serif-accent">stark</span> sind.',
    fr: 'Ce que nous faisons vraiment <span class="serif-accent">bien</span>.',
    es: 'En lo que realmente somos <span class="serif-accent">buenos</span>.',
    it: 'Ciò in cui siamo davvero <span class="serif-accent">bravi</span>.',
    ar: 'ما نتقنه <span class="serif-accent">فعلاً</span>.',
    ja: '私たちが本当に<span class="serif-accent">得意</span>とする領域。',
  },
  expertiseLead: {
    en: "Six deep competencies covering the entire IoT product lifecycle — from silicon to cloud.",
    tr: "Silikondan buluta kadar tüm IoT ürün yaşam döngüsünü kapsayan altı temel uzmanlık katmanı.",
    de: "Sechs Kernkompetenzen entlang des gesamten IoT-Produktlebenszyklus — vom Silizium bis zur Cloud.",
    fr: "Six compétences couvrant tout le cycle de vie produit IoT — du silicium au cloud.",
    es: "Seis competencias que cubren todo el ciclo de vida del producto IoT — del silicio a la nube.",
    it: "Sei competenze che coprono l'intero ciclo di vita del prodotto IoT — dal silicio al cloud.",
    ar: "ست كفاءات تغطي دورة حياة منتج إنترنت الأشياء بالكامل — من السيليكون إلى السحابة.",
    ja: "シリコンからクラウドまで、IoT製品ライフサイクル全体をカバーする6つの専門領域。",
  },
  workWithLead: {
    en: "From Fortune 500 industrials to fast-moving consumer brands — demanding environments where reliability is not optional.",
    tr: "Fortune 500 endüstriyel devlerinden hızlı tüketim markalarına kadar — güvenilirliğin isteğe bağlı olmadığı zorlu çalışma koşulları.",
    de: "Von Fortune-500-Industriellen bis zu schnelllebigen Konsummarken — anspruchsvolle Umgebungen, in denen Zuverlässigkeit keine Option ist.",
    fr: "Des industriels du Fortune 500 aux marques grand public — des environnements exigeants où la fiabilité n'est pas optionnelle.",
    es: "Desde industriales Fortune 500 hasta marcas de consumo — entornos exigentes donde la fiabilidad no es opcional.",
    it: "Dai industriali Fortune 500 ai brand consumer — ambienti impegnativi in cui l'affidabilità non è opzionale.",
    ar: "من عمالقة الصناعة إلى علامات الاستهلاك السريع — بيئات تتطلب موثوقية لا تقبل التفاوض.",
    ja: "フォーチュン500の産業企業から消費財ブランドまで — 信頼性が不可欠な厳しい環境。",
  },
  rndUnit: { en: "yrs", tr: "yıl", de: "J.", fr: "ans", es: "años", it: "anni", ar: "سنة", ja: "年" },
  fullStackValue: { en: "Full-stack", tr: "Uçtan uca", de: "Full-Stack", fr: "Full-stack", es: "Full-stack", it: "Full-stack", ar: "متكامل", ja: "フルスタック" },
  fullStackLabel: { en: "HW · FW · Cloud", tr: "Donanım · Yazılım · Bulut", de: "HW · FW · Cloud", fr: "HW · FW · Cloud", es: "HW · FW · Cloud", it: "HW · FW · Cloud", ar: "عتاد · برمجيات · سحابة", ja: "HW · FW · Cloud" },
  howWeWorkTitleHtml: {
    en: 'Engineering principles we don\'t <span class="serif-accent">compromise</span> on.',
    tr: 'Taviz vermediğimiz mühendislik <span class="serif-accent">ilkeleri</span>.',
    de: 'Technische Grundsätze, auf die wir nicht <span class="serif-accent">verzichten</span>.',
    fr: 'Des principes d\'ingénierie sur lesquels nous ne <span class="serif-accent">transigeons</span> pas.',
    es: 'Principios de ingeniería en los que no <span class="serif-accent">cedemos</span>.',
    it: 'Principi ingegneristici su cui non <span class="serif-accent">transigiamo</span>.',
    ar: 'مبادئ هندسية لا <span class="serif-accent">نساوم</span> عليها.',
    ja: '譲れないエンジニアリング<span class="serif-accent">原則</span>。',
  },
  officesTitleHtml: {
    en: 'Two offices. <span class="serif-accent">One</span> team.',
    tr: 'İki ofis. <span class="serif-accent">Tek</span> ekip.',
    de: 'Zwei Büros. <span class="serif-accent">Ein</span> Team.',
    fr: 'Deux bureaux. <span class="serif-accent">Une</span> équipe.',
    es: 'Dos oficinas. <span class="serif-accent">Un</span> equipo.',
    it: 'Due uffici. <span class="serif-accent">Un</span> team.',
    ar: 'مكتبان. <span class="serif-accent">فريق</span> واحد.',
    ja: '2拠点。<span class="serif-accent">ひとつ</span>のチーム。',
  },
  ctaTitleHtml: {
    en: 'Ready to build with a team that owns the <span class="serif-accent">full stack</span>?',
    tr: 'Uçtan uca tüm <span class="serif-accent">katmanları</span> yöneten bir ekiple çalışmaya hazır mısınız?',
    de: 'Bereit, mit einem Team zu bauen, das den <span class="serif-accent">gesamten Stack</span> beherrscht?',
    fr: 'Prêt à construire avec une équipe qui maîtrise la <span class="serif-accent">pile complète</span> ?',
    es: '¿Listo para construir con un equipo que domina el <span class="serif-accent">stack completo</span>?',
    it: 'Pronto a costruire con un team che gestisce l\'intero <span class="serif-accent">stack</span>?',
    ar: 'هل أنت مستعد للبناء مع فريق يتولى <span class="serif-accent">المكدس الكامل</span>؟',
    ja: '<span class="serif-accent">フルスタック</span>を担うチームと作りませんか？',
  },
};

const TEAM_TITLE_HTML: Record<string, string> = {
  en: 'Meet the people behind the <span class="serif-accent">engineering</span>.',
  tr: 'Mühendisliğin arkasındaki <span class="serif-accent">insanlar</span>.',
  de: 'Die <span class="serif-accent">Menschen</span> hinter der Technik.',
  fr: 'Les <span class="serif-accent">personnes</span> derrière l\'ingénierie.',
  es: 'Las <span class="serif-accent">personas</span> detrás de la ingeniería.',
  it: 'Le <span class="serif-accent">persone</span> dietro l\'ingegneria.',
  ar: 'الأشخاص وراء <span class="serif-accent">الهندسة</span>.',
  ja: '<span class="serif-accent">エンジニアリング</span>の裏にいる人たち。',
};

function u(key: string, locale: Locale) {
  const val = UI[key];
  return val?.[locale] || val?.en || "";
}

function cleanCmsText(value: string) {
  return value
    .replace(/\s*\(?\s*Validated\s*Test\s*\)?/gi, "")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanCmsValue(value: unknown): unknown {
  if (typeof value === "string") return cleanCmsText(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanCmsValue(item))
      .filter((item) => !(typeof item === "string" && item.length === 0));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, cleanCmsValue(item)])
    );
  }
  return value;
}

function sortByOrder(items: any[]) {
  return [...(Array.isArray(items) ? items : [])].sort((a, b) => {
    const orderA = Number.isFinite(Number(a?.sortOrder)) ? Number(a.sortOrder) : 9999;
    const orderB = Number.isFinite(Number(b?.sortOrder)) ? Number(b.sortOrder) : 9999;
    if (orderA !== orderB) return orderA - orderB;
    return String(a?.year || a?.name || "").localeCompare(String(b?.year || b?.name || ""));
  });
}

function getInitials(name: string) {
  const initials = String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return initials || "WS";
}

function hasUsableImage(path: unknown) {
  const value = String(path || "").trim();
  return value.length > 0 && !/placeholder/i.test(value);
}

function sectionTitle(pageContent: Record<string, any>, cmsKey: string, locale: Locale, fallbackHtml: string) {
  const fromCms = locVal(pageContent, cmsKey, locale);
  return fromCms || fallbackHtml;
}

export default function CompanyPageMirror({
  pageContent,
  companyFacts: rawFacts,
  locale,
  activeBlockId,
  activeItemId,
  onSelectBlock,
  onSelectItem,
}: {
  pageContent: Record<string, any>;
  companyFacts: Record<string, any>;
  locale: Locale;
  activeBlockId: string | null;
  activeItemId?: string | null;
  onSelectBlock: (id: string) => void;
  onSelectItem?: (blockId: string, itemId: string) => void;
}) {
  const companyFacts = syncOfficePhonesInFacts(rawFacts || {});
  const contactOffices = officesForContact(companyFacts, locale);

  const getFactVal = (key: string) => {
    const localized = companyFacts.localized?.[locale]?.[key];
    if (localized) return cleanCmsValue(localized) as string;
    const map = companyFacts[key];
    if (!map) return "";
    return cleanCmsValue(map) as string;
  };

  const getFactList = (key: string): any[] => {
    const localized = companyFacts.localized?.[locale]?.[key];
    const raw = localized !== undefined && localized !== null ? localized : companyFacts[key];
    const cleaned = cleanCmsValue(raw ?? []);
    if (Array.isArray(cleaned)) return cleaned;
    if (typeof cleaned === "string") {
      return cleaned.split(/[\n,]+/g).map((item) => item.trim()).filter(Boolean);
    }
    return [];
  };

  const factText = (key: string, fallback = "") => getFactVal(key) || fallback;
  const t = (key: string, fallback = "") => pageText(pageContent, key, locale, fallback);

  const teamFromFacts = () => {
    const localized = companyFacts.localized?.[locale]?.team;
    const raw = Array.isArray(localized) ? localized : companyFacts.team;
    return Array.isArray(raw) ? raw : [];
  };

  const sortedTeam = sortByOrder(teamFromFacts())
    .filter((item) => item && typeof item === "object")
    .map((item) => cleanCmsValue(localizeItem(item, locale)));

  const sortedTimeline = sortByOrder(Array.isArray(companyFacts.timeline) ? companyFacts.timeline : [])
    .filter((item) => item && typeof item === "object")
    .map((item) => cleanCmsValue(localizeItem(item, locale)));

  const sortedExpertise = sortByOrder(getFactList("expertise"));
  const industries = getFactList("industries");
  const offices = getFactList("officesList");
  const principles = getFactList("principles");
  const whyUs = getFactList("whyUs");
  const aboutBullets = getFactList("aboutBullets");
  const aboutTags = getFactList("aboutTags") as string[];

  const foundedYear = parseInt(String(companyFacts.founded || ""), 10);
  const stat3Value = getFactVal("stat3Value")
    || (Number.isFinite(foundedYear) ? String(new Date().getFullYear() - foundedYear) : "");
  const stat3Display = stat3Value ? `${stat3Value} ${u("rndUnit", locale)}` : "";
  const stat4Display = getFactVal("stat4Value") || u("fullStackValue", locale);
  const stat4Label = getFactVal("stat4Label") || u("fullStackLabel", locale);

  const historyTitleFallback = locale === "tr"
    ? 'Ar-Ge köklerinden <span class="serif-accent">küresel</span> dağıtıma.'
    : 'From R&D roots to <span class="serif-accent">global</span> deployment.';

  const workWithTitleFallback = locale === "tr"
    ? 'Küresel ekipler WillowSoft\'a tek bir nedenle güvenir: Sonuç <span class="serif-accent">üretiriz</span>.'
    : 'Global teams trust WillowSoft for one reason: we <span class="serif-accent">deliver</span>.';

  const itemActive = (id: string | undefined) => Boolean(id && activeItemId === id);
  const pickItem = (blockId: string, item: any) => {
    if (item?.id && onSelectItem) onSelectItem(blockId, String(item.id));
  };

  return (
    <MirrorShell dataPage="company" deps={[pageContent, rawFacts, locale, activeBlockId, activeItemId]}>
      <main>
        {/* Hero */}
        <Hit id="hero" active={activeBlockId === "hero"} onClick={() => onSelectBlock("hero")}>
          <div className="company-hero-c" style={{ background: "var(--ws-navy-950)", position: "relative", overflow: "hidden" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06, pointerEvents: "none" }}>
              <defs>
                <pattern id="cocGridMirror" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M80 0H0V80" fill="none" stroke="#7fa3d8" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cocGridMirror)" />
            </svg>
            <div className="hero-inner-c">
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <span className="eyebrow" style={{ color: "var(--ws-teal)" }}>{u("heroEyebrow", locale)}</span>
                <h1 style={{ fontSize: "clamp(2.1rem, 4.2vw, 3.4rem)", fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1.02, color: "#fff", margin: 0 }}>
                  {u("heroLine1", locale)}{" "}
                  <span className="serif-accent" style={{ color: "var(--ws-teal)", fontSize: "1.05em" }}>{u("heroAccent", locale)}</span>
                  <br />
                  {u("heroLine2", locale)}
                </h1>
                <p style={{ fontSize: 16, lineHeight: 1.68, color: "rgba(255,255,255,.62)", maxWidth: 520, margin: 0 }}>
                  {getFactVal("heroSub")}
                </p>
                <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                  <span className="ws-btn ws-btn-primary">{u("startProject", locale)}</span>
                  <span className="ws-btn ws-btn-ghost">{u("getInTouch", locale)}</span>
                </div>
              </div>
            </div>
          </div>
        </Hit>

        {/* Stats */}
        <Hit id="stats" active={activeBlockId === "stats"} onClick={() => onSelectBlock("stats")}>
          <div style={{ marginTop: 0, position: "relative", zIndex: 10, width: "min(var(--max), calc(100% - 40px))", marginLeft: "auto", marginRight: "auto" }} className="company-stats-wrap">
            <div className="ws-card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", padding: "36px 16px", boxShadow: "0 20px 56px rgba(13,27,62,.12)", background: "#ffffff" }}>
              <div className="ws-stat" style={{ padding: "0 32px" }}>
                <b>{getFactVal("founded")}</b>
                <span>{u("yearFounded", locale)}</span>
              </div>
              <div className="ws-stat" style={{ padding: "0 32px" }}>
                <b>{getFactVal("countries")}</b>
                <span>{u("countriesDeployed", locale)}</span>
              </div>
              <div className="ws-stat" style={{ padding: "0 32px" }}>
                <b>{stat3Display}</b>
                <span>{u("continuousRnD", locale)}</span>
              </div>
              <div className="ws-stat" style={{ padding: "0 32px" }}>
                <b>{stat4Display}</b>
                <span>{stat4Label}</span>
              </div>
            </div>
          </div>
        </Hit>

        {/* About */}
        <Hit id="about" active={activeBlockId === "about"} onClick={() => onSelectBlock("about")}>
          <section className="company-section company-about-c">
            <div className="company-container company-grid-2">
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <span className="eyebrow">{t("introEyebrow", u("aboutUs", locale))}</span>
                <h2 className="ws-h2" style={{ fontSize: "clamp(2rem, 3.4vw, 2.75rem)", textWrap: "balance" }}>
                  {t("introTitle", getFactVal("aboutHeadline"))}
                </h2>
                <ul className="ws-bullets" style={{ marginTop: 4 }}>
                  {aboutBullets.map((b: any, i: number) => {
                    if (typeof b === "string") return <li key={i}>{b}</li>;
                    const item = localizeItem(b, locale);
                    return <li key={b?.id || i}>{item?.text || b?.text || ""}</li>;
                  })}
                </ul>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 8 }}>
                <p style={{ fontSize: 16, lineHeight: 1.72, color: "var(--ws-body)", margin: 0 }}>
                  {t("introLead", getFactVal("aboutSub"))}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 4 }}>
                  {aboutTags.map((tag: string) => (
                    <span key={tag} className="ws-chip">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </Hit>

        {/* Mission / Vision */}
        <Hit id="missionVision" active={activeBlockId === "missionVision"} onClick={() => onSelectBlock("missionVision")}>
          <section className="company-section company-mv-c" style={{ paddingTop: 0 }}>
            <div className="company-container company-grid-2" style={{ gap: 20 }}>
              <div style={{ background: "linear-gradient(140deg, #1e1b4b, #132175)", borderRadius: 22, padding: "56px 60px", display: "flex", flexDirection: "column", gap: 20, color: "#ffffff" }}>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ws-teal)" }}>{u("mission", locale)}</span>
                <p style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.5, margin: 0, textWrap: "balance" }}>
                  &ldquo;{getFactVal("mission")}&rdquo;
                </p>
              </div>
              <div style={{ background: "#f4f6fb", border: "1.5px solid var(--ws-line)", borderRadius: 22, padding: "56px 60px", display: "flex", flexDirection: "column", gap: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ws-blue)" }}>{u("vision", locale)}</span>
                <p style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.5, color: "var(--ws-ink)", margin: 0, textWrap: "balance" }}>
                  &ldquo;{getFactVal("vision")}&rdquo;
                </p>
              </div>
            </div>
          </section>
        </Hit>

        {/* Team */}
        <Hit id="team" active={activeBlockId === "team"} onClick={() => onSelectBlock("team")}>
          <section className="company-section bg-soft company-team-section">
            <div className="company-container company-grid-team">
              <div>
                <span className="eyebrow">{t("teamEyebrow", factText("teamEyebrow", u("theTeam", locale)))}</span>
                <h2 className="ws-h2" style={{ marginTop: 18 }} dangerouslySetInnerHTML={{ __html: sectionTitle(pageContent, "teamTitle", locale, TEAM_TITLE_HTML[locale] || TEAM_TITLE_HTML.en) }} />
                <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--ws-body)", marginTop: 16 }}>
                  {t("teamLead", factText("teamLead", u("teamLead", locale)))}
                </p>
              </div>
              <div className="company-team-list">
                {sortedTeam.map((member: any, idx: number) => {
                  const imagePath = itemText(member, "image", locale, member.image || "");
                  const imgSrc = resolveAdminImageSrc(imagePath);
                  const cardBody = (
                    <>
                      <div className="ws-placeholder-avatar company-team-avatar">
                        <span className="company-team-initials">{getInitials(member.name)}</span>
                        {hasUsableImage(imagePath) && imgSrc && (
                          <img className="company-team-image" src={imgSrc} alt={member.name || ""} loading="lazy" />
                        )}
                      </div>
                      <div className="company-team-body">
                        <b>{itemText(member, "name", locale, member.name || "")}</b>
                        <span>{itemText(member, "role", locale, member.role || "")}</span>
                        <p>{itemText(member, "bio", locale, member.bio || "")}</p>
                      </div>
                    </>
                  );
                  return member?.id && onSelectItem ? (
                    <ItemHit
                      key={member.id}
                      active={itemActive(String(member.id))}
                      onClick={() => pickItem("team", member)}
                      className="ws-card company-team-card"
                    >
                      {cardBody}
                    </ItemHit>
                  ) : (
                    <div key={member.id || idx} className="ws-card company-team-card">{cardBody}</div>
                  );
                })}
              </div>
            </div>
          </section>
        </Hit>

        {/* Principles */}
        <Hit id="principles" active={activeBlockId === "principles"} onClick={() => onSelectBlock("principles")}>
          <section className="company-section company-principles-c">
            <div className="company-container">
              <div className="company-grid-principles-head">
                <div>
                  <span className="eyebrow">{t("principlesEyebrow", u("howWeWork", locale))}</span>
                  <h2 className="ws-h2" style={{ marginTop: 18 }} dangerouslySetInnerHTML={{ __html: sectionTitle(pageContent, "principlesTitle", locale, UI.howWeWorkTitleHtml[locale] || UI.howWeWorkTitleHtml.en) }} />
                </div>
                <div className="company-proof-chips">
                  {whyUs.map((w: any, i: number) => {
                    if (!w || typeof w !== "object") return null;
                    const chip = localizeItem(w, locale);
                    return (
                      <div key={w.id || i} className="company-proof-chip">
                        <div className="ws-icbox" style={{ flex: "0 0 auto" }} dangerouslySetInnerHTML={{ __html: getSvg(chip?.icon || w.icon, 20) }} />
                        <span>{chip?.title || w.title || ""}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="company-principles-list">
                {principles.map((p: any, i: number) => {
                  if (!p || typeof p !== "object") return null;
                  const principle = localizeItem(p, locale);
                  return (
                    <div key={p.id || i} className="ws-card company-principle-card">
                      <div className="company-principle-top">
                        <span>{principle?.n ?? p?.n ?? ""}</span>
                        <div className="ws-icbox" dangerouslySetInnerHTML={{ __html: getSvg(principle?.icon || p?.icon, 22) }} />
                      </div>
                      <h3 className="ws-h3">{principle?.title || p?.title || ""}</h3>
                      <p>{principle?.body || p?.body || ""}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </Hit>

        {/* Timeline */}
        <Hit id="timeline" active={activeBlockId === "timeline"} onClick={() => onSelectBlock("timeline")}>
          <section className="company-section company-timeline-c">
            <div className="company-container">
              <div className="company-grid-timeline-head">
                <div>
                  <span className="eyebrow">{t("historyEyebrow", u("historyTimeline", locale))}</span>
                  <h2 className="ws-h2" style={{ marginTop: 18 }} dangerouslySetInnerHTML={{ __html: sectionTitle(pageContent, "historyTitle", locale, historyTitleFallback) }} />
                </div>
                <p className="ws-lead" style={{ alignSelf: "end", paddingBottom: 4 }}>
                  {factText("historyLead", u("historyLead", locale))}
                </p>
              </div>
              <div className={`timeline-container-scroll ${sortedTimeline.length > 1 ? "is-static" : "is-static"}`}>
                <ol className="timeline-accessible-list" aria-label={u("historyTimeline", locale)}>
                  {sortedTimeline.map((item: any, i: number) => {
                    const isLast = i === sortedTimeline.length - 1;
                    const cardBody = (
                      <>
                        <div className="timeline-dot" />
                        <div className="ws-card timeline-card">
                          <b className="timeline-year">{item.year}</b>
                          <b className="timeline-title">{item.title}</b>
                          <p>{item.body}</p>
                        </div>
                      </>
                    );
                    return item?.id && onSelectItem ? (
                      <ItemHit
                        key={item.id}
                        active={itemActive(String(item.id))}
                        onClick={() => pickItem("timeline", item)}
                        className={`timeline-list-item ${isLast ? "is-latest" : ""}`}
                      >
                        {cardBody}
                      </ItemHit>
                    ) : (
                      <li key={item.id || i} className={`timeline-list-item ${isLast ? "is-latest" : ""}`}>
                        {cardBody}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </section>
        </Hit>

        {/* Expertise */}
        <Hit id="expertise" active={activeBlockId === "expertise"} onClick={() => onSelectBlock("expertise")}>
          <section className="company-section company-expertise-c">
            <div className="company-container company-expertise-layout">
              <div className="company-expertise-copy">
                <span className="eyebrow">{factText("expertiseEyebrow", u("expertiseEyebrow", locale))}</span>
                <h2 className="ws-h2" style={{ marginTop: 18 }} dangerouslySetInnerHTML={{ __html: factText("expertiseTitle", UI.expertiseTitleHtml[locale] || UI.expertiseTitleHtml.en) }} />
                <p className="ws-lead">{factText("expertiseLead", u("expertiseLead", locale))}</p>
              </div>
              <div className="company-capability-panel">
                {sortedExpertise.map((e: any, i: number) => {
                  if (!e || typeof e !== "object") return null;
                  const exp = localizeItem(e, locale);
                  const rowBody = (
                    <>
                      <span className="company-capability-number">{String(i + 1).padStart(2, "0")}</span>
                      <div className="ws-icbox" dangerouslySetInnerHTML={{ __html: getSvg(exp?.icon || e?.icon, 24) }} />
                      <div className="company-capability-copy">
                        <b>{exp?.label || e?.label || ""}</b>
                        <span>{exp?.note || e?.note || ""}</span>
                      </div>
                    </>
                  );
                  return e?.id && onSelectItem ? (
                    <ItemHit
                      key={e.id}
                      active={itemActive(String(e.id))}
                      onClick={() => pickItem("expertise", e)}
                      className="company-capability-row"
                    >
                      {rowBody}
                    </ItemHit>
                  ) : (
                    <div key={e.id || i} className="company-capability-row">{rowBody}</div>
                  );
                })}
              </div>
            </div>
          </section>
        </Hit>

        {/* Industries */}
        <Hit id="industries" active={activeBlockId === "industries"} onClick={() => onSelectBlock("industries")}>
          <section className="company-section bg-soft company-industries-section">
            <div className="company-container company-industries-layout">
              <div className="company-industries-copy">
                <span className="eyebrow">{t("workWithEyebrow", u("workWithUs", locale))}</span>
                <h2 className="ws-h2" style={{ marginTop: 18 }} dangerouslySetInnerHTML={{ __html: sectionTitle(pageContent, "workWithTitle", locale, workWithTitleFallback) }} />
                <p className="ws-lead">{factText("workWithLead", u("workWithLead", locale))}</p>
              </div>
              <div className="company-industry-proof-list">
                {industries.map((ind: any, i: number) => {
                  if (!ind || typeof ind !== "object") return null;
                  const industry = localizeItem(ind, locale);
                  const cardBody = (
                    <>
                      <span className="company-industry-index">{String(i + 1).padStart(2, "0")}</span>
                      <div
                        className="company-industry-icon"
                        style={{ background: industry?.c || ind?.c || "#e8eef8", color: industry?.t || ind?.t || "#132175" }}
                        dangerouslySetInnerHTML={{ __html: getSvg(industry?.icon || ind?.icon, 24) }}
                      />
                      <div className="company-industry-body">
                        <b>{industry?.name || ind?.name || ""}</b>
                        <span>{industry?.tag || ind?.tag || ""}</span>
                        <p>{industry?.body || ind?.body || ""}</p>
                      </div>
                    </>
                  );
                  return ind?.id && onSelectItem ? (
                    <ItemHit
                      key={ind.id}
                      active={itemActive(String(ind.id))}
                      onClick={() => pickItem("industries", ind)}
                      className="ws-card company-industry-proof"
                    >
                      {cardBody}
                    </ItemHit>
                  ) : (
                    <div key={ind.id || i} className="ws-card company-industry-proof">{cardBody}</div>
                  );
                })}
              </div>
            </div>
          </section>
        </Hit>

        {/* Offices */}
        <Hit id="offices" active={activeBlockId === "offices"} onClick={() => onSelectBlock("offices")}>
          <section className="company-section company-offices-c">
            <div className="company-container">
              <span className="eyebrow">{u("globalPresence", locale)}</span>
              <h2 className="ws-h2" style={{ marginTop: 18, marginBottom: 36 }} dangerouslySetInnerHTML={{ __html: UI.officesTitleHtml[locale] || UI.officesTitleHtml.en }} />
              <div className="company-offices-grid">
                {offices.map((o: any, i: number) => {
                  if (!o || typeof o !== "object") return null;
                  const office = localizeItem(o, locale);
                  const phone = resolveOfficePhone(o, companyFacts);
                  const imgSrc = resolveAdminImageSrc(office.image);
                  const cardBody = (
                    <>
                      <div className="ws-placeholder-office company-office-visual">
                        <div className="company-office-map-layer" aria-hidden="true">
                          <span className="company-map-route" />
                          <span className="company-map-pin company-map-pin-main" />
                          <span className="company-map-pin company-map-pin-sub" />
                          <span className="company-map-label">{office.country}</span>
                        </div>
                        {hasUsableImage(office.image) && imgSrc && (
                          <img className="company-office-image" src={imgSrc} alt={office.country || ""} loading="lazy" />
                        )}
                      </div>
                      <div className="company-office-body">
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div className="ws-icbox" style={{ flex: "0 0 auto", color: "var(--ws-teal)" }}>
                            <SvgIcon name="pin" size={22} />
                          </div>
                          <b style={{ fontSize: 18, fontWeight: 700, color: "var(--ws-ink)" }}>{office.country}</b>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 15, color: "var(--ws-body)", fontWeight: 600 }}>
                          {phone && (
                            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ display: "inline-flex", color: "var(--ws-muted)", flex: "0 0 auto" }}><SvgIcon name="phone" size={16} /></span>
                              <span>{phone}</span>
                            </span>
                          )}
                          {office.email && (
                            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ display: "inline-flex", color: "var(--ws-muted)", flex: "0 0 auto" }}><SvgIcon name="mail" size={16} /></span>
                              {office.email}
                            </span>
                          )}
                          {office.address && (
                            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ display: "inline-flex", color: "var(--ws-muted)", flex: "0 0 auto" }}><SvgIcon name="pin" size={16} /></span>
                              {office.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  );
                  return o?.id && onSelectItem ? (
                    <ItemHit
                      key={o.id}
                      active={itemActive(String(o.id))}
                      onClick={() => pickItem("offices", o)}
                      className="ws-card company-office-card"
                    >
                      {cardBody}
                    </ItemHit>
                  ) : (
                    <div key={o.id || i} className="ws-card company-office-card">{cardBody}</div>
                  );
                })}
              </div>
            </div>
          </section>
        </Hit>

        {/* CTA */}
        <Hit id="cta" active={activeBlockId === "cta"} onClick={() => onSelectBlock("cta")}>
          <section className="company-section company-cta-c" style={{ paddingTop: 0 }}>
            <div className="company-container company-cta-inner" style={{ background: "linear-gradient(135deg, var(--ws-hero-1), var(--ws-hero-2))", borderRadius: 24, color: "#ffffff" }}>
              <div>
                <span className="eyebrow" style={{ color: "var(--ws-teal)" }}>{t("ctaEyebrow", u("workWithUs", locale))}</span>
                <h2
                  style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.6rem)", fontWeight: 700, color: "#fff", letterSpacing: "-.02em", lineHeight: 1.1, marginTop: 18, maxWidth: 680, textWrap: "balance" }}
                  dangerouslySetInnerHTML={{ __html: sectionTitle(pageContent, "ctaTitle", locale, UI.ctaTitleHtml[locale] || UI.ctaTitleHtml.en) }}
                />
                <p style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,.68)", marginTop: 16, maxWidth: 520 }}>
                  {t("ctaLead", u("workWithUsLead", locale))}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 28, fontSize: 15, color: "rgba(255,255,255,.7)", fontWeight: 600 }}>
                  {contactOffices.filter((office) => office.phone).map((office) => (
                    <span key={office.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ display: "inline-flex", flex: "0 0 auto" }}><SvgIcon name="phone" size={16} /></span>
                      <span>{office.country}: {office.phone}</span>
                    </span>
                  ))}
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "inline-flex", flex: "0 0 auto" }}><SvgIcon name="mail" size={16} /></span>
                    {companyFacts.email || "info@willowsoft.co"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: "0 0 auto" }}>
                <span className="ws-btn ws-btn-light">{u("startProject", locale)}</span>
                <span className="ws-btn ws-btn-ghost">{u("getInTouch", locale)}</span>
              </div>
            </div>
          </section>
        </Hit>
      </main>
    </MirrorShell>
  );
}
