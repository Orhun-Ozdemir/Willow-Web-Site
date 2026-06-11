import { localizeItem, type Locale } from "@/lib/cms";

interface FaqAccordionProps {
  faqs: any[];
  pageKey?: string;
  locale: Locale;
}

export default function FaqAccordion({ faqs, pageKey, locale }: FaqAccordionProps) {
  const items = faqs
    .filter((faq) => !pageKey || faq.page === pageKey)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  if (items.length === 0) return null;

  return (
    <div className="faq-list">
      {items.map((item) => {
        const f = localizeItem(item, locale);
        const question = String(f.question || "");
        const answer = String(f.answer || "").replace(/\r?\n/g, "<br>");
        return (
          <details key={item.id} className="faq-item">
            <summary>
              <span className="faq-q">{question}</span>
              <span className="faq-toggle" aria-hidden="true"></span>
            </summary>
            <p dangerouslySetInnerHTML={{ __html: answer }}></p>
          </details>
        );
      })}
    </div>
  );
}
