"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MRSidebar from "@/components/mr/MRSidebar";
import NotificationBell from "@/components/NotificationBell";
import Link from "next/link";
import { get } from "@/lib/api";

const getVal = (drug, key) => { const v = drug?.field_values?.find((f) => f.key === key)?.value; if (Array.isArray(v)) return v.join(", "); return v || ""; };

export default function MRDrugSearch() {
  const [search, setSearch] = useState("");
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("az");
  const pageSize = 6;

  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "MR" : "MR";

  const { data, isLoading } = useQuery({
    queryKey: ["drugs-public"],
    queryFn: () => get("/api/v1/drugs?limit=200").then((d) => d.drugs || []),
    staleTime: 5 * 60 * 1000,
  });

  const drugs = data || [];
  const filtered = drugs.filter((drug) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const dn = (drug.drug_name || getVal(drug, "drug_name") || "").toLowerCase();
    const bn = (drug.brand_name || getVal(drug, "brand_name") || "").toLowerCase();
    const allText = drug.field_values?.map((fv) => Array.isArray(fv.value) ? fv.value.join(" ") : (fv.value || "")).join(" ").toLowerCase() || "";
    return dn.includes(q) || bn.includes(q) || allText.includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    const na = (a.drug_name || getVal(a, "drug_name") || "").toLowerCase();
    const nb = (b.drug_name || getVal(b, "drug_name") || "").toLowerCase();
    return sortBy === "az" ? na.localeCompare(nb) : nb.localeCompare(na);
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const getDrugName = (drug) => drug.drug_name || getVal(drug, "drug_name") || drug.brand_name || getVal(drug, "brand_name") || "Drug";
  const getBrandName = (drug) => drug.brand_name || getVal(drug, "brand_name") || "";
  const getForm = (drug) => getVal(drug, "form") || getVal(drug, "dosage_form") || drug.dosage_form || "Tablet";
  const getStrength = (drug) => getVal(drug, "dosage_strength") || getVal(drug, "strength") || "";
  const getManufacturer = (drug) => getVal(drug, "manufacturer") || drug.manufacturer || "";
  const getTherapyArea = (drug) => drug.specialization || getVal(drug, "specialization") || getVal(drug, "therapy_area") || "";
  const getDescription = (drug) => getVal(drug, "description") || getVal(drug, "mechanism_of_action") || "";
  const getIndications = (drug) => { const v = getVal(drug, "indications"); return v ? (typeof v === "string" ? v.split(",").map(s => s.trim()) : [v]) : []; };
  const getDosage = (drug) => getVal(drug, "dosage") || getVal(drug, "dosage_strength") || "";
  const getStorage = (drug) => getVal(drug, "storage") || "";
  const getBrands = (drug) => { const v = getVal(drug, "common_brands") || getVal(drug, "brands"); return v ? (typeof v === "string" ? v.split(",").map(s => s.trim()) : []) : []; };

  const popularSearches = ["Amlodipine", "Metformin", "Atorvastatin", "Paracetamol"];

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex">
      <MRSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`${sidebarCollapsed ? "md:ml-[60px]" : "md:ml-[220px]"} flex-1 min-h-screen transition-all duration-300`}>
        {/* Top Bar */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100/80 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(true)} className="md:hidden w-9 h-9 rounded-lg bg-gray-100 hover:bg-purple-50 flex items-center justify-center text-gray-600 hover:text-purple-600 transition-all mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
            <span className="font-medium">Visakhapatnam, AP</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell accentColor="indigo" />
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{userName.charAt(0).toUpperCase()}</div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{userName.split(" ")[0]} {userName.split(" ")[1]?.charAt(0) || ""}.</p>
                <p className="text-[10px] text-gray-400">MR - Field Executive</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 md:px-6 py-4 md:py-5">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-xl font-extrabold text-gray-900">Drug Search</h1>
            <p className="text-xs text-gray-400 mt-0.5">Search, explore and get detailed drug information</p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
            <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" /> Search Drugs</p>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); setSelectedDrug(null); }}
                  placeholder="Search by drug name, brand, composition or therapy..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 placeholder:text-gray-400" />
              </div>
              <button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-3 rounded-lg text-sm font-bold transition-all">Search</button>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-gray-400">Popular searches:</span>
              {popularSearches.map(s => (
                <button key={s} onClick={() => { setSearch(s); setPage(1); setSelectedDrug(null); }} className="text-indigo-600 font-medium hover:text-indigo-700">{s}</button>
              ))}
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-700 font-semibold">Showing {sorted.length} results</p>
            <div className="flex items-center gap-2">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none">
                <option value="az">Sort by: A - Z</option>
                <option value="za">Sort by: Z - A</option>
              </select>
              <button className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filter
              </button>
            </div>
          </div>

          {/* Main Content: Drug List + Detail Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Drug List */}
            <div className="lg:col-span-5">
              {isLoading ? (
                <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white rounded-lg border border-gray-100 animate-pulse" />)}</div>
              ) : paginated.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                  <span className="text-3xl block mb-2">💊</span>
                  <p className="text-sm font-bold text-gray-700">No drugs found</p>
                  <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {paginated.map((drug) => {
                    const name = getDrugName(drug);
                    const brand = getBrandName(drug);
                    const form = getForm(drug);
                    const isSelected = selectedDrug?._id === drug._id;
                    return (
                      <button key={drug._id} onClick={() => setSelectedDrug(drug)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isSelected ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100 hover:border-indigo-200 hover:bg-gray-50"}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"}`}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-gray-900 capitalize truncate">{name}</p>
                          {brand && name.toLowerCase() !== brand.toLowerCase() && <p className="text-[11px] text-indigo-500 capitalize">{brand}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] text-gray-400">{form}</p>
                        </div>
                        <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {sorted.length > pageSize && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-[10px] text-gray-400">{(page-1)*pageSize + 1} – {Math.min(page*pageSize, sorted.length)} of {sorted.length} results</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(Math.max(1, page-1))} disabled={page === 1} className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-md text-[10px] font-bold ${p === page ? "bg-indigo-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{p}</button>
                    ))}
                    <button onClick={() => setPage(Math.min(totalPages, page+1))} disabled={page === totalPages} className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drug Detail Panel */}
            <div className="lg:col-span-7">
              {selectedDrug ? (() => {
                const name = getDrugName(selectedDrug);
                const brand = getBrandName(selectedDrug);
                const form = getForm(selectedDrug);
                const strength = getStrength(selectedDrug);
                const manufacturer = getManufacturer(selectedDrug);
                const therapyArea = getTherapyArea(selectedDrug);
                const description = getDescription(selectedDrug);
                const indications = getIndications(selectedDrug);
                const dosage = getDosage(selectedDrug);
                const storage = getStorage(selectedDrug);
                const brands = getBrands(selectedDrug);

                return (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
                    {/* Drug Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <h2 className="text-xl font-extrabold text-gray-900 capitalize">{name}</h2>
                        {brand && name.toLowerCase() !== brand.toLowerCase() && <p className="text-sm text-indigo-500 font-semibold capitalize mt-0.5">{brand}</p>}
                      </div>
                      <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-[10px] font-bold border border-purple-100">Prescription Only</span>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                      <div className="border border-gray-100 rounded-lg p-3">
                        <p className="text-[9px] text-gray-400 mb-0.5">Form</p>
                        <p className="text-[12px] font-bold text-gray-900">{form || "—"}</p>
                      </div>
                      <div className="border border-gray-100 rounded-lg p-3">
                        <p className="text-[9px] text-gray-400 mb-0.5">Strength</p>
                        <p className="text-[12px] font-bold text-gray-900">{strength || "—"}</p>
                      </div>
                      <div className="border border-gray-100 rounded-lg p-3">
                        <p className="text-[9px] text-gray-400 mb-0.5">Manufacturer</p>
                        <p className="text-[12px] font-bold text-gray-900">{manufacturer || "—"}</p>
                      </div>
                      <div className="border border-gray-100 rounded-lg p-3">
                        <p className="text-[9px] text-gray-400 mb-0.5">Therapy Area</p>
                        <p className="text-[12px] font-bold text-gray-900">{therapyArea || "—"}</p>
                      </div>
                    </div>

                    {/* Description + Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                      <div>
                        {description && (
                          <div className="mb-4">
                            <p className="text-[11px] font-bold text-gray-700 mb-1.5">Description</p>
                            <p className="text-[11px] text-gray-500 leading-relaxed">{description}</p>
                          </div>
                        )}
                        {indications.length > 0 && (
                          <div>
                            <p className="text-[11px] font-bold text-gray-700 mb-1.5">Indications</p>
                            <div className="space-y-1">
                              {indications.map((ind, i) => (
                                <div key={i} className="flex items-start gap-1.5">
                                  <span className="text-green-500 text-[10px] mt-0.5">✓</span>
                                  <span className="text-[11px] text-gray-500">{ind}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        {brands.length > 0 && (
                          <div className="mb-4">
                            <p className="text-[11px] font-bold text-gray-700 mb-1.5">Common Brands</p>
                            <div className="flex flex-wrap gap-1.5">
                              {brands.map((b, i) => (
                                <span key={i} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">{b}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {dosage && (
                          <div className="mb-4">
                            <p className="text-[11px] font-bold text-gray-700 mb-1.5">Dosage</p>
                            <p className="text-[11px] text-gray-500">{dosage}</p>
                          </div>
                        )}
                        {storage && (
                          <div>
                            <p className="text-[11px] font-bold text-gray-700 mb-1.5">Storage</p>
                            <p className="text-[11px] text-gray-500">{storage}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Full Details Link */}
                    <Link href={`/drug-details/${selectedDrug._id}`} className="block w-full text-center py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
                      View Full Details ↗
                    </Link>
                  </div>
                );
              })() : (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center sticky top-20">
                  <span className="text-4xl block mb-3">💊</span>
                  <p className="text-sm font-bold text-gray-700">Select a drug to view details</p>
                  <p className="text-xs text-gray-400 mt-1">Click on any drug from the list to see complete information</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
