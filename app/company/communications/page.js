"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { formatISTDateTime } from "@/lib/time";
import { get, post, del, put } from "@/lib/api";
import { sessionExpired } from "@/lib/auth";

export default function AdminCommunications() {
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState("");

  const queryClient = useQueryClient();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [editComm, setEditComm] = useState(null);
  const [viewCommId, setViewCommId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-communications", filterType],
    queryFn: () => {
      const params = new URLSearchParams({ limit: "50" });
      if (filterType) params.append("type", filterType);
      return get("/api/v1/communications/admin?" + params);
    },
    staleTime: 7 * 60 * 1000,
  });

  const communications = data?.communications || [];

  // Fetch MR list to resolve IDs to names in targeting
  const { data: mrsListData } = useQuery({
    queryKey: ["company-mrs"],
    queryFn: () => get("/api/v1/mrs").then((r) => r.mrs || []),
    staleTime: 10 * 60 * 1000,
  });
  const mrNameMap = (mrsListData || []).reduce((acc, m) => { acc[m.id || m._id] = m.name; return acc; }, {});

  const resolveTargeting = (targeting) => {
    if (!targeting) return "All MRs";
    const parts = [];
    if (targeting.zones?.length) parts.push(...targeting.zones);
    if (targeting.states?.length) parts.push(...targeting.states);
    if (targeting.territories?.length) parts.push(...targeting.territories);
    if (targeting.specific_mrs?.length) {
      parts.push(...targeting.specific_mrs.map((id) => mrNameMap[id] || id));
    }
    return parts.length > 0 ? parts.join(", ") : "All MRs";
  };

  const createMutation = useMutation({
    mutationFn: (formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      return fetch("/api/v1/communications", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }).then(async (res) => {
        if (res.status === 401) { sessionExpired(); throw new Error("Session expired"); }
        const data = await res.json();
        if (!res.ok) throw Object.assign(new Error(data.detail || "Failed"), { data });
        return data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-communications"] });
      setShowCreate(false);
    },
  });

  const handleDeactivate = async (id) => {
    if (!confirm("Deactivate this communication? MRs will no longer see it.")) return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`/api/v1/communications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { sessionExpired(); return; }
      queryClient.invalidateQueries({ queryKey: ["admin-communications"] });
    } catch (err) {
      alert("Failed to deactivate");
    }
  };

  const handleAnalytics = async (id) => {
    try {
      const data = await get(`/api/v1/communications/${id}/analytics`);
      setAnalyticsData(data);
    } catch (err) {
      alert("Failed to load analytics");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <CompanyNavbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        <Breadcrumb />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow">
              <span className="text-xl">📢</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Communication Center</h1>
              <p className="text-gray-500 text-xs">Create & send targeted announcements to MRs</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow hover:shadow-md transition-all flex items-center gap-1.5">
            ➕ New Communication
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 mb-4">
          {[
            { v: "", l: "All" },
            { v: "announcement", l: "📢 Announcements" },
            { v: "alert", l: "🚨 Alerts" },
            { v: "target", l: "🎯 Targets" },
            { v: "training", l: "📚 Training" },
          ].map((f) => (
            <button key={f.v} onClick={() => setFilterType(f.v)}
              className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-all " + (
                filterType === f.v ? "bg-purple-600 text-white shadow" : "bg-white text-gray-500 border border-gray-200 hover:border-purple-300"
              )}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Communications list */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />)}</div>
          ) : communications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <span className="text-4xl">📢</span>
              <p className="text-gray-400 mt-3 text-sm">No communications yet. Create one to get started.</p>
            </div>
          ) : communications.map((c) => (
            <div key={c.id || c._id} onClick={() => setViewCommId(c.id || c._id)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={"px-2 py-0.5 rounded-md text-xs font-semibold " + (
                      c.type === "alert" ? "bg-red-100 text-red-700" :
                      c.type === "training" ? "bg-purple-100 text-purple-700" :
                      c.type === "target" ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    )}>{c.type}</span>
                    <span className={"px-2 py-0.5 rounded-md text-xs font-semibold " + (
                      c.priority === "urgent" ? "bg-red-100 text-red-700" :
                      c.priority === "high" ? "bg-orange-100 text-orange-700" :
                      "bg-gray-100 text-gray-600"
                    )}>{c.priority}</span>
                    {!c.is_active && <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-200 text-gray-500">Inactive</span>}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{c.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span>By: {c.created_by_name || c.created_by || "Admin"}</span>
                    {c.targeting && <span>Sent to: {resolveTargeting(c.targeting)}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">{c.read_count ?? "—"}/{c.total_recipients ?? "—"}</p>
                    <p className="text-xs text-gray-400">read</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditComm(c); }}
                      className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-all">
                      ✏️ Edit
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleAnalytics(c.id || c._id); }}
                      className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-200 transition-all">
                      📊
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeactivate(c.id || c._id); }}
                      disabled={c.is_active === false}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 transition-all disabled:opacity-40">
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showCreate && (
        <CreateCommModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { queryClient.invalidateQueries({ queryKey: ["admin-communications"] }); setShowCreate(false); }}
          createMutation={createMutation}
        />
      )}

      {/* Detail Drawer */}
      {viewCommId && (
        <AdminCommDetailDrawer commId={viewCommId} onClose={() => setViewCommId(null)} />
      )}

      {/* Edit Modal */}
      {editComm && (
        <EditCommModal
          comm={editComm}
          onClose={() => setEditComm(null)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ["admin-communications"] }); setEditComm(null); }}
        />
      )}

      {/* Analytics Modal */}
      {analyticsData && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setAnalyticsData(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-white font-bold text-sm">📊 Read Analytics</h2>
              <button onClick={() => setAnalyticsData(null)} className="text-white/70 hover:text-white text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">{analyticsData.title}</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-blue-600">{analyticsData.total_targeted}</p>
                  <p className="text-xs text-gray-500">Targeted</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-green-600">{analyticsData.total_read}</p>
                  <p className="text-xs text-gray-500">Read</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-purple-600">{analyticsData.read_percentage}%</p>
                  <p className="text-xs text-gray-500">Rate</p>
                </div>
              </div>

              {analyticsData.read_by?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-green-600 mb-2">✅ Read ({analyticsData.read_by.length})</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {analyticsData.read_by.map((r) => (
                      <div key={r.mr_id} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-1.5 text-xs">
                        <span className="font-semibold text-gray-800">{r.mr_name}</span>
                        <span className="text-gray-400">{r.territory}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analyticsData.not_read_by?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-red-600 mb-2">❌ Not Read ({analyticsData.not_read_by.length})</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {analyticsData.not_read_by.map((r) => (
                      <div key={r.mr_id} className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-1.5 text-xs">
                        <span className="font-semibold text-gray-800">{r.mr_name}</span>
                        <span className="text-gray-400">{r.territory}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setAnalyticsData(null)}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateCommModal({ onClose, onCreated, createMutation }) {
  const fileRef = React.useRef(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "announcement",
    priority: "medium",
    zone: "",
    state: "",
    territory: "",
    specific_mrs: "",
    expires_at: "",
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const addFiles = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (files.length + newFiles.length > 5) { setError("Maximum 5 files allowed"); return; }
    const oversized = newFiles.find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) { setError(oversized.name + " is too large. Max 10MB per file."); return; }
    setFiles((prev) => [...prev, ...newFiles]);
    setError("");
    e.target.value = "";
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.content.trim()) { setError("Content is required"); return; }
    setError("");

    const targeting = JSON.stringify({
      zones: form.zone ? [form.zone] : [],
      states: form.state ? [form.state] : [],
      territories: form.territory ? [form.territory] : [],
      specific_mrs: form.specific_mrs ? form.specific_mrs.split(",").map((s) => s.trim()).filter(Boolean) : [],
    });

    // Build FormData — multipart/form-data with files
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("content", form.content);
    fd.append("type", form.type);
    fd.append("priority", form.priority);
    fd.append("targeting", targeting);
    if (form.expires_at) fd.append("expires_at", form.expires_at);
    files.forEach((file) => fd.append("files", file));

    createMutation.mutate(fd, {
      onSuccess: onCreated,
      onError: (err) => setError(err.message || "Failed to send"),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">New Communication</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title *" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-200" />

          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Message content *" rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-purple-200" />

          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-purple-200">
              <option value="announcement">Announcement</option>
              <option value="alert">Alert</option>
              <option value="target">Target</option>
              <option value="training">Training</option>
            </select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-purple-200">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 mb-1.5">Targeting (leave empty = all MRs)</p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none bg-white focus:ring-2 focus:ring-purple-200">
                <option value="">Zone (All)</option>
                <option value="South">South</option>
              </select>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none bg-white focus:ring-2 focus:ring-purple-200">
                <option value="">State (All)</option>
                <option value="Telangana">Telangana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
              </select>
              <select value={form.territory} onChange={(e) => setForm({ ...form, territory: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none bg-white focus:ring-2 focus:ring-purple-200">
                <option value="">Territory (All)</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
              </select>
            </div>
            {/* Specific MR selection */}
            <MRSelector
              zone={form.zone} state={form.state} territory={form.territory}
              selected={form.specific_mrs ? form.specific_mrs.split(",").map((s) => s.trim()).filter(Boolean) : []}
              onChange={(ids) => setForm({ ...form, specific_mrs: ids.join(",") })}
            />
          </div>

          {/* Expiry */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Expires At (optional)</label>
            <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-200" />
          </div>

          {/* File Attachments */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-1.5">Attachments (max 5 files, 10MB each)</p>
            <input ref={fileRef} type="file" className="hidden" onChange={addFiles} multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg,.zip,.rar" />
            {files.length > 0 && (
              <div className="space-y-1 mb-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2 text-xs">
                    <span>📎</span>
                    <span className="flex-1 truncate text-indigo-700 font-medium">{file.name}</span>
                    <span className="text-gray-400">{(file.size / 1024).toFixed(0)}KB</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 font-bold">×</button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()}
              disabled={files.length >= 5}
              className="w-full border-2 border-dashed border-gray-200 rounded-lg py-2 text-xs text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-all disabled:opacity-40">
              📎 Add Files ({files.length}/5)
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl font-semibold text-xs hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-xl font-bold text-xs disabled:opacity-50 transition-all">
              {createMutation.isPending ? "Sending..." : "Send Communication"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditCommModal({ comm, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: comm.title || "",
    content: comm.content || "",
    type: comm.type || "announcement",
    priority: comm.priority || "medium",
    zone: comm.targeting?.zones?.[0] || "",
    state: comm.targeting?.states?.[0] || "",
    territory: comm.targeting?.territories?.[0] || "",
    specific_mrs: comm.targeting?.specific_mrs?.join(", ") || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch full details if content not available
  const { data: fullComm } = useQuery({
    queryKey: ["comm-detail", comm.id || comm._id],
    queryFn: () => get("/api/v1/communications/" + (comm.id || comm._id) + "/admin"),
    staleTime: 7 * 60 * 1000,
  });

  // Update form when full data loads
  if (fullComm && !form.content && fullComm.content) {
    setForm((f) => ({ ...f, content: fullComm.content }));
  }

  const attachments = fullComm?.attachments || comm.attachments || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    try {
      const body = {
        title: form.title,
        priority: form.priority,
        type: form.type,
      };
      if (form.content) body.content = form.content;
      body.targeting = {
        zones: form.zone ? [form.zone] : [],
        states: form.state ? [form.state] : [],
        territories: form.territory ? [form.territory] : [],
        specific_mrs: form.specific_mrs ? form.specific_mrs.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      await put("/api/v1/communications/" + (comm.id || comm._id), body);
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to update");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Edit Communication</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title *" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-200" />

          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Message content" rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-purple-200" />

          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none">
              <option value="announcement">Announcement</option>
              <option value="alert">Alert</option>
              <option value="target">Target</option>
              <option value="training">Training</option>
            </select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 mb-1.5">Targeting</p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none bg-white">
                <option value="">Zone (All)</option>
                <option value="South">South</option>
              </select>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none bg-white">
                <option value="">State (All)</option>
                <option value="Telangana">Telangana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
              </select>
              <select value={form.territory} onChange={(e) => setForm({ ...form, territory: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none bg-white">
                <option value="">Territory (All)</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
              </select>
            </div>
            <MRSelector
              zone={form.zone} state={form.state} territory={form.territory}
              selected={form.specific_mrs ? form.specific_mrs.split(",").map((s) => s.trim()).filter(Boolean) : []}
              onChange={(ids) => setForm({ ...form, specific_mrs: ids.join(",") })}
            />
          </div>

          {/* Existing attachments */}
          {attachments.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1.5">Attachments</p>
              <div className="space-y-1">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-xs">
                    <span>📎</span>
                    <span className="flex-1 truncate text-gray-700 font-medium">{att.file_name}</span>
                    {att.file_url && (
                      <a href={att.file_url} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline flex-shrink-0">View</a>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Attachment management via API only</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl font-semibold text-xs hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-xl font-bold text-xs disabled:opacity-50">
              {saving ? "Updating..." : "Update Communication"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminCommDetailDrawer({ commId, onClose }) {
  const { data: comm, isLoading } = useQuery({
    queryKey: ["comm-admin-detail", commId],
    queryFn: () => get("/api/v1/communications/" + commId + "/admin"),
    staleTime: 7 * 60 * 1000,
  });

  // Fetch MR list to resolve IDs to names
  const { data: mrsData } = useQuery({
    queryKey: ["company-mrs"],
    queryFn: () => get("/api/v1/mrs").then((r) => r.mrs || []),
    staleTime: 10 * 60 * 1000,
  });
  const mrNames = (mrsData || []).reduce((acc, m) => { acc[m.id || m._id] = m.name; return acc; }, {});

  const TYPE_STYLES = {
    announcement: { icon: "📢", bg: "bg-blue-100", text: "text-blue-700" },
    alert:        { icon: "🚨", bg: "bg-red-100",  text: "text-red-700" },
    target:       { icon: "🎯", bg: "bg-orange-100", text: "text-orange-700" },
    training:     { icon: "📚", bg: "bg-purple-100", text: "text-purple-700" },
  };

  const t = TYPE_STYLES[comm?.type] || TYPE_STYLES.announcement;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[440px] bg-white z-50 flex flex-col shadow-2xl"
        style={{ animation: "slideInRight 0.25s ease-out" }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-pink-700 px-5 py-5 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className={"px-2 py-0.5 rounded-md text-xs font-semibold bg-white/20 text-white"}>
              {comm?.type || "..."}
            </span>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
          </div>
          {isLoading ? (
            <div className="h-5 bg-white/20 rounded w-3/4 animate-pulse" />
          ) : (
            <h2 className="text-white font-bold text-base leading-tight">{comm?.title}</h2>
          )}
          {comm && (
            <div className="flex items-center gap-2 mt-2">
              <span className={"px-2 py-0.5 rounded-md text-xs font-semibold bg-white/20 text-white capitalize"}>
                {comm.priority}
              </span>
              <span className="text-purple-200 text-xs">
                {comm.created_at ? formatISTDateTime(comm.created_at) : ""}
              </span>
              {comm.is_active === false && <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-red-500/30 text-white">Inactive</span>}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          ) : comm ? (
            <>
              {/* Sender */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(comm.created_by_name || "A").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{comm.created_by_name || "Admin"}</p>
                  <p className="text-xs text-gray-400">Created {comm.created_at ? new Date(comm.created_at).toLocaleDateString() : ""}</p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {comm.content}
              </div>

              {/* Targeting */}
              {comm.targeting && (
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-600 mb-2">🎯 Targeting</p>
                  <div className="flex flex-wrap gap-1.5">
                    {comm.targeting.zones?.map((z) => <span key={z} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-semibold">Zone: {z}</span>)}
                    {comm.targeting.states?.map((s) => <span key={s} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-semibold">State: {s}</span>)}
                    {comm.targeting.territories?.map((t) => <span key={t} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md text-xs font-semibold">Territory: {t}</span>)}
                    {comm.targeting.specific_mrs?.map((m) => {
                      const mrName = mrNames[m] || m;
                      return <span key={m} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-xs font-semibold">MR: {mrName}</span>;
                    })}
                    {Object.values(comm.targeting).every((arr) => !arr || arr.length === 0) && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-semibold">All MRs</span>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {comm.attachments?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">📎 Attachments</p>
                  <div className="space-y-1.5">
                    {comm.attachments.map((att, i) => (
                      <a key={i} href={att.file_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-700 font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                        <span>📄</span>
                        <span className="flex-1 truncate">{att.file_name}</span>
                        <span className="text-gray-400">{att.file_type}</span>
                        <span className="text-indigo-600 font-semibold flex-shrink-0">↓</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta info */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs text-gray-500">
                {comm.expires_at && <p>⏰ Expires: {new Date(comm.expires_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>}
                {comm.updated_at && <p>✏️ Last updated: {new Date(comm.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>}
                <p>Status: {comm.is_active ? "✅ Active" : "❌ Inactive"}</p>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Communication not found.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all">
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

function MRSelector({ zone, state, territory, selected, onChange }) {
  const [showList, setShowList] = useState(false);

  // Fetch MRs based on current targeting filters
  const { data, isLoading } = useQuery({
    queryKey: ["mrs-filter", zone, state, territory],
    queryFn: () => {
      const params = new URLSearchParams();
      if (zone) params.append("zone", zone);
      if (state) params.append("state", state);
      if (territory) params.append("territory", territory);
      return get("/api/v1/mrs/filter?" + params);
    },
    staleTime: 7 * 60 * 1000,
    enabled: showList,
  });

  const mrs = data?.mrs || [];

  const toggleMR = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => onChange(mrs.map((m) => m.id));
  const deselectAll = () => onChange([]);

  return (
    <div>
      <button type="button" onClick={() => setShowList(!showList)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-purple-300 transition-all">
        <span>{selected.length > 0 ? `${selected.length} MR${selected.length > 1 ? "s" : ""} selected` : "Select specific MRs (optional)"}</span>
        <span className="text-gray-400">{showList ? "▲" : "▼"}</span>
      </button>

      {showList && (
        <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
          {/* Header with select all */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500 font-medium">
              {isLoading ? "Loading..." : `${mrs.length} MRs found`}
            </p>
            {mrs.length > 0 && (
              <div className="flex gap-2">
                <button type="button" onClick={selectAll} className="text-xs text-indigo-600 font-semibold hover:underline">Select All</button>
                <button type="button" onClick={deselectAll} className="text-xs text-gray-400 font-semibold hover:underline">Clear</button>
              </div>
            )}
          </div>

          {/* MR list with checkboxes */}
          <div className="max-h-40 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 space-y-2">
                {[1,2,3].map((i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : mrs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No MRs match the current filters.</p>
            ) : (
              mrs.map((mr) => {
                const isSelected = selected.includes(mr.id);
                return (
                  <label key={mr.id}
                    className={"flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors " + (isSelected ? "bg-indigo-50" : "")}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleMR(mr.id)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{mr.name}</p>
                      <p className="text-xs text-gray-400">{mr.territory} · {mr.state}</p>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {/* Selected count footer */}
          {selected.length > 0 && (
            <div className="px-3 py-2 bg-indigo-50 border-t border-indigo-100">
              <p className="text-xs text-indigo-700 font-semibold">
                Targeting: {selected.length} specific MR{selected.length > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
