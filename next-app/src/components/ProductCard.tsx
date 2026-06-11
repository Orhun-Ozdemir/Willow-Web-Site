"use client";

import Link from "next/link";
import { localizeItem, type Locale } from "@/lib/cms";

interface ProductCardProps {
  product: any;
  locale: Locale;
  index: number;
}

export default function ProductCard({ product, locale, index }: ProductCardProps) {
  const p = localizeItem(product, locale);
  const delay = index % 4 ? ` delay-${index % 4}` : "";
  const chips = (p.chips || []).slice(0, 3);
  const cutoutImage = p.cardImage || `/assets/product-cutouts/${p.id}.png`;
  const originalImage = p.image || cutoutImage;

  return (
    <article className={`card product-card reveal${delay}`} data-category={p.category}>
      <figure>
        <img
          src={cutoutImage}
          alt={p.title}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = originalImage;
          }}
        />
      </figure>
      <div className="product-body">
        <h3>{p.title}</h3>
        <p>{p.shortDescription}</p>
        <div className="chip-row">
          {chips.map((chip: string) => (
            <span key={chip} className="chip">{chip}</span>
          ))}
        </div>
        <p className="mt-4">
          <Link href={`/${locale}/products/${encodeURIComponent(p.slug || p.id)}`} className="btn btn-ghost btn-small">
            View Details
          </Link>
        </p>
      </div>
    </article>
  );
}
