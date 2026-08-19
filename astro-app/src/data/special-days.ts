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
      en: { title: "HONORING THE REPUBLIC", accent: "Republic Day of Türkiye", subline: "Celebrating freedom, unity, and endless progress — WillowSoft" },
      tr: { title: "BAĞIMSIZLIK VE GURURLA", accent: "Cumhuriyet Bayramımız Kutlu Olsun", subline: "Mustafa Kemal Atatürk ve kahramanlarımızı minnetle anıyoruz — WillowSoft" },
      de: { title: "IN EHRE UND VERBUNDENHEIT", accent: "Tag der Republik Türkiye", subline: "Wir gratulieren dem türkischen Volk von Herzen — WillowSoft" },
      fr: { title: "HONNEUR ET LIBERTÉ", accent: "Fête de la République de Turquie", subline: "Nous célébrons l'unité et la liberté — WillowSoft" },
      es: { title: "CON HONOR Y ORGULLO", accent: "Día de la República de Turquía", subline: "Celebrando la libertad y el progreso — WillowSoft" },
      it: { title: "CON ONORE E ORGOGLIO", accent: "Festa della Repubblica di Turchia", subline: "Festeggiamo la libertà e l'unità — WillowSoft" },
      ar: { title: "فخر وعزة واستقلال", accent: "عيد الجمهورية التركية", subline: "نهنئ الشعب التركي بهذه المناسبة العظيمة — WillowSoft" },
      ja: { title: "誇りと自由を胸に", accent: "トルコ共和国記念日", subline: "平和と進歩を共に願って — WillowSoft" },
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
      en: { title: "FOR OUR FUTURE & CHILDREN", accent: "National Sovereignty & Children's Day", subline: "Building a brighter tomorrow together — WillowSoft" },
      tr: { title: "GELECEĞİMİZİN GÜVENCESİ ÇOCUKLARIMIZA", accent: "23 Nisan Ulusal Egemenlik ve Çocuk Bayramı", subline: "Egemenlik kayıtsız şartsız milletindir — WillowSoft" },
      de: { title: "FÜR UNSERE ZUKUNFT UND KINDER", accent: "Tag der nationalen Souveränität", subline: "Gemeinsam für eine bessere Zukunft — WillowSoft" },
      fr: { title: "POUR NOTRE AVENIR ET NOS ENFANTS", accent: "Fête de la Souveraineté Nationale", subline: "Un avenir brillant pour les générations futures — WillowSoft" },
      es: { title: "POR NUESTRO FUTURO Y LOS NIÑOS", accent: "Día de la Soberanía Nacional", subline: "Construyendo un mañana brillante — WillowSoft" },
      it: { title: "PER IL NOSTRO FUTURO E I BAMBINI", accent: "Festa della Sovranità Nazionale", subline: "Costruendo insieme un domani migliore — WillowSoft" },
      ar: { title: "من أجل مستقبل أطفالنا", accent: "عيد السيادة الوطنية والطفل", subline: "نبني مستقبلاً مشرقاً معاً — WillowSoft" },
      ja: { title: "未来を担う子どもたちへ", accent: "国家主権と子供の日", subline: "明るい未来を共に作ります — WillowSoft" },
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
      en: { title: "YOUTH, ENTHUSIASM & PROGRESS", accent: "Atatürk, Youth and Sports Day", subline: "Honoring the spark of national liberation — WillowSoft" },
      tr: { title: "GENÇLİK VE ANADOLU'NUN UYANIŞI", accent: "19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı", subline: "Kurtuluş meşalesinin yakıldığı gün kutlu olsun — WillowSoft" },
      de: { title: "JUGEND UND FORTSCHRITT", accent: "Tag der Jugend und des Sports", subline: "Im Gedenken an den Befreiungskampf — WillowSoft" },
      fr: { title: "JEUNESSE ET PROGRÈS", accent: "Fête de la Jeunesse et des Sports", subline: "En mémoire de l'éveil national — WillowSoft" },
      es: { title: "JUVENTUD Y PROGRESO", accent: "Día de la Juventud y el Deporte", subline: "Honrando el espíritu de la emancipación — WillowSoft" },
      it: { title: "GIOVENTÙ E PROGRESSO", accent: "Festa della Gioventù e dello Sport", subline: "In memoria del riscatto nazionale — WillowSoft" },
      ar: { title: "عزيمة الشباب والتقدم", accent: "عيد ذكرى أتاتورك والشباب والرياضة", subline: "نحتفي بهمة الشباب وبناء المستقبل — WillowSoft" },
      ja: { title: "若き情熱と進歩", accent: "アタテュルク記念・青年とスポーツの日", subline: "未来への希望を共に祝います — WillowSoft" },
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
      en: { title: "DESTINY & TRIUMPH", accent: "30th of August Victory Day", subline: "Saluting the heroic triumph of freedom — WillowSoft" },
      tr: { title: "ŞANLI ZAFERİN 104. YILINDA", accent: "30 Ağustos Zafer Bayramımız Kutlu Olsun", subline: "Kahraman ordumuzu ve aziz şehitlerimizi rahmetle anıyoruz — WillowSoft" },
      de: { title: "IN Gedenken an den Sieg", accent: "Tag des Sieges der Republik Türkiye", subline: "Ehre dem Heldenmut und der Freiheit — WillowSoft" },
      fr: { title: "TRIOMPHE ET LIBERTÉ", accent: "Fête de la Victoire de Turquie", subline: "Hommage au courage et à l'indépendance — WillowSoft" },
      es: { title: "TRIUNFO Y LIBERTAD", accent: "Día de la Victoria", subline: "Rindiendo homenaje al valor histórico — WillowSoft" },
      it: { title: "TRIONFO E LIBERTÀ", accent: "Festa della Vittoria", subline: "Onore al coraggio e alla determinazione — WillowSoft" },
      ar: { title: "نصر مجيد واستقلال", accent: "عيد النصر في تركيا", subline: "نُحيي شجاعة البطولة وتاريخ الاستقلال — WillowSoft" },
      ja: { title: "栄光と勝利の記憶", accent: "トルコ戦勝記念日", subline: "自由と勇気に敬意を表して — WillowSoft" },
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
      en: { title: "LIBERTY, HONOR & UNITY", accent: "Happy 4th of July Independence Day", subline: "Wishing a joyful and glorious celebration — WillowSoft" },
      tr: { title: "ÖZGÜRLÜK VE BAĞIMSIZLIKLA", accent: "Amerika Bağımsızlık Günü Kutlu Olsun", subline: "Amerikan halkının bu coşkulu gününü kutluyoruz — WillowSoft" },
      de: { title: "IN FREIHEIT UND EINHEIT", accent: "Frohen 4. Juli Unabhängigkeitstag", subline: "Wir wünschen eine glanzvolle Feier — WillowSoft" },
      fr: { title: "LIBERTÉ ET INDÉPENDANCE", accent: "Joyeux 4 Juillet", subline: "Souhaitant une belle journée d'indépendance — WillowSoft" },
      es: { title: "LIBERTAD Y UNIDAD", accent: "Feliz 4 de Julio", subline: "Deseando una gloriosa celebración — WillowSoft" },
      it: { title: "LIBERTÀ E UNIONE", accent: "Buon 4 Luglio", subline: "Augurando una splendida festa dell'indipendenza — WillowSoft" },
      ar: { title: "حرية واستقلال ووحدة", accent: "عيد الاستقلال الأمريكي المبارك", subline: "نتمنى للشعب الأمريكي احتفالاً مجيداً — WillowSoft" },
      ja: { title: "自由と栄光を胸に", accent: "インデペンデンス・デイ（独立記念日）", subline: "素晴らしい7月4日をお過ごしください — WillowSoft" },
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
      de: { title: "IN EINIGKEIT UND RECHT UND FREIHEIT", accent: "Tag der Deutschen Einheit", subline: "Wir wünschen allen Bürgerinnen und Bürgern einen friedvollen Festtag — WillowSoft" },
      en: { title: "IN UNITY & FREEDOM", accent: "German Unity Day", subline: "Honoring the historic spirit of German unification — WillowSoft" },
      tr: { title: "BİRLİK, ADALET VE ÖZGÜRLÜKLE", accent: "Almanya Birlik Günü Kutlu Olsun", subline: "Alman halkının bu tarihi gününü yürekten kutluyoruz — WillowSoft" },
      fr: { title: "UNITÉ ET DÉMOCRATIE", accent: "Journée de l'Unité Allemande", subline: "Hommage au rapprochement des peuples — WillowSoft" },
      es: { title: "EN UNIDAD Y LIBERTAD", accent: "Día de la Unidad Alemana", subline: "Celebrando la historia y el futuro común — WillowSoft" },
      it: { title: "IN UNITÀ E LIBERTÀ", accent: "Giornata dell'Unità Tedesca", subline: "Onorando lo spirito di unione e pace — WillowSoft" },
      ar: { title: "وحدة وعدالة وحرية", accent: "يوم الوحدة الألمانية المبارك", subline: "نهنئ الشعب الألماني بهذه الذكرى التاريخية — WillowSoft" },
      ja: { title: "統一と平和の誓い", accent: "ドイツ統一記念日", subline: "歴史と未来を共にお祝い申し上げます — WillowSoft" },
    },
  },

  // ── Portugal ────────────────────────────────────────────────────────────
  {
    id: "pt-portugal-day",
    countries: ["PT"],
    date: { type: "fixed", month: 6, day: 10 },
    style: "fireworks",
    accentColor: "#DA020E",
    secondaryColor: "#046A38",
    flag: "pt",
    greeting: {
      pt: { title: "COM ORGULHO E TRADIÇÃO", accent: "Dia de Portugal, de Camões e das Comunidades", subline: "Honrando a nossa história, língua e cultura no mundo — WillowSoft" },
      en: { title: "HONORING HERITAGE & CULTURE", accent: "Portugal Day & Global Communities", subline: "Celebrating Portuguese legacy across the globe — WillowSoft" },
      tr: { title: "KÜLTÜR VE TARİH GURURUYLA", accent: "Portekiz ve Portekiz Toplulukları Günü", subline: "Portekiz halkının bu anlamlı gününü kutluyoruz — WillowSoft" },
      de: { title: "IN KULTUR UND TRADITION", accent: "Tag Portugals und der Gemeinschaften", subline: "Wir ehren die reiche Geschichte Portugals — WillowSoft" },
      fr: { title: "HONNEUR À LA CULTURE", accent: "Journée du Portugal et des Communautés", subline: "Célébrant l'héritage portugais dans le monde — WillowSoft" },
      es: { title: "CON ORGULLO Y TRADICIÓN", accent: "Día de Portugal y de las Comunidades", subline: "Honrando la historia y la cultura portuguesa — WillowSoft" },
      it: { title: "CON ORGOGLIO E TRADIZIONE", accent: "Giornata del Portogallo e delle Comunità", subline: "Onorando la storia e la cultura portoghese — WillowSoft" },
      ar: { title: "فخر بالتاريخ والثقافة", accent: "اليوم الوطني للبرتغال والجاليات", subline: "نحتفي بالحضارة البرتغالية العريقة حول العالم — WillowSoft" },
      ja: { title: "伝統と誇りを世界へ", accent: "ポルトガル・カモンイス・コミュニティの日", subline: "豊かで誇り高き歴史を共にお祝いいたします — WillowSoft" },
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
      ar: { title: "دام عزّك يا وطن", accent: "اليوم الوطني السعودي الـ ٩٣", subline: "نشارك المملكة وشعبها الكريم الفخر والاعتزاز — WillowSoft" },
      en: { title: "HONORING HERITAGE & VISION", accent: "Saudi National Day", subline: "Celebrating prosperity, pride, and progress with Saudi Arabia — WillowSoft" },
      tr: { title: "GURUR VE KUTLU GELECEKLE", accent: "Suudi Arabistan Ulusal Günü", subline: "Dost ve kardeş Suudi halkının ulusal bayramını kutluyoruz — WillowSoft" },
      de: { title: "IN EHRE UND ZUKUNFTSVISION", accent: "Saudischer Nationalfeiertag", subline: "Wir wünschen dem saudischen Volk Wohlstand und Frieden — WillowSoft" },
      fr: { title: "FIERTÉ ET VISION D'AVENIR", accent: "Fête Nationale Saoudienne", subline: "Célébrant la prospérité et le prestige du Royaume — WillowSoft" },
      es: { title: "CON ORGULLO Y VISIÓN", accent: "Día Nacional de Arabia Saudita", subline: "Celebrando la prosperidad y el legado histórico — WillowSoft" },
      it: { title: "CON ORGOGLIO E VISIONE", accent: "Festa Nazionale Saudita", subline: "Celebriamo la prosperità e il prestigio del Regno — WillowSoft" },
      ja: { title: "栄光と未来へのビジョン", accent: "サウジアラビア建国記念日", subline: "サウジアラビアの繁栄と平和を心よりお祝い申し上げます — WillowSoft" },
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
      fr: { title: "LIBERTÉ, ÉGALITÉ, FRATERNITÉ", accent: "Fête Nationale du 14 Juillet", subline: "Vive la République et vive la France — WillowSoft" },
      en: { title: "LIBERTY, EQUALITY, FRATERNITY", accent: "French Bastille Day", subline: "Wishing France a joyous and vibrant National Day — WillowSoft" },
      tr: { title: "ÖZGÜRLÜK VE EŞİTLİKLE", accent: "Fransa Ulusal Günü (Bastille)", subline: "Fransız halkının ulusal bayramını kutluyoruz — WillowSoft" },
      de: { title: "FREIHEIT UND GLEICHHEIT", accent: "Französischer Nationalfeiertag", subline: "Alles Gute zum 14. Juli — WillowSoft" },
      es: { title: "LIBERTAD E IGUALDAD", accent: "Día Nacional de Francia", subline: "¡Viva la República y viva Francia! — WillowSoft" },
      it: { title: "LIBERTÀ ED UGUAGLIANZA", accent: "Festa Nazionale Francese", subline: "Viva la Repubblica e viva la Francia! — WillowSoft" },
      ar: { title: "حرية ومساواة وإخاء", accent: "عيد الباستيل الوطني الفرنسي", subline: "تحيا الجمهورية وتحيا فرنسا — WillowSoft" },
      ja: { title: "自由・平等・友愛の精神", accent: "パリ祭（フランス革命記念日）", subline: "フランスの祝祭を共にお祝い申し上げます — WillowSoft" },
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
      it: { title: "CON ORGOGLIO E PASSIONE", accent: "Festa della Repubblica Italiana", subline: "Celebriamo insieme la storia, la cultura e il futuro dell'Italia — WillowSoft" },
      en: { title: "HONORING HISTORY & PASSION", accent: "Italian Republic Day", subline: "Celebrating the rich culture and heritage of Italy — WillowSoft" },
      tr: { title: "GURUR VE KÜLTÜREL MİRASLA", accent: "İtalya Cumhuriyet Bayramı", subline: "İtalyan halkının bu anlamlı gününü kutluyoruz — WillowSoft" },
      de: { title: "IN EHRE UND LEIDENSCHAFT", accent: "Tag der Italienischen Republik", subline: "Wir feiern die Kultur und Geschichte Italiens — WillowSoft" },
      fr: { title: "AVEC FIERTÉ ET PASSION", accent: "Fête de la République Italienne", subline: "Célébrant l'histoire et l’avenir de l'Italie — WillowSoft" },
      es: { title: "CON ORGULLO Y PASIÓN", accent: "Fiesta de la República Italiana", subline: "Celebrando la historia y el arte de Italia — WillowSoft" },
      ar: { title: "فخر بالتاريخ والثقافة", accent: "عيد الجمهورية الإيطالية", subline: "نحتفل بالحضارة والفن الإيطالي العريق — WillowSoft" },
      ja: { title: "歴史と情熱を誇りに", accent: "イタリア共和国記念日", subline: "イタリアの文化と未来を共に祝します — WillowSoft" },
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
      es: { title: "CON ORGULLO Y HISPANIDAD", accent: "Fiesta Nacional de España", subline: "Celebrando nuestra historia, cultura y fraternidad — WillowSoft" },
      en: { title: "HONORING SPANISH HERITAGE", accent: "Fiesta Nacional de España", subline: "Celebrating Spain's vibrant culture worldwide — WillowSoft" },
      tr: { title: "GURUR VE HİSPANİK MİRASLA", accent: "İspanya Ulusal Günü", subline: "İspanyol halkının bu gururlu gününü kutluyoruz — WillowSoft" },
      de: { title: "IN TRADITION UND STOLZ", accent: "Spanischer Nationalfeiertag", subline: "Wir feiern die reiche Kultur Spaniens — WillowSoft" },
      fr: { title: "AVEC FIERTÉ ET TRADITION", accent: "Fête Nationale d'Espagne", subline: "Célébrant la richesse culturelle de l'Espagne — WillowSoft" },
      it: { title: "CON ORGOGLIO E TRADIZIONE", accent: "Festa Nazionale Spagnola", subline: "Festeggiamo la ricca cultura spagnola — WillowSoft" },
      ar: { title: "فخر بالتاريخ والتراث", accent: "اليوم الوطني الإسباني", subline: "نحتفي بالحضارة والثقافة الإسبانية العريقة — WillowSoft" },
      ja: { title: "誇りと多様性の文化", accent: "スペイン建国記念日", subline: "スペインの歴史と文化を共にお祝いいたします — WillowSoft" },
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
      ja: { title: "伝統と誇りを胸に", accent: "建国記念の日", subline: "日本の豊かな歴史と未来を共にお祝い申し上げます — WillowSoft" },
      en: { title: "HONORING TRADITION & FUTURE", accent: "Japan National Foundation Day", subline: "Celebrating Japan's rich legacy and innovation — WillowSoft" },
      tr: { title: "GELENEK VE GELECEKLE", accent: "Japonya Kuruluş Günü", subline: "Japon halkının köklü tarihini ve geleceğini kutluyoruz — WillowSoft" },
      de: { title: "IN TRADITION UND ZUKUNFT", accent: "Gründungstag Japans", subline: "Wir ehren die reiche Geschichte Japans — WillowSoft" },
      fr: { title: "TRADITION ET INNOVATION", accent: "Fête de la Fondation du Japon", subline: "Célébrant le patrimoine et l'avenir du Japon — WillowSoft" },
      es: { title: "TRADICIÓN Y FUTURO", accent: "Día de la Fundación Nacional de Japón", subline: "Celebrando el rico legado histórico de Japón — WillowSoft" },
      it: { title: "TRADIZIONE E INNOVAZIONE", accent: "Giorno della Fondazione del Giappone", subline: "Celebrando la ricca eredità storica del Giappone — WillowSoft" },
      ar: { title: "عراقة التقاليد والمستقبل", accent: "عيد تأسيس اليابان الوطني", subline: "نحتفي بالحضارة والابتكار الياباني العريق — WillowSoft" },
    },
  },

  // ── Qatar ───────────────────────────────────────────────────────────────
  {
    id: "qa-national-day",
    countries: ["QA"],
    date: { type: "fixed", month: 12, day: 18 },
    style: "fireworks",
    accentColor: "#8A1538",
    secondaryColor: "#FFFFFF",
    flag: "qa",
    greeting: {
      ar: { title: "فخر ورفعة وإنجاز", accent: "اليوم الوطني لقطر", subline: "نهنئ دولة قطر وشعبها العزيز بمسيرة النجاح والازدهار — WillowSoft" },
      en: { title: "HONORING PROGRESS & HERITAGE", accent: "Qatar National Day", subline: "Celebrating Qatar's remarkable journey and vision — WillowSoft" },
      tr: { title: "GURUR VE İLERLEMEYLE", accent: "Katar Ulusal Günü", subline: "Katar halkının bu gururlu gününü yürekten kutluyoruz — WillowSoft" },
      de: { title: "IN EHRE UND FORTSCHRITT", accent: "Katarischer Nationalfeiertag", subline: "Wir wünschen dem Land Frieden und Wohlstand — WillowSoft" },
      fr: { title: "FIERTÉ ET PROGRÈS", accent: "Fête Nationale du Qatar", subline: "Célébrant la réussite et l'avenir du Qatar — WillowSoft" },
      es: { title: "CON ORGULLO Y PROGRESO", accent: "Día Nacional de Catar", subline: "Celebrando el legado y la visión del futuro — WillowSoft" },
      it: { title: "CON ORGOGLIO E PROGRESSO", accent: "Festa Nazionale del Qatar", subline: "Celebriamo il successo e la visione del futuro — WillowSoft" },
      ja: { title: "繁栄と進歩の誇り", accent: "カタール建国記念日", subline: "カタールの素晴らしい発展を共にお祝いいたします — WillowSoft" },
    },
  },

  // ── United Arab Emirates ────────────────────────────────────────────────
  {
    id: "ae-national-day",
    countries: ["AE"],
    date: { type: "fixed", month: 12, day: 2 },
    style: "fireworks",
    accentColor: "#FF0000",
    secondaryColor: "#00732F",
    flag: "ae",
    greeting: {
      ar: { title: "روح الاتحاد والافتخار", accent: "اليوم الوطني لإمارات الخير الـ ٥٢", subline: "نهنئ دولة الإمارات قيادة وشعباً بمسيرة الإنجازات العظيمة — WillowSoft" },
      en: { title: "SPIRIT OF THE UNION", accent: "UAE National Day", subline: "Celebrating innovation, unity, and prosperity with the UAE — WillowSoft" },
      tr: { title: "BİRLİK VE İNOVASYONLA", accent: "Birleşik Arap Emirlikleri Ulusal Günü", subline: "BAE halkının birlik bayramını kutluyoruz — WillowSoft" },
      de: { title: "GEIST DER EINHEIT", accent: "Nationalfeiertag der VAE", subline: "Wir feiern Innovation und Fortschritt — WillowSoft" },
      fr: { title: "ESPRIT D'UNION ET D'INNOVATION", accent: "Fête Nationale des Émirats", subline: "Célébrant le progrès et l'unité des Émirats — WillowSoft" },
      es: { title: "ESPÍRITU DE UNIÓN", accent: "Día Nacional de los Emiratos Árabes", subline: "Celebrando la innovación y la prosperidad — WillowSoft" },
      it: { title: "SPIRITO DI UNIONE", accent: "Festa Nazionale degli Emirati Arabi", subline: "Celebriamo l'innovazione e la prosperità — WillowSoft" },
      ja: { title: "連邦の精神と革新", accent: "UAE（アラブ首長国連邦）建国記念日", subline: "さらなる発展と繁栄を心よりお祝い申し上げます — WillowSoft" },
    },
  },
];
