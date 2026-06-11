"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import type { Locale } from "@/lib/cms";

interface ProductCatalogProps {
  products: any[];
  locale: Locale;
  labels: Record<string, string>;
}

export default function ProductCatalog({ products, locale, labels }: ProductCatalogProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const categories = [
    { key: "all", label: labels.filterAll },
    { key: "modules", label: labels.filterModules },
    { key: "environment", label: labels.filterEnvironment },
    { key: "tracking", label: labels.filterTracking },
    { key: "industrial", label: labels.filterIndustrial },
  ];

  const filteredProducts = products.filter(
    (p) => activeFilter === "all" || p.category === activeFilter
  );

  return (
    <>
      <div className="filter-bar reveal">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`filter-btn${activeFilter === cat.key ? " active" : ""}`}
            onClick={() => setActiveFilter(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="grid grid-4" data-cms-products>
        {filteredProducts.map((p, idx) => (
          <ProductCard key={p.id} product={p} locale={locale} index={idx} />
        ))}
      </div>
    </>
  );
}
