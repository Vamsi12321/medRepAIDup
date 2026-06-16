"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import DoctorVisitStatusCard from "@/components/DoctorVisitStatusCard";
import { get } from "@/lib/api";
import { formatISTDate, formatISTDateTime } from "@/lib/time";

const STATUS_STYLES = {
  scheduled:   { bg: "bg-blue-100",   text: "text-blue-700",   label: "Scheduled" },
  checked_in:  { bg: "bg-amber-100",  text: "text-amber-700",  label: "Checked In" },
  checked_out: { bg: "bg-purple-100", text: "text-purple-700", label: "Report Pending" },
  completed:   { bg: "bg-green-100",  text: "text-green-700",  label: "Completed" },
  cancelled:   { bg: "bg-red-100",    text: "text-red-600",    label: "Cancelled" },
};

const to12h = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
};

export default function AdminMRVisits() {
  const { mrId } = useParams();
  const [filterStatus, setFilterStatus] = useState("");
  const [viewMode, setViewMode] = useState("visits"); // visits | doctors

  const { data: mrData } = useQuery({
    queryKey: ["mr-detail", mrId],
    queryFn: () => get(`/api/v1/mrs/${mrId}`),
    enabled: !!mrId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: visitsResponse, isLoading } = useQuery({
    queryKey: ["admin-mr-visits", mrId],
    queryFn: () => get(`/api/v1/visits?mr_id=${mrId}`),
    enabled: !!mrId,
  });

  const visits = visitsResponse?.visits || [];
  const filtered = filterStatus ? visits.filter((v) => v.status === filterStatus) : visits;

  // Calculate doctor visit status
  const getDoctorVisitStatus = () => {
    const doctorMap = {};
    const assignedDoctors = mrData?.assigned_doctors || [];
    
    // Initialize all assigned doctors
    assignedDoctors.forEach((doc) => {
      doctorMap[doc.id] = {
        ...doc,
        doctor_name: doc.name,
        visit_count: 0,
        visit_status: "never_visited",
        last_visited: null,
        target_visits: 3,
      };
    });

    // Count visits per doctor
    visits.filter((v) => v.status === "completed").forEach((v) => {
      if (doctorMap[v.doctor_id]) {
        doctorMap[v.doctor_id].visit_count += 1;
        const visitDate = new Date(v.completed_at);
        if (!doctorMap[v.doctor_id].last_visited || visitDate > new Date(doctorMap[v.doctor_id].last_visited)) {
          doctorMap[v.doctor_id].last_visited = v.completed_at;
        }
      }
    });

    // Update status
    Object.values(doctorMap).forEach((doc) => {
      if (doc.visit_count > 0) {
        doc.visit_status = "visited";
      } else {
        doc.visit_status = "never_visited";
      }
    });

    return Object.values(doctorMap);
  };

  const allDoctorStatus = getDoctorVisitStatus();
  const visitedDoctors = allDoctorStatus.filter((d) => d.visit_status === "visited");
  const notVisitedDoctors = allDoctorStatus.filter((d) => d.visit_status === "never_visited");

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <Breadcrumb />

        {/* MR Profile */}
        {mrData && (
          <div className="mb-5 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                {mrData.name?.charAt(0) || "M"}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{mrData.name}</p>
                <p className="text-xs text-gray-400">{mrData.territory} · {mrData.zone} · {mrData.state}</p>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-xl font-bold text-gray-900 mb-4">📅 Visit History — {mrData?.name || "MR"}</h1>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-5 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
          {[
            { id: "visits", label: "📋 All Visits" },
            { id: "doctors", label: "👨‍⚕️ Doctor Status" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setViewMode(m.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${viewMode === m.id ? "bg-indigo-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          {[
            { label: "Total", value: visits.length, color: "from-gray-500 to-slate-500" },
            { label: "Scheduled", value: visits.filter((v) => v.status === "scheduled").length, color: "from-blue-500 to-indigo-500" },
            { label: "In Progress", value: visits.filter((v) => v.status === "checked_in" || v.status === "checked_out").length, color: "from-amber-500 to-orange-500" },
            { label: "Completed", value: visits.filter((v) => v.status === "completed").length, color: "from-green-500 to-emerald-500" },
            { label: "Cancelled", value: visits.filter((v) => v.status === "cancelled").length, color: "from-red-400 to-pink-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* View content based on mode */}
        {viewMode === "visits" ? (
          <>
            {/* Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {["", "scheduled", "checked_in", "checked_out", "completed", "cancelled"].map((st) => (
                <button key={st} onClick={() => setFilterStatus(st)}
                  className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-all " + (filterStatus === st ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")}>
                  {st ? (STATUS_STYLES[st]?.label || st) : "All"}
                </button>
              ))}
            </div>

            {/* Visits List */}
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <span className="text-5xl">📅</span>
                <p className="text-gray-500 mt-4 font-medium text-sm">No visits found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((visit) => (
                  <AdminVisitCard key={visit.id} visit={visit} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Doctor Status View */}
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />)}</div>
            ) : (
              <div className="space-y-5">
                {/* Visited Doctors */}
                {visitedDoctors.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center text-[10px]">✅</span>
                      Visited ({visitedDoctors.length})
                    </p>
                    <div className="space-y-3">
                      {visitedDoctors.map((doc) => (
                        <DoctorVisitStatusCard key={doc.id} doctor={doc} variant="admin" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Not Visited Doctors */}
                {notVisitedDoctors.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 bg-red-100 rounded flex items-center justify-center text-[10px]">❌</span>
                      Not Visited ({notVisitedDoctors.length})
                    </p>
                    <div className="space-y-3">
                      {notVisitedDoctors.map((doc) => (
                        <DoctorVisitStatusCard key={doc.id} doctor={doc} variant="admin" />
                      ))}
                    </div>
                  </div>
                )}

                {allDoctorStatus.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <span className="text-5xl">👨‍⚕️</span>
                    <p className="text-gray-500 mt-4 font-medium text-sm">No doctors assigned</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function AdminVisitCard({ visit }) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_STYLES[visit.status] || STATUS_STYLES.scheduled;
  const report = visit.report || {};

  const MOOD_STYLES = {
    positive: { icon: "😊", label: "Positive", cls: "text-green-700 bg-green-100" },
    neutral:  { icon: "😐", label: "Neutral",  cls: "text-yellow-700 bg-yellow-100" },
    negative: { icon: "😞", label: "Negative", cls: "text-red-700 bg-red-100" },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 flex items-start justify-between hover:bg-gray-50 transition-colors text-left">
        <div className="flex items-start gap-3">
          <div className={"w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 " + s.bg + " " + s.text}>
            {visit.doctor_name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{visit.doctor_name}</p>
            <p className="text-xs text-gray-400">{visit.purpose} · {visit.location || "—"}</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">📅 {visit.scheduled_date}</span>
              <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium">⏰ {to12h(visit.scheduled_time)}</span>
              {visit.duration_minutes > 0 && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">⏱️ {visit.duration_minutes} min</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>{s.label}</span>
          <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-4">
          {/* Check-in / Check-out */}
          {(visit.check_in || visit.check_out) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visit.check_in && (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium mb-1">📍 Check-In</p>
                  <p className="text-xs font-semibold text-gray-700">{(() => { const s = String(visit.check_in.timestamp); const d = s.endsWith("Z") || s.includes("+") ? new Date(s) : new Date(s + "Z"); return !isNaN(d) ? d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }) : "—"; })()}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{visit.check_in.latitude?.toFixed(6)}, {visit.check_in.longitude?.toFixed(6)}</p>
                </div>
              )}
              {visit.check_out && (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium mb-1">🏁 Check-Out</p>
                  <p className="text-xs font-semibold text-gray-700">{(() => { const s = String(visit.check_out.timestamp); const d = s.endsWith("Z") || s.includes("+") ? new Date(s) : new Date(s + "Z"); return !isNaN(d) ? d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }) : "—"; })()}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{visit.check_out.latitude?.toFixed(6)}, {visit.check_out.longitude?.toFixed(6)}</p>
                </div>
              )}
            </div>
          )}

          {/* Report */}
          {visit.status === "completed" && report && Object.keys(report).length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-700">📋 Visit Report</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {report.doctor_mood && (
                  <div className="bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-medium">Mood</p>
                    <p className={"text-xs font-semibold " + (MOOD_STYLES[report.doctor_mood]?.cls || "text-gray-700")}>
                      {MOOD_STYLES[report.doctor_mood]?.icon} {MOOD_STYLES[report.doctor_mood]?.label || report.doctor_mood}
                    </p>
                  </div>
                )}
                {report.samples_given > 0 && (
                  <div className="bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-medium">Samples Given</p>
                    <p className="text-xs font-semibold text-gray-700">{report.samples_given}</p>
                  </div>
                )}
                {report.rx_commitment != null && (
                  <div className="bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-medium">Rx Commitment</p>
                    <p className={"text-xs font-semibold " + (report.rx_commitment ? "text-green-700" : "text-gray-500")}>
                      {report.rx_commitment ? `Yes (${report.expected_rx_per_month || "—"}/month)` : "No"}
                    </p>
                  </div>
                )}
                {report.competitor_info && (
                  <div className="bg-white rounded-lg px-2.5 py-1.5 border border-red-100">
                    <p className="text-[10px] text-red-400 font-medium">Competitor</p>
                    <p className="text-xs font-semibold text-red-700">{report.competitor_info}</p>
                  </div>
                )}
                {report.follow_up_date && (
                  <div className="bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-medium">Follow-up</p>
                    <p className="text-xs font-semibold text-purple-700">{formatISTDate(report.follow_up_date)}</p>
                  </div>
                )}
              </div>

              {/* Products discussed */}
              {(report.products_discussed || []).length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 font-medium mb-1">Products Discussed</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.products_discussed.map((p, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">{typeof p === "string" ? p : p.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Outcome */}
              {report.outcome && (
                <div className="bg-white rounded-lg px-3 py-2 border-l-3 border-l-indigo-300 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium mb-0.5">Outcome</p>
                  <p className="text-xs text-gray-700">{report.outcome}</p>
                </div>
              )}

              {/* Notes */}
              {report.notes && (
                <div className="bg-white rounded-lg px-3 py-2 border-l-3 border-l-gray-300 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium mb-0.5">Notes</p>
                  <p className="text-xs text-gray-600 italic">{report.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Cancel reason */}
          {visit.status === "cancelled" && visit.cancel_reason && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
              <p className="text-xs text-red-700"><span className="font-semibold">Cancel Reason:</span> {visit.cancel_reason}</p>
            </div>
          )}

          {/* Visit notes */}
          {visit.notes && (
            <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-medium mb-0.5">Visit Notes</p>
              <p className="text-xs text-gray-600">{visit.notes}</p>
            </div>
          )}

          {/* Reschedule history */}
          {(visit.reschedule_history || []).length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 font-medium mb-1">Reschedule History</p>
              <div className="space-y-1">
                {visit.reschedule_history.map((r, i) => (
                  <p key={i} className="text-xs text-gray-500">{r.from_date} → {r.to_date} ({r.reason})</p>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex flex-wrap gap-3 text-[10px] text-gray-400">
            <span>Created: {formatISTDateTime(visit.created_at)}</span>
            {visit.completed_at && <span>Completed: {formatISTDateTime(visit.completed_at)}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
