"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, put } from "@/lib/api";
import { formatIST, timeAgoIST } from "@/lib/time";

const STATUS = {
  open:        { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",    border: "border-l-blue-500",   label: "Open" },
  in_progress: { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   border: "border-l-amber-400",  label: "In Progress" },
  resolved:    { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-l-emerald-500", label: "Resolved" },
  rejected:    { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",     border: "border-l-red-400",    label: "Rejected" },
};

const PRIORITY = {
  low:    { bg: "bg-gray-100",  text: "text-gray-500",  label: "Low",    icon: "↓" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium", icon: "→" },
  high:   { bg: "bg-red-100",   text: "text-red-700",   label: "High",   icon: "↑" },
  urgent: { bg: "bg-red-200",   text: "text-red-900",   label: "Urgent", icon: "⚡" },
};

export default function AdminGrievances() {
  const [activeTab, setActiveTab]       = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch]             = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminDept, setAdminDept]       = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const dept = localStorage.getItem("userDepartment");
    const hasNoDept = !dept || dept === "null" || dept === "undefined" || dept === "general" || dept.trim() === "";
    if (!hasNoDept) { setAdminDept(dept); setActiveTab(dept); }
  }, []);

  const deptFilter = adminDept || (activeTab !== "all" ? activeTab : "");

  const { data: statsData } = useQuery({
    queryKey: ["grievance-stats", adminDept],
    queryFn: () => get("/api/v1/grievances/admin/stats/dashboard" + (adminDept ? "?department=" + adminDept : "")),
    staleTime: 30000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-grievances", deptFilter],
    queryFn: () => get("/api/v1/grievances/admin/list?limit=50" + (deptFilter ? "&department=" + deptFilter : "")),
    staleTime: 30000,
  });

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => get("/api/v1/departments").then((d) => Array.isArray(d) ? d : d.departments || d.data || []),
    staleTime: 5 * 60 * 1000,
    enabled: !adminDept,
  });

  const departments = deptData || [];
  const allTickets  = data?.grievances || [];
  const stats       = statsData || {};

  // Apply status + search filter client-side
  let tickets = allTickets;
  if (statusFilter !== "all") tickets = tickets.filter((t) => t.status === statusFilter);
  if (search) tickets = tickets.filter((t) =>
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.ticket_id?.toLowerCase().includes(search.toLowerCase()) ||
    (t.created_by_name || t.mr_name)?.toLowerCase().includes(search.toLowerCase())
  );

  const statCounts = {
    open:        allTickets.filter((t) => t.status === "open").length,
    in_progress: allTickets.filter((t) => t.status === "in_progress").length,
    resolved:    allTickets.filter((t) => t.status === "resolved").length,
    rejected:    allTickets.filter((t) => t.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <CompanyNavbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumb />

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Grievance Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {adminDept ? `${adminDept.charAt(0).toUpperCase() + adminDept.slice(1)} department` : "View and respond to MR support tickets"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-center">
            {[
              { label:"Open",        value: stats.open        ?? statCounts.open,        color:"text-blue-600" },
              { label:"In Progress", value: stats.in_progress ?? statCounts.in_progress, color:"text-amber-600" },
              { label:"Resolved",    value: stats.resolved    ?? statCounts.resolved,    color:"text-emerald-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm text-center min-w-[64px]">
                <p className={`text-lg font-extrabold ${s.color}`}>{s.value ?? "—"}</p>
                <p className="text-[10px] text-gray-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { key:"open",        label:"Open",        value: statCounts.open,        color:"text-blue-700",    bg:"bg-blue-50 border-blue-100",      accent:"bg-blue-500" },
            { key:"in_progress", label:"In Progress", value: statCounts.in_progress, color:"text-amber-700",   bg:"bg-amber-50 border-amber-100",    accent:"bg-amber-500" },
            { key:"resolved",    label:"Resolved",    value: statCounts.resolved,    color:"text-emerald-700", bg:"bg-emerald-50 border-emerald-100", accent:"bg-emerald-500" },
            { key:"rejected",    label:"Rejected",    value: statCounts.rejected,    color:"text-red-700",     bg:"bg-red-50 border-red-100",         accent:"bg-red-500" },
          ].map((s) => (
            <button key={s.key} onClick={() => setStatusFilter(statusFilter === s.key ? "all" : s.key)}
              className={`rounded-2xl p-4 border text-left transition-all hover:shadow-sm ${s.bg} ${statusFilter === s.key ? "ring-2 ring-purple-400 shadow-sm" : ""}`}>
              <div className={`w-2 h-2 rounded-full ${s.accent} mb-2`} />
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* ── Filters ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-5 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by subject, ticket ID, or MR name…"
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
          {!adminDept && (
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "all" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                All Depts
              </button>
              {departments.filter((d) => d.is_active !== false).map((d) => (
                <button key={d.code} onClick={() => setActiveTab(d.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${activeTab === d.code ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {d.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Ticket List ─────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="space-y-2.5">{[1,2,3,4].map((i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100"/>)}</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <span className="text-4xl block mb-3">📝</span>
            <p className="text-gray-500 font-semibold text-sm">{search ? "No tickets match your search" : "No grievances found"}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tickets.map((t) => {
              const s = STATUS[t.status] || STATUS.open;
              const p = PRIORITY[t.priority] || PRIORITY.medium;
              const needsAction = t.status === "open" || t.status === "in_progress";
              const hasResponse = !!(t.admin_response || t.response);
              return (
                <div key={t.ticket_id || t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${s.border} p-4 hover:shadow-md transition-all cursor-pointer group`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">#{t.ticket_id}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.bg} ${p.text}`}>{p.icon} {p.label}</span>
                        {!hasResponse && needsAction && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100 animate-pulse">
                            Needs Response
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{t.subject}</h3>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                        <span className="font-medium text-gray-600">{t.created_by_name || t.mr_name || "Unknown MR"}</span>
                        {(t.mr_territory || t.territory) && <span>📍 {t.mr_territory || t.territory}</span>}
                        <span className="capitalize bg-gray-50 px-2 py-0.5 rounded">{t.department}</span>
                        {t.created_at && <span>{timeAgoIST(t.created_at)}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        needsAction ? "bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        {needsAction ? "Respond" : "View"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedTicket && (
        <GrievanceDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onResponded={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-grievances"] });
            queryClient.invalidateQueries({ queryKey: ["grievance-stats"] });
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
}

// ── Admin Response Modal ──────────────────────────────────────────────────────
function GrievanceDetailModal({ ticket, onClose, onResponded }) {
  const [response, setResponse] = useState("");
  const [status, setStatus]     = useState(ticket.status === "open" ? "in_progress" : ticket.status);
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState("");

  const { data: detail } = useQuery({
    queryKey: ["grievance-detail-admin", ticket.ticket_id],
    queryFn: () => get(`/api/v1/grievances/admin/${ticket.ticket_id}`),
    staleTime: 0,
  });

  const ft = detail || ticket;
  const s  = STATUS[ft.status] || STATUS.open;
  const p  = PRIORITY[ft.priority] || PRIORITY.medium;

  const handleSend = async () => {
    if (!response.trim()) return;
    setSending(true); setError("");
    try {
      await put("/api/v1/grievances/admin/" + ticket.ticket_id, { admin_response: response, status });
      onResponded();
    } catch (err) {
      setError(err.message || "Failed to send response");
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 rounded-t-2xl">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-purple-200 bg-white/20 px-2.5 py-0.5 rounded-lg">#{ft.ticket_id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.bg} ${p.text}`}>{p.icon} {p.label}</span>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl">×</button>
          </div>
          <h2 className="text-white font-bold text-base leading-snug mt-2">{ft.subject}</h2>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-purple-200">
            <span>{ft.created_by_name || ft.mr_name}</span>
            {(ft.mr_territory || ft.territory) && <><span>·</span><span>{ft.mr_territory || ft.territory}</span></>}
            <span>·</span><span className="capitalize">{ft.department}</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
            </span>
            {ft.created_at && <span className="text-[11px] text-gray-400">{formatIST(ft.created_at, { day:"2-digit", month:"short", year:"numeric" })}</span>}
          </div>

          {/* Description */}
          {ft.description && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Issue Description</p>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                {ft.description}
              </div>
            </div>
          )}

          {/* Previous response */}
          {(ft.admin_response || ft.response) && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Previous Response</p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center"><svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>
                  <div>
                    <p className="text-xs font-bold text-emerald-800">{ft.responded_by_name || "Admin"}</p>
                    {ft.responded_at && <p className="text-[10px] text-emerald-600">{formatIST(ft.responded_at)}</p>}
                  </div>
                </div>
                <p className="text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed">{ft.admin_response || ft.response}</p>
              </div>
            </div>
          )}

          {/* Response form */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {ft.admin_response ? "Update Response" : "Send Response"}
            </p>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs mb-3">{error}</div>}
            <textarea
              placeholder="Type your response to the MR…"
              rows={4}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all mb-3"
            />
            <div className="flex gap-3">
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-purple-200 flex-1">
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button onClick={handleSend} disabled={sending || !response.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs disabled:opacity-50 transition-all hover:shadow-md">
                {sending ? "Sending…" : "Send Response"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
