"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { get } from "@/lib/api";
import { formatISTDate } from "@/lib/time";

const fmtDate = (d) => formatISTDate(d);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

export default function DoctorHome() {
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "Doctor" : "Doctor";
  const [greeting, setGreeting] = useState("Welcome");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
    setCurrentDate(new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["doctor-dashboard"],
    queryFn: () => get("/api/v1/dashboard"),
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const stats          = data?.statistics         || {};
  const upcomingEvents = data?.upcoming_cme_events || [];
  const recentEvents   = data?.recent_cme_events   || [];
  const recentDrugs    = data?.recent_drugs        || [];
  const showLoading    = isLoading && !data;

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <DoctorNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb />

        {/* ═══ Welcome ═══ */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">{currentDate}</p>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{greeting}, Dr. {userName}</h1>
            <p className="text-sm text-gray-500 mt-1">Stay updated with the latest drugs and CME events</p>
          </div>
          <div className="flex gap-2">
            <Link href="/doctor/drug-search">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all">🔍 Search Drugs</button>
            </Link>
            <Link href="/doctor/cme-events">
              <button className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2.5 rounded-xl font-bold text-xs hover:border-indigo-400 transition-all">📅 CME Events</button>
            </Link>
          </div>
        </div>

        {/* ═══ Stats Strip ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total Drugs", value: stats.total_drugs ?? "—", accent: "border-l-blue-400", link: "/doctor/drug-search" },
            { label: "Upcoming Events", value: stats.upcoming_cme_events ?? "—", accent: "border-l-emerald-400", link: "/doctor/cme-events" },
            { label: "Completed Events", value: stats.completed_cme_events ?? "—", accent: "border-l-purple-400", link: "/doctor/cme-events" },
            { label: "Total CME", value: stats.total_cme_events ?? "—", accent: "border-l-orange-400", link: "/doctor/cme-events" },
          ].map((s, i) => (
            <Link key={i} href={s.link} className="group">
              <div className={`bg-white rounded-xl p-4 border border-gray-100 border-l-4 ${s.accent} shadow-sm hover:shadow-md transition-all`}>
                <p className="text-2xl font-extrabold text-gray-900">
                  {showLoading ? <span className="inline-block w-8 h-6 bg-gray-100 rounded animate-pulse" /> : s.value}
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ═══ Main Grid ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Upcoming CME Events */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-sm">📅</div>
                <h2 className="text-sm font-bold text-gray-900">Upcoming CME Events</h2>
              </div>
              <Link href="/doctor/cme-events" className="text-xs text-indigo-600 font-bold hover:text-indigo-700">View All →</Link>
            </div>
            <div className="p-4">
              {showLoading ? (
                <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}</div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-3xl block mb-2">📅</span>
                  <p className="text-gray-400 text-xs">No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingEvents.map((event) => (
                    <Link key={event.event_id} href="/doctor/cme-events">
                      <div className="group bg-gray-50 hover:bg-indigo-50 rounded-xl p-3.5 border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="font-bold text-gray-900 text-xs line-clamp-1 group-hover:text-indigo-700 transition-colors pr-2">{event.title}</p>
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0">{event.event_type}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                          <span>📆 {fmtDate(event.event_date)}</span>
                          <span>⏰ {event.event_time}</span>
                          {event.event_mode === "online" && event.platform && <span>🖥️ {event.platform}</span>}
                          {event.event_mode === "offline" && event.venue_name && <span>📍 {event.venue_name}</span>}
                        </div>
                        {event.speaker && <p className="text-[10px] text-indigo-600 font-semibold mt-1">👨‍⚕️ {event.speaker}</p>}
                        {event.event_mode === "online" && event.meeting_link && (
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(event.meeting_link, "_blank", "noopener,noreferrer"); }}
                            className="mt-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold hover:bg-emerald-200 transition-all">
                            Join Meeting →
                          </button>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recently Launched Drugs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-sm">🔥</div>
                <h2 className="text-sm font-bold text-gray-900">Recently Launched Drugs</h2>
              </div>
              <Link href="/doctor/drug-search" className="text-xs text-indigo-600 font-bold hover:text-indigo-700">View All →</Link>
            </div>
            <div className="p-4">
              {showLoading ? (
                <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
              ) : recentDrugs.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-3xl block mb-2">💊</span>
                  <p className="text-gray-400 text-xs">No recent drugs</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentDrugs.map((drug) => (
                    <Link key={drug.drug_id} href={`/drug-details/${drug.drug_id}`}>
                      <div className="group flex items-center gap-3 bg-gray-50 hover:bg-indigo-50 rounded-xl p-3 border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0 border border-indigo-200 group-hover:scale-105 transition-transform">
                          {(drug.brand_name || drug.drug_name)?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-xs capitalize group-hover:text-indigo-700 transition-colors truncate">
                            {drug.brand_name || drug.drug_name}
                          </p>
                          <p className="text-[10px] text-gray-400 capitalize">{drug.drug_class} · {drug.manufacturer}</p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0">🆕 New</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ CME Recordings ═══ */}
        {(showLoading || recentEvents.length > 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-sm">🎥</div>
                <h2 className="text-sm font-bold text-gray-900">Recent CME Recordings</h2>
              </div>
              <Link href="/doctor/cme-events?tab=past" className="text-xs text-indigo-600 font-bold hover:text-indigo-700">View All →</Link>
            </div>
            <div className="p-4">
              {showLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1,2,3].map((i) => <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentEvents.map((event) => (
                    <div key={event.event_id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all hover:border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[9px] font-bold">{event.event_type}</span>
                        <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full text-[9px] font-bold">🎥 Rec</span>
                      </div>
                      <p className="font-bold text-gray-900 text-xs mb-1 line-clamp-2">{event.title}</p>
                      <p className="text-[10px] text-gray-400 mb-3">{fmtDate(event.event_date)} · {event.speaker}</p>
                      {event.event_recording ? (
                        <a href={event.event_recording} target="_blank" rel="noreferrer"
                          className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-bold text-[10px] text-center transition-all">
                          Watch Recording →
                        </a>
                      ) : (
                        <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded-xl font-bold text-[10px] cursor-not-allowed">
                          No Recording
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
