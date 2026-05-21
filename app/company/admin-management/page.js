"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Toast from "@/components/Toast";
import { get, post, put, del } from "@/lib/api";

// ─── Departments Tab ────────────────────────────────────────────────────────────
function DepartmentsTab() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => get("/api/v1/departments").then((d) => Array.isArray(d) ? d : d.departments || d.data || []),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["departments"] });

  const handleDeactivate = async () => {
    try {
      await del(`/api/v1/departments/${confirmDeactivate.code}`);
      setToast({ message: "Department deactivated.", type: "success" });
      invalidate();
    } catch {
      setToast({ message: "Failed to deactivate department.", type: "error" });
    }
    setConfirmDeactivate(null);
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{departments.length} department(s)</p>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow hover:shadow-md transition-all flex items-center gap-1"
        >
          <span>➕</span><span>Add Department</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : departments.length === 0 ? (
        <div className="text-center py-12"><span className="text-4xl">🏬</span><p className="text-gray-400 mt-3 text-sm">No departments yet</p></div>
      ) : (
        <div className="space-y-2">
          {departments.map((dept) => (
            <div key={dept.code} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {dept.code?.slice(0, 2)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{dept.name}</p>
                <p className="text-xs text-gray-400 truncate">{dept.description || dept.code} · Order: {dept.order ?? "—"}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${dept.is_active !== false ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                {dept.is_active !== false ? "Active" : "Inactive"}
              </span>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(dept); setShowModal(true); }}
                  className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg font-semibold text-xs hover:bg-blue-200 transition-all">Edit</button>
                {dept.is_active !== false && (
                  <button onClick={() => setConfirmDeactivate(dept)}
                    className="bg-red-100 text-red-600 px-2 py-1 rounded-lg font-semibold text-xs hover:bg-red-200 transition-all">Deactivate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <DepartmentModal
          department={editing}
          onClose={() => setShowModal(false)}
          onSaved={(msg) => { invalidate(); setToast({ message: msg, type: "success" }); }}
        />
      )}

      {confirmDeactivate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <span className="text-5xl">⚠️</span>
            <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2">Deactivate Department?</h3>
            <p className="text-gray-600 text-sm mb-6">This will deactivate <span className="font-bold">{confirmDeactivate.name}</span>.</p>
            <div className="flex space-x-3">
              <button onClick={() => setConfirmDeactivate(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleDeactivate} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 transition-all">Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DepartmentModal({ department, onClose, onSaved }) {
  const isEdit = !!department;
  const [form, setForm] = useState({
    code: department?.code || "",
    name: department?.name || "",
    description: department?.description || "",
    order: department?.order ?? "",
    is_active: department?.is_active !== false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isEdit) {
        await put(`/api/v1/departments/${department.code}`, {
          name: form.name,
          description: form.description,
          order: form.order ? Number(form.order) : 0,
          is_active: form.is_active,
        });
      } else {
        await post("/api/v1/departments", {
          code: form.code,
          name: form.name,
          description: form.description,
          order: form.order ? Number(form.order) : 0,
        });
      }
      onSaved(isEdit ? "Department updated." : "Department created.");
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">{isEdit ? "Edit Department" : "Add Department"}</h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Code {!isEdit && <span className="text-red-500">*</span>}</label>
            <input type="text" value={form.code} disabled={isEdit}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="e.g. CARDIO" required={!isEdit} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              placeholder="Cardiology" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
            <input type="text" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              placeholder="Optional description" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-700 mb-1">Order</label>
              <input type="number" value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                placeholder="0" />
            </div>
            {isEdit && (
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                <select value={form.is_active ? "active" : "inactive"}
                  onChange={(e) => setForm({ ...form, is_active: e.target.value === "active" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50">
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Admins Tab ─────────────────────────────────────────────────────────────────
function AdminsTab() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [changeDeptAdmin, setChangeDeptAdmin] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admin-list"],
    queryFn: () => get("/api/v1/admin/list").then((d) => d.admins || d || []),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => get("/api/v1/departments").then((d) => Array.isArray(d) ? d : d.departments || d.data || []),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-list"] });

  const handleDeactivate = async () => {
    try {
      await del(`/api/v1/admin/${confirmAction.id}`);
      setToast({ message: "Admin deactivated.", type: "success" });
      invalidate();
    } catch {
      setToast({ message: "Failed to deactivate admin.", type: "error" });
    }
    setConfirmAction(null);
  };

  const handleReactivate = async (admin) => {
    try {
      await post(`/api/v1/admin/${admin.id}/reactivate`);
      setToast({ message: "Admin reactivated.", type: "success" });
      invalidate();
    } catch {
      setToast({ message: "Failed to reactivate admin.", type: "error" });
    }
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{admins.length} admin(s)</p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow hover:shadow-md transition-all flex items-center gap-1"
        >
          <span>➕</span><span>Add Admin</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : admins.length === 0 ? (
        <div className="text-center py-12"><span className="text-4xl">👤</span><p className="text-gray-400 mt-3 text-sm">No admins yet</p></div>
      ) : (
        <div className="space-y-2">
          {admins.map((admin) => (
            <div key={admin.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {admin.full_name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{admin.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{admin.email} · {admin.department || "No dept"}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${admin.is_active !== false ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                {admin.is_active !== false ? "Active" : "Inactive"}
              </span>
              <div className="flex gap-1">
                <button onClick={() => setChangeDeptAdmin(admin)}
                  className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg font-semibold text-xs hover:bg-indigo-200 transition-all">Dept</button>
                {admin.is_active !== false ? (
                  <button onClick={() => setConfirmAction(admin)}
                    className="bg-red-100 text-red-600 px-2 py-1 rounded-lg font-semibold text-xs hover:bg-red-200 transition-all">Deactivate</button>
                ) : (
                  <button onClick={() => handleReactivate(admin)}
                    className="bg-green-100 text-green-600 px-2 py-1 rounded-lg font-semibold text-xs hover:bg-green-200 transition-all">Reactivate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AdminCreateModal
          departments={departments}
          onClose={() => setShowModal(false)}
          onSaved={(msg) => { invalidate(); setToast({ message: msg, type: "success" }); }}
        />
      )}

      {changeDeptAdmin && (
        <ChangeDeptModal
          admin={changeDeptAdmin}
          departments={departments}
          onClose={() => setChangeDeptAdmin(null)}
          onSaved={(msg) => { invalidate(); setToast({ message: msg, type: "success" }); }}
        />
      )}

      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <span className="text-5xl">⚠️</span>
            <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2">Deactivate Admin?</h3>
            <p className="text-gray-600 text-sm mb-6">This will deactivate <span className="font-bold">{confirmAction.full_name}</span>.</p>
            <div className="flex space-x-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleDeactivate} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 transition-all">Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminCreateModal({ departments, onClose, onSaved }) {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "", department: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await post("/api/v1/admin/create-department-admin", {
        full_name: form.full_name,
        email: form.email,
        password: form.password || "Admin@123",
        phone: form.phone,
        department: form.department,
      });
      onSaved("Admin created successfully.");
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Add Department Admin</h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              placeholder="John Doe" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              placeholder="admin@company.com" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <input type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              placeholder="Default: Admin@123" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
            <select value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white" required>
              <option value="">Select department</option>
              {departments.filter(d => d.is_active !== false).map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50">
              {saving ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChangeDeptModal({ admin, departments, onClose, onSaved }) {
  const [dept, setDept] = useState(admin.department || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await put(`/api/v1/admin/${admin.id}/department`, { department: dept });
      onSaved("Department updated.");
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Change Department</h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>}
          <p className="text-sm text-gray-600">Changing department for <span className="font-bold">{admin.full_name}</span></p>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
            <select value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white" required>
              <option value="">Select department</option>
              {departments.filter(d => d.is_active !== false).map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50">
              {saving ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminManagementPage() {
  const [tab, setTab] = useState("departments");

  const tabs = [
    { key: "departments", label: "Departments", icon: "🏬" },
    { key: "admins", label: "Admins", icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 overflow-x-hidden">
      <CompanyNavbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Admin Management ⚙️</h1>
          <p className="text-gray-600 text-sm">Manage departments and department admins</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === t.key
                  ? "bg-white text-purple-700 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "departments" ? <DepartmentsTab /> : <AdminsTab />}
      </main>
    </div>
  );
}
