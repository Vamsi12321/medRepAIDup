"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Treemap } from "recharts";
import { get } from "@/lib/api";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#10b981", "#06b6d4", "#eab308", "#ef4444", "#14b8a6", "#f43f5e"];
const now = new Date();

export default function RegionsPage() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [level, setLevel] = useState("state");
  const [filter, setFilter] = useState({});
  const [view, setView] = useState("bar"); // "bar" | "treemap" | "cards" | "table"
  const [locationType, setLocationType] = useState(""); // "" | "hospital" | "solo_clinic" | "polyclinic"
  const [selectedLocation, setSelectedLocation] = useState(null); // for doctor drill-down

  const query = `/api/v1/analytics/regions?level=${level}&month=${month}&year=${year}${filter.state ? `&state=${filter.state}` : ""}${filter.district ? `&district=${filter.district}` : ""}${filter.area ? `&area=${filter.area}` : ""}${locationType ? `&location_type=${locationType}` : ""}`;
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-regions", level, filter, month, year, locationType],
    queryFn: () => get(query),
    staleTime: 7 * 60 * 1000,
  });
  const regionList = data?.regions || data || [];
  const totalRevenue = regionList.reduce((a, r) => a + (r.committed_revenue || 0), 0);
  const totalNet = regionList.reduce((a, r) => a + (r.net_revenue || 0), 0);
  const totalCommits = regionList.reduce((a, r) => a + (r.commitments || 0), 0);

  // Fetch doctors for selected location (hospital-level drill-down)
  const { data: doctorsData, isLoading: loadingDoctors } = useQuery({
    queryKey: ["analytics-regions-doctors", selectedLocation, month, year],
    queryFn: () => get(`/api/v1/analytics/location-doctors?location=${encodeURIComponent(selectedLocation)}&month=${month}&year=${year}`),
    enabled: !!selectedLocation,
    staleTime: 7 * 60 * 1000,
  });
  const doctors = Array.isArray(doctorsData) ? doctorsData : (doctorsData?.doctors || []);

  const drillInto = (name) => {
    if (level === "state") { setLevel("district"); setFilter({ state: name }); setSelectedLocation(null); }
    else if (level === "district") { setLevel("area"); setFilter({ ...filter, district: name }); setSelectedLocation(null); }
    else if (level === "area") { setLevel("hospital"); setFilter({ ...filter, area: name }); setSelectedLocation(null); }
    else if (level === "hospital") { setSelectedLocation(selectedLocation === name ? null : name); }
  };

  const levelLabel = level === "state" ? "States" : level === "district" ? "Districts" : level === "area" ? "Areas" : "Hospitals";

  return (
    <div className="space-y-5">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        {/* Row 1: Geographic drill-down breadcrumb */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1.5">Geographic Level</p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => { setLevel("state"); setFilter({}); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${level === "state" && !filter.state ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                All India
              </button>
              {filter.state && (
                <>
                  <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <button onClick={() => { setLevel("district"); setFilter({ state: filter.state }); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${level === "district" && !filter.district ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {filter.state}
                  </button>
                </>
              )}
              {filter.district && (
                <>
                  <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <button onClick={() => { setLevel("area"); setFilter({ state: filter.state, district: filter.district }); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${level === "area" && !filter.area ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {filter.district}
                  </button>
                </>
              )}
              {filter.area && (
                <>
                  <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-sm">{filter.area}</span>
                </>
              )}
            </div>
          </div>
          {/* Month/Year */}
          <div className="flex items-center gap-2">
            <select value={month} onChange={(e) => setMonth(+e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white font-medium">{Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{new Date(2026, i).toLocaleString("default", { month: "short" })}</option>)}</select>
            <select value={year} onChange={(e) => setYear(+e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white font-medium">{[2024,2025,2026,2027].map((y) => <option key={y} value={y}>{y}</option>)}</select>
          </div>
        </div>

        {/* Row 2: Location type filter + View toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1.5">Filter by Type</p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => { setLevel("hospital"); setFilter({}); setLocationType(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${level === "hospital" && !locationType ? "bg-gray-800 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                All
              </button>
              <button onClick={() => { setLevel("hospital"); setFilter({}); setLocationType("hospital"); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${locationType === "hospital" ? "bg-blue-600 text-white shadow-sm" : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"}`}>
                🏥 Hospitals
              </button>
              <button onClick={() => { setLevel("hospital"); setFilter({}); setLocationType("solo_clinic"); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${locationType === "solo_clinic" ? "bg-emerald-600 text-white shadow-sm" : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"}`}>
                🩺 Clinics
              </button>
              <button onClick={() => { setLevel("hospital"); setFilter({}); setLocationType("polyclinic"); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${locationType === "polyclinic" ? "bg-purple-600 text-white shadow-sm" : "bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100"}`}>
                🏢 Polyclinics
              </button>
            </div>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView("bar")} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${view === "bar" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>📊 Bar</button>
            <button onClick={() => setView("treemap")} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${view === "treemap" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>🗂️ Treemap</button>
            <button onClick={() => setView("cards")} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${view === "cards" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>📋 Cards</button>
            <button onClick={() => setView("table")} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${view === "table" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>📑 Table</button>
          </div>
        </div>
        {/* Summary strip */}
        {regionList.length > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 bg-indigo-500 rounded-full" /><span className="text-gray-400">Total:</span><span className="font-bold text-gray-800">₹{totalRevenue.toLocaleString()}</span></div>
            <div className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 bg-emerald-500 rounded-full" /><span className="text-gray-400">Net:</span><span className="font-bold text-emerald-700">₹{totalNet.toLocaleString()}</span></div>
            <div className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 bg-purple-500 rounded-full" /><span className="text-gray-400">Commits:</span><span className="font-bold text-gray-800">{totalCommits}</span></div>
            <div className="ml-auto text-[10px] text-gray-400 font-medium">{regionList.length} {levelLabel}</div>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map((i) => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-gray-100" />)}</div>}

      {/* Empty */}
      {!isLoading && regionList.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <span className="text-4xl block mb-3">🗺️</span>
          <p className="text-sm text-gray-500 font-medium">No region data for this period</p>
          <p className="text-xs text-gray-400 mt-1">Create RCPA commitments to see geographic revenue distribution</p>
        </div>
      )}

      {/* Bar Chart View */}
      {!isLoading && regionList.length > 0 && view === "bar" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-900 mb-4">Revenue by {levelLabel}</p>
          <ResponsiveContainer width="100%" height={Math.max(120, regionList.length * 40)}>
            <BarChart data={regionList.slice(0, 10)} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Bar dataKey="committed_revenue" name="Revenue" radius={[0, 8, 8, 0]} maxBarSize={28} cursor="pointer"
                onClick={(data) => drillInto(data.name)}>
                {regionList.slice(0, 10).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {level !== "hospital" && <p className="text-[10px] text-indigo-500 font-medium mt-2 text-center">Click a bar to drill down</p>}
          {level === "hospital" && <p className="text-[10px] text-indigo-500 font-medium mt-2 text-center">Click a bar to view doctors</p>}
          {/* Doctor panel below bar chart */}
          {selectedLocation && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <DoctorExpansionPanel doctors={doctors} loading={loadingDoctors} locationName={selectedLocation} />
            </div>
          )}
        </div>
      )}

      {/* Treemap View */}
      {!isLoading && regionList.length > 0 && view === "treemap" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-900 mb-4">Revenue Treemap — {levelLabel}</p>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(140px, 1fr))`, gridAutoRows: "1fr" }}>
            {regionList.map((r, i) => {
              const pct = totalRevenue > 0 ? (r.committed_revenue || 0) / totalRevenue : 0;
              const minH = 80;
              const h = Math.max(minH, Math.round(pct * 400 + 80));
              const isSelected = level === "hospital" && selectedLocation === r.name;
              return (
                <div key={i}
                  onClick={() => drillInto(r.name)}
                  className={`rounded-xl flex flex-col items-center justify-center p-3 text-white text-center transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer ${isSelected ? "ring-4 ring-white/80 scale-[1.03]" : ""}`}
                  style={{ backgroundColor: COLORS[i % COLORS.length], minHeight: `${h}px` }}>
                  <p className="text-base font-extrabold leading-tight" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                    {r.name}
                  </p>
                  <p className="text-sm font-bold mt-1 opacity-90">₹{(r.committed_revenue || 0).toLocaleString()}</p>
                  <p className="text-[10px] mt-1 opacity-70">{r.commitments} commits · {r.doctors} docs</p>
                </div>
              );
            })}
          </div>
          {level !== "hospital" && <p className="text-[10px] text-indigo-500 font-medium mt-3 text-center">Click a block to drill down</p>}
          {level === "hospital" && <p className="text-[10px] text-indigo-500 font-medium mt-3 text-center">Click a block to view doctors</p>}
          {/* Doctor panel below treemap */}
          {selectedLocation && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <DoctorExpansionPanel doctors={doctors} loading={loadingDoctors} locationName={selectedLocation} />
            </div>
          )}
        </div>
      )}

      {/* Cards View */}
      {!isLoading && regionList.length > 0 && view === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regionList.map((r, i) => {
            const pct = totalRevenue > 0 ? ((r.committed_revenue || 0) / totalRevenue * 100).toFixed(1) : 0;
            const isExpanded = level === "hospital" && selectedLocation === r.name;
            return (
              <div key={i}
                onClick={() => drillInto(r.name)}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer ${isExpanded ? "border-indigo-300 ring-2 ring-indigo-100 col-span-1 sm:col-span-2 lg:col-span-3" : "border-gray-100"}`}>
                {/* Color bar */}
                <div className="h-1.5 w-full" style={{ background: COLORS[i % COLORS.length] }} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{r.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{r.commitments} commits · {r.doctors} docs · {r.mrs} MRs</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">{pct}%</span>
                  </div>
                  {/* Revenue bars */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-gray-400 font-medium">Committed</span>
                        <span className="font-bold text-indigo-700">₹{(r.committed_revenue || 0).toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${totalRevenue > 0 ? (r.committed_revenue / totalRevenue * 100) : 0}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-gray-400 font-medium">Net</span>
                        <span className="font-bold text-emerald-700">₹{(r.net_revenue || 0).toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${totalRevenue > 0 ? ((r.net_revenue || 0) / totalRevenue * 100) : 0}%` }} />
                      </div>
                    </div>
                  </div>
                  {level !== "hospital" && (
                    <p className="text-[10px] text-indigo-500 font-semibold mt-3 flex items-center gap-1">
                      Drill into {level === "state" ? "districts" : level === "district" ? "areas" : "hospitals"}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </p>
                  )}
                  {level === "hospital" && !isExpanded && (
                    <p className="text-[10px] text-indigo-500 font-semibold mt-3 flex items-center gap-1">
                      View doctors
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </p>
                  )}
                </div>
                {/* Doctor expansion */}
                {isExpanded && (
                  <DoctorExpansionPanel doctors={doctors} loading={loadingDoctors} locationName={r.name} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {!isLoading && regionList.length > 0 && view === "table" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase text-[10px]">#</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase text-[10px]">{level === "state" ? "State" : level === "district" ? "District" : level === "area" ? "Area" : "Location"}</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Commits</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Doctors</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">MRs</th>
                  <th className="text-right px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Revenue</th>
                  <th className="text-right px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Net</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px]">Share</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-500 uppercase text-[10px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {regionList.map((r, i) => {
                  const pct = totalRevenue > 0 ? ((r.committed_revenue || 0) / totalRevenue * 100).toFixed(1) : 0;
                  const isExpanded = level === "hospital" && selectedLocation === r.name;
                  return (
                    <React.Fragment key={i}>
                      <tr className={`hover:bg-indigo-50/30 transition-colors ${isExpanded ? "bg-indigo-50/40" : ""}`}>
                        <td className="px-4 py-3 text-gray-400 font-mono text-[10px]">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="font-semibold text-gray-800">{r.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600">{r.commitments}</td>
                        <td className="px-3 py-3 text-center text-gray-600">{r.doctors}</td>
                        <td className="px-3 py-3 text-center text-gray-600">{r.mrs}</td>
                        <td className="px-3 py-3 text-right font-bold text-indigo-700">₹{(r.committed_revenue || 0).toLocaleString()}</td>
                        <td className="px-3 py-3 text-right font-bold text-emerald-700">₹{(r.net_revenue || 0).toLocaleString()}</td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center gap-1.5 justify-center">
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} /></div>
                            <span className="text-[9px] text-gray-500 font-medium w-8">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button onClick={() => drillInto(r.name)} className="text-[10px] text-indigo-600 font-semibold hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all">
                            {level === "hospital" ? (isExpanded ? "Close ↑" : "Doctors ↓") : "Drill →"}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="p-0">
                            <DoctorExpansionPanel doctors={doctors} loading={loadingDoctors} locationName={r.name} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Doctor Expansion Panel ───────────────────────────────────────────────────
function DoctorExpansionPanel({ doctors, loading, locationName }) {
  if (loading) {
    return (
      <div className="px-5 py-4 bg-indigo-50/30 border-t border-indigo-100">
        <div className="flex items-center gap-2 text-xs text-indigo-600">
          <span className="animate-spin">⏳</span>
          Loading doctors at {locationName}...
        </div>
      </div>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">No doctor revenue data for this location this month</p>
      </div>
    );
  }

  const maxRev = Math.max(...doctors.map((d) => d.committed_revenue || 0), 1);

  return (
    <div className="px-5 py-4 bg-indigo-50/30 border-t border-indigo-100 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
          <span>🩺</span> Doctors at {locationName}
        </p>
        <span className="text-[10px] text-gray-400 font-medium">{doctors.length} doctor{doctors.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="space-y-1.5">
        {doctors.map((doc, idx) => {
          const pct = maxRev > 0 ? ((doc.committed_revenue || 0) / maxRev * 100) : 0;
          return (
            <div key={doc.doctor_id || idx} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-gray-100 hover:border-indigo-200 transition-all">
              {/* Rank */}
              <span className="text-[10px] font-mono text-gray-400 w-5 text-center">{idx + 1}</span>
              {/* Name & commits */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{doc.doctor_name || "Unknown"}</p>
                <p className="text-[10px] text-gray-400">{doc.commitments || 0} commitment{(doc.commitments || 0) !== 1 ? "s" : ""}</p>
              </div>
              {/* Revenue bar */}
              <div className="w-24 hidden sm:block">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
              {/* Revenue figures */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold text-indigo-700">₹{(doc.committed_revenue || 0).toLocaleString()}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Net: ₹{(doc.net_revenue || 0).toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
