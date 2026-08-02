"use client";

import { useAdmin } from "./AdminContext";
import { daysWaiting, sourceLabel, STATUS_LABELS } from "./lead-ui";

const COLUMNS = [
  { key: "new", label: "Yeni", accent: "border-t-sky-500" },
  { key: "contacted", label: "Görüşüldü", accent: "border-t-amber-500" },
  { key: "qualified", label: "Uygun", accent: "border-t-violet-500" },
  { key: "won", label: "Kazanıldı", accent: "border-t-emerald-500" },
  { key: "lost", label: "Kapandı", accent: "border-t-rose-500" },
];

interface LeadsKanbanPanelProps {
  leads: any[];
  onSelectLead: (id: string) => void;
}

export default function LeadsKanbanPanel({ leads, onSelectLead }: LeadsKanbanPanelProps) {
  const { updateLeadStatus, deleteLead } = useAdmin();

  const grouped: Record<string, any[]> = {};
  for (const col of COLUMNS) grouped[col.key] = [];
  for (const lead of leads) {
    const status = lead.status || "new";
    if (grouped[status]) grouped[status].push(lead);
    else if (status !== "spam") grouped.new.push(lead);
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 min-h-[480px]">
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`flex-1 min-w-[220px] bg-white border border-gray-200 rounded-xl flex flex-col border-t-2 ${col.accent}`}
        >
          <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wide">{col.label}</span>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
              {grouped[col.key].length}
            </span>
          </div>
          <div className="flex-1 p-2 space-y-2 overflow-y-auto">
            {grouped[col.key].map((lead) => {
              const waiting = daysWaiting(lead.createdAt);
              return (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead.id)}
                  className="bg-[#f8f9fc] border border-gray-200 rounded-lg p-3 space-y-2 hover:border-[#132175]/30 hover:bg-white cursor-pointer transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{lead.name}</p>
                      <p className="text-[11px] text-[#132175] truncate">{lead.email}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold shrink-0 ${
                        col.key === "new" && waiting >= 1 ? "text-rose-600" : "text-gray-400"
                      }`}
                    >
                      {waiting === 0 ? "Bugün" : `${waiting}g`}
                    </span>
                  </div>
                  {lead.company && <p className="text-[11px] text-gray-500 truncate">{lead.company}</p>}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-600 font-semibold">
                      {sourceLabel(lead.sourcePage)}
                    </span>
                    {(lead.projectType || lead.subject || lead.interestType) && (
                      <span className="inline-flex px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-500 font-medium truncate max-w-[140px]">
                        {lead.projectType || lead.subject || lead.interestType}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 pt-1">
                    {col.key === "new" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLeadStatus(lead.id, "contacted");
                        }}
                        className="px-2 py-1 bg-[#132175] text-white rounded-md text-[10px] font-bold"
                      >
                        Görüşüldü
                      </button>
                    )}
                    {col.key !== "new" && (
                      <select
                        value={lead.status || "new"}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateLeadStatus(lead.id, e.target.value);
                        }}
                        className="px-1.5 py-1 bg-white border border-gray-200 rounded-md text-[10px] text-gray-600 font-semibold outline-none"
                      >
                        {Object.entries(STATUS_LABELS)
                          .filter(([key]) => key !== "spam")
                          .map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Bu lead silinsin mi?")) deleteLead(lead.id);
                      }}
                      className="ml-auto px-1.5 py-1 text-rose-400 hover:text-rose-500 text-[10px] font-bold"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              );
            })}
            {grouped[col.key].length === 0 && (
              <p className="text-center text-[11px] text-gray-400 py-10">Boş</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
