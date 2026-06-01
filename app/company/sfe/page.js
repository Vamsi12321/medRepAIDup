"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, put } from "@/lib/api";
import { formatISTDate, formatISTTime } from "@/lib/time";

const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1;
const CURRENT_YEAR = now.getFullYear();

const TABS = [
  { id: "dashboard", label: "Dashboard",                      icon: "📊" },
  { id: "targets",   label: "Visit Targets",                  icon: "🎯" },
  { id: "mcr",       label: "MCR (Call Report)",              icon: "📞" },
  { id: "mvc",       label: "MVC (Visit Coverage)",           icon: "🔄" },
  { id: "rcpa",      label: "RCPA (Demand Forecast)",         icon: "💊" },
];

export default function SFEPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear] = useState(CURRENT_YEAR);

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <CompanyNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumb />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">SFE Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Company-wide sales force effectiveness</p>
        </div>

        {/* Controls Row: Tabs + Month/Year */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={"flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap " + (
                  activeTab === t.id ? "bg-purple-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"
                )}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select value={month} onChange={(e) => setMonth(+e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium text-gray-700 focus:ring-2 focus:ring-purple-200 outline-none">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(2026, i).toLocaleString("default", { month: "long" })}</option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(+e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium text-gray-700 focus:ring-2 focus:ring-purple-200 outline-none">
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {activeTab === "dashboard" && <DashboardSection month={month} year={year} />}
        {activeTab === "targets"   && <VisitTargets />}
        {activeTab === "mcr"       && <MCRSection month={month} year={year} />}
        {activeTab === "mvc"       && <MVCSection month={month} year={year} />}
        {activeTab === "rcpa"      && <RCPASection month={month} year={year} />}
      </main>
    </div>
  );
}

// ── Shared UI Components ──────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = "from-indigo-500 to-purple-500" }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className={"w-9 h-9 bg-gradient-to-br " + color + " rounded-lg flex items-center justify-center mb-3 shadow-sm"}>
        <span className="text-base">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = "bg-indigo-500" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className={color + " h-2.5 rounded-full transition-all"} style={{ width: pct + "%" }} />
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

// ── MR Profile Card (shown when admin selects an MR) ──────────────────────────
function MRProfileCard({ mr }) {
  if (!mr) return null;
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-sm font-bold">
            {mr.name?.charAt(0) || "M"}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{mr.name}</p>
            <p className="text-xs text-gray-400">{mr.territory} · {mr.zone} · {mr.state}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">📧 {mr.email}</span>
          {mr.phone && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg font-medium">📞 {mr.phone}</span>}
          <span className={"text-xs px-2 py-1 rounded-lg font-medium " + (mr.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>{mr.is_active ? "✅ Active" : "❌ Inactive"}</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1.5">🩺 Assigned Doctors ({(mr.assigned_doctors || []).length})</p>
          <div className="flex flex-wrap gap-1.5">
            {(mr.assigned_doctors || []).map((d) => (
              <span key={d.id} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">{d.name}</span>
            ))}
            {(mr.assigned_doctors || []).length === 0 && <span className="text-xs text-gray-400">None assigned</span>}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1.5">💊 Assigned Drugs ({(mr.assigned_drugs || []).length})</p>
          <div className="flex flex-wrap gap-1.5">
            {(mr.assigned_drugs || []).map((d) => (
              <span key={d.id} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-medium">{d.name}</span>
            ))}
            {(mr.assigned_drugs || []).length === 0 && <span className="text-xs text-gray-400">None assigned</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard Section (Admin Overview) ────────────────────────────────────────
function DashboardSection({ month, year }) {
  const [drillMrId, setDrillMrId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["sfe-dashboard", month, year],
    queryFn: () => get("/api/v1/sfe/dashboard", { month, year }),
  });

  const { data: drillData, isLoading: drillLoading } = useQuery({
    queryKey: ["sfe-drill", drillMrId, month, year],
    queryFn: () => get(`/api/v1/sfe/dashboard/mr/${drillMrId}`, { month, year }),
    enabled: !!drillMrId,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorBox message={error.message} />;

  const s = data || {};

  if (drillMrId && drillData) {
    return <MRDrillDown data={drillData} onBack={() => setDrillMrId(null)} loading={drillLoading} />;
  }

  return (
    <div className="space-y-6">

      {/* Top KPIs — compact row */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "MRs", value: s.total_mrs || 0, color: "text-purple-600" },
          { label: "MCR", value: (s.avg_mcr_pct || 0).toFixed(0) + "%", color: "text-emerald-600" },
          { label: "MVC", value: (s.avg_mvc_pct || 0).toFixed(0) + "%", color: "text-blue-600" },
          { label: "Doctors", value: s.total_doctors || 0, color: "text-gray-900" },
          { label: "Visits", value: s.total_visits || 0, color: "text-gray-900" },
          { label: "Rx/Wk", value: s.total_rx_per_week || 0, color: "text-orange-600" },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className={`text-xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Main layout: Left content + Right sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left column: Alerts + Territory */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alerts */}
          {(s.alerts || []).length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-red-100 rounded flex items-center justify-center text-[10px]">🚨</span>
                Alerts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {s.alerts.map((a, i) => (
                  <div key={i} className={`rounded-2xl p-4 border cursor-pointer hover:shadow-md transition-all ${a.severity === "critical" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`} onClick={() => setDrillMrId(a.mr_id)}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${a.severity === "critical" ? "bg-red-500 animate-pulse" : "bg-amber-500"}`} />
                      <p className="text-xs font-bold text-gray-900">{a.mr_name}</p>
                    </div>
                    <p className={`text-[11px] font-medium mb-1 ${a.severity === "critical" ? "text-red-700" : "text-amber-700"}`}>{a.message}</p>
                    <p className="text-[10px] text-gray-400">{a.territory}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Territory Performance */}
          {(s.by_territory || []).length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center text-[10px]">🗺️</span>
                Territory Performance
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {s.by_territory.map((t, i) => {
                  const mcr = t.avg_mcr || 0;
                  const mvc = t.avg_mvc || 0;
                  return (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <p className="text-sm font-bold text-gray-900 mb-4">{t.territory}</p>
                      <div className="flex items-center justify-center gap-6 mb-4">
                        <div className="text-center">
                          <div className="relative w-16 h-16 mx-auto">
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={mcr >= 90 ? "#10b981" : mcr >= 75 ? "#f97316" : "#ef4444"} strokeWidth="4" strokeDasharray={`${mcr}, 100`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-black text-gray-900">{mcr.toFixed(0)}%</span>
                            </div>
                          </div>
                          <p className="text-[9px] text-gray-400 font-medium mt-1 uppercase">MCR</p>
                        </div>
                        <div className="text-center">
                          <div className="relative w-16 h-16 mx-auto">
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={mvc >= 85 ? "#10b981" : mvc >= 70 ? "#f97316" : "#ef4444"} strokeWidth="4" strokeDasharray={`${mvc}, 100`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-black text-gray-900">{mvc.toFixed(0)}%</span>
                            </div>
                          </div>
                          <p className="text-[9px] text-gray-400 font-medium mt-1 uppercase">MVC</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-3 border-t border-gray-100">
                        <span>{t.mrs_count} MRs · {t.total_doctors} doctors</span>
                        <span className="font-bold text-purple-600">{t.rx_per_week} Rx/wk</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar: Top Performers + Needs Attention */}
        <div className="lg:col-span-1 space-y-5 lg:pt-8">
          {(s.leaderboard || []).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-20">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="text-sm">🏆</span>
                <p className="text-xs font-bold text-gray-900">Top Performers</p>
              </div>
              <div className="divide-y divide-gray-50">
                {s.leaderboard.map((mr, i) => (
                  <div key={mr.mr_id} className="px-4 py-2.5 flex items-center gap-2.5 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setDrillMrId(mr.mr_id)}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-600"}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-800 truncate">{mr.mr_name}</p>
                      <p className="text-[9px] text-gray-400">{mr.territory}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{(mr.mcr_percentage || 0).toFixed(0)}%</span>
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{(mr.mvc_percentage || 0).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(s.underperformers || []).length > 0 && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-orange-100 bg-orange-50/50 flex items-center gap-2">
                <span className="text-sm">⚠️</span>
                <p className="text-xs font-bold text-orange-800">Needs Attention</p>
              </div>
              <div className="divide-y divide-gray-50">
                {s.underperformers.map((mr) => (
                  <div key={mr.mr_id} className="px-4 py-2.5 flex items-center gap-2.5 hover:bg-orange-50/30 transition-colors cursor-pointer" onClick={() => setDrillMrId(mr.mr_id)}>
                    <div className="w-6 h-6 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-[9px] font-bold flex-shrink-0 border border-red-100">{mr.mr_name?.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-800 truncate">{mr.mr_name}</p>
                      <p className="text-[9px] text-gray-400">{mr.territory}</p>
                    </div>
                    <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded flex-shrink-0">{(mr.mcr_percentage || 0).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MR Drill-Down View ────────────────────────────────────────────────────────
function MRDrillDown({ data, onBack, loading }) {
  if (loading) return <LoadingSkeleton />;
  const s = data || {};
  const mcr = s.mcr_data || {};
  const mvc = s.mvc_data || {};
  const rcpa = s.rcpa_summary || {};
  const trend = s.performance_trend || [];

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-xs text-indigo-600 font-semibold hover:bg-indigo-50 px-3 py-1.5 rounded-lg">← Back to Dashboard</button>

      {/* MR Info */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg font-bold">
            {s.mr_name?.charAt(0) || "M"}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{s.mr_name}</p>
            <p className="text-xs text-gray-400">{s.territory} · {s.zone} · {s.state}</p>
          </div>
        </div>
      </div>

      {/* Current Month KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="📞" label="MCR %" value={(mcr.mcr_percentage || 0).toFixed(1) + "%"} sub={`${mcr.doctors_visited || 0}/${mcr.total_assigned || 0} visited`} color="from-green-500 to-emerald-500" />
        <StatCard icon="🔄" label="MVC %" value={(mvc.mvc_percentage || 0).toFixed(1) + "%"} sub={`${mvc.fully_covered || 0} fully covered`} color="from-purple-500 to-pink-500" />
        <StatCard icon="📊" label="Avg Compliance" value={(mvc.avg_compliance || 0).toFixed(1) + "%"} color="from-blue-500 to-indigo-500" />
        <StatCard icon="💊" label="RCPA" value={rcpa.total_commitments || 0} sub={`${rcpa.rx_per_week || 0} Rx/week`} color="from-orange-500 to-red-500" />
      </div>

      {/* Performance Trend */}
      {trend.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-4">📈 Performance Trend (Last 6 Months)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2.5 font-bold text-gray-500">Month</th>
                  <th className="text-center px-4 py-2.5 font-bold text-gray-500">MCR %</th>
                  <th className="text-center px-4 py-2.5 font-bold text-gray-500">MVC %</th>
                  <th className="text-center px-4 py-2.5 font-bold text-gray-500">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trend.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-semibold text-gray-800">{t.month}/{t.year}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-green-600">{(t.mcr || 0).toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-center font-bold text-purple-600">{(t.mvc || 0).toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-center">{(t.avg_compliance || 0).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MCR Section (Admin — pick an MR) ─────────────────────────────────────────
function MCRSection({ month, year }) {
  const [mrId, setMrId] = useState("");

  const { data: mrs } = useQuery({
    queryKey: ["company-mrs"],
    queryFn: () => get("/api/v1/mrs").then((r) => r.mrs || []),
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["sfe-mcr-admin", mrId, month, year],
    queryFn: () => get("/api/v1/sfe/mcr", { month, year, mr_id: mrId }),
    enabled: !!mrId,
  });

  const selectedMr = (mrs || []).find((m) => (m.id || m._id) === mrId) || null;

  return (
    <div className="space-y-5">
      {/* MR Selector */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-wider">Select Medical Representative</label>
        <select value={mrId} onChange={(e) => setMrId(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-4 py-3 w-full max-w-md bg-white font-medium text-gray-700 focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none transition-all">
          <option value="">Choose an MR...</option>
          {(mrs || []).map((m) => <option key={m.id || m._id} value={m.id || m._id}>{m.name || m.full_name} — {m.territory || ""}</option>)}
        </select>
      </div>

      {mrId && selectedMr && <MRProfileCard mr={selectedMr} />}
      {!mrId && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <span className="text-3xl block mb-3">📞</span>
          <p className="text-gray-700 font-bold text-sm mb-1">Select an MR</p>
          <p className="text-gray-400 text-xs">Choose a medical representative to view their MCR data</p>
        </div>
      )}
      {mrId && isLoading && <LoadingSkeleton />}
      {mrId && error && <ErrorBox message={error.message} />}
      {mrId && data && <MCRDetail data={data} />}
    </div>
  );
}

function MCRDetail({ data }) {
  const s = data || {};
  const pct = s.mcr_percentage || 0;
  const pctColor = pct >= 90 ? "text-emerald-600" : pct >= 75 ? "text-orange-600" : "text-red-600";
  const pctBg = pct >= 90 ? "#10b981" : pct >= 75 ? "#f97316" : "#ef4444";
  const pctLabel = pct >= 90 ? "Excellent" : pct >= 75 ? "Good" : pct >= 60 ? "Needs Improvement" : "Critical";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left: Doctor Details */}
      <div className="lg:col-span-2 space-y-4">
        {(s.visited || []).length > 0 && (
          <div>
            <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center text-[10px]">✅</span>
              Visited ({s.visited.length})
            </p>
            <div className="space-y-2.5">
              {s.visited.map((d, i) => (
                <AdminDoctorVisitCard key={i} doctor={d} />
              ))}
            </div>
          </div>
        )}

        {(s.not_visited || []).length > 0 && (
          <div>
            <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-red-100 rounded flex items-center justify-center text-[10px]">❌</span>
              Not Visited ({s.not_visited.length})
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
              {s.not_visited.map((d, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-xs font-bold border border-red-100">{d.doctor_name?.charAt(0)}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{d.doctor_name}</p>
                      <p className="text-[10px] text-gray-400">Last: {d.last_visited ? formatISTDate(d.last_visited) : "Never"}</p>
                    </div>
                  </div>
                  <span className={"px-2 py-0.5 rounded-full font-bold text-[10px] border " + (d.classification === "A" ? "bg-red-50 text-red-600 border-red-100" : d.classification === "B" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-gray-50 text-gray-500 border-gray-200")}>{d.classification}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Stats Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20 space-y-5">
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 mb-3">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={pctBg} strokeWidth="3.5" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${pctColor}`}>{pct.toFixed(1)}%</span>
                <span className="text-[9px] text-gray-400 font-medium">MCR</span>
              </div>
            </div>
            <p className="text-xs font-bold text-gray-700">{s.mr_name}</p>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full mt-1 ${pct >= 90 ? "bg-emerald-50 text-emerald-700" : pct >= 75 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700"}`}>{pctLabel}</span>
          </div>

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
        </div>
      </div>
    </div>
  );
}

// ── Admin Doctor Visit Card (expandable) ──────────────────────────────────────
function AdminDoctorVisitCard({ doctor }) {
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
      <button onClick={() => setExpanded(!expanded)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold border border-purple-100">
            {d.doctor_name?.charAt(0)}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">{d.doctor_name}</p>
            <p className="text-[11px] text-gray-400">{d.visits_count} visit{d.visits_count > 1 ? "s" : ""} · Last: {d.last_visit_date ? formatISTDate(d.last_visit_date) : "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={"px-2 py-0.5 rounded-full font-bold text-[10px] border " + (d.classification === "A" ? "bg-red-50 text-red-600 border-red-100" : d.classification === "B" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-gray-50 text-gray-500 border-gray-200")}>{d.classification}</span>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 ${expanded ? "bg-purple-100 rotate-180" : "bg-gray-100"}`}>
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </button>

      {expanded && visits.length > 0 && (
        <div className="border-t border-gray-100">
          {/* Visit Tabs */}
          <div className="px-5 pt-3 flex gap-1.5 overflow-x-auto">
            {visits.map((v, vi) => (
              <button key={vi} onClick={() => setActiveVisit(vi)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${activeVisit === vi ? "bg-purple-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                Visit {vi + 1}
              </button>
            ))}
          </div>

          {/* Active Visit Content with animation */}
          <div key={activeVisit} className="p-5 animate-[fadeSlide_0.3s_ease-out]">
            {(() => {
              const v = visits[activeVisit];
              if (!v) return null;
              const mood = MOOD_STYLES[v.doctor_mood] || MOOD_STYLES.neutral;
              return (
                <>
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

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                    {v.purpose && <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"><p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Purpose</p><p className="text-xs font-bold text-gray-800 mt-0.5">{v.purpose}</p></div>}
                    {v.location && <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"><p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Location</p><p className="text-xs font-bold text-gray-800 mt-0.5">{v.location}</p></div>}
                    {v.samples_given != null && <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"><p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Samples</p><p className="text-xs font-bold text-gray-800 mt-0.5">{v.samples_given}</p></div>}
                    {v.rx_commitment != null && <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"><p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Rx Commitment</p><p className={"text-xs font-bold mt-0.5 " + (v.rx_commitment ? "text-emerald-700" : "text-gray-500")}>{v.rx_commitment ? `Yes (${v.expected_rx_per_month || "—"}/mo)` : "No"}</p></div>}
                    {v.follow_up_date && <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"><p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Follow-up</p><p className="text-xs font-bold text-purple-700 mt-0.5">{formatISTDate(v.follow_up_date)}</p></div>}
                    {v.competitor_info && <div className="bg-red-50 rounded-xl px-3 py-2.5 border border-red-100"><p className="text-[9px] text-red-400 font-medium uppercase tracking-wider">Competitor</p><p className="text-xs font-bold text-red-700 mt-0.5">{v.competitor_info}</p></div>}
                  </div>

                  {(v.products_discussed || []).length > 0 && (
                    <div className="mb-3"><p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider mb-1.5">Products Discussed</p><div className="flex flex-wrap gap-1.5">{v.products_discussed.map((p, pi) => (<span key={pi} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-100">{typeof p === "string" ? p : p.name}</span>))}</div></div>
                  )}

                  <div className="space-y-2.5">
                    {v.outcome && <div className="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100"><p className="text-[9px] text-emerald-600 font-medium uppercase tracking-wider mb-0.5">Outcome</p><p className="text-xs text-emerald-800 font-medium">{v.outcome}</p></div>}
                    {v.feedback && <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-100"><p className="text-[9px] text-blue-600 font-medium uppercase tracking-wider mb-0.5">Doctor Feedback</p><p className="text-xs text-blue-800 font-medium">{v.feedback}</p></div>}
                    {v.notes && <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"><p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Notes</p><p className="text-xs text-gray-600">{v.notes}</p></div>}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
      {expanded && visits.length === 0 && (
        <div className="border-t border-gray-100 p-5"><p className="text-xs text-gray-400 text-center">No visit data available.</p></div>
      )}
    </div>
  );
}

// ── MVC Section (Admin — pick an MR) ─────────────────────────────────────────
function MVCSection({ month, year }) {
  const [mrId, setMrId] = useState("");

  const { data: mrs } = useQuery({
    queryKey: ["company-mrs"],
    queryFn: () => get("/api/v1/mrs").then((r) => r.mrs || []),
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["sfe-mvc-admin", mrId, month, year],
    queryFn: () => get("/api/v1/sfe/mvc", { month, year, mr_id: mrId }),
    enabled: !!mrId,
  });

  const selectedMr = (mrs || []).find((m) => (m.id || m._id) === mrId) || null;

  return (
    <div className="space-y-5">
      {/* MR Selector */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-wider">Select Medical Representative</label>
        <select value={mrId} onChange={(e) => setMrId(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-4 py-3 w-full max-w-md bg-white font-medium text-gray-700 focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none transition-all">
          <option value="">Choose an MR...</option>
          {(mrs || []).map((m) => <option key={m.id || m._id} value={m.id || m._id}>{m.name || m.full_name} — {m.territory || ""}</option>)}
        </select>
      </div>

      {mrId && selectedMr && <MRProfileCard mr={selectedMr} />}
      {!mrId && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <span className="text-3xl block mb-3">🔄</span>
          <p className="text-gray-700 font-bold text-sm mb-1">Select an MR</p>
          <p className="text-gray-400 text-xs">Choose a medical representative to view their visit coverage</p>
        </div>
      )}
      {mrId && isLoading && <LoadingSkeleton />}
      {mrId && error && <ErrorBox message={error.message} />}
      {mrId && data && <MVCDetail data={data} />}
    </div>
  );
}

function MVCDetail({ data }) {
  const s = data || {};
  const pct = s.mvc_percentage || 0;
  const pctColor = pct >= 85 ? "text-emerald-600" : pct >= 70 ? "text-orange-600" : "text-red-600";
  const pctBg = pct >= 85 ? "#10b981" : pct >= 70 ? "#f97316" : "#ef4444";
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
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 mb-3">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={pctBg} strokeWidth="3.5" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${pctColor}`}>{pct.toFixed(1)}%</span>
                <span className="text-[9px] text-gray-400 font-medium">MVC</span>
              </div>
            </div>
            <p className="text-xs font-bold text-gray-700">{s.mr_name}</p>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full mt-1 ${pct >= 85 ? "bg-emerald-50 text-emerald-700" : pct >= 70 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700"}`}>{pctLabel}</span>
          </div>

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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-gray-500 font-medium">Avg Compliance</span>
              <span className="text-[10px] font-bold text-gray-700">{(s.avg_compliance || 0).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.avg_compliance || 0}%`, backgroundColor: pctBg }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RCPA Summary Section (Admin) ──────────────────────────────────────────────
function RCPASection({ month, year }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sfe-rcpa-summary", month, year],
    queryFn: () => get("/api/v1/sfe/rcpa/summary", { month, year }),
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorBox message={error.message} />;

  const s = data || {};

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="📈" label="Total Rx/Week" value={s.total_rx_per_week || 0} color="from-indigo-500 to-purple-500" />
        <StatCard icon="💊" label="Commitments" value={s.total_commitments || 0} color="from-green-500 to-emerald-500" />
        <StatCard icon="🩺" label="Doctors" value={s.total_doctors || 0} color="from-blue-500 to-indigo-500" />
        <StatCard icon="📦" label="Products" value={s.total_products || 0} color="from-orange-500 to-red-500" />
      </div>

      {/* By Product */}
      {(s.by_product || []).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">📦 Demand by Product</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2.5 font-bold text-gray-500">Product</th>
                  <th className="text-center px-4 py-2.5 font-bold text-gray-500">Rx/Week</th>
                  <th className="text-center px-4 py-2.5 font-bold text-gray-500">Doctors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {s.by_product.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-semibold text-gray-800">{p.product_name}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-indigo-600">{p.rx_per_week}</td>
                    <td className="px-4 py-2.5 text-center">{p.doctors_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* By Territory */}
      {(s.by_territory || []).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">🗺️ Demand by Territory</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2.5 font-bold text-gray-500">Territory</th>
                  <th className="text-center px-4 py-2.5 font-bold text-gray-500">Rx/Week</th>
                  <th className="text-center px-4 py-2.5 font-bold text-gray-500">Doctors</th>
                  <th className="text-center px-4 py-2.5 font-bold text-gray-500">Products</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {s.by_territory.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-semibold text-gray-800">{t.territory}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-indigo-600">{t.rx_per_week}</td>
                    <td className="px-4 py-2.5 text-center">{t.doctors_count}</td>
                    <td className="px-4 py-2.5 text-center">{t.products_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Visit Targets (Classification Settings) ──────────────────────────────────
function VisitTargets() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ A: 2, B: 1, C: 1 });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["sfe-settings"],
    queryFn: () => get("/api/v1/sfe/settings"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: doctorsData } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => get("/api/v1/doctors?page_size=1000").then((d) => Array.isArray(d) ? d : (d?.doctors || [])),
    staleTime: 5 * 60 * 1000,
  });

  const doctors = Array.isArray(doctorsData) ? doctorsData : [];
  const targets = settings?.classification_targets || { A: 2, B: 1, C: 1 };

  const counts = {
    A: doctors.filter((d) => d.classification === "A").length,
    B: doctors.filter((d) => d.classification === "B").length,
    C: doctors.filter((d) => !d.classification || d.classification === "C").length,
  };
  const totalDoctors = doctors.length;
  const totalVisits = (counts.A * targets.A) + (counts.B * targets.B) + (counts.C * targets.C);

  const handleSave = async () => {
    setSaving(true);
    try {
      await put("/api/v1/sfe/settings", { classification_targets: draft });
      queryClient.invalidateQueries({ queryKey: ["sfe-settings"] });
      setEditing(false);
    } catch (err) {
      alert(err.message || "Failed to save settings");
    }
    setSaving(false);
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Target config */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Monthly Visit Targets</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Required visits per doctor per month</p>
            </div>
            {!editing ? (
              <button onClick={() => { setDraft({ ...targets }); setEditing(true); }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">Edit</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg disabled:opacity-50">{saving ? "..." : "Save"}</button>
              </div>
            )}
          </div>

          <div className="divide-y divide-gray-50">
            {[
              { key: "A", label: "Class A", sub: "High value", color: "bg-rose-500" },
              { key: "B", label: "Class B", sub: "Medium value", color: "bg-amber-400" },
              { key: "C", label: "Class C", sub: "Standard", color: "bg-slate-300" },
            ].map((cls) => (
              <div key={cls.key} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${cls.color}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{cls.label}</p>
                    <p className="text-[10px] text-gray-400">{cls.sub} · {counts[cls.key]} doctors</p>
                  </div>
                </div>
                {editing ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDraft({ ...draft, [cls.key]: Math.max(1, draft[cls.key] - 1) })}
                      className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xs">−</button>
                    <span className="w-8 text-center text-lg font-bold text-gray-900">{draft[cls.key]}</span>
                    <button onClick={() => setDraft({ ...draft, [cls.key]: Math.min(30, draft[cls.key] + 1) })}
                      className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xs">+</button>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-xl font-bold text-gray-900">{targets[cls.key]}</span>
                    <span className="text-xs text-gray-400 ml-1">/mo</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Total Monthly Visits Required</p>
            <p className="text-5xl font-black text-gray-900 mt-3">{totalVisits}</p>
            <p className="text-xs text-gray-400 mt-2">across {totalDoctors} doctors</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-4">Doctor Distribution</p>
            
            {/* Donut Chart */}
            <div className="flex items-center justify-center mb-5">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                  {(() => {
                    const pctA = totalDoctors > 0 ? (counts.A / totalDoctors) * 100 : 0;
                    const pctB = totalDoctors > 0 ? (counts.B / totalDoctors) * 100 : 0;
                    const pctC = totalDoctors > 0 ? (counts.C / totalDoctors) * 100 : 0;
                    return (
                      <>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f43f5e" strokeWidth="4" strokeDasharray={`${pctA} ${100 - pctA}`} strokeDashoffset="0" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray={`${pctB} ${100 - pctB}`} strokeDashoffset={`${-pctA}`} />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#94a3b8" strokeWidth="4" strokeDasharray={`${pctC} ${100 - pctC}`} strokeDashoffset={`${-(pctA + pctB)}`} />
                      </>
                    );
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-900">{totalDoctors}</span>
                  <span className="text-[9px] text-gray-400 uppercase font-medium">Doctors</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2.5">
              {[
                { key: "A", label: "Class A", color: "bg-rose-500", desc: "High value" },
                { key: "B", label: "Class B", color: "bg-amber-400", desc: "Medium value" },
                { key: "C", label: "Class C", color: "bg-slate-400", desc: "Standard" },
              ].map((cls) => {
                const pct = totalDoctors > 0 ? Math.round((counts[cls.key] / totalDoctors) * 100) : 0;
                return (
                  <div key={cls.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${cls.color}`} />
                      <span className="text-xs font-semibold text-gray-700">{cls.label}</span>
                      <span className="text-[10px] text-gray-400">{cls.desc}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{counts[cls.key]} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
