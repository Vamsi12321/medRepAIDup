"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import DoctorVisitStatusCard from "@/components/DoctorVisitStatusCard";
import { get } from "@/lib/api";
import { formatISTDate, formatISTDateTime } from "@/lib/time";

import Link from "next/link";

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

const formatLoc = (loc) => loc && typeof loc === "object" ? loc.location_name || loc.temporary_location?.name || "" : loc || "";

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
  const s = STATUS_STYLES[visit.status] || STATUS_STYLES.scheduled;

  return (
    <Link href={`/company/visits/${visit.id}`} className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all group">
      <div className="p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={"w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0 " + s.bg + " " + s.text}>
            {visit.doctor_name?.charAt(0)}
          </div>
          <div>
            <p className="text-base font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">{visit.doctor_name}</p>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">{visit.purpose} · {formatLoc(visit.location) || "—"}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-700 px-2 py-1 rounded-md">📅 {visit.scheduled_date}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-orange-50 text-orange-700 px-2 py-1 rounded-md">⏰ {to12h(visit.scheduled_time)}</span>
              {visit.duration_minutes > 0 && <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">⏱️ {visit.duration_minutes} min</span>}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3 flex-shrink-0 ml-4">
          <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest ${s.bg} ${s.text}`}>
            {s.label}
          </span>
          <span className="text-gray-300 group-hover:text-indigo-500 transition-colors font-bold text-sm flex items-center gap-1">
            View Details <span className="text-lg leading-none">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
