"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, post, put, del } from "@/lib/api";
import { downloadCSVTemplate } from "@/lib/downloadTemplate";

const FIELD_TYPES = ["text", "textarea", "number", "date", "select", "url"];

const formatKey = (key) => key?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";
const getVal = (drug, key) => drug?.field_values?.find((f) => f.key === key)?.value || "";

export default function CompanyDrugManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab]       = useState("drugs");
  const [showDrugModal, setShowDrugModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editDrug, setEditDrug]           = useState(null);

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

  const filteredDrugs = drugs;
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Drugs",       value: drugsTotal,                                          icon: "💊", from: "from-blue-500",  to: "to-indigo-600", text: "from-blue-600 to-indigo-600" },
                { label: "With Brochures",    value: drugs.filter((d) => !!getVal(d,"brochure_url")).length, icon: "✅", from: "from-green-500", to: "to-emerald-600", text: "from-green-600 to-emerald-600" },
                { label: "Missing Brochures", value: drugs.filter((d) => !getVal(d,"brochure_url")).length,  icon: "❌", from: "from-red-500",   to: "to-pink-600",   text: "from-red-600 to-pink-600" },
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
                  const specialization = getVal(drug, "specialization");
                  const drugName       = getVal(drug, "drug_name") || drug.field_values?.find((f) => f.key?.includes("name"))?.value || "Drug";
                  const brandName      = getVal(drug, "brand_name");
                  const drugClass      = getVal(drug, "drug_class");

                  const HEADER_KEYS = ["brand_name","drug_name","drug_class","specialization","brochure_url"];

                  // Always use drug's own field_values as source — shows all fields that have values
                  const allTemplateFields = template?.fields || [];
                  const displayFields = (drug.field_values || [])
                    .filter((fv) => {
                      if (HEADER_KEYS.includes(fv.key)) return false;
                      if (!fv.value) return false;
                      // Check template visibility — search ALL template fields (not just visible ones)
                      const tmplField = allTemplateFields.find((f) => f.key === fv.key);
                      if (tmplField) return tmplField.visible === true;
                      // Field not in template yet (newly added via bulk) — show by default
                      return true;
                    })
                    .map((fv) => {
                      const tmplField = allTemplateFields.find((f) => f.key === fv.key);
                      return { key: fv.key, label: tmplField?.label || null, field_id: fv.field_id || fv.key, value: fv.value };
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
                    <div key={drug._id} className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">

                      {/* Gradient accent bar */}
                      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

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

                      {/* Field rows — compact two-column layout */}
                      <div className="px-4 py-3 grid grid-cols-2 gap-2">
                        {displayFields.map((f, idx) => {
                          const c = fieldColors[idx % fieldColors.length];
                          return (
                            <div key={f.field_id || f.key}
                              className={`${c.bg} rounded-xl px-3 py-2 border-l-3 ${c.border} border-l-4 ${f.value?.length > 30 ? "col-span-2" : ""}`}>
                              <p className={`text-xs ${c.label} font-bold mb-0.5`}>{f.label || formatKey(f.key)}</p>
                              <p className="text-gray-700 font-medium text-xs line-clamp-2">{f.value}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div className="px-4 pb-4 pt-1">
                        <button onClick={() => { setEditDrug(drug); setShowDrugModal(true); }}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-xl font-bold text-xs hover:shadow-lg transition-all group-hover:from-indigo-700 group-hover:to-purple-700">
                          ✏️ Edit Drug
                        </button>
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
          <span className="font-bold">{template.template_name}</span> — Fixed fields can have their label, visibility and options updated. Dynamic fields can be fully edited or deleted.
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
                onDelete={() => deleteField(f.field_id)}
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
        {onDelete && <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-600 font-semibold">Delete</button>}
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
  // Build initial form from existing drug field_values
  const initForm = () => {
    if (!drug) return {};
    return Object.fromEntries((drug.field_values || []).map((fv) => [fv.key, fv.value]));
  };
  const [formData, setFormData] = useState(initForm);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const visibleFields = template.fields?.filter((f) => f.visible) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const field_values = visibleFields.map((f) => ({
      field_id: f.field_id,
      key:      f.key,
      value:    formData[f.key] || "",
    }));

    try {
      if (isEdit) {
        await put(`/api/v1/drugs/${drug._id}`, { field_values });
      } else {
        await post("/api/v1/drugs", { template_id: template._id, field_values });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save drug");
    }
    setSaving(false);
  };

  const renderField = (f) => {
    const base = "w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 text-sm outline-none";
    const val  = formData[f.key] || "";
    const onChange = (v) => setFormData((p) => ({ ...p, [f.key]: v }));

    switch (f.type) {
      case "textarea": return <textarea className={base} rows={3} value={val} onChange={(e) => onChange(e.target.value)} placeholder={`Enter ${f.label?.toLowerCase() || "value"}...`} />;
      case "select":   return (
        <select className={`${base} bg-white`} value={val} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select {f.label?.toLowerCase() || "option"}</option>
          {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
      case "date":   return <input type="date"   className={base} value={val} onChange={(e) => onChange(e.target.value)} />;
      case "number": return <input type="number" className={base} value={val} onChange={(e) => onChange(e.target.value)} placeholder={`Enter ${f.label?.toLowerCase() || "value"}...`} />;
      case "url":    return <input type="url"    className={base} value={val} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />;
      case "file":   return (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-indigo-400 cursor-pointer">
          <p className="text-sm text-gray-500"><span className="text-indigo-600 font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs text-gray-400 mt-1">PDF only (max 10MB)</p>
        </div>
      );
      default: return <input type="text" className={base} value={val} onChange={(e) => onChange(e.target.value)} placeholder={`Enter ${f.label?.toLowerCase() || "value"}...`} />;
    }
  };

  const fixedVisible   = visibleFields.filter((f) => f.is_fixed);
  const dynamicVisible = visibleFields.filter((f) => !f.is_fixed);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-5 rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💊</span>
            <div>
              <h2 className="text-xl font-bold text-white">{isEdit ? "Edit Drug" : "Add New Drug"}</h2>
              <p className="text-blue-100 text-xs">{template.template_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

          {/* Fixed fields */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Standard Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fixedVisible.map((f) => (
                <div key={f.field_id} className={f.type === "textarea" || f.type === "file" ? "md:col-span-2" : ""}>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {f.label || formatKey(f.key)} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  {renderField(f)}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic fields */}
          {dynamicVisible.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                Custom Fields <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full normal-case">{dynamicVisible.length}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                {dynamicVisible.map((f) => (
                  <div key={f.field_id} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {f.label || formatKey(f.key)} {f.required && <span className="text-red-500">*</span>}
                      <span className="ml-1 text-indigo-400 font-normal">(custom)</span>
                    </label>
                    {renderField(f)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2.5 rounded-xl font-bold hover:shadow-lg text-sm disabled:opacity-50">
              {saving ? "Saving..." : isEdit ? "Update Drug" : "Add Drug"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

  const handleDownload = () => {
    if (!template?.fields) return;
    const visibleFields = template.fields.filter((f) => f.visible);
    const headers = visibleFields.map((f) => f.key);
    // Only header row — fill from row 2 onwards
    downloadCSVTemplate(headers, [[]], `drugs_template.csv`);
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
                          // Fields that accept multiple comma-separated values
                          const multiKeys = new Set(["indications","side_effects","contraindications","drug_interactions","specialization"]);
                          let hint = "text";
                          if (f.type === "select" && f.options?.length) hint = f.options.slice(0,3).join(" | ") + (f.options.length > 3 ? "..." : "");
                          else if (multiKeys.has(f.key))  hint = "text · multiple: comma,separated";
                          else if (f.type === "textarea") hint = "free text";
                          else if (f.type === "date")     hint = "YYYY-MM-DD";
                          else if (f.type === "number")   hint = "number";
                          else if (f.type === "url")      hint = "https://...";
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
