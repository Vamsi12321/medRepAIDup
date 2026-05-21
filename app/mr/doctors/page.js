"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, post } from "@/lib/api";

const mrId = () => typeof window !== "undefined" ? localStorage.getItem("userId") : null;

export default function MRDoctors() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("doctors");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const queryClient = useQueryClient();

  const id = mrId();

  const { data: mrData, isLoading: loadingMR } = useQuery({
    queryKey: ["mr-profile", id],
    queryFn: () => get(`/api/v1/mrs/${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  const { data: allDoctorsData, isLoading: loadingDoctors } = useQuery({
    queryKey: ["all-doctors"],
    queryFn: () => get("/api/v1/doctors?page_size=1000").then((d) => d.doctors || []),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: requestsData, isLoading: loadingRequests } = useQuery({
    queryKey: ["doctor-requests"],
    queryFn: () => get("/api/v1/doctors/requests").then((d) => d.requests || []),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

  const assignedDoctorsList = mrData?.assigned_doctors || [];
  const assignedDoctorIds = new Set(assignedDoctorsList.map((d) => d.id));
  const allDoctors = Array.isArray(allDoctorsData) ? allDoctorsData : [];
  const doctorRequests = Array.isArray(requestsData) ? requestsData : [];

  const assignedDoctors = allDoctors.filter((d) => assignedDoctorIds.has(d.id));
  const isLoading = loadingMR || loadingDoctors;

  const filteredDoctors = assignedDoctors.filter(
    (d) => !search.trim() || d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <MRNavbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">My Doctors 👨‍⚕️</h1>
            <p className="text-gray-500 text-sm">Doctors assigned to you</p>
          </div>
          <button onClick={() => setShowRequestModal(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm">
            <span>➕</span><span>Request Doctor</span>
          </button>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex space-x-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
            <button onClick={() => setActiveTab("doctors")}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === "doctors" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
              👨‍⚕️ Doctors ({assignedDoctors.length})
            </button>
            <button onClick={() => setActiveTab("requests")}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === "requests" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
              📋 My Requests ({doctorRequests.length})
            </button>
          </div>
          {activeTab === "doctors" && assignedDoctors.length > 0 && (
            <input type="text" placeholder="🔍 Search doctors..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none shadow-sm" />
          )}
        </div>

        {/* Doctors Tab */}
        {activeTab === "doctors" && (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <span className="text-5xl">👨‍⚕️</span>
                <p className="text-gray-500 mt-4 font-medium text-sm">
                  {assignedDoctors.length === 0 ? "No doctors assigned yet." : "No doctors match your search."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-red-400 to-pink-400" />
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {doctor.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-800 text-sm truncate">{doctor.name}</h3>
                          <p className="text-xs text-gray-400 truncate">{doctor.email}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {doctor.specialization && (
                          <div className="flex items-center gap-2">
                            <span>🩺</span>
                            <span className="text-gray-700 font-medium">{doctor.specialization}</span>
                          </div>
                        )}
                        {doctor.hospital && (
                          <div className="flex items-center gap-2">
                            <span>🏥</span>
                            <span className="text-gray-600">{doctor.hospital}</span>
                          </div>
                        )}
                        {doctor.phone && (
                          <div className="flex items-center gap-2">
                            <span>📞</span>
                            <span className="text-gray-600">{doctor.phone}</span>
                          </div>
                        )}
                        {doctor.address && (
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span className="text-gray-500 truncate">{doctor.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Added by / Approved by */}
                      {(doctor.added_by || doctor.approved_by) && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                          {doctor.added_by && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">
                              Added by: {doctor.added_by.name} ({doctor.added_by.role})
                            </span>
                          )}
                          {doctor.approved_by && (
                            <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-md font-medium">
                              Approved by: {doctor.approved_by.name}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <>
            {loadingRequests ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-gray-200 rounded w-1/2" />
                        <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : doctorRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <span className="text-5xl">📋</span>
                <p className="text-gray-500 mt-4 font-medium text-sm">No requests yet.</p>
                <button onClick={() => setShowRequestModal(true)}
                  className="mt-4 bg-orange-500 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">
                  Request a Doctor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctorRequests.map((req, i) => (
                  <div key={req.request_id || i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Status bar */}
                    <div className={`h-1 w-full ${
                      req.status === "approved" ? "bg-green-500" :
                      req.status === "rejected" ? "bg-red-500" :
                      "bg-amber-400"
                    }`} />
                    <div className="p-5">
                      {/* Header with status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                            req.status === "approved" ? "bg-gradient-to-br from-green-400 to-green-600" :
                            req.status === "rejected" ? "bg-gradient-to-br from-red-400 to-red-600" :
                            "bg-gradient-to-br from-amber-400 to-orange-500"
                          }`}>
                            {req.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-800 text-sm truncate">{req.name}</h3>
                            <p className="text-xs text-gray-400 truncate">{req.email}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                          req.status === "approved" ? "bg-green-100 text-green-700" :
                          req.status === "rejected" ? "bg-red-100 text-red-600" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {req.status === "approved" ? "Approved" :
                           req.status === "rejected" ? "Rejected" : "Pending"}
                        </span>
                      </div>

                      {/* Doctor info */}
                      <div className="space-y-1.5 text-xs">
                        {req.specialization && (
                          <div className="flex items-center gap-2">
                            <span>🩺</span>
                            <span className="text-gray-700 font-medium">{req.specialization}</span>
                          </div>
                        )}
                        {req.hospital && (
                          <div className="flex items-center gap-2">
                            <span>🏥</span>
                            <span className="text-gray-600">{req.hospital}</span>
                          </div>
                        )}
                        {req.phone && (
                          <div className="flex items-center gap-2">
                            <span>📞</span>
                            <span className="text-gray-600">{req.phone}</span>
                          </div>
                        )}
                        {req.address && (
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span className="text-gray-500 truncate">{req.address}</span>
                          </div>
                        )}
                        {req.license_number && (
                          <div className="flex items-center gap-2">
                            <span>🪪</span>
                            <span className="text-gray-500">{req.license_number}</span>
                          </div>
                        )}
                      </div>

                      {/* Rejection reason */}
                      {req.status === "rejected" && req.rejection_reason && (
                        <div className="mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                          <p className="text-xs text-red-600"><span className="font-semibold">Reason:</span> {req.rejection_reason}</p>
                        </div>
                      )}

                      {/* Date */}
                      {req.created_at && (
                        <p className="text-xs text-gray-400 mt-3">Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showRequestModal && (
        <RequestDoctorModal
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["doctor-requests"] })}
        />
      )}
    </div>
  );
}

function RequestDoctorModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", specialization: "",
    hospital: "", license_number: "", address: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSaving(true);
    try {
      await post("/api/v1/doctors/request", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        specialization: form.specialization,
        classification: "C",
        hospital: form.hospital || undefined,
        license_number: form.license_number || undefined,
        address: form.address || undefined,
      });
      setStep(3);
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit request");
    }
    setSaving(false);
  };

  const canProceed = form.name && form.email && form.phone && form.specialization;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">

        {step === 3 ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">🎉</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
            <p className="text-sm text-gray-500 mb-6">Your admin will review this. The doctor will be assigned to you once approved.</p>
            <button onClick={onClose}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
              Got it
            </button>
          </div>
        ) : step === 1 ? (
          <>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Request New Doctor</h2>
                <p className="text-orange-100 text-xs mt-0.5">Step 1 — Basic details</p>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white text-xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Doctor Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Dr. Amit Patel"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="doctor@hospital.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Specialization <span className="text-red-500">*</span></label>
                <input type="text" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  placeholder="Cardiologist"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">
                  Cancel
                </button>
                <button type="button" onClick={() => { if (canProceed) { setError(""); setStep(2); } else { setError("Please fill all required fields"); } }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50"
                  disabled={!canProceed}>
                  Next →
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Request New Doctor</h2>
                <p className="text-orange-100 text-xs mt-0.5">Step 2 — Additional details (optional)</p>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white text-xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Hospital</label>
                <input type="text" value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                  placeholder="Apollo Hospital"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">License Number</label>
                <input type="text" value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                  placeholder="MH12345"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Medical Street, Mumbai"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Summary:</span> {form.name} • {form.specialization} • {form.email}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">
                  ← Back
                </button>
                <button type="button" onClick={handleSubmit} disabled={saving}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50">
                  {saving ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
