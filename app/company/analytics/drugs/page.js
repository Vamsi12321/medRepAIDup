"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { get } from "@/lib/api";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#10b981", "#06b6d4", "#eab308", "#ef4444"];
const now = new Date();

export default function DrugsPage() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("committed_revenue");
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics-drugs", month, year],
    queryFn: () => get(`/api/v1/analytics/drugs?month=${month}&year=${year}`),
    staleTime: 7 * 60 * 1000,
  });
  const raw = data?.drugs || data || [];

  const drugList = useMemo(() => {
    let list = [...raw];
    if (search.trim()) list = list.filter((d) => d.drug_name?.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
    return list;
  }, [raw, search, sortBy]);

  const displayed = showAll ? drugList : drugList.slice(0, 10);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="relative flex-1 max-w-xs">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search drugs..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-200 bg-white" />
          <svg className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium">
            <option value="committed_revenue">Revenue</option>
            <option value="commitments">Commitments</option>
            <option value="rx_per_month">Rx/Month</option>
            <option value="avg_discount">Discount</option>
          </select>
          <select value={month} onChange={(e) => setMonth(+e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium">{Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{new Date(2026, i).toLocaleString("default", { month: "short" })}</option>)}</select>
          <select value={year} onChange={(e) => setYear(+e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium">{[2024,2025,2026,2027].map((y) => <option key={y} value={y}>{y}</option>)}</select>
        </div>
      </div>

      {/* Chart + Table layout */}
      {isLoading ? <div className="h-64 bg-white rounded-2xl animate-pulse border border-gray-100" /> : drugList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><span className="text-4xl block mb-3">💊</span><p className="text-sm text-gray-500">No drug data for this period</p></div>
      ) : (
        <>
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-900 mb-4">Top Drugs by {sortBy === "committed_revenue" ? "Revenue" : sortBy === "commitments" ? "Commitments" : sortBy === "rx_per_month" ? "Rx/Month" : "Discount %"}</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={drugList.slice(0, 8)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => sortBy === "committed_revenue" ? `₹${(v/1000).toFixed(0)}K` : String(v)} />
                <YAxis type="category" dataKey="drug_name" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip formatter={(v) => sortBy === "committed_revenue" ? `₹${v.toLocaleString()}` : v} />
                <Bar dataKey={sortBy} name={sortBy === "committed_revenue" ? "Revenue" : sortBy === "commitments" ? "Commitments" : sortBy === "rx_per_month" ? "Rx/Month" : "Discount %"} radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {drugList.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-800">All Drugs ({drugList.length})</p>
              {drugList.length > 10 && <button onClick={() => setShowAll(!showAll)} className="text-xs text-indigo-600 font-semibold hover:underline">{showAll ? "Show less" : `Show all ${drugList.length}`}</button>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase text-[10px]">#</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase text-[10px]">Drug</th>
                    <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Commits</th>
                    <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Qty</th>
                    <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Rx/Mo</th>
                    <th className="text-right px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Revenue</th>
                    <th className="text-right px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Net</th>
                    <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Disc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayed.map((dr, i) => (
                    <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-mono text-[10px]">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ background: COLORS[i % COLORS.length] }}>{dr.drug_name?.charAt(0)}</div>
                          <span className="font-semibold text-gray-800">{dr.drug_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{dr.commitments}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{dr.committed_quantity}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{dr.rx_per_month}</td>
                      <td className="px-3 py-3 text-right font-bold text-indigo-700">₹{(dr.committed_revenue || 0).toLocaleString()}</td>
                      <td className="px-3 py-3 text-right font-bold text-emerald-700">₹{(dr.net_revenue || 0).toLocaleString()}</td>
                      <td className="px-3 py-3 text-center"><span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-100">{dr.avg_discount?.toFixed(1) || 0}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
