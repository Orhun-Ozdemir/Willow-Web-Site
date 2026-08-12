import type { Locale } from "./cms";

export type GuideSection = {
  heading: string;
  body: string;
  points?: string[];
};

export type TechnicalGuideCopy = {
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  sections: GuideSection[];
  checklistTitle: string;
  checklist: string[];
};

export type TechnicalGuide = {
  slug: string;
  readingMinutes: number;
  category: "selection" | "deployment" | "integration";
  relatedCategory?: string;
  source: { label: string; url: string };
  localized: Record<Locale, TechnicalGuideCopy>;
};

const guide = (
  slug: string,
  readingMinutes: number,
  category: TechnicalGuide["category"],
  relatedCategory: string | undefined,
  source: TechnicalGuide["source"],
  localized: Record<Locale, TechnicalGuideCopy>,
): TechnicalGuide => ({ slug, readingMinutes, category, relatedCategory, source, localized });

export const TECHNICAL_GUIDES: TechnicalGuide[] = [
  guide(
    "how-to-choose-a-lorawan-sensor",
    7,
    "selection",
    "environment",
    { label: "LoRa Alliance — Regional Parameters", url: "https://lora-alliance.org/resource_hub/rp002-1-0-4-regional-parameters/" },
    {
      en: {
        eyebrow: "Device selection",
        title: "How to Choose a LoRaWAN Sensor",
        description: "A technical checklist for selecting a LoRaWAN sensor by measurement, enclosure, radio region, reporting policy and integration requirements.",
        intro: "A product name alone is not enough to make a reliable field selection. Start with the measurement task, then verify the physical environment, radio plan, power model and the path from payload to application.",
        sections: [
          { heading: "Define the measurement task", body: "Record what must be measured, the required unit, useful range, acceptable error and how quickly a change must be detected. A sensor that measures the correct variable can still be unsuitable if its range, resolution or sampling behavior does not match the process.", points: ["Measurement variable and unit", "Expected minimum and maximum", "Required sampling and reporting interval"] },
          { heading: "Match the enclosure to the installation", body: "Indoor, outdoor and industrial installations create different requirements. Check ingress protection, operating temperature, mounting method, cable entries and whether the sensing element must remain exposed. The enclosure rating does not automatically describe chemical resistance or installation quality." },
          { heading: "Confirm the regional radio plan", body: "LoRaWAN channel plans differ by regulatory region. Confirm the deployment country, supported band and network configuration before ordering or provisioning devices. Do not assume that an EU868 device can be moved unchanged to a US915 deployment.", points: ["Deployment country and regional plan", "Private or public network", "Gateway coverage and installation constraints"] },
          { heading: "Design the data path", body: "Document payload fields, units, scaling, timestamps and alarm rules before deployment. Also define how device identity, decoder versions and configuration changes will be managed. This prevents a working radio link from becoming an unusable application integration." },
        ],
        checklistTitle: "Selection record",
        checklist: ["Measurement and accuracy requirement", "Environment and mounting", "Regional frequency plan", "Power source and reporting interval", "Payload decoder and target platform", "Required documents and approvals"],
      },
      tr: {
        eyebrow: "Cihaz seçimi",
        title: "LoRaWAN Sensörü Nasıl Seçilir?",
        description: "Ölçüm, gövde, bölgesel frekans planı, raporlama politikası ve entegrasyon gereksinimlerine göre LoRaWAN sensör seçme rehberi.",
        intro: "Güvenilir bir saha seçimi için yalnızca ürün adı yeterli değildir. Önce ölçüm görevini tanımlayın; ardından fiziksel ortamı, radyo planını, güç modelini ve payload'dan uygulamaya uzanan veri yolunu doğrulayın.",
        sections: [
          { heading: "Ölçüm görevini tanımlayın", body: "Ölçülecek değişkeni, birimi, beklenen aralığı, kabul edilebilir hatayı ve değişimin ne kadar hızlı algılanması gerektiğini kaydedin. Doğru değişkeni ölçen bir sensör; aralık, çözünürlük veya örnekleme davranışı prosese uymuyorsa yine de yanlış seçim olabilir.", points: ["Ölçüm değişkeni ve birimi", "Beklenen alt ve üst değer", "Örnekleme ve raporlama aralığı"] },
          { heading: "Gövdeyi kurulum ortamıyla eşleştirin", body: "İç mekân, dış ortam ve endüstriyel kurulumlar farklı gereksinimler doğurur. IP korumasını, çalışma sıcaklığını, montaj biçimini, kablo girişlerini ve algılama elemanının açıkta kalıp kalmayacağını kontrol edin. IP sınıfı kimyasal dayanımı veya montaj kalitesini tek başına açıklamaz." },
          { heading: "Bölgesel radyo planını doğrulayın", body: "LoRaWAN kanal planları düzenleyici bölgeye göre değişir. Cihaz siparişi veya kurulumu öncesinde ülkeyi, desteklenen bandı ve ağ yapılandırmasını doğrulayın. EU868 için hazırlanmış bir cihazın US915 sahasında değişiklik olmadan kullanılacağını varsaymayın.", points: ["Kurulum ülkesi ve bölgesel plan", "Özel veya genel ağ", "Gateway kapsaması ve kurulum kısıtları"] },
          { heading: "Veri yolunu tasarlayın", body: "Kurulumdan önce payload alanlarını, birimleri, ölçeklemeyi, zaman bilgisini ve alarm kurallarını belgeleyin. Cihaz kimliği, decoder sürümleri ve konfigürasyon değişikliklerinin nasıl yönetileceğini de tanımlayın. Böylece çalışan bir radyo bağlantısı, kullanılamayan bir uygulama entegrasyonuna dönüşmez." },
        ],
        checklistTitle: "Seçim kaydı",
        checklist: ["Ölçüm ve doğruluk gereksinimi", "Ortam ve montaj", "Bölgesel frekans planı", "Güç kaynağı ve raporlama aralığı", "Payload decoder ve hedef platform", "Gerekli belgeler ve onaylar"],
      },
      de: {
        eyebrow: "Geräteauswahl", title: "So wählen Sie einen LoRaWAN-Sensor aus", description: "Technische Checkliste zur Auswahl eines LoRaWAN-Sensors nach Messaufgabe, Gehäuse, Funkregion, Meldeintervall und Integration.",
        intro: "Ein Produktname reicht für eine zuverlässige Feldauswahl nicht aus. Definieren Sie zuerst die Messaufgabe und prüfen Sie anschließend Umgebung, Funkplan, Energieversorgung und Datenweg.",
        sections: [
          { heading: "Messaufgabe definieren", body: "Dokumentieren Sie Messgröße, Einheit, erwarteten Bereich, zulässige Abweichung sowie Abtast- und Meldeintervall. Ein Sensor kann die richtige Größe messen und dennoch für den Prozess ungeeignet sein.", points: ["Messgröße und Einheit", "Minimal- und Maximalwert", "Abtast- und Meldeintervall"] },
          { heading: "Gehäuse und Einbauort abstimmen", body: "Prüfen Sie Schutzart, Betriebstemperatur, Montage, Kabeleinführungen und ob das Sensorelement frei liegen muss. Eine IP-Schutzart beschreibt nicht automatisch chemische Beständigkeit oder Montagequalität." },
          { heading: "Regionalen Funkplan bestätigen", body: "LoRaWAN-Kanalpläne unterscheiden sich je Regulierungsregion. Bestätigen Sie Land, Frequenzband, Netzwerktyp und Gateway-Abdeckung vor Bestellung und Provisionierung." },
          { heading: "Datenweg planen", body: "Definieren Sie Payload-Felder, Einheiten, Skalierung, Zeitstempel, Decoder-Version und Alarmregeln. So bleibt die Funkverbindung auch auf Anwendungsebene nutzbar." },
        ],
        checklistTitle: "Auswahlnachweis", checklist: ["Mess- und Genauigkeitsanforderung", "Umgebung und Montage", "Regionaler Frequenzplan", "Stromversorgung und Meldeintervall", "Decoder und Zielplattform", "Dokumente und Freigaben"],
      },
      fr: {
        eyebrow: "Sélection du dispositif", title: "Comment choisir un capteur LoRaWAN", description: "Liste de contrôle technique pour choisir un capteur LoRaWAN selon la mesure, le boîtier, la région radio, le reporting et l’intégration.",
        intro: "Le nom d’un produit ne suffit pas pour un choix terrain fiable. Définissez d’abord la mesure, puis vérifiez l’environnement, le plan radio, l’alimentation et le chemin des données.",
        sections: [
          { heading: "Définir la mesure", body: "Documentez la grandeur, l’unité, la plage attendue, l’erreur acceptable ainsi que les intervalles d’échantillonnage et de transmission.", points: ["Grandeur et unité", "Valeurs minimale et maximale", "Intervalles d’échantillonnage et de transmission"] },
          { heading: "Adapter le boîtier au site", body: "Vérifiez l’indice de protection, la température de service, le montage, les entrées de câble et l’exposition nécessaire de l’élément sensible. Un indice IP ne décrit pas à lui seul la résistance chimique." },
          { heading: "Confirmer le plan radio régional", body: "Les plans de canaux LoRaWAN varient selon la région réglementaire. Confirmez le pays, la bande, le type de réseau et la couverture des gateways avant la commande." },
          { heading: "Concevoir le chemin des données", body: "Définissez les champs du payload, unités, échelles, horodatages, versions du decoder et règles d’alarme avant le déploiement." },
        ], checklistTitle: "Dossier de sélection", checklist: ["Mesure et précision", "Environnement et montage", "Plan de fréquence régional", "Alimentation et intervalle", "Decoder et plateforme", "Documents et validations"],
      },
      es: {
        eyebrow: "Selección de dispositivo", title: "Cómo elegir un sensor LoRaWAN", description: "Lista técnica para elegir un sensor LoRaWAN por medición, carcasa, región de radio, política de reporte e integración.",
        intro: "El nombre del producto no basta para una selección fiable. Defina primero la medición y después verifique el entorno, el plan de radio, la alimentación y la ruta de datos.",
        sections: [
          { heading: "Definir la medición", body: "Documente la variable, unidad, rango esperado, error aceptable y los intervalos de muestreo y reporte.", points: ["Variable y unidad", "Valores mínimo y máximo", "Intervalos de muestreo y reporte"] },
          { heading: "Adaptar la carcasa al lugar", body: "Compruebe protección IP, temperatura de trabajo, montaje, entradas de cable y si el elemento sensor debe quedar expuesto. La clase IP no define por sí sola la resistencia química." },
          { heading: "Confirmar el plan regional", body: "Los planes de canales LoRaWAN cambian por región regulatoria. Confirme país, banda, tipo de red y cobertura de gateways antes del pedido." },
          { heading: "Diseñar la ruta de datos", body: "Defina campos del payload, unidades, escalado, marcas de tiempo, versión del decoder y reglas de alarma antes del despliegue." },
        ], checklistTitle: "Registro de selección", checklist: ["Medición y precisión", "Entorno y montaje", "Plan regional", "Alimentación e intervalo", "Decoder y plataforma", "Documentos y aprobaciones"],
      },
      it: {
        eyebrow: "Selezione del dispositivo", title: "Come scegliere un sensore LoRaWAN", description: "Checklist tecnica per scegliere un sensore LoRaWAN in base a misura, custodia, regione radio, invio dati e integrazione.",
        intro: "Il nome del prodotto non basta per una scelta affidabile sul campo. Definisci prima la misura, quindi verifica ambiente, piano radio, alimentazione e percorso dei dati.",
        sections: [
          { heading: "Definire la misura", body: "Documenta variabile, unità, intervallo previsto, errore accettabile e intervalli di campionamento e trasmissione.", points: ["Variabile e unità", "Valori minimo e massimo", "Intervalli di campionamento e invio"] },
          { heading: "Abbinare la custodia al sito", body: "Verifica grado IP, temperatura operativa, montaggio, ingressi cavo ed eventuale esposizione dell’elemento sensibile. Il grado IP non definisce da solo la resistenza chimica." },
          { heading: "Confermare il piano radio", body: "I piani di canale LoRaWAN variano per regione normativa. Conferma paese, banda, tipo di rete e copertura gateway prima dell’ordine." },
          { heading: "Progettare il percorso dati", body: "Definisci campi payload, unità, scala, timestamp, versione decoder e regole di allarme prima del deployment." },
        ], checklistTitle: "Scheda di selezione", checklist: ["Misura e accuratezza", "Ambiente e montaggio", "Piano regionale", "Alimentazione e intervallo", "Decoder e piattaforma", "Documenti e approvazioni"],
      },
      ar: {
        eyebrow: "اختيار الجهاز", title: "كيفية اختيار مستشعر LoRaWAN", description: "قائمة تحقق فنية لاختيار مستشعر LoRaWAN وفق القياس والغلاف والمنطقة اللاسلكية وسياسة الإرسال والتكامل.",
        intro: "اسم المنتج وحده لا يكفي لاختيار موثوق في الموقع. ابدأ بمهمة القياس ثم تحقق من البيئة وخطة التردد والطاقة ومسار البيانات.",
        sections: [
          { heading: "تحديد مهمة القياس", body: "وثّق المتغير والوحدة والنطاق المتوقع والخطأ المقبول وفترات أخذ العينة والإرسال.", points: ["المتغير والوحدة", "الحد الأدنى والأقصى", "فترة أخذ العينة والإرسال"] },
          { heading: "مطابقة الغلاف مع الموقع", body: "تحقق من درجة الحماية وحرارة التشغيل وطريقة التثبيت ومداخل الكابلات وما إذا كان عنصر القياس يجب أن يبقى مكشوفاً. درجة IP لا تصف وحدها المقاومة الكيميائية." },
          { heading: "تأكيد الخطة الإقليمية", body: "تختلف خطط قنوات LoRaWAN حسب المنطقة التنظيمية. أكد البلد والنطاق ونوع الشبكة وتغطية البوابات قبل الطلب." },
          { heading: "تصميم مسار البيانات", body: "حدد حقول payload والوحدات والتحجيم والطابع الزمني وإصدار decoder وقواعد التنبيه قبل النشر." },
        ], checklistTitle: "سجل الاختيار", checklist: ["القياس والدقة", "البيئة والتثبيت", "خطة التردد الإقليمية", "الطاقة وفترة الإرسال", "Decoder والمنصة", "الوثائق والموافقات"],
      },
      ja: {
        eyebrow: "デバイス選定", title: "LoRaWANセンサーの選び方", description: "測定対象、筐体、地域周波数、送信方針、システム連携からLoRaWANセンサーを選定する技術チェックリストです。",
        intro: "製品名だけでは現場に適した選定はできません。測定要件を定義し、設置環境、地域別無線プラン、電源、データ経路を順に確認します。",
        sections: [
          { heading: "測定要件を定義する", body: "測定変数、単位、想定範囲、許容誤差、サンプリング間隔と送信間隔を記録します。", points: ["測定変数と単位", "最小値と最大値", "サンプリングと送信間隔"] },
          { heading: "筐体と設置場所を合わせる", body: "IP保護等級、動作温度、取付方法、ケーブル導入口、センシング部を露出させる必要性を確認します。IP等級だけで耐薬品性は判断できません。" },
          { heading: "地域別無線プランを確認する", body: "LoRaWANのチャネルプランは規制地域ごとに異なります。発注前に国、帯域、ネットワーク種別、gatewayのカバレッジを確認します。" },
          { heading: "データ経路を設計する", body: "導入前にpayloadのフィールド、単位、スケーリング、時刻、decoderバージョン、アラーム規則を定義します。" },
        ], checklistTitle: "選定記録", checklist: ["測定と精度", "環境と取付", "地域周波数プラン", "電源と送信間隔", "Decoderと連携先", "文書と承認"],
      },
    },
  ),
  guide(
    "lorawan-battery-life-planning",
    6,
    "deployment",
    "environment",
    { label: "LoRa Alliance — Resource Hub", url: "https://lora-alliance.org/resource_hub/" },
    Object.fromEntries(([
      ["en", "Battery planning", "LoRaWAN Battery Life Planning", "Plan LoRaWAN sensor power budgets without relying on a single headline battery-life number.", "Battery life is an engineering result, not a fixed product label. Reporting frequency, radio conditions, retries, sensor warm-up, temperature and battery chemistry all affect the result.", "Build a power budget", "Separate sleep, measurement, processing and radio events. Multiply each current draw by its duration and expected daily count, then include self-discharge and a conservative reserve.", "Test the reporting policy", "Frequent uplinks, confirmed messages, retries and downlinks increase radio activity. Define which measurements must be immediate and which can be batched or reported only after a meaningful change.", "Validate in the real environment", "Weak coverage can increase airtime or retries. Temperature also changes usable battery capacity. Pilot the exact enclosure, antenna, firmware and reporting policy at representative locations.", "Operational checklist"],
      ["tr", "Batarya planlama", "LoRaWAN Batarya Ömrü Nasıl Planlanır?", "Tek bir batarya ömrü iddiasına dayanmadan LoRaWAN sensör güç bütçesi hazırlama rehberi.", "Batarya ömrü sabit bir ürün etiketi değil, mühendislik sonucudur. Raporlama sıklığı, radyo koşulları, tekrarlar, sensör ısınma süresi, sıcaklık ve batarya kimyası sonucu etkiler.", "Güç bütçesini oluşturun", "Uyku, ölçüm, işlem ve radyo olaylarını ayrı hesaplayın. Her akım değerini süresi ve günlük tekrar sayısıyla çarpın; self-discharge ve güvenlik payını ekleyin.", "Raporlama politikasını test edin", "Sık uplink, confirmed message, tekrar ve downlink radyo etkinliğini artırır. Hangi ölçümlerin anlık, hangilerinin toplu veya yalnızca anlamlı değişimde gönderileceğini belirleyin.", "Gerçek ortamda doğrulayın", "Zayıf kapsama airtime veya tekrarları artırabilir. Sıcaklık da kullanılabilir batarya kapasitesini değiştirir. Aynı gövde, anten, firmware ve raporlama politikasıyla temsili sahalarda pilot kurulum yapın.", "Operasyon kontrolü"],
      ["de", "Batterieplanung", "LoRaWAN-Batterielaufzeit planen", "Planen Sie das Energiebudget eines LoRaWAN-Sensors ohne pauschale Laufzeitangabe.", "Batterielaufzeit ist ein Engineering-Ergebnis. Meldeintervall, Funkbedingungen, Wiederholungen, Sensoranlauf, Temperatur und Batteriechemie wirken zusammen.", "Energiebudget erstellen", "Trennen Sie Schlaf-, Mess-, Rechen- und Funkphasen und berücksichtigen Sie Dauer, Häufigkeit, Selbstentladung und Reserve.", "Meldepolitik testen", "Häufige Uplinks, bestätigte Nachrichten, Wiederholungen und Downlinks erhöhen die Funkaktivität. Trennen Sie sofortige Meldungen von gebündelten Daten.", "Im Einsatzumfeld validieren", "Schwache Abdeckung und Temperatur verändern die nutzbare Laufzeit. Testen Sie Gehäuse, Antenne, Firmware und Meldepolitik an repräsentativen Standorten.", "Betriebscheckliste"],
      ["fr", "Planification énergétique", "Planifier l’autonomie d’un capteur LoRaWAN", "Construire le budget énergétique d’un capteur LoRaWAN sans se fier à une autonomie unique annoncée.", "L’autonomie est un résultat d’ingénierie. Fréquence de transmission, radio, répétitions, démarrage du capteur, température et chimie de batterie agissent ensemble.", "Construire le budget", "Séparez veille, mesure, calcul et radio, puis intégrez durée, fréquence, autodécharge et marge.", "Tester la politique de transmission", "Uplinks fréquents, messages confirmés, répétitions et downlinks augmentent l’activité radio. Distinguez l’urgence des données pouvant être regroupées.", "Valider sur le terrain", "Une couverture faible et la température modifient l’autonomie utile. Testez le boîtier, l’antenne, le firmware et la politique réelle sur des sites représentatifs.", "Liste opérationnelle"],
      ["es", "Planificación de batería", "Planificación de batería en LoRaWAN", "Prepare el presupuesto energético de un sensor LoRaWAN sin depender de una cifra única de autonomía.", "La autonomía es un resultado de ingeniería. Frecuencia de reporte, radio, reintentos, arranque del sensor, temperatura y química de batería influyen conjuntamente.", "Crear el presupuesto", "Separe reposo, medición, proceso y radio, e incluya duración, frecuencia, autodescarga y margen.", "Probar la política de reporte", "Uplinks frecuentes, mensajes confirmados, reintentos y downlinks aumentan la actividad. Separe avisos inmediatos de datos agrupables.", "Validar en el entorno real", "Cobertura débil y temperatura cambian la autonomía útil. Pruebe carcasa, antena, firmware y política en ubicaciones representativas.", "Lista operativa"],
      ["it", "Pianificazione batteria", "Pianificare la durata della batteria LoRaWAN", "Calcola il budget energetico di un sensore LoRaWAN senza affidarti a un unico valore dichiarato.", "La durata è un risultato ingegneristico. Frequenza di invio, condizioni radio, retry, avvio del sensore, temperatura e chimica della batteria interagiscono.", "Creare il budget", "Separa sleep, misura, elaborazione e radio, includendo durata, frequenza, autoscarica e margine.", "Testare la politica di invio", "Uplink frequenti, messaggi confermati, retry e downlink aumentano l’attività radio. Distingui gli eventi immediati dai dati aggregabili.", "Validare sul campo", "Copertura debole e temperatura modificano l’autonomia utile. Testa custodia, antenna, firmware e politica in siti rappresentativi.", "Checklist operativa"],
      ["ar", "تخطيط البطارية", "تخطيط عمر بطارية LoRaWAN", "إعداد ميزانية طاقة لمستشعر LoRaWAN دون الاعتماد على رقم واحد لعمر البطارية.", "عمر البطارية نتيجة هندسية. تتفاعل فترة الإرسال وظروف الراديو وإعادة المحاولة وتهيئة المستشعر والحرارة وكيمياء البطارية.", "إعداد ميزانية الطاقة", "افصل بين السكون والقياس والمعالجة والراديو، وأدخل المدة والتكرار والتفريغ الذاتي وهامش الأمان.", "اختبار سياسة الإرسال", "تزيد uplink المتكررة والرسائل المؤكدة وإعادة المحاولة وdownlink من نشاط الراديو. افصل الإنذارات الفورية عن البيانات القابلة للتجميع.", "التحقق في البيئة الحقيقية", "تغير التغطية الضعيفة والحرارة العمر الفعلي. اختبر الغلاف والهوائي وfirmware والسياسة في مواقع ممثلة.", "قائمة التشغيل"],
      ["ja", "バッテリー設計", "LoRaWANのバッテリー寿命を設計する", "単一の公称寿命に依存せず、LoRaWANセンサーの電力収支を設計するためのガイドです。", "バッテリー寿命は設計結果です。送信頻度、無線状態、再送、センサー起動時間、温度、電池化学系が影響します。", "電力収支を作る", "sleep、測定、処理、無線を分け、電流、継続時間、回数、自己放電、設計余裕を計算します。", "送信方針を試験する", "頻繁なuplink、confirmed message、再送、downlinkは無線動作を増やします。即時通知とまとめて送れるデータを分けます。", "実環境で検証する", "弱いカバレッジや温度は実効寿命を変えます。実際の筐体、アンテナ、firmware、送信方針を代表地点で試験します。", "運用チェックリスト"],
    ] as const).map(([locale, eyebrow, title, description, intro, h1, b1, h2, b2, h3, b3, checklistTitle]) => [locale, {
      eyebrow, title, description, intro,
      sections: [{ heading: h1, body: b1 }, { heading: h2, body: b2 }, { heading: h3, body: b3 }],
      checklistTitle,
      checklist: ({
        en: ["Energy per measurement", "Daily message count", "Confirmation and retry policy", "Field signal conditions", "Temperature range", "Maintenance and replacement plan"],
        tr: ["Ölçüm başına enerji", "Günlük mesaj sayısı", "Confirmed message ve retry politikası", "Saha sinyal koşulları", "Sıcaklık aralığı", "Bakım ve değişim planı"],
        de: ["Energie pro Messung", "Nachrichten pro Tag", "Bestätigungs- und Wiederholungsregeln", "Funkbedingungen im Feld", "Temperaturbereich", "Wartungs- und Wechselplan"],
        fr: ["Énergie par mesure", "Messages quotidiens", "Confirmation et répétitions", "Conditions radio terrain", "Plage de température", "Plan de maintenance"],
        es: ["Energía por medición", "Mensajes diarios", "Confirmación y reintentos", "Condiciones de radio", "Rango de temperatura", "Plan de mantenimiento"],
        it: ["Energia per misura", "Messaggi giornalieri", "Conferme e retry", "Condizioni radio sul campo", "Intervallo di temperatura", "Piano di manutenzione"],
        ar: ["طاقة كل قياس", "عدد الرسائل اليومية", "سياسة التأكيد وإعادة المحاولة", "ظروف الإشارة في الموقع", "نطاق الحرارة", "خطة الصيانة والاستبدال"],
        ja: ["測定1回の電力", "1日のメッセージ数", "確認と再送の方針", "現場の無線状態", "温度範囲", "保守・交換計画"],
      } as Record<string, string[]>)[locale],
    }])) as Record<Locale, TechnicalGuideCopy>,
  ),
  guide(
    "modbus-to-lorawan-integration",
    8,
    "integration",
    "industrial",
    { label: "Modbus Organization — Specifications", url: "https://www.modbus.org/modbus-specifications" },
    Object.fromEntries(([
      ["en", "Industrial integration", "Modbus to LoRaWAN Integration Guide", "Plan a Modbus RTU to LoRaWAN data path with explicit register maps, polling rules, payload versions and failure states.", "A bridge does more than move bytes. A reliable integration must define how Modbus registers become typed, timestamped and versioned LoRaWAN payload fields, and what happens when either side is unavailable.", "Freeze the register contract", "Record device address, function code, register address, length, data type, byte order, scale and engineering unit for every value. Resolve one-based versus zero-based addressing before firmware development.", "Design polling and payloads together", "Polling faster than the radio can report creates stale queues or wasted energy. Group registers by operational priority, define change thresholds and version the payload format so backend decoders can evolve safely.", "Handle failure as data", "Distinguish Modbus timeout, CRC error, exception response, stale value and LoRaWAN delivery state. Do not silently transmit the last value as if it were current; carry validity or age information when the application needs it.", "Commission end to end", "Test with the actual field device, cable length, serial settings, gateway and network server. Verify negative values, word order, limits, reconnection and decoder output before dashboard acceptance.", "Integration record"],
      ["tr", "Endüstriyel entegrasyon", "Modbus–LoRaWAN Entegrasyon Rehberi", "Register haritası, sorgulama kuralı, payload sürümü ve hata durumları açıkça tanımlanmış bir Modbus RTU–LoRaWAN veri yolu planlayın.", "Bir köprü yalnızca byte taşımaz. Güvenilir entegrasyon; Modbus register'larının tipli, zaman bilgili ve sürümlenmiş LoRaWAN payload alanlarına nasıl dönüşeceğini ve iki taraftan biri erişilemez olduğunda ne yapılacağını tanımlar.", "Register sözleşmesini sabitleyin", "Her değer için cihaz adresi, function code, register adresi, uzunluk, veri tipi, byte order, ölçek ve mühendislik birimini kaydedin. Firmware geliştirmeden önce bir tabanlı ve sıfır tabanlı adres farkını çözün.", "Polling ve payload'ı birlikte tasarlayın", "Radyonun iletebileceğinden hızlı polling; eski veri kuyrukları veya gereksiz enerji kullanımı doğurur. Register'ları operasyonel önceliğe göre gruplayın, değişim eşikleri belirleyin ve backend decoder'ın güvenle gelişebilmesi için payload formatını sürümleyin.", "Hatayı da veri olarak ele alın", "Modbus timeout, CRC hatası, exception response, eski değer ve LoRaWAN teslim durumunu birbirinden ayırın. Son değeri güncelmiş gibi sessizce göndermeyin; uygulama gerektiriyorsa geçerlilik veya veri yaşı bilgisini taşıyın.", "Uçtan uca devreye alın", "Gerçek saha cihazı, kablo uzunluğu, seri haberleşme ayarları, gateway ve network server ile test yapın. Dashboard kabulünden önce negatif değerleri, word order'ı, limitleri, yeniden bağlantıyı ve decoder çıktısını doğrulayın.", "Entegrasyon kaydı"],
      ["de", "Industrieintegration", "Modbus-zu-LoRaWAN-Integration", "Planen Sie einen Modbus-RTU-zu-LoRaWAN-Datenweg mit Registerplan, Polling-Regeln, Payload-Versionen und Fehlerzuständen.", "Eine Bridge überträgt nicht nur Bytes. Zuverlässige Integration definiert typisierte, zeitlich zugeordnete und versionierte Payload-Felder sowie das Verhalten bei Ausfällen.", "Registervertrag festlegen", "Dokumentieren Sie Geräteadresse, Funktionscode, Register, Länge, Datentyp, Byte-Reihenfolge, Skalierung und Einheit. Klären Sie null- und einsbasierte Adressen vor der Firmware-Entwicklung.", "Polling und Payload gemeinsam planen", "Zu schnelles Polling erzeugt veraltete Warteschlangen oder unnötigen Energiebedarf. Gruppieren Sie Register nach Priorität und versionieren Sie das Payload-Format.", "Fehler als Daten behandeln", "Unterscheiden Sie Timeout, CRC-Fehler, Exception, veralteten Wert und LoRaWAN-Zustand. Senden Sie den letzten Wert nicht stillschweigend als aktuell.", "End-to-End in Betrieb nehmen", "Testen Sie Feldgerät, Kabellänge, serielle Parameter, Gateway, Network Server, Grenzwerte, Word-Reihenfolge und Decoder-Ausgabe.", "Integrationsnachweis"],
      ["fr", "Intégration industrielle", "Intégration Modbus vers LoRaWAN", "Planifier un chemin Modbus RTU–LoRaWAN avec table de registres, règles de polling, versions de payload et états d’erreur.", "Une passerelle ne déplace pas seulement des octets. L’intégration doit définir des champs typés, horodatés et versionnés ainsi que le comportement en cas d’indisponibilité.", "Figer le contrat de registres", "Documentez adresse, code fonction, registre, longueur, type, ordre des octets, échelle et unité. Résolvez l’adressage base zéro ou base un avant le firmware.", "Concevoir polling et payload ensemble", "Un polling trop rapide crée des files obsolètes ou une dépense inutile. Groupez les registres par priorité et versionnez le payload.", "Traiter l’erreur comme une donnée", "Distinguez timeout, CRC, exception, valeur périmée et état LoRaWAN. Ne transmettez pas silencieusement la dernière valeur comme actuelle.", "Mettre en service de bout en bout", "Testez l’équipement réel, le câble, les paramètres série, la gateway, le network server, les limites, l’ordre des mots et le decoder.", "Dossier d’intégration"],
      ["es", "Integración industrial", "Integración de Modbus a LoRaWAN", "Planifique una ruta Modbus RTU–LoRaWAN con mapa de registros, reglas de polling, versiones de payload y estados de fallo.", "Un puente no solo mueve bytes. La integración fiable define campos tipados, temporales y versionados, además del comportamiento ante indisponibilidad.", "Fijar el contrato de registros", "Documente dirección, function code, registro, longitud, tipo, byte order, escala y unidad. Resuelva las direcciones base cero o uno antes del firmware.", "Diseñar polling y payload juntos", "Un polling excesivo crea colas obsoletas o gasto innecesario. Agrupe registros por prioridad y versione el payload.", "Tratar el fallo como dato", "Distinga timeout, CRC, exception, valor antiguo y estado LoRaWAN. No envíe silenciosamente el último valor como actual.", "Poner en marcha de extremo a extremo", "Pruebe equipo, cable, parámetros serie, gateway, network server, límites, orden de palabras y decoder reales.", "Registro de integración"],
      ["it", "Integrazione industriale", "Integrazione da Modbus a LoRaWAN", "Pianifica un percorso Modbus RTU–LoRaWAN con mappa registri, regole di polling, versioni payload e stati di errore.", "Un bridge non trasferisce soltanto byte. L’integrazione affidabile definisce campi tipizzati, temporali e versionati e il comportamento in caso di indisponibilità.", "Bloccare il contratto dei registri", "Documenta indirizzo, function code, registro, lunghezza, tipo, byte order, scala e unità. Risolvi l’indirizzamento base zero o uno prima del firmware.", "Progettare polling e payload insieme", "Polling troppo rapido crea code obsolete o spreco energetico. Raggruppa i registri per priorità e versiona il payload.", "Trattare l’errore come dato", "Distingui timeout, CRC, exception, valore obsoleto e stato LoRaWAN. Non inviare l’ultimo valore come se fosse attuale.", "Collaudare end-to-end", "Testa dispositivo, cavo, parametri seriali, gateway, network server, limiti, word order e decoder reali.", "Scheda di integrazione"],
      ["ar", "التكامل الصناعي", "دليل التكامل من Modbus إلى LoRaWAN", "خطط لمسار Modbus RTU–LoRaWAN مع خريطة registers وقواعد polling وإصدارات payload وحالات الخطأ.", "الجسر لا ينقل bytes فقط. التكامل الموثوق يحدد الحقول بأنواعها وتوقيتها وإصداراتها والسلوك عند تعذر أي طرف.", "تثبيت عقد registers", "وثق عنوان الجهاز وfunction code وعنوان register والطول والنوع وbyte order والتحجيم والوحدة. احسم الفرق بين العنوان الصفري والأحادي قبل firmware.", "تصميم polling وpayload معاً", "يؤدي polling الأسرع من الإرسال إلى بيانات قديمة أو طاقة مهدرة. جمّع registers حسب الأولوية وأضف إصداراً إلى payload.", "اعتبار الخطأ بيانات", "ميّز timeout وخطأ CRC وexception والقيمة القديمة وحالة LoRaWAN. لا ترسل آخر قيمة بصمت وكأنها حديثة.", "التشغيل من طرف إلى طرف", "اختبر الجهاز والكابل والإعدادات التسلسلية وgateway وnetwork server والحدود وword order وdecoder الفعلية.", "سجل التكامل"],
      ["ja", "産業システム連携", "ModbusからLoRaWANへの連携ガイド", "register map、polling規則、payloadバージョン、障害状態を明示したModbus RTU–LoRaWANデータ経路を設計します。", "bridgeはbyteを移すだけではありません。信頼できる連携では、型、時刻、バージョンを持つpayloadへの変換と障害時の動作を定義します。", "Register仕様を固定する", "機器アドレス、function code、register、長さ、型、byte order、倍率、単位を記録し、0基準と1基準の差をfirmware開発前に解決します。", "Pollingとpayloadを一緒に設計する", "無線送信より速いpollingは古いキューや電力浪費を生みます。優先度でregisterを分け、payload形式をバージョン管理します。", "障害をデータとして扱う", "timeout、CRC、exception、古い値、LoRaWAN配信状態を区別し、最後の値を最新として黙って送らないようにします。", "End-to-Endで試運転する", "実機、ケーブル、シリアル設定、gateway、network server、負数、word order、範囲、decoder出力を確認します。", "連携記録"],
    ] as const).map(([locale, eyebrow, title, description, intro, h1, b1, h2, b2, h3, b3, h4, b4, checklistTitle]) => [locale, {
      eyebrow, title, description, intro,
      sections: [{ heading: h1, body: b1 }, { heading: h2, body: b2 }, { heading: h3, body: b3 }, { heading: h4, body: b4 }],
      checklistTitle,
      checklist: ({
        en: ["Register map and device address", "Serial communication settings", "Polling and timeout policy", "Payload version and decoder", "Data validity", "End-to-end acceptance test"],
        tr: ["Register haritası ve cihaz adresi", "Seri haberleşme ayarları", "Polling ve timeout politikası", "Payload sürümü ve decoder", "Veri geçerliliği", "Uçtan uca kabul testi"],
        de: ["Registerplan und Geräteadresse", "Serielle Einstellungen", "Polling und Timeout", "Payload-Version und Decoder", "Datengültigkeit", "End-to-End-Abnahme"],
        fr: ["Table de registres et adresse", "Paramètres série", "Polling et timeout", "Version du payload et decoder", "Validité des données", "Recette de bout en bout"],
        es: ["Mapa de registros y dirección", "Ajustes serie", "Polling y timeout", "Versión de payload y decoder", "Validez de datos", "Prueba de extremo a extremo"],
        it: ["Mappa registri e indirizzo", "Parametri seriali", "Polling e timeout", "Versione payload e decoder", "Validità dei dati", "Collaudo end-to-end"],
        ar: ["خريطة registers وعنوان الجهاز", "إعدادات الاتصال التسلسلي", "سياسة polling وtimeout", "إصدار payload وdecoder", "صلاحية البيانات", "اختبار القبول من طرف إلى طرف"],
        ja: ["Register mapと機器アドレス", "シリアル通信設定", "Pollingとtimeout方針", "Payloadバージョンとdecoder", "データ有効性", "End-to-End受入試験"],
      } as Record<string, string[]>)[locale],
    }])) as Record<Locale, TechnicalGuideCopy>,
  ),
];

export const GUIDE_INDEX_COPY: Record<Locale, { eyebrow: string; title: string; description: string; intro: string; read: string; minutes: string; source: string; related: string; allGuides: string }> = {
  en: { eyebrow: "Engineering knowledge", title: "Technical Guides", description: "Practical guides for LoRaWAN device selection, power planning and industrial integration.", intro: "Engineering notes built around the decisions that must be recorded before a connected device moves from catalog selection to field deployment.", read: "Read guide", minutes: "min read", source: "Primary technical reference", related: "Related products", allGuides: "All technical guides" },
  tr: { eyebrow: "Mühendislik bilgisi", title: "Teknik Rehberler", description: "LoRaWAN cihaz seçimi, güç planlama ve endüstriyel entegrasyon için uygulanabilir teknik rehberler.", intro: "Bağlantılı bir cihaz katalog seçiminden saha kurulumuna geçmeden önce kayda alınması gereken mühendislik kararlarına odaklanan notlar.", read: "Rehberi okuyun", minutes: "dk okuma", source: "Birincil teknik kaynak", related: "İlgili ürünler", allGuides: "Tüm teknik rehberler" },
  de: { eyebrow: "Engineering-Wissen", title: "Technische Leitfäden", description: "Praxisleitfäden für LoRaWAN-Geräteauswahl, Energieplanung und Industrieintegration.", intro: "Technische Notizen zu Entscheidungen, die vor dem Feldeinsatz eines vernetzten Geräts dokumentiert werden müssen.", read: "Leitfaden lesen", minutes: "Min. Lesezeit", source: "Technische Primärquelle", related: "Passende Produkte", allGuides: "Alle Leitfäden" },
  fr: { eyebrow: "Connaissances techniques", title: "Guides techniques", description: "Guides pratiques pour la sélection LoRaWAN, la planification énergétique et l’intégration industrielle.", intro: "Notes consacrées aux décisions à documenter avant le passage d’un appareil connecté du catalogue au terrain.", read: "Lire le guide", minutes: "min de lecture", source: "Référence technique primaire", related: "Produits associés", allGuides: "Tous les guides" },
  es: { eyebrow: "Conocimiento técnico", title: "Guías técnicas", description: "Guías prácticas para selección LoRaWAN, planificación energética e integración industrial.", intro: "Notas centradas en las decisiones que deben registrarse antes de llevar un dispositivo conectado del catálogo al campo.", read: "Leer guía", minutes: "min de lectura", source: "Referencia técnica primaria", related: "Productos relacionados", allGuides: "Todas las guías" },
  it: { eyebrow: "Conoscenza tecnica", title: "Guide tecniche", description: "Guide pratiche per selezione LoRaWAN, pianificazione energetica e integrazione industriale.", intro: "Note sulle decisioni da registrare prima che un dispositivo connesso passi dal catalogo al campo.", read: "Leggi la guida", minutes: "min di lettura", source: "Riferimento tecnico primario", related: "Prodotti correlati", allGuides: "Tutte le guide" },
  ar: { eyebrow: "المعرفة الهندسية", title: "الأدلة الفنية", description: "أدلة عملية لاختيار أجهزة LoRaWAN وتخطيط الطاقة والتكامل الصناعي.", intro: "ملاحظات تركز على القرارات التي يجب توثيقها قبل انتقال الجهاز المتصل من الكتالوج إلى الموقع.", read: "اقرأ الدليل", minutes: "دقيقة قراءة", source: "المرجع الفني الأساسي", related: "المنتجات ذات الصلة", allGuides: "جميع الأدلة" },
  ja: { eyebrow: "エンジニアリング知識", title: "技術ガイド", description: "LoRaWAN機器選定、電力設計、産業システム連携の実践ガイドです。", intro: "コネクテッドデバイスをカタログ選定から現場導入へ進める前に記録すべき設計判断をまとめています。", read: "ガイドを読む", minutes: "分", source: "一次技術資料", related: "関連製品", allGuides: "すべての技術ガイド" },
};

export function technicalGuide(slug: string | undefined): TechnicalGuide | undefined {
  return TECHNICAL_GUIDES.find((item) => item.slug === String(slug || ""));
}
