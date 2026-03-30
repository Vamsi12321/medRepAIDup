"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Toast from "@/components/Toast";
import { get, put, post, del } from "@/lib/api";
import { TableSkeleton } from "@/components/Skeleton";

export default function CompanyMedicalReps() {
  const [mrs, setMrs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMR, setSelectedMR] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchMRs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, page_size: 10 });
      if (search) params.append("search", search);
      const data = await get(`/api/v1/mrs?${params}`);
      setMrs(data.mrs || []);
      setTotal(data.total || 0);
    } catch {
      setToast({ message: "Failed to load MRs.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, search, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchMRs(); }, [fetchMRs]);

  const refetch = () => setRefreshKey((k) => k + 1);

  const handleDelete = async () => {
    try {
      await del(`/api/v1/mrs/${confirmDelete.id}`);
      setConfirmDelete(null);
      setToast({ message: "MR removed successfully.", type: "success" });
      refetch();
    } catch {
      setConfirmDelete(null);
      setToast({ message: "Failed to remove MR.", type: "error" });
    }
  };

  const handleToggleStatus = async (mr) => {
    setMrs((prev) => prev.map((m) => m.id === mr.id ? { ...m, is_active: !m.is_active } : m));
    try {
      await put(`/api/v1/mrs/${mr.id}`, { is_active: !mr.is_active });
      setToast({ message: `MR marked as ${!mr.is_active ? "active" : "inactive"}.`, type: "success" });
    } catch {
      setMrs((prev) => prev.map((m) => m.id === mr.id ? { ...m, is_active: mr.is_active } : m));
      setToast({ message: "Failed to update status.", type: "error" });
    }
  };

  const activeCount = mrs.filter((m) => m.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-x-hidden">
      <CompanyNavbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Medical Representatives 💼</h1>
            <p className="text-gray-600 text-sm">Manage your field force and sales team</p>
          </div>
          <button
            onClick={() => { setSelectedMR(null); setShowModal(true); }}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>➕</span><span>Add MR</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total MRs", value: total, icon: "💼", color: "from-orange-500 to-red-500", text: "from-orange-600 to-red-600" },
            { label: "Active", value: activeCount, icon: "✅", color: "from-green-500 to-emerald-600", text: "from-green-600 to-emerald-600" },
            { label: "Inactive", value: total - activeCount, icon: "⏸️", color: "from-gray-400 to-gray-500", text: "from-gray-500 to-gray-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-xl mb-3 shadow`}>{s.icon}</div>
              <p className={`text-3xl font-bold bg-gradient-to-r ${s.text} bg-clip-text text-transparent`}>{s.value}</p>
              <p className="text-gray-600 font-semibold text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6">
          <input
            type="text"
            placeholder="🔍 Search by name, email or territory..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm transition-all outline-none"
          />
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <tr>
                      <th className="px-5 py-4 text-left font-bold text-sm">MR</th>
                      <th className="px-5 py-4 text-left font-bold text-sm">Territory</th>
                      <th className="px-5 py-4 text-left font-bold text-sm">Assigned Doctors</th>
                      <th className="px-5 py-4 text-left font-bold text-sm">Status</th>
                      <th className="px-5 py-4 text-center font-bold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mrs.map((mr, i) => (
                      <tr key={mr.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-all ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-800">{mr.name}</p>
                          <p className="text-sm text-gray-500">{mr.email}</p>
                          {mr.phone && <p className="text-xs text-gray-400">{mr.phone}</p>}
                        </td>
                        <td className="px-5 py-4 text-gray-600 text-sm">{mr.territory || "—"}</td>
                        <td className="px-5 py-4 text-gray-600 text-sm">
                          {mr.assigned_doctors?.length ? (
                            <div className="relative group inline-block">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-semibold cursor-default">
                                {mr.assigned_doctors.length} doctor{mr.assigned_doctors.length !== 1 ? "s" : ""}
                              </span>
                              <div className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-max">
                                {mr.assigned_doctors.map((d) => (
                                  <p key={d.id} className="text-xs text-gray-700 font-medium px-2 py-1 hover:bg-gray-50 rounded">
                                    👨‍⚕️ {d.name}
                                  </p>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleStatus(mr)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-xs font-bold ${mr.is_active ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100" : "bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100"}`}
                          >
                            <div className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${mr.is_active ? "bg-green-500" : "bg-gray-300"}`}>
                              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-300 ${mr.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                            </div>
                            {mr.is_active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => { setSelectedMR(mr); setShowModal(true); }}
                              className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-200 transition-all text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setConfirmDelete(mr)}
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

              {mrs.length === 0 && (
                <div className="text-center py-16">
                  <span className="text-5xl">💼</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">No MRs found</h3>
                  <p className="text-gray-500 text-sm">Add a medical representative to get started</p>
                </div>
              )}
            </div>

            {total > 10 && (
              <div className="flex justify-center items-center space-x-4 mt-6">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-orange-400 disabled:opacity-40 transition-all">
                  ← Prev
                </button>
                <span className="text-gray-600 font-medium">Page {page} of {Math.ceil(total / 10)}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 10)}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-orange-400 disabled:opacity-40 transition-all">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <MRModal
          mr={selectedMR}
          onClose={() => setShowModal(false)}
          onSaved={(msg) => { refetch(); setToast({ message: msg, type: "success" }); }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <span className="text-5xl">⚠️</span>
            <h3 className="text-xl font-bold text-gray-900 mt-3 mb-2">Remove MR?</h3>
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

function MRModal({ mr, onClose, onSaved }) {
  const isEdit = !!mr;
  const [form, setForm] = useState({
    name:        mr?.name        || "",
    email:       mr?.email       || "",
    password:    "",
    phone:       mr?.phone       || "",
    territory:   mr?.territory   || "",
  });
  // assigned_doctors from API are objects {id, name} — extract IDs for submission
  const initialDoctorObjs = mr?.assigned_doctors || [];
  const [assignedDoctors, setAssignedDoctors] = useState(initialDoctorObjs.map((d) => d.id || d));
  const [doctorObjects, setDoctorObjects] = useState(initialDoctorObjs.filter((d) => d.id)); // already have name+id

  // Doctor search state
  const [doctorSearch, setDoctorSearch] = useState("");
  const [allDoctors, setAllDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch all doctors once on modal open
  useEffect(() => {
    setLoadingDoctors(true);
    get(`/api/v1/doctors?page_size=500`)
      .then((data) => {
        setAllDoctors(data.doctors || []);
        // doctorObjects already pre-populated from API response above
      })
      .catch(() => {})
      .finally(() => setLoadingDoctors(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter locally by search keyword
  const doctorResults = doctorSearch.trim()
    ? allDoctors.filter((d) =>
        d.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.hospital?.toLowerCase().includes(doctorSearch.toLowerCase())
      )
    : allDoctors;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addDoctor = (doctor) => {
    if (assignedDoctors.includes(doctor.id)) return;
    setAssignedDoctors((prev) => [...prev, doctor.id]);
    setDoctorObjects((prev) => [...prev, doctor]);
    setDoctorSearch("");
    setDropdownOpen(false);
  };

  const removeDoctor = (id) => {
    setAssignedDoctors((prev) => prev.filter((d) => d !== id));
    setDoctorObjects((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isEdit) {
        await put(`/api/v1/mrs/${mr.id}`, {
          name:             form.name,
          phone:            form.phone,
          territory:        form.territory,
          assigned_doctors: assignedDoctors,
        });
      } else {
        await post(`/api/v1/mrs`, {
          name:             form.name,
          email:            form.email,
          password:         form.password || "Welcome@123",
          phone:            form.phone,
          territory:        form.territory,
          assigned_doctors: assignedDoctors,
        });
      }
      onSaved(isEdit ? "MR updated successfully." : "MR added successfully.");
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
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm outline-none"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">💼</span>
            <h2 className="text-xl font-bold text-white">{isEdit ? "Edit MR" : "Add Medical Representative"}</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field("Full Name", "name", "text", "Rajesh Kumar", true)}
            {field("Email", "email", "email", "mr@company.com", !isEdit)}
            {!isEdit && field("Password (default: Welcome@123)", "password", "password", "Leave blank for default")}
            {field("Phone", "phone", "tel", "+91 98765 43210")}
            {field("Territory", "territory", "text", "Mumbai North")}
          </div>

          {/* Assigned Doctors */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Assigned Doctors</label>

            {/* Selected doctors chips */}
            {doctorObjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {doctorObjects.map((d) => (
                  <span key={d.id} className="flex items-center space-x-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    <span>{d.name}</span>
                    <button type="button" onClick={() => removeDoctor(d.id)} className="text-blue-400 hover:text-blue-700 ml-1 font-bold">×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Search input + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                value={doctorSearch}
                onChange={(e) => { setDoctorSearch(e.target.value); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Search and add doctors..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm outline-none"
              />
              {dropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {loadingDoctors ? (
                    <div className="px-4 py-3 text-sm text-gray-400">Loading doctors...</div>
                  ) : doctorResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">No doctors found</div>
                  ) : (
                    doctorResults.map((d) => {
                      const already = assignedDoctors.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => !already && addDoctor(d)}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${already ? "bg-gray-50 text-gray-400 cursor-default" : "hover:bg-orange-50 text-gray-700"}`}
                        >
                          <div>
                            <p className="font-semibold">{d.name}</p>
                            <p className="text-xs text-gray-400">{d.specialization} · {d.hospital}</p>
                          </div>
                          {already && <span className="text-xs text-green-500 font-semibold">Added</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{assignedDoctors.length} doctor{assignedDoctors.length !== 1 ? "s" : ""} assigned</p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 text-sm">
              {saving ? "Saving..." : isEdit ? "Update MR" : "Add MR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
