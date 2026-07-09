"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, post, put, del } from "@/lib/api";
import { downloadCSVTemplate } from "@/lib/downloadTemplate";

const FIELD_TYPES = ["text", "textarea", "number", "date", "select", "url"];

// ── Searchable Select Dropdown ────────────────────────────────────────────────
function SearchableSelect({ options, value, onChange, placeholder }) {
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
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-left bg-white flex items-center justify-between focus:ring-2 focus:ring-indigo-200 outline-none">
        <span className={value ? "text-gray-800" : "text-gray-400"}>{value || placeholder}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 flex-shrink-0">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              autoFocus
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <div className="overflow-y-auto flex-1">
            {value && (
              <button type="button" onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 border-b border-gray-50">
                ✕ Clear selection
              </button>
            )}
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400 text-center">No matching options</p>
            ) : (
              filtered.map((o) => (
                <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); setSearch(""); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 transition-colors ${value === o ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700"}`}>
                  {o}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const formatKey = (key) => key?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";

// Read from top-level field first, then fall back to field_values array
const getVal = (drug, key) => {
  if (drug?.[key] !== undefined && drug?.[key] !== null) {
    const v = drug[key];
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
  }
  const fv = drug?.field_values?.find((f) => f.key === key);
  if (!fv) return "";
  if (Array.isArray(fv.value)) return fv.value.join(", ");
  return fv.value || "";
};

export default function CompanyDrugManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab]       = useState("drugs");
  const [showDrugModal, setShowDrugModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editDrug, setEditDrug]           = useState(null);
  const [drugSearch, setDrugSearch]       = useState("");

  const { data: template, isLoading: loadingTemplate } = useQuery({
    queryKey: ["drug-template"],
    queryFn:  () => get("/api/v1/drugs/templates"),
    staleTime: 10 * 60 * 1000,
  });

  const { data: drugsData, isLoading: loadingDrugs } = useQuery({
    queryKey: ["drugs"],
    queryFn:  () => get("/api/v1/drugs?limit=100"),
    enabled:  activeTab === "drugs",
  });

  const drugs      = drugsData?.drugs || [];
  const drugsTotal = drugsData?.total || 0;

  const invalidateDrugs    = () => queryClient.invalidateQueries({ queryKey: ["drugs"] });
  const invalidateTemplate = () => queryClient.invalidateQueries({ queryKey: ["drug-template"] });

  const filteredDrugs = drugSearch.trim()
    ? drugs.filter((d) => {
        const q = drugSearch.toLowerCase();
        // Check top-level string fields
        const topLevel = ["drug_name","brand_name","drug_class","manufacturer","specialization","route","dosage_form","dosage_strength"]
          .some((k) => (d[k] || "").toLowerCase().includes(q));
        if (topLevel) return true;
        // Check array fields (indications, symptoms, side_effects)
        const arrayFields = ["indications","symptoms","side_effects"]
          .some((k) => Array.isArray(d[k]) && d[k].some((v) => v.toLowerCase().includes(q)));
        if (arrayFields) return true;
        // Fall back to field_values
        return d.field_values?.some((fv) => {
          const v = Array.isArray(fv.value) ? fv.value.join(" ") : (fv.value || "");
          return v.toLowerCase().includes(q);
        }) || false;
      })
    : drugs;
  const visibleFields = template?.fields?.filter((f) => f.visible) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <CompanyNavbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Drug Management</h1>
            <p className="text-gray-500 text-sm">Manage your pharmaceutical products and form template</p>
          </div>
          {activeTab === "drugs" && (
            <div className="flex gap-2">
              <button onClick={() => setShowBulkModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm">
                <span>📊</span><span>Bulk Upload</span>
              </button>
              <button onClick={() => { setEditDrug(null); setShowDrugModal(true); }}
                disabled={!template}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm disabled:opacity-50">
                <span>➕</span><span>Add Drug</span>
              </button>
            </div>
          )}
        </div>

        {/* Main tabs */}
        <div className="flex space-x-2 mb-6 bg-white rounded-xl p-1.5 shadow border border-gray-100 w-fit">
          {[{ id: "drugs", label: "💊 Drugs" }, { id: "template", label: "⚙️ Form Template" }].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === t.id ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── DRUGS TAB ── */}
        {activeTab === "drugs" && (
          <>
            {!template && !loadingTemplate && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
                <span>⚠️</span>
                <p className="text-sm text-amber-800">No drug template found. Go to <button onClick={() => setActiveTab("template")} className="font-bold underline">Form Template</button> tab to create one first.</p>
              </div>
            )}

            {/* Search bar */}
            <div className="mb-4">
              <div className="relative">
                <input type="text" value={drugSearch} onChange={(e) => setDrugSearch(e.target.value)}
                  placeholder="Search drugs by name, indication, class..."
                  className="w-full pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm outline-none transition-all" />
                {drugSearch && (
                  <button onClick={() => setDrugSearch("")} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-sm">✕</button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Drugs",       value: drugsTotal,                                          icon: "💊", from: "from-blue-500",  to: "to-indigo-600", text: "from-blue-600 to-indigo-600" },
                { label: "With Brochures",    value: drugs.filter((d) => d.has_brochure === true).length,  icon: "✅", from: "from-green-500", to: "to-emerald-600", text: "from-green-600 to-emerald-600" },
                { label: "Missing Brochures", value: drugs.filter((d) => d.has_brochure !== true).length,   icon: "❌", from: "from-red-500",   to: "to-pink-600",   text: "from-red-600 to-pink-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                  <div className={`w-10 h-10 bg-gradient-to-br ${s.from} ${s.to} rounded-xl flex items-center justify-center mb-3`}>
                    <span className="text-xl">{s.icon}</span>
                  </div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${s.text} bg-clip-text text-transparent`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Drug cards */}
            {loadingDrugs ? (
              <div className="text-center py-16 text-gray-400 text-sm">Loading drugs...</div>
            ) : filteredDrugs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
                <span className="text-5xl">💊</span>
                <p className="text-gray-500 mt-4 font-medium text-sm">No drugs yet. Add your first drug.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrugs.map((drug) => {
                  const drugName       = drug.drug_name    || getVal(drug, "drug_name")    || "Drug";
                  const brandName      = drug.brand_name   || getVal(drug, "brand_name");
                  const drugClass      = drug.drug_class   || getVal(drug, "drug_class");
                  const specialization = drug.specialization || getVal(drug, "specialization");

                  // Build display fields — deduplicated by key
                  const PRICING_CARD_KEYS = new Set(["pack_type","units_per_pack","packs_per_box","pack_price","box_price","mrp","price_per_drug","price"]);
                  const SKIP = new Set(["_id","__v","template_id","field_values","created_at","updated_at","is_active","company_id","drug_name","brand_name","drug_class","specialization","brochure_url","search_text",
                    "pack_type","units_per_pack","packs_per_box","pack_price","box_price","mrp","price_per_drug","price"]);
                  const ORDERED = ["manufacturer","indications","symptoms","side_effects","mechanism_of_action","dosage_strength","dosage_form","route"];
                  const seenKeys = new Set();
                  const displayFields = [];

                  // Add ordered fields first
                  ORDERED.forEach((k) => {
                    if (seenKeys.has(k)) return;
                    const v = drug[k];
                    if (!v || (Array.isArray(v) && v.length === 0)) return;
                    seenKeys.add(k);
                    displayFields.push({ key: k, value: Array.isArray(v) ? v.join(", ") : String(v) });
                  });

                  // Add remaining from field_values (catches custom fields like reference_url)
                  (drug.field_values || []).forEach((fv) => {
                    if (seenKeys.has(fv.key) || SKIP.has(fv.key)) return;
                    if (!fv.value || (Array.isArray(fv.value) && fv.value.length === 0)) return;
                    seenKeys.add(fv.key);
                    displayFields.push({ key: fv.key, value: Array.isArray(fv.value) ? fv.value.join(", ") : String(fv.value) });
                  });

                  // Add any remaining top-level fields not yet shown
                  Object.entries(drug).forEach(([k, v]) => {
                    if (seenKeys.has(k) || SKIP.has(k) || ORDERED.includes(k)) return;
                    if (!v || (Array.isArray(v) && v.length === 0)) return;
                    if (typeof v === "object" && !Array.isArray(v)) return;
                    seenKeys.add(k);
                    displayFields.push({ key: k, value: Array.isArray(v) ? v.join(", ") : String(v) });
                  });

                  // Rotating color palette for field rows
                  const fieldColors = [
                    { border: "border-indigo-400", label: "text-indigo-600", bg: "bg-indigo-50", icon: "💊" },
                    { border: "border-blue-400",   label: "text-blue-600",   bg: "bg-blue-50",   icon: "🎯" },
                    { border: "border-green-400",  label: "text-green-600",  bg: "bg-green-50",  icon: "⚙️" },
                    { border: "border-yellow-400", label: "text-yellow-600", bg: "bg-yellow-50", icon: "⚠️" },
                    { border: "border-red-400",    label: "text-red-600",    bg: "bg-red-50",    icon: "🚫" },
                    { border: "border-pink-400",   label: "text-pink-600",   bg: "bg-pink-50",   icon: "🔄" },
                    { border: "border-purple-400", label: "text-purple-600", bg: "bg-purple-50", icon: "📅" },
                    { border: "border-orange-400", label: "text-orange-600", bg: "bg-orange-50", icon: "🏢" },
                    { border: "border-teal-400",   label: "text-teal-600",   bg: "bg-teal-50",   icon: "📋" },
                    { border: "border-cyan-400",   label: "text-cyan-600",   bg: "bg-cyan-50",   icon: "🔬" },
                  ];

                  return (
                    <div key={drug._id} className={`bg-white rounded-2xl shadow-md border hover:shadow-xl transition-all duration-300 overflow-hidden group ${drug.is_active === false ? "border-gray-200 opacity-60" : "border-gray-100"}`}>

                      {/* Gradient accent bar */}
                      <div className={`h-1 w-full ${drug.is_active === false ? "bg-gray-300" : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"}`} />

                      {/* Card header */}
                      <div className="px-5 pt-4 pb-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -mr-10 -mt-10 opacity-60" />
                        <div className="relative flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
                                {drugName?.charAt(0)?.toUpperCase()}
                              </div>
                              <h3 className="text-base font-bold text-gray-800 truncate capitalize">{drugName}</h3>
                            </div>
                            {brandName && (
                              <p className="text-xs text-indigo-600 font-semibold ml-10">{brandName}</p>
                            )}
                            {drugClass && (
                              <p className="text-xs text-gray-400 ml-10 mt-0.5">{drugClass}</p>
                            )}
                          </div>
                          {specialization && (
                            <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 border border-indigo-200">
                              {specialization}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="mx-4 border-t border-gray-100" />

                      {/* Field rows — compact two-column layout, max 4 fields shown */}
                      <div className="px-4 py-3 grid grid-cols-2 gap-2">
                        {displayFields.slice(0, 6).map((f, idx) => {
                          const c = fieldColors[idx % fieldColors.length];
                          const isLong = String(f.value).length > 40;
                          return (
                            <div key={f.key + "_" + idx}
                              className={`${c.bg} rounded-xl px-3 py-2 border-l-4 ${c.border} ${isLong ? "col-span-2" : ""}`}>
                              <p className={`text-xs ${c.label} font-bold mb-0.5`}>{formatKey(f.key)}</p>
                              <p className="text-gray-700 font-medium text-xs line-clamp-1">{f.value}</p>
                            </div>
                          );
                        })}
                        {displayFields.length === 0 && (
                          <p className="col-span-2 text-xs text-gray-400 text-center py-2">No additional fields</p>
                        )}
                        {displayFields.length > 6 && (
                          <p className="col-span-2 text-xs text-gray-400 text-center">+{displayFields.length - 6} more fields</p>
                        )}
                      </div>

                      {/* Pricing Strip */}
                      {(() => {
                        const pkg = drug.packaging;
                        if (!pkg) return null;
                        const sp = pkg.selling_price ?? pkg.pricing?.selling_price;
                        if (sp == null) return null;
                        const bp = pkg.box_price ?? pkg.pricing?.box_pricing?.box_price;
                        const mrp = pkg.mrp ?? pkg.pricing?.mrp;
                        const maxDisc = pkg.max_discount_percent ?? pkg.pricing?.max_discount_percent;
                        return (
                          <div className="mx-4 mb-2 grid grid-cols-3 gap-1.5 bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                            <div className="text-center"><p className="text-[8px] text-emerald-600 font-bold uppercase">/{pkg.sales_unit || "pack"}</p><p className="text-xs font-extrabold text-emerald-800">₹{sp}</p></div>
                            {bp != null && <div className="text-center"><p className="text-[8px] text-teal-600 font-bold uppercase">/box</p><p className="text-xs font-extrabold text-teal-800">₹{bp}</p></div>}
                            {mrp != null && <div className="text-center"><p className="text-[8px] text-amber-600 font-bold uppercase">MRP</p><p className="text-xs font-extrabold text-amber-800">₹{mrp}</p></div>}
                            {maxDisc != null && <div className="text-center"><p className="text-[8px] text-red-500 font-bold uppercase">Max Disc</p><p className="text-xs font-extrabold text-red-700">{maxDisc}%</p></div>}
                          </div>
                        );
                      })()}

                      {/* Actions */}
                      <div className="px-4 pb-4 pt-1 space-y-2">
                        {/* Active toggle */}
                        <DrugActiveToggle drug={drug} onToggled={invalidateDrugs} />
                        <button onClick={() => { setEditDrug(drug); setShowDrugModal(true); }}
                          disabled={!drug.is_active}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-xl font-bold text-xs hover:shadow-lg transition-all group-hover:from-indigo-700 group-hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed">
                          ✏️ Edit Drug
                        </button>
                        <BrochureUploadButton drug={drug} onUploaded={invalidateDrugs} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── TEMPLATE TAB ── */}
        {activeTab === "template" && (
          <TemplateManager
            template={template}
            loading={loadingTemplate}
            onRefresh={() => invalidateTemplate()}
          />
        )}
      </main>

      {showDrugModal && template && (
        <DrugModal
          template={template}
          drug={editDrug}
          onClose={() => { setShowDrugModal(false); setEditDrug(null); }}
          onSaved={invalidateDrugs}
        />
      )}
      {showBulkModal && <BulkUploadModal onClose={() => setShowBulkModal(false)} onSuccess={(type) => {
        invalidateDrugs();
        if (type === "template") invalidateTemplate();
      }} />}
    </div>
  );
}

// ── Template Manager ─────────────────────────────────────────────────────────
function TemplateManager({ template, loading, onRefresh }) {
  const [creating, setCreating]   = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [addingField, setAddingField]   = useState(false);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");

  const createTemplate = async () => {
    if (!templateName.trim()) return;
    setSaving(true);
    try {
      await post("/api/v1/drugs/templates", { template_name: templateName });
      onRefresh();
      setCreating(false);
    } catch (e) { setError(e.message || "Failed to create template"); }
    setSaving(false);
  };

  const updateField = async (fieldId, body) => {
    setSaving(true);
    try {
      await put(`/api/v1/drugs/templates/${template._id}/fields/${fieldId}`, body);
      onRefresh();
      setEditingField(null);
    } catch (e) { setError(e.message || "Failed to update field"); }
    setSaving(false);
  };

  const deleteField = async (fieldId) => {
    if (!confirm("Delete this field?")) return;
    try {
      await del(`/api/v1/drugs/templates/${template._id}/fields/${fieldId}`);
      onRefresh();
    } catch (e) { setError(e.message || "Failed to delete field"); }
  };

  const addField = async (body) => {
    setSaving(true);
    try {
      await post(`/api/v1/drugs/templates/${template._id}/fields`, body);
      onRefresh();
      setAddingField(false);
    } catch (e) { setError(e.message || "Failed to add field"); }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-16 text-gray-400 text-sm">Loading template...</div>;

  if (!template) return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        No template exists yet. Create one to start adding drugs.
      </div>
      {!creating ? (
        <button onClick={() => setCreating(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold shadow text-sm">
          + Create Drug Template
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 space-y-3 max-w-md">
          <h3 className="font-bold text-gray-800">New Template</h3>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name e.g. Standard Drug Form"
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
          <div className="flex gap-2">
            <button onClick={() => setCreating(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-sm">Cancel</button>
            <button onClick={createTemplate} disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-bold text-sm disabled:opacity-50">
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const fixedFields   = template.fields?.filter((f) => f.is_fixed)   || [];
  const dynamicFields = template.fields?.filter((f) => !f.is_fixed)  || [];

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-blue-500">ℹ️</span>
        <div className="text-sm text-blue-800">
          <span className="font-bold">{template.template_name}</span> — Fixed fields can have their label, visibility and options updated. Dynamic fields can be fully edited.
        </div>
      </div>

      {/* Fixed fields */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <span>🔒</span>
          <h2 className="font-bold text-gray-800">Fixed Fields</h2>
          <span className="text-xs text-gray-400">({fixedFields.length})</span>
        </div>
        <div className="divide-y divide-gray-50">
          {fixedFields.map((f) => (
            <FieldRow key={f.field_id} field={f} templateId={template._id}
              onUpdate={(body) => updateField(f.field_id, body)}
              isEditing={editingField === f.field_id}
              onEdit={() => setEditingField(f.field_id)}
              onCancel={() => setEditingField(null)}
              saving={saving}
            />
          ))}
        </div>
      </div>

      {/* Dynamic fields */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✏️</span>
            <h2 className="font-bold text-gray-800">Dynamic Fields</h2>
            <span className="text-xs text-gray-400">({dynamicFields.length})</span>
          </div>
          <button onClick={() => setAddingField(true)}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all">
            + Add Field
          </button>
        </div>

        {dynamicFields.length === 0 && !addingField ? (
          <div className="px-5 py-10 text-center">
            <p className="text-gray-400 text-sm mb-3">No dynamic fields yet.</p>
            <button onClick={() => setAddingField(true)}
              className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100">
              + Add your first custom field
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {dynamicFields.map((f) => (
              <FieldRow key={f.field_id} field={f} templateId={template._id}
                onUpdate={(body) => updateField(f.field_id, body)}
                isEditing={editingField === f.field_id}
                onEdit={() => setEditingField(f.field_id)}
                onCancel={() => setEditingField(null)}
                saving={saving}
              />
            ))}
            {addingField && (
              <AddFieldRow
                onSave={addField}
                onCancel={() => setAddingField(false)}
                saving={saving}
                nextOrder={(template.fields?.length || 0) + 1}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Contextual hints per field key — shown when editing
const FIELD_HINTS = {
  drug_name:           { label: "The generic/scientific name of the drug. Changing this label affects how it appears in all drug forms and doctor-facing views.", visible: "Hiding drug name will make it invisible in the drug form — doctors won't see the generic name.", required: "Making this optional means MRs can submit a drug without a generic name, which may cause data quality issues." },
  brand_name:          { label: "The commercial brand name (e.g. Mounjaro, Lipitor). This is what doctors and MRs primarily identify the drug by.", visible: "Hiding brand name means the drug card won't show its commercial name to doctors.", required: "Brand name is usually required — without it, drugs become hard to identify in the field." },
  generic_name:        { label: "The non-proprietary name. Useful when multiple brands share the same molecule.", visible: "Hiding generic name is fine if you only deal with branded drugs.", required: "" },
  drug_class:          { label: "Pharmacological category (e.g. Biguanide, Statin). Helps doctors quickly understand the drug's mechanism family.", visible: "Hiding drug class removes a key context clue for doctors evaluating the drug.", required: "" },
  specialization:      { label: "Which medical specialization this drug targets (e.g. Cardiology, Diabetology). Used to match drugs to the right doctors.", visible: "Hiding specialization means MRs won't be guided on which doctors to pitch this drug to.", required: "Required is recommended — without it, drug-doctor matching won't work correctly." },
  indications:         { label: "The conditions or diseases this drug is approved to treat. Core clinical information for doctors.", visible: "Hiding indications removes the most important clinical context for doctors.", required: "Strongly recommended as required — a drug without indications is clinically incomplete." },
  mechanism_of_action: { label: "How the drug works at a molecular/physiological level. Important for doctor education during MR visits.", visible: "Hiding mechanism of action reduces the educational value of the drug profile.", required: "" },
  dosage:              { label: "Recommended dose and frequency (e.g. 500mg twice daily). Critical for safe prescribing.", visible: "Hiding dosage is not recommended — it's essential safety information.", required: "Strongly recommended as required — dosage is critical clinical data." },
  side_effects:        { label: "Known adverse reactions. Doctors need this to counsel patients and make prescribing decisions.", visible: "Hiding side effects is not recommended — transparency builds doctor trust.", required: "" },
  contraindications:   { label: "Conditions where the drug must NOT be used (e.g. pregnancy, kidney disease). Safety-critical field.", visible: "Hiding contraindications is strongly discouraged — it's a patient safety concern.", required: "" },
  drug_interactions:   { label: "Other drugs or substances that interact with this drug. Important for polypharmacy patients.", visible: "Hiding drug interactions reduces safety information available to doctors.", required: "" },
  launch_date:         { label: "When this drug was launched or made available. Helps doctors understand how new or established the drug is.", visible: "Hiding launch date removes context about the drug's market maturity.", required: "" },
  brochure_url:        { label: "Link to the drug's PDF brochure or visual aid. MRs use this during doctor visits.", visible: "Hiding brochure URL means doctors won't have access to the detailed PDF.", required: "" },
};

const IMPACT_COLORS = {
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  danger:  "bg-red-50 border-red-200 text-red-700",
  info:    "bg-blue-50 border-blue-200 text-blue-700",
};

function FieldRow({ field, onUpdate, onDelete, isEditing, onEdit, onCancel, saving }) {
  const [form, setForm] = useState({ visible: field.visible, required: field.required });

  const hints = FIELD_HINTS[field.key] || {};

  if (!isEditing) return (
    <div className="px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{field.type}</span>
        <span className="text-sm font-semibold text-gray-700">{field.label}</span>
        <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-200">{field.key}</span>
        {field.required && <span className="text-xs text-red-500">required</span>}
        {!field.visible && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">hidden</span>}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
      </div>
    </div>
  );

  return (
    <div className="px-5 py-4 bg-indigo-50 space-y-3">
      {hints.label && (
        <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs ${IMPACT_COLORS.info}`}>
          <span className="mt-0.5 flex-shrink-0">💡</span>
          <p>{hints.label}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="space-y-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} className="accent-indigo-600 w-4 h-4" />
            <span className="text-xs font-semibold text-gray-700">Visible in form</span>
          </label>
          {!form.visible && hints.visible && (
            <div className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs ${IMPACT_COLORS.warning}`}>
              <span className="flex-shrink-0">⚠️</span><p>{hints.visible}</p>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} className="accent-red-500 w-4 h-4" />
            <span className="text-xs font-semibold text-gray-700">Required</span>
          </label>
          {hints.required && (
            <div className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs ${form.required ? IMPACT_COLORS.danger : IMPACT_COLORS.info}`}>
              <span className="flex-shrink-0">{form.required ? "🔴" : "ℹ️"}</span><p>{hints.required}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">Cancel</button>
        <button disabled={saving} onClick={() => onUpdate({ visible: form.visible, required: form.required })}
          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

// ── Packaging Rules — built from template.packaging_metadata at runtime ───────
// Fallback used only if backend hasn't returned packaging_metadata yet
const PACKAGING_RULES_FALLBACK = {
  "Tablet":    { salesUnits: ["Strip", "Bottle", "Blister Pack"], measureUnits: ["Tablet"] },
  "Capsule":   { salesUnits: ["Strip", "Bottle"],                 measureUnits: ["Capsule"] },
  "Syrup":     { salesUnits: ["Bottle"],                          measureUnits: ["ml"] },
  "Injection": { salesUnits: ["Vial", "Ampoule", "Prefilled Syringe"], measureUnits: ["ml", "mg", "g"] },
  "Cream":     { salesUnits: ["Tube", "Jar"],                     measureUnits: ["g"] },
  "Drops":     { salesUnits: ["Bottle"],                          measureUnits: ["ml"] },
  "Powder":    { salesUnits: ["Sachet", "Bottle", "Box"],         measureUnits: ["g", "mg"] },
  "Inhaler":   { salesUnits: ["Inhaler"],                         measureUnits: ["Dose"] },
};

// Convert template.packaging_metadata array → lookup object
function buildPackagingRules(packagingMetadata) {
  if (!Array.isArray(packagingMetadata) || packagingMetadata.length === 0) {
    return PACKAGING_RULES_FALLBACK;
  }
  const rules = {};
  packagingMetadata.forEach((m) => {
    rules[m.dosage_form] = {
      salesUnits:   m.sales_units        || [],
      measureUnits: m.measurement_units  || [],
    };
  });
  return rules;
}

const PACKAGING_KEYS = new Set([
  "sales_unit", "pack_quantity", "measurement_unit",
  "sales_units_per_box", "selling_price", "mrp", "max_discount_percent",
  "box_pricing_mode", "box_discount_percent", "box_price",
]);

// ── PackagingSection Component ────────────────────────────────────────────────
function PackagingSection({ dosageForm, packagingRules, formData, onChange }) {
  const rules = (packagingRules || PACKAGING_RULES_FALLBACK)[dosageForm] || null;

  const salesUnit       = formData.sales_unit           || "";
  const packQty         = formData.pack_quantity         || "";
  const measureUnit     = formData.measurement_unit      || "";
  const unitsPerBox     = formData.sales_units_per_box   || "";
  const sellingPrice    = parseFloat(formData.selling_price) || 0;
  const mrp             = formData.mrp                   || "";
  const boxMode         = formData.box_pricing_mode      || "auto";
  const boxDiscount     = parseFloat(formData.box_discount_percent) || 0;
  const customBoxPrice  = parseFloat(formData.box_price) || 0;
  const unitsPerBoxNum  = parseFloat(unitsPerBox) || 0;

  // Calculated box price
  const calcBoxPrice = (() => {
    if (!sellingPrice || !unitsPerBoxNum) return null;
    if (boxMode === "auto")     return sellingPrice * unitsPerBoxNum;
    if (boxMode === "discount") return sellingPrice * unitsPerBoxNum * (1 - boxDiscount / 100);
    if (boxMode === "custom")   return customBoxPrice || null;
    return null;
  })();

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-300 transition-all";

  if (!dosageForm) {
    return (
      <div className="bg-emerald-50 border border-dashed border-emerald-200 rounded-xl p-4 text-center">
        <span className="text-2xl block mb-1">📦</span>
        <p className="text-xs text-emerald-600 font-medium">Select a Dosage Form above to configure packaging & pricing</p>
      </div>
    );
  }

  if (!rules) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
        <p className="text-xs text-gray-400">No packaging rules defined for <strong>{dosageForm}</strong>. Use standard fields below.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step 1: Sales Unit */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5">
          Sales Unit <span className="text-red-500">*</span>
          <span className="ml-1 text-gray-400 font-normal">— how you sell a single unit</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {rules.salesUnits.map((u) => (
            <button key={u} type="button"
              onClick={() => onChange("sales_unit", u)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                salesUnit === u
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
              }`}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Pack Size */}
      {salesUnit && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Pack Quantity <span className="text-red-500">*</span></label>
            <input type="number" min="1" value={packQty}
              onChange={(e) => onChange("pack_quantity", e.target.value)}
              placeholder={`How many ${rules.measureUnits[0]}s per ${salesUnit}`}
              className={inp} />
            {packQty && measureUnit && (
              <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">1 {salesUnit} = {packQty} {measureUnit}{packQty > 1 ? "s" : ""}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Measurement Unit <span className="text-red-500">*</span></label>
            {rules.measureUnits.length === 1 ? (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-semibold">
                {rules.measureUnits[0]}
                {formData.measurement_unit !== rules.measureUnits[0] && onChange("measurement_unit", rules.measureUnits[0])}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {rules.measureUnits.map((m) => (
                  <button key={m} type="button"
                    onClick={() => onChange("measurement_unit", m)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                      measureUnit === m
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {salesUnit && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Selling Price (per {salesUnit}) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
              <input type="number" min="0" step="0.01" value={formData.selling_price || ""}
                onChange={(e) => onChange("selling_price", e.target.value)}
                placeholder="0.00"
                className={inp + " pl-7"} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">MRP (optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
              <input type="number" min="0" step="0.01" value={formData.mrp || ""}
                onChange={(e) => onChange("mrp", e.target.value)}
                placeholder="0.00"
                className={inp + " pl-7"} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Max Discount % <span className="text-red-500">*</span>
              <span className="ml-1 text-gray-400 font-normal text-[9px]">ceiling for RCPA approvals</span>
            </label>
            <input type="number" min="0" max="100" step="0.5" value={formData.max_discount_percent || ""}
              onChange={(e) => onChange("max_discount_percent", e.target.value)}
              placeholder="e.g. 15"
              className={inp} />
          </div>
        </div>
      )}

      {/* Step 4: Box Config */}
      {salesUnit && sellingPrice > 0 && (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">📦 Box Packaging (Optional)</p>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Number of {salesUnit}s per Box
            </label>
            <input type="number" min="1" value={formData.sales_units_per_box || ""}
              onChange={(e) => onChange("sales_units_per_box", e.target.value)}
              placeholder={`e.g. 20 ${salesUnit}s per Box`}
              className={inp} />
          </div>

          {/* Box Pricing Mode */}
          {unitsPerBoxNum > 0 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Box Pricing Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "auto",     label: "Auto",     desc: `₹${sellingPrice} × ${unitsPerBoxNum}` },
                    { id: "discount", label: "Discount",  desc: "% off box total" },
                    { id: "custom",   label: "Custom",    desc: "Set fixed price" },
                  ].map((m) => (
                    <button key={m.id} type="button"
                      onClick={() => onChange("box_pricing_mode", m.id)}
                      className={`py-2 px-3 rounded-lg border-2 text-left transition-all ${
                        boxMode === m.id
                          ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      <p className="text-[11px] font-bold">{m.label}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              {boxMode === "discount" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Discount %</label>
                  <input type="number" min="0" max="100" step="0.5" value={formData.box_discount_percent || ""}
                    onChange={(e) => onChange("box_discount_percent", e.target.value)}
                    placeholder="e.g. 10"
                    className={inp + " max-w-[120px]"} />
                </div>
              )}
              {boxMode === "custom" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Custom Box Price</label>
                  <div className="relative max-w-[160px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                    <input type="number" min="0" step="0.01" value={formData.box_price || ""}
                      onChange={(e) => onChange("box_price", e.target.value)}
                      placeholder="0.00"
                      className={inp + " pl-7"} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Live Preview */}
      {salesUnit && packQty && sellingPrice > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-3">📋 Packaging Summary</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded-lg p-2 border border-emerald-100">
              <p className="text-[9px] text-gray-400 font-bold uppercase">Sales Unit</p>
              <p className="font-bold text-gray-800">{salesUnit}</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-emerald-100">
              <p className="text-[9px] text-gray-400 font-bold uppercase">Pack Size</p>
              <p className="font-bold text-gray-800">{packQty} {measureUnit || rules.measureUnits[0]}{packQty > 1 ? "s" : ""}</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-emerald-100">
              <p className="text-[9px] text-gray-400 font-bold uppercase">Selling Price</p>
              <p className="font-bold text-emerald-700">₹{sellingPrice} / {salesUnit}</p>
            </div>
            {mrp && (
              <div className="bg-white rounded-lg p-2 border border-amber-100">
                <p className="text-[9px] text-gray-400 font-bold uppercase">MRP</p>
                <p className="font-bold text-amber-700">₹{mrp}</p>
              </div>
            )}
            {unitsPerBoxNum > 0 && (
              <div className="bg-white rounded-lg p-2 border border-teal-100">
                <p className="text-[9px] text-gray-400 font-bold uppercase">Box Contains</p>
                <p className="font-bold text-teal-700">{unitsPerBoxNum} {salesUnit}s</p>
              </div>
            )}
            {calcBoxPrice !== null && (
              <div className="bg-white rounded-lg p-2 border border-indigo-100">
                <p className="text-[9px] text-gray-400 font-bold uppercase">Box Price</p>
                <p className="font-bold text-indigo-700">₹{calcBoxPrice.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddFieldRow({ onSave, onCancel, saving, nextOrder }) {
  const [label, setLabel]   = useState("");
  const [type, setType]     = useState("text");
  const [options, setOptions] = useState("");

  return (
    <div className="px-5 py-4 bg-green-50 space-y-3">
      <p className="text-xs font-bold text-green-700">New Custom Field</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Label <span className="text-red-500">*</span></label>
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Storage Temperature"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-400" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-400 bg-white">
            {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      {type === "select" && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Options (comma-separated)</label>
          <input type="text" value={options} onChange={(e) => setOptions(e.target.value)}
            placeholder="opt1, opt2, opt3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-400" />
        </div>
      )}
      {label.trim() && (
        <p className="text-xs text-gray-400">
          Key: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")}</span>
        </p>
      )}
      <div className="flex gap-2">
        <button onClick={onCancel} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">Cancel</button>
        <button disabled={saving || !label.trim()}
          onClick={() => onSave({ label, type, key: label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""), order: nextOrder, options: type === "select" ? options.split(",").map((o) => o.trim()).filter(Boolean) : [] })}
          className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50">
          {saving ? "Adding..." : "Add Field"}
        </button>
      </div>
    </div>
  );
}

// ── Drug Modal (Add / Edit) ───────────────────────────────────────────────────
function DrugModal({ template, drug, onClose, onSaved }) {
  const isEdit = !!drug;

  // Build packaging rules from backend template metadata (or fallback)
  const packagingRules = React.useMemo(() => buildPackagingRules(template.packaging_metadata), [template.packaging_metadata]);

  // Build initial form from existing drug field_values (GET response format)
  const initForm = () => {
    if (!drug) return {};
    const form = {};
    (drug.field_values || []).forEach((fv) => {
      const v = fv.value;
      form[fv.key] = Array.isArray(v) ? v.join(", ") : (v ?? "");
    });
    Object.entries(drug).forEach(([k, v]) => {
      if (form[k] !== undefined) return;
      if (["_id","__v","template_id","field_values","created_at","updated_at","is_active","company_id","search_text","packaging"].includes(k)) return;
      if (v === null || v === undefined) return;
      form[k] = Array.isArray(v) ? v.join(", ") : String(v);
    });
    return form;
  };

  // Init packaging from drug.packaging if editing
  const initPackaging = () => {
    if (!drug?.packaging) return {};
    const p = drug.packaging;
    // Handle both flat and nested (pricing sub-object) structures from backend
    const pricing = p.pricing || {};
    const boxPricing = pricing.box_pricing || {};
    return {
      sales_unit:            p.sales_unit            || "",
      pack_quantity:         p.pack_quantity          != null ? String(p.pack_quantity)          : "",
      measurement_unit:      p.measurement_unit       || "",
      selling_price:         (p.selling_price ?? pricing.selling_price) != null ? String(p.selling_price ?? pricing.selling_price) : "",
      mrp:                   (p.mrp ?? pricing.mrp) != null ? String(p.mrp ?? pricing.mrp) : "",
      max_discount_percent:  (p.max_discount_percent ?? pricing.max_discount_percent) != null ? String(p.max_discount_percent ?? pricing.max_discount_percent) : "",
      sales_units_per_box:   p.sales_units_per_box    != null ? String(p.sales_units_per_box)    : "",
      box_pricing_mode:      p.box_pricing_mode ?? boxPricing.mode ?? "auto",
      box_discount_percent:  (p.box_discount_percent ?? boxPricing.discount_percent) != null ? String(p.box_discount_percent ?? boxPricing.discount_percent) : "",
      box_price:             (p.box_price ?? boxPricing.box_price) != null ? String(p.box_price ?? boxPricing.box_price) : "",
    };
  };

  const [formData, setFormData]         = useState(initForm);
  const [packagingData, setPackagingData] = useState(initPackaging);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");

  const visibleFields = template.fields?.filter((f) => f.visible) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const ARRAY_KEYS = new Set(["symptoms","indications","side_effects"]);

    const buildValue = (f) => {
      let value = formData[f.key] ?? "";
      if ((f.type === "array" || ARRAY_KEYS.has(f.key)) && typeof value === "string" && value.trim()) {
        value = value.split(",").map((v) => v.trim()).filter(Boolean);
      }
      return value;
    };

    let field_values;

    if (isEdit) {
      // PUT — send all visible fields (use existing field_id if available, template field_id for new ones)
      const existingFvMap = Object.fromEntries(
        (drug.field_values || []).map((fv) => [fv.key, fv.field_id])
      );
      field_values = visibleFields.map((f) => ({
        field_id: existingFvMap[f.key] || f.field_id,
        key: f.key,
        value: buildValue(f),
      }));
    } else {
      // POST — use template's field_ids for all visible fields
      field_values = visibleFields.map((f) => ({
        field_id: f.field_id,
        key: f.key,
        value: buildValue(f),
      }));
    }

    try {
      const payload = { field_values };
      // Add packaging object if any packaging data was filled
      if (packagingData.sales_unit || packagingData.selling_price) {
        const pkg = {};
        if (packagingData.sales_unit)           pkg.sales_unit           = packagingData.sales_unit;
        if (packagingData.pack_quantity)         pkg.pack_quantity         = parseFloat(packagingData.pack_quantity);
        if (packagingData.measurement_unit)      pkg.measurement_unit      = packagingData.measurement_unit;
        if (packagingData.selling_price)         pkg.selling_price         = parseFloat(packagingData.selling_price);
        if (packagingData.mrp)                   pkg.mrp                   = parseFloat(packagingData.mrp);
        if (packagingData.max_discount_percent)  pkg.max_discount_percent  = parseFloat(packagingData.max_discount_percent);
        if (packagingData.sales_units_per_box)   pkg.sales_units_per_box   = parseFloat(packagingData.sales_units_per_box);
        if (packagingData.box_pricing_mode)      pkg.box_pricing_mode      = packagingData.box_pricing_mode;
        if (packagingData.box_discount_percent)  pkg.box_discount_percent  = parseFloat(packagingData.box_discount_percent);
        if (packagingData.box_price)             pkg.box_price             = parseFloat(packagingData.box_price);
        payload.packaging = pkg;
      }
      if (isEdit) {
        await put(`/api/v1/drugs/${drug._id}`, payload);
      } else {
        await post("/api/v1/drugs", { template_id: template._id, ...payload });
      }
      onSaved();
      onClose();
    } catch (err) {
      const raw = err?.data?.detail || err?.message || "Failed to save drug";
      const detail = Array.isArray(raw)
        ? raw.map((d) => (typeof d === "string" ? d : d.msg || JSON.stringify(d))).join(", ")
        : String(raw);
      const status = err?.status ? ` (${err.status})` : "";
      setError(detail + status);
    }
    setSaving(false);
  };

  const renderField = (f) => {
    const base = "w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 text-xs outline-none transition-all";
    const val  = formData[f.key] || "";
    const onChange = (v) => setFormData((p) => ({ ...p, [f.key]: v }));

    switch (f.type) {
      case "array": return (
        <div>
          <input type="text" className={base} value={val} onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. fever, headache, cough" />
          <p className="text-xs text-gray-400 mt-0.5">Separate with commas</p>
        </div>
      );
      case "textarea": return (
        <textarea className={base} rows={2} value={val}
          onChange={(e) => onChange(e.target.value)}
          placeholder={"Enter " + (f.label?.toLowerCase() || "value") + "..."} />
      );
      case "select": return (
        <SearchableSelect
          options={f.options || []}
          value={val}
          onChange={onChange}
          placeholder={"Select " + (f.label?.toLowerCase() || "option")}
        />
      );
      case "date":   return <input type="date"   className={base} value={val} onChange={(e) => onChange(e.target.value)} />;
      case "number": return <input type="number" className={base} value={val} onChange={(e) => onChange(e.target.value)} placeholder={"Enter " + (f.label?.toLowerCase() || "value")} />;
      case "url":    return <input type="url"    className={base} value={val} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />;
      case "file":   return (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          {val ? (
            <div className="flex items-center justify-between">
              <a href={val} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-semibold hover:underline truncate">
                📄 View current brochure
              </a>
              <button type="button" onClick={() => onChange("")} className="text-xs text-red-400 hover:text-red-600 ml-2 flex-shrink-0">Remove</button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center">Brochure upload available on the drug card after saving</p>
          )}
        </div>
      );
      default: return (
        <input type="text" className={base} value={val}
          onChange={(e) => onChange(e.target.value)}
          placeholder={"Enter " + (f.label?.toLowerCase() || "value")} />
      );
    }
  };

  const fixedVisible   = visibleFields.filter((f) => f.is_fixed);
  const dynamicVisible = visibleFields.filter((f) => !f.is_fixed);

  // Split fixed fields: packaging keys go to PackagingSection, rest go to Standard Fields grid
  const packagingFieldKeys = new Set([...PACKAGING_KEYS, "dosage_form"]);
  const standardFixed  = fixedVisible.filter((f) => !packagingFieldKeys.has(f.key));
  const hasPackagingFields = true; // always show packaging section
  const dosageFormField = fixedVisible.find((f) => f.key === "dosage_form");
  const currentDosageForm = formData.dosage_form || "";

  const handlePackagingChange = (key, val) => {
    setPackagingData((p) => {
      const next = { ...p, [key]: val };
      // When dosage form changes in formData, reset all packaging fields
      if (key === "dosage_form") {
        Object.keys(next).forEach((k) => { if (k !== "dosage_form") next[k] = ""; });
        const rules = packagingRules[val];
        if (rules?.measureUnits?.length === 1) next.measurement_unit = rules.measureUnits[0];
      }
      // When sales unit changes, reset downstream packaging fields
      if (key === "sales_unit") {
        ["pack_quantity","measurement_unit","sales_units_per_box","box_pricing_mode","box_discount_percent","box_price"].forEach((k) => { next[k] = ""; });
        const rules = packagingRules[formData.dosage_form];
        if (rules?.measureUnits?.length === 1) next.measurement_unit = rules.measureUnits[0];
      }
      return next;
    });
    // dosage_form is also a template field — keep formData in sync
    if (key === "dosage_form") {
      setFormData((p) => ({ ...p, dosage_form: val }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3 rounded-t-2xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💊</span>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">{isEdit ? "Edit Drug" : "Add New Drug"}</h2>
              <p className="text-blue-200 text-xs">{template.template_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>
          )}

          {/* Fixed fields — exclude packaging keys (handled by PackagingSection) */}
          {standardFixed.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Standard Fields</p>
            <div className="grid grid-cols-2 gap-3">
              {standardFixed.map((f) => (
                <div key={f.field_id} className={f.type === "textarea" || f.type === "array" || f.type === "file" ? "col-span-2" : ""}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {f.label || formatKey(f.key)}{f.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {renderField(f)}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Dosage Form selector (if exists in template) */}
          {dosageFormField && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {dosageFormField.label || "Dosage Form"}{dosageFormField.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {(dosageFormField.options?.length > 0 ? dosageFormField.options : Object.keys(packagingRules)).map((opt) => (
                  <button key={opt} type="button"
                    onClick={() => handlePackagingChange("dosage_form", opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                      currentDosageForm === opt
                        ? "bg-indigo-500 text-white border-indigo-500 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                    }`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Packaging & Pricing Section */}
          {hasPackagingFields && (
            <div className="border border-emerald-200 rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 flex items-center gap-2">
                <span className="text-base">📦</span>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Packaging & Pricing</p>
              </div>
              <div className="p-4">
                <PackagingSection
                  dosageForm={currentDosageForm}
                  packagingRules={packagingRules}
                  formData={packagingData}
                  onChange={handlePackagingChange}
                />
              </div>
            </div>
          )}

          {/* Dynamic fields */}
          {dynamicVisible.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                Custom Fields
                <span className="bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full normal-case font-semibold">{dynamicVisible.length}</span>
              </p>
              <div className="grid grid-cols-2 gap-3 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                {dynamicVisible.map((f) => (
                  <div key={f.field_id} className={f.type === "textarea" || f.type === "array" ? "col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      {f.label || formatKey(f.key)}{f.required && <span className="text-red-500 ml-0.5">*</span>}
                      <span className="ml-1 text-indigo-400 font-normal">(custom)</span>
                    </label>
                    {renderField(f)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Footer buttons */}
        <div className="flex gap-2 px-5 py-3 border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-200 text-sm transition-all">
            Cancel
          </button>
          <button type="submit" form="drug-form" disabled={saving}
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-xl font-bold hover:shadow-md text-sm disabled:opacity-50 transition-all">
            {saving ? "Saving..." : isEdit ? "Update Drug" : "Add Drug"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Drug Active Toggle ────────────────────────────────────────────────────────
function DrugActiveToggle({ drug, onToggled }) {
  const [loading, setLoading] = React.useState(false);
  const isActive = drug.is_active !== false; // default true if undefined

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (isActive) {
        // Deactivate — soft delete via DELETE endpoint
        const res = await fetch(`/api/v1/drugs/${drug._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.detail || "Failed to deactivate");
        }
      } else {
        // Reactivate — PUT with is_active field
        // Build field_values from existing drug to keep all data intact
        const field_values = (drug.field_values || []).map((fv) => ({
          field_id: fv.field_id,
          key: fv.key,
          value: fv.value,
        }));
        const res = await fetch(`/api/v1/drugs/${drug._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ field_values, is_active: true }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.detail || "Failed to reactivate");
        }
      }
      onToggled();
    } catch (err) {
      alert(err.message || "Toggle failed");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between px-1 py-1">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? "bg-green-500" : "bg-gray-300"}`} />
        <span className="text-xs font-semibold text-gray-600">
          {isActive ? "Visible to Doctors & MRs" : "Hidden from Doctors & MRs"}
        </span>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
          isActive ? "bg-green-500" : "bg-gray-300"
        }`}
        title={isActive ? "Click to hide from doctors/MRs" : "Click to show to doctors/MRs"}
      >
        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isActive ? "translate-x-4" : "translate-x-0"
        }`} />
      </button>
    </div>
  );
}

// ── Brochure Upload Button ────────────────────────────────────────────────────
function BrochureUploadButton({ drug, onUploaded }) {
  const fileRef = React.useRef(null);
  const [uploading, setUploading] = React.useState(false);
  const [deleting, setDeleting]   = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const hasBrochure = drug.has_brochure === true;

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) { showMsg("❌ PDF only"); return; }
    if (file.size > 10 * 1024 * 1024) { showMsg("❌ Max 10MB"); return; }
    setUploading(true);
    try {
      const token = localStorage.getItem("access_token");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/v1/drugs/${drug._id}/brochure`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      showMsg("✅ Brochure uploaded!");
      onUploaded();
    } catch (err) {
      showMsg("❌ " + (err.message || "Failed"));
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async () => {
    if (!confirm("Delete this brochure from Cloudinary?")) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`/api/v1/drugs/${drug._id}/brochure`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Delete failed");
      showMsg("✅ Brochure deleted");
      onUploaded();
    } catch (err) {
      showMsg("❌ " + (err.message || "Failed"));
    }
    setDeleting(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`/api/v1/drugs/${drug._id}/brochure/download`, {
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Download failed");
      }
      // Use filename from Content-Disposition header
      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename[^;=\n]*=["']?([^"'\n;]+)["']?/i);
      const filename = match?.[1]?.trim() || `${drug.drug_name || "drug"}-brochure.pdf`;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      showMsg("❌ " + (err.message || "Download failed"));
    }
    setDownloading(false);
  };

  return (
    <div className="space-y-1.5">
      <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />

      {hasBrochure ? (
        /* Has brochure — show download + delete + replace */
        <div className="space-y-1.5">
          <div className="flex gap-1.5">
            <button onClick={handleDownload} disabled={downloading}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50">
              {downloading ? "..." : "↓ Download"}
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50">
              {deleting ? "..." : "🗑 Delete"}
            </button>
          </div>
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50">
            {uploading ? "Uploading..." : "📄 Replace Brochure"}
          </button>
        </div>
      ) : (
        /* No brochure — just upload */
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-full py-2 rounded-xl font-bold text-xs transition-all border border-dashed border-gray-300 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 disabled:opacity-50">
          {uploading ? "Uploading..." : "📄 Upload Brochure"}
        </button>
      )}

      {msg && <p className="text-xs text-center font-medium text-gray-600">{msg}</p>}
    </div>
  );
}

// ── Bulk Upload Modal ─────────────────────────────────────────────────────────
function BulkUploadModal({ onClose, onSuccess }) {
  const fileRef = React.useRef(null);
  const [file, setFile]           = React.useState(null);
  const [template, setTemplate]   = React.useState(null);
  const [loading, setLoading]     = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [result, setResult]       = React.useState(null);
  const [error, setError]         = React.useState("");
  const [showErrors, setShowErrors] = React.useState(false);

  React.useEffect(() => {
    get("/api/v1/drugs/templates")
      .then((data) => setTemplate(data))
      .catch(() => setError("Could not load drug template."))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/v1/drugs/download-template", {
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "drug_template.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      // Fallback to local generation if backend endpoint fails
      if (!template?.fields) return;
      const visibleFields = template.fields.filter((f) => f.visible);
      const headers = visibleFields.map((f) => f.key);
      downloadCSVTemplate(headers, [[]], "drugs_template.csv");
    }
  };

  const fixedFields   = template?.fields?.filter((f) => f.is_fixed  && f.visible) || [];
  const customFields  = template?.fields?.filter((f) => !f.is_fixed && f.visible) || [];

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/v1/drugs/bulk-upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setResult(data);
      if (data.successful > 0) onSuccess();
      if (data.custom_fields_added?.length > 0) onSuccess("template"); // signal template refresh too
    } catch (e) {
      setError(e.message || "Upload failed");
    }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">📊 Bulk Upload Drugs</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading template fields...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>
        ) : (
          <>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4">
              <p className="text-xs font-bold text-indigo-800 mb-2">📥 Download template → fill from Row 2 · one drug per row</p>

              {/* Compact field guide */}
              {template?.fields && (
                <div className="bg-white rounded-lg border border-indigo-100 overflow-hidden">
                  <div className="max-h-28 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-indigo-100 sticky top-0">
                        <tr>
                          <th className="text-left px-2 py-1.5 text-indigo-700 font-bold">Key</th>
                          <th className="text-left px-2 py-1.5 text-indigo-700 font-bold">Format</th>
                          <th className="px-2 py-1.5 text-indigo-700 font-bold text-center">Req</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {template.fields.filter((f) => f.visible).map((f) => {
                          const multiKeys = new Set(["indications","side_effects","contraindications","drug_interactions","specialization"]);
                          let hint = "text";
                          if (f.type === "array")                              hint = "comma, separated values";
                          else if (f.type === "select" && f.options?.length)  hint = f.options.slice(0,3).join(" | ") + (f.options.length > 3 ? "..." : "");
                          else if (multiKeys.has(f.key))                      hint = "text · multiple: comma,separated";
                          else if (f.type === "textarea")                     hint = "free text";
                          else if (f.type === "date")                         hint = "YYYY-MM-DD";
                          else if (f.type === "number")                       hint = "number";
                          else if (f.type === "url")                          hint = "https://...";
                          return (
                            <tr key={f.field_id} className="hover:bg-gray-50">
                              <td className="px-2 py-1 font-mono text-indigo-600 font-semibold">{f.key}</td>
                              <td className="px-2 py-1 text-gray-500">{hint}</td>
                              <td className="px-2 py-1 text-center">{f.required ? <span className="text-red-500 font-bold">*</span> : <span className="text-gray-300">—</span>}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleDownload}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all mb-3 flex items-center justify-center gap-2 shadow">
              📥 Download Drug Template ({(fixedFields.length + customFields.length)} columns)
            </button>
          </>
        )}

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
              <p className="text-xs text-gray-400 mt-1">CSV or XLSX (max 5MB)</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-sm">Cancel</button>
          <button onClick={handleUpload} disabled={!file || loading || uploading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50">
            {uploading ? "Uploading..." : "Upload & Import"}
          </button>
        </div>

        {result && (
          <>
            <div className={`mt-3 rounded-xl p-3 border text-xs ${result.failed === 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-yellow-50 border-yellow-200 text-yellow-700"}`}>
              <p className="font-bold">{result.message}</p>
              {result.custom_fields_added?.length > 0 && (
                <p className="mt-1 text-indigo-600">✨ New fields added to template: {result.custom_fields_added.join(", ")}</p>
              )}
              {result.errors?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {result.errors.slice(0, 3).map((e, i) => (
                    <p key={i} className="text-red-500">Row {e.row}: {e.error}</p>
                  ))}
                  {result.errors.length > 3 && (
                    <button onClick={() => setShowErrors(true)}
                      className="text-red-600 font-bold underline text-xs mt-1">
                      Show all {result.errors.length} errors →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Errors detail modal */}
            {showErrors && (
              <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">❌ Upload Errors ({result.errors.length})</h3>
                    <button onClick={() => setShowErrors(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
                  </div>
                  <div className="overflow-y-auto p-4 space-y-2 flex-1">
                    {result.errors.map((e, i) => (
                      <div key={i} className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs">
                        <span className="bg-red-200 text-red-700 font-bold px-2 py-0.5 rounded flex-shrink-0">Row {e.row}</span>
                        <span className="text-red-600">{e.error}</span>
                        {(e.drug_name || e.brand_name) && (
                          <span className="text-gray-400 ml-auto flex-shrink-0">{e.drug_name} {e.brand_name ? `/ ${e.brand_name}` : ""}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100">
                    <button onClick={() => setShowErrors(false)}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
