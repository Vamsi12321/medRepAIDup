"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, Cell,
} from "recharts";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import DCRPrintTemplate from "@/components/DCRPrintTemplate";
import MCRPrintTemplate from "@/components/MCRPrintTemplate";
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
  { id: "dcr",       label: "DCR (Daily Reports)",            icon: "📋" },
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
        {activeTab === "dcr"       && <AdminDCRSection />}
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
  const [alertFilter, setAlertFilter] = useState("all"); // "all" | "critical" | "warning"
  const [leaderView, setLeaderView]   = useState("top");  // "top" | "bottom"

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
  if (error)     return <ErrorBox message={error.message} />;

  const s = data || {};

  if (drillMrId && drillData) {
    return <MRDrillDown data={drillData} onBack={() => setDrillMrId(null)} loading={drillLoading} />;
  }

  const avgMcr  = s.avg_mcr_pct || 0;
  const avgMvc  = s.avg_mvc_pct || 0;
  const mcrColor = avgMcr >= 90 ? "#10b981" : avgMcr >= 75 ? "#f97316" : "#ef4444";
  const mvcColor = avgMvc >= 85 ? "#10b981" : avgMvc >= 70 ? "#f97316" : "#ef4444";

  const alerts      = s.alerts      || [];
  const leaderboard = s.leaderboard || [];
  const underperfs  = s.underperformers || [];
  const territories = s.by_territory   || [];

  const filteredAlerts = alertFilter === "all" ? alerts
    : alerts.filter((a) => a.severity === alertFilter);

  // Leaderboard bar chart data
  const leaderChartData = (leaderView === "top" ? leaderboard : underperfs).map((mr) => ({
    name:  mr.mr_name?.split(" ").slice(-1)[0] || mr.mr_name,
    full:  mr.mr_name,
    MCR:   +(mr.mcr_percentage || 0).toFixed(1),
    MVC:   +(mr.mvc_percentage || 0).toFixed(1),
    territory: mr.territory,
  }));

  // Territory bar chart data
  const terrChartData = territories.map((t) => ({
    name:    t.territory,
    MCR:     +(t.avg_mcr || 0).toFixed(1),
    MVC:     +(t.avg_mvc || 0).toFixed(1),
    Visits:  t.total_visits || 0,
    "Rx/Mo": t.rx_per_month || t.rx_per_week || 0,
  }));

  return (
    <div className="space-y-5">

      {/* ── KPI Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Active MRs",   value: s.total_mrs || 0,   color: "text-purple-600",  bg: "bg-purple-50",  icon: "👥" },
          { label: "Avg MCR",      value: avgMcr.toFixed(0) + "%", color: avgMcr >= 90 ? "text-emerald-600" : avgMcr >= 75 ? "text-orange-500" : "text-red-500", bg: avgMcr >= 90 ? "bg-emerald-50" : avgMcr >= 75 ? "bg-orange-50" : "bg-red-50", icon: "📞" },
          { label: "Avg MVC",      value: avgMvc.toFixed(0) + "%", color: avgMvc >= 85 ? "text-emerald-600" : avgMvc >= 70 ? "text-orange-500" : "text-red-500", bg: avgMvc >= 85 ? "bg-emerald-50" : avgMvc >= 70 ? "bg-orange-50" : "bg-red-50", icon: "🔄" },
          { label: "Doctors",      value: s.total_doctors || 0,    color: "text-blue-600",    bg: "bg-blue-50",    icon: "🩺" },
          { label: "Total Visits", value: s.total_visits  || 0,    color: "text-gray-800",    bg: "bg-gray-50",    icon: "📅" },
          { label: "Rx/Month",     value: (s.total_rx_per_month || s.total_rx_per_week || 0).toLocaleString(), color: "text-orange-600", bg: "bg-orange-50", icon: "💊" },
        ].map((k, i) => (
          <div key={i} className={`${k.bg} rounded-2xl p-4 border border-white shadow-sm text-center`}>
            <span className="text-lg block mb-1">{k.icon}</span>
            <p className={`text-xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Company MCR + MVC gauges ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MCR gauge card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-gray-900">Company-wide MCR</p>
              <p className="text-[11px] text-gray-400">Monthly Call Report average</p>
            </div>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${avgMcr >= 90 ? "bg-emerald-50 text-emerald-700" : avgMcr >= 75 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700"}`}>
              {avgMcr >= 90 ? "Excellent" : avgMcr >= 75 ? "Good" : avgMcr >= 60 ? "Needs Work" : "Critical"}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={mcrColor} strokeWidth="3" strokeDasharray={`${avgMcr}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black" style={{ color: mcrColor }}>{avgMcr.toFixed(0)}%</span>
                <span className="text-[9px] text-gray-400">MCR</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {[
                { label: "Target ≥90%", pct: 90,    color: "#10b981", bg: "bg-emerald-100" },
                { label: "Current",     pct: avgMcr, color: mcrColor,  bg: "bg-gray-100" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-gray-500">{row.label}</span>
                    <span className="text-[10px] font-bold" style={{ color: row.color }}>{row.pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, row.pct)}%`, backgroundColor: row.color }} />
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-gray-400 mt-1">
                Benchmarks: ≥90% Excellent · ≥75% Good · &lt;60% Critical
              </p>
            </div>
          </div>
        </div>

        {/* MVC gauge card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-gray-900">Company-wide MVC</p>
              <p className="text-[11px] text-gray-400">Monthly Visit Coverage average</p>
            </div>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${avgMvc >= 85 ? "bg-emerald-50 text-emerald-700" : avgMvc >= 70 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700"}`}>
              {avgMvc >= 85 ? "Excellent" : avgMvc >= 70 ? "Good" : avgMvc >= 55 ? "Needs Work" : "Critical"}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={mvcColor} strokeWidth="3" strokeDasharray={`${avgMvc}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black" style={{ color: mvcColor }}>{avgMvc.toFixed(0)}%</span>
                <span className="text-[9px] text-gray-400">MVC</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {[
                { label: "Target ≥85%", pct: 85,    color: "#10b981", bg: "bg-emerald-100" },
                { label: "Current",     pct: avgMvc, color: mvcColor,  bg: "bg-gray-100" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-gray-500">{row.label}</span>
                    <span className="text-[10px] font-bold" style={{ color: row.color }}>{row.pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, row.pct)}%`, backgroundColor: row.color }} />
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-gray-400 mt-1">
                Benchmarks: ≥85% Excellent · ≥70% Good · &lt;55% Critical
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Leaderboard + Territory bar charts ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* MR Performance Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-gray-900">MR Performance</p>
              <p className="text-[11px] text-gray-400">MCR & MVC side-by-side · click bar to drill in</p>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {[{ id: "top", label: "🏆 Top" }, { id: "bottom", label: "⚠️ Flagged" }].map((v) => (
                <button key={v.id} onClick={() => setLeaderView(v.id)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${leaderView === v.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          {leaderChartData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leaderChartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                onClick={(e) => {
                  if (!e?.activePayload?.[0]) return;
                  const name = e.activePayload[0].payload.full;
                  const mr = [...leaderboard, ...underperfs].find((m) => m.mr_name === name);
                  if (mr) setDrillMrId(mr.mr_id);
                }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
                      <p className="font-bold text-gray-800 mb-1">{d.full}</p>
                      <p className="text-gray-400 text-[10px] mb-1.5">{d.territory}</p>
                      <div className="flex items-center gap-1.5 mb-0.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-gray-600">MCR: <b>{d.MCR}%</b></span></div>
                      <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-gray-600">MVC: <b>{d.MVC}%</b></span></div>
                      <p className="text-[9px] text-indigo-500 mt-1.5">Click to drill down →</p>
                    </div>
                  );
                }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                <Bar dataKey="MCR" fill="#10b981" radius={[4,4,0,0]} maxBarSize={22} cursor="pointer" />
                <Bar dataKey="MVC" fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={22} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Territory Performance Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-gray-900">Territory Performance</p>
              <p className="text-[11px] text-gray-400">MCR & MVC by territory</p>
            </div>
          </div>
          {terrChartData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No territory data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={terrChartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
                      <p className="font-bold text-gray-800 mb-1">{d.name}</p>
                      <div className="flex items-center gap-1.5 mb-0.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span>MCR: <b>{d.MCR}%</b></span></div>
                      <div className="flex items-center gap-1.5 mb-0.5"><span className="w-2 h-2 rounded-full bg-blue-500" /><span>MVC: <b>{d.MVC}%</b></span></div>
                      <div className="flex items-center gap-1.5 mb-0.5"><span className="w-2 h-2 rounded-full bg-orange-400" /><span>Rx/Mo: <b>{d["Rx/Mo"]}</b></span></div>
                      <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-300" /><span>Visits: <b>{d.Visits}</b></span></div>
                    </div>
                  );
                }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                <Bar dataKey="MCR" fill="#10b981" radius={[4,4,0,0]} maxBarSize={22} />
                <Bar dataKey="MVC" fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Alerts + Territory detail cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Alerts */}
        <div className="lg:col-span-2 space-y-4">
          {alerts.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center text-sm">🚨</span>
                  <p className="text-sm font-bold text-gray-900">Alerts</p>
                  <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{alerts.length}</span>
                </div>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                  {[
                    { id: "all",      label: `All (${alerts.length})` },
                    { id: "critical", label: `🔴 Critical (${alerts.filter((a) => a.severity === "critical").length})` },
                    { id: "warning",  label: `🟡 Warning (${alerts.filter((a) => a.severity !== "critical").length})` },
                  ].map((f) => (
                    <button key={f.id} onClick={() => setAlertFilter(f.id)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all whitespace-nowrap ${alertFilter === f.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {filteredAlerts.map((a, i) => (
                  <div key={i}
                    className={`px-5 py-3.5 flex items-start gap-3 cursor-pointer transition-colors ${a.severity === "critical" ? "hover:bg-red-50/50" : "hover:bg-amber-50/30"}`}
                    onClick={() => setDrillMrId(a.mr_id)}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.severity === "critical" ? "bg-red-500 animate-pulse" : "bg-amber-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-bold text-gray-900">{a.mr_name}</p>
                        <span className="text-[9px] text-gray-400">{a.territory}</span>
                      </div>
                      <p className={`text-[11px] font-medium ${a.severity === "critical" ? "text-red-700" : "text-amber-700"}`}>{a.message}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${a.severity === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {a.severity === "critical" ? "Critical" : "Warning"}
                    </span>
                    <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Territory detail cards */}
          {territories.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">🗺️</span>
                Territory Breakdown
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {territories.map((t, i) => {
                  const mcr = t.avg_mcr || 0;
                  const mvc = t.avg_mvc || 0;
                  const mcrC = mcr >= 90 ? "#10b981" : mcr >= 75 ? "#f97316" : "#ef4444";
                  const mvcC = mvc >= 85 ? "#10b981" : mvc >= 70 ? "#f97316" : "#ef4444";
                  return (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-900">{t.territory}</p>
                        <span className="text-[10px] text-gray-400">{t.mrs_count} MRs</span>
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        {[{ label: "MCR", val: mcr, color: mcrC }, { label: "MVC", val: mvc, color: mvcC }].map((ring) => (
                          <div key={ring.label} className="text-center">
                            <div className="relative w-14 h-14 mx-auto">
                              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={ring.color} strokeWidth="4" strokeDasharray={`${ring.val}, 100`} strokeLinecap="round" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-black" style={{ color: ring.color }}>{ring.val.toFixed(0)}%</span>
                              </div>
                            </div>
                            <p className="text-[9px] text-gray-400 mt-0.5 uppercase font-medium">{ring.label}</p>
                          </div>
                        ))}
                        <div className="flex-1 space-y-1.5 ml-2">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-gray-400">Doctors</span>
                            <span className="font-bold text-gray-700">{t.total_doctors}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-gray-400">Visits</span>
                            <span className="font-bold text-gray-700">{t.total_visits}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-gray-400">Rx/Mo</span>
                            <span className="font-bold text-purple-600">{t.rx_per_month || t.rx_per_week || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar: leaderboard + underperformers */}
        <div className="space-y-4">
          {leaderboard.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-white">
                <span>🏆</span>
                <p className="text-xs font-bold text-gray-900">Top Performers</p>
              </div>
              <div className="divide-y divide-gray-50">
                {leaderboard.map((mr, i) => (
                  <div key={mr.mr_id} className="px-4 py-3 flex items-center gap-2.5 hover:bg-gray-50/60 transition-colors cursor-pointer group"
                    onClick={() => setDrillMrId(mr.mr_id)}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 border ${
                      i === 0 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                      i === 1 ? "bg-gray-100 text-gray-600 border-gray-200" :
                                "bg-orange-50 text-orange-600 border-orange-100"
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-800 truncate">{mr.mr_name}</p>
                      <p className="text-[9px] text-gray-400 truncate">{mr.territory}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 items-center">
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{(mr.mcr_percentage || 0).toFixed(0)}%</span>
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{(mr.mvc_percentage || 0).toFixed(0)}%</span>
                      <svg className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {underperfs.length > 0 && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-orange-100 flex items-center gap-2 bg-gradient-to-r from-orange-50 to-white">
                <span>⚠️</span>
                <p className="text-xs font-bold text-orange-800">Needs Attention</p>
                <span className="text-[9px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full ml-auto">{underperfs.length}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {underperfs.map((mr) => (
                  <div key={mr.mr_id} className="px-4 py-3 flex items-center gap-2.5 hover:bg-red-50/30 transition-colors cursor-pointer group"
                    onClick={() => setDrillMrId(mr.mr_id)}>
                    <div className="w-7 h-7 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-[10px] font-bold flex-shrink-0 border border-red-100">
                      {mr.mr_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-800 truncate">{mr.mr_name}</p>
                      <p className="text-[9px] text-gray-400 truncate">{mr.territory}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 items-center">
                      <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">{(mr.mcr_percentage || 0).toFixed(0)}%</span>
                      <svg className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick legend */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Metric Guide</p>
            <div className="space-y-1.5">
              {[
                { color: "bg-emerald-500", label: "MCR — Doctor visit coverage" },
                { color: "bg-blue-500",    label: "MVC — Visit frequency compliance" },
                { color: "bg-orange-400",  label: "Rx/Mo — Prescription commitments" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`} />
                  <span className="text-[10px] text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MR Drill-Down View ────────────────────────────────────────────────────────
function MRDrillDown({ data, onBack, loading }) {
  if (loading) return <LoadingSkeleton />;
  const s    = data || {};
  const mcr  = s.mcr_data  || {};
  const mvc  = s.mvc_data  || {};
  const rcpa = s.rcpa_summary || {};
  const trend = s.performance_trend || [];

  const mcrPct  = mcr.mcr_percentage  || 0;
  const mvcPct  = mvc.mvc_percentage  || 0;
  const mcrC    = mcrPct >= 90 ? "#10b981" : mcrPct >= 75 ? "#f97316" : "#ef4444";
  const mvcC    = mvcPct >= 85 ? "#10b981" : mvcPct >= 70 ? "#f97316" : "#ef4444";

  // Trend chart data
  const trendChartData = trend.map((t) => ({
    label: `${t.month}/${String(t.year).slice(2)}`,
    MCR:   +(t.mcr || 0).toFixed(1),
    MVC:   +(t.mvc || 0).toFixed(1),
    Compliance: +(t.avg_compliance || 0).toFixed(1),
  }));

  return (
    <div className="space-y-5">

      {/* Breadcrumb nav */}
      <div className="flex items-center gap-2 text-xs">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-indigo-600 font-semibold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          Dashboard
        </button>
        <span className="text-gray-300">/</span>
        <span className="font-bold text-gray-700">{s.mr_name}</span>
      </div>

      {/* MR Header Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-black">
            {s.mr_name?.charAt(0) || "M"}
          </div>
          <div className="flex-1">
            <p className="text-lg font-extrabold">{s.mr_name}</p>
            <p className="text-indigo-200 text-xs mt-0.5">{s.territory} · {s.zone} · {s.state}</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center">
              <p className="text-2xl font-black">{mcrPct.toFixed(0)}%</p>
              <p className="text-[10px] text-indigo-200 uppercase">MCR</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black">{mvcPct.toFixed(0)}%</p>
              <p className="text-[10px] text-indigo-200 uppercase">MVC</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">📞</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${mcrPct >= 90 ? "bg-emerald-50 text-emerald-700" : mcrPct >= 75 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-600"}`}>
              {mcrPct >= 90 ? "Excellent" : mcrPct >= 75 ? "Good" : "Low"}
            </span>
          </div>
          <p className="text-2xl font-extrabold" style={{ color: mcrC }}>{mcrPct.toFixed(1)}%</p>
          <p className="text-[11px] font-bold text-gray-700 mt-0.5">MCR</p>
          <p className="text-[10px] text-gray-400">{mcr.doctors_visited || 0}/{mcr.total_assigned || 0} doctors</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">🔄</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${mvcPct >= 85 ? "bg-emerald-50 text-emerald-700" : mvcPct >= 70 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-600"}`}>
              {mvcPct >= 85 ? "Excellent" : mvcPct >= 70 ? "Good" : "Low"}
            </span>
          </div>
          <p className="text-2xl font-extrabold" style={{ color: mvcC }}>{mvcPct.toFixed(1)}%</p>
          <p className="text-[11px] font-bold text-gray-700 mt-0.5">MVC</p>
          <p className="text-[10px] text-gray-400">{mvc.fully_covered || 0} fully covered</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <span className="text-lg block mb-2">📊</span>
          <p className="text-2xl font-extrabold text-blue-600">{(mvc.avg_compliance || 0).toFixed(1)}%</p>
          <p className="text-[11px] font-bold text-gray-700 mt-0.5">Avg Compliance</p>
          <p className="text-[10px] text-gray-400">Visit frequency score</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <span className="text-lg block mb-2">💊</span>
          <p className="text-2xl font-extrabold text-orange-600">{rcpa.total_commitments || 0}</p>
          <p className="text-[11px] font-bold text-gray-700 mt-0.5">RCPA Commitments</p>
          <p className="text-[10px] text-gray-400">{rcpa.rx_per_month || rcpa.rx_per_week || 0} Rx/month</p>
        </div>
      </div>

      {/* Performance Trend Chart + Table */}
      {trendChartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-900 mb-0.5">Performance Trend — Last 6 Months</p>
          <p className="text-[11px] text-gray-400 mb-4">MCR, MVC and compliance over time · hover for values</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendChartData} margin={{ top: 5, right: 20, left: -5, bottom: 0 }}>
              <defs>
                <linearGradient id="gMCR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gMVC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={36} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="MCR"        stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="MVC"        stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="Compliance" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>

          {/* Month grid below chart */}
          <div className="grid grid-cols-6 gap-2 mt-4">
            {trendChartData.map((d, i) => {
              const isLast = i === trendChartData.length - 1;
              return (
                <div key={i} className={`rounded-xl p-2.5 text-center border ${isLast ? "bg-indigo-50 border-indigo-200 shadow-sm" : "bg-gray-50 border-gray-100"}`}>
                  <p className="text-[9px] text-gray-400 font-medium">{d.label}</p>
                  <p className="text-[11px] font-extrabold mt-0.5" style={{ color: isLast ? "#6366f1" : "#10b981" }}>{d.MCR}%</p>
                  <p className="text-[9px] text-blue-500 font-semibold">{d.MVC}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MCR Section (Admin — pick an MR) ─────────────────────────────────────────
function MCRSection({ month, year }) {
  const [mrId, setMrId]             = useState("");
  const [showPrint, setShowPrint]   = useState(false);

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
      {/* MR Selector — enhanced */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="text-[11px] font-bold text-gray-500 mb-2 block uppercase tracking-wider">Select Medical Representative</label>
            <div className="relative">
              <select value={mrId} onChange={(e) => setMrId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-white font-medium text-gray-700 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 outline-none transition-all appearance-none pr-10">
                <option value="">Choose an MR to view MCR…</option>
                {(mrs || []).map((m) => <option key={m.id || m._id} value={m.id || m._id}>{m.name || m.full_name} — {m.territory || ""}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          {mrId && (
            <button onClick={() => setMrId("")} className="text-xs text-gray-400 hover:text-gray-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 transition-all">
              ✕ Clear
            </button>
          )}
          {mrId && data && (
            <button onClick={() => setShowPrint(true)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all">
              🖨️ Print MCR Report
            </button>
          )}
        </div>
        {(mrs || []).length > 0 && !mrId && (
          <p className="text-[11px] text-gray-400 mt-2">{(mrs || []).length} MRs available</p>
        )}
      </div>

      {mrId && selectedMr && <MRProfileCard mr={selectedMr} />}
      {!mrId && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-12 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-purple-100">
            <span className="text-3xl">📞</span>
          </div>
          <p className="text-gray-700 font-bold text-sm mb-1">Select an MR above</p>
          <p className="text-gray-400 text-xs">Choose a medical representative to view their Monthly Call Report</p>
          <div className="flex items-center justify-center gap-6 mt-5">
            {[{label:"MCR Formula", desc:"Doctors visited ÷ Total assigned × 100"},{label:"Benchmarks", desc:"≥90% Excellent · ≥75% Good · <60% Critical"}].map((item,i)=>(
              <div key={i} className="text-left">
                <p className="text-[10px] font-bold text-purple-700 uppercase">{item.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {mrId && isLoading && <LoadingSkeleton />}
      {mrId && error && <ErrorBox message={error.message} />}
      {mrId && data && <MCRDetail data={data} />}

      {showPrint && data && (
        <MCRPrintTemplate
          mrInfo={selectedMr}
          month={month}
          year={year}
          data={data}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
}

function MCRDetail({ data }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const s         = data || {};
  const pct       = s.mcr_percentage || 0;
  const pctBg     = pct >= 90 ? "#10b981" : pct >= 75 ? "#f97316" : "#ef4444";
  const pctLabel  = pct >= 90 ? "Excellent" : pct >= 75 ? "Good" : pct >= 60 ? "Needs Improvement" : "Critical";
  const pctLight  = pct >= 90 ? "bg-emerald-50 text-emerald-700" : pct >= 75 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700";

  const visited    = s.visited    || [];
  const notVisited = s.not_visited || [];

  const filtered = activeFilter === "visited"     ? visited
                 : activeFilter === "not_visited"  ? notVisited
                 : [...visited, ...notVisited];

  // Pie-style bar chart data
  const coverageData = [
    { name: "Visited",   value: visited.length,    fill: "#10b981" },
    { name: "Not Visited", value: notVisited.length, fill: "#f3f4f6" },
  ];

  // Class breakdown bar chart
  const allDoctors = [...visited, ...notVisited];
  const classCounts = ["A","B","C"].map((cls) => ({
    name: `Class ${cls}`,
    Visited:     visited.filter((d)    => d.classification === cls).length,
    "Not Visited": notVisited.filter((d) => d.classification === cls).length,
  }));

  return (
    <div className="space-y-5">

      {/* ── Top KPI + Charts row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Big MCR Score */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">MCR Score</p>
          <div className="relative w-32 h-32 mb-3">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={pctBg} strokeWidth="3" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: pctBg }}>{pct.toFixed(0)}%</span>
              <span className="text-[9px] text-gray-400 font-medium">MCR</span>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${pctLight}`}>{pctLabel}</span>
          <p className="text-[11px] text-gray-500 font-medium mt-2">{s.mr_name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Assigned", value: s.total_assigned || 0, color: "text-gray-900", bg: "bg-gray-50", border: "border-gray-100" },
            { label: "Visited",  value: s.doctors_visited || 0, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Missed",   value: s.doctors_not_visited || 0, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
            { label: "Coverage", value: `${pct.toFixed(0)}%`, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
          ].map((k) => (
            <div key={k.label} className={`${k.bg} rounded-2xl p-4 border ${k.border} text-center`}>
              <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
              <p className="text-[10px] text-gray-500 font-medium uppercase mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Class Breakdown Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-700 mb-0.5">Coverage by Class</p>
          <p className="text-[10px] text-gray-400 mb-3">Visited vs missed per class</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={classCounts} margin={{ top: 0, right: 5, left: -20, bottom: 0 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f5f3ff" }} />
              <Bar dataKey="Visited"     fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="Not Visited" fill="#fca5a5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-1.5">
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Visited</span>
            <span className="flex items-center gap-1 text-[10px] text-red-400 font-medium"><span className="w-2 h-2 rounded-full bg-red-300 inline-block"/>Missed</span>
          </div>
        </div>
      </div>

      {/* ── Doctor List with filter tabs ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-bold text-gray-900">Doctor Details</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Expand each card to see visit reports</p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { id: "all",         label: `All (${visited.length + notVisited.length})` },
              { id: "visited",     label: `✅ Visited (${visited.length})` },
              { id: "not_visited", label: `❌ Missed (${notVisited.length})` },
            ].map((f) => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${activeFilter === f.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-3xl block mb-2">{activeFilter === "visited" ? "✅" : "❌"}</span>
              <p className="text-gray-500 text-sm font-medium">No doctors in this category</p>
            </div>
          ) : filtered.map((d, i) => (
            activeFilter === "not_visited" ? (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 bg-red-50/50 border border-red-100 rounded-xl">
                <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-sm font-bold flex-shrink-0">
                  {d.doctor_name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{d.doctor_name}</p>
                  <p className="text-[11px] text-gray-400">Last visited: {d.last_visited ? formatISTDate(d.last_visited) : "Never"}</p>
                </div>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border flex-shrink-0 ${d.classification === "A" ? "bg-red-50 text-red-600 border-red-200" : d.classification === "B" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>{d.classification}</span>
              </div>
            ) : (
              <AdminDoctorVisitCard key={i} doctor={d} />
            )
          ))}
        </div>
      </div>
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
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="text-[11px] font-bold text-gray-500 mb-2 block uppercase tracking-wider">Select Medical Representative</label>
            <div className="relative">
              <select value={mrId} onChange={(e) => setMrId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-white font-medium text-gray-700 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 outline-none transition-all appearance-none pr-10">
                <option value="">Choose an MR to view MVC…</option>
                {(mrs || []).map((m) => <option key={m.id || m._id} value={m.id || m._id}>{m.name || m.full_name} — {m.territory || ""}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          {mrId && (
            <button onClick={() => setMrId("")} className="text-xs text-gray-400 hover:text-gray-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 transition-all">
              ✕ Clear
            </button>
          )}
        </div>
        {(mrs || []).length > 0 && !mrId && (
          <p className="text-[11px] text-gray-400 mt-2">{(mrs || []).length} MRs available</p>
        )}
      </div>

      {mrId && selectedMr && <MRProfileCard mr={selectedMr} />}
      {!mrId && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-12 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
            <span className="text-3xl">🔄</span>
          </div>
          <p className="text-gray-700 font-bold text-sm mb-1">Select an MR above</p>
          <p className="text-gray-400 text-xs">Choose a medical representative to view their Monthly Visit Coverage</p>
          <div className="flex items-center justify-center gap-6 mt-5">
            {[{label:"MVC Formula", desc:"Doctors with ≥required visits ÷ Total assigned × 100"},{label:"Benchmarks", desc:"≥85% Excellent · ≥70% Good · <55% Critical"}].map((item,i)=>(
              <div key={i} className="text-left">
                <p className="text-[10px] font-bold text-blue-700 uppercase">{item.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {mrId && isLoading && <LoadingSkeleton />}
      {mrId && error && <ErrorBox message={error.message} />}
      {mrId && data && <MVCDetail data={data} />}
    </div>
  );
}

function MVCDetail({ data }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const s        = data || {};
  const pct      = s.mvc_percentage || 0;
  const pctBg    = pct >= 85 ? "#10b981" : pct >= 70 ? "#f97316" : "#ef4444";
  const pctLabel = pct >= 85 ? "Excellent" : pct >= 70 ? "Good" : pct >= 55 ? "Needs Improvement" : "Critical";
  const pctLight = pct >= 85 ? "bg-emerald-50 text-emerald-700" : pct >= 70 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700";

  const doctors = s.doctors || [];
  const filtered = statusFilter === "all" ? doctors : doctors.filter((d) => d.status === statusFilter);

  // Compliance horizontal bar chart data
  const complianceData = doctors.map((d) => ({
    name:       d.doctor_name?.split(" ").slice(-1)[0] || d.doctor_name,
    fullName:   d.doctor_name,
    compliance: d.compliance_percentage || 0,
    required:   d.required_visits,
    actual:     d.actual_visits,
    status:     d.status,
    fill:       d.status === "covered" ? "#10b981" : d.status === "under" ? "#f97316" : "#ef4444",
  }));

  // Status donut data
  const statusData = [
    { name: "Covered", value: s.fully_covered || 0, fill: "#10b981" },
    { name: "Under",   value: s.under_covered  || 0, fill: "#f97316" },
    { name: "Missed",  value: s.not_visited    || 0, fill: "#ef4444" },
  ];

  const covered = s.fully_covered || 0;
  const under   = s.under_covered  || 0;
  const missed  = s.not_visited    || 0;
  const total   = covered + under + missed || 1;

  return (
    <div className="space-y-5">

      {/* ── Top KPI row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* MVC Score ring */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">MVC Score</p>
          <div className="relative w-32 h-32 mb-3">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={pctBg} strokeWidth="3" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: pctBg }}>{pct.toFixed(0)}%</span>
              <span className="text-[9px] text-gray-400 font-medium">MVC</span>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${pctLight}`}>{pctLabel}</span>
          <p className="text-[11px] text-gray-500 font-medium mt-2">{s.mr_name}</p>
        </div>

        {/* Status breakdown stacked bars */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-700 mb-0.5">Coverage Breakdown</p>
          <p className="text-[10px] text-gray-400 mb-3">Doctors by compliance status</p>
          {/* Visual stacked bar */}
          <div className="flex h-6 rounded-xl overflow-hidden mb-3 gap-0.5">
            {covered > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(covered/total)*100}%` }} title={`Covered: ${covered}`} />}
            {under > 0   && <div className="bg-orange-400 transition-all" style={{ width: `${(under/total)*100}%` }}   title={`Under: ${under}`} />}
            {missed > 0  && <div className="bg-red-400 transition-all"    style={{ width: `${(missed/total)*100}%` }}   title={`Missed: ${missed}`} />}
          </div>
          <div className="space-y-2">
            {[
              { label: "Fully Covered", value: covered, pct: Math.round((covered/total)*100), color: "text-emerald-700", bg: "bg-emerald-50", bar: "bg-emerald-500" },
              { label: "Under Covered", value: under,   pct: Math.round((under/total)*100),   color: "text-orange-700", bg: "bg-orange-50",  bar: "bg-orange-400" },
              { label: "Missed",        value: missed,  pct: Math.round((missed/total)*100),  color: "text-red-600",    bg: "bg-red-50",     bar: "bg-red-400"    },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${row.bar}`} />
                  <span className="text-[11px] text-gray-600 font-medium">{row.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold ${row.color}`}>{row.value}</span>
                  <span className="text-[10px] text-gray-400">({row.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500">Avg Compliance</span>
              <span className="text-xs font-bold" style={{ color: pctBg }}>{(s.avg_compliance || 0).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1.5">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.avg_compliance || 0}%`, backgroundColor: pctBg }} />
            </div>
          </div>
        </div>

        {/* Compliance bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-700 mb-0.5">Compliance % per Doctor</p>
          <p className="text-[10px] text-gray-400 mb-2">Hover for visit counts</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={complianceData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" domain={[0,100]} tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
                    <p className="font-bold text-gray-800 mb-1">{d?.fullName}</p>
                    <p className="text-gray-500">Visits: <span className="font-bold text-gray-900">{d?.actual}/{d?.required}</span></p>
                    <p className="text-gray-500">Compliance: <span className="font-bold" style={{ color: d?.fill }}>{d?.compliance?.toFixed(0)}%</span></p>
                  </div>
                );
              }} />
              <Bar dataKey="compliance" radius={[0,4,4,0]}>
                {complianceData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Doctor table with status filter ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-bold text-gray-900">Doctor Visit Coverage Details</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{doctors.length} assigned doctors · Required visits set by classification</p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { id: "all",     label: `All (${doctors.length})` },
              { id: "covered", label: `✅ Covered (${covered})` },
              { id: "under",   label: `⚠️ Under (${under})` },
              { id: "missed",  label: `❌ Missed (${missed})` },
            ].map((f) => (
              <button key={f.id} onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${statusFilter === f.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm font-medium">No doctors match this filter</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Doctor</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Class</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Required</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Done</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Compliance</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((d, i) => {
                  const compliance = d.compliance_percentage || 0;
                  const barColor   = d.status === "covered" ? "#10b981" : d.status === "under" ? "#f97316" : "#ef4444";
                  const statusStyle= d.status === "covered" ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                   : d.status === "under"   ? "bg-orange-50 text-orange-700 border-orange-100"
                                   :                          "bg-red-50 text-red-600 border-red-100";
                  const avt = d.status === "covered" ? "bg-emerald-100 text-emerald-600" : d.status === "missed" ? "bg-red-100 text-red-500" : "bg-orange-100 text-orange-600";
                  return (
                    <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${avt}`}>{d.doctor_name?.charAt(0)}</div>
                          <span className="font-semibold text-gray-800">{d.doctor_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded-full font-bold text-[9px] border ${d.classification === "A" ? "bg-red-50 text-red-600 border-red-100" : d.classification === "B" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-gray-50 text-gray-500 border-gray-200"}`}>{d.classification}</span>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-500 font-medium">{d.required_visits}</td>
                      <td className="px-3 py-3 text-center font-bold text-gray-900">{d.actual_visits}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, compliance)}%`, backgroundColor: barColor }} />
                          </div>
                          <span className="text-[10px] font-bold w-8 text-right" style={{ color: barColor }}>{compliance.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border capitalize ${statusStyle}`}>{d.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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
          <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold border border-purple-100 flex-shrink-0">
            {d.doctor_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">{d.doctor_name}</p>
            <p className="text-[11px] text-gray-400">{d.visits_count} visit{d.visits_count > 1 ? "s" : ""} · Last: {d.last_visit_date ? formatISTDate(d.last_visit_date) : "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border flex-shrink-0 ${d.classification === "A" ? "bg-red-50 text-red-600 border-red-200" : d.classification === "B" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>{d.classification}</span>
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
                    {v.rx_commitment != null && <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"><p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Rx Commitment</p><p className={"text-xs font-bold mt-0.5 " + (v.rx_commitment ? "text-emerald-700" : "text-gray-500")}>{v.rx_commitment ? `Yes (${v.expected_rx_per_month || "—"}/month)` : "No"}</p></div>}
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

// ── RCPA Summary Section (Admin) — Recharts powered ──────────────────────────

const PROD_COLORS  = ["#6366f1","#f97316","#10b981","#ec4899","#3b82f6","#a855f7","#14b8a6","#ef4444"];
const TERR_COLORS  = ["#a855f7","#3b82f6","#10b981","#f97316","#ec4899","#6366f1","#14b8a6","#ef4444"];
const MONTH_NAMES  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl px-4 py-3 text-xs min-w-[150px]">
      <p className="font-bold text-gray-600 mb-2 pb-1.5 border-b border-gray-100">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-gray-500">{p.name}</span>
          </div>
          <span className="font-bold text-gray-900">{(+p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function DrillBreadcrumb({ drillType, drillItem, onClear }) {
  if (!drillType) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs mb-4">
      <button onClick={onClear} className="text-indigo-500 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        Overview
      </button>
      <span className="text-indigo-300">/</span>
      <span className="text-indigo-400">{drillType === "product" ? "Products" : "Territories"}</span>
      <span className="text-indigo-300">/</span>
      <span className="font-bold text-indigo-700">{drillItem}</span>
    </div>
  );
}

function RCPASection({ month, year }) {
  const [drillType, setDrillType]             = useState(null);
  const [drillItem, setDrillItem]             = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedTerritory, setSelectedTerritory] = useState("all");
  const [activeView, setActiveView]           = useState("overview");

  const { data, isLoading, error } = useQuery({
    queryKey: ["sfe-rcpa-summary", month, year],
    queryFn:  () => get("/api/v1/sfe/rcpa/summary", { month, year }),
  });

  const trendMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(year, month - 1 - (5 - i));
    return { month: d.getMonth() + 1, year: d.getFullYear(), label: MONTH_NAMES[d.getMonth()] + " '" + d.getFullYear().toString().slice(2) };
  });

  const trendQueries = trendMonths.map((m) => useQuery({
    queryKey: ["sfe-rcpa-summary", m.month, m.year],
    queryFn:  () => get("/api/v1/sfe/rcpa/summary", { month: m.month, year: m.year }),
    staleTime: 5 * 60 * 1000,
  }));

  if (isLoading) return <LoadingSkeleton />;
  if (error)     return <ErrorBox message={error.message} />;

  const s           = data || {};
  const byProduct   = s.by_product   || [];
  const byTerritory = s.by_territory || [];

  const allProducts = [...new Set([
    ...byProduct.map((p) => p.product_name),
    ...trendQueries.flatMap((q) => (q.data?.by_product || []).map((p) => p.product_name)),
  ])];

  const allTerritories = [...new Set([
    ...byTerritory.map((t) => t.territory),
    ...trendQueries.flatMap((q) => (q.data?.by_territory || []).map((t) => t.territory)),
  ])];

  const trendData = trendMonths.map((m, mi) => {
    const qd  = trendQueries[mi]?.data || {};
    const row = { label: m.label, "Total Rx": qd.total_rx_per_month || qd.total_rx_per_week || 0, Doctors: qd.total_doctors || 0, Commitments: qd.total_commitments || 0 };
    allProducts.forEach((pname) => {
      const pf = (qd.by_product || []).find((p) => p.product_name === pname);
      row[pname] = pf ? (pf.rx_per_month || pf.rx_per_week || 0) : 0;
    });
    return row;
  });

  const productDrillData = trendMonths.map((m, mi) => {
    const qd = trendQueries[mi]?.data || {};
    const pf = (qd.by_product || []).find((p) => p.product_name === drillItem);
    return { label: m.label, "Rx/Month": pf ? (pf.rx_per_month || pf.rx_per_week || 0) : 0, Doctors: pf?.doctors_count || 0 };
  });

  const territoryDrillData = trendMonths.map((m, mi) => {
    const qd = trendQueries[mi]?.data || {};
    const tf = (qd.by_territory || []).find((t) => t.territory === drillItem);
    return { label: m.label, "Rx/Month": tf ? (tf.rx_per_month || tf.rx_per_week || 0) : 0, Doctors: tf?.doctors_count || 0, Products: tf?.products_count || 0 };
  });

  const totalCurrent = s.total_rx_per_month || s.total_rx_per_week || 0;
  const totalPrev    = trendQueries[4]?.data?.total_rx_per_month || trendQueries[4]?.data?.total_rx_per_week || 0;
  const growthPct    = totalPrev > 0 ? (((totalCurrent - totalPrev) / totalPrev) * 100).toFixed(1) : null;

  const productBarData = (selectedProduct === "all" ? byProduct : byProduct.filter((p) => p.product_name === selectedProduct))
    .map((p) => {
      const idx    = byProduct.findIndex((x) => x.product_name === p.product_name);
      const prevP  = trendQueries[4]?.data?.by_product?.find((x) => x.product_name === p.product_name);
      const prevRx = prevP ? (prevP.rx_per_month || prevP.rx_per_week || 0) : 0;
      return { name: p.product_name, "This Month": p.rx_per_month || p.rx_per_week || 0, "Last Month": prevRx, Doctors: p.doctors_count, fill: PROD_COLORS[idx % PROD_COLORS.length] };
    });

  const territoryBarData = (selectedTerritory === "all" ? byTerritory : byTerritory.filter((t) => t.territory === selectedTerritory))
    .map((t) => {
      const idx    = byTerritory.findIndex((x) => x.territory === t.territory);
      const prevT  = trendQueries[4]?.data?.by_territory?.find((x) => x.territory === t.territory);
      const prevRx = prevT ? (prevT.rx_per_month || prevT.rx_per_week || 0) : 0;
      return { name: t.territory, "This Month": t.rx_per_month || t.rx_per_week || 0, "Last Month": prevRx, Doctors: t.doctors_count, Products: t.products_count, fill: TERR_COLORS[idx % TERR_COLORS.length] };
    });

  const clearDrill = () => { setDrillType(null); setDrillItem(null); };

  // ── Product drill-down ────────────────────────────────────────────────────
  if (drillType === "product" && drillItem) {
    const color       = PROD_COLORS[allProducts.indexOf(drillItem) % PROD_COLORS.length];
    const currentRx   = productDrillData[5]?.["Rx/Month"] || 0;
    const prevRx      = productDrillData[4]?.["Rx/Month"] || 0;
    const drillGrowth = prevRx > 0 ? (((currentRx - prevRx) / prevRx) * 100).toFixed(1) : null;
    return (
      <div className="space-y-5">
        <DrillBreadcrumb drillType={drillType} drillItem={drillItem} onClear={clearDrill} />
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-extrabold" style={{ color }}>{currentRx.toLocaleString()}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Rx this month</p>
            {drillGrowth !== null && <p className={`text-[10px] font-bold mt-1 ${+drillGrowth >= 0 ? "text-emerald-600" : "text-red-500"}`}>{+drillGrowth >= 0 ? "▲" : "▼"}{Math.abs(drillGrowth)}% MoM</p>}
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-extrabold text-blue-600">{productDrillData[5]?.Doctors || 0}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Doctors prescribing</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-extrabold text-gray-800">{productDrillData.reduce((a, d) => a + (d["Rx/Month"] || 0), 0).toLocaleString()}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">6-month total Rx</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-900 mb-0.5">Rx/Month — 6-Month Trend</p>
            <p className="text-[11px] text-gray-400 mb-4">How prescription volume changed each month</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={productDrillData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gdProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={38} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Rx/Month" stroke={color} strokeWidth={2.5} fill="url(#gdProd)" dot={{ r: 4, fill: color }} activeDot={{ r: 7 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-900 mb-0.5">Doctors Prescribing</p>
            <p className="text-[11px] text-gray-400 mb-4">Number of doctors committing each month</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={productDrillData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Doctors" radius={[6, 6, 0, 0]} maxBarSize={44}>
                  {productDrillData.map((_, i) => <Cell key={i} fill={i === 5 ? color : `${color}55`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-900 mb-4">Month-by-Month Breakdown</p>
          <div className="grid grid-cols-6 gap-2">
            {productDrillData.map((d, i) => {
              const prev  = i > 0 ? productDrillData[i-1]["Rx/Month"] : null;
              const delta = prev != null && prev > 0 ? Math.round(((d["Rx/Month"] - prev) / prev) * 100) : null;
              const isLast = i === 5;
              return (
                <div key={i} className={`rounded-xl p-3 text-center border ${isLast ? "border-indigo-200 shadow-sm" : "border-gray-100"}`}
                  style={{ background: isLast ? `${color}15` : "#fafbfd" }}>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">{d.label}</p>
                  <p className="text-base font-extrabold mt-1" style={{ color: isLast ? color : "#374151" }}>{d["Rx/Month"]}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{d.Doctors} doc</p>
                  {delta !== null
                    ? <span className={`text-[9px] font-bold ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>{delta >= 0 ? "▲" : "▼"}{Math.abs(delta)}%</span>
                    : <span className="text-[9px] text-gray-300">—</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Territory drill-down ──────────────────────────────────────────────────
  if (drillType === "territory" && drillItem) {
    const color       = TERR_COLORS[allTerritories.indexOf(drillItem) % TERR_COLORS.length];
    const currentRx   = territoryDrillData[5]?.["Rx/Month"] || 0;
    const prevRx      = territoryDrillData[4]?.["Rx/Month"] || 0;
    const drillGrowth = prevRx > 0 ? (((currentRx - prevRx) / prevRx) * 100).toFixed(1) : null;
    return (
      <div className="space-y-5">
        <DrillBreadcrumb drillType={drillType} drillItem={drillItem} onClear={clearDrill} />
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-extrabold" style={{ color }}>{currentRx.toLocaleString()}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Rx this month</p>
            {drillGrowth !== null && <p className={`text-[10px] font-bold mt-1 ${+drillGrowth >= 0 ? "text-emerald-600" : "text-red-500"}`}>{+drillGrowth >= 0 ? "▲" : "▼"}{Math.abs(drillGrowth)}% MoM</p>}
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-extrabold text-blue-600">{territoryDrillData[5]?.Doctors || 0}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Doctors engaged</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-extrabold text-orange-600">{territoryDrillData[5]?.Products || 0}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Products active</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-900 mb-0.5">Rx/Month — 6-Month Trend</p>
            <p className="text-[11px] text-gray-400 mb-4">Prescription volume for {drillItem}</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={territoryDrillData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gdTerr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={38} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Rx/Month" stroke={color} strokeWidth={2.5} fill="url(#gdTerr)" dot={{ r: 4, fill: color }} activeDot={{ r: 7 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-900 mb-0.5">Doctors & Products Engaged</p>
            <p className="text-[11px] text-gray-400 mb-4">Monthly engagement depth for {drillItem}</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={territoryDrillData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="Doctors" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="Products" stroke="#f97316" strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 4 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-900 mb-4">Month-by-Month Breakdown</p>
          <div className="grid grid-cols-6 gap-2">
            {territoryDrillData.map((d, i) => {
              const prev  = i > 0 ? territoryDrillData[i-1]["Rx/Month"] : null;
              const delta = prev != null && prev > 0 ? Math.round(((d["Rx/Month"] - prev) / prev) * 100) : null;
              const isLast = i === 5;
              return (
                <div key={i} className={`rounded-xl p-3 text-center border ${isLast ? "border-purple-200 shadow-sm" : "border-gray-100"}`}
                  style={{ background: isLast ? `${color}15` : "#fafbfd" }}>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">{d.label}</p>
                  <p className="text-base font-extrabold mt-1" style={{ color: isLast ? color : "#374151" }}>{d["Rx/Month"]}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{d.Doctors}d · {d.Products}p</p>
                  {delta !== null
                    ? <span className={`text-[9px] font-bold ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>{delta >= 0 ? "▲" : "▼"}{Math.abs(delta)}%</span>
                    : <span className="text-[9px] text-gray-300">—</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Overview (default) ────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm"><span className="text-sm">📈</span></div>
            {growthPct !== null && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${+growthPct >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                {+growthPct >= 0 ? "▲" : "▼"}{Math.abs(growthPct)}%
              </span>
            )}
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{totalCurrent.toLocaleString()}</p>
          <p className="text-[11px] text-gray-400 font-medium">Total Rx/Month</p>
          <p className="text-[10px] text-gray-400 mt-0.5">prev: {totalPrev.toLocaleString()}</p>
        </div>
        <StatCard icon="💊" label="Commitments" value={s.total_commitments || 0} color="from-green-500 to-emerald-500" />
        <StatCard icon="🩺" label="Doctors"     value={s.total_doctors    || 0} color="from-blue-500 to-indigo-500" />
        <StatCard icon="📦" label="Products"    value={s.total_products   || 0} color="from-orange-500 to-red-500" />
      </div>

      {/* Section nav tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1">
        {[
          { id: "overview",    label: "📊 Overview",    sub: "Trends & summary"    },
          { id: "products",    label: "💊 Products",    sub: "Drug demand analysis" },
          { id: "territories", label: "🗺️ Territories", sub: "Region performance"  },
        ].map((v) => (
          <button key={v.id} onClick={() => setActiveView(v.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all text-center ${activeView === v.id ? "bg-purple-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>
            {v.label}
            <span className={`block text-[9px] font-normal mt-0.5 ${activeView === v.id ? "text-purple-200" : "text-gray-400"}`}>{v.sub}</span>
          </button>
        ))}
      </div>

      {/* ── OVERVIEW tab ─────────────────────────────────────────────────── */}
      {activeView === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-900 mb-0.5">Total Rx/Month — 6 Months</p>
              <p className="text-[11px] text-gray-400 mb-4">Overall prescription commitment volume</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={38} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="Total Rx" stroke="#6366f1" strokeWidth={2.5} fill="url(#gTotal)" dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }} activeDot={{ r: 7 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-900 mb-0.5">Doctor Engagement — 6 Months</p>
              <p className="text-[11px] text-gray-400 mb-4">Unique doctors with active commitments</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gDoc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="Doctors" stroke="#10b981" strokeWidth={2.5} fill="url(#gDoc)" dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 7 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* ── 6-Month Totals Summary Strip ──────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-gray-900">6-Month Summary</p>
                <p className="text-[11px] text-gray-400">Total Rx · Doctors · Commitments per month</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-indigo-600">{trendData.reduce((a, d) => a + (d["Total Rx"] || 0), 0).toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">6-month total Rx</p>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {trendData.map((d, i) => {
                const prevTotal = i > 0 ? trendData[i-1]["Total Rx"] : null;
                const delta     = prevTotal && prevTotal > 0 ? Math.round(((d["Total Rx"] - prevTotal) / prevTotal) * 100) : null;
                const isLast    = i === trendData.length - 1;
                return (
                  <div key={i} className={`rounded-xl p-3 border text-center transition-all ${isLast ? "bg-indigo-50 border-indigo-200 shadow-sm" : "bg-gray-50 border-gray-100"}`}>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">{d.label}</p>
                    <p className={`text-base font-extrabold mt-1 ${isLast ? "text-indigo-700" : "text-gray-800"}`}>
                      {(d["Total Rx"] || 0).toLocaleString()}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{d.Doctors || 0} doc</p>
                    <p className="text-[9px] text-gray-400">{d.Commitments || 0} commit</p>
                    {delta !== null ? (
                      <span className={`text-[9px] font-bold mt-0.5 block ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {delta >= 0 ? "▲" : "▼"}{Math.abs(delta)}%
                      </span>
                    ) : <span className="text-[9px] text-gray-300 block mt-0.5">—</span>}
                  </div>
                );
              })}
            </div>
            {/* Aggregate totals row */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">
              {[
                { label: "Total Rx (6 mo)", value: trendData.reduce((a, d) => a + (d["Total Rx"] || 0), 0).toLocaleString(), color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100" },
                { label: "Peak Doctors",    value: Math.max(...trendData.map((d) => d.Doctors || 0)), color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
                { label: "Total Commits",   value: trendData.reduce((a, d) => a + (d.Commitments || 0), 0).toLocaleString(), color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100" },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} rounded-xl p-3 border ${stat.border} text-center`}>
                  <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {allProducts.length > 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">All Products — Rx Trend Comparison</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Hover for values · click legend item to drill down</p>
                </div>
                <button onClick={() => setActiveView("products")}
                  className="text-xs text-purple-600 font-semibold bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 whitespace-nowrap">Deep Dive →</button>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={38} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", cursor: "pointer" }}
                    onClick={(e) => { setDrillType("product"); setDrillItem(e.value); }} />
                  {allProducts.map((p, i) => (
                    <Line key={p} type="monotone" dataKey={p} stroke={PROD_COLORS[i % PROD_COLORS.length]}
                      strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── PRODUCTS tab ─────────────────────────────────────────────────── */}
      {activeView === "products" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Filter Drug</label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium text-gray-700 focus:ring-2 focus:ring-purple-200 outline-none min-w-[160px]">
                <option value="all">All Products</option>
                {allProducts.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {selectedProduct !== "all" && (
              <button onClick={() => setSelectedProduct("all")} className="text-[11px] text-gray-400 hover:text-gray-600 font-medium">✕ Clear</button>
            )}
            <span className="text-[11px] text-gray-400 ml-auto hidden sm:block">Click a bar or card to drill into 6-month history</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-900 mb-0.5">Product Demand — This Month vs Last Month</p>
            <p className="text-[11px] text-gray-400 mb-4">Click any bar to see 6-month history for that drug</p>
            {productBarData.length === 0
              ? <p className="text-xs text-gray-400 text-center py-10">No data for this period.</p>
              : <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={productBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    onClick={(e) => { if (e?.activePayload?.[0]) { setDrillType("product"); setDrillItem(e.activePayload[0].payload.name); } }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f5f3ff" }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="This Month" radius={[6, 6, 0, 0]} maxBarSize={44} cursor="pointer">
                      {productBarData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                    <Bar dataKey="Last Month" radius={[6, 6, 0, 0]} maxBarSize={44} fill="#e0e7ff" />
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(selectedProduct === "all" ? byProduct : byProduct.filter((p) => p.product_name === selectedProduct)).map((p) => {
              const idx    = byProduct.findIndex((x) => x.product_name === p.product_name);
              const prevP  = trendQueries[4]?.data?.by_product?.find((x) => x.product_name === p.product_name);
              const prevRx = prevP ? (prevP.rx_per_month || prevP.rx_per_week || 0) : 0;
              const rx     = p.rx_per_month || p.rx_per_week || 0;
              const delta  = prevRx > 0 ? (((rx - prevRx) / prevRx) * 100).toFixed(0) : null;
              const color  = PROD_COLORS[idx % PROD_COLORS.length];
              return (
                <div key={p.product_name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: color }}>
                        {p.product_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">{p.product_name}</p>
                        <p className="text-[10px] text-gray-400">{p.doctors_count} doctor{p.doctors_count !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    {delta !== null && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${+delta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        {+delta >= 0 ? "▲" : "▼"}{Math.abs(delta)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-extrabold mb-0.5" style={{ color }}>{rx.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 mb-3">Rx/month · prev: {prevRx}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, prevRx > 0 ? (rx / Math.max(rx, prevRx)) * 100 : 100)}%`, backgroundColor: color }} />
                  </div>
                  <button onClick={() => { setDrillType("product"); setDrillItem(p.product_name); }}
                    className="w-full text-[11px] font-bold py-1.5 rounded-lg border transition-all hover:opacity-90"
                    style={{ borderColor: color, color, backgroundColor: `${color}10` }}>
                    View 6-Month Trend →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TERRITORIES tab ──────────────────────────────────────────────── */}
      {activeView === "territories" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Filter Territory</label>
              <select value={selectedTerritory} onChange={(e) => setSelectedTerritory(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium text-gray-700 focus:ring-2 focus:ring-purple-200 outline-none min-w-[160px]">
                <option value="all">All Territories</option>
                {allTerritories.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {selectedTerritory !== "all" && (
              <button onClick={() => setSelectedTerritory("all")} className="text-[11px] text-gray-400 hover:text-gray-600 font-medium">✕ Clear</button>
            )}
            <span className="text-[11px] text-gray-400 ml-auto hidden sm:block">Click a bar or card to drill into 6-month history</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-900 mb-0.5">Territory Demand — This Month vs Last Month</p>
            <p className="text-[11px] text-gray-400 mb-4">Click any bar to see 6-month history for that territory</p>
            {territoryBarData.length === 0
              ? <p className="text-xs text-gray-400 text-center py-10">No territory data for this period.</p>
              : <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={territoryBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    onClick={(e) => { if (e?.activePayload?.[0]) { setDrillType("territory"); setDrillItem(e.activePayload[0].payload.name); } }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "#faf5ff" }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="This Month" radius={[6, 6, 0, 0]} maxBarSize={50} cursor="pointer">
                      {territoryBarData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                    <Bar dataKey="Last Month" radius={[6, 6, 0, 0]} maxBarSize={50} fill="#e9d5ff" />
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(selectedTerritory === "all" ? byTerritory : byTerritory.filter((t) => t.territory === selectedTerritory)).map((t) => {
              const idx    = byTerritory.findIndex((x) => x.territory === t.territory);
              const prevT  = trendQueries[4]?.data?.by_territory?.find((x) => x.territory === t.territory);
              const prevRx = prevT ? (prevT.rx_per_month || prevT.rx_per_week || 0) : 0;
              const rx     = t.rx_per_month || t.rx_per_week || 0;
              const delta  = prevRx > 0 ? (((rx - prevRx) / prevRx) * 100).toFixed(0) : null;
              const color  = TERR_COLORS[idx % TERR_COLORS.length];
              return (
                <div key={t.territory} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: color }}>
                        {t.territory.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">{t.territory}</p>
                        <p className="text-[10px] text-gray-400">{t.doctors_count} doc · {t.products_count} prod</p>
                      </div>
                    </div>
                    {delta !== null && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${+delta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        {+delta >= 0 ? "▲" : "▼"}{Math.abs(delta)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-extrabold mb-0.5" style={{ color }}>{rx.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 mb-3">Rx/month · prev: {prevRx}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, prevRx > 0 ? (rx / Math.max(rx, prevRx)) * 100 : 100)}%`, backgroundColor: color }} />
                  </div>
                  <button onClick={() => { setDrillType("territory"); setDrillItem(t.territory); }}
                    className="w-full text-[11px] font-bold py-1.5 rounded-lg border transition-all hover:opacity-90"
                    style={{ borderColor: color, color, backgroundColor: `${color}10` }}>
                    View 6-Month Trend →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}


// ── Admin DCR Section ─────────────────────────────────────────────────────────
const MOOD_STYLES_ADMIN = {
  positive: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: "😊" },
  neutral:  { bg: "bg-amber-50 border-amber-200",    text: "text-amber-700",   icon: "😐" },
  negative: { bg: "bg-red-50 border-red-200",         text: "text-red-700",     icon: "😞" },
};

function AdminDCRSection() {
  const todayStr = () => new Date().toISOString().split("T")[0];
  const [mrId, setMrId]                   = useState("");
  const [selectedDate, setSelectedDate]   = useState(todayStr());
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const { data: mrs } = useQuery({
    queryKey: ["company-mrs"],
    queryFn: () => get("/api/v1/mrs").then((r) => r.mrs || []),
    staleTime: 5 * 60 * 1000,
  });

  const { data: visitsResponse, isLoading, error } = useQuery({
    queryKey: ["admin-dcr", mrId, selectedDate],
    queryFn: () => get(`/api/v1/visits?mr_id=${mrId}&date_from=${selectedDate}&date_to=${selectedDate}`),
    enabled: !!mrId,
    staleTime: 0,
  });

  // Monthly calendar for the MR
  const [yr, mo] = selectedDate.split("-").map(Number);
  const monthStart   = `${yr}-${String(mo).padStart(2,"0")}-01`;
  const daysInMonth  = new Date(yr, mo, 0).getDate();
  const monthEnd     = `${yr}-${String(mo).padStart(2,"0")}-${String(daysInMonth).padStart(2,"0")}`;
  const monthKey     = `${yr}-${String(mo).padStart(2,"0")}`;

  const { data: monthResponse } = useQuery({
    queryKey: ["admin-dcr-month", mrId, monthKey],
    queryFn: () => get(`/api/v1/visits?mr_id=${mrId}&date_from=${monthStart}&date_to=${monthEnd}`),
    enabled: !!mrId,
    staleTime: 5 * 60 * 1000,
  });

  const selectedMr  = (mrs || []).find((m) => (m.id || m._id) === mrId) || null;
  const allVisits   = visitsResponse?.visits || [];
  const completed   = allVisits.filter((v) => v.status === "completed");
  const monthVisits = monthResponse?.visits || [];

  // Stats
  const totalVisits    = completed.length;
  const totalSamples   = completed.reduce((a, v) => a + (v.report?.samples_given || 0), 0);
  const rxCommitments  = completed.filter((v) => v.report?.rx_commitment).length;
  const followUps      = completed.filter((v) => v.report?.follow_up_date).length;
  const competitorsMet = completed.filter((v) => v.report?.competitor_info).length;
  const moodCounts = { positive: 0, neutral: 0, negative: 0 };
  completed.forEach((v) => { if (v.report?.doctor_mood) moodCounts[v.report.doctor_mood] = (moodCounts[v.report.doctor_mood] || 0) + 1; });
  const productsSet = new Set();
  completed.forEach((v) => (v.report?.products_discussed || []).forEach((p) => productsSet.add(typeof p === "string" ? p : p.name)));
  const productsToday = [...productsSet];

  // Calendar map
  const dayMap = {};
  monthVisits.filter((v) => v.status === "completed").forEach((v) => {
    const d = v.scheduled_date || v.completed_at?.split("T")[0];
    if (d) dayMap[d] = (dayMap[d] || 0) + 1;
  });
  const calDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = `${yr}-${String(mo).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`;
    return { date: d, day: i+1, count: dayMap[d] || 0 };
  });

  const displayDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="space-y-5">

      {/* ── Controls Row ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Select MR</label>
            <div className="relative">
              <select value={mrId} onChange={(e) => setMrId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-white font-medium text-gray-700 focus:ring-2 focus:ring-purple-300 outline-none appearance-none pr-10">
                <option value="">Choose a Medical Representative…</option>
                {(mrs || []).map((m) => <option key={m.id || m._id} value={m.id || m._id}>{m.name || m.full_name} — {m.territory || ""}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Date</label>
            <input type="date" value={selectedDate} max={todayStr()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-4 py-3 bg-white font-medium text-gray-700 focus:ring-2 focus:ring-purple-300 outline-none" />
          </div>
          {mrId && (
            <button onClick={() => setShowPrintPreview(true)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-sm transition-all">
              🖨️ Print DCR
            </button>
          )}
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!mrId && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-12 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-purple-100">
            <span className="text-3xl">📋</span>
          </div>
          <p className="text-gray-700 font-bold text-sm mb-1">Select an MR and a date</p>
          <p className="text-gray-400 text-xs">View any MR's Daily Call Report for any date</p>
        </div>
      )}

      {mrId && (
        <>
          {/* ── MR Info + Calendar ───────────────────────────────────────── */}
          {selectedMr && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {selectedMr.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{selectedMr.name}</p>
                  <p className="text-xs text-gray-400">{selectedMr.territory} · {selectedMr.zone} · {selectedMr.state}</p>
                </div>
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                {new Date(yr, mo-1).toLocaleString("default", { month: "long", year: "numeric" })} — Visit Activity
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {calDays.map(({ date, day, count }) => {
                  const isSelected = date === selectedDate;
                  const isFuture   = date > todayStr();
                  return (
                    <button key={date} onClick={() => !isFuture && setSelectedDate(date)} disabled={isFuture}
                      className={`flex-shrink-0 w-9 h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all border ${
                        isSelected  ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : count > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : isFuture  ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                        :             "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                      }`}>
                      <span>{day}</span>
                      {count > 0 && !isSelected && <span className="w-1 h-1 bg-emerald-500 rounded-full mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isLoading && <LoadingSkeleton />}
          {error     && <ErrorBox message={error.message} />}

          {!isLoading && !error && totalVisits === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <span className="text-4xl block mb-3">📋</span>
              <p className="text-gray-600 font-bold text-sm mb-1">No completed visits on {displayDate}</p>
              <p className="text-gray-400 text-xs">Try a different date</p>
            </div>
          )}

          {!isLoading && totalVisits > 0 && (
            <>
              {/* Report Header */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-extrabold text-gray-900">📋 Daily Call Report</p>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">{displayDate}</p>
                    <p className="text-xs text-gray-400">Rep: {selectedMr?.name}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-xl text-center">
                    <p className="text-3xl font-extrabold text-emerald-700">{totalVisits}</p>
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase">Visits Done</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { label: "Visits",      value: totalVisits,    color: "text-purple-700", bg: "bg-purple-50 border-purple-100",  icon: "📅" },
                  { label: "Samples",     value: totalSamples,   color: "text-blue-700",   bg: "bg-blue-50 border-blue-100",      icon: "💉" },
                  { label: "Rx Commits",  value: rxCommitments,  color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-100",icon: "✅" },
                  { label: "Follow-ups",  value: followUps,      color: "text-orange-700", bg: "bg-orange-50 border-orange-100",  icon: "📆" },
                  { label: "Competitors", value: competitorsMet, color: "text-red-700",    bg: "bg-red-50 border-red-100",        icon: "⚔️" },
                  { label: "Products",    value: productsToday.length, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-100", icon: "💊" },
                ].map((s) => (
                  <div key={s.label} className={`rounded-2xl p-3 border text-center ${s.bg}`}>
                    <span className="text-lg block mb-1">{s.icon}</span>
                    <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Mood + Products */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <p className="text-xs font-bold text-gray-700 mb-3">😊 Doctor Mood Breakdown</p>
                  <div className="space-y-2">
                    {[
                      { key: "positive", label: "Positive", color: "bg-emerald-500" },
                      { key: "neutral",  label: "Neutral",  color: "bg-amber-400"   },
                      { key: "negative", label: "Negative", color: "bg-red-500"     },
                    ].map((m) => {
                      const count = moodCounts[m.key] || 0;
                      const pct   = totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0;
                      return (
                        <div key={m.key} className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-500 w-14">{m.label}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${m.color} transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-gray-700 w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <p className="text-xs font-bold text-gray-700 mb-3">💊 Products Discussed</p>
                  {productsToday.length === 0 ? (
                    <p className="text-xs text-gray-400">No products recorded</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {productsToday.map((p, i) => (
                        <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium border border-indigo-100">{p}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Visit details */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
                  <p className="text-sm font-bold text-gray-900">📋 Visit-by-Visit Details</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{totalVisits} visit{totalVisits !== 1 ? "s" : ""} · {displayDate}</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {completed.map((v, i) => {
                    const r    = v.report || {};
                    const mood = MOOD_STYLES_ADMIN[r.doctor_mood] || MOOD_STYLES_ADMIN.neutral;
                    return (
                      <div key={v.id} className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">{i+1}</div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{v.doctor_name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {v.location && <span className="text-[11px] text-gray-400">📍 {v.location}</span>}
                                {v.duration_minutes > 0 && <span className="text-[11px] text-gray-400">⏱️ {v.duration_minutes} min</span>}
                                {v.completed_at && <span className="text-[11px] text-gray-400">🕐 {formatISTTime(v.completed_at)}</span>}
                              </div>
                            </div>
                          </div>
                          {r.doctor_mood && (
                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${mood.bg} ${mood.text}`}>
                              {mood.icon} {r.doctor_mood}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100"><p className="text-[9px] text-gray-400 uppercase font-semibold">Purpose</p><p className="text-xs font-bold text-gray-700 mt-0.5">{v.purpose || "—"}</p></div>
                          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100"><p className="text-[9px] text-gray-400 uppercase font-semibold">Samples</p><p className="text-xs font-bold text-gray-700 mt-0.5">{r.samples_given ?? "—"}</p></div>
                          <div className={`rounded-lg p-2.5 border ${r.rx_commitment ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100"}`}><p className="text-[9px] text-gray-400 uppercase font-semibold">Rx Commit</p><p className={`text-xs font-bold mt-0.5 ${r.rx_commitment ? "text-emerald-700" : "text-gray-500"}`}>{r.rx_commitment ? `Yes · ${r.expected_rx_per_month || "—"}/mo` : "No"}</p></div>
                          <div className={`rounded-lg p-2.5 border ${r.follow_up_date ? "bg-orange-50 border-orange-100" : "bg-gray-50 border-gray-100"}`}><p className="text-[9px] text-gray-400 uppercase font-semibold">Follow-up</p><p className={`text-xs font-bold mt-0.5 ${r.follow_up_date ? "text-orange-700" : "text-gray-400"}`}>{r.follow_up_date ? formatISTDate(r.follow_up_date + "T00:00:00") : "None"}</p></div>
                        </div>
                        {(r.products_discussed || []).length > 0 && (
                          <div className="mb-3">
                            <p className="text-[9px] text-gray-400 uppercase font-semibold mb-1.5">Products Discussed</p>
                            <div className="flex flex-wrap gap-1.5">
                              {r.products_discussed.map((p, pi) => (
                                <span key={pi} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-100">{typeof p === "string" ? p : p.name}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          {r.outcome && <div className="bg-emerald-50 rounded-xl px-4 py-2.5 border border-emerald-100"><p className="text-[9px] text-emerald-600 uppercase font-semibold mb-0.5">Outcome</p><p className="text-xs text-emerald-800 font-medium">{r.outcome}</p></div>}
                          {r.competitor_info && <div className="bg-red-50 rounded-xl px-4 py-2.5 border border-red-100"><p className="text-[9px] text-red-500 uppercase font-semibold mb-0.5">Competitor Info</p><p className="text-xs text-red-700 font-medium">{r.competitor_info}</p></div>}
                          {r.notes && <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200"><p className="text-[9px] text-gray-400 uppercase font-semibold mb-0.5">Notes</p><p className="text-xs text-gray-600">{r.notes}</p></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {showPrintPreview && totalVisits > 0 && (
        <DCRPrintTemplate
          date={selectedDate}
          displayDate={new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
          mrInfo={selectedMr}
          mrName={selectedMr?.name || ""}
          completed={completed}
          moodCounts={moodCounts}
          productsToday={productsToday}
          totalSamples={totalSamples}
          rxCommits={rxCommitments}
          followUps={followUps}
          competitors={competitorsMet}
          generatedAt={new Date().toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true })}
          onClose={() => setShowPrintPreview(false)}
        />
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
