"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, post, put } from "@/lib/api";

const STATUS_STYLES = {
  scheduled:  { bg: "bg-blue-100",   text: "text-blue-700",   label: "Scheduled" },
  completed:  { bg: "bg-green-100",  text: "text-green-700",  label: "Completed" },
  cancelled:  { bg: "bg-red-100",    text: "text-red-600",    label: "Cancelled" },
};

const PURPOSE_OPTIONS = [
  "Drug Promotion", "Follow-up", "Relationship Building",
  "Product Launch", "Sample Distribution", "Feedback Collection", "Other",
];

// Convert "09:30" → "9:30 AM", "14:00" → "2:00 PM"
const to12h = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
};

const OUTCOMES = [
  "Positive — Doctor interested",
  "Neutral — Will consider",
  "Negative — Not interested",
  "Follow-up needed",
  "Sample requested",
];

export default function MRVisits() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab]       = useState("upcoming");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [updateVisit, setUpdateVisit]   = useState(null);
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo]     = useState("");

  const mrId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Assigned doctors — cached, rarely changes
  const { data: mrData, isLoading: loadingData } = useQuery({
    queryKey: ["mr-profile", mrId],
    queryFn:  () => get(`/api/v1/mrs/${mrId}`),
    enabled:  !!mrId,
    staleTime: 10 * 60 * 1000,
  });
  const assignedDoctors = mrData?.assigned_doctors || [];

  // Visits — refetch when filters change
  const visitsQueryKey = ["visits", mrId, filterDoctor, filterDateFrom, filterDateTo];
  const { data: visitsData, isLoading: loadingVisits } = useQuery({
    queryKey: visitsQueryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterDoctor)   params.append("doctor_id", filterDoctor);
      if (filterDateFrom) params.append("date_from",  filterDateFrom);
      if (filterDateTo)   params.append("date_to",    filterDateTo);
      return get(`/api/v1/visits?${params}`).then((d) => d.visits || []);
    },
    enabled:  !!mrId,
    staleTime: 0, // always fresh for visits
  });
  const visits = visitsData || [];

  const invalidateVisits = () => queryClient.invalidateQueries({ queryKey: ["visits", mrId] });

  // Add a new visit — real API
  const handleSchedule = async (formData) => {
    try {
      await post(`/api/v1/visits`, {
        doctor_id:      formData.doctor_id,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        purpose:        formData.purpose,
        location:       formData.location,
        notes:          formData.notes,
      });
      invalidateVisits();
    } catch (err) {
      alert(err.message || "Failed to schedule visit");
    }
    setShowScheduleForm(false);
  };

  // Update via action-specific endpoints
  const handleUpdate = async (visitId, updates) => {
    try {
      if (updates.status === "completed") {
        await put(`/api/v1/visits/${visitId}/complete`, {
          outcome:  updates.outcome,
          feedback: updates.feedback,
        });
      } else if (updates.status === "cancelled") {
        await put(`/api/v1/visits/${visitId}/cancel`, {
          reason: updates.cancel_reason,
        });
      } else if (updates.status === "scheduled") {
        await put(`/api/v1/visits/${visitId}/reschedule`, {
          scheduled_date: updates.scheduled_date,
          scheduled_time: updates.scheduled_time,
          location:       updates.location,
          reason:         updates.reason,
        });
      }
      invalidateVisits();
    } catch (err) {
      alert(err.message || "Failed to update visit");
    }
    setUpdateVisit(null);
  };

  const upcoming  = visits.filter((v) => v.status === "scheduled");
  const history   = visits.filter((v) => v.status === "completed" || v.status === "cancelled");
  const displayed = activeTab === "upcoming" ? upcoming : history;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <MRNavbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Visit Planner 📅</h1>
            <p className="text-gray-500 text-sm">Schedule and track your doctor visits</p>
          </div>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>➕</span><span>Schedule Visit</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Scheduled", value: visits.filter((v) => v.status === "scheduled").length, icon: "📅", color: "from-blue-500 to-indigo-500", text: "from-blue-600 to-indigo-600" },
            { label: "Completed", value: visits.filter((v) => v.status === "completed").length, icon: "✅", color: "from-green-500 to-emerald-500", text: "from-green-600 to-emerald-600" },
            { label: "Cancelled", value: visits.filter((v) => v.status === "cancelled").length, icon: "❌", color: "from-red-400 to-pink-500",    text: "from-red-500 to-pink-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow border border-gray-100">
              <div className={`w-8 h-8 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-base mb-2 shadow`}>{s.icon}</div>
              <p className={`text-2xl font-bold bg-gradient-to-r ${s.text} bg-clip-text text-transparent`}>{s.value}</p>
              <p className="text-gray-500 text-xs font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow border border-gray-100 mb-4 flex flex-wrap gap-3 items-end">
          {/* Doctor filter */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Doctor</label>
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            >
              <option value="">All Doctors</option>
              {assignedDoctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          {/* Date from */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">From</label>
            <input type="date" value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          {/* Date to */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">To</label>
            <input type="date" value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          {/* Clear */}
          {(filterDoctor || filterDateFrom || filterDateTo) && (
            <button
              onClick={() => { setFilterDoctor(""); setFilterDateFrom(""); setFilterDateTo(""); }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
            >
              Clear
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white rounded-xl p-1.5 shadow border border-gray-100 w-fit">
          {[{ id: "upcoming", label: "📅 Upcoming" }, { id: "history", label: "🕐 History" }].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === t.id ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Visit list */}
        {loadingVisits ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading visits...</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
            <span className="text-5xl">📅</span>
            <p className="text-gray-500 mt-4 font-medium text-sm">
              {activeTab === "upcoming" ? "No upcoming visits" : "No visit history yet"}
            </p>
            {activeTab === "upcoming" && (
              <button onClick={() => setShowScheduleForm(true)}
                className="mt-4 bg-orange-500 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">
                Schedule your first visit
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onUpdate={(updates) => handleUpdate(visit.id, updates)}
                onOpenUpdate={() => setUpdateVisit(visit)}
              />
            ))}
          </div>
        )}
      </main>

      {showScheduleForm && (
        <ScheduleVisitForm
          assignedDoctors={assignedDoctors}
          loadingData={loadingData}
          onClose={() => setShowScheduleForm(false)}
          onSchedule={handleSchedule}
        />
      )}

      {updateVisit && (
        <UpdateVisitForm
          visit={updateVisit}
          onClose={() => setUpdateVisit(null)}
          onSave={(updates) => handleUpdate(updateVisit.id, updates)}
        />
      )}
    </div>
  );
}

// ── Visit Card ───────────────────────────────────────────────────────────────
function VisitCard({ visit, onOpenUpdate }) {
  const s = STATUS_STYLES[visit.status] || STATUS_STYLES.scheduled;

  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-800">{visit.doctor_name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{visit.purpose}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
        <div className="bg-blue-50 rounded-lg p-2 border-l-4 border-blue-400">
          <p className="text-blue-500 font-semibold mb-0.5">📅 Date</p>
          <p className="font-bold text-gray-700">{visit.scheduled_date}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-2 border-l-4 border-orange-400">
          <p className="text-orange-500 font-semibold mb-0.5">⏰ Time</p>
          <p className="font-bold text-gray-700">{to12h(visit.scheduled_time)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-2 border-l-4 border-purple-400">
          <p className="text-purple-500 font-semibold mb-0.5">📍 Location</p>
          <p className="font-bold text-gray-700 truncate">{visit.location || "—"}</p>
        </div>
      </div>

      {visit.notes ? (
        <div className="bg-gray-50 rounded-lg p-2.5 mb-3 text-xs text-gray-600 border border-gray-100">
          <span className="font-semibold text-gray-700">Notes: </span>{visit.notes}
        </div>
      ) : null}
      {visit.status === "completed" && (visit.outcome || visit.feedback) && (
        <div className={`rounded-lg p-2.5 mb-3 text-xs border space-y-1 ${
          visit.outcome?.toLowerCase().includes("negative")
            ? "bg-red-50 text-red-700 border-red-100"
            : "bg-green-50 text-green-700 border-green-100"
        }`}>
          {visit.outcome  && <p><span className="font-semibold">Outcome: </span>{visit.outcome}</p>}
          {visit.feedback && <p><span className="font-semibold">Feedback: </span>{visit.feedback}</p>}
        </div>
      )}

      {visit.status === "cancelled" && visit.cancel_reason && (
        <div className="bg-red-50 rounded-lg p-2.5 mb-3 text-xs text-red-600 border border-red-100">
          <span className="font-semibold">Cancellation reason: </span>{visit.cancel_reason}
        </div>
      )}

      {visit.reschedule_history?.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-2.5 mb-3 border border-blue-100">
          <p className="text-xs font-bold text-blue-700 mb-1.5">🔄 Reschedule History</p>
          <div className="space-y-1.5">
            {visit.reschedule_history.map((r, i) => (
              <div key={i} className="text-xs text-blue-700 bg-white rounded-lg px-2.5 py-1.5 border border-blue-100">
                <span className="font-semibold">{r.old_date} {r.old_time}</span>
                <span className="mx-1.5 text-blue-400">→</span>
                <span className="font-semibold">{r.new_date} {r.new_time}</span>
                {r.reason && <span className="ml-2 text-blue-500 italic">"{r.reason}"</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {visit.status === "scheduled" && (
        <button onClick={onOpenUpdate}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-xl font-bold text-sm hover:shadow-md transition-all">
          Update / Reschedule
        </button>
      )}
    </div>
  );
}

// TimePicker — shows hour/minute/AM-PM selects, value is "HH:MM" 24h string
function TimePicker({ value, onChange, className = "" }) {
  const parseTime = (v) => {
    if (!v) return { hour: "09", minute: "00", ampm: "AM" };
    const [h, m] = v.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = String(h % 12 || 12).padStart(2, "0");
    return { hour, minute: String(m).padStart(2, "0"), ampm };
  };

  const { hour, minute, ampm } = parseTime(value);

  const update = (h, m, ap) => {
    let h24 = parseInt(h, 10);
    if (ap === "PM" && h24 !== 12) h24 += 12;
    if (ap === "AM" && h24 === 12) h24 = 0;
    onChange(`${String(h24).padStart(2, "0")}:${m}`);
  };

  const hours   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  const sel = `px-2 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white font-semibold text-gray-700 ${className}`;

  return (
    <div className="flex gap-1.5 items-center">
      <select value={hour} onChange={(e) => update(e.target.value, minute, ampm)} className={sel}>
        {hours.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-gray-400 font-bold text-sm">:</span>
      <select value={minute} onChange={(e) => update(hour, e.target.value, ampm)} className={sel}>
        {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <select value={ampm} onChange={(e) => update(hour, minute, e.target.value)}
        className={`px-2 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white font-bold ${ampm === "AM" ? "text-blue-600" : "text-orange-600"}`}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

// ── Schedule Visit Form ──────────────────────────────────────────────────────
function ScheduleVisitForm({ assignedDoctors, loadingData, onClose, onSchedule }) {
  const [form, setForm] = useState({
    doctor_id: "", scheduled_date: "", scheduled_time: "",
    purpose: "", location: "", notes: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.doctor_id) { setError("Please select a doctor"); return; }
    if (!form.location?.trim()) { setError("Location is required"); return; }
    if (!form.scheduled_date || !form.scheduled_time) { setError("Please set date and time"); return; }
    if (!form.purpose) { setError("Please select a purpose"); return; }
    onSchedule(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">📅</span>
            <h2 className="text-xl font-bold text-white">Schedule Visit</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>}

          {loadingData ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading doctors and drugs...</div>
          ) : (
            <>
              {/* Doctor */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Doctor <span className="text-red-500">*</span></label>
                <select value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm bg-white">
                  <option value="">Select a doctor</option>
                  {assignedDoctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {assignedDoctors.length === 0 && <p className="text-xs text-amber-600 mt-1">No assigned doctors. Contact your admin.</p>}
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.scheduled_date} min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Time <span className="text-red-500">*</span></label>
                  <TimePicker
                    value={form.scheduled_time}
                    onChange={(v) => setForm({ ...form, scheduled_time: v })}
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Purpose <span className="text-red-500">*</span></label>
                <select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm bg-white">
                  <option value="">Select purpose</option>
                  {PURPOSE_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Location <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Doctor's clinic, Hospital OPD..."
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm" />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Preparation notes, topics to cover..."
                  rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm resize-none" />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm">Cancel</button>
            <button type="submit" disabled={loadingData}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 text-sm">
              Schedule Visit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Update Visit Form ────────────────────────────────────────────────────────
function UpdateVisitForm({ visit, onClose, onSave }) {
  const [status, setStatus] = useState(visit.status);
  const [feedback, setFeedback] = useState(visit.feedback || "");
  const [outcome, setOutcome] = useState(visit.outcome || "");
  const [notes, setNotes] = useState(visit.notes || "");
  const [cancellationReason, setCancellationReason] = useState(visit.cancel_reason || "");
  const [rescheduleDate, setRescheduleDate] = useState(visit.scheduled_date || "");
  const [rescheduleTime, setRescheduleTime] = useState(visit.scheduled_time || "");
  const [rescheduleLocation, setRescheduleLocation] = useState(visit.location || "");
  const [rescheduleReason, setRescheduleReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const updates = { status, notes };
    if (status === "scheduled" && rescheduleDate && rescheduleTime) {
      updates.scheduled_date = rescheduleDate;
      updates.scheduled_time = rescheduleTime;
      updates.location       = rescheduleLocation;
      updates.reason         = rescheduleReason;
    }
    if (status === "completed") {
      updates.feedback = feedback;
      updates.outcome  = outcome;
    }
    if (status === "cancelled") {
      updates.cancel_reason = cancellationReason;
    }
    onSave(updates);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-5 rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">✏️</span>
            <div>
              <h2 className="text-xl font-bold text-white">Update Visit</h2>
              <p className="text-indigo-100 text-xs">{visit.doctor_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {["scheduled", "completed", "cancelled"].map((s) => {
                const st = STATUS_STYLES[s];
                return (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${status === s ? `${st.bg} ${st.text} border-current` : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reschedule — only when staying scheduled */}
          {status === "scheduled" && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-3">
              <p className="text-xs font-bold text-blue-700">📅 Reschedule</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                  <input type="date" value={rescheduleDate} min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Time</label>
                  <TimePicker
                    value={rescheduleTime}
                    onChange={(v) => setRescheduleTime(v)}
                    className="text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                <input type="text" value={rescheduleLocation}
                  onChange={(e) => setRescheduleLocation(e.target.value)}
                  placeholder="e.g. City Hospital, Room 302"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Reason for rescheduling</label>
                <input type="text" value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Doctor requested different time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
          )}

          {/* Notes — only shown for completed (as part of feedback) */}

          {/* Completed fields */}
          {status === "completed" && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-100 space-y-3">
              <p className="text-xs font-bold text-green-700">✅ Completion Details</p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Outcome</label>
                <select value={outcome} onChange={(e) => setOutcome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-400 bg-white">
                  <option value="">Select outcome</option>
                  {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Doctor's Feedback</label>
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What did the doctor say?"
                  rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-400 resize-none" />
              </div>
            </div>
          )}

          {/* Cancellation reason */}
          {status === "cancelled" && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <label className="block text-xs font-bold text-red-700 mb-1.5">Reason for Cancellation</label>
              <textarea value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Why is this visit being cancelled?"
                rows={3} className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400 resize-none" />
            </div>
          )}

          <div className="flex space-x-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm">Cancel</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2.5 rounded-xl font-bold hover:shadow-lg transition-all text-sm">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
