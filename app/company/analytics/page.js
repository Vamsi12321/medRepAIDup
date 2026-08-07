"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { get } from "@/lib/api";

const now = new Date();
const CM = now.getMonth() + 1;
const CY = now.getFullYear();

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-3 py-2 shadow-lg">
      <p className="text-[10px] font-bold text-gray-600 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px]">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-bold text-gray-800">{typeof p.value === "number" ? (p.value > 999 ? `₹${(p.value/1000).toFixed(1)}K` : p.value.toLocaleString()) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsOverview() {
  const [month, setMonth] = useState(CM);
  const [year, setYear] = useState(CY);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["analytics-dashboard", month, year],
    queryFn: () => get(`/api/v1/analytics/dashboard?month=${month}&year=${year}`),
    staleTime: 7 * 60 * 1000,
  });
  const { data: trends } = useQuery({
    queryKey: ["analytics-trends"],
    queryFn: () => get("/api/v1/analytics/trends?months=6"),
    staleTime: 7 * 60 * 1000,
  });

  const d = dashboard || {};
  const t = trends || {};

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-end gap-2">
        <select value={month} onChange={(e) => setMonth(+e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium focus:ring-2 focus:ring-indigo-200 outline-none">
          {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{new Date(2026, i).toLocaleString("default", { month: "long" })}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(+e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium focus:ring-2 focus:ring-indigo-200 outline-none">
          {[2024,2025,2026,2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* KPI Row */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map((i) => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100" />)}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">💰</span>
              {d.mom_growth != null && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.mom_growth >= 0 ? "bg-white/20" : "bg-red-400/30"}`}>{d.mom_growth >= 0 ? "▲" : "▼"}{Math.abs(d.mom_growth).toFixed(1)}%</span>}
            </div>
            <p className="text-2xl font-extrabold">₹{(d.committed_revenue || 0).toLocaleString()}</p>
            <p className="text-xs text-indigo-200 mt-1">Committed Revenue</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">📈</span>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">-₹{(d.discount_given || 0).toLocaleString()}</span>
            </div>
            <p className="text-2xl font-extrabold">₹{(d.net_revenue || 0).toLocaleString()}</p>
            <p className="text-xs text-emerald-200 mt-1">Net Revenue</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">📋</span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{d.pending_approvals || 0} pending</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{d.total_commitments || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Total Commitments</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">👥</span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{d.active_drugs || 0} drugs</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{d.active_mrs || 0} <span className="text-sm font-medium text-gray-400">MRs</span></p>
            <p className="text-xs text-gray-400 mt-1">{d.active_doctors || 0} Doctors active</p>
          </div>
        </div>
      )}

      {/* Secondary Metrics — inline horizontal strip */}
      {!isLoading && d.total_commitments != null && (
        <div className="flex items-center gap-4 px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-gray-400">Approved:</span>
            <span className="font-bold text-emerald-700">{d.approved || 0}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-400">Rejected:</span>
            <span className="font-bold text-red-600">{d.rejected || 0}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-gray-400">Pending Rev:</span>
            <span className="font-bold text-amber-700">₹{(d.pending_revenue || 0).toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-gray-400">Discount:</span>
            <span className="font-bold text-purple-700">₹{(d.discount_given || 0).toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-gray-400">Today:</span>
            <span className="font-bold text-emerald-600">+{d.approved_today || 0}✓</span>
            <span className="font-bold text-red-500">+{d.rejected_today || 0}✕</span>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      {t.revenue_trend && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Revenue Trend — spans 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-sm font-bold text-gray-900">Revenue Trend</p><p className="text-[11px] text-gray-400">Committed vs Net — last 6 months</p></div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={t.revenue_trend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => v > 999 ? `₹${(v/1000).toFixed(0)}K` : v} />
                <Tooltip content={<Tip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="committed" name="Committed" stroke="#6366f1" strokeWidth={2.5} fill="url(#gC)" dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="net" name="Net" stroke="#10b981" strokeWidth={2.5} strokeDasharray="5 3" fill="none" dot={{ r: 4, fill: "#10b981" }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Commitments + Approvals stacked */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-900 mb-1">Commitments</p>
              <p className="text-[11px] text-gray-400 mb-3">Monthly count</p>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={t.commitment_trend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 8, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Tooltip content={<Tip />} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-900 mb-1">Approvals</p>
              <p className="text-[11px] text-gray-400 mb-3">Approved vs Rejected</p>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={t.approval_trend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 8, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                  <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={16} stackId="a" />
                  <Bar dataKey="rejected" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={16} stackId="a" />
                  <Tooltip content={<Tip />} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
