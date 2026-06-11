"use client";

import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] || "");

  if (images.length <= 1) return null;

  return (
    <div className="product-gallery">
      <div className="product-gallery-main">
        <img src={`/${activeImage}`.replace("//", "/")} alt={title} />
      </div>
      <div className="product-gallery-thumbs">
        {images.map((src, idx) => (
          <button
            key={idx}
            type="button"
            className={`product-gallery-thumb${src === activeImage ? " active" : ""}`}
            onClick={() => setActiveImage(src)}
          >
            <img src={`/${src}`.replace("//", "/")} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    </div>
  );
}
