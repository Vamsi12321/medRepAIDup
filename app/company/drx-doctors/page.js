"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, post } from "@/lib/api";

export default function DRXDoctorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirm, setShowConfirm] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [requestReason, setRequestReason] = useState("");

  // Check DRX connection health
  const { data: healthData } = useQuery({
    queryKey: ["drx-health"],
    queryFn: () => get("/api/v1/integration/drx/health"),
    staleTime: 7 * 60 * 1000,
    retry: 1,
  });

  // Search doctors on DRX — load all on mount, filter on search
  const { data: searchData, isLoading: searching } = useQuery({
    queryKey: ["drx-doctors-search", searchQuery],
    queryFn: () => searchQuery
      ? get("/api/v1/integration/drx/doctors/search", { q: searchQuery })
      : get("/api/v1/integration/drx/doctors/search"),
    staleTime: 7 * 60 * 1000,
  });
  const drxDoctors = searchData?.doctors || [];

  // Fetch doctor detail from DRX
  const { data: doctorDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["drx-doctor-detail", showDetail?.doctor_gid],
    queryFn: () => get(`/api/v1/integration/drx/doctors/${showDetail.doctor_gid}`),
    enabled: !!showDetail?.doctor_gid,
    staleTime: 7 * 60 * 1000,
  });

  // Request doctor mutation
  const requestMutation = useMutation({
    mutationFn: (username) => post("/api/v1/integration/drx/doctor-requests", { username }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drx-doctors-search"] });
      setShowConfirm(null);
      setRequestReason("");
    },
  });

  // Handle search submit
  const handleSearch = (e) => {
    e?.preventDefault();
    setSearchQuery(search.trim());
  };

  // Get doctor detail when clicking request
  const handleRequestClick = async (doctor) => {
    setShowConfirm(doctor);
  };

  const isConnected = healthData?.status === "ok" && (healthData?.token_valid || healthData?.reachable);

  return (
    <div className="min-h-screen bg-[#fafbfd] overflow-x-hidden">
      <CompanyNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb customItems={[
          { label: "🏠 Overview", href: "/company/overview" },
          { label: "🩺 Doctors", href: "/company/doctors" },
          { label: "🌐 DRX Doctors", href: null }
        ]} />
        <div className="space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">DRX Doctors</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Search and request doctors from the DRX platform</p>
          </div>

          {/* Connection status */}
          <div className={`rounded-xl p-3 border flex items-center gap-2 ${isConnected ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className={`text-xs font-semibold ${isConnected ? "text-green-700" : "text-red-700"}`}>
              {isConnected ? "Connected to DRX" : "DRX Connection Failed — contact support"}
            </span>
          </div>

          {/* Info banner */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 flex items-start gap-3">
            <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p className="text-sm font-semibold text-indigo-800">How it works</p>
              <p className="text-xs text-indigo-600 mt-0.5">Search for a doctor by name or DRX ID → Send request → DRX admin reviews → Doctor accepts → Doctor appears in your organization.</p>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or DRX ID..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <button type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all whitespace-nowrap">
              Search DRX
            </button>
          </form>

          {/* Results */}
          {searching && (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-gray-500 mt-3">Searching DRX platform...</p>
            </div>
          )}

          {!searching && searchQuery && drxDoctors.length === 0 && (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-400 text-sm">No doctors found for &quot;{searchQuery}&quot;</p>
              <p className="text-gray-400 text-xs mt-1">Try a different name or DRX ID</p>
            </div>
          )}

          {!searching && !searchQuery && drxDoctors.length === 0 && (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-400 text-sm">No doctors available on DRX platform yet</p>
            </div>
          )}

          {drxDoctors.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-3">{searchData.total} doctor{searchData.total !== 1 ? "s" : ""} found</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drxDoctors.map((doc) => (
                  <DoctorCard key={doc.doctor_gid} doctor={doc} onRequest={handleRequestClick} onViewDetail={(d) => setShowDetail(d)} />
                ))}
              </div>
            </div>
          )}

          {/* Doctor Detail Modal */}
          {showDetail && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Doctor Profile</h3>
                  <button onClick={() => setShowDetail(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                </div>
                {loadingDetail ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                    <p className="text-sm text-gray-400 mt-3">Loading profile...</p>
                  </div>
                ) : doctorDetail ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {(doctorDetail.name || "").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">{doctorDetail.name}</p>
                        <p className="text-xs text-indigo-500 font-mono">{doctorDetail.doctor_gid}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {doctorDetail.specialization && <DetailItem label="Specialization" value={doctorDetail.specialization} />}
                      {doctorDetail.hospital && <DetailItem label="Hospital" value={doctorDetail.hospital} />}
                      {doctorDetail.email && <DetailItem label="Email" value={doctorDetail.email} />}
                      {doctorDetail.phone && <DetailItem label="Phone" value={doctorDetail.phone} />}
                      {doctorDetail.qualification && <DetailItem label="Qualification" value={doctorDetail.qualification} />}
                      {doctorDetail.experience_years && <DetailItem label="Experience" value={`${doctorDetail.experience_years} years`} />}
                      {doctorDetail.city && <DetailItem label="City" value={doctorDetail.city} />}
                      {doctorDetail.state && <DetailItem label="State" value={doctorDetail.state} />}
                      {doctorDetail.license_number && <DetailItem label="License" value={doctorDetail.license_number} />}
                      {doctorDetail.registered_via && <DetailItem label="Registered Via" value={doctorDetail.registered_via} />}
                    </div>
                    {doctorDetail.bio && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Bio</p>
                        <p className="text-xs text-gray-600">{doctorDetail.bio}</p>
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setShowDetail(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">Close</button>
                      <button onClick={() => { setShowConfirm(doctorDetail); setShowDetail(null); }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold">Request to Add</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">Could not load doctor details</p>
                )}
              </div>
            </div>
          )}

          {/* Confirm Modal */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Request Doctor</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Send a request to add <span className="font-bold">{showConfirm.name}</span> to your organization?
                </p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-4 text-xs text-gray-500 space-y-1">
                  <p><span className="font-semibold text-gray-700">DRX ID:</span> {showConfirm.doctor_gid}</p>
                  {showConfirm.email && <p><span className="font-semibold text-gray-700">Email:</span> {showConfirm.email}</p>}
                  {showConfirm.phone && <p><span className="font-semibold text-gray-700">Phone:</span> {showConfirm.phone}</p>}
                </div>
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 mb-4">
                  <p className="text-xs text-amber-700">The doctor will receive a notification to accept. Once they accept and DRX admin approves, they'll appear in your organization.</p>
                </div>

                {requestMutation.error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs mb-3">
                    {requestMutation.error?.data?.detail || requestMutation.error.message || "Request failed"}
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button onClick={() => { setShowConfirm(null); setRequestReason(""); }}
                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                  <button onClick={() => requestMutation.mutate(showConfirm.username)}
                    disabled={requestMutation.isPending}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
                    {requestMutation.isPending ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success toast */}
          {requestMutation.isSuccess && (
            <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 z-50 animate-bounce">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Request sent successfully!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DoctorCard({ doctor, onRequest, onViewDetail }) {
  const initials = (doctor.name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{doctor.name}</p>
          <p className="text-xs text-gray-500">{doctor.specialization || "Specialization not set"}</p>
          {doctor.hospital && <p className="text-[11px] text-gray-400 mt-0.5">{doctor.hospital}</p>}
          <p className="text-[10px] text-indigo-500 font-mono mt-1">{doctor.doctor_gid}</p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
        <button onClick={() => onViewDetail(doctor)}
          className="flex-1 py-2 border border-indigo-200 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-all">
          View Info
        </button>
        <button onClick={() => onRequest(doctor)}
          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all">
          Request
        </button>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
      <p className="text-[10px] text-gray-400 font-bold uppercase">{label}</p>
      <p className="text-xs text-gray-700 font-medium mt-0.5 break-all">{value}</p>
    </div>
  );
}
