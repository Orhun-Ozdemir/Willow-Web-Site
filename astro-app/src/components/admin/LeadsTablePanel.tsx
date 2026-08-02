"use client";

import { useAdmin } from "./AdminContext";
import { cleanMessage, daysWaiting, sourceLabel, STATUS_LABELS, statusChipClass } from "./lead-ui";

interface LeadsTablePanelProps {
  leads: any[];
  onSelectLead: (id: string) => void;
}

export default function LeadsTablePanel({ leads, onSelectLead }: LeadsTablePanelProps) {
  const { updateLeadStatus, deleteLead } = useAdmin();

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[860px]">
          <thead>
            <tr className="bg-[#f8f9fc] border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <th className="p-3.5">Kişi</th>
              <th className="p-3.5">İletişim</th>
              <th className="p-3.5">Kaynak / Konu</th>
              <th className="p-3.5">Bekleme</th>
              <th className="p-3.5">Durum</th>
              <th className="p-3.5 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map((lead) => {
              const status = lead.status || "new";
              const waiting = daysWaiting(lead.createdAt);
              const msg = cleanMessage(lead.message);
              return (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead.id)}
                  className="hover:bg-[#f5f7fb] cursor-pointer transition"
                >
                  <td className="p-3.5 align-top">
                    <p className="font-bold text-gray-900">{lead.name || "—"}</p>
                    <p className="text-gray-500 mt-0.5">{lead.company || "Şirket yok"}</p>
                    {msg && (
                      <p className="text-gray-400 mt-1 max-w-[220px] truncate" title={msg}>
                        {msg}
                      </p>
                    )}
                  </td>
                  <td className="p-3.5 align-top">
                    <a
                      href={`mailto:${lead.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#132175] hover:underline font-medium block"
                    >
                      {lead.email || "—"}
                    </a>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-500 hover:text-[#132175] mt-1 block"
                      >
                        {lead.phone}
                      </a>
                    )}
                  </td>
                  <td className="p-3.5 align-top">
                    <span className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold">
                      {sourceLabel(lead.sourcePage)}
                    </span>
                    <p className="text-gray-600 mt-1.5 font-medium">
                      {lead.projectType || lead.subject || lead.interestType || "Genel soru"}
                    </p>
                    {(lead.timeline || lead.budgetRange) && (
                      <p className="text-gray-400 mt-1">
                        {[lead.timeline && `Süre: ${lead.timeline}`, lead.budgetRange && `Bütçe: ${lead.budgetRange}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </td>
                  <td className="p-3.5 align-top">
                    <p className={`font-bold ${status === "new" && waiting >= 1 ? "text-rose-600" : "text-gray-700"}`}>
                      {waiting === 0 ? "Bugün" : `${waiting} gün`}
                    </p>
                    <p className="text-gray-400 mt-0.5">
                      {lead.createdAt
                        ? new Date(lead.createdAt).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </p>
                  </td>
                  <td className="p-3.5 align-top" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      className={`border rounded-lg px-2 py-1.5 outline-none font-semibold ${statusChipClass(status)}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3.5 align-top text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1.5">
                      {status === "new" && (
                        <button
                          type="button"
                          onClick={() => updateLeadStatus(lead.id, "contacted")}
                          className="px-2.5 py-1.5 rounded-lg bg-[#132175] text-white font-bold hover:bg-[#0e1a5e]"
                        >
                          Görüşüldü
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onSelectLead(lead.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                      >
                        Aç
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Bu lead silinsin mi?")) deleteLead(lead.id);
                        }}
                        className="px-2 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 font-bold"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">
                  Bu filtrelere uyan lead yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
