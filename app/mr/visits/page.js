"use client";
import { useState, useEffect, useCallback } from "react";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, post, put } from "@/lib/api";

const STATUS_COLORS = {
  scheduled:  "bg-blue-100 text-blue-700",
  completed:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

const PURPOSE_OPTIONS = [
  "Drug Promotion",
  "Follow-up",
  "Relationship Building",
  "Product Launch",
  "Sample Distribution",
  "Feedback Collection",
  "Other",
];

export default function MRVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editVisit, setEditVisit] = useState(null); // for completing/updating
  const [activeTab, setActiveTab] = useState("upcoming");
  const [refreshKey, setRefreshKey] = useState(0);

  const mrId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get(`/api/v1/visits`);
      setVisits(data.visits || []);
    } catch {
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchVisits(); }, [fetchVisits]);

  const refetch = () => setRefreshKey((k) => k + 1);

  const handleMarkComplete = (visit) => setEditVisit(visit);

  const handleCancel = async (visitId) => {
    try {
      await put(`/api/v1/visits/${visitId}`, { status: "cancelled" });
      refetch();
    } catch {}
  };

  const now = new Date();
  const upcoming  = visits.filter((v) => v.status === "scheduled" && new Date(v.scheduled_date) >= now);
  const past      = visits.filter((v) => v.status === "completed" || v.status === "cancelled" || new Date(v.scheduled_date) < now);
  const displayed = activeTab === "upcoming" ? upcoming : past;

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
            onClick={() => { setShowForm(true); }}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>➕</span><span>Schedule Visit</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Upcoming", value: upcoming.length, icon: "📅", color: "from-blue-500 to-indigo-500", text: "from-blue-600 to-indigo-600" },
            { label: "Completed", value: visits.filter((v) => v.status === "completed").length, icon: "✅", color: "from-green-500 to-emerald-500", text: "from-green-600 to-emerald-600" },
            { label: "Cancelled", value: visits.filter((v) => v.status === "cancelled").length, icon: "❌", color: "from-red-400 to-pink-500", text: "from-red-500 to-pink-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow border border-gray-100">
              <div className={`w-9 h-9 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-lg mb-2 shadow`}>{s.icon}</div>
              <p className={`text-2xl font-bold bg-gradient-to-r ${s.text} bg-clip-text text-transparent`}>{s.value}</p>
              <p className="text-gray-500 text-xs font-semibold">{s.label}</p>
            </div>
          ))}
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
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading visits...</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
            <span className="text-5xl">📅</span>
            <p className="text-gray-500 mt-4 font-medium">No {activeTab === "upcoming" ? "upcoming visits" : "visit history"} yet</p>
            {activeTab === "upcoming" && (
              <button onClick={() => setShowForm(true)} className="mt-4 bg-orange-500 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">
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
                onComplete={() => handleMarkComplete(visit)}
                onCancel={() => handleCancel(visit.id)}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ScheduleVisitForm
          mrId={mrId}
          onClose={() => setShowForm(false)}
          onSaved={() => { refetch(); }}
        />
      )}

      {editVisit && (
        <CompleteVisitForm
          visit={editVisit}
          onClose={() => setEditVisit(null)}
          onSaved={() => { refetch(); }}
        />
      )}
    </div>
  );
}

function VisitCard({ visit, onComplete, onCancel }) {
  const date = new Date(visit.scheduled_date);
  const isUpcoming = visit.status === "scheduled";

  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-800 text-base">{visit.doctor_name || "Doctor"}</h3>
          <p className="text-sm text-gray-500">{visit.hospital || ""}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[visit.status] || "bg-gray-100 text-gray-600"}`}>
          {visit.status?.charAt(0).toUpperCase() + visit.status?.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
        <div className="bg-blue-50 rounded-lg p-2 border-l-4 border-blue-400">
          <p className="text-blue-500 font-semibold mb-0.5">📅 Date</p>
          <p className="font-bold text-gray-700">{date.toLocaleDateString()}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-2 border-l-4 border-orange-400">
          <p className="text-orange-500 font-semibold mb-0.5">⏰ Time</p>
          <p className="font-bold text-gray-700">{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-2 border-l-4 border-purple-400">
          <p className="text-purple-500 font-semibold mb-0.5">🎯 Purpose</p>
          <p className="font-bold text-gray-700">{visit.purpose || "—"}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 border-l-4 border-green-400">
          <p className="text-green-500 font-semibold mb-0.5">💊 Drugs</p>
          <p className="font-bold text-gray-700">{visit.drugs_discussed?.length || 0} selected</p>
        </div>
      </div>

      {visit.notes && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3 text-xs text-gray-600 border border-gray-100">
          <span className="font-semibold text-gray-700">Notes: </span>{visit.notes}
        </div>
      )}

      {isUpcoming && (
        <div className="flex space-x-2">
          <button onClick={onComplete} className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg font-semibold text-sm hover:bg-green-200 transition-all">
            ✅ Mark Complete
          </button>
          <button onClick={onCancel} className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-semibold text-sm hover:bg-red-200 transition-all">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ── Schedule Visit Form ──────────────────────────────────────────────────────
function ScheduleVisitForm({ mrId, onClose, onSaved }) {
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    doctor_id:      "",
    scheduled_date: "",
    scheduled_time: "",
    purpose:        "",
    drugs_discussed: [],
    notes:          "",
    location:       "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load assigned doctors + company drugs on open
  useEffect(() => {
    Promise.all([
      get(`/api/v1/mrs/${mrId}/assigned-doctors`).catch(() => ({ doctors: [] })),
      get(`/api/v1/drugs`).catch(() => ({ drugs: [] })),
    ]).then(([docData, drugData]) => {
      setAssignedDoctors(docData.doctors || []);
      setDrugs(drugData.drugs || []);
    }).finally(() => setLoadingData(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDrug = (drugId) => {
    setForm((prev) => ({
      ...prev,
      drugs_discussed: prev.drugs_discussed.includes(drugId)
        ? prev.drugs_discussed.filter((d) => d !== drugId)
        : [...prev.drugs_discussed, drugId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.doctor_id) { setError("Please select a doctor"); return; }
    if (!form.scheduled_date || !form.scheduled_time) { setError("Please set date and time"); return; }
    if (!form.purpose) { setError("Please select a purpose"); return; }

    setSaving(true);
    try {
      const scheduledAt = new Date(`${form.scheduled_date}T${form.scheduled_time}`).toISOString();
      await post(`/api/v1/visits`, {
        doctor_id:       form.doctor_id,
        scheduled_date:  scheduledAt,
        purpose:         form.purpose,
        drugs_discussed: form.drugs_discussed,
        notes:           form.notes,
        location:        form.location,
        status:          "scheduled",
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to schedule visit");
    } finally {
      setSaving(false);
    }
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>}

          {loadingData ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading doctors and drugs...</div>
          ) : (
            <>
              {/* Doctor */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Doctor <span className="text-red-500">*</span></label>
                <select
                  value={form.doctor_id}
                  onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm bg-white"
                >
                  <option value="">Select a doctor</option>
                  {assignedDoctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} — {d.specialization} · {d.hospital}</option>
                  ))}
                </select>
                {assignedDoctors.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No assigned doctors found. Contact your admin.</p>
                )}
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={form.scheduled_date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={form.scheduled_time}
                    onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Purpose <span className="text-red-500">*</span></label>
                <select
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm bg-white"
                >
                  <option value="">Select purpose</option>
                  {PURPOSE_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Doctor's clinic, Hospital OPD..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm"
                />
              </div>

              {/* Drugs to discuss */}
              {drugs.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Drugs to Discuss
                    {form.drugs_discussed.length > 0 && (
                      <span className="ml-2 bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                        {form.drugs_discussed.length} selected
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50">
                    {drugs.map((drug) => {
                      const selected = form.drugs_discussed.includes(drug.id || drug._id);
                      const id = drug.id || drug._id;
                      return (
                        <label key={id} className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all ${selected ? "bg-orange-100 border border-orange-300" : "bg-white border border-gray-200 hover:border-orange-200"}`}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleDrug(id)}
                            className="accent-orange-500 w-4 h-4"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{drug.brand_name || drug.drug_name}</p>
                            <p className="text-xs text-gray-400 truncate">{drug.drug_class || drug.specialization?.[0]}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any preparation notes, doctor preferences, topics to cover..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm resize-none"
                />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm">Cancel</button>
            <button type="submit" disabled={saving || loadingData}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 text-sm">
              {saving ? "Scheduling..." : "Schedule Visit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Complete Visit Form ──────────────────────────────────────────────────────
function CompleteVisitForm({ visit, onClose, onSaved }) {
  const [form, setForm] = useState({
    notes:           visit.notes || "",
    doctor_feedback: "",
    follow_up_date:  "",
    outcome:         "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const OUTCOMES = ["Positive — Doctor interested", "Neutral — Will consider", "Negative — Not interested", "Follow-up needed", "Sample requested"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await put(`/api/v1/visits/${visit.id}`, {
        status:          "completed",
        notes:           form.notes,
        doctor_feedback: form.doctor_feedback,
        outcome:         form.outcome,
        follow_up_date:  form.follow_up_date || undefined,
        completed_at:    new Date().toISOString(),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update visit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-5 rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">✅</span>
            <div>
              <h2 className="text-xl font-bold text-white">Complete Visit</h2>
              <p className="text-green-100 text-xs">{visit.doctor_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

          {/* Outcome */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Visit Outcome</label>
            <select
              value={form.outcome}
              onChange={(e) => setForm({ ...form, outcome: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm bg-white"
            >
              <option value="">Select outcome</option>
              {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Doctor feedback */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Doctor's Feedback</label>
            <textarea
              value={form.doctor_feedback}
              onChange={(e) => setForm({ ...form, doctor_feedback: e.target.value })}
              placeholder="What did the doctor say? Any concerns, questions, or interest shown..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm resize-none"
            />
          </div>

          {/* Visit notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Visit Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Summary of what was discussed..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm resize-none"
            />
          </div>

          {/* Follow-up date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Schedule Follow-up (optional)</label>
            <input
              type="date"
              value={form.follow_up_date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm"
            />
          </div>

          <div className="flex space-x-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 text-sm">
              {saving ? "Saving..." : "Mark as Completed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
