"use client";
import React, { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Toast from "@/components/Toast";
import { get, put, post, del } from "@/lib/api";
import { formatISTDate, formatISTDateTime } from "@/lib/time";
import { TableSkeleton } from "@/components/Skeleton";
import { downloadCSVTemplate } from "@/lib/downloadTemplate";
import Link from "next/link";

// ── Zone → States → Territories Data ─────────────────────────────────────────
const ZONE_STATES = {
  North: ["Delhi", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Punjab", "Rajasthan", "Uttar Pradesh", "Uttarakhand", "Chandigarh", "Ladakh"],
  South: ["Andhra Pradesh", "Karnataka", "Kerala", "Tamil Nadu", "Telangana", "Puducherry", "Lakshadweep"],
  East: ["Bihar", "Jharkhand", "Odisha", "West Bengal", "Assam", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura", "Arunachal Pradesh"],
  West: ["Gujarat", "Goa", "Maharashtra", "Dadra & Nagar Haveli", "Daman & Diu"],
  Central: ["Madhya Pradesh", "Chhattisgarh"],
};

const STATE_TERRITORIES = {
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad", "Medak", "Rangareddy"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kakinada", "Anantapur", "Eluru"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli-Dharwad", "Mangalore", "Belgaum", "Gulbarga", "Davangere", "Bellary", "Shimoga", "Tumkur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Dindigul"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Kannur", "Alappuzha", "Malappuram", "Kottayam"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Nanded"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Mehsana"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Bhilwara", "Alwar", "Sikar", "Pali"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad", "Ghaziabad"],
  "Delhi": ["North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "New Delhi"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Kharagpur", "Haldia", "Baharampur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Arrah", "Begusarai", "Katihar", "Munger"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Batala"],
  "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak", "Sonipat", "Yamunanagar", "Panchkula"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Ramgarh", "Dumka", "Phusro"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Raigarh", "Jagdalpur", "Ambikapur", "Dhamtari"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Nagaon", "Tinsukia", "Jorhat", "Tezpur", "Bongaigaon", "Karimganj", "Dhubri"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamsala", "Solan", "Mandi", "Kullu", "Hamirpur", "Una", "Bilaspur", "Palampur"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Haldwani", "Roorkee", "Rudrapur", "Kashipur", "Almora", "Mussoorie"],
};

function getStatesForZone(zone) {
  if (!zone) return Object.values(ZONE_STATES).flat().sort();
  return ZONE_STATES[zone] || [];
}

function getTerritoriesForState(state) {
  if (!state) return [];
  return STATE_TERRITORIES[state] || [state]; // fallback: use state name itself
}

// ── Searchable Dropdown ───────────────────────────────────────────────────────
function SearchableDropdown({ value, onChange, placeholder, options }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = search.trim()
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-left bg-white flex items-center justify-between focus:ring-2 focus:ring-orange-400 outline-none">
        <span className={value ? "text-gray-800" : "text-gray-400"}>{value || placeholder}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 flex-shrink-0">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type to search..." autoFocus
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-200" />
          </div>
          <div className="overflow-y-auto flex-1">
            {value && (
              <button type="button" onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:bg-gray-50 border-b border-gray-50">✕ Clear</button>
            )}
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-400 text-center">No matches</p>
            ) : filtered.map((o) => (
              <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); setSearch(""); }}
                className={`w-full text-left px-4 py-2 text-xs hover:bg-orange-50 transition-colors ${value === o ? "bg-orange-50 text-orange-700 font-semibold" : "text-gray-700"}`}>
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const formatLoc = (loc) => loc && typeof loc === "object" ? loc.location_name || loc.temporary_location?.name || "" : loc || "";

const MR_HEADERS = ["name","email","phone","territory"];
const MR_SAMPLE  = [["Rajesh Kumar","rajesh@company.com","+919876543210","Mumbai North"]];

function MRBulkUploadModal({ onClose, onSuccess }) {
  const fileRef = React.useRef(null);
  const [file, setFile]           = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [result, setResult]       = React.useState(null);
  const [error, setError]         = React.useState("");

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch((process.env.NEXT_PUBLIC_BASE_PATH || '') + "/api/v1/mrs/bulk-upload", {
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
          <h2 className="text-lg font-bold text-gray-800">📤 Bulk Upload MRs</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

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

            <button onClick={onClose} className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">Done</button>
          </div>
        ) : (
          <>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
              <p className="text-sm font-bold text-orange-800 mb-1">📥 How to add multiple MRs at once</p>
              <ol className="text-xs text-orange-700 space-y-1 list-decimal list-inside">
                <li>Download the template below</li>
                <li>Fill in MR details — one row per MR</li>
                <li>Upload the completed file here</li>
                <li>All MRs will be created with login access</li>
              </ol>
              <p className="text-xs text-orange-500 mt-2">Default password <span className="font-mono font-bold">Welcome@123</span> will be assigned to all MRs.</p>
            </div>

            <button onClick={() => downloadCSVTemplate(MR_HEADERS, MR_SAMPLE, "mrs_template.csv")}
              className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all mb-3 flex items-center justify-center gap-2 shadow">
              📥 Download MR Template
            </button>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs mb-3">{error}</div>}

            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />

            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 cursor-pointer transition-colors mb-4">
              {file ? (
                <div>
                  <p className="text-orange-600 font-bold text-sm">📄 {file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB — ready to upload</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500"><span className="text-orange-600 font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">CSV or XLSX (max 5MB, max 100 rows)</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-sm">Cancel</button>
              <button onClick={handleUpload} disabled={!file || uploading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload & Import"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CompanyMedicalReps() {
  const queryClient = useQueryClient();
  const [search, setSearch]             = useState("");
  const [toast, setToast]               = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [selectedMR, setSelectedMR]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filterTerritory, setFilterTerritory] = useState("");
  const [filterStatus, setFilterStatus]       = useState("all");

  const { data, isLoading, error: mrsError, refetch: refetchMrs } = useQuery({
    queryKey: ["mrs"],
    queryFn: () => get("/api/v1/mrs?page_size=1000").then((d) => {
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.mrs)) return d.mrs;
      return [];
    }),
    gcTime: 30 * 60 * 1000,
    staleTime: 7 * 60 * 1000,
    placeholderData: (prev) => prev,
    retry: 2,
  });

  const mrs     = Array.isArray(data) ? data : [];
  const total   = mrs.length;
  const loading = isLoading && !data;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["mrs"] });

  const handleDelete = async () => {
    try {
      await del(`/api/v1/mrs/${confirmDelete.id}`);
      setConfirmDelete(null);
      setToast({ message: "MR removed successfully.", type: "success" });
      invalidate();
    } catch {
      setConfirmDelete(null);
      setToast({ message: "Failed to remove MR.", type: "error" });
    }
  };

  const handleToggleStatus = async (mr) => {
    try {
      await put(`/api/v1/mrs/${mr.id}`, { is_active: !mr.is_active });
      setToast({ message: `MR marked as ${!mr.is_active ? "active" : "inactive"}.`, type: "success" });
      invalidate();
    } catch {
      setToast({ message: "Failed to update status.", type: "error" });
    }
  };

  const activeCount = mrs.filter((m) => m.is_active).length;

  const filteredMRs = mrs.filter((m) => {
    if (filterStatus === "active"   && !m.is_active) return false;
    if (filterStatus === "inactive" &&  m.is_active) return false;
    if (filterTerritory && !m.territory?.toLowerCase().includes(filterTerritory.toLowerCase())) return false;
    if (search && !m.name?.toLowerCase().includes(search.toLowerCase()) &&
                  !m.email?.toLowerCase().includes(search.toLowerCase())) return false;
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
            <h1 className="text-2xl font-extrabold text-gray-900">Medical Representatives</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage your field force · {total} total</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowBulkModal(true)}
              className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold hover:border-purple-300 hover:text-purple-600 transition-all flex items-center gap-1.5 text-xs">
              <span>📤</span><span>Bulk Upload</span>
            </button>
            <button onClick={() => { setSelectedMR(null); setShowModal(true); }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 text-xs">
              <span>➕</span><span>Add MR</span>
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
          <input type="text" placeholder="Search by name or email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none" />
          <input type="text" placeholder="Filter by territory..."
            value={filterTerritory} onChange={(e) => setFilterTerritory(e.target.value)}
            className="flex-1 min-w-[160px] px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:ring-2 focus:ring-purple-200 outline-none">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(filterTerritory || filterStatus !== "all") && (
            <button onClick={() => { setFilterTerritory(""); setFilterStatus("all"); }}
              className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-200">Clear</button>
          )}
        </div>

        {/* MR List */}
        {loading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : mrsError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-600 font-bold text-sm mb-2">Failed to load MRs</p>
            <p className="text-red-400 text-xs mb-4">{mrsError.message}</p>
            <button onClick={() => refetchMrs()} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600">Retry</button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {filteredMRs.map((mr) => (
                <div key={mr.id} className="bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0 border border-purple-100">
                        {mr.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 truncate">{mr.name}</p>
                        <p className="text-xs text-gray-500 truncate">{mr.email}</p>
                        {mr.phone && <p className="text-xs text-gray-400">{mr.phone}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Link href={`/company/medical-reps/${mr.id}/visits`}
                        className="bg-purple-100 text-purple-600 px-2.5 py-1 rounded-lg font-semibold hover:bg-purple-200 transition-all text-xs flex items-center justify-center">
                        Visits
                      </Link>
                      <button onClick={() => handleToggleStatus(mr)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${mr.is_active ? "bg-green-500" : "bg-gray-300"}`}
                        title={mr.is_active ? "Active — click to deactivate" : "Inactive — click to activate"}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${mr.is_active ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                      <button onClick={() => { setSelectedMR(mr); setShowModal(true); }}
                        className="bg-blue-100 text-blue-600 px-2.5 py-1 rounded-lg font-semibold hover:bg-blue-200 transition-all text-xs">
                        Edit
                      </button>
                      <button onClick={() => setConfirmDelete(mr)}
                        className="bg-red-100 text-red-600 px-2.5 py-1 rounded-lg font-semibold hover:bg-red-200 transition-all text-xs">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    {mr.zone && (
                      <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        🌐 {mr.zone}
                      </span>
                    )}
                    {mr.state && (
                      <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        📍 {mr.state}
                      </span>
                    )}
                    {mr.territory && (
                      <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        📍 {mr.territory}
                      </span>
                    )}
                    <div className="relative group">
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-default">
                        👨‍⚕️ {mr.assigned_doctors?.length || 0} doctor{mr.assigned_doctors?.length !== 1 ? "s" : ""}
                      </span>
                      {mr.assigned_doctors?.length > 0 && (
                        <div className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-max">
                          {mr.assigned_doctors.map((d) => (
                            <p key={d.id} className="text-xs text-gray-700 font-medium px-2 py-1 hover:bg-gray-50 rounded">👨‍⚕️ {d.name}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative group">
                      <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-default">
                        💊 {mr.assigned_drugs?.length || 0} drug{mr.assigned_drugs?.length !== 1 ? "s" : ""}
                      </span>
                      {mr.assigned_drugs?.length > 0 && (
                        <div className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-max">
                          {mr.assigned_drugs.map((d) => (
                            <p key={d.id} className="text-xs text-gray-700 font-medium px-2 py-1 hover:bg-gray-50 rounded">💊 {d.name}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className={`ml-auto px-2.5 py-1 rounded-lg text-xs font-bold ${mr.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {mr.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredMRs.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
                <span className="text-5xl">💼</span>
                <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">No MRs found</h3>
                <p className="text-gray-500 text-sm">{mrs.length > 0 ? "Try adjusting your filters" : "Add a medical representative to get started"}</p>
              </div>
            )}

          </>
        )}
      </main>

      {showBulkModal && <MRBulkUploadModal onClose={() => setShowBulkModal(false)} onSuccess={invalidate} />}

      {showModal && (
        <MRModal
          mr={selectedMR}
          onClose={() => setShowModal(false)}
          onSaved={(msg) => { invalidate(); setToast({ message: msg, type: "success" }); }}
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
    username:    mr?.username    || "",
    email:       mr?.email       || "",
    password:    "Welcome@123",
    phone:       mr?.phone       || "",
    zone:        mr?.zone        || "",
    state:       mr?.state       || "",
    territory:   mr?.territory   || "",
  });
  // assigned_doctors from API are objects {id, name} — extract IDs for submission
  const initialDoctorObjs = mr?.assigned_doctors || [];
  const [assignedDoctors, setAssignedDoctors] = useState(initialDoctorObjs.map((d) => d.id || d));
  const [doctorObjects, setDoctorObjects] = useState(initialDoctorObjs.filter((d) => d.id)); // already have name+id

  // assigned_drugs from API are objects {id, name} — extract IDs for submission
  const initialDrugObjs = mr?.assigned_drugs || [];
  const [assignedDrugs, setAssignedDrugs] = useState(initialDrugObjs.map((d) => d.id || d));
  const [drugObjects, setDrugObjects] = useState(initialDrugObjs.filter((d) => d.id));

  // Doctor search state
  const [doctorSearch, setDoctorSearch] = useState("");
  const [allDoctors, setAllDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Drug search state
  const [drugSearch, setDrugSearch] = useState("");
  const [allDrugs, setAllDrugs] = useState([]);
  const [loadingDrugs, setLoadingDrugs] = useState(true);
  const [drugDropdownOpen, setDrugDropdownOpen] = useState(false);
  const drugDropdownRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch all doctors once on modal open
  useEffect(() => {
    setLoadingDoctors(true);
    get(isEdit ? `/api/v1/doctors?page_size=500` : `/api/v1/doctors/available`)
      .then((data) => {
        setAllDoctors(data.doctors || []);
      })
      .catch(() => {})
      .finally(() => setLoadingDoctors(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch all drugs once on modal open
  useEffect(() => {
    setLoadingDrugs(true);
    get("/api/v1/drugs?limit=500")
      .then((data) => {
        const drugs = (data.drugs || []).map((d) => ({
          id: d._id || d.id,
          name: d.name || d.drug_name || d.field_values?.find((f) => f.key === "drug_name")?.value || d.field_values?.find((f) => f.key === "brand_name")?.value || "Unknown Drug",
        }));
        setAllDrugs(drugs);
      })
      .catch(() => {})
      .finally(() => setLoadingDrugs(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter locally by search keyword
  const doctorResults = doctorSearch.trim()
    ? allDoctors.filter((d) =>
        d.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.hospital?.toLowerCase().includes(doctorSearch.toLowerCase())
      )
    : allDoctors;

  // Filter drugs locally by search keyword
  const drugResults = drugSearch.trim()
    ? allDrugs.filter((d) => d.name?.toLowerCase().includes(drugSearch.toLowerCase()))
    : allDrugs;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (drugDropdownRef.current && !drugDropdownRef.current.contains(e.target)) setDrugDropdownOpen(false);
    };
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

  const addDrug = (drug) => {
    if (assignedDrugs.includes(drug.id)) return;
    setAssignedDrugs((prev) => [...prev, drug.id]);
    setDrugObjects((prev) => [...prev, drug]);
    setDrugSearch("");
    setDrugDropdownOpen(false);
  };

  const removeDrug = (id) => {
    setAssignedDrugs((prev) => prev.filter((d) => d !== id));
    setDrugObjects((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Frontend validation for Proxzar fields (create only)
    if (!isEdit) {
      // Username: 3-30 chars, lowercase letters, numbers, underscores only
      if (!/^[a-z0-9_]{3,30}$/.test(form.username)) {
        setError("Username must be 3-30 characters, only lowercase letters, numbers, and underscores.");
        return;
      }
      // Password: 8-64 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
      const pwd = form.password || "Welcome@123";
      if (pwd.length < 8 || pwd.length > 64) {
        setError("Password must be 8-64 characters.");
        return;
      }
      if (!/[A-Z]/.test(pwd)) { setError("Password must contain at least 1 uppercase letter."); return; }
      if (!/[a-z]/.test(pwd)) { setError("Password must contain at least 1 lowercase letter."); return; }
      if (!/[0-9]/.test(pwd)) { setError("Password must contain at least 1 number."); return; }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) { setError("Password must contain at least 1 symbol."); return; }
      // Phone: 10 digits starting with 6-9
      const phoneDigits = form.phone.replace(/\D/g, "").replace(/^91/, "");
      if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
        setError("Phone must be a valid 10-digit Indian mobile number (starting with 6-9).");
        return;
      }
      // Full Name: 2-100 chars
      if (form.name.length < 2 || form.name.length > 100) {
        setError("Full name must be 2-100 characters.");
        return;
      }
    }

    setSaving(true);
    try {
      if (isEdit) {
        await put(`/api/v1/mrs/${mr.id}`, {
          name:             form.name,
          phone:            form.phone,
          zone:             form.zone,
          state:            form.state,
          territory:        form.territory,
          assigned_doctors: assignedDoctors,
          assigned_drugs:   assignedDrugs,
        });
      } else {
        // Step 1: Register user in Proxzar OAuth2
        const pwd = form.password || "Welcome@123";
        const proxzarRes = await fetch((process.env.NEXT_PUBLIC_BASE_PATH || '') + "/api/v1/auth/addUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            UserName: form.username,
            UserPassword: pwd,
            UserFullName: form.name,
            UserEmail: form.email,
            UserPhone: form.phone.startsWith("+91") ? form.phone : `+91${form.phone.replace(/\D/g, "")}`,
            DataSource: "MRX",
          }),
        });
        const proxzarData = await proxzarRes.json();
        if (!proxzarRes.ok) {
          const detail = proxzarData.detail;
          const msg = Array.isArray(detail)
            ? detail.map((d) => d.msg || JSON.stringify(d)).join(", ")
            : typeof detail === "string" ? detail : "Failed to register user in auth system";
          throw new Error(msg);
        }

        // Step 2: Create MR in platform
        await post(`/api/v1/mrs`, {
          name:             form.name,
          username:         form.username,
          email:            form.email,
          password:         pwd,
          phone:            form.phone,
          zone:             form.zone,
          state:            form.state,
          territory:        form.territory,
          assigned_doctors: assignedDoctors,
          assigned_drugs:   assignedDrugs,
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
            {!isEdit && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                    placeholder="rajesh_kumar"
                    required
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm outline-none"
                  />
                  <button type="button" onClick={() => {
                    const name = form.name.trim().toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, "_");
                    const rand = Math.floor(100 + Math.random() * 900);
                    setForm({ ...form, username: name ? `${name}_${rand}` : "" });
                  }} className="px-3 py-2 bg-orange-100 text-orange-700 rounded-xl text-xs font-bold hover:bg-orange-200 transition-all whitespace-nowrap">
                    Auto
                  </button>
                </div>
              </div>
            )}
            {field("Email", "email", "email", "mr@company.com", !isEdit)}
            {!isEdit && field("Password", "password", "password", "Welcome@123")}
            {field("Phone", "phone", "tel", "9876543210", true)}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Zone <span className="text-red-500">*</span></label>
              <select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value, state: "", territory: "" })} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm outline-none bg-white">
                <option value="">Select Zone</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="Central">Central</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">State <span className="text-red-500">*</span></label>
              <SearchableDropdown
                value={form.state}
                onChange={(v) => setForm({ ...form, state: v, territory: "" })}
                placeholder="Search state..."
                options={getStatesForZone(form.zone)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Territory <span className="text-red-500">*</span></label>
              <SearchableDropdown
                value={form.territory}
                onChange={(v) => setForm({ ...form, territory: v })}
                placeholder="Search territory..."
                options={getTerritoriesForState(form.state)}
              />
            </div>
          </div>

          {/* Assign Doctors */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Assign Doctors</label>

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

          {/* Assign Drugs */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Assign Drugs / Products</label>

            {/* Selected drugs chips */}
            {drugObjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {drugObjects.map((d) => (
                  <span key={d.id} className="flex items-center space-x-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    <span>💊 {d.name}</span>
                    <button type="button" onClick={() => removeDrug(d.id)} className="text-green-400 hover:text-green-700 ml-1 font-bold">×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Drug search input + dropdown */}
            <div className="relative" ref={drugDropdownRef}>
              <input
                type="text"
                value={drugSearch}
                onChange={(e) => { setDrugSearch(e.target.value); setDrugDropdownOpen(true); }}
                onFocus={() => setDrugDropdownOpen(true)}
                placeholder="Search and add drugs..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm outline-none"
              />
              {drugDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {loadingDrugs ? (
                    <div className="px-4 py-3 text-sm text-gray-400">Loading drugs...</div>
                  ) : drugResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">No drugs found</div>
                  ) : (
                    drugResults.slice(0, 20).map((d) => {
                      const already = assignedDrugs.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => !already && addDrug(d)}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${already ? "bg-gray-50 text-gray-400 cursor-default" : "hover:bg-orange-50 text-gray-700"}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs">💊</span>
                            <p className="font-semibold">{d.name}</p>
                          </div>
                          {already && <span className="text-xs text-green-500 font-semibold">Added</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{assignedDrugs.length} drug{assignedDrugs.length !== 1 ? "s" : ""} assigned</p>
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

// Convert "09:30" → "9:30 AM"
const to12h = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
};

const STATUS_STYLES = {
  scheduled: { bg: "bg-blue-100",  text: "text-blue-700",  label: "Scheduled" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  cancelled: { bg: "bg-red-100",   text: "text-red-600",   label: "Cancelled" },
};

