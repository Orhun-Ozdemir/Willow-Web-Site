# WillowSoft Dynamic Website Plan

## Amaç

WillowSoft sitesi yalnızca statik HTML sayfalardan oluşmamalı. Site; yeni haber, yeni ürün, yeni müşteri logosu, yeni çözüm alanı ve yeni dil desteği eklendiğinde kod yazmadan güncellenebilen, ama performans olarak statik site kadar hızlı çalışan modern bir company website olmalı.

## Implementation Status

Başlangıç MVP uygulaması yapıldı:

- `data/site-data.json` eklendi.
- `data/leads.json` eklendi.
- `server.mjs` eklendi.
- `admin.html` eklendi.
- `assets/cms.js` eklendi.
- `assets/admin.js` eklendi.
- `news.html` eklendi.
- `products.html` ürünleri CMS datasından render edecek hale getirildi.
- `index.html` müşteri logoları, öne çıkan ürünler ve news preview için CMS datasına bağlandı.
- Contact ve Start Project formları `/api/leads` endpointine gönderim yapacak hale getirildi.
- Admin login/session endpointleri eklendi: `/api/login`, `/api/logout`, `/api/session`.
- Admin içerik kaydetme, lead okuma ve lead güncelleme API'leri session korumasına alındı.
- Dinamik ürün detay route'u eklendi: `/products/{slug}`.
- Dinamik haber detay route'u eklendi: `/news/{slug}`.
- Public ürün ve haber kartları artık otomatik slug detay sayfalarına bağlanıyor.
- 8 dil URL altyapısı eklendi: `/en`, `/tr`, `/de`, `/fr`, `/es`, `/it`, `/ar`, `/ja`.
- Locale route rewrite eklendi: `/tr/products`, `/tr/products/{slug}`, `/ar/news/{slug}` gibi URL'ler çalışıyor.
- `assets/i18n.js` eklendi.
- Public sayfalara language switcher eklendi.
- Nav, CTA ve bazı temel UI metinleri seçili dile göre çevriliyor.
- Arabic için `dir="rtl"` desteği eklendi.
- `data/events.json` eklendi.
- `/api/events` endpointi eklendi.
- Public sayfalara `assets/analytics.js` eklendi.
- Page view, page duration, nav click, CTA click, product/news click, language switch, filter click, client logo interaction ve form submit eventleri takip ediliyor.
- Admin paneline Analytics sekmesi eklendi.
- Analytics paneli toplam event, tekil ziyaretçi, ortalama sayfa süresi, en çok bakılan sayfalar, ülke sinyalleri ve son aktiviteleri gösteriyor.
- `robots.txt` eklendi.
- Dinamik `/sitemap.xml` üretimi eklendi.
- `llms.txt` ve dinamik `/llms-full.txt` eklendi.
- `site.webmanifest` eklendi.
- `pageContent` modeli eklendi; Home, Products, News, Services, Solutions, Company, Contact ve Start Project ana metinleri dil bazlı yönetilebilir hale getirildi.
- Ürünlere `localized` alanları eklendi: title, category, shortDescription, chips, technicalSummary, useCases, specifications.
- Haberlere `localized` alanları eklendi: title, category, excerpt, content.
- Müşteri logolarına `localized` alanları eklendi: name, industry, country.
- Public render seçili locale için çeviri varsa onu, yoksa İngilizce fallback metnini gösteriyor.
- Admin paneline `Page Texts` sekmesi eklendi.
- Product, News ve Client editörlerine 7 ek dil için translation alanları eklendi.
- Settings içine `UI Labels` editörü eklendi; nav, CTA ve sistem metinleri 8 dilde düzenlenebilir hale getirildi.

Bu uygulama henüz tam production CMS değildir. Ancak mevcut static siteyi bozmadan dinamik içerik, admin panel ve lead yönetimi için çalışan MVP tabanını başlatır.

Bu planın hedefi:

- Kurumsal tanıtımı güçlü ve profesyonel tutmak.
- Ürün, haber ve müşteri logolarını dinamik yönetmek.
- Services içinde Web, PostgreSQL, VR, Mobile, Backend, Firmware ve Hardware alanlarını güçlü göstermek.
- Global pazara uygun 8 dil desteği vermek.
- Mobil, tablet ve desktop için aynı kalitede deneyim sunmak.
- MVP ile hızlı başlamak ama ileride büyüyebilecek altyapıyı baştan doğru kurmak.

## Önerilen Teknik Yapı

### En Doğru Yaklaşım

Site için önerilen yapı: **CMS destekli hybrid static/dynamic website**.

Yani:

- Sayfalar CDN üzerinden hızlı açılacak.
- Ürünler, haberler, müşteri logoları ve şirket bilgileri CMS üzerinden yönetilecek.
- Yeni ürün eklendiğinde otomatik ürün detay sayfası oluşacak.
- Yeni haber eklendiğinde otomatik haber detay sayfası oluşacak.
- 8 dil için her içerik ayrı çeviri alanlarıyla yönetilecek.
- Admin paneli özel yazılmak zorunda olmayacak; CMS admin paneli kullanılacak.

### Önerilen Stack

1. **Frontend:** Next.js veya Astro
2. **Styling:** Tailwind CSS
3. **Animation:** GSAP, Framer Motion veya shader/canvas tabanlı özel hero animasyonu
4. **CMS:** Sanity, Strapi, Directus veya Payload CMS
5. **Database:** PostgreSQL, eğer CMS self-host olacaksa
6. **Deployment:** Vercel, Netlify, Cloudflare Pages veya kendi VPS
7. **Media:** CMS media library + CDN
8. **Forms:** CRM/email entegrasyonlu contact ve start project formu

MVP için en pratik öneri: **Next.js + Sanity CMS + Tailwind CSS**.

Neden:

- Kurumsal site için hızlıdır.
- Ürün ve haber detayları dinamik route ile kolay büyür.
- Çok dil desteği iyi yönetilir.
- Görsel ve video yönetimi CMS tarafında rahat olur.
- Admin paneli hazır gelir, ayrıca admin yazmaya gerek kalmaz.

## Site Route Yapısı

İlk plan 22 sayfa gibi başlar, ama dinamik altyapıyla ürün ve haber sayısı sınırsız büyüyebilir.

### Ana Sayfalar

1. `/`
   - Motion hero
   - Güven / müşteri logoları
   - Problem ve çözüm anlatımı
   - Services preview
   - Products preview
   - News / proof preview
   - CTA

2. `/services`
   - Tüm hizmetler tek güçlü sayfada
   - Embedded Hardware Design
   - Firmware Development
   - Backend API
   - PostgreSQL & Database Architecture
   - Web Platform / Admin Panel
   - Mobile App Development
   - VR / Simulation
   - IoT Cloud / Telemetry

3. `/solutions`
   - GES uzaktan izleme
   - Su / seviye ölçüm
   - Endüstriyel makine kontrol
   - Operasyon izleme
   - Field telemetry

4. `/products`
   - Dinamik ürün kataloğu
   - Kategori filtreleri
   - Ürün kartları
   - Quote / inquiry odaklı CTA

5. `/company`
   - 2020 kuruluş
   - Türkiye + UK operasyonu
   - 9 ülkeye ihracat bilgisi
   - R&D-first engineering yaklaşımı
   - Fuarlar, haberler ve güven sinyalleri

6. `/news`
   - Dinamik haber listesi
   - Tarih, kategori ve öne çıkan haber sistemi

7. `/contact`
   - Genel iletişim
   - E-posta / telefon
   - Ofis bölgeleri
   - İletişim formu

8. `/start-project`
   - Lead toplama odaklı landing page
   - Minimum menü
   - Proje ihtiyacı formu
   - Hangi servis katmanına ihtiyaç var seçimi

### Dinamik Ürün Sayfaları

Route yapısı:

`/products/[slug]`

İlk ürünler:

1. WillowBee LoRaWAN Module
2. LoRaWAN Temperature & Humidity Sensor
3. LoRaWAN CO2 Sensor
4. LoRaWAN Modbus Bridge / Sensor
5. LoRaWAN IP67 Outdoor Temperature Sensor
6. LoRaWAN Panic Button
7. LoRaWAN Battery Level Monitoring Sensor
8. LoRaWAN Soil Moisture Sensor
9. LoRaWAN Tilt Sensor
10. LoRaWAN Indoor Tilt Sensor
11. LoRaWAN Anemometer
12. LoRaWAN Door Sensor
13. LoRaWAN Ultrasonic Level Sensor
14. LoRaWAN Barometric Pressure Sensor

Yeni ürün eklendiğinde CMS içinde ürün oluşturulur, slug verilir ve sayfa otomatik oluşur.

### Dinamik Haber Sayfaları

Route yapısı:

`/news/[slug]`

İlk haberler:

1. Embedded World 2026
2. UK Operations in London
3. Minister Varank Visit
4. WIN EURASIA
5. Bakım İstanbul
6. Industry 4.0 Fair
7. TÜBİTAK LoRaWAN Workshop
8. USA Export Milestone
9. Muğla Teknopark Launch

Yeni haber eklendiğinde CMS içinde haber oluşturulur, tarih ve görseller girilir, haber listesi ve detay sayfası otomatik güncellenir.

## CMS İçerik Modelleri

### Product

Her ürün CMS içinde şu alanlara sahip olmalı:

- `title`
- `slug`
- `category`
- `shortDescription`
- `heroImage`
- `gallery`
- `technicalSummary`
- `features`
- `useCases`
- `specifications`
- `documents`
- `relatedProducts`
- `ctaLabel`
- `seoTitle`
- `seoDescription`
- `translations`

Neden:

Ürün sayfası sadece görsel katalog gibi kalmamalı. Müşteri ürünü görünce ne işe yaradığını, hangi problem için kullanılacağını, teknik olarak ne sunduğunu ve nasıl teklif alacağını hemen anlamalı.

### News

Her haber CMS içinde şu alanlara sahip olmalı:

- `title`
- `slug`
- `date`
- `category`
- `excerpt`
- `coverImage`
- `content`
- `relatedProducts`
- `relatedServices`
- `seoTitle`
- `seoDescription`
- `translations`

Neden:

News sadece blog gibi değil, proof alanı gibi çalışmalı. Fuarlar, ihracat, bakan ziyareti, UK operasyonu ve workshop haberleri şirketin güvenilirliğini artırmalı.

### Client / Brand Logo

Müşteri logoları CMS içinde yönetilmeli:

- `companyName`
- `logo`
- `industry`
- `country`
- `isFeatured`
- `sortOrder`
- `caseStudyUrl`

Neden:

Yeni müşteri veya partner eklendiğinde tasarım bozulmadan otomatik listeye girmeli. Logolar grayscale rest state, hover/focus durumunda premium brand treatment ile gösterilmeli.

### Service Capability

Services sayfasındaki her hizmet CMS veya config içinden yönetilebilir olmalı:

- `title`
- `slug`
- `summary`
- `whatItDoes`
- `whoNeedsIt`
- `deliverables`
- `exampleOutput`
- `relatedProducts`
- `relatedSolutions`
- `icon`

Neden:

Services tarafında tekrar eden kartlar yerine capability matrix kullanılmalı. Müşteri “WillowSoft ne yapıyor?” değil, “Benim problemimi hangi katmanda çözüyor?” sorusunun cevabını görmeli.

### Solution

Solution içerikleri:

- `title`
- `slug`
- `industry`
- `problem`
- `willowsoftApproach`
- `systemLayers`
- `productsUsed`
- `servicesUsed`
- `proof`
- `cta`

Neden:

Solutions sayfası ürünleri ve hizmetleri gerçek kullanım alanına bağlamalı. Örneğin GES uzaktan izleme, sadece “IoT solution” değil; sensor, gateway, backend, dashboard ve alarm yapısı olarak anlatılmalı.

## 8 Dil Desteği

### Desteklenecek Diller

İlk global dil seti:

1. English - `en`
2. Turkish - `tr`
3. German - `de`
4. French - `fr`
5. Spanish - `es`
6. Italian - `it`
7. Arabic - `ar`
8. Japanese - `ja`

Bu seçim WillowSoft için mantıklı çünkü mevcut şirket anlatımında UK, Turkey, Germany, Italy, Japan, Saudi Arabia ve global ihracat bilgileri öne çıkıyor.

### URL Yapısı

Önerilen yapı:

- `/en`
- `/tr`
- `/de`
- `/fr`
- `/es`
- `/it`
- `/ar`
- `/ja`

Örnek:

- `/en/products/willowbee-lorawan-module`
- `/tr/products/willowbee-lorawan-module`
- `/de/products/willowbee-lorawan-module`

### Çeviri Yönetimi

İki seçenek var:

1. **CMS içinde field-level translation**
   - Her ürün, haber ve sayfa için çeviri alanları CMS içinde tutulur.
   - Editör içerikleri aynı panelden yönetir.

2. **PO / JSON translation sistemi**
   - Arayüz metinleri için `messages/en.json`, `messages/tr.json` gibi dosyalar kullanılır.
   - CMS içerikleri yine CMS içinde çevrilir.

En doğru yapı:

- UI metinleri: JSON veya PO benzeri translation dosyaları
- Ürün, haber, çözüm ve şirket içerikleri: CMS içinde localized fields

Neden:

Buton, navbar ve form label gibi tekrar eden UI metinleri kod tarafında yönetilmelidir. Ürün açıklaması, haber metni ve company içerikleri ise editör tarafından CMS üzerinden güncellenmelidir.

### Arabic İçin RTL Desteği

Arabic dilinde sayfa yönü `rtl` olmalı.

Dikkat edilmesi gerekenler:

- Navbar hizalaması ters çalışmalı.
- Icon + text sıralaması kontrol edilmeli.
- Slider, marquee ve horizontal scroll yönleri test edilmeli.
- Form alanları sağdan sola okunmalı.

## Mobil Destek Planı

Mobil destek sadece responsive kırılım demek değil. Site mobilde de premium görünmeli.

### Breakpoint Stratejisi

- Mobile: 360px - 767px
- Tablet: 768px - 1023px
- Laptop: 1024px - 1439px
- Desktop: 1440px+

### Mobilde Zorunlu Kontroller

- Navbar taşmamalı.
- Hero yazısı ekrana çok büyük gelmemeli.
- Motion background yazıyı okunmaz yapmamalı.
- Ürün kartları tek kolon olmalı.
- Müşteri logoları taşmamalı.
- CTA butonları parmakla rahat basılmalı.
- Form inputları en az 44px yükseklikte olmalı.
- Görseller crop olurken ürünün önemli kısmını kesmemeli.

### Mobil Menü

Mobil menü:

- Full screen veya bottom sheet olabilir.
- Dil seçici mobilde görünür olmalı.
- Start Project CTA menü içinde güçlü durmalı.
- Menü açılış/kapanış animasyonu hızlı ve net olmalı.

## Motion ve Görsel Deneyim Planı

Site kurumsal olduğu için animasyonlar oyuncak gibi değil, kontrollü ve premium hissettirmeli.

### Hero Motion

Hero animasyonu:

- İlk viewport’un büyük bölümünü kaplamalı.
- Yazı alanını boğmamalı.
- Renkler WillowSoft paletine bağlı kalmalı.
- MotionSites referansındaki gibi fluted glass / ışık kırılması / dönme hissi verebilir.
- Desktop ve mobil için ayrı yoğunluk ayarı olmalı.

### Kullanılacak Motion Tipleri

- Shader / canvas background
- Scroll reveal
- Logo hover transitions
- Product card hover
- Capability matrix active state
- Sticky service storytelling
- News card image reveal
- CTA button text-roll

### Kaçınılması Gerekenler

- Her section’da aynı animasyonun tekrar etmesi
- Çok uzun yazı blokları
- Her şeyi kart içine koymak
- Tek renkli ve cansız yüzeyler
- Mobilde ağır shader performansı

## Sayfa Bazlı İçerik Planı

### Home

Home sayfası kısa, güçlü ve satış odaklı olmalı.

Akış:

1. Motion hero
2. Trusted brands
3. Problem → WillowSoft solution
4. Services preview
5. Product ecosystem preview
6. Solutions preview
7. News / proof preview
8. CTA

Home’da çok fazla teknik detay verilmemeli. Teknik detaylar Services, Products ve Solutions sayfalarına yönlendirmeli.

### Services

Services sayfası klasik kart listesi gibi olmamalı.

Akış:

1. Hero: “From embedded hardware to digital platforms.”
2. Capability matrix
3. Her capability için detaylı açıklama
4. “One system, every layer” görsel akışı
5. Related products ve solutions
6. CTA

### Products

Products sayfası katalog gibi ama e-commerce gibi değil.

Akış:

1. Product catalog hero
2. Category filters
3. Product cards
4. Featured product
5. Quote CTA

Ürünlerde “Add to cart” olmamalı. Bunun yerine “Request information”, “Ask for quote”, “Discuss integration” gibi CTA kullanılmalı.

### Company

Company sayfası şirketin güven sayfası olmalı.

Akış:

1. Kısa kurumsal hero
2. 2020 kuruluş ve R&D yaklaşımı
3. Türkiye + UK operasyonu
4. Export countries
5. News/fair timeline
6. Customer/partner proof
7. CTA

### News

News sayfası blog gibi değil, proof library gibi kullanılmalı.

Akış:

1. News hero
2. Featured news
3. News grid
4. Event / export / company update kategorileri
5. CTA

### Contact

Contact sayfası basit ve hızlı olmalı.

Akış:

1. Contact hero
2. Direct contact cards
3. Contact form
4. Office regions
5. Response expectation

Adres bilgileri değişebilir olduğu için CMS’ten yönetilmeli ve publish öncesi doğrulanmalı.

### Start Project

Start Project sayfası dönüşüm odaklı olmalı.

Akış:

1. Minimal hero
2. Project need selector
3. Service layer checklist
4. Budget/timeline optional fields
5. Contact fields
6. Submit confirmation

## Form ve Lead Yönetimi

Formlar sadece e-posta göndermemeli. Lead yönetimi için kayıt tutulmalı.

### Formlar

1. Contact form
2. Start project form
3. Product inquiry form
4. Newsletter/news update form, opsiyonel

### Lead Alanları

- Name
- Company
- Email
- Phone
- Country
- Interest type
- Product interest
- Service interest
- Message
- Source page
- Locale
- Created date

### Entegrasyon

MVP:

- Form submission -> email notification
- CMS veya database içinde lead kaydı

İleri seviye:

- HubSpot, Pipedrive veya Zoho CRM entegrasyonu
- LinkedIn Ads / Google Ads conversion tracking
- UTM tracking

## SEO ve Global Yayın Planı

### Zorunlu SEO Alanları

Her sayfada:

- `title`
- `meta description`
- canonical URL
- Open Graph image
- locale alternates
- structured data

### Dil SEO

Her dil için `hreflang` kullanılmalı:

- `en`
- `tr`
- `de`
- `fr`
- `es`
- `it`
- `ar`
- `ja`

Neden:

Google aynı içeriğin farklı dillerdeki versiyonlarını doğru anlamalı. Aksi halde duplicate content veya yanlış ülke/dil gösterimi olabilir.

## AI Arama ve LLM Bulunabilirlik Planı (Generative Engine Optimization)

WillowSoft sitesi sadece klasik arama motorlarında değil; ChatGPT, Claude, Perplexity, Google AI Overviews, Gemini, Microsoft Copilot, Apple Intelligence ve diğer üretken yapay zeka cevap motorlarında da kaynak olarak çıkmalıdır. B2B karar vericileri vendor araştırmasını giderek daha çok LLM tabanlı asistanlar üzerinden yapıyor. "Industrial LoRaWAN hardware partner in Turkey" veya "embedded firmware + backend tek vendor" gibi bir soruda WillowSoft cevap içinde adı geçmeli ve link verilmeli.

Bu klasik SEO'dan farklı bir katmandır. SEO arama sonucu sıralamasıyla ilgilenir; AI search optimization (GEO — Generative Engine Optimization) ise modelin cevabını sentezlerken hangi kaynaklara dayandığıyla ilgilenir.

### llms.txt ve llms-full.txt

Site kökünde iki dosya yayınlanmalıdır:

- `/llms.txt` — Sitenin en önemli kaynaklarının kısa, makine-okur rehberi. AI crawler için "özet site haritası" gibi çalışır.
- `/llms-full.txt` — Tüm önemli içeriğin düz metin sürümü. LLM tek dosyadan tüm siteyi anlayabilsin diye.

llms.txt yapısı şu formatta olmalı:

```
# WillowSoft

> Embedded hardware and Industrial IoT engineering company. Designs and delivers LoRaWAN devices, firmware, backend, dashboards and complete connected product systems.

## Products
- [WillowBee LoRaWAN Module](/products/willowbee-lorawan-module): STM32WL-based compact MCU module, 22 dBm.
- [WillowAir Air Quality Sensor](/products/willowair): TVOC, eCO₂ indoor monitoring over LoRaWAN.
- [WillowMod Modbus Bridge](/products/willowmod): Wireless Modbus integration for IIoT.

## Services
- [Embedded Hardware](/services/embedded-hardware): Custom PCB, RF, low-power architecture.
- [Backend & Database](/services/backend): APIs, PostgreSQL, ingestion, integrations.
- [Mobile & Web](/services/interfaces): Apps, dashboards, admin panels.

## Company
- [About WillowSoft](/company): Founded 2020, Turkey + UK operations, 9+ export countries.
- [News](/news): Company milestones, fair coverage, technical updates.
```

Bu standart Jeremy Howard tarafından önerildi; Anthropic, Cursor, Vercel ve birçok modern teknik site tarafından adopt edildi. llms-full.txt ise tüm sayfaların düz metin birleşik versiyonudur ve CMS'ten otomatik regenerate edilmelidir.

### AI Crawler robots.txt İzinleri

robots.txt içinde tüm önemli AI bot'larına açık erişim verilmelidir. Engellemek AI cevaplarında varlığımızı kaybetmek demektir. Rekabet eden firmalar izin verirse onlar çıkar, biz çıkmayız.

İzinli olması gereken bot'lar:

- `GPTBot` — OpenAI training crawler
- `ChatGPT-User` — ChatGPT browsing
- `OAI-SearchBot` — OpenAI search index
- `ClaudeBot` ve `anthropic-ai` — Anthropic Claude
- `Claude-Web` — Claude tarayıcı erişimi
- `PerplexityBot` ve `Perplexity-User` — Perplexity
- `Google-Extended` — Google Gemini ve AI Overviews
- `Applebot-Extended` — Apple Intelligence
- `Bytespider` — ByteDance / Doubao
- `Meta-ExternalAgent` — Meta AI / Llama
- `YouBot` — You.com
- `DuckAssistBot` — DuckDuckGo Assistant
- `CCBot` — Common Crawl (birçok modelin training data kaynağı)
- `Amazonbot` — Alexa+ ve Amazon AI
- `cohere-ai` — Cohere
- `MistralAI-User` — Mistral

robots.txt örneği:

```
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://willowsoft.co/sitemap.xml
```

Hassas içerik (admin paneli, dahili belgeler, draft preview) zaten ayrı subdomain veya auth arkasında olmalı; robots ile değil.

### Structured Data (Schema.org JSON-LD)

Her sayfada uygun Schema.org tipinde JSON-LD enjekte edilmelidir. LLM ve klasik crawler içerik anlamak için bu metadata'yı kullanır.

Sayfa tipine göre önerilen schema:

- **Organization** — her sayfada footer'da WillowSoft kimlik (name, url, logo, sameAs, contactPoint)
- **WebSite** + `SearchAction` — kök sayfada site arama tanımı
- **Product** — `/products/[slug]` ürün adı, açıklama, görseller, sku, brand, offers, aggregateRating (varsa)
- **TechArticle** veya **NewsArticle** — `/news/[slug]` içeriğe göre seç
- **FAQPage** — Services, Solutions, Start Project, Company sayfalarındaki soru-cevap blokları
- **HowTo** — entegrasyon ve setup rehberleri için
- **BreadcrumbList** — tüm derin sayfalarda navigation breadcrumb
- **Service** — `/services` her capability için
- **ContactPoint** — Contact sayfası ofis ve iletişim
- **Place** — office regions
- **ItemList** — products listings, news listings, solutions listings

Her schema bloğu sayfa içeriğiyle birebir tutarlı olmalı. Yanlış bilgi AI cevaplarında WillowSoft adına yanlış bilgi yayar. Her release öncesi Schema.org Validator ve Google Rich Results Test çalıştırılmalı.

### AI'ın Sevdiği İçerik Patternleri

LLM'ler bazı içerik yapılarını daha kolay sentezler ve cevap olarak kullanır:

- **Net tek-cümle kimlik:** "WillowSoft is an embedded hardware and Industrial IoT engineering company that designs LoRaWAN devices, firmware, backend and dashboards as one connected system."
- **FAQ blokları:** "What does WillowSoft do?", "Which industries do you serve?", "Do you offer end-to-end IoT systems?", "Where are you based?"
- **Karşılaştırma tabloları:** WillowBee vs RAK Wireless, Dragino, MultiTech gibi specs karşılaştırması
- **Maddelenmiş yetenek listesi:** Hardware, firmware, RF, backend, mobile, web, VR — net liste
- **Teknik spec'ler:** "STM32WL, 22 dBm, IP67, 868/915 MHz" — concrete attributes
- **Tarih ve sayısal kanıt:** "Founded 2020, 50+ customers, 80+ projects, 15+ countries"
- **Kullanım senaryoları:** "Used in solar plant monitoring, water level measurement, industrial machine control"
- **Müşteri proof'u:** "Trusted by Honeywell, SLB, Beko, AT&T, Coca-Cola, Aero Healthcare"

Kaçınılması gerekenler:

- Soyut marketing dili: "revolutionary solutions", "best-in-class", "industry-leading"
- Bilgi yoğunluğu düşük dolgu paragraflar
- Sadece JS render edilen kritik içerik (LLM crawler bazıları render etmiyor)
- Image-only bilgi (alt text olmadan)
- Cookie wall arkasında veya consent öncesi gizlenen içerik

### Authority ve Citation Sinyalleri

LLM'ler güvenilir, sık alıntılanan kaynakları cevaplarda daha çok tercih eder. Authority oluşturmak için:

- **Wikipedia / Wikidata entry:** WillowSoft için notable olduğunu kanıtlayan reliable source'larla. Wikidata entry'si LLM cevaplarında entity-level tanınmayı sağlar.
- **Crunchbase, LinkedIn Company, GitHub Organization** — güncel, doğrulanmış, tutarlı bilgi
- **Industry directory kayıtları:** LoRa Alliance üyelik, IoT-Analytics, Sanayi ve Teknoloji Bakanlığı veritabanı, KOSGEB AR-GE listeleri
- **Üniversite, gov, sektör derneği** sitelerinden backlink
- **Press coverage:** TÜBİTAK, fuar haberleri, sektör basını (Endüstri 4.0 dergi, IoT Türkiye)
- **GitHub'da açık kaynak projeler:** SDK, örnek firmware, integration examples — README'lerde marka geçer
- **Tutarlı NAP (Name, Address, Phone):** Tüm directory'lerde aynı

### Bing Webmaster Tools ve IndexNow

ChatGPT, Copilot ve birçok AI search Bing index'ini kullanır. Bing tarafından görünmek AI cevaplarında görünmenin yarısıdır:

- Site Bing Webmaster Tools'a kaydedilmeli
- IndexNow protokol implementasyonu yapılmalı — her content update'inde Bing, Yandex, Naver'a instant notify
- Bing'de sitemap.xml submit edilmeli
- Bing AI ile uyumlu sayfa preview test edilmeli
- Bing'in sosyal sinyalleri için LinkedIn şirket sayfası güncel kalmalı

### Sitemap ve Discoverability

- `sitemap.xml` her dil için ayrı (`sitemap-en.xml`, `sitemap-tr.xml`, ...)
- `sitemap-index.xml` ana index olarak tüm dilleri listeler
- Her ürün ve haber `lastmod` ile güncel tutulur
- robots.txt içinde `Sitemap:` direktifi belirtilir
- `feed.xml` (RSS / Atom) news için — AI'lar bunu da takip eder
- Google Search Console + Bing Webmaster Tools'a tüm sitemap'ler submit edilir

### Canonical, hreflang ve Duplicate Önleme

- Her sayfa için tek canonical URL
- `hreflang` ile dil/bölge alternatives
- LLM çoklu dilde aynı içeriği farklı varlık olarak görmemeli
- Aynı içerik subdomain veya path duplication oluşturmamalı

### Performance ve Crawl Budget

LLM crawler'ları sayfa JavaScript render tamamlanmasını beklemeyebilir. Statik veya SSR rendering şart:

- TTFB < 600ms
- LCP < 2.5s
- Critical above-the-fold content HTML'de mevcut, JS sonrası eklenen değil
- Lazy load sadece görseller için, yapısal içerik için değil
- Core Web Vitals yeşil olmalı (Google Search Console)

### MVP AI Optimization Görevleri

İlk launch'ta yapılması gerekenler:

1. `/llms.txt` ve `/llms-full.txt` oluşturulması, CMS update'inde otomatik regenerate
2. `/robots.txt` içinde tüm AI bot'larına explicit `Allow:`
3. Tüm sayfalarda temel `Organization` + `WebSite` JSON-LD
4. Product sayfalarında `Product` schema (brand, sku, image, offers)
5. News sayfalarında `NewsArticle` veya `TechArticle` schema
6. Services ve Solutions sayfalarında `FAQPage` schema
7. Tüm derin sayfalarda `BreadcrumbList` schema
8. Bing Webmaster Tools kaydı + sitemap submit
9. IndexNow protokol entegrasyonu
10. Her sayfada net "WillowSoft is..." tek-cümle açıklama (LLM extraction için)
11. Featured products ve services'te chip/spec attributes belirgin
12. About / Company sayfasında firma timeline + net company metadata bloğu

### İleri Seviye AI Optimization

Sonraki aşamada eklenebilir:

1. Wikipedia / Wikidata entry oluşturma (reliable source'larla)
2. Endüstri directory submit (LoRa Alliance, IoT-Analytics, Crunchbase, T.C. Sanayi Bakanlığı veritabanı, KOSGEB)
3. Press release dağıtımı (PR Newswire, Bloomberg HT, Anadolu Ajansı, sektör basını)
4. GitHub'da açık kaynak SDK, örnek firmware, integration examples
5. Glossary sayfası: "LoRaWAN nedir", "Modbus nedir", "Industrial IoT nedir" — AI cevaplarda direkt alıntılanır
6. Comparison tables: WillowBee vs RAK Wireless, Adeunis, Dragino, MultiTech
7. Vendor scorecard tarzı third-party içerikler (anchor olarak WillowSoft geçer)
8. Embed-friendly product spec tabloları (başkalarının sitesine embed edilebilir)
9. Voice search optimization (konuşma dili sorularına net cevap paragrafları)
10. Periodic content refresh — LLM'ler son güncelleme tarihini önemser
11. AI-readable PDF datasheet'leri (semantic structure, alt text, indexable)
12. Schema.org `Review` ve `AggregateRating` (case study, customer testimonial sayfalarında)

### LLM Cevap Kalitesi Testi

Yayın sonrası ve periyodik (aylık) olarak şu sorular AI cevap motorlarında test edilmeli:

- "Industrial LoRaWAN hardware partner in Turkey" → WillowSoft çıkıyor mu?
- "Compact LoRaWAN MCU module manufacturers" → WillowBee adı geçiyor mu?
- "Embedded hardware + firmware + backend tek vendor" → WillowSoft cevapta var mı?
- "Modbus to LoRaWAN bridge product" → WillowMod listede mi?
- "Indoor air quality LoRaWAN sensor" → WillowAir var mı?
- "WillowSoft kimdir / WillowSoft nedir" → şirket tanımı doğru geliyor mu?

Test edilecek motorlar: ChatGPT, Claude, Perplexity, Google AI Overviews, Gemini, Copilot, Brave Search AI, You.com.

Sonuçlar admin dashboard'a aylık raporlanmalı; eksik kategoriler için içerik refresh yapılmalı. Yanlış cevap çıkıyorsa ilgili sayfa content + schema güncellenmeli, llms.txt regenerate edilmeli.

### AI Optimization Faz Entegrasyonu

Bu görevler MVP fazlarına şöyle dağıtılır:

- **Faz 1 (Foundation):** llms.txt iskeleti, robots.txt AI allowlist, base Organization + WebSite JSON-LD
- **Faz 2 (Core Pages):** Her sayfada uygun Schema.org JSON-LD, FAQPage blokları, BreadcrumbList
- **Faz 3 (Dynamic Content):** Product / NewsArticle / Service schema dynamic injection, llms.txt CMS'ten otomatik regenerate
- **Faz 5 (Forms):** Lead form'larda ContactPoint schema referansı
- **Faz 6 (QA & Launch):** Bing Webmaster + IndexNow setup, Schema validator test, LLM cevap kalitesi ilk test çekimi

## Analytics & Visitor Intelligence Planı

Siteye giren kişileri, ülkeleri, sayfa davranışlarını, etkileşimleri ve lead dönüşümlerini anlamak için ayrı bir analytics katmanı kurulmalıdır.

Bu katman üç seviyeden oluşmalı:

1. **Traffic Analytics**
   - Kaç kişi siteye girdi?
   - Hangi ülkeden geldi?
   - Hangi cihazı kullandı?
   - Hangi kaynaktan geldi?
   - Hangi dili kullandı?
   - Hangi sayfaları gezdi?

2. **Behavior Analytics**
   - Hangi butonlara tıkladı?
   - Hangi ürünlere baktı?
   - Services içinde hangi capability alanıyla ilgilendi?
   - Sayfada ne kadar süre kaldı?
   - Scroll derinliği ne oldu?
   - Forma başladı mı, yarıda bıraktı mı?

3. **Lead & Conversion Analytics**
   - Contact form gönderildi mi?
   - Start Project form gönderildi mi?
   - Product inquiry gönderildi mi?
   - Hangi sayfadan lead geldi?
   - Hangi ülke/dil daha çok lead üretti?
   - Hangi ürün veya hizmet daha çok talep aldı?

### Önerilen Araç Yapısı

MVP için önerilen kurulum:

- **Google Analytics 4**
  - Genel trafik, ülke, kaynak, cihaz, sayfa ve conversion takibi için.

- **Microsoft Clarity**
  - Heatmap, click map, scroll map ve session recording için.

- **Google Tag Manager**
  - Analytics kodlarını ve custom eventleri yönetmek için.

- **Admin Dashboard Analytics**
  - Contact mesajları, Start Project leadleri ve product inquiry taleplerini şirket içinde izlemek için.

İleri seviye alternatif:

- **PostHog**
  - Product analytics, event tracking, funnel, feature flag ve session replay tek sistemde istenirse.

Privacy odaklı alternatif:

- **Plausible**
  - Daha sade, cookie-light/privacy-friendly trafik analizi istenirse.

### Takip Edilecek Temel Metrikler

Admin panelde ve analytics dashboardlarda şu metrikler görünmeli:

- Total visitors
- Unique visitors
- Sessions
- Country
- City, mümkünse yaklaşık seviyede
- Device type
- Browser
- Traffic source
- Referrer
- Landing page
- Exit page
- Pages per session
- Average engagement time
- Scroll depth
- Button clicks
- Product views
- Service interest
- Solution interest
- Form starts
- Form submissions
- Form abandonment
- Language selected
- Download clicks
- Email clicks
- Phone clicks
- WhatsApp clicks, ileride eklenirse

### Event Tracking Planı

Sitede her önemli davranış event olarak kaydedilmeli.

Önerilen event isimleri:

- `page_view`
- `hero_cta_click`
- `nav_click`
- `language_switch`
- `service_view`
- `service_cta_click`
- `solution_view`
- `product_list_filter`
- `product_card_click`
- `product_view`
- `product_inquiry_click`
- `document_download`
- `trusted_brand_hover`
- `news_card_click`
- `contact_form_start`
- `contact_form_submit`
- `start_project_form_start`
- `start_project_form_submit`
- `form_error`

Her event şu parametrelerle gönderilmeli:

- `locale`
- `page_path`
- `page_title`
- `section`
- `item_id`
- `item_name`
- `item_category`
- `cta_label`
- `country`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `timestamp`

Neden:

Sadece “kaç kişi girdi” bilgisi yeterli değildir. WillowSoft için önemli olan hangi ülkenin hangi ürün veya hizmetle ilgilendiğini anlamaktır. Örneğin Almanya’dan gelen kullanıcılar PostgreSQL/Admin Panel hizmetlerine, Japonya’dan gelen kullanıcılar LoRaWAN ürünlerine daha çok bakıyorsa satış stratejisi buna göre değişebilir.

### Admin Panel Analytics Ekranları

WillowSoft Admin Dashboard içinde ayrı analytics ekranları olmalı.

Önerilen ekranlar:

1. **Overview**
   - Visitors
   - Leads
   - Conversion rate
   - Top countries
   - Top pages
   - Top products

2. **Visitor Insights**
   - Ülke bazlı ziyaret
   - Dil bazlı ziyaret
   - Cihaz bazlı ziyaret
   - Trafik kaynağı

3. **Page Performance**
   - Sayfa görüntülenme
   - Ortalama süre
   - Scroll depth
   - Exit rate
   - CTA click rate

4. **Product Analytics**
   - En çok görüntülenen ürünler
   - En çok inquiry alan ürünler
   - Kategori bazlı ilgi
   - Product detail conversion

5. **Service Analytics**
   - En çok bakılan hizmetler
   - Backend, PostgreSQL, Web/Admin, Mobile, VR gibi alanların ilgi oranı
   - Service CTA click rate

6. **Lead Analytics**
   - Contact submissions
   - Start Project submissions
   - Product inquiry submissions
   - Lead source
   - Lead country
   - Lead status distribution

### Session Recording ve Heatmap

Session recording her kullanıcı için “kim olduğunu ifşa eden” bir takip gibi değil, deneyim analizi için kullanılmalıdır.

Kullanım amacı:

- Kullanıcı navbarı bulabiliyor mu?
- Hero CTA görülüyor mu?
- Ürün kartlarında taşma var mı?
- Mobilde form zor dolduruluyor mu?
- Kullanıcı Services içinde nerede kayboluyor?
- Hangi alanlar hiç tıklanmıyor?

Gizlilik için:

- Form inputları maskelenmeli.
- Email, telefon, mesaj gibi kişisel veriler kaydedilmemeli.
- Admin panelde session kayıtlarına erişim sınırlı olmalı.
- Cookie consent ve privacy policy açık olmalı.

### Privacy ve KVKK/GDPR

Türkiye, UK ve EU hedeflendiği için analytics kurulumu privacy uyumlu olmalı.

Gerekenler:

- Cookie consent banner
- Privacy policy
- Analytics opt-in/opt-out
- IP anonymization veya privacy-friendly analytics tercihi
- Form verileri için açık rıza metni
- Data retention süresi
- Admin erişim logları

Neden:

Ziyaretçi davranışlarını ölçmek faydalıdır ama kişisel veri güvenliği ve yasal uyum yanlış kurulursa risk oluşturur. Özellikle contact formları ve session recording tarafında hassas veriler maskelenmelidir.

### MVP Analytics Kurulumu

İlk aşamada yapılması gerekenler:

1. GA4 kurulumu
2. Google Tag Manager kurulumu
3. Microsoft Clarity kurulumu
4. Cookie consent banner
5. Privacy policy sayfası veya bölümü
6. Temel event tracking
7. Contact / Start Project / Product Inquiry conversion tracking
8. Admin panelde lead source ve UTM alanlarının tutulması

### İleri Seviye Analytics Kurulumu

Sonraki aşamada eklenebilir:

- Funnel analysis
- A/B testing
- Segment bazlı raporlar
- Country-based conversion reports
- Product interest scoring
- Lead scoring
- CRM entegrasyonu
- Weekly email reports
- Data warehouse / BigQuery entegrasyonu
- Looker Studio dashboard

## Admin Panel Gereksinimi

Bu site için admin panel gereklidir. Çünkü site sadece vitrin gibi durmayacak; ürünler, haberler, müşteri logoları, şirket bilgileri, çeviriler ve gelen contact/start project mesajları yönetilebilir olmalı.

En doğru yaklaşım iki katmanlıdır:

1. **CMS Admin**
   - İçerik yönetimi için kullanılır.
   - Ürün, haber, müşteri logosu, hizmet, çözüm, şirket bilgisi ve çeviri içerikleri buradan düzenlenir.

2. **WillowSoft Admin Dashboard**
   - Operasyon ve lead yönetimi için kullanılır.
   - Contact mesajları, Start Project başvuruları, ürün inquiry talepleri, durum takibi ve kullanıcı yetkileri burada yönetilir.

Bu ayrım önemlidir. CMS editörler için içerik panelidir; Admin Dashboard ise şirket içi ekip için lead ve operasyon panelidir.

### Admin Panel Route Yapısı

Önerilen route yapısı:

- `/admin/login`
- `/admin`
- `/admin/messages`
- `/admin/leads`
- `/admin/products`
- `/admin/news`
- `/admin/clients`
- `/admin/services`
- `/admin/solutions`
- `/admin/translations`
- `/admin/settings`

Admin panel public siteden ayrı görünmelidir. Tasarım olarak daha sade, hızlı ve yönetim odaklı olmalıdır.

### Admin Panelde Yönetilecek İçerikler

Admin/CMS üzerinden yönetilecek alanlar:

- Products
- Product categories
- Product documents
- News
- Client logos
- Company facts
- Office/contact info
- Services
- Solutions
- SEO metadata
- Translations
- Media library
- Hero text ve CTA metinleri
- Trusted brands sıralaması
- Footer linkleri

### Contact Mesaj Yönetimi

Contact ve Start Project formlarından gelen tüm mesajlar admin panelde görünmeli.

Her mesajda şu alanlar tutulmalı:

- Name
- Company
- Email
- Phone
- Country
- Message
- Interest type
- Product interest
- Service interest
- Source page
- Locale
- UTM source
- UTM campaign
- Status
- Assigned user
- Internal note
- Created date
- Last updated date

### Lead Status Sistemi

Mesajlar sadece liste olarak kalmamalı. Basit bir pipeline olmalı.

Önerilen status değerleri:

- `new`
- `reviewed`
- `contacted`
- `qualified`
- `proposal_sent`
- `won`
- `lost`
- `spam`

Neden:

Bir company sitesinde form geldikten sonra asıl değer lead takibidir. Mesaj geldi mi, kim baktı, dönüş yapıldı mı, teklif gönderildi mi gibi bilgiler kaybolmamalı.

### Admin Panel Yetkileri

Admin panelde role-based access control olmalı.

Roller:

- **Super Admin**
  - Her şeyi yönetir.
  - Kullanıcı ve sistem ayarlarını değiştirebilir.

- **Content Editor**
  - Ürün, haber, company ve çeviri içeriklerini düzenler.
  - Lead mesajlarını silemez.

- **Sales / Business**
  - Contact mesajlarını ve Start Project leadlerini görür.
  - Status ve internal note günceller.
  - İçerik sayfalarını düzenleyemez.

- **Viewer**
  - Sadece okuma yetkisi vardır.

### Admin Panel MVP Özellikleri

MVP için admin panelde mutlaka olmalı:

- Login
- Dashboard summary
- Contact messages listesi
- Start Project lead listesi
- Mesaj detay ekranı
- Status değiştirme
- Internal note ekleme
- Ürün ekleme/düzenleme
- Haber ekleme/düzenleme
- Müşteri logosu ekleme/düzenleme
- Dil bazlı içerik düzenleme
- SEO title/description düzenleme

### Admin Panel İleri Seviye Özellikleri

İleride eklenebilir:

- CRM entegrasyonu
- Email reply tracking
- Lead assignment
- Notification system
- CSV export
- Audit log
- Two-factor authentication
- Product document access control
- Draft/publish workflow
- Scheduled news publish

### Güvenlik Gereksinimleri

Admin panel güvenlik açısından public siteden daha hassas ele alınmalı.

Zorunlu güvenlik maddeleri:

- HTTPS
- Secure session/cookie
- CSRF protection
- Rate limiting
- Role-based access control
- Audit log
- Spam protection
- File upload validation
- Admin route protection
- Strong password policy

Neden:

Admin panelde şirket bilgileri, gelen müşteri mesajları ve potansiyel ticari fırsatlar bulunur. Bu yüzden sadece görsel olarak değil, backend güvenliği açısından da doğru tasarlanmalıdır.

## MVP Fazları

### Phase 1 - Foundation

- Next.js veya Astro projesi kurulumu
- Tailwind CSS
- Global layout
- Responsive navbar
- Footer
- 8 dil route yapısı
- Ana CMS bağlantısı

### Phase 2 - Core Pages

- Home
- Services
- Solutions
- Products
- Company
- News
- Contact
- Start Project

### Phase 3 - Dynamic Content

- Product model
- News model
- Client logo model
- Service capability model
- Solution model
- CMS preview
- Dynamic slug pages

### Phase 4 - Motion & Visual Polish

- Hero shader
- Scroll animations
- Brand logo interactions
- Product card transitions
- Services capability interactions
- Mobile animation optimization

### Phase 5 - Forms & Lead Capture

- Contact form
- Start Project form
- Product inquiry form
- Email notification
- Lead storage
- Spam protection

### Phase 6 - QA & Launch

- Desktop QA
- Mobile QA
- Tablet QA
- 8 language QA
- RTL Arabic QA
- Performance test
- SEO test
- Broken link test
- Form test

## Test Plan

### Browser Test

Her büyük değişiklikten sonra şu viewport’larda ekran görüntüsü alınmalı:

- 390px mobile
- 768px tablet
- 1280px laptop
- 1440px desktop

### Kontrol Listesi

- Navbar taşmıyor.
- Logo bozulmuyor.
- Hero okunabilir.
- Motion background performanslı.
- Ürün kartları düzgün hizalanıyor.
- Müşteri logoları taşmıyor.
- Dil değişimi doğru çalışıyor.
- Arabic RTL doğru görünüyor.
- Formlar gönderiliyor.
- Sayfa linkleri kırık değil.
- Lighthouse performance kabul edilebilir.

## Sonuç

WillowSoft sitesi MVP’de 22 sayfalık planla başlayabilir, ama teknik olarak dinamik içerik yönetimine hazırlanmalıdır. En doğru yapı; CMS destekli, çok dilli, mobil-first, motion odaklı ve ürün/haber/marka içeriklerini kod yazmadan güncelleyebilen bir sistemdir.

Bu yapı sayesinde:

- Yeni ürün eklenebilir.
- Yeni haber eklenebilir.
- Yeni müşteri logosu eklenebilir.
- Yeni ülke/dil desteği genişletilebilir.
- Services tarafı tek sayfada güçlü kalır.
- Site global pazara uygun şekilde ölçeklenir.
