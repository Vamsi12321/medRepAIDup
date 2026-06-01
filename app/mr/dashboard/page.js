"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { formatISTDate } from "@/lib/time";
import { get } from "@/lib/api";

const STATUS_STYLES = {
  scheduled:   { dot: "bg-blue-500", label: "Scheduled", color: "text-blue-700 bg-blue-50 border-blue-100" },
  checked_in:  { dot: "bg-amber-500", label: "In Progress", color: "text-amber-700 bg-amber-50 border-amber-100" },
  checked_out: { dot: "bg-purple-500", label: "Report Due", color: "text-purple-700 bg-purple-50 border-purple-100" },
  completed:   { dot: "bg-emerald-500", label: "Done", color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  cancelled:   { dot: "bg-red-400", label: "Cancelled", color: "text-red-600 bg-red-50 border-red-100" },
};

export default function MRDashboard() {
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "MR" : "MR";
  const [currentDate, setCurrentDate] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening");
    setCurrentDate(new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["mr-dashboard"],
    queryFn: () => get("/api/v1/dashboard"),
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const mrId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const { data: mrProfile } = useQuery({
    queryKey: ["my-mr-profile"],
    queryFn: () => get(`/api/v1/mrs/${mrId}`),
    enabled: !!mrId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  const territory = mrProfile?.territory || "";

  const stats = data?.statistics || {};
  const upcomingVisits = data?.upcoming_visits || [];
  const recentVisits = data?.recent_visits || [];
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = upcomingVisits.filter((v) => v.scheduled_date?.startsWith(todayStr)).length;
  const completionNum = parseInt(stats.completion_rate) || 0;
  const showLoading = isLoading && !data;

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <MRNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumb />

        {/* ═══ Welcome Row ═══ */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{currentDate}</p>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{greeting}, {userName}</h1>
            {territory && (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                {territory}
              </p>
            )}
          </div>
          <Link href="/mr/visits">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
              ➕ Schedule Visit
            </button>
          </Link>
        </div>

        {/* ═══ Highlight Cards Row ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Today card */}
          <div className="bg-white rounded-2xl p-5 border border-orange-200 shadow-sm">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2"><span className="text-sm">📅</span></div>
            <p className="text-2xl font-extrabold text-orange-600">{showLoading ? "—" : todayCount}</p>
            <p className="text-[11px] text-gray-400 font-medium">Today's Visits</p>
          </div>

          {/* Other stats */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-2"><span className="text-sm">🩺</span></div>
            <p className="text-2xl font-extrabold text-gray-900">{showLoading ? "—" : stats.assigned_doctors ?? "—"}</p>
            <p className="text-[11px] text-gray-400 font-medium">Doctors</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-2"><span className="text-sm">📋</span></div>
            <p className="text-2xl font-extrabold text-gray-900">{showLoading ? "—" : stats.total_visits ?? "—"}</p>
            <p className="text-[11px] text-gray-400 font-medium">Total Visits</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center mb-2"><span className="text-sm">🎯</span></div>
            <p className="text-2xl font-extrabold text-gray-900">{showLoading ? "—" : stats.completion_rate ?? "—"}</p>
            <p className="text-[11px] text-gray-400 font-medium">Completion</p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full transition-all duration-1000" style={{ width: `${completionNum}%` }} />
            </div>
          </div>
        </div>

        {/* ═══ Quick Actions ═══ */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { label: "SFE Report", href: "/mr/sfe", icon: "📊" },
            { label: "Drug Search", href: "/mr/drug-search", icon: "🔍" },
            { label: "My Doctors", href: "/mr/doctors", icon: "🩺" },
            { label: "Grievance", href: "/mr/grievance", icon: "📝" },
          ].map((a, i) => (
            <Link key={i} href={a.href}>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600 transition-all hover:-translate-y-0.5 hover:shadow-sm">
                <span>{a.icon}</span><span>{a.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* ═══ Main Content ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Upcoming Visits (Left 2 cols) ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Upcoming Visits</h2>
              <Link href="/mr/visits" className="text-xs text-orange-500 font-bold hover:text-orange-600 transition-colors">View all →</Link>
            </div>

            {showLoading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-[76px] bg-white rounded-2xl animate-pulse border border-gray-100" />)}</div>
            ) : upcomingVisits.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-12 text-center">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-orange-100">
                  <span className="text-2xl">📅</span>
                </div>
                <p className="text-gray-800 font-bold text-sm mb-1">No visits scheduled</p>
                <p className="text-gray-400 text-xs mb-5">Plan your next doctor visit</p>
                <Link href="/mr/visits">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all">+ Schedule Visit</button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingVisits.map((visit, idx) => {
                  const s = STATUS_STYLES[visit.status] || STATUS_STYLES.scheduled;
                  const isToday = visit.scheduled_date?.startsWith(todayStr);
                  return (
                    <div key={visit.visit_id || idx} className={`bg-white rounded-2xl px-4 py-3.5 border transition-all hover:shadow-md ${isToday ? "border-orange-200 shadow-sm" : "border-gray-100 hover:border-gray-200"}`}>
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isToday ? "bg-orange-100 text-orange-600 border border-orange-200" : "bg-gray-100 text-gray-500"}`}>
                          {visit.doctor_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-sm truncate">{visit.doctor_name}</p>
                            {isToday && <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>{visit.scheduled_date ? formatISTDate(visit.scheduled_date) : "—"}</span>
                            <span className="text-gray-300">·</span>
                            <span>{visit.scheduled_time || "—"}</span>
                            {visit.location && <><span className="text-gray-300">·</span><span className="truncate max-w-[100px]">{visit.location}</span></>}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.color}`}>{s.label}</span>
                          {visit.purpose && <span className="text-[10px] text-gray-400">{visit.purpose}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-6">

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-900">Recent</h2>
                <Link href="/mr/visits" className="text-[10px] text-gray-400 font-semibold hover:text-gray-600">ALL →</Link>
              </div>

              {showLoading ? (
                <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-14 bg-white rounded-xl animate-pulse border border-gray-100" />)}</div>
              ) : recentVisits.length === 0 && !isFetching ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-md p-6 text-center">
                  <p className="text-gray-400 text-xs">No activity yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md divide-y divide-gray-50 overflow-hidden">
                  {recentVisits.slice(0, 5).map((visit, idx) => {
                    const s = STATUS_STYLES[visit.status] || STATUS_STYLES.completed;
                    const isNeg = visit.outcome?.toLowerCase().includes("negative");
                    return (
                      <div key={visit.visit_id || idx} className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${visit.status === "completed" ? (isNeg ? "bg-red-400" : "bg-emerald-400") : s.dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-xs truncate">{visit.doctor_name}</p>
                            <p className="text-[10px] text-gray-400">{visit.scheduled_date ? formatISTDate(visit.scheduled_date) : "—"}</p>
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wide ${visit.status === "completed" ? (isNeg ? "text-red-500" : "text-emerald-600") : "text-gray-400"}`}>{s.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Performance Card */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-800">Performance</p>
                <Link href="/mr/sfe" className="text-[10px] text-orange-600 font-bold hover:text-orange-700">Details →</Link>
              </div>

              {/* Circular ring */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fed7aa" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray={`${completionNum}, 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-gray-900">{stats.completion_rate ?? "—"}</span>
                    <span className="text-[8px] text-gray-400 uppercase tracking-wider font-medium">Rate</span>
                  </div>
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-xl p-3 text-center border border-orange-100">
                  <p className="text-lg font-extrabold text-gray-900">{stats.assigned_doctors ?? "—"}</p>
                  <p className="text-[9px] text-gray-400 font-medium">Doctors</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-orange-100">
                  <p className="text-lg font-extrabold text-gray-900">{stats.total_visits ?? "—"}</p>
                  <p className="text-[9px] text-gray-400 font-medium">Visits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
