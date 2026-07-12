"use client";

import { useAdmin } from "./AdminContext";

interface LeadsTablePanelProps {
  onSelectLead: (id: string) => void;
}

export default function LeadsTablePanel({ onSelectLead }: LeadsTablePanelProps) {
  const { leads, updateLeadStatus, deleteLead } = useAdmin();

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-gray-200 bg-white/80 flex items-center justify-between">
        <h3 className="font-bold text-sm">Form Gönderileri</h3>
        <span className="text-xs text-gray-400">{leads.length} kayıt</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <th className="p-4">İletişim</th>
              <th className="p-4">Şirket</th>
              <th className="p-4">Konu</th>
              <th className="p-4">Mesaj</th>
              <th className="p-4">Zaman/Bütçe</th>
              <th className="p-4">Durum</th>
              <th className="p-4">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelectLead(lead.id)}
                className="hover:bg-gray-100/60 cursor-pointer transition"
              >
                <td className="p-4">
                  <p className="font-bold text-gray-800">{lead.name}</p>
                  <a
                    href={`mailto:${lead.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#132175] hover:underline"
                  >
                    {lead.email}
                  </a>
                </td>
                <td className="p-4 text-gray-700">{lead.company || "—"}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold">
                    {lead.projectType || lead.subject || lead.interestType || "Soru"}
                  </span>
                  {lead.sourcePage?.includes("contact") && (
                    <p className="text-[10px] text-gray-400 mt-1">Contact</p>
                  )}
                  {lead.sourcePage?.includes("start-project") && (
                    <p className="text-[10px] text-gray-400 mt-1">Start Project</p>
                  )}
                </td>
                <td className="p-4 text-gray-500 max-w-xs truncate" title={lead.message}>
                  {(lead.message || "").replace(/\n\n--- Project brief ---[\s\S]*$/, "") || "—"}
                </td>
                <td className="p-4 text-gray-500">
                  {lead.timeline && <p>Süre: {lead.timeline}</p>}
                  {lead.budgetRange && <p>Bütçe: {lead.budgetRange}</p>}
                </td>
                <td className="p-4">
                  <select
                    value={lead.status || "new"}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateLeadStatus(lead.id, e.target.value);
                    }}
                    className="bg-gray-100 border border-gray-300 rounded px-2 py-1 outline-none text-gray-800"
                  >
                    <option value="new">Yeni</option>
                    <option value="contacted">Görüşüldü</option>
                    <option value="qualified">Uygun</option>
                    <option value="won">Kazanıldı</option>
                    <option value="lost">Kapandı</option>
                    <option value="spam">Spam</option>
                  </select>
                </td>
                <td className="p-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLead(lead.id);
                    }}
                    className="text-red-400 hover:text-red-300 font-bold"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Henüz mesaj yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
