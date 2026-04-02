"use client";
import { useState } from "react";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

const allDrugs = [
  { id: 1,  name: "Amlodipine",      indication: "Hypertension",      company: "Generic Pharma",  category: "Cardiovascular",    dosage: "5mg-10mg",       status: "Active" },
  { id: 2,  name: "CardioSafe",      indication: "Hypertension",      company: "XYZ Pharma",      category: "Cardiovascular",    dosage: "10mg",           status: "New" },
  { id: 3,  name: "HeartFlow",       indication: "Arrhythmia",        company: "ABCD Labs",       category: "Cardiovascular",    dosage: "20mg",           status: "New" },
  { id: 4,  name: "BPShield",        indication: "Hypertension",      company: "MediCorp",        category: "Cardiovascular",    dosage: "5mg",            status: "Active" },
  { id: 5,  name: "BetaGuard",       indication: "Heart Failure",     company: "PharmaTech",      category: "Cardiovascular",    dosage: "25mg-50mg",      status: "Active" },
  { id: 6,  name: "Lisinopril",      indication: "Hypertension",      company: "HealthCare Inc",  category: "Cardiovascular",    dosage: "10mg-20mg",      status: "Active" },
  { id: 7,  name: "Metformin",       indication: "Type 2 Diabetes",   company: "DiabCare",        category: "Diabetes",          dosage: "500mg-1000mg",   status: "Active" },
  { id: 8,  name: "Insulin Glargine",indication: "Diabetes",          company: "EndoCorp",        category: "Diabetes",          dosage: "10-80 units",    status: "Active" },
  { id: 9,  name: "Atorvastatin",    indication: "High Cholesterol",  company: "LipidCare",       category: "Cardiovascular",    dosage: "10mg-80mg",      status: "Active" },
  { id: 10, name: "Losartan",        indication: "Hypertension",      company: "CardioMed",       category: "Cardiovascular",    dosage: "25mg-100mg",     status: "Active" },
  { id: 11, name: "Omeprazole",      indication: "GERD",              company: "GastroPharma",    category: "Gastroenterology",  dosage: "20mg-40mg",      status: "Active" },
  { id: 12, name: "Levothyroxine",   indication: "Hypothyroidism",    company: "EndoHealth",      category: "Endocrinology",     dosage: "25mcg-200mcg",   status: "Active" },
  { id: 13, name: "Sertraline",      indication: "Depression",        company: "MindCare",        category: "Psychiatry",        dosage: "50mg-200mg",     status: "Active" },
  { id: 14, name: "Albuterol",       indication: "Asthma",            company: "RespiraTech",     category: "Respiratory",       dosage: "90mcg/spray",    status: "Active" },
  { id: 15, name: "Gabapentin",      indication: "Neuropathic Pain",  company: "NeuroPharma",     category: "Neurology",         dosage: "300mg-600mg",    status: "Active" },
];

export default function DoctorDrugSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode]     = useState("grid");

  const filtered = allDrugs.filter((d) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return d.name.toLowerCase().includes(q) ||
           d.indication.toLowerCase().includes(q) ||
           d.company.toLowerCase().includes(q) ||
           d.category.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 overflow-x-hidden">
      <DoctorNavbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <Breadcrumb />

        <div className="mb-4 sm:mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-4 sm:p-6 shadow-lg text-white">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">💊 Drug Database</h1>
          <p className="text-indigo-100 text-xs sm:text-sm">Comprehensive medication library with detailed information</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-indigo-100 mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <input type="text" placeholder="🔍 Search by drug name, indication, company..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm transition-all" />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 text-sm">✕</button>
            )}
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setViewMode("grid")} className={`px-3 py-2 rounded-lg text-sm transition-all ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}>⊞</button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-2 rounded-lg text-sm transition-all ${viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}>☰</button>
          </div>
        </div>

        <p className="text-sm text-gray-500 font-semibold mb-4">
          Showing <span className="text-indigo-600 font-bold">{filtered.length}</span> drugs
        </p>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((drug) => (
              <Link key={drug.id} href={`/drug-details/${drug.id}`}>
                <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{drug.name}</h3>
                    {drug.status === "New" && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-xs font-bold ml-2">🆕 New</span>}
                  </div>
                  <div className="space-y-1.5 mb-4 text-xs">
                    {[
                      { label: "Indication", value: drug.indication },
                      { label: "Company",    value: drug.company },
                      { label: "Category",   value: drug.category },
                      { label: "Dosage",     value: drug.dosage },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">{row.label}</span>
                        <span className="text-gray-800 font-semibold">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg font-bold text-sm hover:shadow-md transition-all">
                    View Details →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((drug) => (
              <Link key={drug.id} href={`/drug-details/${drug.id}`}>
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600">{drug.name}</h3>
                        {drug.status === "New" && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">🆕 New</span>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        <span><span className="font-medium">Indication:</span> {drug.indication}</span>
                        <span><span className="font-medium">Company:</span> {drug.company}</span>
                        <span><span className="font-medium">Dosage:</span> {drug.dosage}</span>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm ml-4">View →</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
            <span className="text-5xl">💊</span>
            <p className="text-gray-500 mt-4 text-sm">No drugs found. Try different search terms.</p>
          </div>
        )}
      </main>
    </div>
  );
}
