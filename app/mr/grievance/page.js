"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MRSidebar from "@/components/mr/MRSidebar";
import NotificationBell from "@/components/NotificationBell";
import { get, post } from "@/lib/api";
import { formatIST, timeAgoIST } from "@/lib/time";

const STATUS = {
  open:        { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-l-blue-500", label: "Open" },
  in_progress: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-l-amber-400", label: "In Progress" },
  resolved:    { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-l-emerald-500", label: "Resolved" },
  rejected:    { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-l-red-400", label: "Rejected" },
};
const PRIORITY = {
  low:    { bg: "bg-gray-100", text: "text-gray-500", label: "Low", icon: "↓" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium", icon: "→" },
  high:   { bg: "bg-red-100", text: "text-red-700", label: "High", icon: "↑" },
};

export default function GrievancePage() {
  const queryClient = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterTime, setFilterTime] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "MR" : "MR";

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => get("/api/v1/departments").then((d) => Array.isArray(d) ? d : d.departments || d.data || []),
    staleTime: 7 * 60 * 1000,
  });
  const departments = Array.isArray(deptData) ? deptData : (deptData?.departments || []);

  const { data, isLoading } = useQuery({
    queryKey: ["grievances", activeFilter],
    queryFn: () => get("/api/v1/grievances?limit=50" + (activeFilter !== "all" && !["open","in_progress","resolved","rejected"].includes(activeFilter) ? "&department=" + activeFilter : "")),
    staleTime: 7 * 60 * 1000,
  });

  const allTickets = data?.grievances || [];
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["grievances"] });

  const statusFilters = ["open","in_progress","resolved","rejected"];
  let tickets = allTickets;
  if (statusFilters.includes(activeFilter)) tickets = allTickets.filter((t) => t.status === activeFilter);
  if (filterCategory) tickets = tickets.filter((t) => t.department === filterCategory);
  if (search) tickets = tickets.filter((t) => t.subject?.toLowerCase().includes(search.toLowerCase()) || t.ticket_id?.toLowerCase().includes(search.toLowerCase()) || t.department?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    open: allTickets.filter((t) => t.status === "open").length,
    in_progress: allTickets.filter((t) => t.status === "in_progress").length,
    resolved: allTickets.filter((t) => t.status === "resolved").length,
    rejected: allTickets.filter((t) => t.status === "rejected").length,
  };

  const totalPages = Math.ceil(tickets.length / perPage);
  const paginatedTickets = tickets.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex">
      <MRSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`${sidebarCollapsed ? "md:ml-[60px]" : "md:ml-[220px]"} flex-1 min-h-screen transition-all duration-300`}>
        {/* Top Bar */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100/80 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(true)} className="md:hidden w-9 h-9 rounded-lg bg-gray-100 hover:bg-purple-50 flex items-center justify-center text-gray-600 hover:text-purple-600 transition-all mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
            <span className="font-medium">Dashboard</span>
            <span className="text-gray-300">›</span>
            <span className="font-semibold text-gray-800">Grievance</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell accentColor="indigo" />
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{userName.charAt(0).toUpperCase()}</div>
              <div className="hidden sm:block"><p className="text-sm font-bold text-gray-800 leading-none">{userName.split(" ")[0]}</p><p className="text-[10px] text-gray-400">MR</p></div>
            </div>
          </div>
        </header>

        <main className="px-4 md:px-6 py-4 md:py-5">
          {/* Page Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Grievances</h1>
                <p className="text-sm text-gray-400">Raise and track your support tickets</p>
              </div>
            </div>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-purple-200 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              New Ticket
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { key: "open", label: "Open", sub: "Require your action", value: stats.open, iconBg: "bg-blue-100", iconColor: "text-blue-600", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
              { key: "in_progress", label: "In Progress", sub: "Being reviewed", value: stats.in_progress, iconBg: "bg-amber-100", iconColor: "text-amber-600", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { key: "resolved", label: "Resolved", sub: "Successfully closed", value: stats.resolved, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { key: "rejected", label: "Rejected", sub: "Not accepted", value: stats.rejected, iconBg: "bg-red-100", iconColor: "text-red-600", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((s) => (
              <button key={s.key} onClick={() => setActiveFilter(activeFilter === s.key ? "all" : s.key)}
                className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${activeFilter === s.key ? "border-indigo-300 ring-2 ring-indigo-100" : "border-gray-200"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center`}><svg className={`w-5 h-5 ${s.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} /></svg></div>
                  <div><p className="text-2xl font-bold text-gray-900">{s.value}</p><p className="text-xs font-semibold text-gray-700">{s.label}</p><p className="text-[10px] text-gray-400">{s.sub}</p></div>
                </div>
              </button>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-3 mb-5 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search tickets by subject, ID or category..."
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300" />
            </div>
            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-600 outline-none focus:ring-2 focus:ring-indigo-100 bg-white min-w-[140px]">
              <option value="">All Categories</option>
              {departments.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
            </select>
            <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-600 outline-none focus:ring-2 focus:ring-indigo-100 bg-white min-w-[120px]">
              <option value="">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filter
            </button>
          </div>

          {/* Ticket List Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800">All Tickets</h2>
            <div className="flex items-center gap-3">
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setViewMode("list")} className={`p-1.5 ${viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-50"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <button onClick={() => setViewMode("grid")} className={`p-1.5 ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-50"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>Sort by:</span>
                <select className="text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-2 py-1.5 outline-none">
                  <option>Newest First</option><option>Oldest First</option><option>Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ticket List */}
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse border border-gray-100"/>)}</div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{search ? "No tickets match" : "No tickets yet"}</h3>
              <p className="text-sm text-gray-400 mb-4">{search ? "Try a different search term" : "Raise a ticket to get support"}</p>
              {!search && <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl text-xs font-bold shadow-md">Create First Ticket</button>}
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedTickets.map((ticket) => {
                const s = STATUS[ticket.status] || STATUS.open;
                const p = PRIORITY[ticket.priority] || PRIORITY.medium;
                return (
                  <div key={ticket.ticket_id || ticket._id || ticket.id} onClick={() => setSelectedTicket(ticket)}
                    className={`bg-white rounded-xl border border-gray-200 border-l-4 ${s.border} hover:shadow-md transition-all cursor-pointer group`}>
                    <div className="flex items-center p-4">
                      {/* Left icon */}
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{ticket.subject}</h3>
                          <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">#{ticket.ticket_id}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}><span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.bg} ${p.text}`}>{p.icon} {p.label}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1">
                          <span>Category: <strong className="text-gray-600 capitalize">{ticket.department}</strong></span>
                          <span>•</span>
                          <span>Raised on {ticket.created_at ? formatIST(ticket.created_at, { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—"}</span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-1">{ticket.description}</p>
                      </div>
                      {/* Right — last updated */}
                      <div className="text-right ml-4 flex-shrink-0 hidden sm:block">
                        <p className="text-[10px] text-gray-400">Last Updated</p>
                        <p className="text-xs font-semibold text-gray-600">{ticket.updated_at ? formatIST(ticket.updated_at, { day:"2-digit", month:"short", year:"numeric" }) : formatIST(ticket.created_at, { day:"2-digit", month:"short", year:"numeric" })}</p>
                        <p className="text-[10px] text-gray-400">{ticket.updated_at ? formatIST(ticket.updated_at, { hour:"2-digit", minute:"2-digit" }) : ""}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {tickets.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-400">Showing {(page-1)*perPage + 1} to {Math.min(page*perPage, tickets.length)} of {tickets.length} tickets</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(Math.max(1, page-1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === p ? "bg-indigo-600 text-white shadow-md" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(Math.min(totalPages, page+1))} disabled={page === totalPages || totalPages === 0}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {showCreate && <CreateTicketModal departments={departments} defaultDept={!["all","open","in_progress","resolved","rejected"].includes(activeFilter) ? activeFilter : ""} onClose={() => setShowCreate(false)} onCreated={() => { invalidate(); setShowCreate(false); }} />}
      {selectedTicket && <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </div>
  );
}

function CreateTicketModal({ departments, defaultDept, onClose, onCreated }) {
  const [form, setForm] = useState({ department: defaultDept || departments[0]?.code || "hr", subject: "", description: "", priority: "medium" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim()) { setError("Subject is required"); return; }
    if (!form.description.trim()) { setError("Description is required"); return; }
    setSaving(true); setError("");
    try { await post("/api/v1/grievances", form); onCreated(); }
    catch (err) { setError(err.message || "Failed to create ticket"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 flex items-center justify-between">
          <div><h2 className="text-white font-bold text-sm">New Grievance Ticket</h2><p className="text-indigo-200 text-[11px] mt-0.5">Describe your issue and we&apos;ll get back to you</p></div>
          <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-xs flex items-center gap-2"><svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Department *</label><select value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-200 bg-white">{departments.map((d)=><option key={d.code} value={d.code}>{d.name}</option>)}{departments.length===0&&<><option value="hr">HR</option><option value="finance">Finance</option></>}</select></div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Priority</label><select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-200 bg-white"><option value="low">↓ Low</option><option value="medium">→ Medium</option><option value="high">↑ High</option></select></div>
          </div>
          <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Subject *</label><input type="text" value={form.subject} onChange={(e)=>setForm({...form, subject:e.target.value})} placeholder="Brief summary of your issue…" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200"/></div>
          <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Description *</label><textarea value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} placeholder="Describe your issue in detail…" rows={5} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200 resize-none"/></div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 shadow-md">{saving ? "Submitting…" : "Submit Ticket"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TicketDetailModal({ ticket, onClose }) {
  const { data: detail } = useQuery({ queryKey: ["grievance-detail", ticket.ticket_id || ticket._id], queryFn: () => get(`/api/v1/grievances/${ticket.ticket_id || ticket._id}`), staleTime: 0 });
  const ft = detail || ticket;
  const s = STATUS[ft.status] || STATUS.open;
  const p = PRIORITY[ft.priority] || PRIORITY.medium;

  const timeline = [
    { label: "Submitted", done: true, time: ft.created_at },
    { label: "In Review", done: ["in_progress","resolved","rejected"].includes(ft.status) },
    { label: "Responded", done: !!(ft.admin_response || ft.response) },
    { label: "Closed", done: ["resolved","rejected"].includes(ft.status) },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-5 rounded-t-2xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-indigo-200 bg-white/20 px-2.5 py-0.5 rounded-lg">#{ft.ticket_id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.bg} ${p.text}`}>{p.icon} {p.label}</span>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl">×</button>
          </div>
          <h2 className="text-white font-bold text-base leading-snug mb-4">{ft.subject}</h2>
          <div className="flex items-start">
            {timeline.map((step, idx) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step.done ? "bg-white text-indigo-600 shadow-sm" : "bg-white/20 text-white/40"}`}>{step.done ? "✓" : idx+1}</div>
                  <span className={`text-[9px] mt-1 whitespace-nowrap ${step.done ? "text-white font-semibold" : "text-white/40"}`}>{step.label}</span>
                </div>
                {idx < timeline.length-1 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${timeline[idx+1].done ? "bg-white" : "bg-white/20"}`}/>}
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p><span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${s.bg} ${s.text}`}><span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}</span></div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Department</p><p className="text-xs font-bold text-gray-700 capitalize">{ft.department}</p></div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Priority</p><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${p.bg} ${p.text}`}>{p.icon} {p.label}</span></div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Submitted</p><p className="text-xs font-bold text-gray-700">{ft.created_at ? formatIST(ft.created_at, {day:"2-digit",month:"short"}) : "—"}</p></div>
          </div>
          {ft.description && (<div><p className="text-xs font-bold text-gray-500 uppercase mb-2">Description</p><div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">{ft.description}</div></div>)}
          {(ft.admin_response || ft.response) ? (
            <div><p className="text-xs font-bold text-gray-500 uppercase mb-2">Response from Admin</p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2.5 mb-3"><div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div><div><p className="text-xs font-bold text-emerald-800">{ft.responded_by_name || "Admin"}</p>{ft.responded_at && <p className="text-[10px] text-emerald-600">{formatIST(ft.responded_at)}</p>}</div></div>
                <p className="text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed">{ft.admin_response || ft.response}</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3"><div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-sm">⏳</span></div><div><p className="text-xs font-bold text-amber-800">Awaiting response</p><p className="text-[11px] text-amber-600 mt-0.5">The admin team will review shortly.</p></div></div>
          )}
          <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-all">Close</button>
        </div>
      </div>
    </div>
  );
}
