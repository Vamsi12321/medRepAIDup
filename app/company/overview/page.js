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
    <div className="min-h-screen bg-[#fafbfd]">
      <CompanyNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb />

        {/* Welcome */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{companyName}</p>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome, {userName}</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <Link key={i} href={s.link} className="group">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 group-hover:-translate-y-0.5">
                <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-lg mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                  <span className="text-white">{s.icon}</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900 mb-0.5">
                  {loading ? <span className="inline-block w-8 h-6 bg-gray-100 rounded animate-pulse" /> : s.value}
                </p>
                <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
            <Link href="/company/activity-logs" className="text-xs text-purple-600 font-bold hover:text-purple-700">View All →</Link>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded-lg w-3/4" />
                      <div className="h-2.5 bg-gray-50 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-8">No recent activity yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {activity.slice(0, 8).map((a, i) => {
                  const meta = ACTIVITY_ICONS[a.type] || { icon: "📌", color: "from-gray-400 to-gray-500" };
                  return (
                    <div key={i} className="flex items-center gap-3 py-3 hover:bg-gray-50/50 transition-colors px-1 rounded-lg">
                      <div className={`w-9 h-9 bg-gradient-to-br ${meta.color} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                        <span className="text-sm text-white">{meta.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 text-xs truncate">{a.description || a.title}</p>
                        <p className="text-[10px] text-gray-400">{timeAgo(a.timestamp)}</p>
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
