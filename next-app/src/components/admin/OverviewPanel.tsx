"use client";

import { useAdmin } from "./AdminContext";

export default function OverviewPanel() {
  const { content, leads } = useAdmin();

  const stats = [
    { label: "Products", value: content?.products?.length || 0, color: "border-sky-500 text-sky-600" },
    { label: "News & Proof", value: content?.news?.length || 0, color: "border-amber-500 text-amber-600" },
    { label: "FAQ Items", value: content?.faqs?.length || 0, color: "border-purple-500 text-purple-600" },
    { label: "Solutions", value: content?.solutions?.length || 0, color: "border-cyan-500 text-cyan-600" },
    { label: "Clients", value: content?.clients?.length || 0, color: "border-pink-500 text-pink-600" },
    { label: "Leads/Messages", value: leads.length, color: "border-[#132175] text-[#132175]" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`p-5 bg-white rounded-xl border-l-4 ${s.color} shadow-sm border border-gray-100 space-y-2`}>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{s.label}</p>
            <p className="text-2xl font-extrabold text-[#131b2e]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-base font-bold mb-4">CMS Yönetim Paneli</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4">
          Sol menüden içerik bölümlerine ulaşabilirsiniz. Yaptığınız değişiklikler taslak olarak kalır. Veritabanına kaydetmek için sağ üstteki <strong>Kaydet</strong> butonunu kullanın.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="/en" target="_blank" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition">Site (EN)</a>
          <a href="/tr" target="_blank" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition">Site (TR)</a>
          <a href="/de" target="_blank" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition">Site (DE)</a>
        </div>
      </div>
    </div>
  );
}
