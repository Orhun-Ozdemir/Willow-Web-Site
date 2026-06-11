import { localizeItem, type Locale } from "@/lib/cms";

interface SolutionCardProps {
  solution: any;
  locale: Locale;
  index: number;
}

export default function SolutionCard({ solution, locale, index }: SolutionCardProps) {
  const s = localizeItem(solution, locale);
  const delay = index % 4 ? ` delay-${index % 4}` : "";
  const bullets = Array.isArray(s.bullets)
    ? s.bullets
    : String(s.bullets || "")
        .split(/\r?\n|,/)
        .map((b: string) => b.trim())
        .filter(Boolean);

  return (
    <article className={`solution-case-card reveal${delay}`} data-solution={s.slug || s.id}>
      {s.image && (
        <figure>
          <img src={s.image} alt={s.headline || s.title} loading="lazy" decoding="async" />
        </figure>
      )}
      <div className="solution-case-body">
        {s.category && <span>{s.category}</span>}
        <h3>{s.headline || s.title}</h3>
        {s.summary && <p>{s.summary}</p>}
        {bullets.length > 0 && (
          <ul>
            {bullets.map((b: string) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
