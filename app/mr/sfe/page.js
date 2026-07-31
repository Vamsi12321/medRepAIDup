"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MRSidebar from "@/components/mr/MRSidebar";
import NotificationBell from "@/components/NotificationBell";
import { get, post, put } from "@/lib/api";
import { formatISTDate, formatISTTime } from "@/lib/time";
import MCRPrintTemplate from "@/components/MCRPrintTemplate";

const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1;
const CURRENT_YEAR = now.getFullYear();

const TABS = [
  { id: "mcr",  label: "MCR (Monthly Call Report)", icon: "📞" },
  { id: "mvc",  label: "MVC (Visit Coverage)",      icon: "🔄" },
  { id: "rcpa", label: "RCPA (Commitments)",        icon: "💊" },
];

const formatLoc = (loc) => loc && typeof loc === "object" ? loc.location_name || loc.temporary_location?.name || "" : loc || "";

export default function SFEPage() {
  const [activeTab, setActiveTab] = useState("mcr");
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear] = useState(CURRENT_YEAR);

  // Read URL params for deep-linking (e.g. from visit report → RCPA)
  const [urlVisitId, setUrlVisitId] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const visitId = params.get("visitId");
    if (tab === "rcpa") setActiveTab("rcpa");
    if (visitId) setUrlVisitId(visitId);
  }, []);

  // Fetch MR's own profile info
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const { data: mrList } = useQuery({
    queryKey: ["my-mr-info"],
    queryFn: () => get("/api/v1/mrs").then((r) => r.mrs || []),
    staleTime: 10 * 60 * 1000,
  });
  const mrInfo = (mrList || []).find((m) => m.id === userId) || null;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showMCRPrint, setShowMCRPrint] = useState(false);
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "MR" : "MR";

  // MCR data for print — fetched at parent level
  const { data: mcrData } = useQuery({
    queryKey: ["sfe-mcr-print", month, year],
    queryFn: () => get("/api/v1/sfe/mcr", { month, year }),
    staleTime: 2 * 60 * 1000,
  });

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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
              <span className="font-medium">{mrInfo?.territory || "Visakhapatnam, AP"}</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell accentColor="indigo" />
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{userName.charAt(0).toUpperCase()}</div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{userName.split(" ")[0]} {userName.split(" ")[1]?.charAt(0) || ""}.</p>
                <p className="text-[10px] text-gray-400">MR - Field Executive</p>
              </div>
            </div>
          </div>
        </header>

      <main className="px-4 md:px-6 py-4 md:py-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-3">
          <span>🏠 SFE</span><span>›</span><span className="text-gray-600 font-medium">SFE Analytics</span>
        </div>

        {/* Header + Month/Year */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-0.5">SFE Analytics</h1>
            <p className="text-xs text-gray-400">Track your performance, coverage & commitments</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-xs">📅</span>
              <select value={month} onChange={(e) => setMonth(+e.target.value)} className="text-xs font-medium text-gray-700 outline-none bg-transparent">
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(2026, i).toLocaleString("default", { month: "long" })}</option>
                ))}
              </select>
            </div>
            <select value={year} onChange={(e) => setYear(+e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium text-gray-700 outline-none">
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><span className="text-lg">🩺</span></div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">{mrInfo?.assigned_doctors?.length || 0}</p>
              <p className="text-[10px] text-gray-400">Total Doctors</p>
              <p className="text-[9px] text-gray-300">👤 Assigned to you</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><span className="text-lg">✅</span></div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">0</p>
              <p className="text-[10px] text-gray-400">Visited</p>
              <p className="text-[9px] text-green-500">✅ 0% of total</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-orange-200 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><span className="text-lg">⏳</span></div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">0</p>
              <p className="text-[10px] text-gray-400">In Progress</p>
              <p className="text-[9px] text-orange-400">⏳ 0% of total</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-red-200 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><span className="text-lg">❌</span></div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">{mrInfo?.assigned_doctors?.length || 0}</p>
              <p className="text-[10px] text-gray-400">Not Visited</p>
              <p className="text-[9px] text-red-400">❌ 100% of total</p>
            </div>
          </div>
        </div>

        {/* MR Profile + Activity Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
          {/* MR Profile Card */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-5">
            {mrInfo ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-base font-bold">
                    {mrInfo.name?.charAt(0) || "M"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{mrInfo.name}</p>
                    <p className="text-[11px] text-gray-400">{mrInfo.territory} · {mrInfo.zone} · {mrInfo.state}</p>
                  </div>
                </div>
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-indigo-500">✉️</span>
                    <span className="text-[11px] text-gray-600">{mrInfo.email}</span>
                  </div>
                  {mrInfo.phone && (
                    <div className="flex items-center gap-2.5">
                      <span className="text-indigo-500">📞</span>
                      <span className="text-[11px] text-gray-600">{mrInfo.phone}</span>
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 mb-1">Coverage Area</p>
                  <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100 font-medium">{mrInfo.territory} ({mrInfo.zone})</span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-[10px] text-gray-400">Doctors Assigned</p>
                  <p className="text-lg font-extrabold text-gray-900">{mrInfo.assigned_doctors?.length || 0}</p>
                </div>
              </>
            ) : (
              <div className="animate-pulse space-y-3">
                <div className="h-12 bg-gray-100 rounded-full w-12" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-50 rounded w-1/2" />
              </div>
            )}
          </div>

          {/* Activity Calendar */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">{new Date(year, month - 1).toLocaleString("default", { month: "long" })} {year} — Activity Calendar</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 font-semibold mb-2">
              {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const firstDay = new Date(year, month - 1, 1).getDay();
                const daysInMonth = new Date(year, month, 0).getDate();
                const todayDate = new Date().getDate();
                const todayMonth = new Date().getMonth() + 1;
                const todayYear = new Date().getFullYear();
                const cells = [];
                for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} />);
                for (let d = 1; d <= daysInMonth; d++) {
                  const isToday = d === todayDate && month === todayMonth && year === todayYear;
                  cells.push(
                    <div key={d} className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-[11px] font-medium ${isToday ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                      {d}
                    </div>
                  );
                }
                return cells;
              })()}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[9px] text-gray-400 font-medium">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600" /> Selected</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Visited</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" /> In Progress</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Not Visited</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200 overflow-x-auto scrollbar-sfe">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={"flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap " + (
                  activeTab === t.id ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"
                )}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "mcr"  && <MCRSection month={month} year={year} mrInfo={mrInfo} onPrint={() => setShowMCRPrint(true)} />}
        {activeTab === "mvc"  && <MVCSection month={month} year={year} />}
        {activeTab === "rcpa" && <RCPASection month={month} year={year} preSelectVisitId={urlVisitId} />}
      </main>
    </div>

    {/* MCR Print Modal */}
    {showMCRPrint && <MCRPrintTemplate mrInfo={mrInfo} month={month} year={year} data={mcrData} onClose={() => setShowMCRPrint(false)} />}
    </div>
  );
}

// ── Shared UI Components ──────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = "from-indigo-600 to-purple-600" }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className={"w-10 h-10 bg-gradient-to-br " + color + " rounded-xl flex items-center justify-center mb-3 shadow-sm"}>
        <span className="text-base text-white">{icon}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = "bg-indigo-500" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <div className={color + " h-2.5 rounded-full transition-all duration-700"} style={{ width: pct + "%" }} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-white rounded-xl animate-pulse border border-gray-100" />)}
      </div>
      <div className="h-48 bg-white rounded-xl animate-pulse border border-gray-100" />
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
      <p className="text-sm text-red-600 font-medium">⚠️ {message}</p>
    </div>
  );
}

// ── MCR Section ───────────────────────────────────────────────────────────────
function MCRSection({ month, year, mrInfo, onPrint }) {
  const [filterTab, setFilterTab] = useState("all");
  const { data, isLoading, error } = useQuery({
    queryKey: ["sfe-mcr", month, year],
    queryFn: () => get("/api/v1/sfe/mcr", { month, year }),
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorBox message={error.message} />;

  const s = data || {};
  const pct = s.mcr_percentage || 0;
  const pctColor = pct >= 90 ? "text-emerald-600" : pct >= 75 ? "text-indigo-600" : "text-red-600";
  const pctBg = pct >= 90 ? "bg-emerald-500" : pct >= 75 ? "bg-orange-400" : "bg-red-500";
  const pctLabel = pct >= 90 ? "Excellent" : pct >= 75 ? "Good" : pct >= 60 ? "Needs Improvement" : "Critical";

  const visited = s.visited || [];
  const notVisited = s.not_visited || [];
  
  const displayed = filterTab === "all" ? [...visited, ...notVisited] : 
                    filterTab === "visited" ? visited : 
                    notVisited;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* Left: Doctor Details */}
      <div className="lg:col-span-2 space-y-4">
        {/* Filter Tabs + Print */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
            {[
              { id: "all", label: `📋 All (${visited.length + notVisited.length})` },
              { id: "visited", label: `✅ Visited (${visited.length})` },
              { id: "not-visited", label: `❌ Not Visited (${notVisited.length})` },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setFilterTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
                  filterTab === tab.id 
                    ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}>
                {tab.label}
            </button>
          ))}
          </div>
          <button onClick={onPrint} className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all">
            📄 Download MCR
          </button>
        </div>

        {/* Doctor cards */}
        {displayed.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <span className="text-4xl block mb-3">{filterTab === "visited" ? "✅" : "❌"}</span>
            <p className="text-gray-500 font-medium text-sm">
              {filterTab === "visited" ? "No visited doctors" : filterTab === "not-visited" ? "No unvisited doctors" : "No doctors"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayed.map((d, i) => (
              filterTab === "not-visited" ? (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-sm font-bold border border-red-100 flex-shrink-0">
                    {d.doctor_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{d.doctor_name}</p>
                    <p className="text-[11px] text-gray-400">Last visited: {d.last_visited ? formatISTDate(d.last_visited) : "Never"}</p>
                  </div>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border flex-shrink-0 ${d.classification === "A" ? "bg-red-50 text-red-600 border-red-200" : d.classification === "B" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>{d.classification}</span>
                </div>
              ) : (
                <DoctorVisitCard key={i} doctor={d} />
              )
            ))}
          </div>
        )}
      </div>

      {/* Right: Stats Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20 space-y-5">
          {/* Circular Progress */}
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 mb-3">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={pct >= 90 ? "#10b981" : pct >= 75 ? "#f97316" : "#ef4444"} strokeWidth="3.5" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${pctColor}`}>{pct.toFixed(1)}%</span>
                <span className="text-[9px] text-gray-400 font-medium">MCR</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${pct >= 90 ? "bg-emerald-50 text-emerald-700" : pct >= 75 ? "bg-indigo-50 text-indigo-700" : "bg-red-50 text-red-700"}`}>{pctLabel}</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-lg font-extrabold text-gray-900">{s.total_assigned || 0}</p>
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Assigned</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-lg font-extrabold text-emerald-600">{s.doctors_visited || 0}</p>
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Visited</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-lg font-extrabold text-red-500">{s.doctors_not_visited || 0}</p>
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Missed</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-lg font-extrabold text-gray-900">{pct.toFixed(0)}%</p>
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Coverage</p>
            </div>
          </div>

          {/* Linear progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-gray-500 font-medium">Coverage Progress</span>
              <span className={`text-[10px] font-bold ${pctColor}`}>{s.doctors_visited || 0}/{s.total_assigned || 0}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${pctBg}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Doctor Visit Card (expandable with full visit details) ────────────────────
function DoctorVisitCard({ doctor }) {
  const [expanded, setExpanded] = useState(false);
  const [activeVisit, setActiveVisit] = useState(0);
  const d = doctor;
  const visits = d.visits || [];

  const MOOD_STYLES = {
    positive: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "😊" },
    neutral:  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "😐" },
    negative: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "😞" },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
      {/* Doctor Header */}
      <button onClick={() => setExpanded(!expanded)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-sm font-bold border border-indigo-100 flex-shrink-0">
            {d.doctor_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">{d.doctor_name}</p>
            <p className="text-[11px] text-gray-400">{d.visits_count} visit{d.visits_count > 1 ? "s" : ""} · Last: {d.last_visit_date ? formatISTDate(d.last_visit_date) : "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border flex-shrink-0 ${d.classification === "A" ? "bg-red-50 text-red-600 border-red-200" : d.classification === "B" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>{d.classification}</span>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 ${expanded ? "bg-indigo-100 rotate-180" : "bg-gray-100"}`}>
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </button>

      {/* Expanded: Visit Tabs + Content */}
      {expanded && visits.length > 0 && (
        <div className="border-t border-gray-100">
          {/* Visit Tabs */}
          <div className="px-5 pt-3 flex gap-1.5 overflow-x-auto scrollbar-sfe">
            {visits.map((v, vi) => (
              <button key={vi} onClick={() => setActiveVisit(vi)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${activeVisit === vi ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                Visit {vi + 1}
              </button>
            ))}
          </div>

          {/* Active Visit Content */}
          <div key={activeVisit} className="animate-[fadeSlide_0.3s_ease-out]">
            {(() => {
            const v = visits[activeVisit];
            if (!v) return null;
            const mood = MOOD_STYLES[v.doctor_mood] || MOOD_STYLES.neutral;
            return (
              <div className="p-5">
                {/* Visit meta */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium">{v.scheduled_date ? formatISTDate(v.scheduled_date) : (v.completed_at ? formatISTDate(v.completed_at) : "")}</span>
                    {v.completed_at && <><span className="text-gray-300">·</span><span>{formatISTTime(v.completed_at)}</span></>}
                    {v.duration_minutes > 0 && <><span className="text-gray-300">·</span><span>{v.duration_minutes} min</span></>}
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${mood.bg} ${mood.text} ${mood.border}`}>
                    {mood.icon} {v.doctor_mood}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                  {v.purpose && (
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Purpose</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">{v.purpose}</p>
                    </div>
                  )}
                  {formatLoc(v.location) && (
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Location</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">{formatLoc(v.location)}</p>
                    </div>
                  )}
                  {v.samples_given != null && (
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Samples</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">{v.samples_given}</p>
                    </div>
                  )}

                  {v.follow_up_date && (
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Follow-up</p>
                      <p className="text-xs font-bold text-purple-700 mt-0.5">{formatISTDate(v.follow_up_date)}</p>
                    </div>
                  )}
                  {v.competitor_info && (
                    <div className="bg-red-50 rounded-xl px-3 py-2.5 border border-red-100">
                      <p className="text-[9px] text-red-400 font-medium uppercase tracking-wider">Competitor</p>
                      <p className="text-xs font-bold text-red-700 mt-0.5">{v.competitor_info}</p>
                    </div>
                  )}
                </div>

                {/* Products */}
                {(v.products_discussed || []).length > 0 && (
                  <div className="mb-3">
                    <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider mb-1.5">Products Discussed</p>
                    <div className="flex flex-wrap gap-1.5">
                      {v.products_discussed.map((p, pi) => (
                        <span key={pi} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-100">{typeof p === "string" ? p : p.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Outcome + Feedback + Notes */}
                <div className="space-y-2.5">
                  {v.outcome && (
                    <div className="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
                      <p className="text-[9px] text-emerald-600 font-medium uppercase tracking-wider mb-0.5">Outcome</p>
                      <p className="text-xs text-emerald-800 font-medium">{v.outcome}</p>
                    </div>
                  )}
                  {v.feedback && (
                    <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                      <p className="text-[9px] text-blue-600 font-medium uppercase tracking-wider mb-0.5">Doctor Feedback</p>
                      <p className="text-xs text-blue-800 font-medium">{v.feedback}</p>
                    </div>
                  )}
                  {v.notes && (
                    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Notes</p>
                      <p className="text-xs text-gray-600">{v.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          </div>
        </div>
      )}

      {expanded && visits.length === 0 && (
        <div className="border-t border-gray-100 p-5">
          <p className="text-xs text-gray-400 text-center">No visit data available.</p>
        </div>
      )}
    </div>
  );
}

// ── MVC Section ───────────────────────────────────────────────────────────────
function MVCSection({ month, year }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sfe-mvc", month, year],
    queryFn: () => get("/api/v1/sfe/mvc", { month, year }),
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorBox message={error.message} />;

  const s = data || {};
  const pct = s.mvc_percentage || 0;
  const pctColor = pct >= 85 ? "text-emerald-600" : pct >= 70 ? "text-indigo-600" : "text-red-600";
  const pctBg = pct >= 85 ? "bg-emerald-500" : pct >= 70 ? "bg-orange-400" : "bg-red-500";
  const pctLabel = pct >= 85 ? "Excellent" : pct >= 70 ? "Good" : pct >= 55 ? "Needs Improvement" : "Critical";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* Left: Doctor Table */}
      <div className="lg:col-span-2">
        {(s.doctors || []).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-900">Doctor Visit Coverage</p>
              <span className="text-[10px] text-gray-400">{(s.doctors || []).length} doctors</span>
            </div>
            <div className="overflow-x-auto scrollbar-sfe">
              <table className="w-full text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Doctor</th>
                    <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Class</th>
                    <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Req</th>
                    <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Done</th>
                    <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {s.doctors.map((d, i) => {
                    const statusStyles = {
                      covered: "bg-emerald-50 text-emerald-700 border-emerald-100",
                      under:   "bg-indigo-50 text-indigo-700 border-indigo-100",
                      missed:  "bg-red-50 text-red-600 border-red-100",
                    };
                    return (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${d.status === "covered" ? "bg-emerald-100 text-emerald-600" : d.status === "missed" ? "bg-red-100 text-red-500" : "bg-indigo-100 text-indigo-600"}`}>{d.doctor_name?.charAt(0)}</div>
                            <span className="font-semibold text-gray-800">{d.doctor_name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={"px-1.5 py-0.5 rounded-full font-bold text-[9px] border " + (d.classification === "A" ? "bg-red-50 text-red-600 border-red-100" : d.classification === "B" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-gray-50 text-gray-500 border-gray-200")}>{d.classification}</span>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-500 font-medium">{d.required_visits}</td>
                        <td className="px-3 py-3 text-center font-bold text-gray-900">{d.actual_visits}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={"px-2 py-0.5 rounded-full font-bold text-[10px] border " + (statusStyles[d.status] || "bg-gray-50 text-gray-600 border-gray-200")}>{d.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Right: Stats Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20 space-y-5">
          {/* Circular Progress */}
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 mb-3">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={pct >= 85 ? "#10b981" : pct >= 70 ? "#f97316" : "#ef4444"} strokeWidth="3.5" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${pctColor}`}>{pct.toFixed(1)}%</span>
                <span className="text-[9px] text-gray-400 font-medium">MVC</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${pct >= 85 ? "bg-emerald-50 text-emerald-700" : pct >= 70 ? "bg-indigo-50 text-indigo-700" : "bg-red-50 text-red-700"}`}>{pctLabel}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
              <p className="text-base font-extrabold text-emerald-700">{s.fully_covered || 0}</p>
              <p className="text-[8px] text-emerald-600 font-medium uppercase">Covered</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-2.5 text-center border border-indigo-100">
              <p className="text-base font-extrabold text-indigo-700">{s.under_covered || 0}</p>
              <p className="text-[8px] text-indigo-600 font-medium uppercase">Under</p>
            </div>
            <div className="bg-red-50 rounded-xl p-2.5 text-center border border-red-100">
              <p className="text-base font-extrabold text-red-600">{s.not_visited || 0}</p>
              <p className="text-[8px] text-red-500 font-medium uppercase">Missed</p>
            </div>
          </div>

          {/* Avg compliance */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-gray-500 font-medium">Avg Compliance</span>
              <span className="text-[10px] font-bold text-gray-700">{(s.avg_compliance || 0).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${pctBg}`} style={{ width: `${s.avg_compliance || 0}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RCPA Section ──────────────────────────────────────────────────────────────
function RCPASection({ month, year, preSelectVisitId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ visit_id: "", drug_id: "", committed_quantity: "", rx_per_month: "", requested_discount: "", boxes: "", extra_strips: "" });

  // Auto-open form when preSelectVisitId arrives
  useEffect(() => {
    if (preSelectVisitId) {
      setShowForm(true);
      setForm((f) => ({ ...f, visit_id: preSelectVisitId }));
    }
  }, [preSelectVisitId]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Fetch eligible visits (completed visits the MR can log RCPA against)
  const { data: visitsData } = useQuery({
    queryKey: ["rcpa-eligible-visits"],
    queryFn: () => get("/api/v1/sfe/rcpa/eligible-visits"),
    staleTime: 2 * 60 * 1000,
  });
  const eligibleVisits = visitsData?.visits || [];

  // Fetch MR's assigned drugs with packaging
  const mrId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const { data: mrData } = useQuery({
    queryKey: ["mr-profile-rcpa", mrId],
    queryFn: () => get(`/api/v1/mrs/${mrId}`),
    enabled: !!mrId,
    staleTime: 5 * 60 * 1000,
  });
  const assignedDrugIds = (mrData?.assigned_drugs || []).map((d) => d.id || d._id);

  // Fetch full drug details (with packaging) for assigned drugs only
  const { data: drugsData } = useQuery({
    queryKey: ["drugs-with-packaging"],
    queryFn: () => get("/api/v1/drugs?limit=500").then((d) => (d.drugs || []).filter((dr) => assignedDrugIds.includes(dr._id || dr.id))),
    enabled: assignedDrugIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
  const allDrugs = drugsData || [];

  // Fetch existing commitments
  const { data, isLoading, error } = useQuery({
    queryKey: ["sfe-rcpa", month, year],
    queryFn: () => get("/api/v1/sfe/rcpa", { month, year }),
  });

  // Get drug packaging info for live preview
  const selectedDrug = allDrugs.find((d) => (d._id || d.id) === form.drug_id);
  const packaging = selectedDrug?.packaging || null;
  const sellingPrice = packaging?.selling_price ?? packaging?.pricing?.selling_price ?? 0;
  const salesUnit = packaging?.sales_unit || "unit";
  const packQty = packaging?.pack_quantity || 0;
  const measureUnit = packaging?.measurement_unit || "";
  const maxDiscount = packaging?.max_discount_percent ?? packaging?.pricing?.max_discount_percent ?? 0;
  const committedQty = parseInt(form.committed_quantity) || 0;
  const discountPct = parseFloat(form.requested_discount) || 0;
  const grossRevenue = committedQty * sellingPrice;
  const netRevenue = grossRevenue * (1 - discountPct / 100);

  const createMutation = useMutation({
    mutationFn: (body) => post("/api/v1/sfe/rcpa", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sfe-rcpa"] });
      setShowForm(false);
      setForm({ visit_id: "", drug_id: "", committed_quantity: "", rx_per_month: "", requested_discount: "", boxes: "", extra_strips: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => put(`/api/v1/sfe/rcpa/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sfe-rcpa"] });
      setEditingId(null);
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.visit_id || !form.drug_id || !form.committed_quantity || !form.rx_per_month) return;
    const body = {
      visit_id: form.visit_id,
      drug_id: form.drug_id,
      committed_quantity: parseInt(form.committed_quantity),
      rx_per_month: parseInt(form.rx_per_month),
    };
    if (form.requested_discount) body.requested_discount = parseFloat(form.requested_discount);
    createMutation.mutate(body);
  };

  const handleUpdate = (id) => {
    const body = {};
    if (editForm.drug_id) body.drug_id = editForm.drug_id;
    if (editForm.rx_per_month) body.rx_per_month = parseInt(editForm.rx_per_month);
    if (editForm.committed_quantity) body.committed_quantity = parseInt(editForm.committed_quantity);
    if (editForm.requested_discount !== undefined && editForm.requested_discount !== "") body.requested_discount = parseFloat(editForm.requested_discount);
    updateMutation.mutate({ id, body });
  };

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorBox message={error.message} />;

  const commitments = data?.commitments || [];
  const total = data?.total || 0;

  const APPROVAL_STYLES = {
    PENDING:  "bg-amber-100 text-amber-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const inp = "w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-200";

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="💊" label="Total Commitments" value={total} color="from-indigo-600 to-purple-600" />
        <StatCard icon="⏳" label="Pending Approval" value={commitments.filter((c) => c.approval_status === "PENDING").length} color="from-amber-500 to-orange-500" />
        <StatCard icon="✅" label="Approved" value={commitments.filter((c) => c.approval_status === "APPROVED").length} color="from-green-500 to-emerald-500" />
        <StatCard icon="📈" label="Total Rx/Month" value={commitments.reduce((a, c) => a + (c.rx_per_month || 0), 0)} color="from-blue-500 to-cyan-500" />
      </div>

      {/* New Commitment Button */}
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
          {showForm ? "✕ Cancel" : "+ New Commitment"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
          <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
            <p className="text-sm font-bold text-indigo-800">📋 Log RCPA Commitment</p>
            <p className="text-[11px] text-indigo-500 mt-0.5">Select a completed visit, then the drug the doctor committed to prescribe</p>
          </div>
          <div className="p-5 space-y-4">
            {createMutation.error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
                {createMutation.error.message || "Failed to save commitment"}
              </div>
            )}

            {/* Step 1: Visit */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block">Visit <span className="text-red-500">*</span></label>
              <select value={form.visit_id} onChange={(e) => setForm({ ...form, visit_id: e.target.value })} required className={inp + " bg-white"}>
                <option value="">Select completed visit</option>
                {eligibleVisits.map((v) => (
                  <option key={v.visit_id} value={v.visit_id}>
                    {v.visit_title || `${v.doctor_name} · ${v.visit_date}`}
                  </option>
                ))}
              </select>
              {eligibleVisits.length === 0 && (
                <p className="text-[10px] text-gray-400 mt-0.5">No eligible visits found. Complete a visit first.</p>
              )}
            </div>

            {/* Step 2: Drug */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block">Drug <span className="text-red-500">*</span></label>
              <select value={form.drug_id} onChange={(e) => setForm({ ...form, drug_id: e.target.value, committed_quantity: "", requested_discount: "", boxes: "", extra_strips: "" })} required className={inp + " bg-white"}>
                <option value="">Select drug</option>
                {allDrugs.filter((d) => (d.packaging?.selling_price ?? d.packaging?.pricing?.selling_price)).map((d) => {
                  const sp = d.packaging.selling_price ?? d.packaging.pricing?.selling_price;
                  return (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.drug_name || d.brand_name || d.name} — ₹{sp}/{d.packaging.sales_unit}
                  </option>
                  );
                })}
              </select>
              {selectedDrug && packaging && (
                <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="text-center">
                    <p className="text-[9px] text-indigo-500 font-bold uppercase">Sales Unit</p>
                    <p className="text-xs font-bold text-gray-800">{salesUnit}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-indigo-500 font-bold uppercase">Pack Size</p>
                    <p className="text-xs font-bold text-gray-800">{packQty} {measureUnit}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-indigo-500 font-bold uppercase">Selling Price</p>
                    <p className="text-xs font-bold text-emerald-700">₹{sellingPrice}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-indigo-500 font-bold uppercase">Max Discount</p>
                    <p className="text-xs font-bold text-amber-700">{maxDiscount}%</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Quantity (Boxes + Strips) + Rx/Month */}
            <div className="space-y-3">
              {packaging?.sales_units_per_box > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[10px] text-gray-500 font-medium">
                  📦 1 Box = {packaging.sales_units_per_box} {salesUnit}s
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                {packaging?.sales_units_per_box > 0 && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Boxes</label>
                    <input type="number" min="0" value={form.boxes || ""}
                      onChange={(e) => {
                        const boxes = parseInt(e.target.value) || 0;
                        const strips = parseInt(form.extra_strips) || 0;
                        const total = boxes * (packaging.sales_units_per_box || 0) + strips;
                        setForm({ ...form, boxes: e.target.value, committed_quantity: String(total) });
                      }}
                      className={inp} placeholder="0" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">
                    {packaging?.sales_units_per_box > 0 ? `Extra ${salesUnit}s` : `${salesUnit}s`} <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={packaging?.sales_units_per_box > 0 ? "0" : "1"}
                    value={packaging?.sales_units_per_box > 0 ? (form.extra_strips || "") : form.committed_quantity}
                    onChange={(e) => {
                      if (packaging?.sales_units_per_box > 0) {
                        const strips = parseInt(e.target.value) || 0;
                        const boxes = parseInt(form.boxes) || 0;
                        const total = boxes * (packaging.sales_units_per_box || 0) + strips;
                        setForm({ ...form, extra_strips: e.target.value, committed_quantity: String(total) });
                      } else {
                        setForm({ ...form, committed_quantity: e.target.value });
                      }
                    }}
                    required={!(packaging?.sales_units_per_box > 0 && parseInt(form.boxes) > 0)}
                    className={inp} placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Rx/Month <span className="text-red-500">*</span></label>
                  <input type="number" min="1" value={form.rx_per_month}
                    onChange={(e) => setForm({ ...form, rx_per_month: e.target.value })}
                    required className={inp} placeholder="15" />
                </div>
              </div>
              {committedQty > 0 && (
                <p className="text-[10px] text-indigo-600 font-semibold">
                  Total: {committedQty} {salesUnit}s
                  {packaging?.sales_units_per_box > 0 && parseInt(form.boxes) > 0 && ` (${form.boxes} box${parseInt(form.boxes) > 1 ? "es" : ""}${parseInt(form.extra_strips) > 0 ? ` + ${form.extra_strips} ${salesUnit}s` : ""})`}
                </p>
              )}
            </div>

            {/* Step 4: Discount */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block">
                Requested Discount %
                {maxDiscount > 0 && <span className="ml-1 text-gray-400 font-normal">(max {maxDiscount}%)</span>}
              </label>
              <input type="number" min="0" max={maxDiscount || 100} step="0.5"
                value={form.requested_discount}
                onChange={(e) => setForm({ ...form, requested_discount: e.target.value })}
                className={inp} placeholder="0 = auto approved" />
              {discountPct > maxDiscount && maxDiscount > 0 && (
                <p className="text-[10px] text-red-500 mt-0.5">⚠️ Exceeds maximum allowed discount of {maxDiscount}%</p>
              )}
            </div>

            {/* Live Revenue Preview */}
            {grossRevenue > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3.5">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-2">💰 Revenue Preview</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded-lg p-2 border border-emerald-100">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Qty × Price</p>
                    <p className="text-sm font-extrabold text-gray-800">{committedQty} × ₹{sellingPrice}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-emerald-100">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Gross</p>
                    <p className="text-sm font-extrabold text-emerald-700">₹{grossRevenue.toLocaleString()}</p>
                  </div>
                  <div className={`rounded-lg p-2 border ${discountPct > 0 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"}`}>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Net{discountPct > 0 ? ` (-${discountPct}%)` : ""}</p>
                    <p className={`text-sm font-extrabold ${discountPct > 0 ? "text-amber-700" : "text-emerald-700"}`}>₹{netRevenue.toLocaleString()}</p>
                  </div>
                </div>
                {discountPct > 0 && (
                  <p className="text-[10px] text-amber-600 text-center mt-1.5 font-medium">
                    ⏳ Will require admin approval
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">Cancel</button>
              <button type="submit" disabled={createMutation.isPending || (discountPct > maxDiscount && maxDiscount > 0)}
                className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                {createMutation.isPending ? "Saving..." : "Save Commitment"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Commitments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-800">Your Commitments</p>
        </div>
        {commitments.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-3xl block mb-2">💊</span>
            <p className="text-xs text-gray-400">No RCPA commitments for this period.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {commitments.map((c) => (
              <div key={c.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                {editingId === c.id ? (
                  <div className="space-y-3 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                    {/* Context header */}
                    <div className="flex items-center gap-3 pb-2 border-b border-indigo-100">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.doctor_name?.charAt(0) || "D"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{c.doctor_name}</p>
                        <p className="text-[10px] text-gray-400 truncate">🏥 {c.visit_title || "Visit"}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${c.approval_status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : c.approval_status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {c.approval_status}
                      </span>
                    </div>

                    {/* Drug selector */}
                    <div>
                      <label className="text-xs text-gray-600 font-medium block mb-1">Drug</label>
                      <select value={editForm.drug_id || ""} onChange={(e) => setEditForm({ ...editForm, drug_id: e.target.value })}
                        className={inp + " bg-white"}>
                        <option value="">Keep current: {c.drug_name}</option>
                        {allDrugs.filter((d) => (d.packaging?.selling_price ?? d.packaging?.pricing?.selling_price) && (d._id || d.id) !== c.drug_id).map((d) => {
                          const sp = d.packaging.selling_price ?? d.packaging.pricing?.selling_price;
                          return (
                          <option key={d._id || d.id} value={d._id || d.id}>
                            {d.drug_name || d.brand_name} — ₹{sp}/{d.packaging.sales_unit}
                          </option>
                          );
                        })}
                      </select>
                      {editForm.drug_id && (() => {
                        const newDrug = allDrugs.find((d) => (d._id || d.id) === editForm.drug_id);
                        if (!newDrug?.packaging) return null;
                        const sp = newDrug.packaging.selling_price ?? newDrug.packaging.pricing?.selling_price;
                        const md = newDrug.packaging.max_discount_percent ?? newDrug.packaging.pricing?.max_discount_percent;
                        return (
                          <p className="text-[9px] text-indigo-600 mt-0.5">→ ₹{sp}/{newDrug.packaging.sales_unit} · Max disc: {md}%</p>
                        );
                      })()}
                    </div>

                    {/* Qty with boxes+strips helper */}
                    {(() => {
                      const editDrugObj = editForm.drug_id ? allDrugs.find((d) => (d._id || d.id) === editForm.drug_id) : allDrugs.find((d) => (d._id || d.id) === c.drug_id);
                      const editPkg = editDrugObj?.packaging;
                      const editSalesUnit = editPkg?.sales_unit || c.quantity_unit || "unit";
                      const editUnitsPerBox = editPkg?.sales_units_per_box || 0;
                      return (
                        <div className="space-y-2">
                          {editUnitsPerBox > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[10px] text-gray-500 font-medium">
                              📦 1 Box = {editUnitsPerBox} {editSalesUnit}s
                            </div>
                          )}
                          <div className="grid grid-cols-4 gap-2">
                            {editUnitsPerBox > 0 && (
                              <div>
                                <label className="text-xs text-gray-600 font-medium block mb-1">Boxes</label>
                                <input type="number" min="0" value={editForm.edit_boxes || ""}
                                  onChange={(e) => {
                                    const boxes = parseInt(e.target.value) || 0;
                                    const extra = parseInt(editForm.edit_extra) || 0;
                                    const total = boxes * editUnitsPerBox + extra;
                                    setEditForm({ ...editForm, edit_boxes: e.target.value, committed_quantity: String(total) });
                                  }}
                                  className={inp} placeholder="0" />
                              </div>
                            )}
                            <div>
                              <label className="text-xs text-gray-600 font-medium block mb-1">{editUnitsPerBox > 0 ? `+ ${editSalesUnit}s` : `Qty (${editSalesUnit}s)`}</label>
                              <input type="number" min="0"
                                value={editUnitsPerBox > 0 ? (editForm.edit_extra || "") : (editForm.committed_quantity || "")}
                                onChange={(e) => {
                                  if (editUnitsPerBox > 0) {
                                    const extra = parseInt(e.target.value) || 0;
                                    const boxes = parseInt(editForm.edit_boxes) || 0;
                                    const total = boxes * editUnitsPerBox + extra;
                                    setEditForm({ ...editForm, edit_extra: e.target.value, committed_quantity: String(total) });
                                  } else {
                                    setEditForm({ ...editForm, committed_quantity: e.target.value });
                                  }
                                }}
                                className={inp} placeholder="0" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 font-medium block mb-1">Rx/Mo</label>
                              <input type="number" min="1" value={editForm.rx_per_month || ""} onChange={(e) => setEditForm({ ...editForm, rx_per_month: e.target.value })}
                                className={inp} placeholder={String(c.rx_per_month)} />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 font-medium block mb-1">Disc %</label>
                              <input type="number" min="0" max="100" step="0.5" value={editForm.requested_discount ?? ""} onChange={(e) => setEditForm({ ...editForm, requested_discount: e.target.value })}
                                className={inp} placeholder={c.requested_discount ? String(c.requested_discount) : "0"} />
                            </div>
                          </div>
                          {(parseInt(editForm.committed_quantity) || 0) > 0 && (
                            <p className="text-[10px] text-indigo-600 font-semibold">
                              Total: {editForm.committed_quantity} {editSalesUnit}s
                              {editUnitsPerBox > 0 && parseInt(editForm.edit_boxes) > 0 && ` (${editForm.edit_boxes} box${parseInt(editForm.edit_boxes) > 1 ? "es" : ""}${parseInt(editForm.edit_extra) > 0 ? ` + ${editForm.edit_extra}` : ""})`}
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Revenue preview */}
                    {(() => {
                      const editDrug = editForm.drug_id ? allDrugs.find((d) => (d._id || d.id) === editForm.drug_id) : null;
                      const price = editDrug?.packaging?.selling_price || c.selling_price || 0;
                      const qty = parseInt(editForm.committed_quantity) || c.committed_quantity || 0;
                      const disc = parseFloat(editForm.requested_discount) ?? c.requested_discount ?? 0;
                      const gross = qty * price;
                      const net = gross * (1 - disc / 100);
                      return gross > 0 ? (
                        <div className="flex items-center gap-4 text-[10px] bg-white rounded-lg px-3 py-2 border border-gray-100">
                          <span className="text-gray-400">Gross: <span className="font-bold text-gray-700">₹{gross.toLocaleString()}</span></span>
                          {disc > 0 && <span className="text-amber-600">-{disc}% → <span className="font-bold">₹{net.toLocaleString()}</span></span>}
                          {disc > 0 && <span className="text-amber-500 text-[9px]">⏳ Will reset to PENDING</span>}
                        </div>
                      ) : null;
                    })()}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                      <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 border border-gray-200">Cancel</button>
                      <button onClick={() => handleUpdate(c.id)} disabled={updateMutation.isPending}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                        {updateMutation.isPending ? "Updating..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                        {c.doctor_name?.charAt(0) || "D"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{c.doctor_name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          <span className="font-semibold text-indigo-600">{c.drug_name}</span>
                          {" · "}{c.committed_quantity} {c.quantity_unit || "units"}
                          {" · "}{c.rx_per_month} Rx/mo
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400 flex-wrap">
                          {c.visit_title && <span>🏥 {c.visit_title}</span>}
                          {c.selling_price && <span>₹{c.selling_price}/{c.quantity_unit}</span>}
                          {c.committed_revenue && <span>💰 ₹{c.committed_revenue?.toLocaleString()}</span>}
                          {c.approval_status === "APPROVED" && c.net_revenue != null && (
                            <span className="text-emerald-600 font-semibold">Net ₹{c.net_revenue?.toLocaleString()}</span>
                          )}
                          {c.requested_discount > 0 && (
                            <span>{c.requested_discount}% disc {c.approval_status === "APPROVED" ? `→ ${c.approved_discount}% approved` : "req"}</span>
                          )}
                        </div>
                        {c.doctor_location && (
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">📍 {c.doctor_location.name}{c.doctor_location.area ? ` · ${c.doctor_location.area}` : ""}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${APPROVAL_STYLES[c.approval_status] || "bg-gray-100 text-gray-600"}`}>
                        {c.approval_status || "—"}
                      </span>
                      {c.approval_status !== "APPROVED" && (
                      <button onClick={() => { setEditingId(c.id); setEditForm({ rx_per_month: c.rx_per_month, committed_quantity: c.committed_quantity, drug_id: "", requested_discount: "" }); }}
                        className="text-[11px] text-indigo-500 hover:text-indigo-600 font-semibold px-2 py-0.5 rounded hover:bg-indigo-50">
                        Edit
                      </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
