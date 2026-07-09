"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { get } from "@/lib/api";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#10b981", "#06b6d4", "#eab308", "#ef4444"];
const now = new Date();

function InfoBadge({ label, value, color = "bg-indigo-50 text-indigo-700 border-indigo-100", tooltip }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <div className={`px-2.5 py-1.5 rounded-xl border text-center cursor-default ${color}`}>
        <p className="text-[9px] font-bold uppercase tracking-wide opacity-70">{label}</p>
        <p className="text-sm font-extrabold mt-0.5">{value}</p>
      </div>
      {show && tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-gray-900 text-white text-[10px] rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

export default function DoctorsPage() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("committed_revenue");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics-doctors", month, year],
    queryFn: () => get(`/api/v1/analytics/doctors?month=${month}&year=${year}`),
    staleTime: 3 * 60 * 1000,
  });
  const raw = data?.doctors || data || [];

  const doctorList = useMemo(() => {
    let list = [...raw];
    if (search.trim()) list = list.filter((d) => d.doctor_name?.toLowerCase().includes(search.toLowerCase()) || d.mr_name?.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
    return list;
  }, [raw, search, sortBy]);

  const displayed = showAll ? doctorList : doctorList.slice(0, 15);
  const maxRevenue = Math.max(...doctorList.map((d) => d.committed_revenue || 0), 1);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="relative flex-1 max-w-xs">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctors or MR..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-200 bg-white" />
          <svg className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium">
            <option value="committed_revenue">Revenue</option>
            <option value="commitments">Commitments</option>
            <option value="avg_discount">Discount</option>
          </select>
          <select value={month} onChange={(e) => setMonth(+e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium">{Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{new Date(2026, i).toLocaleString("default", { month: "short" })}</option>)}</select>
          <select value={year} onChange={(e) => setYear(+e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium">{[2024,2025,2026,2027].map((y) => <option key={y} value={y}>{y}</option>)}</select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">Doctors ({doctorList.length}) <span className="text-[10px] text-indigo-400 font-normal">click a row to see details</span></p>
            {doctorList.length > 15 && <button onClick={() => setShowAll(!showAll)} className="text-xs text-indigo-600 font-semibold hover:underline">{showAll ? "Show less" : `Show all ${doctorList.length}`}</button>}
          </div>
          {isLoading ? <div className="h-32 animate-pulse bg-gray-50" /> : doctorList.length === 0 ? (
            <div className="text-center py-12"><span className="text-3xl block mb-2">🩺</span><p className="text-sm text-gray-500">No data</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-100 sticky top-0"><tr>
                  <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase text-[10px]">#</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase text-[10px]">Doctor</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Commits</th>
                  <th className="text-right px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Revenue</th>
                  <th className="text-right px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Net</th>
                  <th className="px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Share</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {displayed.map((doc, i) => {
                    const pct = (((doc.committed_revenue || 0) / maxRevenue) * 100).toFixed(0);
                    const isSelected = selected?.doctor_name === doc.doctor_name;
                    return (
                      <tr key={i} onClick={() => setSelected(isSelected ? null : doc)}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-indigo-50 border-l-2 border-l-indigo-500" : "hover:bg-indigo-50/30"}`}>
                        <td className="px-4 py-3 text-gray-400 font-mono text-[10px]">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">{doc.doctor_name?.charAt(0)}</div>
                            <div><p className="font-semibold text-gray-800">{doc.doctor_name}</p><p className="text-[9px] text-gray-400">{doc.mr_name || "—"}</p></div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600">{doc.commitments}</td>
                        <td className="px-3 py-3 text-right font-bold text-indigo-700">₹{(doc.committed_revenue || 0).toLocaleString()}</td>
                        <td className="px-3 py-3 text-right font-bold text-emerald-700">₹{(doc.net_revenue || 0).toLocaleString()}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                            <span className="text-[9px] text-gray-400 w-6">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5 space-y-4 sticky top-20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">{selected.doctor_name?.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selected.doctor_name}</p>
                    <p className="text-[10px] text-gray-400">via {selected.mr_name || "—"}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-lg">×</button>
              </div>

              {/* Info badges with tooltips */}
              <div className="grid grid-cols-2 gap-2">
                <InfoBadge label="Revenue" value={`₹${(selected.committed_revenue || 0).toLocaleString()}`} color="bg-indigo-50 text-indigo-700 border-indigo-100" tooltip="Total committed revenue from this doctor" />
                <InfoBadge label="Net" value={`₹${(selected.net_revenue || 0).toLocaleString()}`} color="bg-emerald-50 text-emerald-700 border-emerald-100" tooltip="Revenue after approved discount" />
                <InfoBadge label="Commits" value={selected.commitments || 0} color="bg-purple-50 text-purple-700 border-purple-100" tooltip="Number of RCPA commitments" />
                <InfoBadge label="Avg Disc" value={`${(selected.avg_discount || 0).toFixed(1)}%`} color="bg-amber-50 text-amber-700 border-amber-100" tooltip="Average discount requested by this doctor" />
              </div>

              {/* Top drug */}
              {selected.most_prescribed_drug && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Most Committed Drug</p>
                  <p className="text-xs font-bold text-gray-800">💊 {selected.most_prescribed_drug}</p>
                </div>
              )}

              {/* Revenue vs Net bar chart */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Revenue Breakdown</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={[
                    { name: "Committed", value: selected.committed_revenue || 0 },
                    { name: "Net", value: selected.net_revenue || 0 },
                    { name: "Discount", value: (selected.committed_revenue || 0) - (selected.net_revenue || 0) },
                  ]} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={36}>
                      <Cell fill="#6366f1" />
                      <Cell fill="#10b981" />
                      <Cell fill="#f97316" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center sticky top-20">
              <span className="text-3xl block mb-3">🩺</span>
              <p className="text-sm text-gray-500 font-medium">Select a doctor</p>
              <p className="text-xs text-gray-400 mt-1">Click any row to see detailed breakdown</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
