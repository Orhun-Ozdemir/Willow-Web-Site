"use client";

import { useState } from "react";
import { localizeItem, locales, resolveAsset, type Locale } from "@/lib/cms";
import { canonicalizeProduct, productGalleryImages, lumioApplicationImages, illustratedProductDetails, normalizeProductDetailBlocks, resolveProductDetailLayout } from "@/lib/product-model";
import DetailBlocksEditor from "./DetailBlocksEditor";
import FormField from "./FormField";

export default function ProductLayoutEditor({ product, onChange }: {
  product: any;
  onChange: (key: string, value: unknown) => void;
}) {
  const [locale, setLocale] = useState<Locale>("en");
  const [mobile, setMobile] = useState(false);
  const layout = resolveProductDetailLayout(product);
  const localized = localizeItem(canonicalizeProduct(product), locale);
  const editableBlocks = locale === "en" ? product.detailBlocks : product.localized?.[locale]?.detailBlocks ?? product.detailBlocks;
  const blocks = normalizeProductDetailBlocks(editableBlocks);
  const changeBlocks = (value: typeof blocks) => {
    if (locale === "en") onChange("detailBlocks", value);
    else onChange("localized", { ...product.localized, [locale]: { ...product.localized?.[locale], detailBlocks: value } });
  };
  const gallery = [
    ...productGalleryImages(product),
    ...(localized.slug === "lumiosafe" ? lumioApplicationImages : []),
  ];
  const presentation = product.detailBlockPresentation || {};
  const illustrated = illustratedProductDetails({ ...localized, detailLayout: layout, detailBlockPresentation: presentation }, blocks);
  const update = (id: string, key: "image" | "side", value: string) =>
    onChange("detailBlockPresentation", { ...presentation, [id]: { ...presentation[id], [key]: value } });

  return (
    <div className="space-y-4">
      <FormField label="Ürün detay görünümü" type="select" value={layout} onChange={(value) => onChange("detailLayout", value)} options={[
        { value: "standard", label: "Standart kartlar" },
        { value: "alternating", label: "Sağlı sollu görseller" },
      ]} />
      {layout === "alternating" && blocks.length > 0 && (
        <div className="space-y-3">
          {blocks.map((block) => {
            const selected = presentation[block.id]?.image || "";
            const options = [...new Set([...gallery, selected].filter(Boolean))];
            return (
              <fieldset key={block.id} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-2">
                <legend className="px-1 text-sm font-semibold text-[#132175]">{block.title || block.id}</legend>
                <FormField label="Bölüm görseli" type="select" value={selected} onChange={(value) => update(block.id, "image", value)} options={[
                  { value: "", label: "Otomatik" },
                  ...options.map((image) => ({ value: image, label: image.split("/").pop() || image })),
                ]} />
                <FormField label="Görsel konumu" type="select" value={presentation[block.id]?.side || ""} onChange={(value) => update(block.id, "side", value)} options={[
                  { value: "", label: "Otomatik sırala" },
                  { value: "left", label: "Sol" },
                  { value: "right", label: "Sağ" },
                ]} />
              </fieldset>
            );
          })}
        </div>
      )}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-[#132175]">İçerik bölümleri önizlemesi</h3>
          <div className="flex flex-wrap gap-2">
            <select aria-label="Önizleme dili" className="rounded border border-slate-300 bg-white px-2 py-1" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
              {locales.map((language) => <option key={language} value={language}>{language.toUpperCase()}</option>)}
            </select>
            <button type="button" aria-pressed={mobile} className="rounded border border-slate-300 bg-white px-2 py-1" onClick={() => setMobile(!mobile)}>{mobile ? "Mobil görünüm" : "Masaüstü görünümü"}</button>
          </div>
        </div>
        {blocks.length === 0 && <p className="text-sm text-slate-700">Önizlemek için aşağıdan bir içerik bloğu ekle.</p>}
        {layout === "alternating" && blocks.length > 0 && illustrated.length === 0 && <p className="text-sm text-slate-700">Sağlı sollu düzen için ürün galerisine bir görsel ekle.</p>}
        <div dir={locale === "ar" ? "rtl" : "ltr"} className={mobile ? "mx-auto max-w-sm space-y-3" : "space-y-3"}>
          {illustrated.map(({ block, image, side }, index) => {
            const imageFirst = side ? (side === "left") !== (locale === "ar") : index % 2 === 1;
            return (
              <article key={block.id} className={`grid items-center gap-3 rounded-xl bg-white p-3 ${mobile ? "" : "grid-cols-2"}`}>
                <div className={!mobile && imageFirst ? "order-2" : ""}>
                  <h4 className="break-words font-semibold text-[#132175]">{block.title}</h4>
                  <p className="break-words text-sm text-slate-700">{block.body.replace(/<[^>]*>/g, " ")}</p>
                  {block.items.length > 0 && <ul className="list-inside list-disc text-sm">{block.items.map((item, i) => <li key={i}>{item}</li>)}</ul>}
                </div>
                <img src={resolveAsset(image)} alt="" className="mx-auto max-h-40 w-full object-contain" />
              </article>
            );
          })}
          <div className={mobile ? "grid gap-3" : "grid grid-cols-2 gap-3"}>
            {blocks.filter((block) => !illustrated.some((entry) => entry.block === block)).map((block) => (
              <article key={block.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <h4 className="break-words font-semibold text-[#132175]">{block.title}</h4>
                <p className="break-words text-sm text-slate-700">{block.body.replace(/<[^>]*>/g, " ")}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <DetailBlocksEditor key={locale} value={Array.isArray(editableBlocks) ? editableBlocks : []} onChange={changeBlocks} helper={`${locale.toUpperCase()} içerik bloklarını düzenle. Görsel ve konum seçimi aynı bölüm kimliğine sahip dil sürümlerinde kullanılır.`} />
    </div>
  );
}
