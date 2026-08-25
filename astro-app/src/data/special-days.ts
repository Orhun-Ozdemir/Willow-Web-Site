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
      en: { title: "THE REPUBLIC IN OUR HEARTS, THE FUTURE IN OUR SIGHTS", accent: "Happy Republic Day of Türkiye", subline: "With respect and gratitude, we remember Gazi Mustafa Kemal Atatürk and all the heroes of the Republic — WillowSoft" },
      tr: { title: "GELECEĞE TAŞINAN BİR MİRAS", accent: "29 Ekim Cumhuriyet Bayramımız Kutlu Olsun", subline: "Gazi Mustafa Kemal Atatürk’ü ve Cumhuriyetimizin tüm kahramanlarını saygı ve minnetle anıyoruz — WillowSoft" },
      de: { title: "DIE REPUBLIK IM HERZEN, DIE ZUKUNFT IM BLICK", accent: "Herzliche Glückwünsche zum Tag der Republik", subline: "Mit Respekt und Dankbarkeit erinnern wir an Gazi Mustafa Kemal Atatürk und die Helden der Republik — WillowSoft" },
      fr: { title: "LA RÉPUBLIQUE AU CŒUR, L’AVENIR EN PERSPECTIVE", accent: "Bonne fête de la République de Turquie", subline: "Nous rendons hommage, avec respect et gratitude, à Gazi Mustafa Kemal Atatürk et aux héros de la République — WillowSoft" },
      es: { title: "LA REPÚBLICA EN EL CORAZÓN, EL FUTURO EN LA MIRADA", accent: "Feliz Día de la República de Turquía", subline: "Recordamos con respeto y gratitud a Gazi Mustafa Kemal Atatürk y a los héroes de la República — WillowSoft" },
      it: { title: "LA REPUBBLICA NEL CUORE, LO SGUARDO AL FUTURO", accent: "Buona Festa della Repubblica di Turchia", subline: "Ricordiamo con rispetto e gratitudine Gazi Mustafa Kemal Atatürk e gli eroi della Repubblica — WillowSoft" },
      ar: { title: "الجمهورية في قلوبنا والمستقبل أمامنا", accent: "كل عام وتركيا بخير في عيد الجمهورية", subline: "نستذكر غازي مصطفى كمال أتاتورك وأبطال الجمهورية بكل احترام وامتنان — WillowSoft" },
      ja: { title: "共和国への誇りを、未来へ", accent: "トルコ共和国記念日を祝して", subline: "ムスタファ・ケマル・アタテュルクと共和国の歩みを支えたすべての方々に、敬意と感謝を表します — WillowSoft" },
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
      en: { title: "THE FUTURE BEGINS WITH CHILDREN", accent: "Happy National Sovereignty and Children’s Day", subline: "Here’s to every child’s curiosity, imagination, and dreams for a brighter tomorrow — WillowSoft" },
      tr: { title: "UMUT, HER ÇOCUKLA BÜYÜR", accent: "23 Nisan Ulusal Egemenlik ve Çocuk Bayramı Kutlu Olsun", subline: "Tüm çocukların merakını, hayallerini ve aydınlık bir gelecek kurma hakkını yürekten kutluyoruz — WillowSoft" },
      de: { title: "KINDER SIND UNSERE ZUKUNFT", accent: "Alles Gute zum Fest der Nationalen Souveränität und des Kindes", subline: "Auf die Neugier, die Fantasie und die Träume aller Kinder — WillowSoft" },
      fr: { title: "L’AVENIR APPARTIENT AUX ENFANTS", accent: "Bonne fête de la Souveraineté nationale et des Enfants", subline: "Célébrons leur curiosité, leur imagination et leurs rêves d’un avenir meilleur — WillowSoft" },
      es: { title: "EL FUTURO EMPIEZA CON LA INFANCIA", accent: "Feliz Día de la Soberanía Nacional y la Infancia", subline: "Por la curiosidad, la imaginación y los sueños de todos los niños — WillowSoft" },
      it: { title: "IL FUTURO COMINCIA DAI BAMBINI", accent: "Buona Festa della Sovranità Nazionale e dei Bambini", subline: "Alla curiosità, alla fantasia e ai sogni di ogni bambino — WillowSoft" },
      ar: { title: "الأمل يكبر مع كل طفل", accent: "كل عام وأنتم بخير بمناسبة عيد السيادة الوطنية والطفل", subline: "نحتفي بفضول كل طفل وخياله وحقه في المساهمة في بناء مستقبل أكثر إشراقًا — WillowSoft" },
      ja: { title: "子どもたちの笑顔が、未来をつくる", accent: "国家主権と子どもの日を祝して", subline: "一人ひとりの好奇心と想像力、そして大きな夢を応援します — WillowSoft" },
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
      en: { title: "YOUTHFUL ENERGY, ENDURING HOPE", accent: "Commemoration of Atatürk, Youth and Sports Day", subline: "We remember the first step toward independence and celebrate the young people shaping tomorrow — WillowSoft" },
      tr: { title: "GENÇLİĞİN CESARETİ, YARININ UMUDU", accent: "19 Mayıs Atatürk’ü Anma, Gençlik ve Spor Bayramı Kutlu Olsun", subline: "Millî Mücadele’nin ilk adımını saygıyla anıyor, gençlerin enerjisini ve geleceğe olan inancını kutluyoruz — WillowSoft" },
      de: { title: "JUNGE KRAFT, GROSSE ZUKUNFT", accent: "Atatürk-Gedenktag, Tag der Jugend und des Sports", subline: "Wir erinnern an den Aufbruch in die Unabhängigkeit und würdigen die junge Generation, die unsere Zukunft gestaltet — WillowSoft" },
      fr: { title: "L’ÉLAN DE LA JEUNESSE, L’ESPOIR DE DEMAIN", accent: "Commémoration d’Atatürk, fête de la Jeunesse et des Sports", subline: "Nous commémorons le premier pas vers l’indépendance et saluons la jeunesse qui construit l’avenir — WillowSoft" },
      es: { title: "JUVENTUD QUE INSPIRA EL MAÑANA", accent: "Conmemoración de Atatürk, Día de la Juventud y el Deporte", subline: "Recordamos el primer paso hacia la independencia y reconocemos a los jóvenes que construyen el futuro — WillowSoft" },
      it: { title: "L’ENERGIA DEI GIOVANI, LA FORZA DEL DOMANI", accent: "Commemorazione di Atatürk, Festa della Gioventù e dello Sport", subline: "Ricordiamo il primo passo verso l’indipendenza e rendiamo omaggio ai giovani che costruiscono il futuro — WillowSoft" },
      ar: { title: "شجاعة الشباب وأمل الغد", accent: "كل عام وأنتم بخير في ذكرى أتاتورك وعيد الشباب والرياضة", subline: "نستذكر انطلاقة الكفاح الوطني ونحتفي بطاقة الشباب وإيمانهم بالمستقبل — WillowSoft" },
      ja: { title: "若い力が、未来をひらく", accent: "アタテュルク記念・青年とスポーツの日", subline: "独立への第一歩を心に刻み、明日を担う若い世代にエールを送ります — WillowSoft" },
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
      en: { title: "VICTORY REMEMBERED, COURAGE HONORED", accent: "Happy 30 August Victory Day", subline: "We honor Gazi Mustafa Kemal Atatürk, his comrades-in-arms, and the heroes of the struggle for independence — WillowSoft" },
      tr: { title: "MİNNETLE HATIRLANAN BİR ZAFER", accent: "30 Ağustos Zafer Bayramımız Kutlu Olsun", subline: "Gazi Mustafa Kemal Atatürk’ü, silah arkadaşlarını ve bağımsızlık mücadelemizin tüm kahramanlarını saygıyla anıyoruz — WillowSoft" },
      de: { title: "SIEG IN ERINNERUNG, MUT IN EHREN", accent: "Tag des Sieges am 30. August", subline: "Wir gedenken Gazi Mustafa Kemal Atatürks, seiner Mitstreiter und der Helden des Unabhängigkeitskampfes — WillowSoft" },
      fr: { title: "SE SOUVENIR DE LA VICTOIRE, HONORER LE COURAGE", accent: "Fête de la Victoire du 30 août", subline: "Hommage à Gazi Mustafa Kemal Atatürk, à ses compagnons d’armes et aux héros de l’indépendance — WillowSoft" },
      es: { title: "RECORDAR LA VICTORIA, HONRAR EL VALOR", accent: "Día de la Victoria del 30 de agosto", subline: "Rendimos homenaje a Gazi Mustafa Kemal Atatürk, a sus compañeros y a los héroes de la independencia — WillowSoft" },
      it: { title: "RICORDARE LA VITTORIA, ONORARE IL CORAGGIO", accent: "Festa della Vittoria del 30 agosto", subline: "Rendiamo omaggio a Gazi Mustafa Kemal Atatürk, ai suoi compagni e agli eroi dell’indipendenza — WillowSoft" },
      ar: { title: "نصرٌ نستذكره بكل امتنان", accent: "كل عام وأنتم بخير بمناسبة عيد النصر في 30 أغسطس", subline: "نستذكر غازي مصطفى كمال أتاتورك ورفاقه وكل أبطال الكفاح من أجل الاستقلال بكل احترام — WillowSoft" },
      ja: { title: "勝利を記憶し、勇気をたたえる", accent: "8月30日 戦勝記念日", subline: "ムスタファ・ケマル・アタテュルクと戦友、独立に尽くしたすべての方々に敬意を表します — WillowSoft" },
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
      en: { title: "CELEBRATING THE SPIRIT OF INDEPENDENCE", accent: "Happy Fourth of July", subline: "Warm wishes to everyone celebrating a day of freedom, unity, and shared hope — WillowSoft" },
      tr: { title: "BAĞIMSIZLIK RUHU, ORTAK BİR UMUT", accent: "4 Temmuz Bağımsızlık Günü Kutlu Olsun", subline: "Bu anlamlı günü kutlayan herkese özgürlük, birlik ve umut dolu bir gelecek diliyoruz — WillowSoft" },
      de: { title: "FREIHEIT, DIE VERBINDET", accent: "Happy Fourth of July", subline: "Wir wünschen allen, die heute feiern, einen schönen Independence Day — WillowSoft" },
      fr: { title: "LA LIBERTÉ NOUS RASSEMBLE", accent: "Joyeux 4 Juillet", subline: "Belle fête à toutes celles et ceux qui célèbrent aujourd’hui la liberté et l’unité — WillowSoft" },
      es: { title: "CELEBRAMOS EL ESPÍRITU DE LA INDEPENDENCIA", accent: "Feliz Cuatro de Julio", subline: "Nuestros mejores deseos para quienes celebran esta jornada de libertad, unidad y esperanza compartida — WillowSoft" },
      it: { title: "CELEBRIAMO LO SPIRITO DELL’INDIPENDENZA", accent: "Buon Quattro Luglio", subline: "I nostri migliori auguri a chi celebra questa giornata di libertà, unità e speranza condivisa — WillowSoft" },
      ar: { title: "نحتفي بروح الاستقلال", accent: "كل عام وأنتم بخير بمناسبة الرابع من يوليو", subline: "أطيب التمنيات لكل من يحتفل بيوم يجمع قيم الحرية والوحدة والأمل المشترك — WillowSoft" },
      ja: { title: "自由を祝い、心をひとつに", accent: "7月4日 独立記念日", subline: "この日を祝う皆さまに、心からお祝いを申し上げます — WillowSoft" },
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
      en: { title: "TOGETHER, WE SHAPE THE FUTURE", accent: "Happy German Unity Day", subline: "Here’s to unity, democracy, and a future built together — WillowSoft" },
      tr: { title: "ORTAK GELECEĞİ KURAN BİRLİK", accent: "Almanya Birlik Günü Kutlu Olsun", subline: "Birliğin, demokrasinin ve birlikte inşa edilen bir geleceğin gücünü kutluyoruz — WillowSoft" },
      de: { title: "GEMEINSAM ZUKUNFT GESTALTEN", accent: "Alles Gute zum Tag der Deutschen Einheit", subline: "Auf Einheit, Demokratie und eine Zukunft, die wir gemeinsam gestalten — WillowSoft" },
      fr: { title: "UNIS POUR CONSTRUIRE L’AVENIR", accent: "Bonne fête de l’Unité allemande", subline: "À l’unité, à la démocratie et à un avenir que nous bâtissons ensemble — WillowSoft" },
      es: { title: "LA UNIDAD QUE CONSTRUYE UN FUTURO COMÚN", accent: "Feliz Día de la Unidad Alemana", subline: "Celebramos la fuerza de la unidad, la democracia y un futuro construido entre todos — WillowSoft" },
      it: { title: "L’UNITÀ CHE COSTRUISCE UN FUTURO COMUNE", accent: "Buona Giornata dell’Unità Tedesca", subline: "Celebriamo la forza dell’unità, della democrazia e di un futuro costruito insieme — WillowSoft" },
      ar: { title: "وحدة تبني مستقبلًا مشتركًا", accent: "كل عام وأنتم بخير بمناسبة يوم الوحدة الألمانية", subline: "نحتفي بقوة الوحدة والديمقراطية وبمستقبل نصنعه معًا — WillowSoft" },
      ja: { title: "ともに歩み、ともに未来へ", accent: "ドイツ統一記念日を祝して", subline: "結束と民主主義、そして力を合わせて築く未来をたたえます — WillowSoft" },
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
      en: { title: "PORTUGAL, FELT AROUND THE WORLD", accent: "Portugal, Camões and Portuguese Communities Day", subline: "Celebrating the language, culture, and communities that carry Portugal across the globe — WillowSoft" },
      tr: { title: "DÜNYAYI BULUŞTURAN BİR KÜLTÜR", accent: "Portekiz, Camões ve Portekiz Toplulukları Günü Kutlu Olsun", subline: "Portekiz’in dilini, kültürünü ve dünyanın dört bir yanındaki topluluklarını kutluyoruz — WillowSoft" },
      de: { title: "PORTUGAL VERBINDET DIE WELT", accent: "Tag Portugals, Camões’ und der portugiesischen Gemeinschaften", subline: "Ein Fest für die portugiesische Sprache, Kultur und Gemeinschaft in aller Welt — WillowSoft" },
      fr: { title: "LE PORTUGAL RAYONNE DANS LE MONDE", accent: "Journée du Portugal, de Camões et des Communautés portugaises", subline: "Une journée pour célébrer la langue, la culture et les communautés portugaises du monde entier — WillowSoft" },
      es: { title: "UNA CULTURA QUE CONECTA AL MUNDO", accent: "Feliz Día de Portugal, de Camões y de las Comunidades Portuguesas", subline: "Celebramos la lengua, la cultura y las comunidades de Portugal en todo el mundo — WillowSoft" },
      it: { title: "UNA CULTURA CHE UNISCE IL MONDO", accent: "Buona Giornata del Portogallo, di Camões e delle Comunità Portoghesi", subline: "Celebriamo la lingua, la cultura e le comunità portoghesi nel mondo — WillowSoft" },
      ar: { title: "ثقافة تصل بين أنحاء العالم", accent: "كل عام وأنتم بخير بمناسبة يوم البرتغال وكامويس والجاليات البرتغالية", subline: "نحتفي بلغة البرتغال وثقافتها وجالياتها في مختلف أنحاء العالم — WillowSoft" },
      ja: { title: "世界に広がる、ポルトガルの心", accent: "ポルトガル・カモンイス・コミュニティの日", subline: "ポルトガルの言葉と文化、世界各地のコミュニティをたたえます — WillowSoft" },
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
      en: { title: "PROUD ROOTS, AMBITIOUS FUTURE", accent: "Happy Saudi National Day", subline: "Warm wishes to the people of Saudi Arabia for continued progress, prosperity, and peace — WillowSoft" },
      tr: { title: "KÖKLÜ MİRASTAN GELECEĞE", accent: "Suudi Arabistan Ulusal Günü Kutlu Olsun", subline: "Suudi Arabistan halkına ilerleme, refah ve barışla dolu nice yıllar diliyoruz — WillowSoft" },
      de: { title: "STOLZE WURZELN, GROSSE ZIELE", accent: "Alles Gute zum saudischen Nationalfeiertag", subline: "Den Menschen in Saudi-Arabien wünschen wir weiterhin Fortschritt, Wohlstand und Frieden — WillowSoft" },
      fr: { title: "FIERS DE NOS RACINES, TOURNÉS VERS L’AVENIR", accent: "Bonne fête nationale de l’Arabie saoudite", subline: "Tous nos vœux de progrès, de prospérité et de paix au peuple saoudien — WillowSoft" },
      es: { title: "RAÍCES EN EL LEGADO, MIRADA HACIA EL FUTURO", accent: "Feliz Día Nacional de Arabia Saudita", subline: "Nuestros mejores deseos al pueblo saudí para que continúe avanzando con prosperidad y paz — WillowSoft" },
      it: { title: "RADICI NELLA TRADIZIONE, SGUARDO AL FUTURO", accent: "Buona Festa Nazionale dell’Arabia Saudita", subline: "I nostri migliori auguri al popolo saudita per un futuro di progresso, prosperità e pace — WillowSoft" },
      ar: { title: "جذور راسخة وطموح نحو المستقبل", accent: "كل عام والوطن بخير في اليوم الوطني السعودي", subline: "أطيب التمنيات لشعب المملكة العربية السعودية بدوام التقدم والازدهار والسلام — WillowSoft" },
      ja: { title: "誇りある歩みを、希望の未来へ", accent: "サウジアラビア建国記念日を祝して", subline: "さらなる発展と繁栄、そして平和をお祈りします — WillowSoft" },
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
      en: { title: "LIBERTY, EQUALITY, FRATERNITY", accent: "Happy French National Day", subline: "Warm wishes to France on a day that celebrates values shared across generations — WillowSoft" },
      tr: { title: "ÖZGÜRLÜK, EŞİTLİK, KARDEŞLİK", accent: "14 Temmuz Fransa Ulusal Günü Kutlu Olsun", subline: "Nesillere ilham vermeyi sürdüren değerleri Fransız halkıyla birlikte kutluyoruz — WillowSoft" },
      de: { title: "FREIHEIT, GLEICHHEIT, BRÜDERLICHKEIT", accent: "Alles Gute zum französischen Nationalfeiertag", subline: "Herzliche Grüße nach Frankreich an diesem besonderen Tag — WillowSoft" },
      fr: { title: "LIBERTÉ, ÉGALITÉ, FRATERNITÉ", accent: "Bonne fête nationale du 14 Juillet", subline: "Aux côtés du peuple français, nous célébrons des valeurs qui continuent d’inspirer les générations — WillowSoft" },
      es: { title: "LIBERTAD, IGUALDAD, FRATERNIDAD", accent: "Feliz Fiesta Nacional de Francia", subline: "Nos unimos al pueblo francés para celebrar valores que siguen inspirando a generaciones — WillowSoft" },
      it: { title: "LIBERTÀ, UGUAGLIANZA, FRATERNITÀ", accent: "Buona Festa Nazionale Francese", subline: "Ci uniamo al popolo francese nel celebrare valori che continuano a ispirare generazioni — WillowSoft" },
      ar: { title: "حرية ومساواة وأخوّة", accent: "كل عام وأنتم بخير بمناسبة العيد الوطني الفرنسي", subline: "نشارك الشعب الفرنسي الاحتفاء بالقيم التي ما زالت تلهم الأجيال — WillowSoft" },
      ja: { title: "自由・平等・友愛", accent: "フランス革命記念日を祝して", subline: "世代を超えて受け継がれる大切な価値に、敬意を表します — WillowSoft" },
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
      en: { title: "ITALIAN CREATIVITY, A TIMELESS LEGACY", accent: "Happy Italian Republic Day", subline: "Celebrating Italy’s history, creativity, and unmistakable place in world culture — WillowSoft" },
      tr: { title: "İTALYA’NIN ZAMANSIZ MİRASI", accent: "İtalya Cumhuriyet Bayramı Kutlu Olsun", subline: "İtalya’nın tarihini, yaratıcılığını ve dünya kültürüne kattığı eşsiz değerleri kutluyoruz — WillowSoft" },
      de: { title: "ITALIENS KREATIVITÄT, EIN ZEITLOSES ERBE", accent: "Alles Gute zum Tag der Italienischen Republik", subline: "Wir feiern Italiens Geschichte, seine Kreativität und seinen unverwechselbaren Beitrag zur Weltkultur — WillowSoft" },
      fr: { title: "LA CRÉATIVITÉ ITALIENNE, UN HÉRITAGE INTEMPOREL", accent: "Bonne fête de la République italienne", subline: "À l’histoire, à la créativité et à l’influence unique de l’Italie dans le monde — WillowSoft" },
      es: { title: "CREATIVIDAD ITALIANA, LEGADO ETERNO", accent: "Feliz Fiesta de la República Italiana", subline: "Por la historia, la creatividad y la huella inconfundible de Italia en la cultura mundial — WillowSoft" },
      it: { title: "UNA REPUBBLICA RICCA DI CULTURA E VISIONE", accent: "Buona Festa della Repubblica Italiana", subline: "Celebriamo la storia, la creatività e il contributo duraturo dell’Italia al mondo — WillowSoft" },
      ar: { title: "جمهورية ثرية بالثقافة والرؤية", accent: "كل عام وأنتم بخير بمناسبة عيد الجمهورية الإيطالية", subline: "نحتفي بتاريخ إيطاليا وإبداعها وإسهامها الراسخ في العالم — WillowSoft" },
      ja: { title: "創造性が息づく、イタリアの歩み", accent: "イタリア共和国記念日を祝して", subline: "豊かな歴史と文化、世界を魅了する創造性をたたえます — WillowSoft" },
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
      en: { title: "SPAIN IN ALL ITS COLOR", accent: "Happy National Day of Spain", subline: "Celebrating a country shaped by history, creativity, and many vibrant cultures — WillowSoft" },
      tr: { title: "TÜM RENKLERİYLE İSPANYA", accent: "İspanya Ulusal Günü Kutlu Olsun", subline: "Tarihi, yaratıcılığı ve zengin kültürel çeşitliliğiyle İspanya’yı kutluyoruz — WillowSoft" },
      de: { title: "SPANIEN IN ALL SEINEN FARBEN", accent: "Alles Gute zum spanischen Nationalfeiertag", subline: "Wir feiern ein Land voller Geschichte, Kreativität und kultureller Vielfalt — WillowSoft" },
      fr: { title: "L’ESPAGNE DANS TOUTES SES COULEURS", accent: "Bonne fête nationale de l’Espagne", subline: "Une journée pour célébrer son histoire, sa créativité et sa richesse culturelle — WillowSoft" },
      es: { title: "ESPAÑA EN TODOS SUS COLORES", accent: "Feliz Fiesta Nacional de España", subline: "Hoy celebramos nuestra historia, nuestra creatividad y la riqueza de nuestra diversidad cultural — WillowSoft" },
      it: { title: "LA SPAGNA IN TUTTI I SUOI COLORI", accent: "Buona Festa Nazionale della Spagna", subline: "Celebriamo la sua storia, la sua creatività e la ricchezza delle sue culture — WillowSoft" },
      ar: { title: "إرث تصوغه الثقافة والتنوّع", accent: "كل عام وأنتم بخير بمناسبة اليوم الوطني الإسباني", subline: "نحتفي بتراث إسبانيا الغني وإبداعها وتنوّعها الثقافي — WillowSoft" },
      ja: { title: "多彩な文化が輝くスペイン", accent: "スペイン建国記念日を祝して", subline: "豊かな歴史と創造性、色彩あふれる文化をたたえます — WillowSoft" },
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
      en: { title: "HONORING THE PAST, IMAGINING THE FUTURE", accent: "National Foundation Day of Japan", subline: "A day to reflect on Japan’s history and look ahead with hope — WillowSoft" },
      tr: { title: "GELECEĞE İLHAM VEREN BİR GELENEK", accent: "Japonya Ulusal Kuruluş Günü Kutlu Olsun", subline: "Japonya’nın köklü mirasını ve gelecek nesillere yön veren vizyonunu kutluyoruz — WillowSoft" },
      de: { title: "VERGANGENHEIT EHREN, ZUKUNFT GESTALTEN", accent: "Tag der Staatsgründung in Japan", subline: "Ein Tag, um auf Japans Geschichte zurückzublicken und mit Zuversicht nach vorn zu schauen — WillowSoft" },
      fr: { title: "HONORER LE PASSÉ, IMAGINER L’AVENIR", accent: "Jour de la Fondation nationale du Japon", subline: "Une journée pour se souvenir de l’histoire du Japon et regarder l’avenir avec confiance — WillowSoft" },
      es: { title: "UNA TRADICIÓN QUE INSPIRA EL FUTURO", accent: "Feliz Día de la Fundación Nacional de Japón", subline: "Celebramos el legado perdurable de Japón y su visión para las generaciones futuras — WillowSoft" },
      it: { title: "UNA TRADIZIONE CHE ISPIRA IL FUTURO", accent: "Buona Festa della Fondazione Nazionale del Giappone", subline: "Celebriamo l’eredità duratura del Giappone e la sua visione per le generazioni future — WillowSoft" },
      ar: { title: "تقاليد عريقة تلهم المستقبل", accent: "كل عام وأنتم بخير بمناسبة يوم التأسيس الوطني لليابان", subline: "نحتفي بإرث اليابان الراسخ ورؤيتها للأجيال القادمة — WillowSoft" },
      ja: { title: "これまでの歩みに想いを寄せて", accent: "建国記念の日", subline: "国の歩みを振り返り、よりよい未来への願いを新たにする一日です — WillowSoft" },
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
      en: { title: "A PROUD JOURNEY, A BOLD FUTURE", accent: "Happy Qatar National Day", subline: "Warm wishes to the people of Qatar for continued achievement, prosperity, and peace — WillowSoft" },
      tr: { title: "GEÇMİŞİYLE GURURLU, GELECEĞİNE GÜVENLE", accent: "Katar Ulusal Günü Kutlu Olsun", subline: "Katar halkına başarı, refah ve barışla devam eden nice yıllar diliyoruz — WillowSoft" },
      de: { title: "STOLZE GESCHICHTE, MUTIGE ZUKUNFT", accent: "Alles Gute zum Nationalfeiertag von Katar", subline: "Den Menschen in Katar wünschen wir weiterhin Erfolg, Wohlstand und Frieden — WillowSoft" },
      fr: { title: "UNE FIÈRE HISTOIRE, UN AVENIR AMBITIEUX", accent: "Bonne fête nationale du Qatar", subline: "Tous nos vœux de réussite, de prospérité et de paix au peuple qatari — WillowSoft" },
      es: { title: "UNA HISTORIA DE ORGULLO, UN FUTURO AMBICIOSO", accent: "Feliz Día Nacional de Catar", subline: "Nuestros mejores deseos de éxito, prosperidad y paz para el pueblo catarí — WillowSoft" },
      it: { title: "UNA STORIA DI ORGOGLIO, UN FUTURO AMBIZIOSO", accent: "Buona Festa Nazionale del Qatar", subline: "Al popolo del Qatar, i nostri migliori auguri di successo, prosperità e pace — WillowSoft" },
      ar: { title: "فخر بالمسيرة وثقة بالمستقبل", accent: "كل عام والوطن بخير في اليوم الوطني لدولة قطر", subline: "أطيب التمنيات لشعب قطر بدوام الإنجاز والازدهار والسلام — WillowSoft" },
      ja: { title: "誇りある歩みを、力強い未来へ", accent: "カタール建国記念日を祝して", subline: "さらなる発展と繁栄、そして平和をお祈りします — WillowSoft" },
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
      en: { title: "ONE VISION, ENDLESS POSSIBILITY", accent: "Happy UAE National Day", subline: "Warm wishes to the people of the UAE for continued unity, innovation, and prosperity — WillowSoft" },
      tr: { title: "BİRLİKTEN DOĞAN GÜÇ, GELECEĞE YÖN VEREN VİZYON", accent: "Birleşik Arap Emirlikleri Ulusal Günü Kutlu Olsun", subline: "BAE halkına birlik, inovasyon ve refahla dolu bir gelecek diliyoruz — WillowSoft" },
      de: { title: "EINE VISION, UNENDLICHE MÖGLICHKEITEN", accent: "Alles Gute zum Nationalfeiertag der VAE", subline: "Den Menschen in den VAE wünschen wir weiterhin Einheit, Innovationskraft und Wohlstand — WillowSoft" },
      fr: { title: "UNE VISION, UN CHAMP DES POSSIBLES", accent: "Bonne fête nationale des Émirats arabes unis", subline: "Tous nos vœux d’unité, d’innovation et de prospérité au peuple émirien — WillowSoft" },
      es: { title: "UNA VISIÓN, INFINITAS POSIBILIDADES", accent: "Feliz Día Nacional de los Emiratos Árabes Unidos", subline: "Nuestros mejores deseos de unidad, innovación y prosperidad para el pueblo emiratí — WillowSoft" },
      it: { title: "UNA VISIONE, INFINITE POSSIBILITÀ", accent: "Buona Festa Nazionale degli Emirati Arabi Uniti", subline: "Al popolo emiratino, i nostri migliori auguri di unità, innovazione e prosperità — WillowSoft" },
      ar: { title: "رؤية توحّدنا وطموح يلهمنا", accent: "كل عام والوطن بخير في عيد الاتحاد", subline: "أطيب التمنيات لشعب دولة الإمارات بدوام الاتحاد والابتكار والازدهار — WillowSoft" },
      ja: { title: "ひとつの志から、広がる可能性", accent: "UAE建国記念日を祝して", subline: "さらなる結束と革新、そして繁栄をお祈りします — WillowSoft" },
    },
  },
];
