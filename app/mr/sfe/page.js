"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, post, put } from "@/lib/api";
import { formatISTDate, formatISTTime } from "@/lib/time";

const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1;
const CURRENT_YEAR = now.getFullYear();

const TABS = [
  { id: "mcr",  label: "MCR (Monthly Call Report)", icon: "📞" },
  { id: "mvc",  label: "MVC (Visit Coverage)",      icon: "🔄" },
  { id: "rcpa", label: "RCPA (Commitments)",        icon: "💊" },
];

export default function SFEPage() {
  const [activeTab, setActiveTab] = useState("mcr");
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear] = useState(CURRENT_YEAR);

  // Fetch MR's own profile info
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const { data: mrList } = useQuery({
    queryKey: ["my-mr-info"],
    queryFn: () => get("/api/v1/mrs").then((r) => r.mrs || []),
    staleTime: 10 * 60 * 1000,
  });
  const mrInfo = (mrList || []).find((m) => m.id === userId) || null;

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <MRNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumb />
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-0.5">SFE Analytics</h1>
          <p className="text-sm text-gray-400">Track your performance, coverage & commitments</p>
        </div>

        {/* MR Profile Card */}
        {mrInfo && (
          <div className="mb-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold">
                  {mrInfo.name?.charAt(0) || "M"}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{mrInfo.name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                    {mrInfo.territory} · {mrInfo.zone} · {mrInfo.state}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-100 font-medium">{mrInfo.email}</span>
                {mrInfo.phone && <span className="text-[11px] bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-100 font-medium">{mrInfo.phone}</span>}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                <span>🩺</span>
                {(mrInfo.assigned_doctors || []).map((d) => (
                  <span key={d.id} className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-100">{d.name}</span>
                ))}
                {(mrInfo.assigned_doctors || []).length === 0 && <span className="text-gray-400">No doctors</span>}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                <span>💊</span>
                {(mrInfo.assigned_drugs || []).map((d) => (
                  <span key={d.id} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">{d.name}</span>
                ))}
                {(mrInfo.assigned_drugs || []).length === 0 && <span className="text-gray-400">No drugs</span>}
              </div>
            </div>
          </div>
        )}

        {/* Controls Row: Month/Year + Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={"flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap " + (
                  activeTab === t.id ? "bg-orange-500 text-white shadow" : "text-gray-500 hover:bg-gray-50"
                )}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select value={month} onChange={(e) => setMonth(+e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium text-gray-700 focus:ring-2 focus:ring-orange-200 outline-none">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(2026, i).toLocaleString("default", { month: "long" })}</option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(+e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium text-gray-700 focus:ring-2 focus:ring-orange-200 outline-none">
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {activeTab === "mcr"  && <MCRSection month={month} year={year} />}
        {activeTab === "mvc"  && <MVCSection month={month} year={year} />}
        {activeTab === "rcpa" && <RCPASection month={month} year={year} assignedDrugs={mrInfo?.assigned_drugs || []} assignedDoctors={mrInfo?.assigned_doctors || []} />}
      </main>
    </div>
  );
}

// ── Shared UI Components ──────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = "from-orange-500 to-red-500" }) {
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

function ProgressBar({ value, max = 100, color = "bg-orange-500" }) {
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
function MCRSection({ month, year }) {
  const [filterTab, setFilterTab] = useState("all");
  const { data, isLoading, error } = useQuery({
    queryKey: ["sfe-mcr", month, year],
    queryFn: () => get("/api/v1/sfe/mcr", { month, year }),
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorBox message={error.message} />;

  const s = data || {};
  const pct = s.mcr_percentage || 0;
  const pctColor = pct >= 90 ? "text-emerald-600" : pct >= 75 ? "text-orange-600" : "text-red-600";
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
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit sticky top-20 z-10">
          {[
            { id: "all", label: `📋 All (${visited.length + notVisited.length})` },
            { id: "visited", label: `✅ Visited (${visited.length})` },
            { id: "not-visited", label: `❌ Not Visited (${notVisited.length})` },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setFilterTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
                filterTab === tab.id 
                  ? "bg-orange-500 text-white shadow" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}>
              {tab.label}
            </button>
          ))}
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
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${pct >= 90 ? "bg-emerald-50 text-emerald-700" : pct >= 75 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700"}`}>{pctLabel}</span>
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
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold border border-orange-100 flex-shrink-0">
            {d.doctor_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">{d.doctor_name}</p>
            <p className="text-[11px] text-gray-400">{d.visits_count} visit{d.visits_count > 1 ? "s" : ""} · Last: {d.last_visit_date ? formatISTDate(d.last_visit_date) : "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border flex-shrink-0 ${d.classification === "A" ? "bg-red-50 text-red-600 border-red-200" : d.classification === "B" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>{d.classification}</span>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 ${expanded ? "bg-orange-100 rotate-180" : "bg-gray-100"}`}>
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </button>

      {/* Expanded: Visit Tabs + Content */}
      {expanded && visits.length > 0 && (
        <div className="border-t border-gray-100">
          {/* Visit Tabs */}
          <div className="px-5 pt-3 flex gap-1.5 overflow-x-auto">
            {visits.map((v, vi) => (
              <button key={vi} onClick={() => setActiveVisit(vi)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${activeVisit === vi ? "bg-orange-500 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
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
                  {v.location && (
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Location</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">{v.location}</p>
                    </div>
                  )}
                  {v.samples_given != null && (
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Samples</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">{v.samples_given}</p>
                    </div>
                  )}
                  {v.rx_commitment != null && (
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Rx Commitment</p>
                      <p className={"text-xs font-bold mt-0.5 " + (v.rx_commitment ? "text-emerald-700" : "text-gray-500")}>{v.rx_commitment ? `Yes (${v.expected_rx_per_month || "—"}/month)` : "No"}</p>
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
  const pctColor = pct >= 85 ? "text-emerald-600" : pct >= 70 ? "text-orange-600" : "text-red-600";
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
            <div className="overflow-x-auto">
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
                      under:   "bg-orange-50 text-orange-700 border-orange-100",
                      missed:  "bg-red-50 text-red-600 border-red-100",
                    };
                    return (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${d.status === "covered" ? "bg-emerald-100 text-emerald-600" : d.status === "missed" ? "bg-red-100 text-red-500" : "bg-orange-100 text-orange-600"}`}>{d.doctor_name?.charAt(0)}</div>
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
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${pct >= 85 ? "bg-emerald-50 text-emerald-700" : pct >= 70 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700"}`}>{pctLabel}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
              <p className="text-base font-extrabold text-emerald-700">{s.fully_covered || 0}</p>
              <p className="text-[8px] text-emerald-600 font-medium uppercase">Covered</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-2.5 text-center border border-orange-100">
              <p className="text-base font-extrabold text-orange-700">{s.under_covered || 0}</p>
              <p className="text-[8px] text-orange-600 font-medium uppercase">Under</p>
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
function RCPASection({ month, year, assignedDrugs = [], assignedDoctors = [] }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ doctor_id: "", product_id: "", rx_per_month: "", confidence: "medium", visit_id: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["sfe-rcpa", month, year],
    queryFn: () => get("/api/v1/sfe/rcpa", { month, year }),
  });

  const createMutation = useMutation({
    mutationFn: (body) => post("/api/v1/sfe/rcpa", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sfe-rcpa"] });
      setShowForm(false);
      setForm({ doctor_id: "", product_id: "", rx_per_month: "", confidence: "medium", visit_id: "" });
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
    const body = { ...form, rx_per_month: parseInt(form.rx_per_month) };
    if (!body.visit_id) delete body.visit_id;
    createMutation.mutate(body);
  };

  const handleUpdate = (id) => {
    const body = {};
    if (editForm.rx_per_month) body.rx_per_month = parseInt(editForm.rx_per_month);
    if (editForm.confidence) body.confidence = editForm.confidence;
    if (editForm.status) body.status = editForm.status;
    updateMutation.mutate({ id, body });
  };

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorBox message={error.message} />;

  const commitments = data?.commitments || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard icon="💊" label="Total Commitments" value={total} color="from-orange-500 to-red-500" />
        <StatCard icon="📈" label="Active" value={commitments.filter((c) => c.status === "active").length} color="from-green-500 to-emerald-500" />
        <StatCard icon="✅" label="Fulfilled" value={commitments.filter((c) => c.status === "fulfilled").length} color="from-blue-500 to-cyan-500" />
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
          {showForm ? "Cancel" : "+ New Commitment"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl p-5 shadow-sm border border-orange-100 space-y-4">
          <p className="text-sm font-bold text-gray-800">Log RCPA Commitment</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Doctor *</label>
              <select value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} required
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2">
                <option value="">Select doctor</option>
                {assignedDoctors.map((d) => <option key={d.id || d._id} value={d.id || d._id}>{d.name || d.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Product *</label>
              <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2">
                <option value="">Select product</option>
                {assignedDrugs.map((p) => <option key={p.id || p._id} value={p.id || p._id}>{p.name || p.brand_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Rx/Month *</label>
              <input type="number" min="1" value={form.rx_per_month} onChange={(e) => setForm({ ...form, rx_per_month: e.target.value })} required
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2" placeholder="e.g. 15" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Confidence *</label>
              <select value={form.confidence} onChange={(e) => setForm({ ...form, confidence: e.target.value })}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={createMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
              {createMutation.isPending ? "Saving..." : "Save Commitment"}
            </button>
          </div>
          {createMutation.error && <p className="text-xs text-red-500">{createMutation.error.message}</p>}
        </form>
      )}

      {/* Commitments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-800">Your Commitments</p>
        </div>
        {commitments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No RCPA commitments for this period.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {commitments.map((c) => (
              <div key={c.id} className="p-4 hover:bg-gray-50">
                {editingId === c.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Rx/Month</label>
                        <input type="number" min="1" value={editForm.rx_per_month || ""} onChange={(e) => setEditForm({ ...editForm, rx_per_month: e.target.value })}
                          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Confidence</label>
                        <select value={editForm.confidence || ""} onChange={(e) => setEditForm({ ...editForm, confidence: e.target.value })}
                          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2">
                          <option value="">No change</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Status</label>
                        <select value={editForm.status || ""} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2">
                          <option value="">No change</option>
                          <option value="active">Active</option>
                          <option value="fulfilled">Fulfilled</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100">Cancel</button>
                      <button onClick={() => handleUpdate(c.id)} disabled={updateMutation.isPending}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50">
                        {updateMutation.isPending ? "..." : "Update"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {c.doctor_name?.charAt(0) || "D"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{c.doctor_name}</p>
                        <p className="text-xs text-gray-400">{c.product_name} · {c.rx_per_month} Rx/month · {c.confidence}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={"px-2 py-0.5 rounded-md text-xs font-bold " + (c.status === "active" ? "bg-green-100 text-green-700" : c.status === "fulfilled" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600")}>{c.status}</span>
                      <button onClick={() => { setEditingId(c.id); setEditForm({ rx_per_month: c.rx_per_month, confidence: c.confidence, status: c.status }); }}
                        className="text-xs text-orange-500 hover:text-orange-600 font-semibold px-2 py-1 rounded hover:bg-orange-50">Edit</button>
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
