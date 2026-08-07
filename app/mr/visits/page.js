"use client";
import { useState, useEffect, Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import MRSidebar from "@/components/mr/MRSidebar";
import NotificationBell from "@/components/NotificationBell";
import { get, post, put } from "@/lib/api";
import { formatISTDate } from "@/lib/time";
import LocationMapPicker from "@/components/LocationMapPicker";

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

const formatLoc = (loc) => loc && typeof loc === "object" ? loc.location_name || loc.temporary_location?.name || "" : loc || "";

// Get GPS position
const getGPS = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) return reject(new Error("GPS not supported"));
  navigator.geolocation.getCurrentPosition(
    (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
    (err) => reject(new Error("GPS permission denied")),
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

export default function MRVisitsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div>}>
      <MRVisits />
    </Suspense>
  );
}

function MRVisits() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(null); // visit object
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [commitmentPrompt, setCommitmentPrompt] = useState(null); // visit object after report submitted
  const [navigatingToRCPA, setNavigatingToRCPA] = useState(false);

  // Auto-open schedule modal if navigated with ?action=schedule
  useEffect(() => {
    if (searchParams.get("action") === "schedule") {
      setShowScheduleForm(true);
      // Clean up the URL
      router.replace("/mr/visits", { scroll: false });
    }
  }, [searchParams, router]);

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
  const handleCheckIn = (visit) => {
    // Only allow check-in on the scheduled date
    const todayStr = new Date().toISOString().split("T")[0];
    const scheduledDate = visit.scheduled_date ? visit.scheduled_date.split("T")[0] : "";
    if (scheduledDate && scheduledDate !== todayStr) {
      if (scheduledDate > todayStr) {
        alert(`This visit is scheduled for ${scheduledDate}. You can only check in on the day of the visit.`);
      } else {
        alert(`This visit was scheduled for ${scheduledDate}. You can no longer check in — the scheduled date has passed.`);
      }
      return;
    }
    setShowCheckInModal(visit);
  };

  const handleCheckInSubmit = async (visitId, photoFile) => {
    setActionLoading(visitId);
    try {
      const gps = await getGPS();
      const fd = new FormData();
      fd.append("latitude",  String(gps.latitude));
      fd.append("longitude", String(gps.longitude));
      if (photoFile) fd.append("photo", photoFile);
      await put(`/api/v1/visits/${visitId}/check-in`, fd);
      invalidateAll();
      setShowCheckInModal(null);
    } catch (err) {
      setActionLoading(null);
      // Bubble error message back to the modal
      throw err;
    }
    setActionLoading(null);
  };

  const handleCheckOut = async (visitId) => {
    setActionLoading(visitId);
    try {
      const gps = await getGPS();
      await put(`/api/v1/visits/${visitId}/check-out`, { latitude: gps.latitude, longitude: gps.longitude });
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

  const [scheduleError, setScheduleError] = useState("");

  const handleSchedule = async (formData) => {
    setScheduleError("");
    try {
      await post("/api/v1/visits", formData);
      invalidateAll();
      setShowScheduleForm(false);
    } catch (err) {
      const msg = err?.data?.detail || err?.message || "Failed to schedule visit";
      const detail = Array.isArray(msg) ? msg.map((d) => typeof d === "string" ? d : d.msg || JSON.stringify(d)).join(", ") : String(msg);
      setScheduleError(detail);
    }
  };

  const handleReport = async (visitId, reportData) => {
    try {
      await put(`/api/v1/visits/${visitId}/report`, reportData);

      // Auto-schedule follow-up visit if a follow_up_date was provided
      if (reportData.follow_up_date) {
        const visit = visits.find((v) => v.id === visitId);
        if (visit) {
          try {
            await post("/api/v1/visits", {
              doctor_id: visit.doctor_id,
              scheduled_date: reportData.follow_up_date,
              scheduled_time: visit.scheduled_time || "09:00",
              purpose: "Follow-up",
              location: visit.location || { type: "permanent", location_name: "Follow-up" },
              notes: `Auto-scheduled follow-up from visit on ${visit.scheduled_date}`,
            });
          } catch {
            // Follow-up scheduling failure is non-critical
          }
        }
      }

      invalidateAll();
      const completedVisit = visits.find((v) => v.id === visitId);
      setShowReportForm(null);
      // Show commitment prompt
      setCommitmentPrompt(completedVisit || { id: visitId });
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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "MR" : "MR";

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex">
      <MRSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`${sidebarCollapsed ? "md:ml-[60px]" : "md:ml-[220px]"} flex-1 min-h-screen transition-all duration-300`}>
        {/* Top Bar */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100/80 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(true)} className="md:hidden w-9 h-9 rounded-lg bg-gray-100 hover:bg-purple-50 flex items-center justify-center text-gray-600 hover:text-purple-600 transition-all mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
              <span className="font-medium">Visakhapatnam, AP</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell accentColor="indigo" />
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{userName.charAt(0).toUpperCase()}</div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{userName.split(" ")[0]} {userName.split(" ")[1]?.charAt(0) || ""}.</p>
                <p className="text-[10px] text-gray-400">MR - Field Executive</p>
              </div>
            </div>
          </div>
        </header>

      <main className="px-4 md:px-6 py-4 md:py-5">
{/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-0.5">Visits</h1>
            <p className="text-gray-400 text-xs">Track and manage all your doctor visits</p>
          </div>
          <button onClick={() => setShowScheduleForm(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-xs">
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
                <p className="text-xs text-amber-600">{formatLoc(activeVisit.location)} · {activeVisit.duration_so_far_minutes} min elapsed</p>
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
          <div className={`rounded-2xl p-4 mb-5 shadow-sm ${pendingReports >= 2 ? "bg-red-50 border border-red-200" : "bg-purple-50 border border-purple-200"}`}>
            <p className={`text-sm font-bold ${pendingReports >= 2 ? "text-red-800" : "text-purple-800"}`}>
              ⚠️ {pendingReports} pending report{pendingReports > 1 ? "s" : ""} — submit to complete your visits
            </p>
            {pendingReports >= 2 && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">
                🚫 Check-in is blocked until you submit at least one pending report. You cannot have more than 2 pending reports.
              </p>
            )}
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
              <option value="">All</option>
              {assignedDoctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] font-semibold text-gray-400 mb-1">From</label>
            <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] font-semibold text-gray-400 mb-1">To</label>
            <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-300" />
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
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${activeTab === t.id ? "bg-indigo-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
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
                onCheckIn={() => handleCheckIn(visit)}
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
                  <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center"><span className="text-xs">🎯</span></div>
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
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray={`${targets.length > 0 ? Math.round((targets.reduce((a, t) => a + Math.min(t.completed / Math.max(t.required, 1), 1), 0) / targets.length) * 100) : 0}, 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-extrabold text-gray-900">{targets.length > 0 ? Math.round((targets.reduce((a, t) => a + Math.min(t.completed / Math.max(t.required, 1), 1), 0) / targets.length) * 100) : 0}%</span>
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
                            <span className={`w-1.5 h-1.5 rounded-full ${met ? "bg-emerald-400" : "bg-indigo-400"}`} />
                            <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[100px]">{t.doctor_name}</span>
                          </div>
                          <span className={`text-[10px] font-bold ${met ? "text-emerald-600" : "text-gray-400"}`}>{t.completed}/{t.required}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${met ? "bg-emerald-400" : "bg-indigo-400"}`} style={{ width: `${pct}%` }} />
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
        <ScheduleForm assignedDoctors={assignedDoctors} onClose={() => { setShowScheduleForm(false); setScheduleError(""); }} onSubmit={handleSchedule} serverError={scheduleError} />
      )}
      {showReportForm && (
        <ReportForm visit={showReportForm} assignedDrugs={assignedDrugs} onClose={() => setShowReportForm(null)} onSubmit={(data) => handleReport(showReportForm.id, data)} />
      )}
      {showUpdateForm && (
        <RescheduleForm visit={showUpdateForm} onClose={() => setShowUpdateForm(null)} onSubmit={(data) => handleReschedule(showUpdateForm.id, data)} />
      )}
      {showCheckInModal && (
        <CheckInModal
          visit={showCheckInModal}
          loading={actionLoading === showCheckInModal.id}
          onClose={() => setShowCheckInModal(null)}
          onSubmit={(photoFile) => handleCheckInSubmit(showCheckInModal.id, photoFile)}
        />
      )}
      {/* Rx Commitment Prompt — shown after report submitted */}
      {commitmentPrompt && !navigatingToRCPA && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-center">
              <span className="text-4xl block mb-2">✅</span>
              <h2 className="text-lg font-bold text-white">Report Submitted!</h2>
              <p className="text-emerald-100 text-xs mt-1">{commitmentPrompt.doctor_name || "Visit"} · {commitmentPrompt.scheduled_date || ""}</p>
            </div>
            <div className="p-5 text-center space-y-4">
              <p className="text-sm font-bold text-gray-800">Did the doctor give an Rx Commitment?</p>
              <p className="text-xs text-gray-400">If yes, you can log the prescription commitment now</p>
              <div className="flex gap-3">
                <button onClick={() => setCommitmentPrompt(null)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
                  No, skip
                </button>
                <button onClick={() => {
                  const visitId = commitmentPrompt.id;
                  setNavigatingToRCPA(true);
                  setTimeout(() => {
                    setCommitmentPrompt(null);
                    setNavigatingToRCPA(false);
                    router.push(`/mr/sfe?tab=rcpa&visitId=${visitId}`);
                  }, 1200);
                }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold text-sm hover:shadow-lg transition-all">
                  Yes, log commitment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigating animation */}
      {navigatingToRCPA && (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 to-red-500 z-50 flex flex-col items-center justify-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-4xl animate-bounce">💊</span>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-white font-extrabold text-xl">Opening RCPA</p>
            <p className="text-indigo-100 text-sm mt-1">Taking you to log commitment...</p>
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map((i) => (
              <div key={i} className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

// ── Visit Card ───────────────────────────────────────────────────────────────
function VisitCard({ visit, canCheckIn, actionLoading, onCheckIn, onCheckOut, onCancelCheckIn, onCancel, onReport, onReschedule }) {
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelCheckin, setShowCancelCheckin] = useState(false);
  const [cancelCheckinReason, setCancelCheckinReason] = useState("");
  const [expanded, setExpanded] = useState(false);

  const s = STATUS_STYLES[visit.status] || STATUS_STYLES.scheduled;
  const report = visit.report || {};
  const isCompleted = visit.status === "completed";
  const isCancelled = visit.status === "cancelled";

  // Score color based on mood/outcome
  const moodColor = report.doctor_mood === "positive" ? "bg-indigo-100 text-indigo-700" :
                    report.doctor_mood === "negative" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500";

  return (
    <div className={`bg-white rounded-2xl border transition-all hover:shadow-md overflow-hidden ${
      visit.status === "checked_in" ? "border-amber-200" :
      visit.status === "checked_out" ? "border-purple-200" :
      isCancelled ? "border-red-100 opacity-75" :
      "border-gray-100"
    }`}>
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        {/* Left: Doctor info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-sm truncate">{visit.doctor_name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${s.color || `${s.bg} ${s.text}`}`}>{s.label}</span>
          </div>
          <p className="text-xs text-gray-400">{visit.title ? `${visit.title} · ` : ""}{visit.purpose}{formatLoc(visit.location) ? ` · ${formatLoc(visit.location)}` : ""}</p>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500 flex-wrap">
            <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">📅 {visit.scheduled_date}</span>
            <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">⏰ {to12h(visit.scheduled_time)}</span>
            {(() => {
              let durationText = "";
              if (visit.duration_minutes && visit.duration_minutes > 0) {
                durationText = `${visit.duration_minutes}m`;
              } else if (visit.check_in?.timestamp && visit.check_out?.timestamp) {
                const inTime = new Date(visit.check_in.timestamp);
                const outTime = new Date(visit.check_out.timestamp);
                const diffMs = outTime - inTime;
                if (!isNaN(diffMs) && diffMs > 0) {
                  const diffSecs = Math.floor(diffMs / 1000);
                  if (diffSecs < 60) {
                    durationText = `${diffSecs}s`;
                  } else {
                    durationText = `${Math.round(diffMs / 60000)}m`;
                  }
                }
              }
              return durationText ? <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">⏱️ {durationText}</span> : null;
            })()}
          </div>
        </div>

        {/* Middle: Report summary (if completed) */}
        {isCompleted && report.outcome && (
          <div className="hidden sm:flex flex-col items-start gap-1 min-w-[140px] max-w-[200px]">
            <p className="text-[10px] text-gray-400 font-medium">Outcome</p>
            <p className="text-[11px] text-gray-700 font-medium line-clamp-2">{report.outcome}</p>
            {report.samples_given > 0 && (
              <p className="text-[10px] text-gray-500">{report.samples_given} samples</p>
            )}
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {visit.status === "scheduled" && (
            <>
              {(() => {
                const todayStr = new Date().toISOString().split("T")[0];
                const visitDate = visit.scheduled_date ? visit.scheduled_date.split("T")[0] : "";
                const isToday  = !visitDate || visitDate === todayStr;
                const isPast   = visitDate && visitDate < todayStr;
                const isFuture = visitDate && visitDate > todayStr;
                return (
                  <div className="flex flex-col gap-1">
                    <button onClick={onCheckIn}
                      disabled={!canCheckIn || actionLoading === visit.id || !isToday}
                      title={!canCheckIn ? "Submit pending reports first (max 2 allowed)" : isFuture ? `Scheduled for ${visitDate} — check in on that day` : isPast ? `Missed — scheduled date has passed` : ""}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-[11px] shadow-sm transition-all disabled:opacity-40 whitespace-nowrap">
                      {actionLoading === visit.id ? "..." : "📍 Check In"}
                    </button>
                    {!canCheckIn && isToday && <p className="text-[9px] text-red-400 font-medium text-center">Submit reports first</p>}
                    {isFuture && <p className="text-[9px] text-blue-500 font-medium text-center">Scheduled: {visitDate}</p>}
                    {isPast   && <p className="text-[9px] text-red-400 font-medium text-center">Date passed</p>}
                  </div>
                );
              })()}
              <div className="flex gap-1">
                <button onClick={onReschedule} className="flex-1 bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg font-bold text-[10px] hover:bg-blue-100 transition-all text-center">Reschedule</button>
                <button onClick={() => setShowCancelReason(true)} className="flex-1 bg-red-50 text-red-500 px-2.5 py-1.5 rounded-lg font-bold text-[10px] hover:bg-red-100 transition-all text-center">Cancel</button>
              </div>
            </>
          )}
          {visit.status === "checked_in" && (
            <>
              <button onClick={onCheckOut} disabled={actionLoading === visit.id}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-[11px] shadow-sm transition-all disabled:opacity-50 whitespace-nowrap">
                {actionLoading === visit.id ? "..." : "🚪 Check Out"}
              </button>
              <button onClick={() => setShowCancelCheckin(true)} className="bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-lg font-bold text-[10px] hover:bg-gray-100 border border-gray-200 transition-all text-center">Cancel Check-in</button>
            </>
          )}
          {visit.status === "checked_out" && (
            <button onClick={onReport} className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2 rounded-xl font-bold text-[11px] shadow-sm transition-all whitespace-nowrap">📋 Submit Report</button>
          )}
          {(isCompleted || isCancelled) && (
            <button onClick={() => setExpanded(!expanded)} className="bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-bold text-[10px] border border-gray-200 transition-all text-center">
              {expanded ? "▲ Less" : "▼ Details"}
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 animate-[fadeSlide_0.2s_ease-out] space-y-4">
          {/* Temporary location special card */}
          {visit.location && typeof visit.location === "object" && visit.location.type === "temporary" && visit.location.temporary_location && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-amber-800 text-xs">
              <p className="font-bold mb-0.5">📍 Temporary Location Details</p>
              <p className="font-medium">{visit.location.temporary_location.name} — {visit.location.temporary_location.address}</p>
              {visit.location.temporary_location.reason && (
                <p className="italic text-[11px] mt-1 opacity-70">"Reason: {visit.location.temporary_location.reason}"</p>
              )}
            </div>
          )}

          {/* Tracking Panel */}
          {(visit.check_in || visit.check_out) && (
            <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">🗺️ Location & Timing</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Check-In */}
                {visit.check_in && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[10px] text-slate-400 uppercase">Check-In</span>
                      <span className="text-slate-700 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">
                        {(() => { const s = String(visit.check_in.timestamp); const d = s.endsWith("Z") || s.includes("+") ? new Date(s) : new Date(s + "Z"); return !isNaN(d) ? d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }) : "—"; })()}
                      </span>
                    </div>
                    {visit.check_in.latitude && (
                      <div className="bg-white p-2 rounded border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold">Coordinates</span>
                        <a href={`https://maps.google.com/?q=${visit.check_in.latitude},${visit.check_in.longitude}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-mono text-[10px] truncate block">
                          {visit.check_in.latitude.toFixed(6)}, {visit.check_in.longitude.toFixed(6)} ↗
                        </a>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {visit.check_in.geofence_status && (
                        <div className={`flex-1 p-2 rounded border ${visit.check_in.geofence_status === "inside" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"}`}>
                          <span className="text-[9px] block font-bold">Geofence</span>
                          <span className="font-extrabold">{visit.check_in.geofence_status === "inside" ? "Inside" : "Outside"}</span>
                        </div>
                      )}
                      {visit.check_in.distance_from_location != null && (
                        <div className="flex-1 bg-white p-2 rounded border border-slate-100 text-slate-700">
                          <span className="text-[9px] text-slate-400 block font-bold">Distance</span>
                          <span className="font-extrabold">{visit.check_in.distance_from_location < 0.1 ? `${Math.round(visit.check_in.distance_from_location * 1000)}m` : `${visit.check_in.distance_from_location.toFixed(2)}km`}</span>
                        </div>
                      )}
                    </div>
                    {visit.check_in.photo_url && (
                      <div className="mt-1 rounded overflow-hidden border border-slate-200">
                        <a href={visit.check_in.photo_url} target="_blank" rel="noreferrer">
                          <img src={visit.check_in.photo_url} alt="Check-in capture" className="w-full h-20 object-cover" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Check-Out */}
                {visit.check_out && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[10px] text-slate-400 uppercase">Check-Out</span>
                      <span className="text-slate-700 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">
                        {(() => { const s = String(visit.check_out.timestamp); const d = s.endsWith("Z") || s.includes("+") ? new Date(s) : new Date(s + "Z"); return !isNaN(d) ? d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }) : "—"; })()}
                      </span>
                    </div>
                    {visit.check_out.latitude && (
                      <div className="bg-white p-2 rounded border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold">Coordinates</span>
                        <a href={`https://maps.google.com/?q=${visit.check_out.latitude},${visit.check_out.longitude}`} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline font-mono text-[10px] truncate block">
                          {visit.check_out.latitude.toFixed(6)}, {visit.check_out.longitude.toFixed(6)} ↗
                        </a>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {visit.check_out.geofence_status && (
                        <div className={`flex-1 p-2 rounded border ${visit.check_out.geofence_status === "inside" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"}`}>
                          <span className="text-[9px] block font-bold">Geofence</span>
                          <span className="font-extrabold">{visit.check_out.geofence_status === "inside" ? "Inside" : "Outside"}</span>
                        </div>
                      )}
                      {visit.check_out.distance_from_location != null && (
                        <div className="flex-1 bg-white p-2 rounded border border-slate-100 text-slate-700">
                          <span className="text-[9px] text-slate-400 block font-bold">Distance</span>
                          <span className="font-extrabold">{visit.check_out.distance_from_location < 0.1 ? `${Math.round(visit.check_out.distance_from_location * 1000)}m` : `${visit.check_out.distance_from_location.toFixed(2)}km`}</span>
                        </div>
                      )}
                    </div>
                    {visit.check_out.photo_url && (
                      <div className="mt-1 rounded overflow-hidden border border-slate-200">
                        <a href={visit.check_out.photo_url} target="_blank" rel="noreferrer">
                          <img src={visit.check_out.photo_url} alt="Check-out capture" className="w-full h-20 object-cover" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DCR Report Panel */}
          {isCompleted && report && Object.keys(report).length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {report.doctor_mood && (
                  <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Mood</p>
                    <p className="text-xs font-black mt-0.5">{report.doctor_mood === "positive" ? "😊 Positive" : report.doctor_mood === "negative" ? "😞 Negative" : "😐 Neutral"}</p>
                  </div>
                )}
                {report.samples_given != null && (
                  <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Samples</p>
                    <p className="text-xs font-black mt-0.5">{report.samples_given}</p>
                  </div>
                )}
                {report.competitor_info && (
                  <div className="bg-white rounded-lg p-2.5 border border-red-100 text-red-700">
                    <p className="text-[9px] text-red-400 uppercase font-bold">Competitor</p>
                    <p className="text-xs font-black mt-0.5">{report.competitor_info}</p>
                  </div>
                )}
                {(() => {
                  let durText = "";
                  if (visit.duration_minutes && visit.duration_minutes > 0) {
                    durText = `${visit.duration_minutes} min`;
                  } else if (visit.check_in?.timestamp && visit.check_out?.timestamp) {
                    const inTime = new Date(visit.check_in.timestamp);
                    const outTime = new Date(visit.check_out.timestamp);
                    const diffMs = outTime - inTime;
                    if (!isNaN(diffMs) && diffMs > 0) {
                      const diffSecs = Math.floor(diffMs / 1000);
                      durText = diffSecs < 60 ? `${diffSecs} sec` : `${Math.round(diffMs / 60000)} min`;
                    }
                  }
                  return durText ? (
                    <div className="bg-white rounded-lg p-2.5 border border-blue-100 text-blue-700">
                      <p className="text-[9px] text-blue-400 uppercase font-bold">Duration</p>
                      <p className="text-xs font-black mt-0.5">⏱️ {durText}</p>
                    </div>
                  ) : null;
                })()}
              </div>

              {(report.products_discussed || []).length > 0 && (
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Products Discussed</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.products_discussed.map((p, pi) => (
                      <span key={pi} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-semibold border border-blue-100">
                        💊 {typeof p === "string" ? p : p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {report.outcome && (
                <div className="bg-white rounded-xl p-3 border-l-4 border-l-indigo-400 border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Outcome</p>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">{report.outcome}</p>
                </div>
              )}
              {report.notes && (
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">General Notes</p>
                  <p className="text-xs text-gray-600 italic leading-relaxed">{report.notes}</p>
                </div>
              )}
            </div>
          )}
          {isCancelled && visit.cancel_reason && (
            <div className="bg-red-50 rounded-xl p-3 border border-red-100 text-red-800 text-xs">
              <span className="font-bold">Cancellation Reason:</span> {visit.cancel_reason}
            </div>
          )}
        </div>
      )}

      {/* Cancel reason inputs */}
      {showCancelReason && (
        <div className="mx-4 mb-4 bg-red-50 rounded-xl p-3 border border-red-100 space-y-2">
          <input type="text" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." className="w-full px-3 py-2 border border-red-200 rounded-lg text-xs outline-none" />
          <div className="flex gap-2">
            <button onClick={() => setShowCancelReason(false)} className="flex-1 bg-gray-100 text-gray-600 py-1.5 rounded-lg text-xs font-semibold">Back</button>
            <button onClick={() => { onCancel(cancelReason); setShowCancelReason(false); }} disabled={cancelReason.length < 5} className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50">Cancel Visit</button>
          </div>
        </div>
      )}
      {showCancelCheckin && (
        <div className="mx-4 mb-4 bg-amber-50 rounded-xl p-3 border border-amber-100 space-y-2">
          <input type="text" value={cancelCheckinReason} onChange={(e) => setCancelCheckinReason(e.target.value)} placeholder="Why cancel check-in?" className="w-full px-3 py-2 border border-amber-200 rounded-lg text-xs outline-none" />
          <div className="flex gap-2">
            <button onClick={() => setShowCancelCheckin(false)} className="flex-1 bg-gray-100 text-gray-600 py-1.5 rounded-lg text-xs font-semibold">Back</button>
            <button onClick={() => { onCancelCheckIn(cancelCheckinReason); setShowCancelCheckin(false); }} disabled={cancelCheckinReason.length < 5} className="flex-1 bg-amber-500 text-white py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50">Cancel Check-in</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Schedule Form ────────────────────────────────────────────────────────────
function ScheduleForm({ assignedDoctors, onClose, onSubmit, serverError }) {
  const [doctorId, setDoctorId] = useState("");
  const [title, setTitle] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [locationType, setLocationType] = useState("permanent"); // "permanent" | "temporary"
  const [locationId, setLocationId] = useState("");
  const [locationName, setLocationName] = useState("");
  const [tempName, setTempName] = useState("");
  const [tempAddress, setTempAddress] = useState("");
  const [tempLatitude, setTempLatitude] = useState("");
  const [tempLongitude, setTempLongitude] = useState("");
  const [tempReason, setTempReason] = useState("");
  const [clinicLocations, setClinicLocations] = useState([]);
  const [loadingLocs, setLoadingLocs] = useState(false);
  const [error, setError] = useState("");

  // Fetch clinic locations when doctor changes
  useEffect(() => {
    if (!doctorId) { setClinicLocations([]); setLocationId(""); setLocationName(""); return; }
    setLoadingLocs(true);
    get(`/api/v1/doctors/${doctorId}/locations`)
      .then((data) => {
        const locs = data.locations || data || [];
        setClinicLocations(locs);
        setLocationId("");
        setLocationName("");
      })
      .catch(() => setClinicLocations([]))
      .finally(() => setLoadingLocs(false));
  }, [doctorId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!doctorId || !scheduledDate || !scheduledTime || !purpose || !title) {
      setError("Doctor, title, date, time, and purpose are required");
      return;
    }
    if (title.length < 2 || title.length > 200) {
      setError("Title must be between 2 and 200 characters");
      return;
    }
    const todayStr = new Date().toISOString().split("T")[0];
    if (scheduledDate < todayStr) {
      setError("Cannot schedule a visit in the past.");
      return;
    }
    if (locationType === "permanent" && !locationId) {
      setError("Please select a clinic location");
      return;
    }
    if (locationType === "temporary" && (!tempName || !tempAddress)) {
      setError("Temporary location name and address are required");
      return;
    }
    if (locationType === "temporary" && tempLatitude && isNaN(parseFloat(tempLatitude))) {
      setError("Latitude must be a valid number (e.g. 17.4401)");
      return;
    }
    if (locationType === "temporary" && tempLongitude && isNaN(parseFloat(tempLongitude))) {
      setError("Longitude must be a valid number (e.g. 78.3489)");
      return;
    }

    const location = locationType === "permanent"
      ? { type: "permanent", location_id: locationId, location_name: locationName }
      : { type: "temporary", temporary_location: { name: tempName, address: tempAddress, latitude: parseFloat(tempLatitude) || null, longitude: parseFloat(tempLongitude) || null, reason: tempReason } };

    onSubmit({ doctor_id: doctorId, title, scheduled_date: scheduledDate, scheduled_time: scheduledTime, purpose, notes, location });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-red-500 p-5 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">📅 Schedule Visit</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {(error || serverError) && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error || serverError}</div>}

          {/* Doctor */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Doctor *</label>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
              <option value="">Select doctor</option>
              {assignedDoctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Visit Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Amlodipine 5mg Presentation"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Date *</label>
              <input type="date" value={scheduledDate} min={new Date().toISOString().split("T")[0]}
                onChange={(e) => { setScheduledDate(e.target.value); setError(""); }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Time *</label>
              <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Purpose *</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
              <option value="">Select purpose</option>
              {PURPOSE_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Location Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Location *</label>
            <div className="flex gap-2 mb-3">
              <button type="button"
                onClick={() => setLocationType("permanent")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  locationType === "permanent"
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}>
                🏥 Clinic Location
              </button>
              <button type="button"
                onClick={() => setLocationType("temporary")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  locationType === "temporary"
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}>
                📍 Temporary Location
              </button>
            </div>

            {/* Clinic location dropdown */}
            {locationType === "permanent" && (
              <div>
                {loadingLocs ? (
                  <div className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400">Loading locations…</div>
                ) : clinicLocations.length === 0 ? (
                  <div className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400">
                    {doctorId ? "No clinic locations found for this doctor" : "Select a doctor first"}
                  </div>
                ) : (
                  <select
                    value={locationId}
                    onChange={(e) => {
                      const sel = clinicLocations.find((l) => l.id === e.target.value);
                      setLocationId(e.target.value);
                      setLocationName(sel ? sel.name || sel.location_name || "" : "");
                    }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                    <option value="">Select clinic location</option>
                    {clinicLocations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name || l.location_name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Temporary location fields + map */}
            {locationType === "temporary" && (
              <div className="space-y-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">Location Name *</label>
                  <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)}
                    placeholder="e.g. Patient Home, Conference Hall"
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">Address *</label>
                  <input type="text" value={tempAddress} onChange={(e) => setTempAddress(e.target.value)}
                    placeholder="Full address"
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">Reason for Temporary Location</label>
                  <input type="text" value={tempReason} onChange={(e) => setTempReason(e.target.value)}
                    placeholder="Why visiting here instead?"
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">Pick Location on Map</label>
                  <LocationMapPicker
                    value={tempAddress}
                    lat={tempLatitude}
                    lng={tempLongitude}
                    onChange={({ latitude, longitude, address }) => {
                      setTempLatitude(String(latitude));
                      setTempLongitude(String(longitude));
                      if (address && !tempAddress) setTempAddress(address);
                    }}
                  />
                  {tempLatitude && tempLongitude && !isNaN(parseFloat(tempLatitude)) && (
                    <p className="text-[10px] text-amber-700 mt-1 font-mono">
                      📍 {parseFloat(tempLatitude).toFixed(5)}, {parseFloat(tempLongitude).toFixed(5)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Preparation notes..." rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold text-sm">Cancel</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-red-500 text-white py-2.5 rounded-xl font-bold text-sm">Schedule</button>
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
    outcome: "", competitor_info: "", follow_up_date: "", notes: "",
  });
  const [error, setError] = useState("");

  // Fetch drugs as fallback if assignedDrugs is empty
  const { data: drugsData } = useQuery({
    queryKey: ["drugs-for-report"],
    queryFn: () => get("/api/v1/drugs?limit=200").then((d) => d.drugs || []),
    enabled: !assignedDrugs || assignedDrugs.length === 0,
    staleTime: 7 * 60 * 1000,
  });

  const drugsList = (assignedDrugs && assignedDrugs.length > 0)
    ? assignedDrugs.map((d) => ({ id: d.id || d._id, name: d.name || d.drug_name || d.brand_name }))
    : (drugsData || []).map((d) => ({ id: d._id || d.id, name: d.drug_name || d.brand_name || d.name || "Drug" }));

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

    onSubmit(body);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-red-500 p-5 rounded-t-2xl flex items-center justify-between">
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
          {drugsList.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Products Discussed</label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {drugsList.map((d) => (
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
            <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-red-500 text-white py-2.5 rounded-xl font-bold text-sm">Submit Report</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Reschedule Form ──────────────────────────────────────────────────────────
function RescheduleForm({ visit, onClose, onSubmit }) {
  const existingLoc = visit.location;
  const initType = existingLoc && typeof existingLoc === "object" ? existingLoc.type : "permanent";
  const initLocId = existingLoc?.location_id || "";
  const initLocName = existingLoc?.location_name || (typeof existingLoc === "string" ? existingLoc : "");
  const initTempLoc = existingLoc?.temporary_location || {};

  const [scheduledDate, setScheduledDate] = useState(visit.scheduled_date || "");
  const [scheduledTime, setScheduledTime] = useState(visit.scheduled_time || "");
  const [reason, setReason] = useState("");
  const [locationType, setLocationType] = useState(initType);
  const [locationId, setLocationId] = useState(initLocId);
  const [locationName, setLocationName] = useState(initLocName);
  const [tempName, setTempName] = useState(initTempLoc.name || "");
  const [tempAddress, setTempAddress] = useState(initTempLoc.address || "");
  const [tempLatitude, setTempLatitude] = useState(initTempLoc.latitude ? String(initTempLoc.latitude) : "");
  const [tempLongitude, setTempLongitude] = useState(initTempLoc.longitude ? String(initTempLoc.longitude) : "");
  const [tempReason, setTempReason] = useState(initTempLoc.reason || "");
  const [clinicLocations, setClinicLocations] = useState([]);
  const [loadingLocs, setLoadingLocs] = useState(false);

  // Fetch clinic locations for the visit's doctor
  useEffect(() => {
    if (!visit.doctor_id) return;
    setLoadingLocs(true);
    get(`/api/v1/doctors/${visit.doctor_id}/locations`)
      .then((data) => setClinicLocations(data.locations || data || []))
      .catch(() => setClinicLocations([]))
      .finally(() => setLoadingLocs(false));
  }, [visit.doctor_id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!scheduledDate || !scheduledTime) return;
    const todayStr = new Date().toISOString().split("T")[0];
    if (scheduledDate < todayStr) {
      alert("Cannot reschedule to a past date. Please select today or a future date.");
      return;
    }

    const location = locationType === "permanent"
      ? { type: "permanent", location_id: locationId, location_name: locationName }
      : { type: "temporary", temporary_location: { name: tempName, address: tempAddress, latitude: parseFloat(tempLatitude) || null, longitude: parseFloat(tempLongitude) || null, reason: tempReason } };

    onSubmit({ scheduled_date: scheduledDate, scheduled_time: scheduledTime, location, reason });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-5 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">🔄 Reschedule</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Date</label>
              <input type="date" value={scheduledDate} min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Time</label>
              <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>

          {/* Location Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Location</label>
            <div className="flex gap-2 mb-3">
              <button type="button"
                onClick={() => setLocationType("permanent")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  locationType === "permanent"
                    ? "border-blue-400 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}>
                🏥 Clinic Location
              </button>
              <button type="button"
                onClick={() => setLocationType("temporary")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  locationType === "temporary"
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}>
                📍 Temporary Location
              </button>
            </div>

            {locationType === "permanent" && (
              loadingLocs ? (
                <div className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400">Loading locations…</div>
              ) : clinicLocations.length === 0 ? (
                <div className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400">No clinic locations found</div>
              ) : (
                <select
                  value={locationId}
                  onChange={(e) => {
                    const sel = clinicLocations.find((l) => l.id === e.target.value);
                    setLocationId(e.target.value);
                    setLocationName(sel ? sel.name || sel.location_name || "" : "");
                  }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                  <option value="">Select clinic location</option>
                  {clinicLocations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name || l.location_name}</option>
                  ))}
                </select>
              )
            )}

            {locationType === "temporary" && (
              <div className="space-y-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">Location Name</label>
                  <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)}
                    placeholder="e.g. Patient Home, Conference Hall"
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">Address</label>
                  <input type="text" value={tempAddress} onChange={(e) => setTempAddress(e.target.value)}
                    placeholder="Full address"
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">Reason</label>
                  <input type="text" value={tempReason} onChange={(e) => setTempReason(e.target.value)}
                    placeholder="Why visiting here instead?"
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">Pick Location on Map</label>
                  <LocationMapPicker
                    value={tempAddress}
                    lat={tempLatitude}
                    lng={tempLongitude}
                    onChange={({ latitude, longitude, address }) => {
                      setTempLatitude(String(latitude));
                      setTempLongitude(String(longitude));
                      if (address && !tempAddress) setTempAddress(address);
                    }}
                  />
                  {tempLatitude && tempLongitude && !isNaN(parseFloat(tempLatitude)) && (
                    <p className="text-[10px] text-amber-700 mt-1 font-mono">
                      📍 {parseFloat(tempLatitude).toFixed(5)}, {parseFloat(tempLongitude).toFixed(5)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Reason for Reschedule</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
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

// ── Check-In Modal ──────────────────────────────────────────────────────
function CheckInModal({ visit, loading, onClose, onSubmit }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoRequired, setPhotoRequired] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Camera state
  const [cameraOpen, setCameraOpen]     = useState(false);
  const [cameraError, setCameraError]   = useState("");
  const [stream, setStream]             = useState(null);
  const videoRef = require("react").useRef(null);
  const canvasRef = require("react").useRef(null);

  const isTempLocation =
    visit.location && typeof visit.location === "object" && visit.location.type === "temporary";

  const needsPhoto = isTempLocation || photoRequired;

  // Open camera stream
  const openCamera = async () => {
    setCameraError("");
    setCameraOpen(true);
    try {
      const constraints = {
        video: {
          facingMode: { ideal: "environment" }, // rear on phones, webcam on desktop
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      // Attach stream to video element after a tick
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      }, 50);
    } catch (e) {
      setCameraError("Camera access denied or unavailable. Please allow camera permission and try again.");
      setCameraOpen(false);
    }
  };

  // Stop camera tracks
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCameraOpen(false);
  };

  // Capture snapshot from live video
  const capturePhoto = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `checkin_${Date.now()}.jpg`, { type: "image/jpeg" });
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(blob));
      setError("");
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  // Retake — clear captured photo and reopen camera
  const retake = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    openCamera();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const handleSubmit = async () => {
    if (needsPhoto && !photoFile) {
      setError("A photo is required. Please open the camera and capture a photo.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(photoFile || null);
    } catch (err) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("photo")) {
        setPhotoRequired(true);
        setError("You are outside the geofence — a photo is required to check in. Please capture one.");
      } else {
        setError(msg || "Failed to check in. Please try again.");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">📍 Check In</h2>
            <p className="text-emerald-100 text-xs mt-0.5">{visit.doctor_name} · {formatLoc(visit.location) || "Location TBD"}</p>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-white/70 hover:text-white text-xl">×</button>
        </div>

        {/* ── Camera viewfinder overlay ── */}
        {cameraOpen && (
          <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Canvas hidden — used for snapshot only */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Capture + Cancel controls */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => { stopCamera(); }}
                className="bg-black/50 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-black/70 transition-all"
              >
                Cancel
              </button>
              {/* Big shutter button */}
              <button
                type="button"
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white border-4 border-emerald-400 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-500" />
              </button>
              <div className="w-[72px]" /> {/* spacer to center the shutter */}
            </div>
          </div>
        )}

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {!cameraOpen && (
            <>
              {/* Visit info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Date</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{visit.scheduled_date}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Time</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{to12h(visit.scheduled_time)}</p>
                </div>
              </div>

              {/* GPS note */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                <p className="font-bold mb-0.5">🛡️ GPS captured automatically</p>
                <p className="text-blue-500">Your location will be recorded the moment you check in. Ensure GPS is enabled.</p>
              </div>

              {/* Photo required notice */}
              {needsPhoto && !photoPreview && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  <p className="font-bold mb-0.5">
                    {isTempLocation ? "📍 Temporary Location — Photo Required" : "📸 Outside Geofence — Photo Required"}
                  </p>
                  <p>{isTempLocation ? "Temporary location check-ins require a camera photo as proof." : "You are outside the geofence. Please take a photo to verify your presence."}</p>
                </div>
              )}

              {/* Photo section */}
              {needsPhoto && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-700">
                    {photoPreview ? "📸 Photo Captured" : "📸 Camera Required *"}
                  </p>

                  {photoPreview ? (
                    /* Captured preview */
                    <div className="relative rounded-xl overflow-hidden border border-emerald-200">
                      <img src={photoPreview} alt="Check-in photo" className="w-full h-36 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-2 inset-x-0 flex justify-center">
                        <button
                          type="button"
                          onClick={retake}
                          className="bg-white/90 text-gray-700 text-xs font-bold px-4 py-1.5 rounded-full shadow hover:bg-white transition-all"
                        >
                          🔄 Retake
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Open camera button */
                    <button
                      type="button"
                      onClick={openCamera}
                      className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-emerald-300 rounded-xl py-6 bg-emerald-50 hover:bg-emerald-100 transition-all"
                    >
                      <span className="text-4xl">📷</span>
                      <p className="text-sm font-bold text-emerald-700">Open Camera</p>
                      <p className="text-[10px] text-emerald-500">Uses rear camera on mobile, webcam on desktop</p>
                    </button>
                  )}

                  {cameraError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{cameraError}</p>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button type="button" onClick={() => { stopCamera(); onClose(); }}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || loading || (needsPhoto && !photoFile)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-all"
                >
                  {submitting || loading ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Checking in…
                    </span>
                  ) : "📍 Check In"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
