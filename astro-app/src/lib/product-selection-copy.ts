export const productSelectionCopy: Record<string, { en: string; tr: string; de: string }> = {
  willowbee: {
    en: "Build battery-powered LoRaWAN sensor nodes with an STM32WL MCU module for embedded designs.",
    tr: "Pille çalışan LoRaWAN sensör düğümleri tasarlamak için STM32WL tabanlı MCU modülü.",
    de: "STM32WL-MCU-Modul zur Entwicklung batteriebetriebener LoRaWAN-Sensorknoten.",
  },
  willowsonic: {
    en: "Measure water tank and silo fill levels without touching the material. This IP67 ultrasonic LoRaWAN sensor measures distances up to 7.5 m.",
    tr: "Su tankı ve silo doluluk seviyesini malzemeye temas etmeden ölçün. IP67 korumalı ultrasonik LoRaWAN sensörü 7,5 m’ye kadar mesafe ölçer.",
    de: "Füllstände in Wassertanks und Silos berührungslos messen. Der LoRaWAN-Ultraschallsensor mit IP67 misst Entfernungen bis zu 7,5 m.",
  },
  willowair: {
    en: "Monitor indoor air quality in offices and buildings with a LoRaWAN sensor for TVOC, equivalent CO₂ (eCO₂) and temperature.",
    tr: "Ofis ve binalarda TVOC, eşdeğer CO₂ (eCO₂) ve sıcaklık değerlerini LoRaWAN ile izleyin.",
    de: "Innenraumluft in Büros und Gebäuden überwachen. Der LoRaWAN-Sensor erfasst TVOC, CO₂-Äquivalent (eCO₂) und Temperatur.",
  },
  willowgps: {
    en: "Track equipment and fleet assets over LoRaWAN with GPS position, altitude and speed readings.",
    tr: "Ekipman ve filo varlıklarının GPS konumunu, rakımını ve hızını LoRaWAN üzerinden izleyin.",
    de: "Geräte und Flottenobjekte per LoRaWAN orten und GPS-Position, Höhe und Geschwindigkeit erfassen.",
  },
  willowpanic: {
    en: "Give lone workers a way to send a manual alert with an IP67 industrial LoRaWAN panic button.",
    tr: "Yalnız çalışanların manuel alarm göndermesi için IP67 korumalı endüstriyel LoRaWAN panik butonu.",
    de: "Industrieller LoRaWAN-Notruftaster mit IP67 für manuelle Alarme bei Alleinarbeit.",
  },
  willowsens: {
    en: "Monitor whether doors and access points are open or closed with a LoRaWAN door contact sensor.",
    tr: "Kapı ve erişim noktalarının açık veya kapalı durumunu LoRaWAN kapı kontak sensörüyle izleyin.",
    de: "Den Öffnungszustand von Türen und Zugängen mit einem LoRaWAN-Türkontaktsensor überwachen.",
  },
  willowtilt: {
    en: "Monitor changes in tilt and three-axis acceleration on outdoor structures and equipment over LoRaWAN.",
    tr: "Dış ortam yapılarında ve ekipmanda eğim değişimini ve üç eksenli ivmeyi LoRaWAN üzerinden izleyin.",
    de: "Neigungsänderungen und Beschleunigung auf drei Achsen an Außenanlagen und Geräten per LoRaWAN überwachen.",
  },
  willowtemp: {
    en: "Monitor temperature and relative humidity remotely with an IP67 LoRaWAN sensor for outdoor and storage environments.",
    tr: "Dış ortam ve depolama alanlarında sıcaklık ile bağıl nemi IP67 korumalı LoRaWAN sensörüyle uzaktan izleyin.",
    de: "Temperatur und relative Luftfeuchte im Freien und in Lagerbereichen mit einem LoRaWAN-Sensor der Schutzart IP67 überwachen.",
  },
  willowmod: {
    en: "Read RS485 Modbus RTU registers from energy meters and PLCs and transmit the readings over LoRaWAN.",
    tr: "Enerji sayaçları ve PLC’lerdeki RS485 Modbus RTU register’larını okuyup değerleri LoRaWAN üzerinden iletin.",
    de: "RS485-Modbus-RTU-Register von Energiezählern und SPS auslesen und die Messwerte per LoRaWAN übertragen.",
  },
  willowmos: {
    en: "Measure soil moisture and soil temperature over LoRaWAN for irrigation and field monitoring.",
    tr: "Sulama ve tarla takibi için toprak nemini ve sıcaklığını LoRaWAN üzerinden ölçün.",
    de: "Bodenfeuchte und Bodentemperatur für Bewässerung und Feldüberwachung per LoRaWAN messen.",
  },
  willowpre: {
    en: "Monitor liquid pressure in pipes, pumps and tanks with an IP67 LoRaWAN pressure sensor rated for 0–1500 PSI.",
    tr: "Boru, pompa ve tanklardaki sıvı basıncını 0–1500 PSI aralığında, IP67 korumalı LoRaWAN sensörüyle izleyin.",
    de: "Flüssigkeitsdruck in Rohrleitungen, Pumpen und Tanks mit einem IP67-LoRaWAN-Drucksensor für 0–1500 PSI überwachen.",
  },
  willowane: {
    en: "Measure outdoor wind speed and direction with an ultrasonic LoRaWAN anemometer.",
    tr: "Dış ortamda rüzgâr hızını ve yönünü ultrasonik LoRaWAN anemometreyle ölçün.",
    de: "Windgeschwindigkeit und Windrichtung im Freien mit einem LoRaWAN-Ultraschallanemometer messen.",
  },
  lumiosafe: {
    en: "Trigger spoken announcements and visual alerts with a LoRaWAN Class C voice and light beacon.",
    tr: "LoRaWAN Class C sesli ve ışıklı uyarı cihazıyla anons ve görsel uyarı tetikleyin.",
    de: "Sprachansagen und Lichtsignale mit einem LoRaWAN-Signalgeber der Klasse C auslösen.",
  },
};

type SelectionLanguage = "en" | "tr" | "de";

export const productSelectionQuestions: Record<string, Record<SelectionLanguage, [question: string, answer: string]>> = {
  willowbee: {
    en: ["Can I use WillowBee to build a battery-powered LoRaWAN sensor?", "Yes. WillowBee is an STM32WL MCU module for integrating LoRaWAN into a custom sensor node. Before designing the PCB, verify the supply voltage, GPIO needs, antenna layout and regional frequency plan for the chosen variant."],
    tr: ["WillowBee ile pilli bir LoRaWAN sensörü geliştirebilir miyim?", "Evet. WillowBee, özel sensör düğümlerine LoRaWAN eklemek için STM32WL tabanlı bir MCU modülüdür. PCB tasarımından önce seçilen modelin besleme gerilimini, GPIO ihtiyacını, anten yerleşimini ve bölgesel frekans planını doğrulayın."],
    de: ["Eignet sich WillowBee für einen batteriebetriebenen LoRaWAN-Sensor?", "Ja. Das STM32WL-MCU-Modul integriert LoRaWAN in eigene Sensorknoten. Prüfen Sie vor dem Platinenentwurf Versorgungsspannung, GPIO-Bedarf, Antennenlayout und Frequenzplan der gewählten Variante."],
  },
  willowsonic: {
    en: ["Will WillowSonic work in a 7 m water tank?", "The WS-O-X-AI-UD-1 brochure specifies up to 7.5 m of target distance. Compare the empty-tank distance from the actual mounting point and confirm the minimum clearance at maximum fill. The brochure does not specify a minimum distance. Test under representative conditions if foam or obstructions are present."],
    tr: ["WillowSonic 7 metrelik bir su tankında çalışır mı?", "WS-O-X-AI-UD-1 broşüründe hedef mesafesi 7,5 m’ye kadar belirtilir. Tank boşken gerçek montaj noktasından yüzeye olan mesafeyi hesaplayın. Tank doluyken gereken minimum açıklığı doğrulayın. Broşürde bu minimum değer belirtilmiyor. Köpük veya engel varsa saha testi yapın."],
    de: ["Eignet sich WillowSonic für einen 7 m tiefen Wassertank?", "Die Broschüre WS-O-X-AI-UD-1 nennt bis zu 7,5 m Zielabstand. Prüfen Sie den Abstand ab dem tatsächlichen Montagepunkt bei leerem Tank und den Mindestabstand bei maximaler Füllung. Die Broschüre nennt keinen Mindestabstand. Bei Schaum oder Hindernissen empfiehlt sich ein Test vor Ort."],
  },
  willowair: {
    en: ["Does WillowAir measure CO₂ directly?", "WillowAir reports eCO₂, an equivalent CO₂ value, along with TVOC and temperature. If your specification requires direct CO₂ measurement, choose a sensor that explicitly supports it."],
    tr: ["WillowAir CO₂’yi doğrudan ölçer mi?", "WillowAir, TVOC ve sıcaklıkla birlikte eşdeğer CO₂ değeri olan eCO₂’yi raporlar. Şartnameniz doğrudan CO₂ ölçümü gerektiriyorsa bu özelliği açıkça destekleyen bir sensör seçin."],
    de: ["Misst WillowAir CO₂ direkt?", "WillowAir meldet eCO₂, einen CO₂-Äquivalentwert, sowie TVOC und Temperatur. Wenn Ihre Spezifikation eine direkte CO₂-Messung fordert, wählen Sie einen Sensor, der diese ausdrücklich unterstützt."],
  },
  willowgps: {
    en: ["What should I check before tracking equipment with WillowGPS?", "WillowGPS reports GPS position, altitude and speed over LoRaWAN. Test GPS reception and LoRaWAN coverage independently at the equipment’s mounting point and along its expected route."],
    tr: ["WillowGPS ile ekipman takibinden önce neyi kontrol etmeliyim?", "WillowGPS konum, rakım ve hız verisini LoRaWAN üzerinden iletir. Ekipmanın montaj noktasında ve öngörülen güzergâhta GPS alımını ve LoRaWAN kapsamasını ayrı ayrı test edin."],
    de: ["Was sollte ich vor der Geräteortung mit WillowGPS prüfen?", "WillowGPS überträgt Position, Höhe und Geschwindigkeit per LoRaWAN. Testen Sie GPS-Empfang und LoRaWAN-Abdeckung getrennt am Montageort und entlang der vorgesehenen Route."],
  },
  willowpanic: {
    en: ["What should I test before deploying WillowPanic for lone workers?", "WillowPanic sends a manually triggered alert. Test the complete path from the button through LoRaWAN to the person who responds, including how the team handles a missed or delayed alert."],
    tr: ["Yalnız çalışanlar için WillowPanic kurulumunda neyi test etmeliyim?", "WillowPanic manuel tetiklenen bir alarm gönderir. Butondan LoRaWAN üzerinden alarma müdahale edecek kişiye kadar tüm zinciri test edin. Geciken veya ulaşmayan alarm için izlenecek adımı da doğrulayın."],
    de: ["Was sollte ich vor dem Einsatz von WillowPanic bei Alleinarbeit testen?", "WillowPanic sendet einen manuell ausgelösten Alarm. Testen Sie die gesamte Meldekette vom Taster über LoRaWAN bis zur zuständigen Person, einschließlich des Ablaufs bei verspäteten oder ausgebliebenen Meldungen."],
  },
  willowsens: {
    en: ["Can WillowSens tell whether a door is open or closed?", "Yes. WillowSens reports door contact state over LoRaWAN. During commissioning, check both states and confirm that the receiving application interprets them correctly."],
    tr: ["WillowSens kapının açık veya kapalı olduğunu bildirir mi?", "Evet. WillowSens kapı kontak durumunu LoRaWAN üzerinden iletir. Devreye alırken iki durumu da test edin ve alıcı uygulamanın bunları doğru yorumladığını doğrulayın."],
    de: ["Meldet WillowSens, ob eine Tür offen oder geschlossen ist?", "Ja. WillowSens überträgt den Türkontaktstatus per LoRaWAN. Prüfen Sie bei der Inbetriebnahme beide Zustände und deren korrekte Zuordnung in der Anwendung."],
  },
  willowtilt: {
    en: ["How do I verify WillowTilt readings after installation?", "WillowTilt measures tilt and three-axis acceleration. Record the mounted orientation, establish a reference reading and verify which sensor axis corresponds to the movement you want to detect."],
    tr: ["WillowTilt ölçümlerini montaj sonrası nasıl doğrularım?", "WillowTilt eğimi ve üç eksenli ivmeyi ölçer. Montaj yönünü kaydedin, bir referans ölçümü alın ve takip etmek istediğiniz hareketin hangi sensör eksenine karşılık geldiğini doğrulayın."],
    de: ["Wie prüfe ich WillowTilt-Messwerte nach der Montage?", "WillowTilt misst Neigung und Beschleunigung auf drei Achsen. Dokumentieren Sie die Einbaulage, erfassen Sie einen Referenzwert und prüfen Sie die zur gewünschten Bewegung passende Sensorachse."],
  },
  willowtemp: {
    en: ["What temperature and humidity ranges does WillowTemp cover?", "The brochure lists −20 °C to +80 °C and 0–100% relative humidity. It specifies ±0.2 °C temperature accuracy. For an acceptance test, confirm accuracy requirements at your actual operating points."],
    tr: ["WillowTemp hangi sıcaklık ve nem aralıklarını ölçer?", "Broşürde −20 °C ile +80 °C ve %0–100 bağıl nem belirtiliyor. Sıcaklık doğruluğu ±0,2 °C olarak veriliyor. Kabul testinde gereken doğruluğu gerçek çalışma noktalarınızda doğrulayın."],
    de: ["Welche Temperatur- und Feuchtebereiche deckt WillowTemp ab?", "Die Broschüre nennt −20 °C bis +80 °C und 0–100 % relative Luftfeuchte. Die Temperaturgenauigkeit ist mit ±0,2 °C angegeben. Prüfen Sie die notwendige Genauigkeit für Ihre tatsächlichen Betriebspunkte."],
  },
  willowmod: {
    en: ["How do I read a meter register with WillowMod?", "Set the RS485 serial parameters and first register address to match the meter manual. In the documented WS-O-8-AE-MB-1 uplink example, bytes 2 and 3 are the high and low bytes of register 0. Apply the meter’s signedness, scale and unit before displaying the reading."],
    tr: ["WillowMod ile sayaç register’ı nasıl okunur?", "RS485 seri parametrelerini ve ilk register adresini sayaç kılavuzuyla eşleştirin. WS-O-8-AE-MB-1 kılavuzundaki uplink örneğinde 2. ve 3. indekslerde register 0’ın yüksek ve düşük baytları bulunur. Ölçümü gösterirken sayacın işaret, ölçek ve birim tanımını kullanın."],
    de: ["Wie lese ich ein Zählerregister mit WillowMod aus?", "Gleichen Sie RS485-Parameter und erste Registeradresse mit dem Zählerhandbuch ab. Im dokumentierten Uplink-Beispiel des WS-O-8-AE-MB-1 stehen an Byteposition 2 und 3 das High- und Low-Byte von Register 0. Berücksichtigen Sie Vorzeichen, Skalierung und Einheit des Zählers."],
  },
  willowmos: {
    en: ["Where should I place WillowMos for irrigation monitoring?", "WillowMos measures soil moisture and soil temperature. Place it at a depth representative of the crop’s root zone and compare readings before and after irrigation at that location."],
    tr: ["Sulama takibi için WillowMos nereye yerleştirilmeli?", "WillowMos toprak nemini ve sıcaklığını ölçer. Sensörü bitkinin kök bölgesini temsil eden derinliğe yerleştirin ve aynı noktada sulama öncesi ile sonrası ölçümlerini karşılaştırın."],
    de: ["Wo sollte WillowMos zur Bewässerungsüberwachung platziert werden?", "WillowMos misst Bodenfeuchte und Bodentemperatur. Platzieren Sie den Sensor in einer repräsentativen Tiefe der Wurzelzone und vergleichen Sie die Werte am selben Ort vor und nach der Bewässerung."],
  },
  willowpre: {
    en: ["Can I use WillowPre to measure pipe pressure outdoors?", "The catalog lists an IP67 enclosure and a 0–1500 PSI pressure range. Confirm that the operating pressure, process connection and wetted materials suit your installation before ordering."],
    tr: ["WillowPre dış ortamda boru basıncını ölçebilir mi?", "Katalogda IP67 muhafaza ve 0–1500 PSI basınç aralığı belirtiliyor. Siparişten önce çalışma basıncını, proses bağlantısını ve akışkanla temas eden malzemelerin uygunluğunu doğrulayın."],
    de: ["Kann WillowPre den Rohrleitungsdruck im Freien messen?", "Der Katalog nennt ein IP67-Gehäuse und einen Druckbereich von 0–1500 PSI. Prüfen Sie vor der Bestellung Betriebsdruck, Prozessanschluss und medienberührte Werkstoffe."],
  },
  willowane: {
    en: ["How do I choose a mounting point for WillowAne?", "WillowAne measures wind speed and direction. Select a representative point away from airflow disturbances caused by nearby structures and verify the direction reference after installation."],
    tr: ["WillowAne için montaj noktası nasıl seçilir?", "WillowAne rüzgâr hızını ve yönünü ölçer. Yakın yapıların hava akışını bozmadığı, sahayı temsil eden bir nokta seçin ve montajdan sonra yön referansını doğrulayın."],
    de: ["Wie wähle ich den Montageort für WillowAne?", "WillowAne misst Windgeschwindigkeit und Windrichtung. Wählen Sie einen repräsentativen Standort mit möglichst wenig Strömungsstörungen durch nahe Bauwerke und prüfen Sie nach der Montage den Richtungsbezug."],
  },
  lumiosafe: {
    en: ["Does LumioSafe support English or German voice announcements?", "The current catalog lists a Turkish voice fragment set. Confirm the available language set and firmware with Willow Software before specifying English or German announcements."],
    tr: ["LumioSafe İngilizce veya Almanca sesli anons yapabilir mi?", "Mevcut katalogda Türkçe ses parçaları belirtiliyor. İngilizce veya Almanca anons gereksinimi için kullanılabilir dil paketini ve firmware sürümünü Willow Software ile doğrulayın."],
    de: ["Unterstützt LumioSafe englische oder deutsche Sprachansagen?", "Der aktuelle Katalog nennt türkische Sprachbausteine. Klären Sie verfügbare Sprachpakete und Firmware mit Willow Software, bevor Sie englische oder deutsche Ansagen einplanen."],
  },
};
