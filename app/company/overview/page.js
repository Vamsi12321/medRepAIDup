"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { get } from "@/lib/api";

const ACTIVITY_ICONS = {
  doctor_added:      { icon: "👨‍⚕️", color: "from-purple-500 to-pink-500" },
  mr_added:          { icon: "💼",   color: "from-orange-500 to-red-500" },
  drug_added:        { icon: "💊",   color: "from-blue-500 to-cyan-500" },
  cme_created:       { icon: "📅",   color: "from-green-500 to-emerald-500" },
  visit_scheduled:   { icon: "🗓️",  color: "from-indigo-500 to-purple-500" },
};

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)   return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)    return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function CompanyOverview() {
  const [userName, setUserName]       = useState(() => typeof window !== "undefined" ? localStorage.getItem("userName") || "Admin" : "Admin");
  const [companyName, setCompanyName] = useState(() => typeof window !== "undefined" ? localStorage.getItem("companyName") || "My Company" : "My Company");

  const { data, isLoading: loading } = useQuery({
    queryKey: ["dashboard"],
    queryFn:  () => get("/api/v1/dashboard"),
    staleTime: 2 * 60 * 1000, // dashboard refreshes every 2 min
  });

  const stats    = data?.statistics    || null;
  const activity = data?.recent_activity || [];

  const statCards = [
    { label: "Total Drugs",    value: stats?.total_drugs        ?? "—", icon: "💊", color: "from-blue-500 to-cyan-500",    link: "/company/drug-management" },
    { label: "Active MRs",     value: stats?.active_mrs         ?? "—", icon: "💼", color: "from-orange-500 to-red-500",   link: "/company/medical-reps" },
    { label: "Upcoming Events",value: stats?.upcoming_cme_events ?? "—", icon: "📅", color: "from-green-500 to-emerald-500", link: "/company/cme-events" },
    { label: "Active Doctors", value: stats?.active_doctors     ?? "—", icon: "👨‍⚕️", color: "from-purple-500 to-pink-500",  link: "/company/doctors" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <CompanyNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />

        {/* Welcome banner */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-5 sm:p-7 shadow-lg text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Welcome back, {userName}! 👋</h1>
          <p className="text-purple-100 text-sm sm:text-base">{companyName} Dashboard</p>
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
                  {loading ? <span className="animate-pulse text-gray-300">—</span> : s.value}
                </p>
                <p className="text-gray-600 font-semibold text-xs sm:text-base">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <span>📊</span> Recent Activity
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No recent activity yet.</p>
            ) : (
              <div className="space-y-3">
                {activity.slice(0, 8).map((a, i) => {
                  const meta = ACTIVITY_ICONS[a.type] || { icon: "📌", color: "from-gray-400 to-gray-500" };
                  return (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100 hover:shadow-sm transition-all">
                      <div className={`w-9 h-9 bg-gradient-to-br ${meta.color} rounded-lg flex items-center justify-center shadow flex-shrink-0`}>
                        <span className="text-base">{meta.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 text-sm truncate">{a.description || a.title}</p>
                        <p className="text-xs text-gray-400">{timeAgo(a.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
