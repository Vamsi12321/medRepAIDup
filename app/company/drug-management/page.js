"use client";
import { useState, useEffect } from "react";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";

const BASE_FIELDS = [
  { id: "drug_name",           name: "Drug Name",            type: "text",     required: true,  locked: true },
  { id: "brand_name",          name: "Brand Name",           type: "text",     required: true,  locked: true },
  { id: "generic_name",        name: "Generic Name",         type: "text",     required: false, locked: true },
  { id: "drug_class",          name: "Drug Class",           type: "text",     required: false, locked: true },
  { id: "specialization",      name: "Specialization",       type: "select",   required: true,  locked: true, options: ["diabetology","cardiology","neurology","oncology","orthopedics","dermatology"] },
  { id: "indications",         name: "Indications",          type: "textarea", required: true,  locked: true },
  { id: "mechanism_of_action", name: "Mechanism of Action",  type: "textarea", required: false, locked: true },
  { id: "dosage",              name: "Dosage",               type: "text",     required: true,  locked: true },
  { id: "side_effects",        name: "Side Effects",         type: "textarea", required: false, locked: true },
  { id: "contraindications",   name: "Contraindications",    type: "textarea", required: false, locked: true },
  { id: "drug_interactions",   name: "Drug Interactions",    type: "textarea", required: false, locked: true },
  { id: "launch_date",         name: "Launch Date",          type: "date",     required: true,  locked: true },
  { id: "brochure_url",        name: "Brochure PDF",         type: "file",     required: false, locked: true },
];

const FIELD_TYPES = ["text", "textarea", "number", "date", "select", "url"];

export default function CompanyDrugManagement() {
  const [activeTab, setActiveTab] = useState("drugs");
  const [drugTab, setDrugTab] = useState("all");
  const [showDrugModal, setShowDrugModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [savingFields, setSavingFields] = useState(false);
  const [fieldsSaved, setFieldsSaved] = useState(false);

  const [drugs] = useState([
    { _id: "drug123", drug_name: "Tirzepatide", brand_name: "Mounjaro", drug_class: "GLP-1 receptor agonist", specialization: ["diabetology"], indications: "Treatment of type 2 diabetes", mechanism_of_action: "Dual GIP and GLP-1 receptor agonist", dosage: "5 mg once weekly", side_effects: ["nausea","vomiting"], contraindications: "Thyroid carcinoma", drug_interactions: "May interact with insulin", launch_date: "2024-01-10", brochure_url: "https://example.com/mounjaro.pdf", status: "Active" },
    { _id: "drug124", drug_name: "Metformin", brand_name: "Glycomet", drug_class: "Biguanide", specialization: ["diabetology"], indications: "Type 2 diabetes mellitus", mechanism_of_action: "Decreases hepatic glucose production", dosage: "500 mg twice daily", side_effects: ["diarrhea","nausea"], contraindications: "Severe kidney disease", drug_interactions: "Alcohol, contrast agents", launch_date: "2023-08-15", brochure_url: null, status: "Active" },
    { _id: "drug125", drug_name: "Atorvastatin", brand_name: "Lipitor", drug_class: "HMG-CoA reductase inhibitor", specialization: ["cardiology"], indications: "Hypercholesterolemia", mechanism_of_action: "Inhibits cholesterol synthesis", dosage: "20 mg once daily", side_effects: ["muscle pain","headache"], contraindications: "Active liver disease", drug_interactions: "Warfarin, digoxin", launch_date: "2024-03-20", brochure_url: "https://example.com/lipitor.pdf", status: "Active" },
  ]);

  const companyId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (activeTab !== "fields" || !companyId) return;
    setLoadingFields(true);
    fetch(`/api/v1/companies/${companyId}/drug-form-config`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const custom = (data.fields || []).filter((f) => !f.locked);
        setCustomFields(custom);
      })
      .catch(() => {})
      .finally(() => setLoadingFields(false));
  }, [activeTab, companyId]);

  const saveFields = async () => {
    if (!companyId) return;
    setSavingFields(true);
    try {
      await fetch(`/api/v1/companies/${companyId}/drug-form-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: JSON.stringify({ fields: [...BASE_FIELDS, ...customFields] }),
      });
      setFieldsSaved(true);
      setTimeout(() => setFieldsSaved(false), 2500);
    } catch {}
    setSavingFields(false);
  };

  const addCustomField = () => {
    setCustomFields((prev) => [
      ...prev,
      { id: `custom_${Date.now()}`, name: "", type: "text", required: false, locked: false, options: "" },
    ]);
  };

  const updateCustomField = (id, key, value) => {
    setCustomFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  const removeCustomField = (id) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  const filteredDrugs = drugs.filter((d) => {
    if (drugTab === "with-brochure") return d.brochure_url;
    if (drugTab === "missing-brochure") return !d.brochure_url;
    return true;
  });

  const allFields = [...BASE_FIELDS, ...customFields];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <CompanyNavbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Drug Management</h1>
            <p className="text-gray-500 text-sm">Manage your pharmaceutical products and form configuration</p>
          </div>
          {activeTab === "drugs" && (
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
              <button onClick={() => setShowBulkModal(true)} className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm">
                <span>📊</span><span>Bulk Upload</span>
              </button>
              <button onClick={() => setShowDrugModal(true)} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm">
                <span>➕</span><span>Add Drug</span>
              </button>
            </div>
          )}
        </div>

        {/* Main tabs */}
        <div className="flex space-x-2 mb-6 bg-white rounded-xl p-1.5 shadow border border-gray-100 w-fit">
          {[{ id: "drugs", label: "💊 Drugs" }, { id: "fields", label: "⚙️ Form Fields" }].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === t.id ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── DRUGS TAB ── */}
        {activeTab === "drugs" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Drugs", value: drugs.length, icon: "💊", from: "from-blue-500", to: "to-indigo-600", text: "from-blue-600 to-indigo-600" },
                { label: "With Brochures", value: drugs.filter((d) => d.brochure_url).length, icon: "✅", from: "from-green-500", to: "to-emerald-600", text: "from-green-600 to-emerald-600" },
                { label: "Missing Brochures", value: drugs.filter((d) => !d.brochure_url).length, icon: "❌", from: "from-red-500", to: "to-pink-600", text: "from-red-600 to-pink-600" },
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

            {/* Filter tabs */}
            <div className="flex space-x-2 mb-6 bg-white rounded-xl p-1.5 shadow border border-gray-100">
              {[
                { id: "all", label: `📋 All (${drugs.length})` },
                { id: "with-brochure", label: `✅ With Brochures (${drugs.filter((d) => d.brochure_url).length})` },
                { id: "missing-brochure", label: `❌ Missing (${drugs.filter((d) => !d.brochure_url).length})` },
              ].map((t) => (
                <button key={t.id} onClick={() => setDrugTab(t.id)} className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${drugTab === t.id ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Drug cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrugs.map((drug) => (
                <div key={drug._id} className="bg-white rounded-2xl p-5 shadow border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">{drug.specialization[0]}</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${drug.brochure_url ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {drug.brochure_url ? "✅ Brochure" : "❌ Missing"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{drug.brand_name}</h3>
                  <p className="text-gray-600 text-sm font-semibold mb-0.5">{drug.drug_name}</p>
                  <p className="text-gray-400 text-xs mb-3">{drug.drug_class}</p>
                  <div className="space-y-1.5 mb-4 text-xs">
                    {[
                      { label: "💊 Dosage", value: drug.dosage, color: "indigo" },
                      { label: "🎯 Indication", value: drug.indications, color: "green" },
                      { label: "⚠️ Side Effects", value: Array.isArray(drug.side_effects) ? drug.side_effects.join(", ") : drug.side_effects, color: "yellow" },
                      { label: "🚫 Contraindications", value: drug.contraindications, color: "red" },
                    ].map((row) => (
                      <div key={row.label} className={`bg-${row.color}-50 rounded-lg p-2 border-l-4 border-${row.color}-400`}>
                        <p className={`text-${row.color}-600 font-semibold mb-0.5`}>{row.label}</p>
                        <p className="text-gray-700 font-medium">{row.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-all text-sm">Edit</button>
                    {!drug.brochure_url
                      ? <button className="flex-1 bg-green-100 text-green-600 px-3 py-2 rounded-lg font-semibold hover:bg-green-200 transition-all text-sm">Upload PDF</button>
                      : <button className="flex-1 bg-purple-100 text-purple-600 px-3 py-2 rounded-lg font-semibold hover:bg-purple-200 transition-all text-sm">View PDF</button>
                    }
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── FORM FIELDS TAB ── */}
        {activeTab === "fields" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start space-x-3">
              <span className="text-blue-500 mt-0.5">ℹ️</span>
              <p className="text-sm text-blue-800">Locked fields are part of the standard drug schema and cannot be removed. Add custom fields below to extend the drug form for your company.</p>
            </div>

            {/* Base fields (read-only) */}
            <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-2">
                <span className="text-lg">🔒</span>
                <h2 className="font-bold text-gray-800">Standard Fields</h2>
                <span className="text-xs text-gray-400 ml-1">({BASE_FIELDS.length} fields — locked)</span>
              </div>
              <div className="divide-y divide-gray-50">
                {BASE_FIELDS.map((f) => (
                  <div key={f.id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{f.type}</span>
                      <span className="text-sm font-semibold text-gray-700">{f.name}</span>
                      {f.required && <span className="text-xs text-red-500 font-medium">required</span>}
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">locked</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom fields */}
            <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">✏️</span>
                  <h2 className="font-bold text-gray-800">Custom Fields</h2>
                  <span className="text-xs text-gray-400">({customFields.length} fields)</span>
                </div>
                <button onClick={addCustomField} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center space-x-1">
                  <span>+</span><span>Add Field</span>
                </button>
              </div>

              {loadingFields ? (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">Loading fields...</div>
              ) : customFields.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-gray-400 text-sm mb-3">No custom fields yet.</p>
                  <button onClick={addCustomField} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-all">
                    + Add your first custom field
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {customFields.map((f, i) => (
                    <div key={f.id} className="px-5 py-4 grid grid-cols-12 gap-3 items-start">
                      <div className="col-span-1 pt-2 text-gray-400 text-sm font-mono">{i + 1}.</div>

                      <div className="col-span-4">
                        <label className="block text-xs text-gray-500 mb-1">Field Name</label>
                        <input
                          type="text"
                          value={f.name}
                          onChange={(e) => updateCustomField(f.id, "name", e.target.value)}
                          placeholder="e.g. Storage Temp"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-xs text-gray-500 mb-1">Type</label>
                        <select
                          value={f.type}
                          onChange={(e) => updateCustomField(f.id, "type", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
                        >
                          {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>

                      {f.type === "select" && (
                        <div className="col-span-3">
                          <label className="block text-xs text-gray-500 mb-1">Options (comma-separated)</label>
                          <input
                            type="text"
                            value={f.options || ""}
                            onChange={(e) => updateCustomField(f.id, "options", e.target.value)}
                            placeholder="opt1, opt2, opt3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                          />
                        </div>
                      )}

                      <div className={`${f.type === "select" ? "col-span-1" : "col-span-3"} flex items-end gap-3 pt-5`}>
                        {f.type !== "select" && (
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={f.required}
                              onChange={(e) => updateCustomField(f.id, "required", e.target.checked)}
                              className="w-4 h-4 accent-indigo-600"
                            />
                            <span className="text-xs text-gray-600">Required</span>
                          </label>
                        )}
                        <button onClick={() => removeCustomField(f.id)} className="text-red-400 hover:text-red-600 transition-colors ml-auto">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save */}
            <div className="flex items-center justify-end space-x-3">
              {fieldsSaved && <span className="text-green-600 text-sm font-medium">✅ Saved successfully</span>}
              <button
                onClick={saveFields}
                disabled={savingFields}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold shadow hover:shadow-lg transition-all disabled:opacity-60 text-sm"
              >
                {savingFields ? "Saving..." : "Save Field Configuration"}
              </button>
            </div>
          </div>
        )}
      </main>

      {showDrugModal && <DrugModal fields={allFields} onClose={() => setShowDrugModal(false)} />}
      {showBulkModal && <BulkUploadModal customFields={customFields} onClose={() => setShowBulkModal(false)} />}
    </div>
  );
}

function DrugModal({ fields, onClose }) {
  const [formData, setFormData] = useState({});

  const handleChange = (id, value) => setFormData((p) => ({ ...p, [id]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const basePayload = {
      drugName: formData.drug_name,
      brandName: formData.brand_name,
      genericName: formData.generic_name,
      drugClass: formData.drug_class,
      specialization: formData.specialization ? [formData.specialization] : [],
      indications: formData.indications,
      mechanismOfAction: formData.mechanism_of_action,
      dosage: formData.dosage,
      sideEffects: formData.side_effects,
      contraindications: formData.contraindications,
      drugInteractions: formData.drug_interactions,
      launchDate: formData.launch_date,
    };
    const customFields = {};
    fields.filter((f) => !f.locked).forEach((f) => {
      if (formData[f.id] !== undefined) customFields[f.id] = formData[f.id];
    });
    if (Object.keys(customFields).length) basePayload.customFields = customFields;

    try {
      await fetch("/api/v1/drugs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(basePayload),
      });
      onClose();
    } catch {}
  };

  const renderField = (f) => {
    const base = "w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm outline-none";
    switch (f.type) {
      case "textarea":
        return <textarea className={base} rows={3} placeholder={`Enter ${f.name.toLowerCase()}...`} value={formData[f.id] || ""} onChange={(e) => handleChange(f.id, e.target.value)} />;
      case "select":
        return (
          <select className={`${base} bg-white`} value={formData[f.id] || ""} onChange={(e) => handleChange(f.id, e.target.value)}>
            <option value="">Select {f.name.toLowerCase()}</option>
            {(Array.isArray(f.options) ? f.options : (f.options || "").split(",").map((o) => o.trim()).filter(Boolean)).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        );
      case "date":
        return <input type="date" className={base} value={formData[f.id] || ""} onChange={(e) => handleChange(f.id, e.target.value)} />;
      case "number":
        return <input type="number" className={base} placeholder={`Enter ${f.name.toLowerCase()}...`} value={formData[f.id] || ""} onChange={(e) => handleChange(f.id, e.target.value)} />;
      case "url":
        return <input type="url" className={base} placeholder="https://..." value={formData[f.id] || ""} onChange={(e) => handleChange(f.id, e.target.value)} />;
      case "file":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-indigo-400 transition-colors cursor-pointer">
            <p className="text-sm text-gray-500"><span className="text-indigo-600 font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">PDF only (max 10MB)</p>
          </div>
        );
      default:
        return <input type="text" className={base} placeholder={`Enter ${f.name.toLowerCase()}...`} value={formData[f.id] || ""} onChange={(e) => handleChange(f.id, e.target.value)} />;
    }
  };

  const customFieldsList = fields.filter((f) => !f.locked);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-5 rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">💊</span>
            <h2 className="text-xl font-bold text-white">Add New Drug</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Standard fields */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Standard Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.filter((f) => f.locked).map((f) => (
                <div key={f.id} className={f.type === "textarea" || f.type === "file" ? "md:col-span-2" : ""}>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {f.name} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  {renderField(f)}
                </div>
              ))}
            </div>
          </div>

          {/* Custom fields */}
          {customFieldsList.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center space-x-2">
                <span>Custom Fields</span>
                <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">{customFieldsList.length}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                {customFieldsList.map((f) => (
                  <div key={f.id} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {f.name || f.id} {f.required && <span className="text-red-500">*</span>}
                      <span className="ml-1 text-indigo-400 font-normal">(custom)</span>
                    </label>
                    {renderField(f)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm">Cancel</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2.5 rounded-xl font-bold hover:shadow-lg transition-all text-sm">Add Drug</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BulkUploadModal({ customFields, onClose }) {
  const allColumns = [
    "drug_name","brand_name","generic_name","drug_class","specialization",
    "indications","mechanism_of_action","dosage","side_effects",
    "contraindications","drug_interactions","launch_date",
    ...customFields.map((f) => f.id),
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">📊</span>
            <h2 className="text-xl font-bold text-white">Bulk Upload Drugs</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4 flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm text-yellow-800">Upload the Excel file only. Upload brochure PDFs individually from the drug cards after import.</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center space-x-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
              <span>Upload Excel File</span>
            </h3>
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <p className="text-sm text-gray-600"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">XLSX only (max 5MB)</p>
            </div>
            <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all flex items-center space-x-2">
              <span>📥</span><span>Download Template</span>
            </button>
          </div>

          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center space-x-2">
              <span className="text-lg">📋</span>
              <span>Excel Columns</span>
              {customFields.length > 0 && <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">+{customFields.length} custom</span>}
            </h3>
            <div className="grid grid-cols-2 gap-1.5 text-sm">
              {allColumns.map((col) => {
                const isCustom = customFields.some((f) => f.id === col);
                return (
                  <div key={col} className="flex items-center space-x-2">
                    <span className={isCustom ? "text-indigo-500" : "text-green-500"}>✓</span>
                    <span className={`font-medium ${isCustom ? "text-indigo-700" : "text-green-800"}`}>{col}</span>
                    {isCustom && <span className="text-xs text-indigo-400">(custom)</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm">Cancel</button>
            <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl font-bold hover:shadow-lg transition-all text-sm">Upload & Import</button>
          </div>
        </div>
      </div>
    </div>
  );
}
