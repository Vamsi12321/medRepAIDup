"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { get } from "@/lib/api";
import SmartSearch from "@/components/SmartSearch";
import PDFSummaryModal from "@/components/PDFSummaryModal";

const formatKey = (key) => key?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";
const getVal = (drug, key) => { const v = drug?.field_values?.find((f) => f.key === key)?.value; if (Array.isArray(v)) return v.join(", "); return v || ""; };

export default function DoctorDrugSearch() {
  const [search, setSearch]         = useState("");
  const [viewMode, setViewMode]     = useState("grid");
  const [smartSearch, setSmartSearch] = useState({ mode: "keyword", chips: [], query: "" });
  const [smartResults, setSmartResults] = useState(null);
  const [showPDF, setShowPDF] = useState(false);

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
    // Drug name filter — check drug_name and brand_name fields specifically
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const drugName  = (drug.drug_name  || getVal(drug, "drug_name")  || "").toLowerCase();
    const brandName = (drug.brand_name || getVal(drug, "brand_name") || "").toLowerCase();
    // Also fall back to searching all field_values so partial matches still work
    const allText = drug.field_values?.map((fv) => Array.isArray(fv.value) ? fv.value.join(" ") : (fv.value || "")).join(" ").toLowerCase() || "";
    return drugName.includes(q) || brandName.includes(q) || allText.includes(q);
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

        {/* Smart Search — main highlighted feature */}
        <SmartSearch
          onSearch={(s) => { setSmartSearch(s); if (s.mode === "keyword") setSmartResults(null); }}
          onSmartResults={setSmartResults}
          onAnalyzeReport={() => setShowPDF(true)}
          accentColor="indigo" />

        {/* Results bar — count left, compact name search + view toggle right */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <p className="text-sm text-gray-500 font-semibold flex-shrink-0">
            {smartResults ? (
              <><span className="font-bold text-purple-600">{smartResults.total_results}</span> AI results</>
            ) : (
              <><span className="font-bold text-indigo-600">{filtered.length}</span> drugs found</>
            )}
          </p>
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Compact drug name search */}
            <div className="relative max-w-xs w-full">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by drug name..."
                className="w-full pl-8 pr-7 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white transition-all" />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            {/* View toggle */}
            <button onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:bg-gray-100"}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/></svg>
            </button>
            <button onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:bg-gray-100"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading drugs...</div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
            <span className="text-5xl">⚠️</span>
            <p className="text-gray-500 mt-4 text-sm font-medium">Could not load drugs. Check your connection.</p>
          </div>
        ) : (() => {
          // Always apply name filter on top of whatever source (smart results or full list)
          const baseList = smartResults ? smartResults.results : filtered;
          const displayDrugs = search.trim()
            ? baseList.filter((drug) => {
                const q = search.toLowerCase();
                const dn = (drug.drug_name  || getVal(drug, "drug_name")  || "").toLowerCase();
                const bn = (drug.brand_name || getVal(drug, "brand_name") || "").toLowerCase();
                return dn.includes(q) || bn.includes(q);
              })
            : baseList;
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
      {showPDF && <PDFSummaryModal onClose={() => setShowPDF(false)} accentColor="indigo" />}
    </div>
  );
}

function DrugCard({ drug, matchScore, matchedEntities }) {
  // Smart search results have flat fields; regular drugs use field_values
  const name         = drug.drug_name   || getVal(drug, "drug_name")   || drug.brand_name || getVal(drug, "brand_name") || "Drug";
  const brandName    = drug.brand_name  || getVal(drug, "brand_name");
  const specialization = drug.specialization || getVal(drug, "specialization");

  // Build facts dynamically from field_values (skip name/brand shown in header)
  const skipKeys = ["drug_name", "brand_name", "specialization"];
  const facts = [];
  if (drug.field_values?.length > 0) {
    drug.field_values.forEach((fv) => {
      if (skipKeys.includes(fv.key)) return;
      if (!fv.value || (Array.isArray(fv.value) && fv.value.length === 0)) return;
      if (fv.type === "textarea" || fv.type === "url") return;
      const val = Array.isArray(fv.value) ? fv.value.join(", ") : String(fv.value);
      if (val.length > 80) return;
      facts.push({ label: fv.key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), value: val });
    });
  } else {
    ["drug_class","manufacturer","indications","dosage_strength"].forEach((k) => {
      const v = drug[k];
      if (!v) return;
      const val = Array.isArray(v) ? v.join(", ") : String(v);
      facts.push({ label: k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), value: val });
    });
  }
  // Add pricing from drug.packaging
  const pkgPrice = drug.packaging?.selling_price ?? drug.packaging?.pricing?.selling_price;
  if (pkgPrice != null) {
    facts.push({ label: `Price/${drug.packaging.sales_unit || "Pack"}`, value: `₹${pkgPrice}` });
  }

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
                {brandName && name !== brandName && <p className="text-xs text-indigo-400 font-semibold capitalize">{brandName}</p>}
              </div>
            </div>
            {specialization && (
              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-xs font-semibold border border-indigo-100 flex-shrink-0 ml-2">{specialization}</span>
            )}
          </div>

          <div className="space-y-1.5 mb-4">
            {facts.slice(0, 5).map((row) => (
              <div key={row.label} className="flex items-start justify-between text-xs gap-2">
                <span className="text-gray-400 font-medium flex-shrink-0">{row.label}</span>
                <span className="text-gray-800 font-semibold text-right line-clamp-1">{row.value}</span>
              </div>
            ))}
          </div>

          <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl font-bold text-sm group-hover:shadow-lg transition-all">
            View Details →
          </button>
          {matchScore !== undefined && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-400">Match score: <span className="font-bold text-indigo-600">{matchScore.toFixed(0)}%</span></span>
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
  const name         = getVal(drug, "drug_name") || getVal(drug, "brand_name") || "Drug";
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
