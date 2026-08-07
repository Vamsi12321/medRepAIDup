"use client";
import { useState } from "react";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";

const REQUESTS = [
  { id: 1, doctor: "Dr. Kavitha Reddy", specialization: "Pulmonologist", city: "Hyderabad", hospital: "KIMS", reason: "Doctor prescribes our respiratory products. Want to onboard for engagement.", sentOn: "24 Jun 2026, 10:30 AM", status: "Pending DRX Review", drxNote: "" },
  { id: 2, doctor: "Dr. Mohan Das", specialization: "Orthopedic", city: "Chennai", hospital: "MIOT Hospital", reason: "High prescriber in bone health segment. Requesting for CME access.", sentOn: "23 Jun 2026, 02:00 PM", status: "Pending DRX Review", drxNote: "" },
  { id: 3, doctor: "Dr. Ravi Shankar", specialization: "Cardiologist", city: "Bangalore", hospital: "Narayana Health", reason: "Key opinion leader, wants virtual MR access.", sentOn: "20 Jun 2026, 11:00 AM", status: "DRX Approved · Awaiting Doctor", drxNote: "Approved. Doctor has been notified." },
  { id: 4, doctor: "Dr. Sneha Kulkarni", specialization: "Cardiologist", city: "Mumbai", hospital: "Global Hospital", reason: "Existing prescriber of our CV portfolio.", sentOn: "15 Jun 2026, 09:00 AM", status: "Completed", drxNote: "Doctor accepted. Link active." },
  { id: 5, doctor: "Dr. Ananya Iyer", specialization: "Neurologist", city: "Chennai", hospital: "Apollo Hospital", reason: "Part of neurology advisory panel.", sentOn: "10 Jun 2026, 04:30 PM", status: "Completed", drxNote: "Doctor accepted. Link active." },
  { id: 6, doctor: "Dr. Fatima Shaikh", specialization: "Dermatologist", city: "Mumbai", hospital: "Hinduja Hospital", reason: "Wants to add for derma product portfolio.", sentOn: "05 Jun 2026, 03:00 PM", status: "Rejected by DRX", drxNote: "Doctor is not in your therapy area focus. Please resubmit with justification." },
];

const statusConfig = {
  "Pending DRX Review": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
  "DRX Approved · Awaiting Doctor": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-400" },
  "Completed": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
  "Rejected by DRX": { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", dot: "bg-red-400" },
};

export default function DRXRequestsPage() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? REQUESTS : REQUESTS.filter((r) => {
    if (filter === "pending") return r.status.includes("Pending") || r.status.includes("Awaiting");
    if (filter === "completed") return r.status === "Completed";
    if (filter === "rejected") return r.status.includes("Rejected");
    return true;
  });

  const pendingCount = REQUESTS.filter((r) => r.status.includes("Pending") || r.status.includes("Awaiting")).length;

  return (
    <div className="min-h-screen bg-[#fafbfd] overflow-x-hidden">
      <CompanyNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb />
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DRX Requests</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track requests sent to DRX to add doctors to your organization</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-amber-100">
              {pendingCount} in progress
            </span>
          )}
        </div>
      </div>

      {/* Flow diagram */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Request Flow</p>
        <div className="flex items-center gap-2 text-xs overflow-x-auto">
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
      <div className="flex gap-2">
        {[
          { id: "all", label: "All Requests" },
          { id: "pending", label: "In Progress" },
          { id: "completed", label: "Completed" },
          { id: "rejected", label: "Rejected" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === f.id ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}>{f.label}</button>
        ))}
      </div>

      {/* Request list */}
      <div className="space-y-4">
        {filtered.map((req) => {
          const sc = statusConfig[req.status] || statusConfig["Pending DRX Review"];
          return (
            <div key={req.id} className={`bg-white rounded-xl border ${sc.border} p-5 transition-all`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {req.doctor.split(" ").slice(1).map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{req.doctor}</p>
                    <p className="text-xs text-gray-500">{req.specialization} · {req.hospital} · {req.city}</p>
                    <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                      <p className="text-xs text-gray-600">&ldquo;{req.reason}&rdquo;</p>
                    </div>
                    {req.drxNote && (
                      <div className={`mt-2 ${sc.bg} rounded-lg px-3 py-2 border ${sc.border}`}>
                        <p className="text-[11px] font-medium" style={{ color: "inherit" }}>
                          <span className={sc.text}>DRX: </span>
                          <span className="text-gray-600">{req.drxNote}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${sc.bg} ${sc.text} text-[11px] font-bold`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {req.status}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">{req.sentOn}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
          <p className="text-gray-400 text-sm">No requests in this category.</p>
        </div>
      )}
    </div>
      </main>
    </div>
  );
}
