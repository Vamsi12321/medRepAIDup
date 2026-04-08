"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get } from "@/lib/api";

export default function DoctorCMEEvents() {
  const [activeTab, setActiveTab]       = useState("upcoming");
  const [registered, setRegistered]     = useState(new Set());
  const [confirmEvent, setConfirmEvent] = useState(null);
  const [successEvent, setSuccessEvent] = useState(null);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["cme-doctor", activeTab],
    queryFn: () => {
      const status = activeTab === "upcoming" ? "upcoming" : "completed";
      return get(`/api/v1/cme?status=${status}&limit=100`).then((d) => d.events || []);
    },
    staleTime: 3 * 60 * 1000,
  });

  const events = data || [];

  const handleConfirm = () => {
    setRegistered((prev) => new Set([...prev, confirmEvent._id]));
    setSuccessEvent(confirmEvent);
    setConfirmEvent(null);
  };

  const handleCancel = (id) => {
    setRegistered((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const upcomingCount  = events.filter((e) => e.status === "upcoming").length;
  const completedCount = events.filter((e) => e.status === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <DoctorNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb />

        <div className="mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📅</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">CME Events</h1>
            <p className="text-gray-600 text-sm">Continuing Medical Education opportunities</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Upcoming",   value: upcomingCount,    icon: "📅", color: "from-blue-500 to-cyan-600",    text: "from-blue-600 to-cyan-600" },
            { label: "Registered", value: registered.size,  icon: "✅", color: "from-green-500 to-emerald-600", text: "from-green-600 to-emerald-600" },
            { label: "Recordings", value: completedCount,   icon: "🎥", color: "from-orange-500 to-red-600",   text: "from-orange-600 to-red-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow border border-gray-100">
              <div className={`w-9 h-9 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-2 text-lg`}>{s.icon}</div>
              <p className={`text-2xl font-bold bg-gradient-to-r ${s.text} bg-clip-text text-transparent`}>{s.value}</p>
              <p className="text-gray-500 text-xs font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 bg-white rounded-xl p-1.5 shadow border border-gray-100 w-fit">
          {[{ id: "upcoming", label: "📅 Upcoming" }, { id: "past", label: "🎥 Recordings" }].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === t.id ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
            <span className="text-5xl">📅</span>
            <p className="text-gray-500 mt-4 text-sm">No events found.</p>
          </div>
        ) : activeTab === "upcoming" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => {
              const isRegistered = registered.has(event._id);
              const isOnline     = event.event_mode === "online";
              const platformLabel = event.platform === "Other" ? event.platform_name : event.platform;
              return (
                <div key={event._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                  <div className="h-1.5 w-full bg-gradient-to-r from-green-400 to-emerald-500" />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">{event.event_type}</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${isOnline ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {isOnline ? "🌐 Online" : "🏢 Offline"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h3>
                    {event.description && <p className="text-gray-500 text-sm mb-4 leading-relaxed">{event.description}</p>}

                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                      <div className="bg-indigo-50 rounded-lg p-2.5 border-l-4 border-indigo-400">
                        <p className="text-indigo-600 font-semibold mb-0.5">📆 Date</p>
                        <p className="font-bold text-gray-800">{event.event_date ? new Date(event.event_date).toLocaleDateString() : "—"}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2.5 border-l-4 border-blue-400">
                        <p className="text-blue-600 font-semibold mb-0.5">🕐 Time</p>
                        <p className="font-bold text-gray-800">{event.event_time || "—"}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2.5 border-l-4 border-purple-400 col-span-2">
                        <p className="text-purple-600 font-semibold mb-0.5">👨‍⚕️ Speaker</p>
                        <p className="font-bold text-gray-800">{event.speaker}</p>
                      </div>
                      {isOnline && platformLabel && (
                        <div className="bg-green-50 rounded-lg p-2.5 border-l-4 border-green-400 col-span-2">
                          <p className="text-green-600 font-semibold mb-0.5">🖥️ Platform</p>
                          <p className="font-bold text-gray-800">{platformLabel}</p>
                        </div>
                      )}
                      {!isOnline && event.venue_name && (
                        <div className="bg-orange-50 rounded-lg p-2.5 border-l-4 border-orange-400 col-span-2">
                          <p className="text-orange-600 font-semibold mb-0.5">📍 Venue</p>
                          <p className="font-bold text-gray-800">{event.venue_name}{event.address ? ` · ${event.address}` : ""}</p>
                        </div>
                      )}
                    </div>

                    {event.max_attendees && (
                      <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <span className="text-gray-600 font-semibold">👥 Max {event.max_attendees} attendees</span>
                        <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Open
                        </span>
                      </div>
                    )}

                    {isRegistered ? (
                      <div className="space-y-2">
                        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                          <span className="text-green-700 font-bold text-sm">✅ You're registered!</span>
                          {isOnline && event.meeting_link && (
                            <a href={event.meeting_link} target="_blank" rel="noreferrer"
                              className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-700 transition-all">
                              Join →
                            </a>
                          )}
                        </div>
                        <button onClick={() => handleCancel(event._id)}
                          className="w-full bg-red-50 text-red-500 py-2 rounded-xl font-semibold text-xs hover:bg-red-100 transition-all border border-red-200">
                          Cancel Registration
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmEvent(event)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm">
                        Register Now →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-2xl p-5 shadow border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold">{event.event_type}</span>
                  {event.event_recording
                    ? <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-bold">🎥 Recording</span>
                    : <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-lg text-xs font-bold">No Recording</span>
                  }
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-3">{event.title}</h3>
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span>📆</span><span className="font-semibold text-gray-700">{event.event_date ? new Date(event.event_date).toLocaleDateString() : "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span>👨‍⚕️</span><span className="font-semibold text-gray-700">{event.speaker}</span>
                  </div>
                </div>
                {event.event_recording ? (
                  <a href={event.event_recording} target="_blank" rel="noreferrer"
                    className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all text-center">
                    Watch Recording →
                  </a>
                ) : (
                  <button disabled className="w-full bg-gray-100 text-gray-400 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed">
                    Recording Not Available
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Confirm Modal */}
      {confirmEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-1">Confirm Registration</h3>
            <p className="text-gray-500 text-sm text-center mb-5">{confirmEvent.title}</p>
            <div className="space-y-2 mb-5 text-sm">
              {[
                { label: "📆 Date",    value: confirmEvent.event_date ? new Date(confirmEvent.event_date).toLocaleDateString() : "—" },
                { label: "🕐 Time",    value: confirmEvent.event_time },
                { label: "📍 Mode",    value: confirmEvent.event_mode === "online"
                    ? `🌐 ${confirmEvent.platform === "Other" ? confirmEvent.platform_name : confirmEvent.platform}`
                    : `🏢 ${confirmEvent.venue_name}` },
              ].map((r) => r.value && (
                <div key={r.label} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-semibold text-gray-800">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmEvent(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-sm">Cancel</button>
              <button onClick={handleConfirm} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Registered!</h3>
            <p className="text-gray-500 text-sm mb-4">{successEvent.title}</p>
            {successEvent.event_mode === "online" && successEvent.meeting_link && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-left">
                <p className="text-xs text-green-600 font-semibold mb-1">🖥️ Meeting Link</p>
                <a href={successEvent.meeting_link} target="_blank" rel="noreferrer"
                  className="text-sm text-green-700 font-bold break-all hover:underline">{successEvent.meeting_link}</a>
              </div>
            )}
            {successEvent.event_mode === "offline" && successEvent.venue_name && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 text-left">
                <p className="text-xs text-orange-600 font-semibold mb-1">📍 Venue</p>
                <p className="text-sm text-orange-700 font-bold">{successEvent.venue_name}</p>
                {successEvent.address && <p className="text-xs text-orange-500">{successEvent.address}</p>}
              </div>
            )}
            <button onClick={() => setSuccessEvent(null)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

