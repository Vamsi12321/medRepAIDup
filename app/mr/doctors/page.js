"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MRSidebar from "@/components/mr/MRSidebar";
import NotificationBell from "@/components/NotificationBell";
import Link from "next/link";
import { formatISTDate } from "@/lib/time";
import { get, post } from "@/lib/api";

const mrId = () => typeof window !== "undefined" ? localStorage.getItem("userId") : null;

export default function MRDoctors() {
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("doctors");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: "", specialization: "", hospital: "", email: "", phone: "", reason: "" });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const pageSize = 10;
  const queryClient = useQueryClient();

  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "MR" : "MR";
  const id = mrId();

  const { data: mrData, isLoading: loadingMR } = useQuery({
    queryKey: ["mr-profile", id],
    queryFn: () => get(`/api/v1/mrs/${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
  const territory = mrData?.territory || "";

  const { data: allDoctorsData, isLoading: loadingDoctors } = useQuery({
    queryKey: ["all-doctors"],
    queryFn: () => get("/api/v1/doctors?page_size=1000").then((d) => d.doctors || []),
    enabled: !!id,
    staleTime: 7 * 60 * 1000,
  });

  const { data: requestsData, isLoading: loadingRequests } = useQuery({
    queryKey: ["doctor-requests"],
    queryFn: () => get("/api/v1/doctors/requests").then((d) => d.requests || []),
    enabled: !!id,
    staleTime: 7 * 60 * 1000,
  });

  const assignedDoctorsList = mrData?.assigned_doctors || [];
  const assignedDoctorIds = new Set(assignedDoctorsList.map((d) => d.id));
  const allDoctors = Array.isArray(allDoctorsData) ? allDoctorsData : [];
  const assignedDoctors = allDoctors.filter((d) => assignedDoctorIds.has(d.id));
  const doctorRequests = Array.isArray(requestsData) ? requestsData : [];
  const isLoading = loadingMR || loadingDoctors;

  const filteredDoctors = assignedDoctors.filter((d) => {
    const matchSearch = !search.trim() || d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specFilter === "All" || d.specialization === specFilter;
    const matchCity = cityFilter === "All" || d.city === cityFilter;
    return matchSearch && matchSpec && matchCity;
  });

  const totalPages = Math.ceil(filteredDoctors.length / pageSize);
  const paginatedDoctors = filteredDoctors.slice((page - 1) * pageSize, page * pageSize);
  const specializations = [...new Set(assignedDoctors.map(d => d.specialization).filter(Boolean))];
  const cities = [...new Set(assignedDoctors.map(d => d.city).filter(Boolean))];

  const handleRequestSubmit = async () => {
    if (!requestForm.name) return;
    setRequestSubmitting(true);
    try {
      await post("/api/v1/doctors/requests", requestForm);
      queryClient.invalidateQueries(["doctor-requests"]);
      setShowRequestModal(false);
      setRequestForm({ name: "", specialization: "", hospital: "", email: "", phone: "", reason: "" });
    } catch (e) { /* silent */ }
    setRequestSubmitting(false);
  };

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
            {territory && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                <span className="font-medium">{territory}</span>
              </div>
            )}
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
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">My Doctors</h1>
              <p className="text-gray-400 text-xs mt-0.5">Manage and track all doctors assigned to you</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowRequestModal(true)} className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Request Doctor
              </button>
              <button className="bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-gray-50">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filter
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            <button onClick={() => setActiveTab("doctors")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "doctors" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"}`}>
              🩺 Doctors ({assignedDoctors.length})
            </button>
            <button onClick={() => setActiveTab("requests")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "requests" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"}`}>
              📋 Requests ({doctorRequests.length})
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><span className="text-lg">🩺</span></div>
              <div>
                <p className="text-xl font-extrabold text-gray-900">{assignedDoctors.length}</p>
                <p className="text-[10px] text-gray-400">Assigned Doctors</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><span className="text-lg">📋</span></div>
              <div>
                <p className="text-xl font-extrabold text-gray-900">{doctorRequests.length}</p>
                <p className="text-[10px] text-gray-400">Pending Requests</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><span className="text-lg">📅</span></div>
              <div>
                <p className="text-xl font-extrabold text-gray-900">{specializations.length}</p>
                <p className="text-[10px] text-gray-400">Specializations</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><span className="text-lg">📊</span></div>
              <div>
                <p className="text-xl font-extrabold text-green-600">{assignedDoctors.length > 0 ? Math.round((assignedDoctors.filter(d => d.last_visit).length / assignedDoctors.length) * 100) : 0}%</p>
                <p className="text-[10px] text-gray-400">Doctor Coverage</p>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          {activeTab === "doctors" && (<>
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search doctors by name, specialty, hospital..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300" />
            </div>
            <select value={specFilter} onChange={(e) => { setSpecFilter(e.target.value); setPage(1); }} className="px-3 py-2.5 border border-gray-200 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="All">Specialty: All</option>
              {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setPage(1); }} className="px-3 py-2.5 border border-gray-200 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="All">City: All</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => { setSearch(""); setSpecFilter("All"); setCityFilter("All"); setPage(1); }} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              Reset <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>

          {/* Main content: Doctor Table + Right Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Doctor Table */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200">
              {/* Table Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Doctors ({filteredDoctors.length})</h3>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <span>Sort by: Last Visit</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Doctor Rows */}
              {isLoading ? (
                <div className="p-5 space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />)}</div>
              ) : paginatedDoctors.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="text-3xl block mb-2">🩺</span>
                  <p className="text-sm font-bold text-gray-700">{assignedDoctors.length === 0 ? "No doctors assigned" : "No matches"}</p>
                  <p className="text-xs text-gray-400 mt-1">Request a doctor to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {paginatedDoctors.map((doctor) => {
                    const cls = doctor.classification;
                    const clsColor = cls === "A" ? "bg-red-500" : cls === "B" ? "bg-orange-500" : "bg-gray-400";
                    return (
                      <div key={doctor.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                        {/* Avatar */}
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                          {doctor.name?.charAt(0)?.toUpperCase()}
                        </div>
                        {/* Name + Spec */}
                        <div className="min-w-0 w-[180px] flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[12px] font-bold text-gray-900 truncate">{doctor.name}</p>
                            {cls && <span className={`w-4 h-4 ${clsColor} text-white text-[8px] font-bold rounded flex items-center justify-center flex-shrink-0`}>{cls}</span>}
                          </div>
                          <p className="text-[10px] text-gray-400">{doctor.specialization || "—"}</p>
                          {doctor.hospital && <p className="text-[9px] text-gray-300 flex items-center gap-0.5">📍 {doctor.hospital}</p>}
                        </div>
                        {/* Last Visit */}
                        <div className="hidden lg:block w-[90px] flex-shrink-0">
                          <p className="text-[9px] text-gray-400">Last Visit</p>
                          <p className="text-[11px] font-medium text-gray-700">{doctor.last_visit ? formatISTDate(doctor.last_visit) : "—"}</p>
                        </div>
                        {/* Next Visit */}
                        <div className="hidden lg:block w-[90px] flex-shrink-0">
                          <p className="text-[9px] text-gray-400">Next Visit</p>
                          <p className="text-[11px] font-medium text-gray-700">{doctor.next_visit ? formatISTDate(doctor.next_visit) : "—"}</p>
                          <span className="text-[8px] text-blue-500 font-medium">Planned</span>
                        </div>
                        {/* Mini chart placeholder */}
                        <div className="hidden xl:block w-[60px] flex-shrink-0">
                          <svg viewBox="0 0 50 20" className="w-full h-5 text-green-400">
                            <polyline fill="none" stroke="currentColor" strokeWidth="2" points="0,15 10,10 20,12 30,6 40,8 50,4" />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {filteredDoctors.length > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400">Showing {(page-1)*pageSize + 1} to {Math.min(page*pageSize, filteredDoctors.length)} of {filteredDoctors.length} doctors</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-md text-[10px] font-bold ${p === page ? "bg-indigo-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{p}</button>
                    ))}
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span>Rows per page:</span>
                    <span className="font-medium text-gray-600">10</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-5">
              {/* Doctor Coverage Map */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[12px] font-bold text-gray-900">Doctor Coverage Map</h3>
                  <span className="text-[10px] text-indigo-600 font-medium cursor-pointer">View Full Map</span>
                </div>
                <div className="w-full h-[160px] bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 rounded-lg flex items-center justify-center border border-gray-100">
                  <span className="text-gray-300 text-xs">🗺️ Map Preview</span>
                </div>
              </div>

              {/* Recent Doctor Activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[12px] font-bold text-gray-900">Recent Doctor Activity</h3>
                  <span className="text-[10px] text-indigo-600 font-medium cursor-pointer">View All</span>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: "📅", iconBg: "bg-blue-50", title: "Visit Completed", doctor: "Dr. Rajesh Verma", time: "24 Jul 2026 • 10:30 AM" },
                    { icon: "📋", iconBg: "bg-green-50", title: "DCR Submitted", doctor: "Dr. Anitha Reddy", time: "24 Jul 2026 • 09:15 AM" },
                    { icon: "➕", iconBg: "bg-purple-50", title: "New Doctor Added", doctor: "Dr. Kiran Kumar", time: "23 Jul 2026 • 05:45 PM" },
                    { icon: "🎯", iconBg: "bg-orange-50", title: "SFE Target Updated", doctor: "Dr. Suresh Kumar", time: "23 Jul 2026 • 03:20 PM" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-2.5 relative">
                      {i < 3 && <div className="absolute left-[15px] top-[28px] w-px h-[calc(100%+4px)] bg-gray-100" />}
                      <div className={`w-8 h-8 ${activity.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 relative z-10`}>
                        <span className="text-xs">{activity.icon}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-700">{activity.title}</p>
                        <p className="text-[10px] font-medium text-gray-900">{activity.doctor}</p>
                        <p className="text-[9px] text-gray-300">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 py-2 border border-gray-200 rounded-lg text-[10px] font-medium text-gray-500 hover:bg-gray-50 transition-colors">View All Activity</button>
              </div>
            </div>
          </div>
          </>)}

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Doctor Requests ({doctorRequests.length})</h3>
              {loadingRequests ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />)}</div>
              ) : doctorRequests.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-3xl block mb-2">📋</span>
                  <p className="text-sm font-bold text-gray-700">No pending requests</p>
                  <p className="text-xs text-gray-400 mt-1">Request a new doctor to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {doctorRequests.map((req, idx) => (
                    <div key={req.request_id || idx} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">{req.name?.charAt(0)?.toUpperCase() || "?"}</div>
                        <div>
                          <p className="text-[12px] font-bold text-gray-900">{req.name || "Unknown"}</p>
                          <p className="text-[10px] text-gray-400">{req.specialization || "—"} • {req.hospital || "—"}</p>
                          {req.rejection_reason && <p className="text-[9px] text-red-400 mt-0.5">Reason: {req.rejection_reason}</p>}
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${req.status === "approved" ? "bg-green-50 text-green-600" : req.status === "rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                        {req.status || "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Request Doctor Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Request New Doctor</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Doctor Name *</label>
                <input type="text" value={requestForm.name} onChange={(e) => setRequestForm({...requestForm, name: e.target.value})} placeholder="Dr. Full Name" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Specialization</label>
                  <input type="text" value={requestForm.specialization} onChange={(e) => setRequestForm({...requestForm, specialization: e.target.value})} placeholder="e.g. Cardiologist" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Hospital</label>
                  <input type="text" value={requestForm.hospital} onChange={(e) => setRequestForm({...requestForm, hospital: e.target.value})} placeholder="Hospital name" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Email</label>
                  <input type="email" value={requestForm.email} onChange={(e) => setRequestForm({...requestForm, email: e.target.value})} placeholder="doctor@email.com" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Phone</label>
                  <input type="tel" value={requestForm.phone} onChange={(e) => setRequestForm({...requestForm, phone: e.target.value})} placeholder="+91XXXXXXXXXX" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Reason (optional)</label>
                <textarea value={requestForm.reason} onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})} placeholder="Why do you want this doctor assigned?" rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowRequestModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={handleRequestSubmit} disabled={!requestForm.name || requestSubmitting} className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-50 transition-all">
                {requestSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
