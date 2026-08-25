"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get } from "@/lib/api";

const statusConfig = {
  pending:  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400", label: "Pending" },
  accepted: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-400", label: "Accepted" },
  approved: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500", label: "Approved" },
  rejected: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", dot: "bg-red-400", label: "Rejected" },
};

export default function DRXRequestsPage() {
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["drx-doctor-requests"],
    queryFn: () => get("/api/v1/integration/drx/doctor-requests"),
    staleTime: 7 * 60 * 1000,
  });

  const requests = Array.isArray(data) ? data : (data?.requests || []);

  const filtered = filter === "all" ? requests : requests.filter((r) => {
    const status = (r.status || "").toLowerCase();
    if (filter === "pending") return status === "pending";
    if (filter === "accepted") return status === "accepted";
    if (filter === "approved") return status === "approved";
    if (filter === "rejected") return status === "rejected";
    return true;
  });

  const pendingCount = requests.filter((r) => (r.status || "").toLowerCase() === "pending").length;

  return (
    <div className="min-h-screen bg-[#fafbfd] overflow-x-hidden">
      <CompanyNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb customItems={[
          { label: "🏠 Overview", href: "/company/overview" },
          { label: "🩺 Doctors", href: "/company/doctors" },
          { label: "📨 DRX Requests", href: null }
        ]} />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DRX Requests</h1>
              <p className="text-gray-500 text-sm mt-0.5">Track requests sent to DRX to add doctors to your organization</p>
            </div>
            {pendingCount > 0 && (
              <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-amber-100">
                {pendingCount} pending
              </span>
            )}
          </div>

          {/* Flow diagram */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 overflow-x-auto">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Request Flow</p>
            <div className="flex items-center gap-2 text-xs min-w-[500px]">
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap border border-indigo-100">You Request</span>
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap border border-purple-100">DRX Reviews</span>
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap border border-blue-100">Doctor Notified</span>
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap border border-green-100">Doctor Accepts ✓</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "all", label: "All Requests" },
              { id: "pending", label: "Pending" },
              { id: "accepted", label: "Accepted" },
              { id: "approved", label: "Approved" },
              { id: "rejected", label: "Rejected" },
            ].map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  filter === f.id ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}>{f.label}</button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-gray-400 mt-3">Loading requests...</p>
            </div>
          )}

          {/* Request list */}
          {!isLoading && (
            <div className="space-y-4">
              {filtered.map((req, i) => {
                const status = (req.status || "pending").toLowerCase();
                const sc = statusConfig[status] || statusConfig.pending;
                const initials = (req.doctor_name || req.username || "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div key={req._id || req.id || i} className={`bg-white rounded-xl border ${sc.border} p-4 sm:p-5 transition-all`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{req.doctor_name || req.username || "Unknown Doctor"}</p>
                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                            {req.doctor_gid && <span className="font-mono text-indigo-500">{req.doctor_gid}</span>}
                            {req.username && <span>@{req.username}</span>}
                          </div>
                          {req.note && (
                            <div className={`mt-2 ${sc.bg} rounded-lg px-3 py-2 border ${sc.border}`}>
                              <p className="text-[11px] text-gray-600">{req.note}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 flex-shrink-0 ml-13 sm:ml-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${sc.bg} ${sc.text} text-[11px] font-bold`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </div>
                        {req.created_at && (
                          <p className="text-[11px] text-gray-400 sm:mt-2">
                            {new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              <p className="text-gray-400 text-sm">No requests in this category</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
