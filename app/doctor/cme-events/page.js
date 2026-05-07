"use client";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, post as apiPost } from "@/lib/api";
import { formatIST } from "@/lib/time";

export default function DoctorCMEEvents() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab]       = useState("upcoming");
  const [confirmEvent, setConfirmEvent] = useState(null);
  const [successMsg, setSuccessMsg]     = useState("");

  const { data: eventsData, isLoading: loadingEvents } = useQuery({
    queryKey: ["cme-doctor", activeTab],
    queryFn: () => {
      const status = activeTab === "upcoming" ? "upcoming" : "completed";
      return get(`/api/v1/cme?status=${status}&limit=100`).then((d) => d.events || []);
    },
    staleTime: 3 * 60 * 1000,
  });

  const { data: regsData } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: () => get("/api/v1/cme/my-registrations?limit=100").then((d) => d.registrations || []),
    staleTime: 60000,
  });

  const events = eventsData || [];
  const myRegs = regsData   || [];
  const regMap = Object.fromEntries(myRegs.map((r) => [r.cme_id, r]));

  const invalidateRegs = () => queryClient.invalidateQueries({ queryKey: ["my-registrations"] });

  const registerMutation = useMutation({
    mutationFn: (eventId) => apiPost(`/api/v1/cme/${eventId}/register`, {}),
    onSuccess: () => {
      invalidateRegs();
      setConfirmEvent(null);
      setSuccessMsg("Successfully registered!");
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const activeRegs     = myRegs.filter((r) => r.registration_status === "registered").length;
  const upcomingCount  = events.filter((e) => e.status === "upcoming").length;
  const completedCount = events.filter((e) => e.status === "completed").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        <Breadcrumb />

        {/* Success toast */}
        {successMsg && (
          <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-xl font-semibold text-xs flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {successMsg}
          </div>
        )}

        {/* Page title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow">
            <span className="text-lg">🎓</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">CME Events</h1>
            <p className="text-gray-500 text-xs">Continuing Medical Education</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Upcoming",   value: upcomingCount,  icon: "📅", from: "from-blue-500",   to: "to-cyan-500" },
            { label: "Registered", value: activeRegs,     icon: "✅", from: "from-green-500",  to: "to-emerald-500" },
            { label: "Recordings", value: completedCount, icon: "🎥", from: "from-purple-500", to: "to-pink-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className={`w-8 h-8 bg-gradient-to-br ${s.from} ${s.to} rounded-lg flex items-center justify-center text-sm flex-shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-lg font-bold text-gray-800 leading-none">{s.value}</p>
                <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
          {[
            { id: "upcoming", label: "🗓 Upcoming" },
            { id: "past",     label: "🎥 Recordings" },
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                activeTab === t.id
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow"
                  : "text-gray-500 hover:bg-gray-50"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loadingEvents ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-white rounded-xl h-48 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-xl shadow-sm border border-gray-100">
            <span className="text-4xl">📅</span>
            <p className="text-gray-400 mt-3 text-sm">No events found.</p>
          </div>
        ) : activeTab === "upcoming" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {events.map((event) => {
              const reg          = regMap[event._id];
              const isRegistered = reg?.registration_status === "registered";
              const isCancelled  = reg?.registration_status === "cancelled";
              const isOnline     = event.event_mode === "online";
              const platformLabel = event.platform === "Other" ? event.platform_name : event.platform;
              return (
                <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                  {/* Top accent */}
                  <div className="h-1 w-full bg-gradient-to-r from-green-400 to-emerald-500" />
                  <div className="p-4">
                    {/* Badges row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-xs font-bold">{event.event_type}</span>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${isOnline ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
                        {isOnline ? "🌐 Online" : "🏢 Offline"}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2">{event.title}</h3>
                    {event.description && (
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">{event.description}</p>
                    )}

                    {/* Info pills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {event.event_date && (
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-xs font-semibold">
                          📅 {formatIST(event.event_date, { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      )}
                      {event.event_time && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-xs font-semibold">
                          ⏰ {event.event_time}
                        </span>
                      )}
                      {event.speaker && (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md text-xs font-semibold">
                          👨‍⚕️ {event.speaker}
                        </span>
                      )}
                      {isOnline && platformLabel && (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-md text-xs font-semibold">
                          🖥️ {platformLabel}
                        </span>
                      )}
                      {!isOnline && event.venue_name && (
                        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md text-xs font-semibold">
                          🏢 {event.venue_name}
                        </span>
                      )}
                      {event.max_attendees && (
                        <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md text-xs font-semibold">
                          👥 Max {event.max_attendees}
                        </span>
                      )}
                    </div>

                    {/* Action */}
                    {isRegistered ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center justify-between">
                        <div>
                          <span className="text-green-700 font-bold text-xs">✅ Registered</span>
                          {reg.registration_passcode && (
                            <p className="text-xs text-green-600 mt-0.5">Passcode: <span className="font-bold">{reg.registration_passcode}</span></p>
                          )}
                        </div>
                        {isOnline && event.meeting_link && (
                          <a href={event.meeting_link} target="_blank" rel="noreferrer"
                            className="bg-green-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-green-700 transition-all">
                            Join →
                          </a>
                        )}
                      </div>
                    ) : isCancelled ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <p className="text-gray-400 text-xs font-semibold mb-1.5">Registration cancelled</p>
                        <button onClick={() => setConfirmEvent(event)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-xs font-bold transition-all">
                          Register Again
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmEvent(event)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg font-bold text-xs hover:shadow-md transition-all">
                        Register Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Recordings */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {events.filter((e) => e.event_recording).map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-pink-500" />
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md text-xs font-bold">{event.event_type}</span>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-xs font-bold">Completed</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2">{event.title}</h3>
                  <p className="text-gray-400 text-xs mb-3">
                    {event.event_date ? formatIST(event.event_date, { day: "2-digit", month: "short", year: "numeric" }) : ""}
                    {event.speaker ? ` · ${event.speaker}` : ""}
                  </p>
                  <a href={event.event_recording} target="_blank" rel="noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-bold text-xs hover:shadow-md transition-all">
                    🎥 Watch Recording
                  </a>
                </div>
              </div>
            ))}
            {events.filter((e) => e.event_recording).length === 0 && (
              <div className="col-span-2 text-center py-14 bg-white rounded-xl shadow-sm border border-gray-100">
                <span className="text-4xl">🎥</span>
                <p className="text-gray-400 mt-3 text-sm">No recordings available yet.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Register confirm modal */}
      {confirmEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-5">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
              <span className="text-xl">🎓</span>
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">Confirm Registration</h3>
            <p className="text-gray-700 text-sm font-semibold mb-0.5">{confirmEvent.title}</p>
            <p className="text-gray-400 text-xs mb-4">
              {confirmEvent.event_date ? formatIST(confirmEvent.event_date, { day: "2-digit", month: "short", year: "numeric" }) : ""}
              {confirmEvent.event_time ? ` · ${confirmEvent.event_time}` : ""}
            </p>
            {registerMutation.isError && (
              <p className="text-red-500 text-xs mb-3">{registerMutation.error?.message}</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => setConfirmEvent(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => registerMutation.mutate(confirmEvent._id)}
                disabled={registerMutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold disabled:opacity-50">
                {registerMutation.isPending ? "Registering..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
