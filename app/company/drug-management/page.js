"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";

export default function CompanyDrugManagement() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Static data based on your drug document structure
  const [drugs, setDrugs] = useState([
    {
      _id: "drug123",
      drug_name: "Tirzepatide",
      brand_name: "Mounjaro",
      generic_name: "Tirzepatide",
      drug_class: "GLP-1 receptor agonist",
      company_id: "company001",
      specialization: ["diabetology"],
      indications: "Treatment of type 2 diabetes",
      mechanism_of_action: "Dual GIP and GLP-1 receptor agonist",
      dosage: "5 mg once weekly",
      side_effects: ["nausea", "vomiting"],
      contraindications: "Thyroid carcinoma",
      drug_interactions: "May interact with insulin",
      launch_date: "2024-01-10",
      brochure_url: "https://storage.googleapis.com/drug-files/mounjaro.pdf",
      created_at: "2026-03-10",
      status: "Active"
    },
    {
      _id: "drug124",
      drug_name: "Metformin",
      brand_name: "Glycomet",
      generic_name: "Metformin HCl",
      drug_class: "Biguanide",
      company_id: "company001",
      specialization: ["diabetology"],
      indications: "Type 2 diabetes mellitus",
      mechanism_of_action: "Decreases hepatic glucose production and improves insulin sensitivity",
      dosage: "500 mg twice daily",
      side_effects: ["diarrhea", "nausea", "metallic taste", "abdominal discomfort"],
      contraindications: "Severe kidney disease, metabolic acidosis, diabetic ketoacidosis",
      drug_interactions: "Alcohol, contrast agents, cimetidine",
      launch_date: "2023-08-15",
      brochure_url: null, // Missing brochure
      created_at: "2026-02-15",
      status: "Active"
    },
    {
      _id: "drug125",
      drug_name: "Atorvastatin",
      brand_name: "Lipitor",
      generic_name: "Atorvastatin Calcium",
      drug_class: "HMG-CoA reductase inhibitor",
      company_id: "company001",
      specialization: ["cardiology"],
      indications: "Hypercholesterolemia, cardiovascular disease prevention",
      mechanism_of_action: "Inhibits cholesterol synthesis by blocking HMG-CoA reductase enzyme",
      dosage: "20 mg once daily",
      side_effects: ["muscle pain", "liver enzyme elevation", "headache", "digestive issues"],
      contraindications: "Active liver disease, pregnancy, breastfeeding",
      drug_interactions: "Warfarin, digoxin, cyclosporine, gemfibrozil",
      launch_date: "2024-03-20",
      brochure_url: "https://storage.googleapis.com/drug-files/lipitor.pdf",
      created_at: "2026-01-20",
      status: "Active"
    }
  ]);

  const filteredDrugs = drugs.filter(drug => {
    if (activeTab === "all") return true;
    if (activeTab === "with-brochure") return drug.brochure_url;
    if (activeTab === "missing-brochure") return !drug.brochure_url;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 overflow-x-hidden">
      <CompanyNavbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Drug Management</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage your pharmaceutical products and documentation</p>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={() => setShowBulkModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <span>📊</span>
              <span>Bulk Upload</span>
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <span>➕</span>
              <span>Add Drug</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">💊</span>
              </div>
            </div>
            <p className="text-gray-600 mb-1 font-semibold text-base">Total Drugs</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{drugs.length}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <p className="text-gray-600 mb-1 font-semibold text-base">With Brochures</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {drugs.filter(d => d.brochure_url).length}
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">❌</span>
              </div>
            </div>
            <p className="text-gray-600 mb-1 font-semibold text-base">Missing Brochures</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              {drugs.filter(d => !d.brochure_url).length}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-3 mb-8 bg-white rounded-xl p-2 shadow-lg border border-gray-100">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 px-5 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === "all"
                ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-base">📋</span>
            <span className="text-base">All Drugs ({drugs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("with-brochure")}
            className={`flex-1 px-5 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === "with-brochure"
                ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-base">✅</span>
            <span className="text-base">With Brochures ({drugs.filter(d => d.brochure_url).length})</span>
          </button>
          <button
            onClick={() => setActiveTab("missing-brochure")}
            className={`flex-1 px-5 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === "missing-brochure"
                ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-base">❌</span>
            <span className="text-base">Missing Brochures ({drugs.filter(d => !d.brochure_url).length})</span>
          </button>
        </div>

        {/* Drugs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrugs.map((drug) => (
            <div key={drug._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold">
                  {drug.specialization[0]}
                </span>
                <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  drug.brochure_url 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {drug.brochure_url ? '✅ Brochure' : '❌ Missing'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{drug.brand_name}</h3>
              <p className="text-gray-600 mb-1 text-base font-semibold">{drug.drug_name}</p>
              <p className="text-gray-500 mb-3 text-sm">{drug.drug_class}</p>
              
              <div className="space-y-2 mb-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border-l-4 border-indigo-500">
                  <p className="text-sm text-indigo-600 font-semibold mb-1">💊 Dosage</p>
                  <p className="text-sm font-bold text-gray-800">{drug.dosage}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-l-4 border-green-500">
                  <p className="text-sm text-green-600 font-semibold mb-1">🎯 Indication</p>
                  <p className="text-sm font-bold text-gray-800">{drug.indications}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border-l-4 border-blue-500">
                  <p className="text-sm text-blue-600 font-semibold mb-1">⚙️ Mechanism</p>
                  <p className="text-sm font-bold text-gray-800">{drug.mechanism_of_action}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border-l-4 border-yellow-500">
                  <p className="text-sm text-yellow-600 font-semibold mb-1">⚠️ Side Effects</p>
                  <p className="text-sm font-bold text-gray-800">{drug.side_effects.join(", ")}</p>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3 border-l-4 border-red-500">
                  <p className="text-sm text-red-600 font-semibold mb-1">🚫 Contraindications</p>
                  <p className="text-sm font-bold text-gray-800">{drug.contraindications}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border-l-4 border-purple-500">
                  <p className="text-sm text-purple-600 font-semibold mb-1">🔄 Drug Interactions</p>
                  <p className="text-sm font-bold text-gray-800">{drug.drug_interactions}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border-l-4 border-orange-500">
                  <p className="text-sm text-orange-600 font-semibold mb-1">📅 Launch Date</p>
                  <p className="text-sm font-bold text-gray-800">{new Date(drug.launch_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button className="flex-1 bg-blue-100 text-blue-600 px-4 py-3 rounded-lg font-semibold hover:bg-blue-200 transition-all text-base">
                  Edit
                </button>
                {!drug.brochure_url && (
                  <button className="flex-1 bg-green-100 text-green-600 px-4 py-3 rounded-lg font-semibold hover:bg-green-200 transition-all text-base">
                    Upload PDF
                  </button>
                )}
                {drug.brochure_url && (
                  <button className="flex-1 bg-purple-100 text-purple-600 px-4 py-3 rounded-lg font-semibold hover:bg-purple-200 transition-all text-base">
                    View PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && <DrugModal setShowModal={setShowModal} />}
      {showBulkModal && <BulkUploadModal setShowBulkModal={setShowBulkModal} />}
    </div>
  );
}

function DrugModal({ setShowModal }) {
  // This would normally fetch the company's custom form configuration from the admin settings
  const [formConfig] = useState({
    fields: [
      { id: "drug_name", name: "Drug Name", type: "text", required: true },
      { id: "brand_name", name: "Brand Name", type: "text", required: true },
      { id: "generic_name", name: "Generic Name", type: "text", required: false },
      { id: "drug_class", name: "Drug Class", type: "text", required: false },
      { id: "specialization", name: "Specialization", type: "select", required: true, options: ["diabetology", "cardiology", "neurology", "oncology"] },
      { id: "indications", name: "Indications", type: "textarea", required: true },
      { id: "mechanism_of_action", name: "Mechanism of Action", type: "textarea", required: true },
      { id: "dosage", name: "Dosage", type: "text", required: true },
      { id: "side_effects", name: "Side Effects", type: "textarea", required: false },
      { id: "contraindications", name: "Contraindications", type: "textarea", required: false },
      { id: "drug_interactions", name: "Drug Interactions", type: "textarea", required: false },
      { id: "launch_date", name: "Launch Date", type: "date", required: true },
      { id: "brochure_url", name: "Brochure PDF", type: "file", required: false },
    ]
  });

  const renderField = (field) => {
    const baseClasses = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea 
            className={baseClasses} 
            rows="3" 
            placeholder={`Enter ${field.name.toLowerCase()}...`}
          />
        );
      case 'select':
        return (
          <select className={baseClasses}>
            <option value="">Select {field.name.toLowerCase()}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'date':
        return <input type="date" className={baseClasses} />;
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold text-blue-600 hover:text-blue-500 cursor-pointer">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF files only (MAX. 10MB)</p>
          </div>
        );
      default:
        return (
          <input 
            type="text" 
            className={baseClasses} 
            placeholder={`Enter ${field.name.toLowerCase()}...`} 
          />
        );
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">💊</span>
            <h2 className="text-2xl font-bold text-white">Add New Drug</h2>
          </div>
          <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">ℹ️</span>
              <p className="text-sm text-blue-800 font-semibold">
                This form is dynamically configured by your administrator. Fields may vary based on your company's requirements.
              </p>
            </div>
          </div>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formConfig.fields.map((field) => (
                <div key={field.id} className={field.type === 'textarea' || field.type === 'file' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {field.name} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                Add Drug
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function BulkUploadModal({ setShowBulkModal }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">📊</span>
            <h2 className="text-2xl font-bold text-white">Bulk Upload Drugs</h2>
          </div>
          <button onClick={() => setShowBulkModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {/* Important Notice */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 border-l-4 border-yellow-500">
              <div className="flex items-start space-x-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-yellow-900 mb-2 text-lg">Important: Brochure Upload Process</h3>
                  <p className="text-yellow-800 text-sm leading-relaxed">
                    To avoid file naming mismatches, <strong>only upload the Excel file here</strong>. 
                    After drugs are added, you can manually upload brochures for each drug individually 
                    from the drug management page. This ensures accurate file matching.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 1: Excel Upload Only */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                Upload Excel File with Drug Data
              </h3>
              <p className="text-gray-600 mb-4 text-sm">Upload your drugs data in Excel format (.xlsx) - Brochures will be uploaded separately</p>
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10l2-2h10l2 2h10v18H7V21z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21l2-8h30l2 8" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold text-blue-600 hover:text-blue-500 cursor-pointer">Click to upload Excel</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">XLSX files only (MAX. 5MB)</p>
              </div>
              <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all flex items-center space-x-2">
                <span>📥</span>
                <span>Download Excel Template</span>
              </button>
            </div>

            {/* Upload Workflow */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <span className="text-2xl mr-3">🔄</span>
                Upload Workflow
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="font-semibold text-gray-800">Upload Excel with drug information</p>
                    <p className="text-sm text-gray-600">All drug fields except brochure URLs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="font-semibold text-gray-800">System processes and adds drugs to database</p>
                    <p className="text-sm text-gray-600">Drugs will be marked as "Missing Brochure"</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="font-semibold text-gray-800">Go to Drug Management page</p>
                    <p className="text-sm text-gray-600">Filter by "Missing Brochures" to see drugs without PDFs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                  <div>
                    <p className="font-semibold text-gray-800">Upload brochures individually</p>
                    <p className="text-sm text-gray-600">Click "Upload PDF" button on each drug card to add brochure</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Excel Template Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
              <h3 className="font-bold text-green-900 mb-3 text-base flex items-center">
                <span className="mr-2">📋</span>
                Excel Template Columns
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  "drug_name", "brand_name", "generic_name", "drug_class",
                  "specialization", "indications", "mechanism_of_action", "dosage",
                  "side_effects", "contraindications", "drug_interactions", "launch_date"
                ].map((field, index) => (
                  <div key={index} className="flex items-center space-x-2 text-green-800">
                    <span className="text-green-600">✓</span>
                    <span className="font-medium">{field}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-green-700 mt-3 italic">
                Note: brochure_url field will be empty initially and populated when you upload PDFs manually
              </p>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                Upload Excel & Add Drugs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
