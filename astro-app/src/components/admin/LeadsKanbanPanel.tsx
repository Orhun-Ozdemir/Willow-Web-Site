"use client";

import { useAdmin } from "./AdminContext";

const COLUMNS = [
  { key: "new", label: "Yeni", color: "border-sky-500" },
  { key: "contacted", label: "Görüşüldü", color: "border-amber-500" },
  { key: "qualified", label: "Uygun", color: "border-purple-500" },
  { key: "won", label: "Kazanıldı", color: "border-emerald-500" },
  { key: "lost", label: "Kapandı", color: "border-red-500" },
];

interface LeadsKanbanPanelProps {
  onSelectLead: (id: string) => void;
}

export default function LeadsKanbanPanel({ onSelectLead }: LeadsKanbanPanelProps) {
  const { leads, updateLeadStatus, deleteLead } = useAdmin();

  const grouped: Record<string, any[]> = {};
  for (const col of COLUMNS) grouped[col.key] = [];
  for (const lead of leads) {
    const status = lead.status || "new";
    if (grouped[status]) grouped[status].push(lead);
    else grouped["new"].push(lead);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
      {COLUMNS.map((col) => (
        <div key={col.key} className={`flex-1 min-w-[240px] bg-white border border-gray-200 rounded-xl flex flex-col border-t-2 ${col.color}`}>
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase">{col.label}</span>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{grouped[col.key].length}</span>
          </div>
          <div className="flex-1 p-2 space-y-2 overflow-y-auto">
            {grouped[col.key].map((lead) => (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead.id)}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 hover:border-gray-300 cursor-pointer transition"
              >
                <p className="text-sm font-bold text-gray-800">{lead.name}</p>
                <p className="text-[10px] text-[#132175] truncate">{lead.email}</p>
                {lead.company && <p className="text-[10px] text-gray-500">{lead.company}</p>}
                {lead.projectType && (
                  <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-[9px] text-gray-500 font-semibold">{lead.projectType}</span>
                )}
                <div className="flex gap-1 pt-1 flex-wrap">
                  {COLUMNS.filter((c) => c.key !== col.key).map((target) => (
                    <button
                      key={target.key}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateLeadStatus(lead.id, target.key);
                      }}
                      className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-[9px] text-gray-500 font-medium transition"
                    >
                      → {target.label}
                    </button>
                  ))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLead(lead.id);
                    }}
                    className="px-1.5 py-0.5 text-red-400 hover:text-red-300 text-[9px] font-bold"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
            {grouped[col.key].length === 0 && (
              <p className="text-center text-[10px] text-gray-400 py-8">Boş</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
