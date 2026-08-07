"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, put } from "@/lib/api";
import Link from "next/link";

const STATUS_STYLES = {
  upcoming:    { bg: "bg-green-100", text: "text-green-700", label: "Upcoming" },
  completed:   { bg: "bg-blue-100", text: "text-blue-700", label: "Completed" },
  cancelled:   { bg: "bg-red-100", text: "text-red-600", label: "Cancelled" },
  rescheduled: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Rescheduled" },
};

export default function CMEEventDetail() {
  const { id: eventId } = useParams();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const { data: event, isLoading } = useQuery({
    queryKey: ["cme-event", eventId],
    queryFn: () => get(`/api/v1/cme/${eventId}`),
    enabled: !!eventId,
  });

  const { data: statsData } = useQuery({
    queryKey: ["cme-stats", eventId],
    queryFn: () => get(`/api/v1/cme/${eventId}/statistics`),
    enabled: !!eventId,
  });

  const { data: regsData, isLoading: regsLoading } = useQuery({
    queryKey: ["cme-regs", eventId],
    queryFn: () => get(`/api/v1/cme/${eventId}/registrations?limit=100`),
    enabled: !!eventId && activeTab === "registrations",
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cme-event", eventId] });

  if (isLoading) return <div className="min-h-screen bg-[#f8f9fc]"><CompanyNavbar /><div className="flex items-center justify-center py-20"><p className="text-gray-400 text-sm animate-pulse">Loading event...</p></div></div>;
  if (!event) return <div className="min-h-screen bg-[#f8f9fc]"><CompanyNavbar /><div className="flex items-center justify-center py-20"><p className="text-gray-500 text-sm">Event not found.</p></div></div>;

  const s = STATUS_STYLES[event.status] || STATUS_STYLES.upcoming;
  const stats = statsData || {};
  const regs = regsData?.registrations || [];

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <CompanyNavbar />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-5">
        <Breadcrumb />

        {/* Hero Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
          <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-green-200 flex-shrink-0">📅</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>{s.label}</span>
                {event.event_type && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-100">{event.event_type}</span>}
                {event.event_mode && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${event.event_mode === "online" ? "bg-green-50 text-green-700 border border-green-100" : "bg-orange-50 text-orange-700 border border-orange-100"}`}>{event.event_mode === "online" ? "🌐 Online" : "🏢 Offline"}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowEdit(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Event
              </button>
              <Link href="/company/cme-events" className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-all">← Back</Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-gray-900">{stats.total_registrations || 0}</p><p className="text-[10px] text-gray-400">Total Registrations</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-green-600">{stats.active_registrations || 0}</p><p className="text-[10px] text-gray-400">Active</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-red-600">{stats.cancelled_registrations || 0}</p><p className="text-[10px] text-gray-400">Cancelled</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-purple-600">{stats.registration_rate || "—"}</p><p className="text-[10px] text-gray-400">Fill Rate</p></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[{ id: "details", label: "Event Details" }, { id: "registrations", label: "Registrations" }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === t.id ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>{t.label}</button>
          ))}
        </div>

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Event Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xs">📋</span>Event Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Field label="Title" value={event.title} />
                  <Field label="Type" value={event.event_type} />
                  <Field label="Status" value={event.status} />
                  <Field label="Date" value={event.event_date ? new Date(event.event_date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : null} />
                  <Field label="Time" value={event.event_time} />
                  <Field label="Speaker" value={event.speaker} />
                  <Field label="Max Attendees" value={event.max_attendees} />
                  <Field label="Event Mode" value={event.event_mode} />
                  <Field label="Created" value={event.created_at ? new Date(event.created_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : null} />
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs">📝</span>Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
                </div>
              )}

              {/* Location / Platform Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xs">{event.event_mode === "online" ? "🌐" : "📍"}</span>{event.event_mode === "online" ? "Online Details" : "Venue Details"}</h3>
                {event.event_mode === "online" ? (
                  <div className="space-y-3">
                    <Field label="Platform" value={event.platform === "Other" ? event.platform_name : event.platform} />
                    {event.meeting_link && (
                      <div><p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Meeting Link</p><a href={event.meeting_link} target="_blank" rel="noreferrer" className="text-purple-600 hover:text-purple-800 text-sm font-medium underline break-all">{event.meeting_link}</a></div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Field label="Venue" value={event.venue_name} />
                    <Field label="Address" value={event.address} />
                  </div>
                )}
              </div>

              {/* Recording */}
              {event.event_recording && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><span className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-red-600 text-xs">🎥</span>Event Recording</h3>
                  <a href={event.event_recording} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-all">
                    ▶️ Watch Recording
                  </a>
                </div>
              )}
            </div>

            {/* Right sidebar — Quick Facts */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-xs">⚡</span>Quick Facts</h3>
                <div className="space-y-2.5 text-xs">
                  {event.title && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Event</span><span className="font-semibold text-gray-700 text-right max-w-[150px] truncate">{event.title}</span></div>}
                  {event.event_type && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Type</span><span className="font-semibold text-gray-700">{event.event_type}</span></div>}
                  {event.speaker && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Speaker</span><span className="font-semibold text-gray-700 text-right max-w-[150px] truncate">{event.speaker}</span></div>}
                  {event.max_attendees && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Capacity</span><span className="font-semibold text-gray-700">{event.max_attendees}</span></div>}
                  {stats.available_spots != null && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Spots Left</span><span className="font-semibold text-green-600">{stats.available_spots}</span></div>}
                  {event.event_mode && <div className="flex justify-between"><span className="text-gray-400">Mode</span><span className="font-semibold text-gray-700 capitalize">{event.event_mode}</span></div>}
                </div>
              </div>

              {/* Status update quick actions */}
              {event.status !== "cancelled" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    {event.status === "upcoming" && <QuickStatusBtn eventId={eventId} status="completed" label="Mark Completed" color="bg-blue-600" onDone={invalidate} />}
                    {event.status === "upcoming" && <QuickStatusBtn eventId={eventId} status="cancelled" label="Cancel Event" color="bg-red-600" onDone={invalidate} />}
                    {event.status === "upcoming" && <QuickStatusBtn eventId={eventId} status="rescheduled" label="Mark Rescheduled" color="bg-yellow-600" onDone={invalidate} />}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Registrations Tab */}
        {activeTab === "registrations" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Registered Doctors ({regsData?.total || 0})</h3>
            {regsLoading ? <p className="text-gray-400 text-sm py-8 text-center">Loading...</p> : regs.length === 0 ? (
              <div className="text-center py-12"><span className="text-4xl block mb-3">👥</span><p className="text-gray-500 text-sm">No registrations yet.</p></div>
            ) : (
              <div className="space-y-2">
                {regs.map((r) => (
                  <div key={r._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">{(r.doctor_name || "D").charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{r.doctor_name || "Unknown"}</p>
                      <p className="text-[10px] text-gray-400">{r.registered_at ? new Date(r.registered_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) : ""}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.registration_status === "registered" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{r.registration_status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {showEdit && <EditEventModal event={event} eventId={eventId} onClose={() => setShowEdit(false)} onSaved={() => { invalidate(); queryClient.invalidateQueries({ queryKey: ["cme-stats", eventId] }); setShowEdit(false); }} />}
    </div>
  );
}

// Helper components
function Field({ label, value }) {
  if (!value) return null;
  return <div><p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">{label}</p><p className="text-sm text-gray-800 font-medium capitalize">{String(value)}</p></div>;
}

function QuickStatusBtn({ eventId, status, label, color, onDone }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { await put(`/api/v1/cme/${eventId}`, { status }); onDone(); }
    catch (e) { alert(e.message || "Failed"); }
    setLoading(false);
  };
  return <button onClick={handle} disabled={loading} className={`w-full ${color} text-white py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50`}>{loading ? "..." : label}</button>;
}

function EditEventModal({ event, eventId, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: event.title || "", description: event.description || "",
    event_date: event.event_date ? new Date(event.event_date).toISOString().split("T")[0] : "",
    event_time: event.event_time || "", event_type: event.event_type || "",
    max_attendees: event.max_attendees || "", speaker: event.speaker || "",
    status: event.status || "upcoming", event_recording: event.event_recording || "",
    event_mode: event.event_mode || "", platform: event.platform || "",
    platform_name: event.platform_name || "", meeting_link: event.meeting_link || "",
    venue_name: event.venue_name || "", address: event.address || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const payload = {};
      // Only send changed/non-empty fields
      if (form.title) payload.title = form.title;
      if (form.description) payload.description = form.description;
      if (form.event_date) payload.event_date = form.event_date;
      if (form.event_time) payload.event_time = form.event_time;
      if (form.event_type) payload.event_type = form.event_type;
      if (form.max_attendees) payload.max_attendees = Number(form.max_attendees);
      if (form.speaker) payload.speaker = form.speaker;
      if (form.status) payload.status = form.status;
      if (form.event_mode) payload.event_mode = form.event_mode;
      if (form.event_mode === "online") {
        if (form.platform) payload.platform = form.platform;
        if (form.platform === "Other" && form.platform_name) payload.platform_name = form.platform_name;
        if (form.meeting_link) payload.meeting_link = form.meeting_link;
      }
      if (form.event_mode === "offline") {
        if (form.venue_name) payload.venue_name = form.venue_name;
        if (form.address) payload.address = form.address;
      }
      if ((event.status === "completed" || form.status === "completed") && form.event_recording) {
        payload.event_recording = form.event_recording;
      }
      await put(`/api/v1/cme/${eventId}`, payload);
      onSaved();
    } catch (err) { setError(err?.data?.detail || err.message || "Failed to update"); }
    setSaving(false);
  };

  const F = (label, key, type = "text", ph = "") => (
    <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</label>
    <input type={type} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={ph}
      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300" /></div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-white font-bold text-sm flex items-center gap-2">📅 Edit Event</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>}
          {F("Title", "title", "text", "Event title")}
          <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-100 resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">{F("Date", "event_date", "date")}{F("Time", "event_time", "text", "10:00 AM - 12:00 PM")}</div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Type</label><select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-white">{["Webinar","Conference","Workshop","Seminar","Symposium"].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            {F("Max Attendees", "max_attendees", "number")}
          </div>
          {F("Speaker", "speaker", "text", "Dr. Name")}
          {/* Mode */}
          <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Event Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {["online","offline"].map(m => <button key={m} type="button" onClick={() => setForm({ ...form, event_mode: m })} className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.event_mode === m ? (m === "online" ? "bg-blue-50 border-blue-400 text-blue-700" : "bg-orange-50 border-orange-400 text-orange-700") : "bg-gray-50 border-gray-200 text-gray-500"}`}>{m === "online" ? "🌐 Online" : "🏢 Offline"}</button>)}
            </div>
          </div>
          {form.event_mode === "online" && (
            <div className="space-y-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
              <div><label className="block text-[10px] font-semibold text-gray-600 mb-1">Platform</label><select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white"><option value="">Select</option>{["Zoom","Google Meet","Teams","Other"].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              {form.platform === "Other" && F("Platform Name", "platform_name", "text", "e.g. Webex")}
              {F("Meeting Link", "meeting_link", "url", "https://...")}
            </div>
          )}
          {form.event_mode === "offline" && (
            <div className="space-y-2 bg-orange-50 rounded-xl p-3 border border-orange-100">
              {F("Venue Name", "venue_name", "text", "Grand Hotel")}{F("Address", "address", "text", "123 Street, City")}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-white"><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="rescheduled">Rescheduled</option></select></div>
            {(form.status === "completed" || event.status === "completed") && F("Recording URL", "event_recording", "url", "https://...")}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 shadow-md">{saving ? "Saving..." : "Update Event"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
