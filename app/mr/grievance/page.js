"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, post } from "@/lib/api";
import { formatIST, timeAgoIST } from "@/lib/time";

const STATUS = {
  open:        { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   border: "border-l-blue-500",  label: "Open" },
  in_progress: { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500",  border: "border-l-amber-400", label: "In Progress" },
  resolved:    { bg: "bg-emerald-50",text: "text-emerald-700",dot: "bg-emerald-500",border: "border-l-emerald-500",label: "Resolved" },
  rejected:    { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500",    border: "border-l-red-400",   label: "Rejected" },
};

const PRIORITY = {
  low:    { bg: "bg-gray-100",    text: "text-gray-500",   label: "Low",    icon: "↓" },
  medium: { bg: "bg-amber-100",   text: "text-amber-700",  label: "Medium", icon: "→" },
  high:   { bg: "bg-red-100",     text: "text-red-700",    label: "High",   icon: "↑" },
};

export default function GrievancePage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search, setSearch] = useState("");

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => get("/api/v1/departments").then((d) => Array.isArray(d) ? d : d.departments || d.data || []),
    staleTime: 5 * 60 * 1000,
  });
  const departments = Array.isArray(deptData) ? deptData : (deptData?.departments || []);

  const { data, isLoading } = useQuery({
    queryKey: ["grievances", activeFilter],
    queryFn: () => get("/api/v1/grievances?limit=50" + (activeFilter !== "all" && !["open","in_progress","resolved","rejected"].includes(activeFilter) ? "&department=" + activeFilter : "")),
    staleTime: 30000,
  });

  const allTickets = data?.grievances || [];
  const invalidate  = () => queryClient.invalidateQueries({ queryKey: ["grievances"] });

  // Status filter
  const statusFilters = ["open","in_progress","resolved","rejected"];
  let tickets = allTickets;
  if (statusFilters.includes(activeFilter)) tickets = allTickets.filter((t) => t.status === activeFilter);
  if (search) tickets = tickets.filter((t) => t.subject?.toLowerCase().includes(search.toLowerCase()) || t.ticket_id?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    open:        allTickets.filter((t) => t.status === "open").length,
    in_progress: allTickets.filter((t) => t.status === "in_progress").length,
    resolved:    allTickets.filter((t) => t.status === "resolved").length,
    rejected:    allTickets.filter((t) => t.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <MRNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumb />

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">My Grievances</h1>
            <p className="text-sm text-gray-400 mt-0.5">Raise and track your support tickets</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            New Ticket
          </button>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { key:"open",        label:"Open",        value: stats.open,        color:"text-blue-700",    bg:"bg-blue-50 border-blue-100",     accent:"bg-blue-500" },
            { key:"in_progress", label:"In Progress", value: stats.in_progress, color:"text-amber-700",   bg:"bg-amber-50 border-amber-100",   accent:"bg-amber-500" },
            { key:"resolved",    label:"Resolved",    value: stats.resolved,    color:"text-emerald-700", bg:"bg-emerald-50 border-emerald-100",accent:"bg-emerald-500" },
            { key:"rejected",    label:"Rejected",    value: stats.rejected,    color:"text-red-700",     bg:"bg-red-50 border-red-100",       accent:"bg-red-500" },
          ].map((s) => (
            <button key={s.key} onClick={() => setActiveFilter(activeFilter === s.key ? "all" : s.key)}
              className={`rounded-2xl p-4 border text-left transition-all hover:shadow-sm ${s.bg} ${activeFilter === s.key ? "ring-2 ring-orange-400 shadow-sm" : ""}`}>
              <div className={`w-2 h-2 rounded-full ${s.accent} mb-2`} />
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* ── Filters + Search ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-5 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-200" />
          </div>
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeFilter === "all" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              All
            </button>
            {departments.map((d) => (
              <button key={d.code} onClick={() => setActiveFilter(d.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${activeFilter === d.code ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Ticket List ────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100"/>)}</div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-orange-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <p className="text-gray-700 font-bold text-sm mb-1">{search ? "No tickets match your search" : "No tickets yet"}</p>
            <p className="text-gray-400 text-xs mb-5">{search ? "Try a different search term" : "Raise a ticket to get support from your team"}</p>
            {!search && (
              <button onClick={() => setShowCreate(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl font-bold text-xs transition-all">
                Create First Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {tickets.map((ticket) => {
              const s = STATUS[ticket.status] || STATUS.open;
              const p = PRIORITY[ticket.priority] || PRIORITY.medium;
              const hasResponse = !!(ticket.admin_response || ticket.response);
              return (
                <div key={ticket.ticket_id || ticket._id || ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${s.border} p-4 hover:shadow-md transition-all cursor-pointer group`}>
                  <div className="flex items-start gap-3">
                    {/* Left: content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">#{ticket.ticket_id}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.bg} ${p.text}`}>
                          {p.icon} {p.label}
                        </span>
                        {hasResponse && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                            💬 Response
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{ticket.subject}</h3>
                      <p className="text-xs text-gray-400 line-clamp-1 mb-2">{ticket.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        <span className="capitalize font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{ticket.department}</span>
                        {ticket.created_at && <span>{timeAgoIST(ticket.created_at)}</span>}
                      </div>
                    </div>
                    {/* Right: arrow */}
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors mt-1 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateTicketModal departments={departments}
          defaultDept={!["all","open","in_progress","resolved","rejected"].includes(activeFilter) ? activeFilter : ""}
          onClose={() => setShowCreate(false)}
          onCreated={() => { invalidate(); setShowCreate(false); }} />
      )}
      {selectedTicket && (
        <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </div>
  );
}

// ── Create Ticket Modal ───────────────────────────────────────────────────────
function CreateTicketModal({ departments, defaultDept, onClose, onCreated }) {
  const [form, setForm] = useState({
    department: defaultDept || departments[0]?.code || "hr",
    subject: "",
    description: "",
    priority: "medium",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim())      { setError("Subject is required"); return; }
    if (!form.description.trim())  { setError("Description is required"); return; }
    setSaving(true); setError("");
    try {
      await post("/api/v1/grievances", form);
      onCreated();
    } catch (err) {
      setError(err.message || "Failed to create ticket");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-sm">New Grievance Ticket</h2>
            <p className="text-orange-100 text-[11px] mt-0.5">Describe your issue and we'll get back to you</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Department *</label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white appearance-none">
                {departments.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
                {departments.length === 0 && <><option value="hr">HR</option><option value="finance">Finance</option></>}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white appearance-none">
                <option value="low">↓ Low</option>
                <option value="medium">→ Medium</option>
                <option value="high">↑ High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Subject *</label>
            <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Brief summary of your issue…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your issue in detail — include relevant context, dates, or people involved…"
              rows={5}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 resize-none transition-all" />
            <p className="text-[11px] text-gray-400 mt-1">{form.description.length} characters</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-all shadow-sm hover:shadow-md">
              {saving ? "Submitting…" : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Ticket Detail Modal ───────────────────────────────────────────────────────
function TicketDetailModal({ ticket, onClose }) {
  const { data: detail } = useQuery({
    queryKey: ["grievance-detail", ticket.ticket_id || ticket._id],
    queryFn: () => get(`/api/v1/grievances/${ticket.ticket_id || ticket._id}`),
    staleTime: 0,
  });

  const ft = detail || ticket;
  const s  = STATUS[ft.status] || STATUS.open;
  const p  = PRIORITY[ft.priority] || PRIORITY.medium;

  const timeline = [
    { label: "Submitted",  done: true,                                                            time: ft.created_at },
    { label: "In Review",  done: ["in_progress","resolved","rejected"].includes(ft.status),       time: null },
    { label: "Responded",  done: !!(ft.admin_response || ft.response),                            time: ft.responded_at },
    { label: "Closed",     done: ["resolved","rejected"].includes(ft.status),                     time: ft.resolved_at },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-5 rounded-t-2xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-orange-100 bg-white/20 px-2.5 py-0.5 rounded-lg">#{ft.ticket_id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.bg} ${p.text}`}>{p.icon} {p.label}</span>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all text-xl">×</button>
          </div>
          <h2 className="text-white font-bold text-base leading-snug mb-4">{ft.subject}</h2>

          {/* Status timeline */}
          <div className="flex items-start">
            {timeline.map((step, idx) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step.done ? "bg-white text-orange-600 shadow-sm" : "bg-white/20 text-white/40"}`}>
                    {step.done ? "✓" : idx + 1}
                  </div>
                  <span className={`text-[9px] mt-1 whitespace-nowrap ${step.done ? "text-white font-semibold" : "text-white/40"}`}>{step.label}</span>
                </div>
                {idx < timeline.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 ${timeline[idx+1].done ? "bg-white" : "bg-white/20"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Department</p>
              <p className="text-xs font-bold text-gray-700 capitalize">{ft.department}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Priority</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${p.bg} ${p.text}`}>{p.icon} {p.label}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Submitted</p>
              <p className="text-xs font-bold text-gray-700">{ft.created_at ? formatIST(ft.created_at, { day:"2-digit", month:"short" }) : "—"}</p>
            </div>
          </div>

          {/* Description */}
          {ft.description && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</p>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                {ft.description}
              </div>
            </div>
          )}

          {/* Admin response */}
          {(ft.admin_response || ft.response) ? (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Response from Admin</p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-800">{ft.responded_by_name || "Admin"}</p>
                    {ft.responded_at && <p className="text-[10px] text-emerald-600">{formatIST(ft.responded_at)}</p>}
                  </div>
                </div>
                <p className="text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed">{ft.admin_response || ft.response}</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm">⏳</span>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-800">Awaiting response</p>
                <p className="text-[11px] text-amber-600 mt-0.5">The admin team will review and respond shortly.</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          {(ft.updated_at || ft.resolved_at) && (
            <div className="text-[11px] text-gray-400 space-y-1 border-t border-gray-100 pt-4">
              {ft.updated_at   && <p>Last updated: {formatIST(ft.updated_at)}</p>}
              {ft.resolved_at  && <p>Closed: {formatIST(ft.resolved_at)}</p>}
            </div>
          )}

          <button onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
