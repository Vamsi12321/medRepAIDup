"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { get } from "@/lib/api";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function DoctorHome() {
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "Doctor" : "Doctor";

  const { data, isLoading } = useQuery({
    queryKey: ["doctor-dashboard"],
    queryFn:  () => get("/api/v1/dashboard"),
    staleTime: 2 * 60 * 1000,
  });

  const stats          = data?.statistics         || {};
  const upcomingEvents = data?.upcoming_cme_events || [];
  const recentEvents   = data?.recent_cme_events   || [];
  const recentDrugs    = data?.recent_drugs        || [];

  const statCards = [
    { label: "Total Drugs",       value: stats.total_drugs           ?? "—", icon: "💊", color: "from-blue-500 to-indigo-500",   link: "/doctor/drug-search" },
    { label: "Upcoming Events",   value: stats.upcoming_cme_events   ?? "—", icon: "📅", color: "from-green-500 to-emerald-500", link: "/doctor/cme-events" },
    { label: "Completed Events",  value: stats.completed_cme_events  ?? "—", icon: "✅", color: "from-purple-500 to-pink-500",   link: "/doctor/cme-events" },
    { label: "Total CME Events",  value: stats.total_cme_events      ?? "—", icon: "🎓", color: "from-orange-500 to-red-500",    link: "/doctor/cme-events" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <DoctorNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />

        {/* Welcome */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 sm:p-7 shadow-lg text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome Back, {userName}! 👋</h1>
              <p className="text-indigo-100 text-sm sm:text-base mb-4">Stay updated with the latest drug launches and CME events</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link href="/doctor/drug-search">
                  <button className="w-full sm:w-auto bg-white text-indigo-600 px-4 sm:px-6 py-2.5 rounded-lg font-bold hover:shadow-lg transition-all text-sm cursor-pointer">Search Drugs</button>
                </Link>
                <Link href="/doctor/cme-events">
                  <button className="w-full sm:w-auto bg-white text-purple-600 px-4 sm:px-6 py-2.5 rounded-lg font-bold hover:shadow-lg transition-all text-sm cursor-pointer">View Events</button>
                </Link>
              </div>
            </div>
            {/* Inline stats */}
            <div className="hidden lg:flex gap-3 flex-shrink-0">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 text-center border border-white/20 min-w-[110px]">
                <p className="text-3xl font-bold text-white">
                  {isLoading ? "—" : stats.total_drugs ?? "—"}
                </p>
                <p className="text-indigo-100 text-xs font-semibold mt-1">💊 Drugs</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 text-center border border-white/20 min-w-[110px]">
                <p className="text-3xl font-bold text-white">
                  {isLoading ? "—" : stats.upcoming_cme_events ?? "—"}
                </p>
                <p className="text-indigo-100 text-xs font-semibold mt-1">📅 CME Events</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Upcoming CME Events */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2"><span>📅</span> Upcoming CME Events</h2>
              <Link href="/doctor/cme-events" className="text-indigo-600 font-semibold hover:text-indigo-700 text-sm">View All →</Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No upcoming events.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Link key={event.event_id} href="/doctor/cme-events">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group">
                      <div className="flex items-start justify-between mb-1.5">
                        <p className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-indigo-700 transition-colors pr-2">{event.title}</p>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg text-xs font-bold flex-shrink-0">{event.event_type}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>📆 {fmtDate(event.event_date)}</span>
                        <span>⏰ {event.event_time}</span>
                        {event.event_mode === "online" && event.platform && <span>🖥️ {event.platform}</span>}
                        {event.event_mode === "offline" && event.venue_name && <span>📍 {event.venue_name}</span>}
                      </div>
                      {event.speaker && <p className="text-xs text-indigo-600 font-semibold mt-1">👨‍⚕️ {event.speaker}</p>}
                      {event.event_mode === "online" && event.meeting_link && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(event.meeting_link, "_blank", "noopener,noreferrer"); }}
                          className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-200 transition-all">
                          Join Meeting →
                        </button>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Drugs */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2"><span>🔥</span> Recently Launched Drugs</h2>
              <Link href="/doctor/drug-search" className="text-indigo-600 font-semibold hover:text-indigo-700 text-sm">View All →</Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : recentDrugs.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No recent drugs.</p>
            ) : (
              <div className="space-y-3">
                {recentDrugs.map((drug) => (
                  <Link key={drug.drug_id} href={`/drug-details/${drug.drug_id}`}>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all group cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow">
                        {(drug.brand_name || drug.drug_name)?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm capitalize group-hover:text-indigo-600 transition-colors truncate">
                          {drug.brand_name || drug.drug_name}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{drug.drug_class} · {drug.manufacturer}</p>
                      </div>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-xs font-bold flex-shrink-0">🆕 New</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent CME Recordings */}
        {(isLoading || recentEvents.length > 0) && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2"><span>🎥</span> Recent CME Recordings</h2>
              <Link href="/doctor/cme-events?tab=past" className="text-indigo-600 font-semibold hover:text-indigo-700 text-sm">View All →</Link>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1,2,3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentEvents.map((event) => (
                  <div key={event.event_id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">{event.event_type}</span>
                      <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">🎥 Recording</span>
                    </div>
                    <p className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">{event.title}</p>
                    <p className="text-xs text-gray-400 mb-3">{fmtDate(event.event_date)} · {event.speaker}</p>
                    {event.event_recording ? (
                      <a href={event.event_recording} target="_blank" rel="noreferrer"
                        className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg font-bold text-xs text-center hover:shadow-md transition-all">
                        Watch Recording →
                      </a>
                    ) : (
                      <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded-lg font-bold text-xs cursor-not-allowed">
                        No Recording
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
