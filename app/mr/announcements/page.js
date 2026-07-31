"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MRSidebar from "@/components/mr/MRSidebar";
import NotificationBell from "@/components/NotificationBell";
import { get } from "@/lib/api";
import { formatIST, timeAgoIST } from "@/lib/time";

const TYPE_STYLES = {
  announcement: { icon: "📢", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  alert: { icon: "🚨", bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  target: { icon: "🎯", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  training: { icon: "📚", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
};
const PRIORITY_STYLES = {
  low: { dot: "bg-gray-400", label: "Low" },
  medium: { dot: "bg-yellow-500", label: "Medium" },
  high: { dot: "bg-orange-500", label: "High" },
  urgent: { dot: "bg-red-500", label: "Urgent" },
};

export default function CommunicationCenter() {
  const queryClient = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "MR" : "MR";

  const { data, isLoading, refetch } = useQuery({
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
  const totalCount = communications.length;
  const urgentCount = communications.filter(c => c.priority === "urgent").length;
  const highCount = communications.filter(c => c.priority === "high").length;
  const mediumCount = communications.filter(c => c.priority === "medium").length;
  const readCount = communications.filter(c => c.is_read).length;

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
            <span className="font-semibold text-gray-800">Comms Center</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell accentColor="indigo" />
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{userName.charAt(0).toUpperCase()}</div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{userName.split(" ")[0]}</p>
                <p className="text-[10px] text-gray-400">MR</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 md:px-6 py-4 md:py-5">
          {/* Page Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Communications Center</h1>
                <p className="text-sm text-gray-400">Stay informed with company updates, alerts & important announcements.</p>
              </div>
            </div>
            <div className="hidden md:block">
              <svg className="w-16 h-16 text-indigo-100" fill="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
          </div>

          {/* Category & Priority Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 overflow-x-auto">
              {[
                { v: "", l: "All", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
                { v: "announcement", l: "Announcements", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
                { v: "alert", l: "Alerts", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
                { v: "target", l: "Targets", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
                { v: "training", l: "Training", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
              ].map((f) => (
                <button key={f.v} onClick={() => setFilterType(f.v)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filterType === f.v ? "bg-indigo-600 text-white shadow-md shadow-purple-200" : "text-gray-500 hover:bg-gray-50"
                  }`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} /></svg>
                  {f.l}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 overflow-x-auto">
              {[
                { v: "", l: "All Priority", color: "bg-indigo-500" },
                { v: "urgent", l: "Urgent", color: "bg-red-500" },
                { v: "high", l: "High", color: "bg-orange-500" },
                { v: "medium", l: "Medium", color: "bg-yellow-500" },
              ].map((f) => (
                <button key={f.v} onClick={() => setFilterPriority(f.v)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filterPriority === f.v ? "bg-indigo-600 text-white shadow-md shadow-purple-200" : "text-gray-500 hover:bg-gray-50"
                  }`}>
                  {f.v && <span className={`w-2 h-2 rounded-full ${f.color}`} />}
                  {f.l}
                </button>
              ))}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg></div>
              <div><p className="text-lg font-bold text-gray-900">{totalCount}</p><p className="text-[10px] text-gray-400">Total Communications</p></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
              <div><p className="text-lg font-bold text-gray-900">{urgentCount}</p><p className="text-[10px] text-gray-400">Urgent</p></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg></div>
              <div><p className="text-lg font-bold text-gray-900">{highCount}</p><p className="text-[10px] text-gray-400">High Priority</p></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center"><svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg></div>
              <div><p className="text-lg font-bold text-gray-900">{mediumCount}</p><p className="text-[10px] text-gray-400">Medium Priority</p></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div><p className="text-lg font-bold text-gray-900">{readCount}</p><p className="text-[10px] text-gray-400">Read</p></div>
            </div>
          </div>

          {/* Main content — 2 columns */}
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Left — Communications list */}
            <div className="flex-1 min-w-0">
              {/* List header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-800">Recent Communications</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Sort by:</span>
                  <select className="text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-2 py-1.5 outline-none">
                    <option>Newest</option>
                    <option>Oldest</option>
                    <option>Priority</option>
                  </select>
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => setViewMode("list")} className={`p-1.5 ${viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-50"}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <button onClick={() => setViewMode("grid")} className={`p-1.5 ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-50"}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              {isLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />)}</div>
              ) : communications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">No communications yet</h3>
                  <p className="text-sm text-gray-400 mb-4">Company updates, alerts and announcements<br/>will appear here when sent to your territory.</p>
                  <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-50 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {communications.map((comm) => {
                    const t = TYPE_STYLES[comm.type] || TYPE_STYLES.announcement;
                    const p = PRIORITY_STYLES[comm.priority] || PRIORITY_STYLES.medium;
                    return (
                      <div key={comm._id || comm.id} onClick={() => setSelected(comm)}
                        className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group overflow-hidden">
                        <div className="flex">
                          <div className={"w-1 flex-shrink-0 " + p.dot} />
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className={"w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 " + t.bg}>{t.icon}</span>
                                <h3 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors truncate">{comm.title}</h3>
                              </div>
                              <span className={"px-2 py-0.5 rounded-md text-[10px] font-semibold " + t.bg + " " + t.text}>{comm.type || "announcement"}</span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1 mb-2 pl-9">{comm.preview || comm.content || comm.message}</p>
                            <div className="flex items-center gap-3 text-[10px] text-gray-400 pl-9">
                              <span className="font-medium">{comm.created_by_name || "Admin"}</span>
                              <span>{comm.created_at ? timeAgoIST(comm.created_at) : ""}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right sidebar — Quick Actions + Stay Updated */}
            <div className="w-[280px] flex-shrink-0 space-y-4 hidden lg:block">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button onClick={() => { /* mark all read */ }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-gray-700 group-hover:text-indigo-600">Mark all as read</p>
                      <p className="text-[10px] text-gray-400">Clear all unread items</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-gray-700 group-hover:text-indigo-600">Notification settings</p>
                      <p className="text-[10px] text-gray-400">Manage alerts & preferences</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                    <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-gray-700 group-hover:text-indigo-600">Communication archive</p>
                      <p className="text-[10px] text-gray-400">View older communications</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>

              {/* Stay Updated */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Stay Updated</h3>
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Enable push notifications</p>
                <p className="text-[10px] text-gray-400 mb-3">Never miss an important update</p>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-50 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  Enable Notifications
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Detail drawer */}
      {selected && <CommDetailDrawer commId={selected._id || selected.id} onClose={() => { setSelected(null); queryClient.invalidateQueries({ queryKey: ["communications"] }); queryClient.invalidateQueries({ queryKey: ["comms-unread-count"] }); }} />}
    </div>
  );
}

function CommDetailDrawer({ commId, onClose }) {
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
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl" style={{ animation: "slideInRight 0.25s ease-out" }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-5 py-5 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-white/20">{t.icon}</span>
              <span className="text-white/70 text-xs font-semibold uppercase">{comm?.type || "loading..."}</span>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
          </div>
          {isLoading ? <div className="h-5 bg-white/20 rounded w-3/4 animate-pulse" /> : <h2 className="text-white font-bold text-base leading-tight">{comm?.title}</h2>}
          {comm && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-white/20 text-white"><span className={"w-1.5 h-1.5 rounded-full " + p.dot} /> {p.label}</span>
              <span className="text-indigo-200 text-xs">{comm.created_at ? formatIST(comm.created_at) : ""}</span>
            </div>
          )}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="space-y-3"><div className="h-12 bg-gray-100 rounded-xl animate-pulse" /><div className="h-24 bg-gray-100 rounded-xl animate-pulse" /></div>
          ) : comm ? (
            <>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{(comm.created_by_name || "A").charAt(0).toUpperCase()}</div>
                <div><p className="text-sm font-semibold text-gray-800">{comm.created_by_name || "Admin"}</p><p className="text-xs text-gray-400">{comm.created_at ? formatIST(comm.created_at) : ""}</p></div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{comm.content || comm.message}</div>
              {comm.attachments?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Attachments</p>
                  <div className="space-y-1.5">{comm.attachments.map((att, i) => (
                    <a key={i} href={att.file_url || att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2.5 text-xs text-indigo-700 font-semibold hover:bg-indigo-100 transition-all">
                      <span>📎</span><span className="flex-1 truncate">{att.file_name || att.name || "Attachment " + (i+1)}</span><span className="text-indigo-400">↓</span>
                    </a>
                  ))}</div>
                </div>
              )}
            </>
          ) : <p className="text-gray-400 text-sm text-center py-8">Communication not found.</p>}
        </div>
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all">Close</button>
        </div>
      </div>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
}
