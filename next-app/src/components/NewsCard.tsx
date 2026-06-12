import Link from "next/link";
import { localizeItem, type Locale } from "@/lib/cms";

interface NewsCardProps {
  item: any;
  locale: Locale;
  index: number;
}

export default function NewsCard({ item, locale, index }: NewsCardProps) {
  const n = localizeItem(item, locale);
  const safeLocale = (locale || "en") as Locale;
  const delay = index % 3 ? ` delay-${index % 3}` : "";
  const date = n.date
    ? new Date(`${n.date}T00:00:00`).toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <article className={`card news-card reveal${delay}`}>
      <figure>
        <img src={n.image} alt={n.title} />
      </figure>
      <div className="product-body">
        <p className="eyebrow">
          {n.category} {date && `• ${date}`}
        </p>
        <h3>{n.title}</h3>
        <p>{n.excerpt}</p>
        <p className="mt-4">
          <Link href={`/${safeLocale}/news/${encodeURIComponent(n.slug || n.id)}`} className="btn btn-ghost btn-small">
            Read Update
          </Link>
        </p>
      </div>
    </article>
  );
}
