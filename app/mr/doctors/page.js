"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, post } from "@/lib/api";

const mrId = () => typeof window !== "undefined" ? localStorage.getItem("userId") : null;

export default function MRDoctors() {
  const [scheduleDoctor, setScheduleDoctor] = useState(null); // doctor to schedule visit with
  const [search, setSearch] = useState("");

  const id = mrId();

  // 1. Get assigned doctors
  const { data: mrData, isLoading: loadingMR } = useQuery({
    queryKey: ["mr-profile", id],
    queryFn:  () => get(`/api/v1/mrs/${id}`),
    enabled:  !!id,
    staleTime: 10 * 60 * 1000,
  });

  // 2. Get all visits (cached — shared with visits page)
  const { data: visitsData, isLoading: loadingVisits } = useQuery({
    queryKey: ["visits", id],
    queryFn:  () => get("/api/v1/visits").then((d) => d.visits || []),
    enabled:  !!id,
    staleTime: 2 * 60 * 1000,
  });

  const assignedDoctors = mrData?.assigned_doctors || [];
  const allVisits       = visitsData || [];
  const loading         = loadingMR || loadingVisits;

  // Group visits by doctor_id
  const visitsByDoctor = allVisits.reduce((acc, v) => {
    if (!acc[v.doctor_id]) acc[v.doctor_id] = [];
    acc[v.doctor_id].push(v);
    return acc;
  }, {});

  // Build doctor cards with visit stats
  const doctors = assignedDoctors
    .filter((d) => !search.trim() || d.name?.toLowerCase().includes(search.toLowerCase()))
    .map((d) => {
      const visits    = visitsByDoctor[d.id] || [];
      const completed = visits.filter((v) => v.status === "completed");
      const scheduled = visits.filter((v) => v.status === "scheduled");
      const lastVisit = visits.sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date))[0];
      const nextVisit = scheduled.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))[0];
      return { ...d, totalVisits: visits.length, completedVisits: completed.length, scheduledVisits: scheduled.length, lastVisit, nextVisit };
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <MRNavbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">My Doctors 👨‍⚕️</h1>
            <p className="text-gray-500 text-sm">Your assigned doctors and visit history</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Assigned",   value: assignedDoctors.length,                                    icon: "👨‍⚕️", color: "from-blue-500 to-indigo-500",   text: "from-blue-600 to-indigo-600" },
            { label: "Visited",    value: new Set(allVisits.map((v) => v.doctor_id)).size,            icon: "✅",  color: "from-green-500 to-emerald-500", text: "from-green-600 to-emerald-600" },
            { label: "Scheduled",  value: allVisits.filter((v) => v.status === "scheduled").length,   icon: "📅",  color: "from-orange-500 to-red-500",    text: "from-orange-600 to-red-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow border border-gray-100">
              <div className={`w-9 h-9 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-lg mb-2`}>{s.icon}</div>
              <p className={`text-2xl font-bold bg-gradient-to-r ${s.text} bg-clip-text text-transparent`}>
                {loading ? <span className="text-gray-200 animate-pulse">—</span> : s.value}
              </p>
              <p className="text-gray-500 text-xs font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-3 shadow border border-gray-100 mb-6">
          <input type="text" placeholder="🔍 Search doctors..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none" />
        </div>

        {/* Doctor cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow border border-gray-100 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[1,2,3].map((j) => <div key={j} className="h-14 bg-gray-100 rounded-xl" />)}
                </div>
                <div className="h-9 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
            <span className="text-5xl">👨‍⚕️</span>
            <p className="text-gray-500 mt-4 font-medium text-sm">
              {assignedDoctors.length === 0 ? "No doctors assigned yet. Contact your admin." : "No doctors match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} onSchedule={() => setScheduleDoctor(doctor)} />
            ))}
          </div>
        )}
      </main>

      {scheduleDoctor && (
        <QuickScheduleModal
          doctor={scheduleDoctor}
          mrId={id}
          onClose={() => setScheduleDoctor(null)}
        />
      )}
    </div>
  );
}

function DoctorCard({ doctor, onSchedule }) {
  const hasVisits = doctor.totalVisits > 0;
  const lastDate  = doctor.lastVisit?.scheduled_date;
  const nextDate  = doctor.nextVisit?.scheduled_date;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-red-400 to-pink-400" />
      <div className="p-5">
        {/* Doctor header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow flex-shrink-0">
            {doctor.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-800 truncate">{doctor.name}</h3>
            <p className="text-xs text-gray-400">
              {hasVisits ? `${doctor.totalVisits} visit${doctor.totalVisits !== 1 ? "s" : ""}` : "No visits yet"}
            </p>
          </div>
        </div>

        {/* Visit stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Total",     value: doctor.totalVisits,     color: "bg-gray-50 text-gray-700" },
            { label: "Done",      value: doctor.completedVisits, color: "bg-green-50 text-green-700" },
            { label: "Upcoming",  value: doctor.scheduledVisits, color: "bg-blue-50 text-blue-700" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-2 text-center`}>
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-70">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Last / Next visit */}
        <div className="space-y-1.5 mb-4 text-xs">
          {lastDate && (
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
              <span className="text-gray-400">🕐 Last visit</span>
              <span className="font-semibold text-gray-700 ml-auto">{lastDate}</span>
              <span className={`px-1.5 py-0.5 rounded font-bold ${
                doctor.lastVisit?.status === "completed" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
              }`}>{doctor.lastVisit?.status}</span>
            </div>
          )}
          {nextDate && (
            <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-2.5 py-1.5">
              <span className="text-blue-400">📅 Next visit</span>
              <span className="font-semibold text-blue-700 ml-auto">{nextDate}</span>
            </div>
          )}
          {!hasVisits && (
            <div className="bg-amber-50 rounded-lg px-2.5 py-1.5 text-amber-600 font-medium">
              ⚠️ Never visited — schedule one!
            </div>
          )}
        </div>

        <button onClick={onSchedule}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
          📅 Schedule Visit
        </button>
      </div>
    </div>
  );
}

// Inline quick schedule modal — pre-fills doctor
function QuickScheduleModal({ doctor, mrId, onClose }) {
  const queryClient = useQueryClient();

  const PURPOSE_OPTIONS = ["Drug Promotion","Follow-up","Relationship Building","Product Launch","Sample Distribution","Feedback Collection","Other"];

  const [form, setForm] = useState({ scheduled_date: "", scheduled_time: "", purpose: "", location: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.scheduled_date || !form.scheduled_time || !form.purpose) { setError("Date, time and purpose are required"); return; }
    setSaving(true);
    try {
      await post("/api/v1/visits", { doctor_id: doctor.id, ...form });
      queryClient.invalidateQueries({ queryKey: ["visits", mrId] });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to schedule");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
            {doctor.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Schedule Visit</h3>
            <p className="text-xs text-gray-400">{doctor.name}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Date *</label>
              <input type="date" value={form.scheduled_date} min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Time *</label>
              <input type="time" value={form.scheduled_time}
                onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Purpose *</label>
            <select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white">
              <option value="">Select purpose</option>
              {PURPOSE_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Doctor's clinic"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-sm">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50">
              {saving ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
