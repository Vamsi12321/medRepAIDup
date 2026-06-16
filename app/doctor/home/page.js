"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { get } from "@/lib/api";
import { formatISTDate } from "@/lib/time";

const fmtDate = (d) => formatISTDate(d);

export default function DoctorHome() {
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "Doctor" : "Doctor";
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
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
    <div className="min-h-screen bg-[#f0f2f8]">
      <DoctorNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb />

        {/* ═══ Full-width Welcome Banner ═══ */}
        <div className="relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full" />
            <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2" />
          </div>
          <div className="relative px-8 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest mb-1">Medical Professional</p>
              <h1 className="text-3xl font-extrabold text-white mb-1">Dr. {userName}</h1>
              <p className="text-indigo-200 text-sm">{date}</p>
            </div>
            {/* Stat chips */}
            <div className="flex gap-3">
              {[
                { label: "Drugs", value: stats.total_drugs ?? "—", bg: "bg-white/20", link: "/doctor/drug-search" },
                { label: "Upcoming", value: stats.upcoming_cme_events ?? "—", bg: "bg-white/20", link: "/doctor/cme-events" },
                { label: "Completed", value: stats.completed_cme_events ?? "—", bg: "bg-white/20", link: "/doctor/cme-events" },
              ].map((s, i) => (
                <Link key={i} href={s.link}>
                  <div className={`${s.bg} backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[80px] hover:bg-white/30 transition-all cursor-pointer`}>
                    <p className="text-2xl font-black text-white">{showLoading ? "—" : s.value}</p>
                    <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          {/* Quick action bar */}
          <div className="relative border-t border-white/10 px-8 py-3 flex gap-3">
            <Link href="/doctor/drug-search"><button className="bg-white text-indigo-700 px-4 py-2 rounded-xl font-bold text-xs hover:shadow-lg transition-all hover:-translate-y-0.5">🔍 Search Drugs</button></Link>
            <Link href="/doctor/cme-events"><button className="bg-white/15 border border-white/20 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-white/25 transition-all">📅 CME Events</button></Link>
            <Link href="/doctor/network/feed"><button className="bg-white/15 border border-white/20 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-white/25 transition-all">🤝 Network</button></Link>
            <Link href="/doctor/profile"><button className="bg-white/15 border border-white/20 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-white/25 transition-all">👤 Profile</button></Link>
          </div>
        </div>

        {/* ═══ 3-Column Bento Grid ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* CME Events — 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm shadow-sm">📅</div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Upcoming CME Events</h2>
                  <p className="text-[10px] text-gray-400">{upcomingEvents.length} scheduled</p>
                </div>
              </div>
              <Link href="/doctor/cme-events" className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">View All →</Link>
            </div>
            <div className="p-4 space-y-2.5 max-h-[340px] overflow-y-auto">
              {showLoading ? (
                [1,2,3].map((i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">📅</div>
                  <p className="text-gray-500 text-sm font-semibold">No upcoming events</p>
                </div>
              ) : upcomingEvents.map((event) => (
                <Link key={event.event_id} href="/doctor/cme-events">
                  <div className="group flex gap-3 bg-gray-50 hover:bg-indigo-50 rounded-xl p-3.5 border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                      {event.event_type?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-xs truncate group-hover:text-indigo-700 transition-colors">{event.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 flex-wrap">
                        <span>📆 {fmtDate(event.event_date)}</span>
                        <span className="text-gray-300">·</span>
                        <span>⏰ {event.event_time}</span>
                        {event.event_mode === "offline" && event.venue_name && <><span className="text-gray-300">·</span><span>📍{event.venue_name}</span></>}
                      </div>
                      {event.speaker && <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">👨‍⚕️ {event.speaker}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[9px] font-bold">{event.event_type}</span>
                      {event.event_mode === "online" && event.meeting_link && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(event.meeting_link, "_blank"); }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[9px] font-bold transition-all">Join →</button>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* New Drugs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-sm">🔥</div>
                  <h2 className="text-sm font-bold text-gray-900">New Drugs</h2>
                </div>
                <Link href="/doctor/drug-search" className="text-[10px] text-gray-400 font-semibold hover:text-gray-600">ALL →</Link>
              </div>
              <div className="p-3">
                {showLoading ? (
                  [1,2,3].map((i) => <div key={i} className="h-11 bg-gray-50 rounded-xl animate-pulse mb-2" />)
                ) : recentDrugs.length === 0 ? (
                  <p className="text-gray-400 text-xs text-center py-5">No recent drugs</p>
                ) : recentDrugs.slice(0, 5).map((drug) => (
                  <Link key={drug.drug_id} href={`/drug-details/${drug.drug_id}`}>
                    <div className="group flex items-center gap-2.5 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 group-hover:scale-110 transition-transform">
                        {(drug.brand_name || drug.drug_name)?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-[11px] capitalize truncate group-hover:text-indigo-700 transition-colors">{drug.brand_name || drug.drug_name}</p>
                        <p className="text-[9px] text-gray-400 capitalize">{drug.drug_class}</p>
                      </div>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* CME Progress */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-xl">
              <p className="text-xs text-indigo-200 font-medium mb-3 uppercase tracking-wider">CME Progress</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/15 rounded-xl p-3 text-center border border-white/10">
                  <p className="text-2xl font-black">{showLoading ? "—" : stats.completed_cme_events ?? "—"}</p>
                  <p className="text-[9px] text-indigo-200 uppercase tracking-wider font-medium">Done</p>
                </div>
                <div className="bg-white/15 rounded-xl p-3 text-center border border-white/10">
                  <p className="text-2xl font-black">{showLoading ? "—" : stats.total_cme_events ?? "—"}</p>
                  <p className="text-[9px] text-indigo-200 uppercase tracking-wider font-medium">Total</p>
                </div>
              </div>
              <Link href="/doctor/cme-events">
                <button className="w-full bg-white/15 hover:bg-white/25 border border-white/20 text-white py-2 rounded-xl text-xs font-bold transition-all">View All Events →</button>
              </Link>
            </div>
          </div>
        </div>

        {/* ═══ Recordings ═══ */}
        {(showLoading || recentEvents.length > 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm shadow-sm">🎥</div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">CME Recordings</h2>
                  <p className="text-[10px] text-gray-400">Watch at your own pace</p>
                </div>
              </div>
              <Link href="/doctor/cme-events?tab=past" className="text-xs text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">View All →</Link>
            </div>
            <div className="p-4">
              {showLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map((i) => <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />)}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentEvents.map((event) => (
                    <div key={event.event_id} className="group bg-gray-50 hover:bg-indigo-50 rounded-xl p-4 border border-gray-100 hover:border-indigo-200 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[9px] font-bold">{event.event_type}</span>
                        <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full text-[9px] font-bold">🎥</span>
                      </div>
                      <p className="font-bold text-gray-900 text-xs mb-1 line-clamp-2 group-hover:text-indigo-700 transition-colors">{event.title}</p>
                      <p className="text-[9px] text-gray-400 mb-3">{fmtDate(event.event_date)}{event.speaker ? ` · ${event.speaker}` : ""}</p>
                      {event.event_recording ? (
                        <a href={event.event_recording} target="_blank" rel="noreferrer"
                          className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 rounded-xl font-bold text-[10px] text-center transition-all shadow-sm">
                          Watch →
                        </a>
                      ) : (
                        <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded-xl font-bold text-[10px] cursor-not-allowed">No Recording</button>
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
