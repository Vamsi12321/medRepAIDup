"use client";
import { useState, useEffect, useCallback } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Toast from "@/components/Toast";
import Link from "next/link";
import { get, put, post } from "@/lib/api";
import { CardSkeleton, StatGridSkeleton } from "@/components/Skeleton";

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null); // { message, type }
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // company to delete

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, page_size: 10 });
      if (search) params.append("search", search);
      const data = await get(`/api/v1/companies/?${params}`);
      setCompanies(data.companies);
      setTotal(data.total);
    } catch {
      setError("Failed to load companies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await put(`/api/v1/companies/${confirmDelete.id}`, { is_active: false });
      setConfirmDelete(null);
      setToast({ message: "Company deactivated successfully.", type: "success" });
      fetchCompanies();
    } catch {
      setConfirmDelete(null);
      setToast({ message: "Failed to deactivate company.", type: "error" });
    }
  };

  const handleToggleStatus = async (company) => {
    setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_active: !c.is_active } : c));
    try {
      await put(`/api/v1/companies/${company.id}`, { is_active: !company.is_active });
      setToast({ message: `Company marked as ${!company.is_active ? "active" : "inactive"}.`, type: "success" });
    } catch {
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_active: company.is_active } : c));
      setToast({ message: "Failed to update company status.", type: "error" });
    }
  };

  const activeCount = companies.filter((c) => c.is_active).length;
  const inactiveCount = companies.filter((c) => !c.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-x-hidden">
      <AdminNavbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Company Management 🏢</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage pharmaceutical companies</p>
          </div>
          <button
            onClick={() => { setSelectedCompany(null); setShowModal(true); }}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>➕</span><span>Add Company</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[
            { label: "Total Companies", value: total, icon: "🏢", color: "from-blue-500 to-indigo-600", text: "from-blue-600 to-indigo-600" },
            { label: "Active Companies", value: activeCount, icon: "✅", color: "from-green-500 to-emerald-600", text: "from-green-600 to-emerald-600" },
            { label: "Inactive Companies", value: inactiveCount, icon: "⏳", color: "from-orange-500 to-red-600", text: "from-orange-600 to-red-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-lg`}>{s.icon}</div>
              <p className={`text-4xl font-bold bg-gradient-to-r ${s.text} bg-clip-text text-transparent`}>{s.value}</p>
              <p className="text-gray-600 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-100 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search companies by name, description or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm font-medium transition-all"
            />
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>
        )}

        {/* Companies Grid */}
        {loading ? (
          <>
            <StatGridSkeleton count={3} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {companies.map((company) => (
                <div key={company.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{company.name}</h3>
                      <p className="text-gray-500 text-sm">{company.contact_email}</p>
                      {company.description && <p className="text-gray-600 text-sm mt-1">{company.description}</p>}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    {company.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">📞 Phone</span>
                        <span className="font-semibold text-gray-800">{company.phone}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">🌐 Website</span>
                        <a
                          href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                    {company.address && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">📍 Address</span>
                        <span className="font-semibold text-gray-800 text-right max-w-[60%]">{company.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => { setSelectedCompany(company); setShowModal(true); }}
                      className="flex-1 bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-all text-sm"
                    >
                      Edit
                    </button>
                    <Link href={`/admin/drug-forms?company=${company.id}`} className="flex-1">
                      <button className="w-full bg-purple-100 text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-200 transition-all text-sm">
                        Drug Forms
                      </button>
                    </Link>
                    {/* Active/Inactive toggle switch */}
                    <button
                      onClick={() => handleToggleStatus(company)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-xs font-bold ${company.is_active ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100" : "bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100"}`}
                    >
                      <div className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${company.is_active ? "bg-green-500" : "bg-gray-300"}`}>
                        <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-300 ${company.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                      </div>
                      {company.is_active ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {companies.length === 0 && !loading && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
                <span className="text-5xl">🏢</span>
                <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">No companies found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your search or add a new company</p>
              </div>
            )}

            {/* Pagination */}
            {total > 10 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                <span className="text-gray-600 font-medium">Page {page} of {Math.ceil(total / 10)}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <CompanyModal
          company={selectedCompany}
          onClose={() => setShowModal(false)}
          onSaved={(msg) => { fetchCompanies(); setToast({ message: msg, type: "success" }); }}
        />
      )}

      {/* Confirm Delete Popup */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center mb-4">
              <span className="text-5xl">⚠️</span>
              <h3 className="text-xl font-bold text-gray-900 mt-3 mb-2">Deactivate Company?</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to deactivate <span className="font-bold text-gray-900">{confirmDelete.name}</span>? This will set the company as inactive.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyModal({ company, onClose, onSaved }) {
  const isEdit = !!company;
  const [form, setForm] = useState({
    name: company?.name || "",
    contact_email: company?.contact_email || "",
    description: company?.description || "",
    address: company?.address || "",
    phone: company?.phone || "",
    website: company?.website || "",
    logo_url: company?.logo_url || "",
    license_number: company?.license_number || "",
    is_active: company?.is_active ?? true,
    // create-only fields
    admin_name: "",
    admin_email: "",
    admin_password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = isEdit
        ? { name: form.name, contact_email: form.contact_email, description: form.description,
            address: form.address, phone: form.phone, website: form.website,
            logo_url: form.logo_url, license_number: form.license_number, is_active: form.is_active,
            ...(form.admin_name && { admin_name: form.admin_name }),
            ...(form.admin_email && { admin_email: form.admin_email }),
            ...(form.admin_password && { admin_password: form.admin_password }) }
        : { name: form.name, contact_email: form.contact_email, description: form.description,
            address: form.address, phone: form.phone, website: form.website,
            logo_url: form.logo_url, license_number: form.license_number,
            admin_name: form.admin_name, admin_email: form.admin_email,
            ...(form.admin_password && { admin_password: form.admin_password }) };

      if (isEdit) {
        await put(`/api/v1/companies/${company.id}`, body);
      } else {
        await post(`/api/v1/companies/`, body);
      }
      onSaved(isEdit ? "Company updated successfully." : "Company created successfully.");
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">🏢</span>
            <h2 className="text-2xl font-bold text-white">{isEdit ? "Edit Company" : "Add New Company"}</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field("Company Name *", "name", "text", "e.g., PharmaTech Solutions")}
            {field("Contact Email *", "contact_email", "email", "contact@company.com")}
            {field("Phone", "phone", "tel", "+1-555-0123")}
            {field("Website", "website", "text", "www.company.com")}
            {field("Logo URL", "logo_url", "text", "https://...")}
            {field("License Number", "license_number", "text", "LIC-12345")}
          </div>

          {/* Admin user fields */}
          <div className="border-t pt-4">
            <p className="text-sm font-bold text-gray-700 mb-3">{isEdit ? "Update Admin Account" : "Company Admin Account"}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field("Admin Name" + (!isEdit ? " *" : ""), "admin_name", "text", "John Doe")}
              {field("Admin Email" + (!isEdit ? " *" : ""), "admin_email", "email", "admin@company.com")}
              {field(isEdit ? "New Admin Password (leave blank to keep)" : "Admin Password (default: Company@123)", "admin_password", "password", "Leave blank for default")}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Brief company description..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
              placeholder="Company address..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {isEdit && (
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-sm font-bold text-gray-700">Active</span>
            </label>
          )}

          <div className="flex space-x-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update Company" : "Add Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
