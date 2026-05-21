"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get } from "@/lib/api";
import { formatIST, timeAgoIST } from "@/lib/time";

const TYPE_STYLES = {
  announcement: { icon: "📢", bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700" },
  alert:        { icon: "🚨", bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700" },
  target:       { icon: "🎯", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  training:     { icon: "📚", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
};

const PRIORITY_STYLES = {
  low:    { dot: "bg-gray-400",  label: "Low" },
  medium: { dot: "bg-yellow-500", label: "Medium" },
  high:   { dot: "bg-orange-500", label: "High" },
  urgent: { dot: "bg-red-500",    label: "Urgent" },
};

export default function CommunicationCenter() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["communications", filterType, filterPriority],
    queryFn: () => {
      const params = new URLSearchParams({ limit: "50" });
      if (filterType) params.append("type", filterType);
      if (filterPriority) params.append("priority", filterPriority);
      return get("/api/v1/communications?" + params);
    },
    staleTime: 30000,
  });

  const communications = data?.communications || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <MRNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
        <Breadcrumb />

        {/* Header */}
        <div className="mb-5 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 rounded-2xl px-5 py-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📢</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Communication Center</h1>
              <p className="text-purple-200 text-xs">Company updates, field alerts & announcements</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex gap-1 bg-white rounded-lg p-0.5 shadow-sm border border-gray-100">
            {[
              { v: "",             l: "All" },
              { v: "announcement", l: "📢 Announcements" },
              { v: "alert",        l: "🚨 Alerts" },
              { v: "target",       l: "🎯 Targets" },
              { v: "training",     l: "📚 Training" },
            ].map((f) => (
              <button key={f.v} onClick={() => setFilterType(f.v)}
                className={"px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all " + (
                  filterType === f.v ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"
                )}>
                {f.l}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-white rounded-lg p-0.5 shadow-sm border border-gray-100">
            {[
              { v: "",       l: "All Priority" },
              { v: "urgent", l: "🔴 Urgent" },
              { v: "high",   l: "🟠 High" },
              { v: "medium", l: "🟡 Medium" },
            ].map((f) => (
              <button key={f.v} onClick={() => setFilterPriority(f.v)}
                className={"px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all " + (
                  filterPriority === f.v ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"
                )}>
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {/* Communications list */}
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3,4].map((i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />)}
          </div>
        ) : communications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <span className="text-5xl">📭</span>
            <p className="text-gray-400 mt-4 text-sm">No communications yet.</p>
            <p className="text-gray-300 text-xs mt-1">Company updates will appear here when sent to your territory.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {communications.map((comm) => {
              const t = TYPE_STYLES[comm.type] || TYPE_STYLES.announcement;
              const p = PRIORITY_STYLES[comm.priority] || PRIORITY_STYLES.medium;
              return (
                <div key={comm._id || comm.id} onClick={() => setSelected(comm)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group overflow-hidden">
                  <div className="flex">
                    {/* Priority stripe */}
                    <div className={"w-1 flex-shrink-0 " + p.dot} />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className={"w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 " + t.bg}>{t.icon}</span>
                          <h3 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors truncate">{comm.title}</h3>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={"px-2 py-0.5 rounded-md text-xs font-semibold " + t.bg + " " + t.text}>
                            {comm.type || "announcement"}
                          </span>
                          {comm.priority === "urgent" && (
                            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                              URGENT
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2 pl-9">{comm.preview || comm.content || comm.message}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 pl-9">
                        <span className="font-medium">{comm.created_by_name || comm.created_by || "Admin"}</span>
                        <span>{comm.created_at ? timeAgoIST(comm.created_at) : ""}</span>
                        {comm.attachments?.length > 0 && (
                          <span className="flex items-center gap-1 text-indigo-500 font-medium">
                            📎 {comm.attachments.length} file{comm.attachments.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail drawer — fetches full content + marks as read */}
      {selected && <CommDetailDrawer commId={selected._id || selected.id} onClose={() => { setSelected(null); queryClient.invalidateQueries({ queryKey: ["communications"] }); queryClient.invalidateQueries({ queryKey: ["comms-unread-count"] }); }} />}
    </div>
  );
}

function CommDetailDrawer({ commId, onClose }) {
  // Fetching full details auto-marks as read on the backend
  const { data: comm, isLoading } = useQuery({
    queryKey: ["comm-mr-detail", commId],
    queryFn: () => get("/api/v1/communications/" + commId),
    staleTime: 30000,
  });

  const t = TYPE_STYLES[comm?.type] || TYPE_STYLES.announcement;
  const p = PRIORITY_STYLES[comm?.priority] || PRIORITY_STYLES.medium;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl"
        style={{ animation: "slideInRight 0.25s ease-out" }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 px-5 py-5 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={"w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-white/20"}>{t.icon}</span>
              <span className="text-white/70 text-xs font-semibold uppercase">{comm?.type || "loading..."}</span>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
          </div>
          {isLoading ? (
            <div className="h-5 bg-white/20 rounded w-3/4 animate-pulse" />
          ) : (
            <h2 className="text-white font-bold text-base leading-tight">{comm?.title}</h2>
          )}
          {comm && (
            <div className="flex items-center gap-2 mt-2">
              <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-white/20 text-white"}>
                <span className={"w-1.5 h-1.5 rounded-full " + p.dot} /> {p.label}
              </span>
              <span className="text-purple-200 text-xs">{comm.created_at ? formatIST(comm.created_at) : ""}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          ) : comm ? (
            <>
          {/* Sender info */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(comm.created_by_name || comm.created_by || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{comm.created_by_name || comm.created_by || "Admin"}</p>
              <p className="text-xs text-gray-400">
                {comm.created_at ? formatIST(comm.created_at, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
              </p>
            </div>
          </div>

          {/* Message body */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {comm.content || comm.message}
          </div>

          {/* Attachments */}
          {comm.attachments?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Attachments</p>
              <div className="space-y-1.5">
                {comm.attachments.map((att, i) => (
                  <a key={i} href={att.file_url || att.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2.5 text-xs text-indigo-700 font-semibold hover:bg-indigo-100 transition-all group">
                    <span className="text-base">📎</span>
                    <span className="flex-1 truncate">{att.file_name || att.name || "Attachment " + (i + 1)}</span>
                    <span className="text-indigo-400 group-hover:text-indigo-600 flex-shrink-0">↓</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Targeting info (if visible) */}
          {comm.targeting && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Sent To</p>
              <div className="flex flex-wrap gap-1.5">
                {comm.targeting.zones?.map((z) => <span key={z} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-semibold">{z}</span>)}
                {comm.targeting.states?.map((s) => <span key={s} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-semibold">{s}</span>)}
                {comm.targeting.territories?.map((t) => <span key={t} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md text-xs font-semibold">{t}</span>)}
                {comm.targeting.teams?.map((t) => <span key={t} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-xs font-semibold">{t}</span>)}
                {comm.targeting.roles?.map((r) => <span key={r} className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md text-xs font-semibold">{r}</span>)}
              </div>
            </div>
          )}

          {/* Expiry */}
          {comm?.expires_at && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>⏰</span>
              <span>Expires: {formatIST(comm.expires_at, { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
          )}
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Communication not found.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all">
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
