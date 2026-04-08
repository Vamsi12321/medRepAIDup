"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { get } from "@/lib/api";

const STATUS_STYLES = {
  scheduled:   { bg: "bg-blue-100",   text: "text-blue-700" },
  rescheduled: { bg: "bg-yellow-100", text: "text-yellow-700" },
  completed:   { bg: "bg-green-100",  text: "text-green-700" },
  cancelled:   { bg: "bg-red-100",    text: "text-red-600" },
};

export default function MRDashboard() {
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "MR" : "MR";

  const { data, isLoading } = useQuery({
    queryKey: ["mr-dashboard"],
    queryFn:  () => get("/api/v1/dashboard"),
    staleTime: 2 * 60 * 1000,
  });

  const stats          = data?.statistics    || {};
  const upcomingVisits = data?.upcoming_visits || [];
  const recentVisits   = data?.recent_visits   || [];

  const statCards = [
    { label: "Assigned Doctors", value: stats.assigned_doctors ?? "—", icon: "👨‍⚕️", color: "from-blue-500 to-cyan-500",    link: "/mr/doctors" },
    { label: "Total Visits",     value: stats.total_visits     ?? "—", icon: "📅", color: "from-orange-500 to-red-500",   link: "/mr/visits" },
    { label: "Completion Rate",  value: stats.completion_rate  ?? "—", icon: "✅", color: "from-green-500 to-emerald-500", link: "/mr/visits" },
    { label: "Drug Database",    value: "24/7",                        icon: "💊", color: "from-purple-500 to-pink-500",   link: "/mr/drug-search" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-x-hidden">
      <MRNavbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />

        {/* Welcome */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-2xl p-5 sm:p-7 shadow-lg text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Welcome Back, {userName}! 💼</h1>
          <p className="text-orange-100 text-sm sm:text-base">Your territory performance and daily activities</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
          {statCards.map((s, i) => (
            <Link key={i} href={s.link}>
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 shadow-md`}>
                  {s.icon}
                </div>
                <p className="text-2xl sm:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
                  {isLoading ? <span className="animate-pulse text-gray-300">—</span> : s.value}
                </p>
                <p className="text-gray-600 font-semibold text-xs sm:text-base">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Upcoming Visits */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>📅</span> Upcoming Visits
              </h2>
              <Link href="/mr/visits" className="text-orange-600 font-semibold hover:text-orange-700 text-sm">View All →</Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingVisits.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl">📅</span>
                <p className="text-gray-400 text-sm mt-3">No upcoming visits</p>
                <Link href="/mr/visits">
                  <button className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition-all">
                    Schedule a Visit
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingVisits.map((visit) => {
                  const s = STATUS_STYLES[visit.status] || STATUS_STYLES.scheduled;
                  return (
                    <div key={visit.visit_id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{visit.doctor_name}</p>
                          {visit.doctor_specialization && <p className="text-xs text-gray-400">{visit.doctor_specialization}</p>}
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${s.bg} ${s.text}`}>{visit.status}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>📅 {visit.scheduled_date ? new Date(visit.scheduled_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
                        <span>⏰ {visit.scheduled_time}</span>
                        {visit.location && <span>📍 {visit.location}</span>}
                      </div>
                      {visit.purpose && <p className="text-xs text-orange-600 font-semibold mt-1">{visit.purpose}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Visits + Quick Actions */}
          <div className="space-y-6">
            {/* Recent Visits */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span>🕐</span> Recent Visits
                </h2>
                <Link href="/mr/visits?tab=history" className="text-orange-600 font-semibold hover:text-orange-700 text-sm">View All →</Link>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {[1,2].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
              ) : recentVisits.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No recent visits yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentVisits.map((visit) => {
                    const s = STATUS_STYLES[visit.status] || STATUS_STYLES.completed;
                    const isNeg = visit.outcome?.toLowerCase().includes("negative");
                    const date = visit.scheduled_date
                      ? new Date(visit.scheduled_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                      : "—";
                    return (
                      <div key={visit.visit_id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${visit.status === "completed" ? (isNeg ? "bg-red-400" : "bg-green-400") : "bg-red-300"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-xs truncate">{visit.doctor_name}</p>
                          <p className="text-xs text-gray-400">{date}</p>
                          {visit.outcome && (
                            <p className={`text-xs font-medium truncate ${isNeg ? "text-red-500" : "text-green-600"}`}>{visit.outcome}</p>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${s.bg} ${s.text} flex-shrink-0`}>{visit.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
