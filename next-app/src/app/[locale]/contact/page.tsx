import type { Metadata } from "next";
import { localizedValue, type Locale } from "@/lib/cms";
import { fetchContentSync } from "@/lib/cms-server";
import ContactForm from "@/components/ContactForm";
import FaqAccordion from "@/components/FaqAccordion";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = fetchContentSync();
  const seo = content.pageSeo?.contact?.[locale] || {};
  return {
    title: seo.seoTitle || "Contact | WillowSoft",
    description: seo.metaDescription || "Contact WillowSoft for IoT hardware, backend, PostgreSQL, and software development projects.",
    alternates: {
      canonical: seo.canonical || `https://willowsoft.co/${locale}/contact`,
    },
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const content = fetchContentSync();
  const pageContent = content.pageContent?.contact || {};
  const getVal = (key: string) => localizedValue(pageContent[key], locale as Locale);

  const companyFacts = content.companyFacts || {};

  const labels = {
    turkeyOffice: { en: "Turkey Office", tr: "Türkiye Ofisi", de: "Büro Türkei", fr: "Bureau Turquie", es: "Oficina Turquía", it: "Ufficio Turchia", ar: "مكتب تركيا", ja: "トルコオフィス" },
    ukOffice: { en: "UK Office", tr: "İngiltere Ofisi", de: "Büro UK", fr: "Bureau Royaume-Uni", es: "Oficina Reino Unido", it: "Ufficio Regno Unito", ar: "مكتب المملكة المتحدة", ja: "イギリスオフィス" },
    contactUs: { en: "Contact us", tr: "Bizimle iletişime geçin", de: "Kontaktieren Sie uns", fr: "Contactez-nous", es: "Contáctenos", it: "Contattaci", ar: "اتصل بنا", ja: "お問い合わせ" },
    faqEyebrow: { en: "Frequently asked", tr: "Sıkça sorulanlar", de: "Häufig gestellte Fragen", fr: "Questions fréquentes", es: "Preguntas frecuentes", it: "Domande frequenti", ar: "أسئلة مكررة", ja: "よくある質問" },
    faqTitle: { en: "Questions before contacting.", tr: "İletişime geçmeden önce sorular.", de: "Fragen vor dem Kontakt.", fr: "Questions avant de nous contacter.", es: "Preguntas antes de contactar.", it: "Domande prima di contattare.", ar: "أسئلة قبل الاتصال.", ja: "お問い合わせ前の質問" },
    faqLead: {
      en: "Here are answers to general questions regarding communications, office locations, and NDAs.",
      tr: "İletişim, ofis konumları ve NDA'ler hakkındaki genel soruların yanıtları.",
      de: "Hier finden Sie Antworten auf allgemeine Fragen zu Kommunikation, Bürostandorten und NDAs.",
      fr: "Voici les réponses aux questions générales concernant la communication, les bureaux et les accords de confidentialité.",
      es: "Aquí encontrará respuestas a preguntas generales sobre comunicaciones, ubicaciones de oficinas y acuerdos de confidencialidad.",
      it: "Ecco le risposte alle domande generali relative a comunicazioni, uffici e accordi di riservatezza.",
      ar: "إليك إجابات الأسئلة العامة المتعلقة بالاتصالات ومواقع المكاتب واتفاقيات عدم الإفصاح.",
      ja: "連絡方法、オフィス所在地、秘密保持契約（NDA）に関する一般的な質問への回答です。"
    }
  };

  const getLabel = (key: keyof typeof labels) => {
    return labels[key][locale as keyof (typeof labels)[typeof key]] || labels[key]["en"];
  };

  return (
    <main>
      <section className="section soft">
        <div className="section-inner split">
          <div className="reveal">
            <p className="eyebrow">{getLabel("contactUs")}</p>
            <h1 className="page-title">{getVal("heroTitle")}</h1>
            <p className="section-lead">{getVal("heroLead")}</p>
            
            <div className="office-contact-grid">
              <article className="office-contact-card">
                <span>{getLabel("contactUs")}</span>
                <h3>{getLabel("turkeyOffice")}</h3>
                <a href={`tel:${companyFacts.turkeyPhone?.replace(/\s+/g, "")}`} data-company-fact="turkeyPhone">
                  {companyFacts.turkeyPhone}
                </a>
                <a href={`mailto:${companyFacts.email}`} data-company-fact="email">
                  {companyFacts.email}
                </a>
                <p data-company-fact="turkeyOfficeAddress">{companyFacts.turkeyOfficeAddress}</p>
              </article>
              
              <article className="office-contact-card">
                <span>{getLabel("contactUs")}</span>
                <h3>{getLabel("ukOffice")}</h3>
                <a href={`mailto:${companyFacts.email}`} data-company-fact="email">
                  {companyFacts.email}
                </a>
                <p data-company-fact="ukOfficeAddress">{companyFacts.ukOfficeAddress}</p>
              </article>
            </div>
          </div>
          
          <div className="reveal delay-1">
            <ContactForm locale={locale as Locale} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section soft services-faq-section" id="faq">
        <div className="section-inner">
          <div className="section-head reveal center" style={{ marginBottom: "36px" }}>
            <p className="eyebrow">{getLabel("faqEyebrow")}</p>
            <h2 className="page-title">{getLabel("faqTitle")}</h2>
            <p className="section-lead" style={{ maxWidth: "720px", marginLeft: "auto", marginRight: "auto" }}>
              {getLabel("faqLead")}
            </p>
          </div>
          <div className="reveal delay-1">
            <FaqAccordion faqs={content.faqs || []} pageKey="contact" locale={locale as Locale} />
          </div>
        </div>
      </section>
    </main>
  );
}
