"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { get } from "@/lib/api";
import SmartSearch from "@/components/SmartSearch";

const formatKey = (key) => key?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";
const getVal = (drug, key) => { const v = drug?.field_values?.find((f) => f.key === key)?.value; if (Array.isArray(v)) return v.join(", "); return v || ""; };

export default function DoctorDrugSearch() {
  const [search, setSearch]         = useState("");
  const [viewMode, setViewMode]     = useState("grid");
  const [smartSearch, setSmartSearch] = useState({ mode: "keyword", chips: [], query: "" });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["drugs-public"],
    queryFn:  () => get("/api/v1/drugs?limit=200").then((d) => d.drugs || []),
    staleTime: 5 * 60 * 1000,
  });

  const drugs   = data || [];
  const loading = isLoading;
  const error   = isError;

  const filtered = drugs.filter((drug) => {
    // Smart search — keyword/chip mode
    if (smartSearch.mode === "keyword" && smartSearch.chips.length > 0) {
      const allText = drug.field_values?.map((fv) => Array.isArray(fv.value) ? fv.value.join(" ") : (fv.value || "")).join(" ").toLowerCase() || "";
      const matches = smartSearch.chips.some((chip) => allText.includes(chip));
      if (!matches) return false;
    }
    // Regular text search
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return drug.field_values?.some((fv) => { const v = Array.isArray(fv.value) ? fv.value.join(" ") : (fv.value || ""); return v.toLowerCase().includes(q); });
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

        {/* Smart Search */}
        <SmartSearch onSearch={setSmartSearch} accentColor="indigo" />

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-indigo-100 mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <input type="text" placeholder="🔍 Search by drug name, indication, manufacturer..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm transition-all" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 text-sm">✕</button>
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

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading drugs...</div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
            <span className="text-5xl">⚠️</span>
            <p className="text-gray-500 mt-4 text-sm font-medium">Could not load drugs. Check your connection.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
            <span className="text-5xl">💊</span>
            <p className="text-gray-500 mt-4 text-sm">No drugs found.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((drug) => <DrugCard key={drug._id} drug={drug} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((drug) => <DrugListRow key={drug._id} drug={drug} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function DrugCard({ drug }) {
  const name         = getVal(drug, "brand_name") || getVal(drug, "drug_name") || drug.field_values?.[0]?.value || "Drug";
  const genericName  = getVal(drug, "drug_name");
  const drugClass    = getVal(drug, "drug_class");
  const manufacturer = getVal(drug, "manufacturer");
  const indications  = getVal(drug, "indications");
  const dosage       = getVal(drug, "dosage_strength") || getVal(drug, "dosage");
  const specialization = getVal(drug, "specialization");

  return (
    <Link href={`/drug-details/${drug._id}`}>
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow flex-shrink-0">
                {name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate capitalize">{name}</h3>
                {genericName && name !== genericName && <p className="text-xs text-gray-400 capitalize">{genericName}</p>}
              </div>
            </div>
            {specialization && (
              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-xs font-semibold border border-indigo-100 flex-shrink-0 ml-2">{specialization}</span>
            )}
          </div>

          <div className="space-y-1.5 mb-4">
            {[
              { label: "Drug Class",    value: drugClass },
              { label: "Manufacturer",  value: manufacturer },
              { label: "Indications",   value: indications },
              { label: "Dosage",        value: dosage },
            ].filter((r) => r.value).map((row) => (
              <div key={row.label} className="flex items-start justify-between text-xs gap-2">
                <span className="text-gray-400 font-medium flex-shrink-0">{row.label}</span>
                <span className="text-gray-800 font-semibold text-right line-clamp-1">{row.value}</span>
              </div>
            ))}
          </div>

          <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl font-bold text-sm group-hover:shadow-lg transition-all">
            View Details →
          </button>
        </div>
      </div>
    </Link>
  );
}

function DrugListRow({ drug }) {
  const name         = getVal(drug, "brand_name") || getVal(drug, "drug_name") || "Drug";
  const indications  = getVal(drug, "indications");
  const manufacturer = getVal(drug, "manufacturer");
  const dosage       = getVal(drug, "dosage_strength") || getVal(drug, "dosage");

  return (
    <Link href={`/drug-details/${drug._id}`}>
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all group cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 capitalize truncate">{name}</h3>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-0.5">
                {indications  && <span>{indications}</span>}
                {manufacturer && <span>· {manufacturer}</span>}
                {dosage       && <span>· {dosage}</span>}
              </div>
            </div>
          </div>
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xs ml-4 group-hover:shadow-md transition-all">
            View →
          </button>
        </div>
      </div>
    </Link>
  );
}
