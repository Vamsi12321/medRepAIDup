"use client";
import { useState, useEffect, useCallback } from "react";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Toast from "@/components/Toast";
import { get, put, post, del } from "@/lib/api";
import { TableSkeleton } from "@/components/Skeleton";

export default function CompanyDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, page_size: 10 });
      if (search) params.append("search", search);
      const data = await get(`/api/v1/doctors/?${params}`);
      setDoctors(data.doctors);
      setTotal(data.total);
    } catch {
      setToast({ message: "Failed to load doctors.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const handleDelete = async () => {
    try {
      await del(`/api/v1/doctors/${confirmDelete.id}`);
      setConfirmDelete(null);
      setToast({ message: "Doctor removed successfully.", type: "success" });
      fetchDoctors();
    } catch {
      setConfirmDelete(null);
      setToast({ message: "Failed to remove doctor.", type: "error" });
    }
  };

  const handleToggleStatus = async (doctor) => {
    setDoctors(prev => prev.map(d => d.id === doctor.id ? { ...d, is_active: !d.is_active } : d));
    try {
      await put(`/api/v1/doctors/${doctor.id}`, { is_active: !doctor.is_active });
      setToast({ message: `Doctor marked as ${!doctor.is_active ? "active" : "inactive"}.`, type: "success" });
    } catch {
      setDoctors(prev => prev.map(d => d.id === doctor.id ? { ...d, is_active: doctor.is_active } : d));
      setToast({ message: "Failed to update doctor status.", type: "error" });
    }
  };

  const activeCount = doctors.filter(d => d.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 overflow-x-hidden">
      <CompanyNavbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Doctors Management 👨‍⚕️</h1>
            <p className="text-gray-600 text-sm">Manage healthcare professionals on your platform</p>
          </div>
          <button
            onClick={() => { setSelectedDoctor(null); setShowModal(true); }}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>➕</span><span>Add Doctor</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Doctors", value: total, icon: "👨‍⚕️", color: "from-blue-500 to-indigo-600", text: "from-blue-600 to-indigo-600" },
            { label: "Active", value: activeCount, icon: "✅", color: "from-green-500 to-emerald-600", text: "from-green-600 to-emerald-600" },
            { label: "Inactive", value: total - activeCount, icon: "⏸️", color: "from-gray-400 to-gray-500", text: "from-gray-500 to-gray-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-xl mb-3 shadow`}>{s.icon}</div>
              <p className={`text-3xl font-bold bg-gradient-to-r ${s.text} bg-clip-text text-transparent`}>{s.value}</p>
              <p className="text-gray-600 font-semibold text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-sm transition-all"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <tr>
                      <th className="px-5 py-4 text-left font-bold text-sm">Doctor</th>
                      <th className="px-5 py-4 text-left font-bold text-sm">Specialization</th>
                      <th className="px-5 py-4 text-left font-bold text-sm">Hospital</th>
                      <th className="px-5 py-4 text-left font-bold text-sm">Experience</th>
                      <th className="px-5 py-4 text-left font-bold text-sm">Status</th>
                      <th className="px-5 py-4 text-center font-bold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doctor, i) => (
                      <tr key={doctor.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-all ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-800">{doctor.name}</p>
                          <p className="text-sm text-gray-500">{doctor.email}</p>
                          {doctor.phone && <p className="text-xs text-gray-400">{doctor.phone}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold capitalize">
                            {doctor.specialization || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-600 text-sm">{doctor.hospital_name || "—"}</td>
                        <td className="px-5 py-4 text-gray-600 text-sm">{doctor.years_of_experience ? `${doctor.years_of_experience} yrs` : "—"}</td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleStatus(doctor)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-xs font-bold ${doctor.is_active ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100" : "bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100"}`}
                          >
                            <div className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${doctor.is_active ? "bg-green-500" : "bg-gray-300"}`}>
                              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-300 ${doctor.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                            </div>
                            {doctor.is_active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => { setSelectedDoctor(doctor); setShowModal(true); }}
                              className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-200 transition-all text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setConfirmDelete(doctor)}
                              className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-200 transition-all text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {doctors.length === 0 && (
                <div className="text-center py-16">
                  <span className="text-5xl">👨‍⚕️</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">No doctors found</h3>
                  <p className="text-gray-500 text-sm">Add a doctor to get started</p>
                </div>
              )}
            </div>

            {total > 10 && (
              <div className="flex justify-center items-center space-x-4 mt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-purple-400 disabled:opacity-40 transition-all">
                  ← Prev
                </button>
                <span className="text-gray-600 font-medium">Page {page} of {Math.ceil(total / 10)}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 10)}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-purple-400 disabled:opacity-40 transition-all">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <DoctorModal
          doctor={selectedDoctor}
          onClose={() => setShowModal(false)}
          onSaved={(msg) => { fetchDoctors(); setToast({ message: msg, type: "success" }); }}
        />
      )}

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
    </div>
  );
}

function DoctorModal({ doctor, onClose, onSaved }) {
  const isEdit = !!doctor;
  const [form, setForm] = useState({
    name: doctor?.name || "",
    email: doctor?.email || "",
    password: "",
    phone: doctor?.phone || "",
    specialization: doctor?.specialization || "",
    license_number: doctor?.license_number || "",
    hospital_name: doctor?.hospital_name || "",
    hospital_address: doctor?.hospital_address || "",
    years_of_experience: doctor?.years_of_experience || "",
    qualifications: doctor?.qualifications || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = isEdit
        ? { name: form.name, phone: form.phone, specialization: form.specialization,
            license_number: form.license_number, hospital_name: form.hospital_name,
            hospital_address: form.hospital_address,
            years_of_experience: form.years_of_experience ? Number(form.years_of_experience) : undefined,
            qualifications: form.qualifications }
        : { ...form, years_of_experience: form.years_of_experience ? Number(form.years_of_experience) : undefined,
            ...(form.password ? {} : { password: "Doctor@123" }) };

      if (isEdit) {
        await put(`/api/v1/doctors/${doctor.id}`, body);
      } else {
        await post(`/api/v1/doctors/`, body);
      }
      onSaved(isEdit ? "Doctor updated successfully." : "Doctor added successfully.");
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const f = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">👨‍⚕️</span>
            <h2 className="text-2xl font-bold text-white">{isEdit ? "Edit Doctor" : "Add Doctor"}</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {f("Full Name *", "name", "text", "Dr. Full Name")}
            {f("Email *", "email", "email", "doctor@hospital.com")}
            {!isEdit && f("Password (default: Doctor@123)", "password", "password", "Leave blank for default")}
            {f("Phone", "phone", "tel", "+91 98765 43210")}
            {f("Specialization", "specialization", "text", "e.g. Cardiology")}
            {f("License Number", "license_number", "text", "LIC-123")}
            {f("Hospital Name", "hospital_name", "text", "KIMS Hospital")}
            {f("Hospital Address", "hospital_address", "text", "Hyderabad")}
            {f("Years of Experience", "years_of_experience", "number", "8")}
            {f("Qualifications", "qualifications", "text", "MBBS, MD")}
          </div>

          <div className="flex space-x-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50">
              {saving ? "Saving..." : isEdit ? "Update Doctor" : "Add Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
