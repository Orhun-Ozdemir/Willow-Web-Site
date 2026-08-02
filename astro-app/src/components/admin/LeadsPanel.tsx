"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "./AdminContext";
import LeadsTablePanel from "./LeadsTablePanel";
import LeadsKanbanPanel from "./LeadsKanbanPanel";
import { cleanMessage, daysWaiting, leadSource } from "./lead-ui";

type ViewMode = "table" | "pipeline";
type StatusFilter = "all" | "new" | "contacted" | "qualified" | "won" | "lost" | "spam";
type SourceFilter = "all" | "contact" | "start-project" | "other";

interface LeadsPanelProps {
  onSelectLead: (id: string) => void;
}

export default function LeadsPanel({ onSelectLead }: LeadsPanelProps) {
  const { leads } = useAdmin();
  const [view, setView] = useState<ViewMode>("table");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [staleOnly, setStaleOnly] = useState(false);

  const stats = useMemo(() => {
    const byStatus = {
      new: 0,
      contacted: 0,
      qualified: 0,
      won: 0,
      lost: 0,
      spam: 0,
    };
    let staleNew = 0;
    for (const lead of leads) {
      const status = (lead.status || "new") as keyof typeof byStatus;
      if (status in byStatus) byStatus[status] += 1;
      else byStatus.new += 1;
      if ((lead.status || "new") === "new" && daysWaiting(lead.createdAt) >= 1) staleNew += 1;
    }
    return { ...byStatus, total: leads.length, staleNew };
  }, [leads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads
      .filter((lead) => {
        const status = lead.status || "new";
        if (statusFilter !== "all" && status !== statusFilter) return false;
        if (sourceFilter !== "all" && leadSource(lead.sourcePage) !== sourceFilter) return false;
        if (staleOnly && !(status === "new" && daysWaiting(lead.createdAt) >= 1)) return false;
        if (!q) return true;
        const haystack = [
          lead.name,
          lead.email,
          lead.company,
          lead.phone,
          lead.subject,
          lead.interestType,
          lead.projectType,
          cleanMessage(lead.message),
          lead.sourcePage,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        const aNew = (a.status || "new") === "new" ? 0 : 1;
        const bNew = (b.status || "new") === "new" ? 0 : 1;
        if (aNew !== bNew) return aNew - bNew;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [leads, query, statusFilter, sourceFilter, staleOnly]);

  const statCards = [
    { key: "new" as const, label: "Yeni", value: stats.new, tone: "border-sky-200 bg-sky-50 text-sky-800", active: statusFilter === "new" && !staleOnly },
    { key: "contacted" as const, label: "Görüşüldü", value: stats.contacted, tone: "border-amber-200 bg-amber-50 text-amber-800", active: statusFilter === "contacted" },
    { key: "qualified" as const, label: "Uygun", value: stats.qualified, tone: "border-violet-200 bg-violet-50 text-violet-800", active: statusFilter === "qualified" },
    { key: "won" as const, label: "Kazanıldı", value: stats.won, tone: "border-emerald-200 bg-emerald-50 text-emerald-800", active: statusFilter === "won" },
    { key: "stale" as const, label: "24s+ bekleyen", value: stats.staleNew, tone: "border-rose-200 bg-rose-50 text-rose-800", active: staleOnly },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#131b2e]" style={{ fontFamily: "var(--font-display)" }}>
            Leads
          </h3>
          <p className="text-xs text-gray-500">
            {stats.total} kayıt · {filtered.length} görünüyor
            {stats.staleNew > 0 ? ` · ${stats.staleNew} lead 24 saatten fazla bekliyor` : ""}
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
          {([
            { key: "table" as const, label: "Tablo" },
            { key: "pipeline" as const, label: "Pipeline" },
          ]).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setView(item.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                view === item.key ? "bg-[#132175] text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {statCards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => {
              if (card.key === "stale") {
                setStaleOnly((v) => !v);
                setStatusFilter("all");
                return;
              }
              setStaleOnly(false);
              setStatusFilter((prev) => (prev === card.key ? "all" : card.key));
            }}
            className={`rounded-xl border px-3 py-3 text-left transition ${card.tone} ${
              card.active ? "ring-2 ring-[#132175]/30 shadow-sm" : "hover:shadow-sm"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{card.label}</p>
            <p className="text-xl font-black mt-1">{card.value}</p>
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İsim, e-posta, şirket veya mesaj ara…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#132175] focus:ring-1 focus:ring-[#132175]/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setStaleOnly(false);
          }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#132175]"
        >
          <option value="all">Tüm durumlar</option>
          <option value="new">Yeni</option>
          <option value="contacted">Görüşüldü</option>
          <option value="qualified">Uygun</option>
          <option value="won">Kazanıldı</option>
          <option value="lost">Kapandı</option>
          <option value="spam">Spam</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#132175]"
        >
          <option value="all">Tüm kaynaklar</option>
          <option value="contact">Contact</option>
          <option value="start-project">Start Project</option>
          <option value="other">Diğer</option>
        </select>
        {(query || statusFilter !== "all" || sourceFilter !== "all" || staleOnly) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
              setSourceFilter("all");
              setStaleOnly(false);
            }}
            className="text-xs font-bold text-gray-500 hover:text-[#132175] px-2 py-2"
          >
            Temizle
          </button>
        )}
      </div>

      {view === "table" ? (
        <LeadsTablePanel leads={filtered} onSelectLead={onSelectLead} />
      ) : (
        <LeadsKanbanPanel leads={filtered} onSelectLead={onSelectLead} />
      )}
    </div>
  );
}
