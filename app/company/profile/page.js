"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import { get, put } from "@/lib/api";
import ChangePasswordSection from "@/components/ChangePasswordSection";

const ADMIN_ONLY = ["company_name","company_address","company_pincode","company_gst_number","company_pan_number"];

export default function CompanyProfile() {
  const queryClient = useQueryClient();
  const [editMode, setEditMode]       = useState(null); // "personal" | "company"
  const [form, setForm]               = useState({});
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");

  // Personal profile (GET /profile/me)
  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => get("/api/v1/profile/me"),
    staleTime: 60000,
  });

  // Company profile (GET /profile/company)
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["company-profile"],
    queryFn: () => get("/api/v1/profile/company"),
    staleTime: 60000,
  });

  const role = me?.role; // "ADMIN" or "MANAGER"

  // PUT /profile/me — personal fields only
  const personalMutation = useMutation({
    mutationFn: (data) => {
      const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== "" && v !== undefined));
      return put("/api/v1/profile/me", clean);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-me"] });
      setEditMode(null);
      setSuccess("Personal profile updated");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => setError(err.message || "Failed to update"),
  });

  // PUT /profile/company — company fields only
  const companyMutation = useMutation({
    mutationFn: (data) => {
      const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== "" && v !== undefined));
      if (clean.company_founded_year) clean.company_founded_year = parseInt(clean.company_founded_year, 10);
      return put("/api/v1/profile/company", clean);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
      setEditMode(null);
      setSuccess("Company profile updated");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => setError(err.message || "Failed to update"),
  });

  const openPersonal = () => {
    setForm({ full_name: me?.full_name || "", phone: me?.phone || "", admin_bio: me?.admin_bio || "", admin_avatar_url: me?.admin_avatar_url || "" });
    setError(""); setEditMode("personal");
  };

  const openCompany = () => {
    setForm({
      company_name:         company?.company_name || "",
      company_description:  company?.company_description || "",
      company_logo_url:     company?.company_logo_url || "",
      company_city:         company?.company_city || "",
      company_state:        company?.company_state || "",
      company_country:      company?.company_country || "",
      company_website:      company?.company_website || "",
      company_industry:     company?.company_industry || "",
      company_founded_year: company?.company_founded_year || "",
      company_size:         company?.company_size || "",
      // Admin-only fields
      company_address:      company?.company_address || "",
      company_pincode:      company?.company_pincode || "",
      company_gst_number:   company?.company_gst_number || "",
      company_pan_number:   company?.company_pan_number || "",
    });
    setError(""); setEditMode("company");
  };

  const isLoading = meLoading || companyLoading;
  const initial   = company?.company_name?.charAt(0)?.toUpperCase() || "C";

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <CompanyNavbar />
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        {[1,2,3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">{success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Admin personal card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
              <div className="relative inline-block mb-4">
                {me?.admin_avatar_url ? (
                  <img src={me.admin_avatar_url} alt="avatar" className="w-32 h-16 rounded-xl object-contain mx-auto bg-white p-1 shadow-lg border border-gray-100" />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg">
                    {me?.full_name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                )}
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{me?.full_name || "—"}</h2>
              <p className="text-purple-600 font-semibold text-xs mt-0.5">{me?.role}</p>
              <p className="text-gray-400 text-xs mt-0.5">{me?.email}</p>
              {me?.phone && <p className="text-gray-500 text-xs mt-0.5">{me.phone}</p>}
              {me?.admin_bio && <p className="text-gray-600 text-sm mt-3 leading-relaxed">{me.admin_bio}</p>}
              <button onClick={openPersonal}
                className="mt-4 w-full border border-purple-200 text-purple-700 hover:bg-purple-50 py-2 rounded-xl font-semibold text-sm transition-all">
                Edit Profile
              </button>
            </div>

            {/* Company logo card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
              {company?.company_logo_url ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow p-2 inline-flex items-center justify-center mb-3 mx-auto" style={{minWidth:"80px",maxWidth:"200px"}}>
                  <img src={company.company_logo_url} alt="logo" className="max-h-12 w-auto object-contain" style={{maxWidth:"180px"}} />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg mb-3">
                  {initial}
                </div>
              )}
              <h3 className="font-bold text-gray-900">{company?.company_name || "—"}</h3>
              <p className="text-blue-600 text-xs font-semibold mt-0.5">{company?.company_industry || "Pharmaceutical"}</p>
              {company?.company_city && (
                <p className="text-gray-400 text-xs mt-1">{[company.company_city, company.company_state, company.company_country].filter(Boolean).join(", ")}</p>
              )}
              <button onClick={openCompany}
                className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-xl font-semibold text-sm transition-all">
                Manage Company
              </button>
            </div>
          </div>

          {/* Right — Company details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Company Details</h3>
              {company?.company_description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4 pb-4 border-b border-gray-100">{company.company_description}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Industry",     value: company?.company_industry || "—",     color: "purple" },
                  { label: "Founded",      value: company?.company_founded_year || "—", color: "blue" },
                  { label: "Size",         value: company?.company_size || "—",         color: "green" },
                  { label: "City",         value: company?.company_city || "—",         color: "orange" },
                  { label: "State",        value: company?.company_state || "—",        color: "teal" },
                  { label: "Country",      value: company?.company_country || "—",      color: "indigo" },
                ].map((f) => (
                  <div key={f.label} className={`bg-${f.color}-50 border border-${f.color}-100 rounded-xl p-3`}>
                    <p className={`text-xs text-${f.color}-600 font-semibold mb-1`}>{f.label}</p>
                    <p className="text-sm font-bold text-gray-800">{f.value}</p>
                  </div>
                ))}
              </div>
              {company?.company_website && (
                <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Website</p>
                  <a href={company.company_website?.startsWith("http") ? company.company_website : `https://${company.company_website}`}
                    target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                    {company.company_website}
                  </a>
                </div>
              )}
            </div>

            {/* Admin-only private fields */}
            {role === "ADMIN" && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Private Information (Admin Only)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Address",    value: company?.company_address || "—",    color: "gray" },
                    { label: "Pincode",    value: company?.company_pincode || "—",    color: "gray" },
                    { label: "GST Number", value: company?.company_gst_number || "—", color: "red" },
                    { label: "PAN Number", value: company?.company_pan_number || "—", color: "red" },
                  ].map((f) => (
                    <div key={f.label} className={`bg-${f.color}-50 border border-${f.color}-100 rounded-xl p-3`}>
                      <p className={`text-xs text-${f.color}-600 font-semibold mb-1`}>{f.label}</p>
                      <p className="text-sm font-bold text-gray-800">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Personal Modal */}
        {editMode === "personal" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
                <h3 className="font-bold text-gray-900">Edit Profile</h3>
                <button onClick={() => setEditMode(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm">{error}</div>}
                {[
                  { key: "full_name",        label: "Full Name",       type: "text" },
                  { key: "phone",            label: "Phone",           type: "text" },
                  { key: "admin_avatar_url", label: "Avatar URL",      type: "text" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                    <input type={f.type} value={form[f.key] || ""} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Bio</label>
                  <textarea value={form.admin_bio || ""} onChange={(e) => setForm((p) => ({ ...p, admin_bio: e.target.value }))}
                    rows={3} maxLength={500}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200 resize-none" />
                  <p className="text-xs text-gray-400 text-right">{(form.admin_bio || "").length}/500</p>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
                <button onClick={() => setEditMode(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={() => personalMutation.mutate(form)} disabled={personalMutation.isPending}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
                  {personalMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Company Modal */}
        {editMode === "company" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
                <h3 className="font-bold text-gray-900">Manage Company</h3>
                <button onClick={() => setEditMode(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm">{error}</div>}
                {[
                  { key: "company_name",         label: "Company Name",    type: "text",   adminOnly: true },
                  { key: "company_logo_url",      label: "Logo URL",        type: "text",   adminOnly: false },
                  { key: "company_industry",      label: "Industry",        type: "text",   adminOnly: false },
                  { key: "company_city",          label: "City",            type: "text",   adminOnly: false },
                  { key: "company_state",         label: "State",           type: "text",   adminOnly: false },
                  { key: "company_country",       label: "Country",         type: "text",   adminOnly: false },
                  { key: "company_website",       label: "Website",         type: "text",   adminOnly: false },
                  { key: "company_founded_year",  label: "Founded Year",    type: "number", adminOnly: false },
                  { key: "company_size",          label: "Company Size",    type: "text",   adminOnly: false },
                  { key: "company_address",       label: "Address",         type: "text",   adminOnly: true },
                  { key: "company_pincode",       label: "Pincode",         type: "text",   adminOnly: true },
                  { key: "company_gst_number",    label: "GST Number",      type: "text",   adminOnly: true },
                  { key: "company_pan_number",    label: "PAN Number",      type: "text",   adminOnly: true },
                ].filter((f) => !f.adminOnly || role === "ADMIN").map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      {f.label} {f.adminOnly && <span className="text-red-400 text-xs">(Admin only)</span>}
                    </label>
                    <input type={f.type} value={form[f.key] || ""} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                  <textarea value={form.company_description || ""} onChange={(e) => setForm((p) => ({ ...p, company_description: e.target.value }))}
                    rows={3} maxLength={1000}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200 resize-none" />
                  <p className="text-xs text-gray-400 text-right">{(form.company_description || "").length}/1000</p>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
                <button onClick={() => setEditMode(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={() => companyMutation.mutate(form)} disabled={companyMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
                  {companyMutation.isPending ? "Saving..." : "Save Company"}
                </button>
              </div>
            </div>
          </div>
        )}
        <ChangePasswordSection accentColor="purple" />

      </main>
    </div>
  );
}
