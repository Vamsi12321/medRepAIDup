"use client";
import React, { useState,useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, post, put } from "@/lib/api";

const STATUS_STYLES = {
  upcoming:    { bg: "bg-green-100",  text: "text-green-700",  label: "Upcoming" },
  completed:   { bg: "bg-blue-100",   text: "text-blue-700",   label: "Completed" },
  cancelled:   { bg: "bg-red-100",    text: "text-red-600",    label: "Cancelled" },
  rescheduled: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Rescheduled" },
};

export default function CompanyCMEEvents() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab]       = useState("all");
  const [showModal, setShowModal]       = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [focusRecording, setFocusRecording] = useState(false);

  const { data, isLoading ,refetch} = useQuery({
    queryKey: ["cme", activeTab],
    queryFn: () => {
      const params = new URLSearchParams({ limit: 100 });
      if (activeTab !== "all") params.append("status", activeTab);
      return get(`/api/v1/cme?${params}`).then((d) => d.events || []);
    },
  });

  const events  = data || [];
  const total   = events.length;
  const loading = isLoading;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cme"] });

  const tabs = [
    { id: "all",         label: "All" },
    { id: "upcoming",    label: "Upcoming" },
    { id: "completed",   label: "Completed" },
    { id: "cancelled",   label: "Cancelled" },
    { id: "rescheduled", label: "Rescheduled" },
  ];

  const stats = {
    total:       total,
    upcoming:    events.filter((e) => e.status === "upcoming").length,
    completed:   events.filter((e) => e.status === "completed").length,
    withRecording: events.filter((e) => e.event_recording).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <CompanyNavbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">CME Events</h1>
            <p className="text-gray-500 text-sm">Manage continuing medical education events</p>
          </div>
          <button onClick={() => { setEditingEvent(null); setShowModal(true); }}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
            <span>➕</span><span>Add Event</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total",          value: stats.total,         icon: "📅", color: "from-blue-500 to-indigo-600",   text: "from-blue-600 to-indigo-600" },
            { label: "Upcoming",       value: stats.upcoming,      icon: "🔜", color: "from-green-500 to-emerald-600", text: "from-green-600 to-emerald-600" },
            { label: "Completed",      value: stats.completed,     icon: "✅", color: "from-purple-500 to-pink-600",   text: "from-purple-600 to-pink-600" },
            { label: "Cancelled",     value: events.filter((e) => e.status === "cancelled").length,    icon: "❌", color: "from-orange-500 to-red-500",    text: "from-orange-600 to-red-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow border border-gray-100">
              <div className={`w-9 h-9 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-2 text-lg`}>{s.icon}</div>
              <p className={`text-2xl font-bold bg-gradient-to-r ${s.text} bg-clip-text text-transparent`}>{s.value}</p>
              <p className="text-gray-500 text-xs font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow border border-gray-100 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${activeTab === t.id ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Events grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
            <span className="text-5xl">📅</span>
            <p className="text-gray-500 mt-4 text-sm">No events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const s = STATUS_STYLES[event.status] || STATUS_STYLES.upcoming;
              return (
                <div key={event._id} className="bg-white rounded-2xl shadow border border-gray-100 hover:shadow-xl transition-all overflow-hidden">
                  <div className={`h-1 w-full ${event.status === "upcoming" ? "bg-green-400" : event.status === "completed" ? "bg-blue-400" : event.status === "cancelled" ? "bg-red-400" : "bg-yellow-400"}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold">{event.event_type}</span>
                      <div className="flex items-center gap-1.5">
                        {event.event_mode && (
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${event.event_mode === "online" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                            {event.event_mode === "online" ? "🌐 Online" : "🏢 Offline"}
                          </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-gray-800 mb-1 line-clamp-2">{event.title}</h3>
                    {event.description && <p className="text-gray-500 text-xs mb-3 line-clamp-2">{event.description}</p>}

                    <div className="space-y-1.5 mb-4 text-xs">
                      {[
                        { icon: "📅", label: "Date",     value: event.event_date ? new Date(event.event_date).toLocaleDateString() : "—" },
                        { icon: "⏰", label: "Time",     value: event.event_time || "—" },
                        { icon: "👨‍⚕️", label: "Speaker",  value: event.speaker },
                        { icon: "👥", label: "Attendees", value: event.max_attendees ? `Max ${event.max_attendees}` : null },
                        // Online fields
                        event.event_mode === "online" && event.platform
                          ? { icon: "🖥️", label: "Platform", value: event.platform === "Other" ? event.platform_name : event.platform }
                          : null,
                        event.event_mode === "online" && event.meeting_link
                          ? { icon: "🔗", label: "Meeting Link", value: event.meeting_link }
                          : null,
                        // Offline fields
                        event.event_mode === "offline" && event.venue_name
                          ? { icon: "🏢", label: "Venue", value: event.venue_name }
                          : null,
                        event.event_mode === "offline" && event.address
                          ? { icon: "📍", label: "Address", value: event.address }
                          : null,
                        // Fallback to location string if no mode set
                        !event.event_mode && event.location
                          ? { icon: "📍", label: "Location", value: event.location }
                          : null,
                      ].filter(Boolean).filter((r) => r.value).map((row) => (
                        <div key={row.label} className="flex items-start gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                          <span className="flex-shrink-0">{row.icon}</span>
                          <span className="text-gray-500 font-medium flex-shrink-0">{row.label}:</span>
                          <span className="text-gray-700 font-semibold truncate">{row.value}</span>
                        </div>
                      ))}
                      {event.event_recording && (
                        <div className="flex items-center gap-2 bg-purple-50 rounded-lg px-2.5 py-1.5">
                          <span>🎥</span>
                          <span className="text-purple-600 font-semibold">Recording available</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => { setEditingEvent(event); setShowModal(true); }}
                        disabled={event.status === "cancelled"}
                        className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-all text-xs disabled:opacity-40 disabled:cursor-not-allowed">Edit</button>
                      {event.status === "completed" && !event.event_recording && (
                        <button onClick={() => { setEditingEvent(event); setFocusRecording(true); setShowModal(true); }}
                          className="flex-1 bg-purple-100 text-purple-600 py-2 rounded-lg font-semibold hover:bg-purple-200 transition-all text-xs">Upload Recording</button>
                      )}
                      {event.event_recording && (
                        <a href={event.event_recording} target="_blank" rel="noreferrer"
                          className="flex-1 bg-green-100 text-green-600 py-2 rounded-lg font-semibold hover:bg-green-200 transition-all text-xs text-center">View Recording</a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showModal && (
        <EventModal
          editingEvent={editingEvent}
          focusRecording={focusRecording}
          onClose={() => { setShowModal(false); setEditingEvent(null); setFocusRecording(false); }}
          onSaved={refetch}
        />
      )}
    </div>
  );
}

function EventModal({ editingEvent, focusRecording, onClose, onSaved }) {
  const isEdit = !!editingEvent;
  const recordingRef = React.useRef(null);
  const [form, setForm] = useState({
    title:           editingEvent?.title           || "",
    description:     editingEvent?.description     || "",
    event_date:      editingEvent?.event_date      ? new Date(editingEvent.event_date).toISOString().split("T")[0] : "",
    event_time:      editingEvent?.event_time      || "",
    event_type:      editingEvent?.event_type      || "",
    max_attendees:   editingEvent?.max_attendees   || "",
    location:        editingEvent?.location        || "",
    speaker:         editingEvent?.speaker         || "",
    status:          editingEvent?.status          || "",
    event_recording: editingEvent?.event_recording || "",
    // event mode fields (derived from location if editing)
    event_mode:      editingEvent?.event_mode      || "",
    platform:        editingEvent?.platform        || "",
    meeting_link:    editingEvent?.meeting_link    || "",
    venue:           editingEvent?.venue_name      || "",
    address:         editingEvent?.address         || "",
    custom_platform: editingEvent?.platform_name   || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (focusRecording && recordingRef.current) {
      setTimeout(() => recordingRef.current?.focus(), 100);
    }
  }, [focusRecording]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const platformName = form.platform === "Other" ? form.custom_platform : null;

      const payload = {
        title:         form.title,
        description:   form.description,
        event_date:    form.event_date,
        event_time:    form.event_time,
        event_type:    form.event_type,
        speaker:       form.speaker,
        ...(form.max_attendees ? { max_attendees: Number(form.max_attendees) } : {}),
        ...(form.status        ? { status: form.status }                       : {}),
        // event_mode fields
        ...(form.event_mode ? { event_mode: form.event_mode } : {}),
        ...(form.event_mode === "online" ? {
          platform:     form.platform,
          ...(platformName ? { platform_name: platformName } : {}),
          meeting_link: form.meeting_link,
        } : {}),
        ...(form.event_mode === "offline" ? {
          venue_name: form.venue,
          address:    form.address,
        } : {}),
        // recording only on update when completed
        ...(isEdit && (editingEvent?.status === "completed" || form.status === "completed") && form.event_recording
          ? { event_recording: form.event_recording }
          : {}),
      };
      if (isEdit) {
        await put(`/api/v1/cme/${editingEvent._id}`, payload);
      } else {
        await post("/api/v1/cme", payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save event");
    }
    setSaving(false);
  };

  const f = (label, key, type = "text", placeholder = "", required = false) => (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder} required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-4 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <h2 className="text-lg font-bold text-white">{isEdit ? "Edit Event" : "Add CME Event"}</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>}

          {f("Event Title", "title", "text", "e.g. Hypertension Management Webinar", true)}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2} placeholder="Learning objectives..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {f("Date", "event_date", "date", "", true)}
            {f("Time", "event_time", "text", "10:00 AM - 12:00 PM", true)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Type<span className="text-red-500 ml-0.5">*</span></label>
              <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none bg-white">
                <option value="">Select</option>
                {["Webinar","Conference","Workshop","Seminar","Symposium"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {f("Max Attendees", "max_attendees", "number", "500")}
          </div>

          {/* Event Mode */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Event Mode <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {["online", "offline"].map((mode) => (
                <button key={mode} type="button"
                  onClick={() => setForm({ ...form, event_mode: mode, platform: "", meeting_link: "", venue: "", address: "", custom_platform: "" })}
                  className={`py-2 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                    form.event_mode === mode
                      ? mode === "online" ? "bg-blue-100 border-blue-400 text-blue-700" : "bg-orange-100 border-orange-400 text-orange-700"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>
                  {mode === "online" ? "🌐 Online" : "🏢 Offline"}
                </button>
              ))}
            </div>

            {/* Online options */}
            {form.event_mode === "online" && (
              <div className="space-y-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Platform</label>
                  <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value, custom_platform: "" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    <option value="">Select platform</option>
                    {["Zoom", "Google Meet", "Microsoft Teams", "Other"].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {form.platform === "Other" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Platform Name</label>
                    <input type="text" value={form.custom_platform}
                      onChange={(e) => setForm({ ...form, custom_platform: e.target.value })}
                      placeholder="e.g. Webex, GoToMeeting..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Link</label>
                  <input type="url" value={form.meeting_link}
                    onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
            )}

            {/* Offline options */}
            {form.event_mode === "offline" && (
              <div className="space-y-2 bg-orange-50 rounded-xl p-3 border border-orange-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Venue Name</label>
                  <input type="text" value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="e.g. Grand Hotel Conference Center"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                  <input type="text" value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="123 Medical Street, Mumbai"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {f("Speaker", "speaker", "text", "Dr. John Smith", true)}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none bg-white">
                <option value="">Auto (based on date)</option>
                {["completed","cancelled","rescheduled"].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Recording — only for completed */}
          {(isEdit && editingEvent?.status === "completed") || form.status === "completed" ? (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Recording URL</label>
              <input ref={recordingRef} type="url" value={form.event_recording}
                onChange={(e) => setForm({ ...form, event_recording: e.target.value })}
                placeholder="https://..."
                className={`w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none transition-all ${focusRecording ? "border-purple-400 ring-2 ring-purple-200" : "border-gray-300"}`} />
            </div>
          ) : (
            <div className="border-2 border-dashed border-purple-200 rounded-xl p-3 text-center bg-purple-50">
              <span className="text-lg">🎥</span>
              <p className="text-xs text-gray-400 mt-1">Recording can be added once event is completed</p>
              {editingEvent?.event_recording && <p className="text-xs text-green-600 font-semibold mt-1">✅ Recording already uploaded</p>}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 text-sm">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 rounded-xl font-bold hover:shadow-lg text-sm disabled:opacity-50">
              {saving ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
