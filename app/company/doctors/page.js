"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Toast from "@/components/Toast";
import { get, put, post, del } from "@/lib/api";
import { TableSkeleton } from "@/components/Skeleton";
import { downloadCSVTemplate } from "@/lib/downloadTemplate";
import DoctorLocationsModal from "@/components/DoctorLocationsModal";

const DOCTOR_HEADERS = ["name","email","phone","specialization","classification","hospital","license_number","address"];
const DOCTOR_SAMPLE  = [["Dr. Sarah Sharma","sharma@gmail.com","+919876543210","Cardiologist","A","City Hospital","MH12345","123 Medical Street, Mumbai"]];

function BulkUploadModal({ onClose, onSuccess }) {
  const fileRef = React.useRef(null);
  const [file, setFile]       = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [result, setResult]   = React.useState(null);
  const [error, setError]     = React.useState("");

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch((process.env.NEXT_PUBLIC_BASE_PATH || '') + "/api/v1/doctors/bulk-upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setResult(data);
      if (data.successful > 0) onSuccess();
    } catch (e) {
      setError(e.message || "Upload failed");
    }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">📤 Bulk Upload Doctors</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Result view */}
        {result ? (
          <div className="space-y-4">
            <div className={`rounded-xl p-4 border ${result.failed === 0 ? "bg-green-50 border-green-200" : result.successful === 0 ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
              <p className={`font-bold text-sm mb-1 ${result.failed === 0 ? "text-green-700" : result.successful === 0 ? "text-red-700" : "text-yellow-700"}`}>
                {result.failed === 0 ? "✅" : result.successful === 0 ? "❌" : "⚠️"} {result.message}
              </p>
              <div className="flex gap-4 text-xs mt-2">
                <span className="text-green-600 font-semibold">✅ {result.successful} added</span>
                {result.failed > 0 && <span className="text-red-500 font-semibold">❌ {result.failed} failed</span>}
                <span className="text-gray-500">Total: {result.total_rows}</span>
              </div>
            </div>

            {result.errors?.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 max-h-48 overflow-y-auto">
                <p className="text-xs font-bold text-red-700 mb-2">Failed rows:</p>
                <div className="space-y-1.5">
                  {result.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs bg-white rounded-lg px-2.5 py-1.5 border border-red-100">
                      <span className="text-red-400 font-bold flex-shrink-0">Row {e.row}</span>
                      <span className="text-red-600">{e.error}</span>
                      {(e.email || e.phone || e.name) && (
                        <span className="text-gray-400 ml-auto flex-shrink-0">{e.email || e.phone || e.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={onClose} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all">Done</button>
          </div>
        ) : (
          <>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
              <p className="text-sm font-bold text-indigo-800 mb-1">📥 How to add multiple doctors at once</p>
              <ol className="text-xs text-indigo-700 space-y-1 list-decimal list-inside">
                <li>Download the template below</li>
                <li>Fill in doctor details — one row per doctor</li>
                <li>Upload the completed file here</li>
                <li>All doctors will be created with login access</li>
              </ol>
              <p className="text-xs text-indigo-500 mt-2">Default password <span className="font-mono font-bold">Doctor@123</span> will be assigned to all doctors.</p>
            </div>

            <button onClick={() => downloadCSVTemplate(DOCTOR_HEADERS, DOCTOR_SAMPLE, "doctors_template.csv")}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all mb-3 flex items-center justify-center gap-2 shadow">
              📥 Download Doctor Template
            </button>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs mb-3">{error}</div>}

            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />

            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 cursor-pointer transition-colors mb-4">
              {file ? (
                <div>
                  <p className="text-indigo-600 font-bold text-sm">📄 {file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB — ready to upload</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500"><span className="text-indigo-600 font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">CSV or XLSX (max 5MB, max 100 rows)</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-sm">Cancel</button>
              <button onClick={handleUpload} disabled={!file || uploading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload & Import"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CompanyDoctors() {
  const queryClient = useQueryClient();
  const [search, setSearch]             = useState("");
  const [toast, setToast]               = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showLocations, setShowLocations]   = useState(false);
  const [locationsDoctor, setLocationsDoctor] = useState(null);
  const [confirmDelete, setConfirmDelete]   = useState(null);
  const [showBulkModal, setShowBulkModal]   = useState(false);
  const [showRequests, setShowRequests]     = useState(false);
  const [filterHospital, setFilterHospital]             = useState("");
  const [filterStatus, setFilterStatus]                 = useState("all");
  const [filterSpecialization, setFilterSpecialization] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => get("/api/v1/doctors?page_size=1000").then((d) => {
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.doctors)) return d.doctors;
      if (Array.isArray(d?.data)) return d.data;
      return [];
    }),
    gcTime: 30 * 60 * 1000,
    staleTime: 0,
    placeholderData: (prev) => prev,
    retry: 2,
  });

  const doctors = Array.isArray(data) ? data : [];
  const total   = doctors.length;
  const loading = isLoading && !data;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["doctors"], refetchType: "all" });

  const handleDelete = async () => {
    try {
      const doctorId = confirmDelete.doctor_id || confirmDelete.id;
      await del(`/api/v1/doctors/${doctorId}`);
      setConfirmDelete(null);
      setToast({ message: "Doctor removed successfully.", type: "success" });
      invalidate();
    } catch {
      setConfirmDelete(null);
      setToast({ message: "Failed to remove doctor.", type: "error" });
    }
  };

  const handleToggleStatus = async (doctor) => {
    const doctorId = doctor.doctor_id || doctor.id;
    try {
      await put(`/api/v1/doctors/${doctorId}`, { is_active: !doctor.is_active });
      setToast({ message: `Doctor marked as ${!doctor.is_active ? "active" : "inactive"}.`, type: "success" });
      invalidate();
    } catch {
      setToast({ message: "Failed to update status.", type: "error" });
    }
  };

  const activeCount = doctors.filter((d) => d.is_active).length;

  // Client-side filters
  // Unique specializations from loaded doctors for dropdown
  const specializations = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))].sort();

  const filteredDoctors = doctors.filter((d) => {
    if (filterStatus === "active"   && !d.is_active) return false;
    if (filterStatus === "inactive" &&  d.is_active) return false;
    if (filterHospital && !d.hospital?.toLowerCase().includes(filterHospital.toLowerCase())) return false;
    if (search && !d.name?.toLowerCase().includes(search.toLowerCase()) &&
                  !d.email?.toLowerCase().includes(search.toLowerCase()) &&
                  !d.hospital?.toLowerCase().includes(search.toLowerCase()) &&
                  !d.specialization?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fafbfd] overflow-x-hidden">
      <CompanyNavbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Doctors</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage healthcare professionals · {total} total</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/company/drx-doctors`}
              className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-1.5 text-xs">
              <span>🌐</span><span>DRX Doctors</span>
            </a>
            <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/company/drx-requests`}
              className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold hover:border-blue-300 hover:text-blue-600 transition-all flex items-center gap-1.5 text-xs">
              <span>📨</span><span>DRX Requests</span>
            </a>
            <button onClick={() => setShowRequests(true)}
              className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold hover:border-amber-300 hover:text-amber-600 transition-all flex items-center gap-1.5 text-xs">
              <span>📋</span><span>Requests</span>
            </button>
            <button onClick={() => setShowBulkModal(true)}
              className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold hover:border-purple-300 hover:text-purple-600 transition-all flex items-center gap-1.5 text-xs">
              <span>📤</span><span>Bulk Upload</span>
            </button>
            <button onClick={() => { setSelectedDoctor(null); setShowModal(true); }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 text-xs">
              <span>➕</span><span>Add Doctor</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total", value: total, accent: "border-l-purple-400" },
            { label: "Active", value: activeCount, accent: "border-l-emerald-400" },
            { label: "Inactive", value: total - activeCount, accent: "border-l-gray-300" },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-xl p-4 border border-gray-100 border-l-4 ${s.accent} shadow-sm`}>
              <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input type="text" placeholder="Search by name, email, hospital..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[220px] px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:ring-2 focus:ring-purple-200 outline-none">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(filterStatus !== "all") && (
            <button onClick={() => setFilterStatus("all")}
              className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-200">Clear</button>
          )}
        </div>

        {/* Table / Cards */}
        {loading ? (
          <div className="space-y-2">{[1,2,3,4,5].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-600 font-bold text-sm mb-2">Failed to load doctors</p>
            <p className="text-red-400 text-xs mb-4">{error.message}</p>
            <button onClick={() => refetch()} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600">Retry</button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-[10px] text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-4 py-3 text-left font-bold text-[10px] text-gray-500 uppercase tracking-wider">Specialization</th>
                      <th className="px-4 py-3 text-left font-bold text-[10px] text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-4 py-3 text-left font-bold text-[10px] text-gray-500 uppercase tracking-wider">Hospital</th>
                      <th className="px-4 py-3 text-left font-bold text-[10px] text-gray-500 uppercase tracking-wider">Added By</th>
                      <th className="px-4 py-3 text-left font-bold text-xs">Status</th>
                      <th className="px-4 py-3 text-center font-bold text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((doctor, i) => (
                      <tr key={doctor.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-all ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-800 text-sm">{doctor.name}</p>
                          <p className="text-xs text-gray-500">{doctor.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg text-xs font-semibold">{doctor.specialization || "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                            doctor.classification === "A" ? "bg-red-100 text-red-700" :
                            doctor.classification === "B" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>{doctor.classification || "C"}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{doctor.hospital || "—"}</td>
                        <td className="px-4 py-3">
                          {doctor.added_by ? (
                            <div>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                doctor.added_by.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"
                              }`}>{doctor.added_by.role}</span>
                              <p className="text-xs text-gray-600 mt-0.5 truncate max-w-[100px]">{doctor.added_by.name}</p>
                            </div>
                          ) : <span className="text-xs text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                           <button onClick={() => handleToggleStatus(doctor)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${doctor.is_active ? "bg-green-500" : "bg-gray-300"}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${doctor.is_active ? "translate-x-4" : "translate-x-0"}`} />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => { setSelectedDoctor(doctor); setShowModal(true); }}
                              className="bg-blue-100 text-blue-600 px-2.5 py-1 rounded-lg font-semibold hover:bg-blue-200 transition-all text-xs">Edit</button>
                            <button onClick={() => { setLocationsDoctor(doctor); setShowLocations(true); }}
                              className="bg-purple-100 text-purple-600 px-2.5 py-1 rounded-lg font-semibold hover:bg-purple-200 transition-all text-xs">📍 Locations</button>
                            <button onClick={() => setConfirmDelete(doctor)}
                              className="bg-red-100 text-red-600 px-2.5 py-1 rounded-lg font-semibold hover:bg-red-200 transition-all text-xs">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredDoctors.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-4xl">🩺</span>
                  <p className="text-gray-400 mt-3 text-sm">No doctors found</p>
                </div>
              )}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {filteredDoctors.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <span className="text-4xl">🩺</span>
                  <p className="text-gray-400 mt-3 text-sm">No doctors found</p>
                </div>
              ) : filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {doctor.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{doctor.name}</p>
                      <p className="text-xs text-gray-400 truncate">{doctor.email}</p>
                    </div>
                    <button onClick={() => handleToggleStatus(doctor)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${doctor.is_active ? "bg-green-500" : "bg-gray-300"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${doctor.is_active ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {doctor.specialization && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-xs font-semibold">{doctor.specialization}</span>}
                    {doctor.classification && <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                      doctor.classification === "A" ? "bg-red-50 text-red-600" :
                      doctor.classification === "B" ? "bg-yellow-50 text-yellow-600" :
                      "bg-gray-50 text-gray-500"
                    }`}>Class {doctor.classification}</span>}
                    {doctor.hospital && <span className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md text-xs">{doctor.hospital}</span>}
                    {doctor.added_by && <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                      doctor.added_by.role === "ADMIN" ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                    }`}>{doctor.added_by.role}: {doctor.added_by.name}</span>}
                    {doctor.approved_by && <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-md text-xs font-semibold">✓ {doctor.approved_by.name}</span>}
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${doctor.is_active ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                      {doctor.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { setSelectedDoctor(doctor); setShowModal(true); }}
                      className="flex-1 bg-blue-100 text-blue-600 py-1.5 rounded-lg font-semibold text-xs hover:bg-blue-200 transition-all">Edit</button>
                    <button onClick={() => { setLocationsDoctor(doctor); setShowLocations(true); }}
                      className="flex-1 bg-purple-100 text-purple-600 py-1.5 rounded-lg font-semibold text-xs hover:bg-purple-200 transition-all">📍 Locations</button>
                    <button onClick={() => setConfirmDelete(doctor)}
                      className="flex-1 bg-red-100 text-red-600 py-1.5 rounded-lg font-semibold text-xs hover:bg-red-200 transition-all">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {showModal && (
        <DoctorModal
          doctor={selectedDoctor}
          onClose={() => setShowModal(false)}
          onSaved={(msg) => { invalidate(); setToast({ message: msg, type: "success" }); }}
        />
      )}
      {showLocations && locationsDoctor && (
        <DoctorLocationsModal
          doctor={locationsDoctor}
          onClose={() => { setShowLocations(false); setLocationsDoctor(null); invalidate(); }}
        />
      )}

      {showBulkModal && <BulkUploadModal onClose={() => setShowBulkModal(false)} onSuccess={refetch} />}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <span className="text-5xl">⚠️</span>
            <h3 className="text-xl font-bold text-gray-900 mt-3 mb-2">Remove Doctor?</h3>
            <p className="text-gray-600 text-sm mb-6">Are you sure you want to remove <span className="font-bold">{confirmDelete.name}</span>?</p>
            <div className="flex space-x-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all">Remove</button>
            </div>
          </div>
        </div>
      )}

      {showRequests && <DoctorRequestsPanel onClose={() => setShowRequests(false)} onApproved={invalidate} />}
    </div>
  );
}

function DoctorModal({ doctor, onClose, onSaved }) {
  const isEdit = !!doctor;

  // Form keys match exactly what the API accepts:
  // POST: name, email, password, phone, specialization, hospital, license_number, address
  // PUT:  name, phone, specialization, hospital, license_number, address, is_active
  const [form, setForm] = useState({
    name:           doctor?.name           || "",
    email:          doctor?.email          || "",
    password:       "",
    phone:          doctor?.phone          || "",
    specialization: doctor?.specialization || "",
    classification: doctor?.classification || "C",
    hospital:       doctor?.hospital       || "",
    license_number: doctor?.license_number || "",
    address:        doctor?.address        || "",
    latitude:       doctor?.latitude       || "",
    longitude:      doctor?.longitude      || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isEdit) {
        const body = {
          name:           form.name,
          phone:          form.phone,
          specialization: form.specialization,
          classification: form.classification,
          hospital:       form.hospital,
          license_number: form.license_number,
          address:        form.address,
          ...(form.latitude  && { latitude:  parseFloat(form.latitude)  }),
          ...(form.longitude && { longitude: parseFloat(form.longitude) }),
        };
        await put(`/api/v1/doctors/${doctor.id}`, body);
      } else {
        const body = {
          name:           form.name,
          email:          form.email,
          password:       form.password || "Doctor@123",
          phone:          form.phone,
          specialization: form.specialization,
          classification: form.classification,
          hospital:       form.hospital,
          license_number: form.license_number,
          address:        form.address,
          ...(form.latitude  && { latitude:  parseFloat(form.latitude)  }),
          ...(form.longitude && { longitude: parseFloat(form.longitude) }),
        };
        await post(`/api/v1/doctors`, body);
      }
      onSaved(isEdit ? "Doctor updated successfully." : "Doctor added successfully.");
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = "text", placeholder = "", required = false) => (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm outline-none"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">👨‍⚕️</span>
            <h2 className="text-xl font-bold text-white">{isEdit ? "Edit Doctor" : "Add Doctor"}</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field("Full Name", "name", "text", "Dr. Sarah Sharma", true)}
            {field("Email", "email", "email", "doctor@hospital.com", !isEdit)}
            {!isEdit && field("Password (default: Doctor@123)", "password", "password", "Leave blank for default")}
            {field("Phone", "phone", "tel", "+91 98765 43210")}
            {field("Specialization", "specialization", "text", "e.g. Cardiologist")}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Classification <span className="text-red-500">*</span></label>
              <select value={form.classification} onChange={(e) => setForm({ ...form, classification: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm outline-none bg-white">
                <option value="A">A — High Value (2 visits/month)</option>
                <option value="B">B — Medium Value (1 visit/month)</option>
                <option value="C">C — Low Value (1 visit/2 months)</option>
              </select>
            </div>
            {field("Hospital", "hospital", "text", "City Hospital")}
            {field("License Number", "license_number", "text", "MH12345")}
            {field("Address", "address", "text", "e.g. 123 Medical Street, Mumbai")}
            <div className="md:col-span-2">
              <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 flex items-start gap-3 mt-2">
                <span className="text-xl leading-none">📍</span>
                <div>
                  <p className="text-xs font-bold text-purple-900 mb-0.5">Location setup required for MR check-ins</p>
                  <p className="text-[11px] text-purple-700 leading-relaxed">
                    After saving this doctor, you <span className="font-bold">must</span> manage their clinic locations & geofencing using the <span className="font-bold px-1.5 py-0.5 bg-white rounded border border-purple-200">📍 Locations</span> button on their card. MRs cannot check-in until a location is added.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 text-sm">
              {saving ? "Saving..." : isEdit ? "Update Doctor" : "Add Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DoctorRequestsPanel({ onClose, onApproved }) {
  const [filter, setFilter] = useState("pending");
  const [searchReq, setSearchReq] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["doctor-requests", filter],
    queryFn: () => get(`/api/v1/doctors/requests?status_filter=${filter}`).then((d) => d.requests || []),
    enabled: filter !== "approved",
  });

  // Approved tab: doctors where added_by.role === "MR" and approved_by !== null
  const { data: doctorsData, isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => get("/api/v1/doctors?page_size=1000").then((d) => d.doctors || []),
    enabled: filter === "approved",
    staleTime: 7 * 60 * 1000,
  });

  const approvedDoctors = (doctorsData || []).filter(
    (d) => d.added_by?.role === "MR" && d.approved_by !== null
  );

  const requests = filter === "approved" ? [] : (data || []);
  const loading = filter === "approved" ? loadingDoctors : isLoading;

  // Apply search filter
  const sq = searchReq.toLowerCase().trim();
  const filteredRequests = sq ? requests.filter((r) =>
    r.name?.toLowerCase().includes(sq) ||
    r.specialization?.toLowerCase().includes(sq) ||
    r.hospital?.toLowerCase().includes(sq) ||
    r.requested_by_name?.toLowerCase().includes(sq) ||
    r.email?.toLowerCase().includes(sq)
  ) : requests;
  const filteredApproved = sq ? approvedDoctors.filter((d) =>
    d.name?.toLowerCase().includes(sq) ||
    d.specialization?.toLowerCase().includes(sq) ||
    d.hospital?.toLowerCase().includes(sq) ||
    d.added_by?.name?.toLowerCase().includes(sq) ||
    d.email?.toLowerCase().includes(sq)
  ) : approvedDoctors;

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await post(`/api/v1/doctors/requests/${id}/approve`);
      refetch();
      onApproved();
    } catch {}
    setProcessing(null);
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || rejectReason.length < 10) return;
    setProcessing(rejectId);
    try {
      await post(`/api/v1/doctors/requests/${rejectId}/reject`, { rejection_reason: rejectReason });
      refetch();
      setRejectId(null);
      setRejectReason("");
    } catch {}
    setProcessing(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col h-full border-l border-gray-200">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h2 className="text-lg font-bold text-white">Doctor Requests</h2>
                <p className="text-amber-100 text-xs">MR-submitted doctor requests</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-4 py-3 border-b border-gray-100 flex gap-1.5 flex-shrink-0">
          {["pending", "approved", "rejected"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${filter === s ? "bg-amber-100 text-amber-700 shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
          <input type="text" placeholder="🔍 Search by name, specialization, MR..."
            value={searchReq} onChange={(e) => setSearchReq(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400" />
        </div>

        {/* Request list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : filter === "approved" ? (
            /* Approved tab — from doctors collection where added_by.role === "MR" */
            filteredApproved.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-4xl">✅</span>
                <p className="text-gray-400 mt-3 text-sm">No approved MR requests yet</p>
              </div>
            ) : filteredApproved.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl border border-green-200 shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.specialization} · {doc.hospital || "No hospital"}</p>
                    <p className="text-xs text-gray-400">{doc.email} · {doc.phone}</p>
                  </div>
                  {doc.classification && (
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      doc.classification === "A" ? "bg-red-100 text-red-700" :
                      doc.classification === "B" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>Class {doc.classification}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-2">
                  <span>Requested by: <span className="font-semibold text-orange-600">{doc.added_by?.name}</span></span>
                  <span>· Approved by: <span className="font-semibold text-green-600">{doc.approved_by?.name}</span></span>
                  {doc.created_at && <span>· {new Date(doc.created_at).toLocaleDateString()}</span>}
                </div>
                <div className="bg-green-50 rounded-lg px-3 py-1.5 border border-green-100">
                  <p className="text-xs text-green-700 font-semibold">✓ Approved & Active</p>
                </div>
              </div>
            ))
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-4xl">📋</span>
              <p className="text-gray-400 mt-3 text-sm">No {filter} requests</p>
            </div>
          ) : filteredRequests.map((req) => (
            <div key={req.request_id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-gray-900">{req.name}</p>
                  <p className="text-xs text-gray-500">{req.specialization} · {req.hospital || "No hospital"}</p>
                  <p className="text-xs text-gray-400">{req.email} · {req.phone}</p>
                </div>
                {req.classification && (
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                    req.classification === "A" ? "bg-red-100 text-red-700" :
                    req.classification === "B" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>Class {req.classification}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-3">
                <span>Requested by: <span className="font-semibold text-gray-600">{req.requested_by_name}</span></span>
                {req.created_at && <span>· {new Date(req.created_at).toLocaleDateString()}</span>}
              </div>
              {req.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(req.request_id)} disabled={processing === req.request_id}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold text-xs hover:bg-green-600 transition-all disabled:opacity-50">
                    {processing === req.request_id ? "..." : "✓ Approve"}
                  </button>
                  <button onClick={() => { setRejectId(req.request_id); setRejectReason(""); }}
                    className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-bold text-xs hover:bg-red-200 transition-all">
                    ✗ Reject
                  </button>
                </div>
              )}
              {req.status === "rejected" && (
                <div className="bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                  <p className="text-xs text-red-600 font-semibold">✗ Rejected</p>
                  {req.rejection_reason && <p className="text-[10px] text-red-500 mt-0.5">{req.rejection_reason}</p>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reject modal */}
        {rejectId && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4 z-10">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Rejection Reason</h3>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide reason (min 10 characters)..." rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-200 resize-none mb-3" />
              <div className="flex gap-2">
                <button onClick={() => setRejectId(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-xs">Cancel</button>
                <button onClick={handleReject} disabled={rejectReason.length < 10}
                  className="flex-1 bg-red-500 text-white py-2 rounded-xl font-bold text-xs disabled:opacity-50">Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
