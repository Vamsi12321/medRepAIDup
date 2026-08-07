"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get } from "@/lib/api";
import { formatISTDate, formatISTDateTime } from "@/lib/time";
import Link from "next/link";

const STATUS_STYLES = {
  scheduled:   { bg: "bg-blue-500",    lightBg: "bg-blue-50",   border: "border-blue-100",   text: "text-blue-700",   label: "Scheduled",   icon: "📅" },
  checked_in:  { bg: "bg-amber-500",   lightBg: "bg-amber-50",  border: "border-amber-100",  text: "text-amber-700",  label: "Checked In",  icon: "📍" },
  checked_out: { bg: "bg-purple-500",  lightBg: "bg-purple-50", border: "border-purple-100", text: "text-purple-700", label: "Report Due",  icon: "📝" },
  completed:   { bg: "bg-emerald-500", lightBg: "bg-emerald-50", border: "border-emerald-100",text: "text-emerald-700",label: "Completed",  icon: "✅" },
  cancelled:   { bg: "bg-red-500",     lightBg: "bg-red-50",    border: "border-red-100",    text: "text-red-700",    label: "Cancelled",   icon: "❌" },
};

const MOOD_STYLES = {
  positive: { icon: "😊", label: "Positive", cls: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  neutral:  { icon: "😐", label: "Neutral",  cls: "text-amber-700 bg-amber-50 border-amber-100" },
  negative: { icon: "😞", label: "Negative", cls: "text-red-700 bg-red-50 border-red-100" },
};

const to12h = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
};

const formatLoc = (loc) => loc && typeof loc === "object" ? loc.location_name || loc.temporary_location?.name || "" : loc || "";

export default function VisitDetailsPage() {
  const { visitId } = useParams();
  const router = useRouter();

  const { data: visit, isLoading } = useQuery({
    queryKey: ["visit", visitId],
    queryFn: () => get(`/api/v1/visits/${visitId}`),
    enabled: !!visitId,
  });

  if (isLoading || !visit) {
    return (
      <div className="min-h-screen bg-[#fafbfd]">
        <CompanyNavbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-32 bg-gray-100 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-100 rounded-3xl" />
              <div className="h-64 bg-gray-100 rounded-3xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const s = STATUS_STYLES[visit.status] || STATUS_STYLES.scheduled;
  const report = visit.report || {};

  let durationText = "—";
  if (visit.duration_minutes && visit.duration_minutes > 0) {
    durationText = `${visit.duration_minutes} min`;
  } else if (visit.check_in?.timestamp && visit.check_out?.timestamp) {
    const inTime = new Date(visit.check_in.timestamp);
    const outTime = new Date(visit.check_out.timestamp);
    const diffMs = outTime - inTime;
    if (!isNaN(diffMs) && diffMs > 0) {
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) {
        durationText = `${diffSecs} sec`;
      } else {
        const diffMins = Math.round(diffMs / 60000);
        durationText = `${diffMins} min`;
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <CompanyNavbar />
      
      {/* Dynamic Header Banner */}
      <div className={`w-full h-32 absolute top-16 left-0 right-0 opacity-10 bg-gradient-to-b ${s.bg} to-transparent pointer-events-none -z-10`} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => router.back()} className="mb-4 text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors">
          <span className="text-lg leading-none">←</span> Back to MR Visits
        </button>

        {/* Top Status Banner */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-2 h-full ${s.bg}`} />
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border uppercase flex items-center gap-1.5 ${s.lightBg} ${s.border} ${s.text}`}>
                {s.icon} {s.label}
              </span>
              <span className="text-gray-400 text-sm font-medium">#{visit.id.slice(-8)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{visit.title || visit.purpose}</h1>
            {visit.title && visit.purpose && <p className="text-sm text-gray-500 font-medium mt-0.5">{visit.purpose}</p>}
            <p className="text-gray-500 font-medium mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="text-gray-400">📅</span> {visit.scheduled_date ? formatISTDate(visit.scheduled_date) : "—"} 
              <span className="text-gray-300">|</span> 
              <span className="text-gray-400">⏰</span> {to12h(visit.scheduled_time)}
              {durationText !== "—" && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-400">⏱️</span> {durationText} duration
                </>
              )}
            </p>
          </div>

          {/* Quick Actions (Admin might not need actions here, but good for UX) */}
          <div className="flex flex-col items-end gap-1">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Created On</p>
            <p className="text-sm font-semibold text-gray-700">{formatISTDateTime(visit.created_at)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Participants Column */}
          <div className="space-y-6">
            {/* Doctor Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-gray-200 transition-all">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The Doctor</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl border border-indigo-200/50 shadow-inner">
                  {visit.doctor_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg leading-tight">{visit.doctor_name}</p>
                  <p className="text-sm font-medium text-gray-500 mt-0.5">{formatLoc(visit.location) || "Location not set"}</p>
                </div>
              </div>
              
              {visit.location?.type === "temporary" && visit.location.temporary_location && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-800">
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1 flex items-center gap-1"><span>⚠️</span> Temporary Location</p>
                  <p className="text-xs mb-1 font-medium">{visit.location.temporary_location.address}</p>
                  {visit.location.temporary_location.reason && (
                    <p className="text-[11px] font-semibold italic border-l-2 border-amber-300 pl-2 mt-1.5 text-amber-700">"{visit.location.temporary_location.reason}"</p>
                  )}
                </div>
              )}

              <Link href={`/company/doctors`} className="mt-5 block w-full text-center py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-600 transition-colors border border-gray-100">
                View Doctor Profile →
              </Link>
            </div>

            {/* MR Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-gray-200 transition-all">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Assigned MR</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-black text-xl border border-orange-200/50 shadow-inner">
                  {visit.mr_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg leading-tight">{visit.mr_name}</p>
                  <Link href={`/company/medical-reps/${visit.mr_id}`} className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline">
                    View MR Dashboard
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Cancel Reason */}
            {visit.status === "cancelled" && visit.cancel_reason && (
              <div className="bg-red-50 rounded-3xl p-6 border border-red-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 text-7xl opacity-5">❌</div>
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 relative z-10">Cancellation Reason</h3>
                <p className="text-sm font-semibold text-red-800 relative z-10 leading-relaxed">{visit.cancel_reason}</p>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Location & Tracking Section */}
            {(visit.check_in || visit.check_out) ? (
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">📍</span> Location Tracking
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Check-In */}
                  {visit.check_in && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-500" />
                      
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Check-In</p>
                        <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-100">
                          {(() => { const s = String(visit.check_in.timestamp); const d = s.endsWith("Z") || s.includes("+") ? new Date(s) : new Date(s + "Z"); return !isNaN(d) ? d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }) : "—"; })()}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-white rounded-xl p-3 border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wide">Coordinates</p>
                          <a href={`https://maps.google.com/?q=${visit.check_in.latitude},${visit.check_in.longitude}`} target="_blank" rel="noreferrer" className="font-mono text-blue-600 hover:text-blue-700 hover:underline text-xs block truncate">
                            {visit.check_in.latitude?.toFixed(6)}, {visit.check_in.longitude?.toFixed(6)} ↗
                          </a>
                        </div>
                        
                        {(visit.check_in.geofence_status || visit.check_in.distance_from_location != null) && (
                          <div className="flex gap-2">
                            {visit.check_in.geofence_status && (
                              <div className={`flex-1 rounded-xl p-3 border ${visit.check_in.geofence_status === "inside" ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                                <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${visit.check_in.geofence_status === "inside" ? "text-emerald-600" : "text-red-500"}`}>Geofence</p>
                                <p className={`text-sm font-black ${visit.check_in.geofence_status === "inside" ? "text-emerald-800" : "text-red-700"}`}>
                                  {visit.check_in.geofence_status === "inside" ? "Inside ✅" : "Outside ❌"}
                                </p>
                              </div>
                            )}
                            {visit.check_in.distance_from_location != null && (
                              <div className="flex-1 bg-white rounded-xl p-3 border border-slate-100">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Distance</p>
                                <p className="text-sm font-black text-slate-700">
                                  {visit.check_in.distance_from_location < 0.1 ? `${Math.round(visit.check_in.distance_from_location * 1000)}m` : `${visit.check_in.distance_from_location.toFixed(2)}km`}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {visit.check_in.photo_url && (
                          <div className="mt-4 rounded-xl overflow-hidden border-2 border-white shadow-sm relative group cursor-pointer">
                            <a href={visit.check_in.photo_url} target="_blank" rel="noreferrer">
                              <img src={visit.check_in.photo_url} alt="Check-in capture" className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <span className="text-white font-bold text-xs bg-black/50 px-3 py-1.5 rounded-full">Enlarge 🔍</span>
                              </div>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Check-Out */}
                  {visit.check_out && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-500" />
                      
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Check-Out</p>
                        <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-100">
                          {(() => { const s = String(visit.check_out.timestamp); const d = s.endsWith("Z") || s.includes("+") ? new Date(s) : new Date(s + "Z"); return !isNaN(d) ? d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }) : "—"; })()}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-white rounded-xl p-3 border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wide">Coordinates</p>
                          <a href={`https://maps.google.com/?q=${visit.check_out.latitude},${visit.check_out.longitude}`} target="_blank" rel="noreferrer" className="font-mono text-purple-600 hover:text-purple-700 hover:underline text-xs block truncate">
                            {visit.check_out.latitude?.toFixed(6)}, {visit.check_out.longitude?.toFixed(6)} ↗
                          </a>
                        </div>
                        
                        {(visit.check_out.geofence_status || visit.check_out.distance_from_location != null) && (
                          <div className="flex gap-2">
                            {visit.check_out.geofence_status && (
                              <div className={`flex-1 rounded-xl p-3 border ${visit.check_out.geofence_status === "inside" ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                                <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${visit.check_out.geofence_status === "inside" ? "text-emerald-600" : "text-red-500"}`}>Geofence</p>
                                <p className={`text-sm font-black ${visit.check_out.geofence_status === "inside" ? "text-emerald-800" : "text-red-700"}`}>
                                  {visit.check_out.geofence_status === "inside" ? "Inside ✅" : "Outside ❌"}
                                </p>
                              </div>
                            )}
                            {visit.check_out.distance_from_location != null && (
                              <div className="flex-1 bg-white rounded-xl p-3 border border-slate-100">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Distance</p>
                                <p className="text-sm font-black text-slate-700">
                                  {visit.check_out.distance_from_location < 0.1 ? `${Math.round(visit.check_out.distance_from_location * 1000)}m` : `${visit.check_out.distance_from_location.toFixed(2)}km`}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <span className="text-2xl">🗺️</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No Tracking Data Yet</h3>
                <p className="text-sm text-gray-400">The MR has not checked in to this visit.</p>
              </div>
            )}

            {/* Post-Visit Report */}
            {visit.status === "completed" && report && Object.keys(report).length > 0 && (
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100">
                <h2 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg">📋</span> Post-Visit Report
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {/* Metric Cards */}
                  {report.doctor_mood && (
                    <div className={`rounded-2xl p-4 border ${MOOD_STYLES[report.doctor_mood]?.cls || "bg-gray-50 border-gray-200"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">Doctor Mood</p>
                      <p className="text-base font-black flex items-center gap-2">
                        {MOOD_STYLES[report.doctor_mood]?.icon} {MOOD_STYLES[report.doctor_mood]?.label || report.doctor_mood}
                      </p>
                    </div>
                  )}

                  {report.samples_given > 0 && (
                    <div className="rounded-2xl p-4 border bg-indigo-50 border-indigo-100 text-indigo-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">Samples Given</p>
                      <p className="text-base font-black">{report.samples_given}</p>
                    </div>
                  )}
                  {report.follow_up_date && (
                    <div className="rounded-2xl p-4 border bg-purple-50 border-purple-100 text-purple-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">Follow-up</p>
                      <p className="text-sm font-black">{formatISTDate(report.follow_up_date)}</p>
                    </div>
                  )}
                  {durationText !== "—" && (
                    <div className="rounded-2xl p-4 border bg-blue-50 border-blue-100 text-blue-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">Visit Duration</p>
                      <p className="text-sm font-black">⏱️ {durationText}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  {/* Competitor Info */}
                  {report.competitor_info && (
                    <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100">
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1.5">Competitor Activity</p>
                      <p className="text-sm font-semibold text-red-900 leading-relaxed">{report.competitor_info}</p>
                    </div>
                  )}

                  {/* Outcome */}
                  {report.outcome && (
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 border-l-4 border-l-indigo-400">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Visit Outcome</p>
                      <p className="text-sm font-medium text-gray-800 leading-relaxed">{report.outcome}</p>
                    </div>
                  )}

                  {/* Products */}
                  {(report.products_discussed || []).length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Products Discussed</p>
                      <div className="flex flex-wrap gap-2">
                        {report.products_discussed.map((p, i) => (
                          <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100 shadow-sm">
                            💊 {typeof p === "string" ? p : p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {report.notes && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">General Notes</p>
                      <div className="bg-[#fffdf7] rounded-2xl p-5 border border-amber-100/50 shadow-inner">
                        <p className="text-sm font-medium text-gray-700 italic leading-relaxed whitespace-pre-wrap">{report.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Visit Notes */}
            {visit.notes && (
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pre-visit Instructions / Notes</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100">{visit.notes}</p>
              </div>
            )}
            
            {/* Reschedule History */}
            {(visit.reschedule_history || []).length > 0 && (
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-gray-50 rounded-lg text-lg leading-none">🕒</span> Reschedule History
                </h3>
                <div className="space-y-4">
                  {visit.reschedule_history.map((r, idx) => (
                    <div key={idx} className="relative pl-6 pb-2 border-l-2 border-gray-100 last:border-0 last:pb-0">
                      <div className="absolute top-1.5 left-[-5px] w-2 h-2 rounded-full bg-gray-300" />
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1.5">{formatISTDateTime(r.rescheduled_at)}</p>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 inline-block">
                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                          <span className="text-gray-400 line-through decoration-gray-300">{r.old_date} at {to12h(r.old_time)}</span>
                          <span className="text-gray-300">→</span>
                          <span className="text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md shadow-sm">{r.new_date} at {to12h(r.new_time)}</span>
                        </div>
                        {r.reason && <p className="text-xs text-gray-500 mt-2 italic font-medium">"{r.reason}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>

      </main>
    </div>
  );
}
