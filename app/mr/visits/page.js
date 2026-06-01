"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, post, put } from "@/lib/api";
import { formatISTDate } from "@/lib/time";

const STATUS_STYLES = {
  scheduled:   { bg: "bg-blue-100",   text: "text-blue-700",   label: "Scheduled" },
  checked_in:  { bg: "bg-amber-100",  text: "text-amber-700",  label: "Checked In" },
  checked_out: { bg: "bg-purple-100", text: "text-purple-700", label: "Report Pending" },
  completed:   { bg: "bg-green-100",  text: "text-green-700",  label: "Completed" },
  cancelled:   { bg: "bg-red-100",    text: "text-red-600",    label: "Cancelled" },
};

const PURPOSE_OPTIONS = [
  "Drug Promotion", "Follow-up", "Relationship Building",
  "Product Launch", "Sample Distribution", "Feedback Collection", "Other",
];

const to12h = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
};

// Get GPS position
const getGPS = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) return reject(new Error("GPS not supported"));
  navigator.geolocation.getCurrentPosition(
    (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
    (err) => reject(new Error("GPS permission denied")),
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

export default function MRVisits() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(null);
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const mrId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // MR profile for assigned doctors
  const { data: mrData, isLoading: loadingData } = useQuery({
    queryKey: ["mr-profile", mrId],
    queryFn: () => get(`/api/v1/mrs/${mrId}`),
    enabled: !!mrId,
    staleTime: 10 * 60 * 1000,
  });
  const assignedDoctors = mrData?.assigned_doctors || [];
  const assignedDrugs = mrData?.assigned_drugs || [];

  // Active visit check
  const { data: activeData, refetch: refetchActive } = useQuery({
    queryKey: ["visits-active"],
    queryFn: () => get("/api/v1/visits/active"),
    enabled: !!mrId,
    refetchInterval: 30000,
  });
  const activeVisit = activeData?.active_visit || null;
  const pendingReports = activeData?.pending_reports || 0;

  // Visits + targets
  const visitsQueryKey = ["visits", mrId, filterDoctor, filterDateFrom, filterDateTo];
  const { data: visitsResponse, isLoading: loadingVisits } = useQuery({
    queryKey: visitsQueryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterDoctor) params.append("doctor_id", filterDoctor);
      if (filterDateFrom) params.append("date_from", filterDateFrom);
      if (filterDateTo) params.append("date_to", filterDateTo);
      return get(`/api/v1/visits?${params}`);
    },
    enabled: !!mrId,
    staleTime: 0,
  });
  const visits = visitsResponse?.visits || [];
  const targets = visitsResponse?.targets || [];

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["visits"] });
    queryClient.invalidateQueries({ queryKey: ["visits-active"] });
  };

  // Actions
  const handleCheckIn = async (visitId) => {
    setActionLoading(visitId);
    try {
      const gps = await getGPS();
      await put(`/api/v1/visits/${visitId}/check-in`, gps);
      invalidateAll();
    } catch (err) {
      alert(err.message || "Failed to check in");
    }
    setActionLoading(null);
  };

  const handleCheckOut = async (visitId) => {
    setActionLoading(visitId);
    try {
      const gps = await getGPS();
      await put(`/api/v1/visits/${visitId}/check-out`, gps);
      invalidateAll();
    } catch (err) {
      alert(err.message || "Failed to check out");
    }
    setActionLoading(null);
  };

  const handleCancelCheckIn = async (visitId, reason) => {
    try {
      await put(`/api/v1/visits/${visitId}/cancel-checkin`, { reason });
      invalidateAll();
    } catch (err) {
      alert(err.message || "Failed to cancel check-in");
    }
  };

  const handleCancel = async (visitId, reason) => {
    try {
      await put(`/api/v1/visits/${visitId}/cancel`, { reason });
      invalidateAll();
    } catch (err) {
      alert(err.message || "Failed to cancel visit");
    }
  };

  const handleSchedule = async (formData) => {
    try {
      await post("/api/v1/visits", formData);
      invalidateAll();
    } catch (err) {
      alert(err.message || "Failed to schedule visit");
    }
    setShowScheduleForm(false);
  };

  const handleReport = async (visitId, reportData) => {
    try {
      await put(`/api/v1/visits/${visitId}/report`, reportData);
      invalidateAll();
      setShowReportForm(null);
    } catch (err) {
      alert(err.message || "Failed to submit report");
    }
  };

  const handleReschedule = async (visitId, data) => {
    try {
      await put(`/api/v1/visits/${visitId}/reschedule`, data);
      invalidateAll();
      setShowUpdateForm(null);
    } catch (err) {
      alert(err.message || "Failed to reschedule");
    }
  };

  const upcoming = visits.filter((v) => v.status === "scheduled" || v.status === "checked_in" || v.status === "checked_out");
  const history = visits.filter((v) => v.status === "completed" || v.status === "cancelled");
  const filteredHistory = historyFilter === "all" ? history : history.filter((v) => v.status === historyFilter);
  const displayed = activeTab === "upcoming" ? upcoming : filteredHistory;

  const canCheckIn = !activeVisit && pendingReports < 2;

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <MRNavbar />
      <main className="max-w-6xl mx-auto px-3 sm:px-5 lg:px-8 py-5 sm:py-7">
        <Breadcrumb />
{/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-0.5">Visits</h1>
            <p className="text-gray-400 text-sm">Schedule, track, and report your doctor visits</p>
          </div>
          <button onClick={() => setShowScheduleForm(true)}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm">
            <span>➕</span><span>Schedule Visit</span>
          </button>
        </div>

        {/* Active Visit Banner */}
        {activeVisit && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center text-white text-lg shadow-sm">
                <span className="animate-pulse">📍</span>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">Active Visit — {activeVisit.doctor_name}</p>
                <p className="text-xs text-amber-600">{activeVisit.location} · {activeVisit.duration_so_far_minutes} min elapsed</p>
              </div>
            </div>
            <button onClick={() => handleCheckOut(activeVisit.id)} disabled={actionLoading === activeVisit.id}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50">
              {actionLoading === activeVisit.id ? "..." : "Check Out →"}
            </button>
          </div>
        )}

        {/* Pending Reports Banner */}
        {pendingReports > 0 && !activeVisit && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-5 shadow-sm">
            <p className="text-sm font-bold text-purple-800">⚠️ {pendingReports} pending report{pendingReports > 1 ? "s" : ""} — submit to complete your visits</p>
          </div>
        )}

        {/* Monthly Targets + Stats in a row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-5">
          {/* Stats */}
          {[
            { label: "Scheduled", value: visits.filter((v) => v.status === "scheduled").length, accent: "border-l-blue-400", icon: "📅" },
            { label: "In Progress", value: visits.filter((v) => v.status === "checked_in" || v.status === "checked_out").length, accent: "border-l-amber-400", icon: "⏱️" },
            { label: "Completed", value: visits.filter((v) => v.status === "completed").length, accent: "border-l-emerald-400", icon: "✅" },
            { label: "Cancelled", value: visits.filter((v) => v.status === "cancelled").length, accent: "border-l-red-400", icon: "❌" },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-xl p-4 border border-gray-100 border-l-4 ${s.accent} shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-base">{s.icon}</span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm mb-5 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-semibold text-gray-400 mb-1">Doctor</label>
            <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-300 bg-white">
              <option value="">All</option>
              {assignedDoctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] font-semibold text-gray-400 mb-1">From</label>
            <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] font-semibold text-gray-400 mb-1">To</label>
            <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          {(filterDoctor || filterDateFrom || filterDateTo) && (
            <button onClick={() => { setFilterDoctor(""); setFilterDateFrom(""); setFilterDateTo(""); }}
              className="px-3 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-semibold hover:bg-gray-200">Clear</button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex space-x-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
            {[{ id: "upcoming", label: "📅 Active & Upcoming" }, { id: "history", label: "🕐 History" }].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${activeTab === t.id ? "bg-orange-500 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Sub-filter for history */}
          {activeTab === "history" && (
            <div className="flex gap-1.5">
              {[
                { id: "all", label: "All", count: history.length },
                { id: "completed", label: "Completed", count: history.filter((v) => v.status === "completed").length },
                { id: "cancelled", label: "Cancelled", count: history.filter((v) => v.status === "cancelled").length },
              ].map((f) => (
                <button key={f.id} onClick={() => setHistoryFilter(f.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${historyFilter === f.id ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main content: Visits + Targets sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Visit list — left 2 cols */}
          <div className="lg:col-span-2">
            {loadingVisits ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />)}</div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <span className="text-5xl">📅</span>
                <p className="text-gray-500 mt-4 font-medium text-sm">{activeTab === "upcoming" ? "No upcoming visits" : "No history yet"}</p>
              </div>
            ) : (
              <div className="space-y-3">
            {displayed.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                canCheckIn={canCheckIn}
                actionLoading={actionLoading}
                onCheckIn={() => handleCheckIn(visit.id)}
                onCheckOut={() => handleCheckOut(visit.id)}
                onCancelCheckIn={(reason) => handleCancelCheckIn(visit.id, reason)}
                onCancel={(reason) => handleCancel(visit.id, reason)}
                onReport={() => setShowReportForm(visit)}
                onReschedule={() => setShowUpdateForm(visit)}
              />
            ))}
          </div>
        )}
          </div>

          {/* ── Right Sidebar: Monthly Targets ── */}
          <div className="lg:col-span-1">
            {targets.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center"><span className="text-xs">🎯</span></div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Monthly Targets</p>
                    <p className="text-[10px] text-gray-400">{targets.filter((t) => t.completed >= t.required).length}/{targets.length} achieved</p>
                  </div>
                </div>

                {/* Overall progress ring */}
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray={`${targets.length > 0 ? Math.round((targets.filter((t) => t.completed >= t.required).length / targets.length) * 100) : 0}, 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-extrabold text-gray-900">{targets.length > 0 ? Math.round((targets.filter((t) => t.completed >= t.required).length / targets.length) * 100) : 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Doctor list */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {targets.map((t) => {
                    const pct = t.required > 0 ? Math.min(100, Math.round((t.completed / t.required) * 100)) : 0;
                    const met = t.completed >= t.required;
                    return (
                      <div key={t.doctor_id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${met ? "bg-emerald-400" : "bg-orange-400"}`} />
                            <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[100px]">{t.doctor_name}</span>
                          </div>
                          <span className={`text-[10px] font-bold ${met ? "text-emerald-600" : "text-gray-400"}`}>{t.completed}/{t.required}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${met ? "bg-emerald-400" : "bg-orange-400"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showScheduleForm && (
        <ScheduleForm assignedDoctors={assignedDoctors} onClose={() => setShowScheduleForm(false)} onSubmit={handleSchedule} />
      )}
      {showReportForm && (
        <ReportForm visit={showReportForm} assignedDrugs={assignedDrugs} onClose={() => setShowReportForm(null)} onSubmit={(data) => handleReport(showReportForm.id, data)} />
      )}
      {showUpdateForm && (
        <RescheduleForm visit={showUpdateForm} onClose={() => setShowUpdateForm(null)} onSubmit={(data) => handleReschedule(showUpdateForm.id, data)} />
      )}
    </div>
  );
}

// ── Visit Card ───────────────────────────────────────────────────────────────
function VisitCard({ visit, canCheckIn, actionLoading, onCheckIn, onCheckOut, onCancelCheckIn, onCancel, onReport, onReschedule }) {
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelCheckin, setShowCancelCheckin] = useState(false);
  const [cancelCheckinReason, setCancelCheckinReason] = useState("");

  const s = STATUS_STYLES[visit.status] || STATUS_STYLES.scheduled;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
      visit.status === "checked_in" ? "border-amber-200 bg-amber-50/30" :
      visit.status === "checked_out" ? "border-purple-200 bg-purple-50/20" :
      "border-gray-100 hover:shadow-md"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-800 text-sm">{visit.doctor_name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{visit.purpose} · {visit.location || "—"}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>{s.label}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3 text-xs">
        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">📅 {visit.scheduled_date}</span>
        <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg font-medium">⏰ {to12h(visit.scheduled_time)}</span>
        {visit.duration_minutes > 0 && <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-lg font-medium">⏱️ {visit.duration_minutes} min</span>}
      </div>

      {/* Completed visit report summary */}
      {visit.status === "completed" && visit.report && (
        <div className="bg-green-50 rounded-lg p-2.5 mb-3 text-xs border border-green-100 space-y-1">
          {visit.report.outcome && <p><span className="font-semibold text-green-700">Outcome:</span> {visit.report.outcome}</p>}
          {visit.report.doctor_mood && <p><span className="font-semibold text-green-700">Mood:</span> {visit.report.doctor_mood === "positive" ? "😊 Positive" : visit.report.doctor_mood === "negative" ? "😞 Negative" : "😐 Neutral"}</p>}
          {(visit.report.products_discussed || []).length > 0 && (
            <p><span className="font-semibold text-green-700">Products:</span> {visit.report.products_discussed.map((p) => typeof p === "string" ? p : p.name).join(", ")}</p>
          )}
          {visit.report.samples_given > 0 && <p><span className="font-semibold text-green-700">Samples:</span> {visit.report.samples_given}</p>}
          {visit.report.rx_commitment && <p><span className="font-semibold text-green-700">Rx Commitment:</span> Yes{visit.report.expected_rx_per_month ? ` (${visit.report.expected_rx_per_month}/mo)` : ""}</p>}
          {visit.report.competitor_info && <p><span className="font-semibold text-green-700">Competitor:</span> {visit.report.competitor_info}</p>}
          {visit.report.follow_up_date && <p><span className="font-semibold text-green-700">Follow-up:</span> {formatISTDate(visit.report.follow_up_date)}</p>}
          {visit.report.notes && <p><span className="font-semibold text-green-700">Notes:</span> {visit.report.notes}</p>}
        </div>
      )}

      {/* Check-in/Check-out GPS info */}
      {visit.status === "completed" && (visit.check_in || visit.check_out) && (
        <div className="bg-blue-50 rounded-lg p-2.5 mb-3 text-xs border border-blue-100 flex flex-wrap gap-3">
          {visit.check_in && (() => {
            const s = String(visit.check_in.timestamp);
            const d = s.endsWith("Z") || s.includes("+") ? new Date(s) : new Date(s + "Z");
            const t = !isNaN(d) ? d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }) : "—";
            return <span className="text-blue-700">📍 In: {t}</span>;
          })()}
          {visit.check_out && (() => {
            const s = String(visit.check_out.timestamp);
            const d = s.endsWith("Z") || s.includes("+") ? new Date(s) : new Date(s + "Z");
            const t = !isNaN(d) ? d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }) : "—";
            return <span className="text-blue-700">🏁 Out: {t}</span>;
          })()}
          {visit.duration_minutes > 0 && <span className="text-blue-700">⏱️ {visit.duration_minutes} min</span>}
        </div>
      )}

      {/* Cancelled reason */}
      {visit.status === "cancelled" && visit.cancel_reason && (
        <div className="bg-red-50 rounded-lg p-2.5 mb-3 text-xs text-red-600 border border-red-100">
          <span className="font-semibold">Reason:</span> {visit.cancel_reason}
        </div>
      )}

      {/* Action buttons based on status */}
      <div className="flex flex-wrap gap-2">
        {visit.status === "scheduled" && (
          <>
            <button onClick={onCheckIn} disabled={!canCheckIn || actionLoading === visit.id}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {actionLoading === visit.id ? "Getting GPS..." : "📍 Check In"}
            </button>
            <button onClick={onReschedule}
              className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-100 border border-blue-100 transition-all">
              Reschedule
            </button>
            <button onClick={() => setShowCancelReason(true)}
              className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-red-100 border border-red-100 transition-all">
              Cancel
            </button>
          </>
        )}

        {visit.status === "checked_in" && (
          <>
            <button onClick={onCheckOut} disabled={actionLoading === visit.id}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all disabled:opacity-50">
              {actionLoading === visit.id ? "Getting GPS..." : "🚪 Check Out"}
            </button>
            <button onClick={() => setShowCancelCheckin(true)}
              className="bg-gray-50 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-100 border border-gray-200 transition-all">
              Cancel Check-in
            </button>
          </>
        )}

        {visit.status === "checked_out" && (
          <button onClick={onReport}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all">
            📋 Submit Report
          </button>
        )}
      </div>

      {/* Cancel visit reason input */}
      {showCancelReason && (
        <div className="mt-3 bg-red-50 rounded-xl p-3 border border-red-100 space-y-2">
          <input type="text" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation..."
            className="w-full px-3 py-2 border border-red-200 rounded-lg text-xs outline-none" />
          <div className="flex gap-2">
            <button onClick={() => setShowCancelReason(false)} className="flex-1 bg-gray-100 text-gray-600 py-1.5 rounded-lg text-xs font-semibold">Back</button>
            <button onClick={() => { onCancel(cancelReason); setShowCancelReason(false); }} disabled={cancelReason.length < 5}
              className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50">Cancel Visit</button>
          </div>
        </div>
      )}

      {/* Cancel check-in reason input */}
      {showCancelCheckin && (
        <div className="mt-3 bg-amber-50 rounded-xl p-3 border border-amber-100 space-y-2">
          <input type="text" value={cancelCheckinReason} onChange={(e) => setCancelCheckinReason(e.target.value)}
            placeholder="Why cancel check-in? (e.g. Doctor unavailable)"
            className="w-full px-3 py-2 border border-amber-200 rounded-lg text-xs outline-none" />
          <div className="flex gap-2">
            <button onClick={() => setShowCancelCheckin(false)} className="flex-1 bg-gray-100 text-gray-600 py-1.5 rounded-lg text-xs font-semibold">Back</button>
            <button onClick={() => { onCancelCheckIn(cancelCheckinReason); setShowCancelCheckin(false); }} disabled={cancelCheckinReason.length < 5}
              className="flex-1 bg-amber-500 text-white py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50">Cancel Check-in</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Schedule Form ────────────────────────────────────────────────────────────
function ScheduleForm({ assignedDoctors, onClose, onSubmit }) {
  const [form, setForm] = useState({ doctor_id: "", scheduled_date: "", scheduled_time: "", purpose: "", location: "", notes: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.doctor_id || !form.scheduled_date || !form.scheduled_time || !form.purpose || !form.location) {
      setError("Doctor, date, time, purpose, and location are required");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">📅 Schedule Visit</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Doctor *</label>
            <select value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 bg-white">
              <option value="">Select doctor</option>
              {assignedDoctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Date *</label>
              <input type="date" value={form.scheduled_date} min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Time *</label>
              <input type="time" value={form.scheduled_time}
                onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Purpose *</label>
            <select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 bg-white">
              <option value="">Select purpose</option>
              {PURPOSE_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Location *</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Apollo Hospital, OPD Room 3"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Preparation notes..." rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold text-sm">Cancel</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl font-bold text-sm">Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Report Form (DCR) ────────────────────────────────────────────────────────
function ReportForm({ visit, assignedDrugs, onClose, onSubmit }) {
  const [form, setForm] = useState({
    doctor_mood: "", products_discussed: [], samples_given: 0,
    outcome: "", rx_commitment: false, expected_rx_per_month: 0,
    competitor_info: "", follow_up_date: "", notes: "",
  });
  const [error, setError] = useState("");

  const toggleDrug = (id) => {
    setForm((f) => ({
      ...f,
      products_discussed: f.products_discussed.includes(id)
        ? f.products_discussed.filter((d) => d !== id)
        : [...f.products_discussed, id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.outcome || form.outcome.length < 10) { setError("Outcome is required (min 10 characters)"); return; }
    if (!form.doctor_mood) { setError("Doctor mood is required"); return; }
    const body = { ...form };
    if (!body.competitor_info) delete body.competitor_info;
    if (!body.follow_up_date) delete body.follow_up_date;
    if (!body.notes) delete body.notes;
    if (body.samples_given === 0) delete body.samples_given;
    if (!body.rx_commitment) { delete body.rx_commitment; delete body.expected_rx_per_month; }
    onSubmit(body);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">📋 Visit Report</h2>
            <p className="text-purple-200 text-xs">{visit.doctor_name} · {visit.scheduled_date}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>}

          {/* Doctor Mood */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Doctor&apos;s Mood *</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ v: "positive", label: "😊 Positive", c: "border-green-400 bg-green-50 text-green-700" },
                { v: "neutral", label: "😐 Neutral", c: "border-yellow-400 bg-yellow-50 text-yellow-700" },
                { v: "negative", label: "😞 Negative", c: "border-red-400 bg-red-50 text-red-700" }].map((m) => (
                <button key={m.v} type="button" onClick={() => setForm({ ...form, doctor_mood: m.v })}
                  className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${form.doctor_mood === m.v ? m.c : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products Discussed */}
          {assignedDrugs.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Products Discussed</label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {assignedDrugs.map((d) => (
                  <button key={d.id} type="button" onClick={() => toggleDrug(d.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      form.products_discussed.includes(d.id) ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}>
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Samples + Outcome */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Samples Given</label>
              <input type="number" min="0" value={form.samples_given}
                onChange={(e) => setForm({ ...form, samples_given: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Follow-up Date</label>
              <input type="date" value={form.follow_up_date} min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Outcome * <span className="text-gray-400 font-normal">(min 10 chars)</span></label>
            <textarea value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })}
              placeholder="Describe the visit outcome..."
              rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-300 resize-none" />
          </div>

          {/* Rx Commitment */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <input type="checkbox" checked={form.rx_commitment} onChange={(e) => setForm({ ...form, rx_commitment: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-300" />
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700">Rx Commitment</p>
              <p className="text-[10px] text-gray-400">Doctor committed to prescribe</p>
            </div>
            {form.rx_commitment && (
              <input type="number" min="1" value={form.expected_rx_per_month}
                onChange={(e) => setForm({ ...form, expected_rx_per_month: parseInt(e.target.value) || 0 })}
                placeholder="Rx/mo"
                className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-center outline-none" />
            )}
          </div>

          {/* Competitor */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Competitor Info</label>
            <input type="text" value={form.competitor_info} onChange={(e) => setForm({ ...form, competitor_info: e.target.value })}
              placeholder="e.g. Cipla — Amlokind 5mg"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-300" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Additional Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any other observations..." rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-300 resize-none" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold text-sm">Cancel</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl font-bold text-sm">Submit Report</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Reschedule Form ──────────────────────────────────────────────────────────
function RescheduleForm({ visit, onClose, onSubmit }) {
  const [form, setForm] = useState({
    scheduled_date: visit.scheduled_date || "",
    scheduled_time: visit.scheduled_time || "",
    location: visit.location || "",
    reason: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.scheduled_date || !form.scheduled_time) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-5 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">🔄 Reschedule</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Date</label>
              <input type="date" value={form.scheduled_date} min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Time</label>
              <input type="time" value={form.scheduled_time}
                onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Reason</label>
            <input type="text" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Why rescheduling?"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold text-sm">Cancel</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2.5 rounded-xl font-bold text-sm">Reschedule</button>
          </div>
        </form>
      </div>
    </div>
  );
}
