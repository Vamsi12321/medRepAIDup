"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MRSidebar from "@/components/mr/MRSidebar";
import Link from "next/link";
import { formatISTDate } from "@/lib/time";
import { get } from "@/lib/api";
import NotificationBell from "@/components/NotificationBell";

const formatLoc = (loc) => loc && typeof loc === "object" ? loc.location_name || loc.temporary_location?.name || "" : loc || "";

export default function MRDashboard() {
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "MR" : "MR";
  const [currentDate, setCurrentDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening");
    setCurrentDate(new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" }));
  }, []);

  const { data, isLoading } = useQuery({
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
  });
  const territory = mrProfile?.territory || "";

  const stats = data?.statistics || {};
  const upcomingVisits = data?.upcoming_visits || [];
  const todayStr = new Date().toISOString().split("T")[0];
  const todayVisits = upcomingVisits.filter((v) => v.scheduled_date?.startsWith(todayStr));
  const completionNum = parseInt(stats.completion_rate) || 0;
  const showLoading = isLoading && !data;

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex">
      <MRSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main content area - offset by sidebar width */}
      <div className={`${sidebarCollapsed ? "md:ml-[60px]" : "md:ml-[220px]"} flex-1 min-h-screen transition-all duration-300`}>
        {/* Top Bar */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100/80 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(true)} className="md:hidden w-9 h-9 rounded-lg bg-gray-100 hover:bg-purple-50 flex items-center justify-center text-gray-600 hover:text-purple-600 transition-all mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-3">
            {territory && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                <span className="font-medium">{territory}</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell accentColor="indigo" />
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{userName.split(" ")[0]} {userName.split(" ")[1]?.charAt(0) || ""}.</p>
                <p className="text-[10px] text-gray-400">MR - Field Executive</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 md:px-6 py-4 md:py-5">
          {/* Greeting Row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{greeting}, {userName.split(" ")[0]}! 👋</h1>
              <p className="text-sm text-gray-400 mt-0.5">Here's your performance overview and today's plan.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/mr/visits?action=schedule">
                <button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Schedule Visit
                </button>
              </Link>
              <div className="text-right hidden sm:block">
                <p className="text-[11px] text-gray-400">{currentDate}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-lg">📅</span></div>
              <div className="flex-1">
                <p className="text-xl font-extrabold text-gray-900">{showLoading ? "—" : todayVisits.length}</p>
                <p className="text-[10px] text-gray-400">Today's Visits</p>
                <p className="text-[9px] text-gray-300">{showLoading ? "" : `${todayVisits.filter(v => v.status === "completed").length} Completed →`}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-lg">🩺</span></div>
              <div className="flex-1">
                <p className="text-xl font-extrabold text-gray-900">{showLoading ? "—" : stats.assigned_doctors ?? "—"}</p>
                <p className="text-[10px] text-gray-400">Total Doctors</p>
                <p className="text-[9px] text-gray-300">{showLoading ? "" : `${stats.active_doctors || stats.assigned_doctors || "—"} Active Doctors →`}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-lg">📋</span></div>
              <div className="flex-1">
                <p className="text-xl font-extrabold text-gray-900">{showLoading ? "—" : stats.total_visits ?? "—"}</p>
                <p className="text-[10px] text-gray-400">Total Visits (MTD)</p>
                <p className="text-[9px] text-green-500">▲ 12% vs last month</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-lg">🎯</span></div>
              <div className="flex-1">
                <p className="text-xl font-extrabold text-green-600">{showLoading ? "—" : stats.completion_rate ?? "87%"}</p>
                <p className="text-[10px] text-gray-400">Visit Completion</p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${completionNum || 87}%` }} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-lg">📈</span></div>
              <div className="flex-1">
                <p className="text-xl font-extrabold text-purple-600">72%</p>
                <p className="text-[10px] text-gray-400">SFE Score</p>
                <p className="text-[9px] text-green-500">Good Performance</p>
              </div>
            </div>
          </div>

          {/* Middle Row: Schedule + Performance + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
            {/* Today's Schedule */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Today's Schedule</h3>
                <Link href="/mr/visits" className="text-[11px] text-indigo-600 font-semibold hover:text-indigo-700">View Calendar</Link>
              </div>
              {showLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />)}</div>
              ) : todayVisits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-xs">No visits scheduled today</p>
                  <Link href="/mr/visits"><button className="mt-3 text-indigo-600 text-xs font-bold">+ Schedule one</button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayVisits.slice(0, 3).map((visit, idx) => (
                    <div key={visit.visit_id || idx} className="flex items-start gap-3">
                      <div className="text-center flex-shrink-0">
                        <p className="text-[11px] font-bold text-indigo-600">{visit.scheduled_time || "—"}</p>
                      </div>
                      <div className="flex-1 border-l-2 border-indigo-200 pl-3">
                        <p className="text-[12px] font-bold text-gray-800">{visit.doctor_name}</p>
                        <p className="text-[10px] text-gray-400">{visit.specialization || "Doctor"}</p>
                        {formatLoc(visit.location) && <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">📍 {formatLoc(visit.location)}</p>}
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${visit.status === "completed" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
                        {visit.status === "completed" ? "Done" : "Planned"}
                      </span>
                    </div>
                  ))}
                  {todayVisits.length > 3 && (
                    <Link href="/mr/visits" className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 mt-2">View All Visits →</Link>
                  )}
                </div>
              )}
            </div>

            {/* Performance Overview (MTD) - Bar Chart */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Performance Overview (MTD)</h3>
                <p className="text-[10px] text-gray-400">{new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 mb-4">
                {["Visits", "DCR", "SFE Score"].map((tab, i) => (
                  <button key={tab} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${i === 0 ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{tab}</button>
                ))}
              </div>
              {/* Simple bar chart */}
              <div className="flex items-end justify-between h-[120px] px-2 gap-2">
                {[8, 12, 16, 14, 20].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-gray-600">{val}</span>
                    <div className="w-full bg-indigo-100 rounded-t-md relative" style={{ height: `${(val / 25) * 100}%` }}>
                      <div className="absolute inset-0 bg-indigo-500 rounded-t-md opacity-80" />
                    </div>
                    <span className="text-[9px] text-gray-400">W{i + 1}</span>
                  </div>
                ))}
              </div>
              {/* Bottom stats */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-extrabold text-gray-900">{stats.total_visits || 16}</p>
                  <p className="text-[9px] text-gray-400">Total Visits (MTD)</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-indigo-600">20</p>
                  <p className="text-[9px] text-gray-400">Target</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-green-600">{completionNum || 80}%</p>
                  <p className="text-[9px] text-gray-400">Achievement</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2.5">
                {[
                  { icon: "📅", title: "Plan your visits", desc: "Add and plan doctor visits", href: "/mr/visits", color: "bg-blue-50" },
                  { icon: "📋", title: "Submit DCR", desc: "Complete your daily report", href: "/mr/dcr", color: "bg-orange-50" },
                  { icon: "🎯", title: "Check SFE Targets", desc: "View your monthly goals", href: "/mr/sfe", color: "bg-green-50" },
                  { icon: "📢", title: "Read Announcements", desc: "Stay updated with latest info", href: "/mr/announcements", color: "bg-purple-50" },
                ].map((action) => (
                  <Link key={action.title} href={action.href}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-all cursor-pointer group">
                      <div className={`w-9 h-9 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="text-sm">{action.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-gray-800">{action.title}</p>
                        <p className="text-[10px] text-gray-400">{action.desc}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: SFE Overview + Recent Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* SFE Overview (MTD) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">SFE Overview (MTD)</h3>
                <Link href="/mr/sfe" className="text-[11px] text-indigo-600 font-semibold">View All</Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-gray-400">📊</span>
                    <span className="text-[10px] text-gray-400">Primary Sales</span>
                  </div>
                  <p className="text-lg font-extrabold text-gray-900">₹ 2.45 L</p>
                  <p className="text-[9px] text-green-500 font-medium">▲ 8.5%</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-gray-400">📈</span>
                    <span className="text-[10px] text-gray-400">Secondary Sales</span>
                  </div>
                  <p className="text-lg font-extrabold text-gray-900">₹ 4.20 L</p>
                  <p className="text-[9px] text-green-500 font-medium">▲ 12.3%</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-gray-400">📋</span>
                    <span className="text-[10px] text-gray-400">MCR Submitted</span>
                  </div>
                  <p className="text-lg font-extrabold text-gray-900">14</p>
                  <p className="text-[9px] text-green-500 font-medium">▲ 16.7%</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-gray-400">🩺</span>
                    <span className="text-[10px] text-gray-400">Doctor Coverage</span>
                  </div>
                  <p className="text-lg font-extrabold text-green-600">68%</p>
                  <p className="text-[9px] text-green-500 font-medium">▲ 6.2%</p>
                </div>
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Recent Announcements</h3>
                <Link href="/mr/announcements" className="text-[11px] text-indigo-600 font-semibold">View All</Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🚀</span>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-800">New Product Launch</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">We are excited to announce the launch of Cardiovex 10mg. Please check the details in resources section.</p>
                    <p className="text-[9px] text-gray-300 mt-1">26 Jul 2025</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">📢</span>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-800">Monthly Target Update</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Updated targets for August have been published. Check your SFE dashboard.</p>
                    <p className="text-[9px] text-gray-300 mt-1">24 Jul 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
