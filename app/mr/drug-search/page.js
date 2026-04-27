"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { get } from "@/lib/api";
import SmartSearch from "@/components/SmartSearch";

const getVal = (drug, key) => { const v = drug?.field_values?.find((f) => f.key === key)?.value; if (Array.isArray(v)) return v.join(", "); return v || ""; };

export default function MRDrugSearch() {
  const [search, setSearch]           = useState("");
  const [viewMode, setViewMode]       = useState("grid");
  const [smartSearch, setSmartSearch] = useState({ mode: "keyword", chips: [], query: "" });
  const [smartResults, setSmartResults] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["drugs-public"],
    queryFn:  () => get("/api/v1/drugs?limit=200").then((d) => d.drugs || []),
    staleTime: 5 * 60 * 1000,
  });

  const drugs   = data || [];
  const filtered = drugs.filter((drug) => {
    if (smartSearch.mode === "keyword" && smartSearch.chips.length > 0) {
      const allText = drug.field_values?.map((fv) => Array.isArray(fv.value) ? fv.value.join(" ") : (fv.value || "")).join(" ").toLowerCase() || "";
      if (!smartSearch.chips.some((chip) => allText.includes(chip))) return false;
    }
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return drug.field_values?.some((fv) => { const v = Array.isArray(fv.value) ? fv.value.join(" ") : (fv.value || ""); return v.toLowerCase().includes(q); });
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-x-hidden">
      <MRNavbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <Breadcrumb />

        <div className="mb-4 sm:mb-6 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-4 sm:p-6 shadow-lg text-white">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">💊 Drug Database</h1>
          <p className="text-orange-100 text-xs sm:text-sm">Comprehensive medication library for medical representatives</p>
        </div>

        <SmartSearch
          onSearch={(s) => { setSmartSearch(s); if (s.mode === "keyword") setSmartResults(null); }}
          onSmartResults={setSmartResults}
          accentColor="orange" />

        <div className="bg-white rounded-2xl p-4 shadow-lg border border-orange-100 mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <input type="text" placeholder="🔍 Search by drug name, indication, manufacturer..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm transition-all" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 text-sm">✕</button>}
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setViewMode("grid")} className={`px-3 py-2 rounded-lg text-sm ${viewMode === "grid" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500"}`}>⊞</button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-2 rounded-lg text-sm ${viewMode === "list" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500"}`}>☰</button>
          </div>
        </div>

        <p className="text-sm text-gray-500 font-semibold mb-4">
          {smartResults ? (
            <>Showing <span className="font-bold text-purple-600">{smartResults.total_results}</span> AI results</>
          ) : (
            <>Showing <span className="font-bold">{filtered.length}</span> drugs</>
          )}
        </p>

        {isLoading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading drugs...</div>
        ) : isError ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
            <span className="text-5xl">⚠️</span>
            <p className="text-gray-500 mt-4 text-sm">Could not load drugs.</p>
          </div>
        ) : (() => {
          const displayDrugs = smartResults ? smartResults.results : filtered;
          if (displayDrugs.length === 0) return (
            <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
              <span className="text-5xl">💊</span>
              <p className="text-gray-500 mt-4 text-sm">No drugs found.</p>
            </div>
          );
          return viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayDrugs.map((drug) => (
                <DrugCard key={drug._id} drug={drug}
                  matchScore={drug.match_score}
                  matchedEntities={drug.matched_entities} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {displayDrugs.map((drug) => <DrugListRow key={drug._id} drug={drug} />)}
            </div>
          );
        })()}
      </main>
    </div>
  );
}

function DrugCard({ drug, matchScore, matchedEntities }) {
  const name           = drug.brand_name || getVal(drug, "brand_name") || drug.drug_name || getVal(drug, "drug_name") || "Drug";
  const genericName    = drug.drug_name  || getVal(drug, "drug_name");
  const drugClass      = drug.drug_class || getVal(drug, "drug_class");
  const manufacturer   = drug.manufacturer || getVal(drug, "manufacturer");
  const indications    = Array.isArray(drug.indications) ? drug.indications.join(", ") : (drug.indications || getVal(drug, "indications"));
  const dosage         = drug.dosage_strength || getVal(drug, "dosage_strength") || getVal(drug, "dosage");
  const specialization = drug.specialization || getVal(drug, "specialization");

  return (
    <Link href={`/drug-details/${drug._id}`}>
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all cursor-pointer group overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow flex-shrink-0">
                {name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate capitalize">{name}</h3>
                {genericName && name !== genericName && <p className="text-xs text-gray-400 capitalize">{genericName}</p>}
              </div>
            </div>
            {specialization && (
              <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-xs font-semibold border border-orange-100 flex-shrink-0 ml-2">{specialization}</span>
            )}
          </div>
          <div className="space-y-1.5 mb-4">
            {[
              { label: "Drug Class",   value: drugClass },
              { label: "Manufacturer", value: manufacturer },
              { label: "Indications",  value: indications },
              { label: "Dosage",       value: dosage },
            ].filter((r) => r.value).map((row) => (
              <div key={row.label} className="flex items-start justify-between text-xs gap-2">
                <span className="text-gray-400 font-medium flex-shrink-0">{row.label}</span>
                <span className="text-gray-800 font-semibold text-right line-clamp-1">{row.value}</span>
              </div>
            ))}
          </div>
          <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 rounded-xl font-bold text-sm group-hover:shadow-lg transition-all">
            View Details →
          </button>
          {matchScore !== undefined && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-400">Match: <span className="font-bold text-orange-600">{matchScore.toFixed(0)}%</span></span>
              <div className="flex gap-1 flex-wrap justify-end">
                {matchedEntities?.symptoms?.map((s) => <span key={s} className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">{s}</span>)}
                {matchedEntities?.indications?.map((i) => <span key={i} className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{i}</span>)}
              </div>
            </div>
          )}
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
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 capitalize truncate">{name}</h3>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-0.5">
                {indications  && <span>{indications}</span>}
                {manufacturer && <span>· {manufacturer}</span>}
                {dosage       && <span>· {dosage}</span>}
              </div>
            </div>
          </div>
          <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs ml-4">View →</button>
        </div>
      </div>
    </Link>
  );
}
