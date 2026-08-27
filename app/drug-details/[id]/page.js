"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import MRSidebar from "@/components/mr/MRSidebar";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import NotificationBell from "@/components/NotificationBell";
import { useParams } from "next/navigation";
import { get, put, post } from "@/lib/api";
import Link from "next/link";

const fmt = (key) => key?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";
const arrStr = (v) => Array.isArray(v) ? v.join(", ") : v || "";

export default function DrugDetails() {
  const { id: drugId } = useParams();
  const queryClient = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showBrochure, setShowBrochure] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isAsking, setIsAsking] = useState(false);
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "User" : "User";
  const userRole = typeof window !== "undefined" ? localStorage.getItem("userRole") || "mr" : "mr";
  const isAdmin = userRole === "company" || userRole === "admin";

  const { data: drug, isLoading } = useQuery({
    queryKey: ["drug", drugId],
    queryFn: () => get(`/api/v1/drugs/${drugId}`),
    enabled: !!drugId,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center"><div className="animate-pulse text-gray-400 text-sm">Loading drug details...</div></div>;
  if (!drug) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center"><p className="text-gray-500 text-sm">Drug not found.</p></div>;

  const d = drug;
  const name = d.drug_name || d.brand_name || "Drug";
  const pkg = d.packaging;
  const backLink = isAdmin ? "/company/drug-management" : "/mr/drug-search";
  const backLabel = isAdmin ? "Drug Management" : "Drug Search";

  // AI assistant handler (MR only)
  const handleAskAI = () => {
    if (!question.trim()) return;
    setChatHistory(p => [...p, { type: "user", text: question }]);
    setIsAsking(true);
    const q = question.toLowerCase();
    const ctx = Object.entries(d).filter(([k,v]) => v && typeof v !== "object" && !["_id","template_id","search_text","created_at","updated_at"].includes(k)).map(([k,v]) => `${fmt(k)}: ${v}`).join(". ");
    setTimeout(() => {
      let answer = "";
      const se = arrStr(d.side_effects); const moa = d.mechanism_of_action || ""; const dos = d.strength || d.adult_dosage || "";
      if (q.includes("side effect")) answer = se ? `Side effects: ${se}` : "No side effects data available.";
      else if (q.includes("mechanism") || q.includes("action")) answer = moa ? `${name} works by: ${moa}` : "Mechanism not available.";
      else if (q.includes("dose") || q.includes("dosage")) answer = dos ? `Dosage: ${dos}` : "Dosage info not available.";
      else if (q.includes("indication")) answer = arrStr(d.indications) || "No indications data.";
      else if (q.includes("contra")) answer = arrStr(d.contraindications) || "No contraindications data.";
      else answer = `Here's what I know about ${name}: ${ctx.slice(0, 500)}`;
      setChatHistory(p => [...p, { type: "ai", text: answer }]);
      setIsAsking(false); setQuestion("");
    }, 1000);
  };

  return (
    <div className={`min-h-screen bg-[#f8f9fc] ${isAdmin ? "" : "flex"}`}>
      {/* Admin: top navbar */}
      {isAdmin && <CompanyNavbar />}
      {/* MR: sidebar */}
      {!isAdmin && <MRSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />}

      <div className={isAdmin ? "max-w-7xl mx-auto" : `${sidebarCollapsed ? "md:ml-[60px]" : "md:ml-[220px]"} flex-1 min-h-screen transition-all duration-300`}>
        {/* Top Bar — MR only */}
        {!isAdmin && (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100/80 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button onClick={() => setMobileOpen(true)} className="md:hidden w-9 h-9 rounded-lg bg-gray-100 hover:bg-purple-50 flex items-center justify-center text-gray-600 hover:text-purple-600 transition-all mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Link href={backLink} className="hover:text-purple-600 transition-colors">{backLabel}</Link>
            <span className="text-gray-300">›</span>
            <span className="font-semibold text-gray-800 capitalize">{name}</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell accentColor="indigo" />
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{userName.charAt(0).toUpperCase()}</div>
              <div className="hidden sm:block"><p className="text-sm font-bold text-gray-800 leading-none">{userName.split(" ")[0]}</p><p className="text-[10px] text-gray-400">MR</p></div>
            </div>
          </div>
        </header>
        )}

        <main className="px-4 md:px-6 py-4 md:py-5">
          {/* Admin breadcrumb */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
              <Link href={backLink} className="hover:text-purple-600 transition-colors font-medium">{backLabel}</Link>
              <span className="text-gray-300">›</span>
              <span className="font-semibold text-gray-800 capitalize">{name}</span>
            </div>
          )}
          {/* Hero Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />
            <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-200 flex-shrink-0">{name.charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 capitalize">{name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {d.brand_name && d.brand_name !== name && <span className="text-sm text-purple-600 font-semibold capitalize">{d.brand_name}</span>}
                  {d.generic_name && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">{d.generic_name}</span>}
                  {d.prescription_type && <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-100">{d.prescription_type}</span>}
                  {d.is_active && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100">Active</span>}
                </div>
                {d.manufacturer && <p className="text-xs text-gray-400 mt-1">Marketed by <strong className="text-gray-600">{d.manufacturer}</strong></p>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {isAdmin && (
                  <button onClick={() => setShowEdit(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit Drug
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => setShowBrochure(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    {d.has_brochure ? "Replace Brochure" : "Upload Brochure"}
                  </button>
                )}
                {d.has_brochure && <BrochureDownloadBtn drugId={drugId} />}
                {!isAdmin && (
                  <button onClick={() => setShowAI(true)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 hover:shadow-lg transition-all flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    Ask AI
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Grid — 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Col 1+2 — Drug Info */}
            <div className="lg:col-span-2 space-y-5">
              {/* Basic Info Grid */}
              <Section title="Drug Information" icon="💊" color="purple">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <InfoField label="Drug Name" value={d.drug_name} />
                  <InfoField label="Brand Name" value={d.brand_name} />
                  <InfoField label="Generic Name" value={d.generic_name} />
                  <InfoField label="Manufacturer" value={d.manufacturer} />
                  <InfoField label="Drug Class" value={d.drug_class} />
                  <InfoField label="Therapeutic Category" value={d.therapeutic_category} />
                  <InfoField label="Dosage Form" value={d.dosage_form} />
                  <InfoField label="Strength" value={d.strength} />
                  <InfoField label="Route" value={d.route} />
                  <InfoField label="Prescription Type" value={d.prescription_type} />
                  <InfoField label="Storage" value={d.storage_conditions} />
                  <InfoField label="Created" value={d.created_at ? new Date(d.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null} />
                </div>
              </Section>

              {/* Composition */}
              {d.composition?.length > 0 && (
                <Section title="Composition" icon="🧪" color="green">
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(d.composition) ? d.composition : [d.composition]).map((c, i) => (
                      <span key={i} className="bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-lg text-xs font-medium">{c}</span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Indications & Symptoms */}
              {(d.indications?.length > 0 || d.symptoms?.length > 0) && (
                <Section title="Indications & Symptoms" icon="🎯" color="blue">
                  {d.indications?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Indications</p>
                      <div className="flex flex-wrap gap-2">{(Array.isArray(d.indications) ? d.indications : [d.indications]).map((v, i) => <span key={i} className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium">{v}</span>)}</div>
                    </div>
                  )}
                  {d.symptoms?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Symptoms</p>
                      <div className="flex flex-wrap gap-2">{(Array.isArray(d.symptoms) ? d.symptoms : [d.symptoms]).map((v, i) => <span key={i} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-lg text-xs font-medium">{v}</span>)}</div>
                    </div>
                  )}
                </Section>
              )}

              {/* Mechanism of Action */}
              {d.mechanism_of_action && (
                <Section title="Mechanism of Action" icon="⚙️" color="purple">
                  <p className="text-sm text-gray-700 leading-relaxed">{d.mechanism_of_action}</p>
                </Section>
              )}

              {/* Side Effects */}
              {d.side_effects?.length > 0 && (
                <Section title="Side Effects" icon="⚠️" color="red">
                  <div className="flex flex-wrap gap-2">{(Array.isArray(d.side_effects) ? d.side_effects : [d.side_effects]).map((v, i) => <span key={i} className="bg-red-50 text-red-700 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-medium">{v}</span>)}</div>
                </Section>
              )}

              {/* Contraindications */}
              {d.contraindications?.length > 0 && (
                <Section title="Contraindications" icon="🚫" color="orange">
                  <div className="flex flex-wrap gap-2">{(Array.isArray(d.contraindications) ? d.contraindications : [d.contraindications]).map((v, i) => <span key={i} className="bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1.5 rounded-lg text-xs font-medium">{v}</span>)}</div>
                </Section>
              )}

              {/* Warnings */}
              {d.warnings_precautions?.length > 0 && (
                <Section title="Warnings & Precautions" icon="🔔" color="amber">
                  <div className="flex flex-wrap gap-2">{(Array.isArray(d.warnings_precautions) ? d.warnings_precautions : [d.warnings_precautions]).map((v, i) => <span key={i} className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-lg text-xs font-medium">{v}</span>)}</div>
                </Section>
              )}

              {/* Drug Interactions */}
              {d.drug_interactions?.length > 0 && (
                <Section title="Drug Interactions" icon="🔄" color="cyan">
                  <div className="flex flex-wrap gap-2">{(Array.isArray(d.drug_interactions) ? d.drug_interactions : [d.drug_interactions]).map((v, i) => <span key={i} className="bg-cyan-50 text-cyan-700 border border-cyan-100 px-3 py-1.5 rounded-lg text-xs font-medium">{v}</span>)}</div>
                </Section>
              )}

              {/* Reference */}
              {d.reference_url && (
                <Section title="Reference" icon="🔗" color="slate">
                  <a href={d.reference_url} target="_blank" rel="noreferrer" className="text-purple-600 hover:text-purple-800 text-sm font-medium underline break-all flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    {d.reference_url}
                  </a>
                </Section>
              )}

              {/* Brochure Extracted Text */}
              {d.brochure_text && ["DONE","SUCCESS"].includes(d.brochure_extraction_status) && (
                <BrochureTextSection text={d.brochure_text} />
              )}

              {/* Dynamic fields — show all remaining data not already rendered above */}
              {(() => {
                const SHOWN = new Set(["_id","template_id","field_values","search_text","packaging","packaging_type","created_at","updated_at","is_active","has_brochure",
                  "brochure_text","brochure_extraction_status","brochure_extracted_at",
                  "drug_name","brand_name","generic_name","manufacturer","drug_class","therapeutic_category","dosage_form","strength","route","prescription_type","storage_conditions",
                  "composition","indications","symptoms","mechanism_of_action","side_effects","contraindications","warnings_precautions","drug_interactions","reference_url"]);
                const extra = Object.entries(d).filter(([k, v]) => !SHOWN.has(k) && v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0));
                if (extra.length === 0) return null;
                return (
                  <Section title="Additional Information" icon="📋" color="slate">
                    <div className="space-y-4">
                      {extra.map(([key, value], idx) => {
                        const label = fmt(key);
                        const colors = [
                          { bg: "bg-blue-50", border: "border-blue-100", label: "text-blue-600", icon: "💊" },
                          { bg: "bg-purple-50", border: "border-purple-100", label: "text-purple-600", icon: "🔬" },
                          { bg: "bg-emerald-50", border: "border-emerald-100", label: "text-emerald-600", icon: "🩺" },
                          { bg: "bg-amber-50", border: "border-amber-100", label: "text-amber-600", icon: "⚠️" },
                          { bg: "bg-cyan-50", border: "border-cyan-100", label: "text-cyan-600", icon: "📋" },
                          { bg: "bg-pink-50", border: "border-pink-100", label: "text-pink-600", icon: "🔄" },
                          { bg: "bg-indigo-50", border: "border-indigo-100", label: "text-indigo-600", icon: "📊" },
                          { bg: "bg-orange-50", border: "border-orange-100", label: "text-orange-600", icon: "🏷️" },
                        ];
                        const c = colors[idx % colors.length];
                        if (Array.isArray(value)) {
                          return (
                            <div key={key} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
                              <p className={`text-[10px] font-bold ${c.label} uppercase mb-2 flex items-center gap-1.5`}><span>{c.icon}</span>{label}</p>
                              <div className="flex flex-wrap gap-2">{value.map((v, i) => <span key={i} className="bg-white text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm">{v}</span>)}</div>
                            </div>
                          );
                        }
                        if (typeof value === "object") return null;
                        const strVal = String(value);
                        if (strVal.length > 80) {
                          return (
                            <div key={key} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
                              <p className={`text-[10px] font-bold ${c.label} uppercase mb-2 flex items-center gap-1.5`}><span>{c.icon}</span>{label}</p>
                              <p className="text-sm text-gray-700 leading-relaxed">{strVal}</p>
                            </div>
                          );
                        }
                        return (
                          <div key={key} className={`${c.bg} border ${c.border} rounded-xl px-4 py-3 flex items-center gap-3`}>
                            <span className="text-base">{c.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[10px] font-bold ${c.label} uppercase`}>{label}</p>
                              <p className="text-sm text-gray-800 font-medium mt-0.5">{strVal}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Section>
                );
              })()}
            </div>

            {/* Col 3 — Sidebar: Pricing + Quick Facts */}
            <div className="space-y-5">
              {/* Pricing & Packaging */}
              {pkg && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-xs">💰</span>Pricing & Packaging</h3>
                  {pkg.sales_unit && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 mb-3 border border-emerald-100">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        {pkg.selling_price != null && <div className="bg-white rounded-lg p-2.5 border border-emerald-100"><p className="text-[9px] text-emerald-500 font-bold uppercase">Per {pkg.sales_unit}</p><p className="text-lg font-extrabold text-emerald-700">₹{pkg.selling_price}</p></div>}
                        {pkg.mrp != null && <div className="bg-white rounded-lg p-2.5 border border-amber-100"><p className="text-[9px] text-amber-500 font-bold uppercase">MRP</p><p className="text-lg font-extrabold text-amber-700">₹{pkg.mrp}</p></div>}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2 text-xs">
                    {pkg.sales_unit && <div className="flex justify-between"><span className="text-gray-400">Sales Unit</span><span className="font-semibold text-gray-700">{pkg.sales_unit}</span></div>}
                    {pkg.pack_quantity && <div className="flex justify-between"><span className="text-gray-400">Pack Qty</span><span className="font-semibold text-gray-700">{pkg.pack_quantity} {pkg.measurement_unit || "units"}</span></div>}
                    {pkg.sales_units_per_box && <div className="flex justify-between"><span className="text-gray-400">Per Box</span><span className="font-semibold text-gray-700">{pkg.sales_units_per_box} {pkg.sales_unit}s</span></div>}
                    {pkg.box_price != null && <div className="flex justify-between"><span className="text-gray-400">Box Price</span><span className="font-semibold text-gray-700">₹{pkg.box_price}</span></div>}
                    {pkg.max_discount_percent != null && <div className="flex justify-between"><span className="text-gray-400">Max Discount</span><span className="font-semibold text-red-600">{pkg.max_discount_percent}%</span></div>}
                  </div>
                </div>
              )}

              {/* Quick Facts */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xs">⚡</span>Quick Facts</h3>
                <div className="space-y-0 text-xs">
                  {d.drug_name && <div className="flex items-center justify-between py-2.5 border-b border-gray-100"><span className="text-gray-500 flex-shrink-0">Drug</span><span className="font-semibold text-gray-800 capitalize text-right ml-3">{d.drug_name}</span></div>}
                  {d.brand_name && <div className="flex items-center justify-between py-2.5 border-b border-gray-100"><span className="text-gray-500 flex-shrink-0">Brand</span><span className="font-semibold text-gray-800 capitalize text-right ml-3">{d.brand_name}</span></div>}
                  {d.drug_class && <div className="flex items-center justify-between py-2.5 border-b border-gray-100"><span className="text-gray-500 flex-shrink-0">Class</span><span className="font-semibold text-gray-800 text-right ml-3">{d.drug_class}</span></div>}
                  {d.dosage_form && <div className="flex items-center justify-between py-2.5 border-b border-gray-100"><span className="text-gray-500 flex-shrink-0">Form</span><span className="font-semibold text-gray-800 text-right ml-3">{d.dosage_form}</span></div>}
                  {d.strength && <div className="flex items-center justify-between py-2.5 border-b border-gray-100"><span className="text-gray-500 flex-shrink-0">Strength</span><span className="font-semibold text-gray-800 text-right ml-3">{d.strength}</span></div>}
                  {d.route && <div className="flex items-center justify-between py-2.5 border-b border-gray-100"><span className="text-gray-500 flex-shrink-0">Route</span><span className="font-semibold text-gray-800 text-right ml-3">{d.route}</span></div>}
                  {d.storage_conditions && (
                    <div className="pt-2.5">
                      <p className="text-gray-500 mb-1">Storage</p>
                      <p className="font-medium text-gray-700 text-[11px] leading-relaxed">{d.storage_conditions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs">📁</span>Documents</h3>
                {d.has_brochure ? (
                  <div className="space-y-3">
                    <BrochureDownloadBtn drugId={drugId} />
                    {/* Extraction status */}
                    {d.brochure_extraction_status && (
                      <div className={`rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2 ${
                        ["DONE","SUCCESS"].includes(d.brochure_extraction_status) ? "bg-green-50 border border-green-100" :
                        d.brochure_extraction_status === "PENDING" ? "bg-amber-50 border border-amber-100" :
                        d.brochure_extraction_status === "FAILED" ? "bg-red-50 border border-red-100" :
                        "bg-gray-50 border border-gray-100"
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            ["DONE","SUCCESS"].includes(d.brochure_extraction_status) ? "bg-green-500" :
                            d.brochure_extraction_status === "PENDING" ? "bg-amber-400 animate-pulse" :
                            "bg-red-400"
                          }`} />
                          <span className={`font-semibold ${
                            ["DONE","SUCCESS"].includes(d.brochure_extraction_status) ? "text-green-700" :
                            d.brochure_extraction_status === "PENDING" ? "text-amber-700" :
                            "text-red-600"
                          }`}>
                            Text Extraction: {["DONE","SUCCESS"].includes(d.brochure_extraction_status) ? "Complete" : d.brochure_extraction_status === "PENDING" ? "In Progress..." : "Failed"}
                          </span>
                        </div>
                        {isAdmin && d.brochure_extraction_status !== "PENDING" && (
                          <RetryExtractionBtn drugId={drugId} onRetried={() => queryClient.invalidateQueries({ queryKey: ["drug", drugId] })} />
                        )}
                      </div>
                    )}
                    {d.brochure_extracted_at && (
                      <p className="text-[10px] text-gray-400">Extracted: {new Date(d.brochure_extracted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    )}
                  </div>
                ) : <p className="text-xs text-gray-400">No brochure uploaded yet.</p>}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {isAdmin && showEdit && <EditDrugModal drug={d} drugId={drugId} onClose={() => setShowEdit(false)} onSaved={() => { queryClient.invalidateQueries({ queryKey: ["drug", drugId] }); setShowEdit(false); }} />}
      {isAdmin && showBrochure && <BrochureUploadModal drugId={drugId} hasBrochure={d.has_brochure} onClose={() => setShowBrochure(false)} onUploaded={() => { queryClient.invalidateQueries({ queryKey: ["drug", drugId] }); setShowBrochure(false); }} />}

      {/* AI Assistant Panel — MR only */}
      {!isAdmin && showAI && (
        <div className="fixed top-0 right-0 w-full sm:w-[380px] h-full bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg></div>
              <div><p className="text-sm font-bold text-gray-800">MRX AI Assistant</p><p className="text-[10px] text-gray-400">Ask about {name}</p></div>
            </div>
            <button onClick={() => setShowAI(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="px-5 py-3 border-b border-gray-50"><p className="text-sm text-gray-700">Hello {userName.split(" ")[0]}! 👋</p><p className="text-xs text-gray-400 mt-1">Ask me anything about {name}.</p></div>
          {chatHistory.length === 0 && (
            <div className="px-5 py-3"><p className="text-xs font-semibold text-purple-600 mb-2">Suggested Questions</p>
              <div className="space-y-2">{[`Side effects of ${name}?`, `Dosage for ${name}?`, `Mechanism of action?`].map(q => <button key={q} onClick={() => setQuestion(q)} className="w-full text-left px-3 py-2.5 rounded-xl border border-purple-100 text-xs text-gray-600 hover:bg-purple-50 transition-all">{q}</button>)}</div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${msg.type === "user" ? "bg-purple-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-700 rounded-bl-sm"}`}>{msg.text}</div>
              </div>
            ))}
            {isAsking && <div className="flex justify-start"><div className="bg-gray-100 px-3.5 py-2.5 rounded-xl rounded-bl-sm"><div className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}} />)}</div></div></div>}
          </div>
          <div className="px-5 py-1"><p className="text-[9px] text-gray-400 text-center">AI responses are for informational purposes only.</p></div>
          <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
            <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAskAI()} placeholder="Ask anything..." className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-100" />
            <button onClick={handleAskAI} disabled={isAsking || !question.trim()} className="w-9 h-9 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl flex items-center justify-center disabled:opacity-40 shadow-md"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
          </div>
        </div>
      )}
    </div>
  );
}
// ── Reusable Components ───────────────────────────────────────────────────────
function Section({ title, icon, color, children }) {
  const colors = { purple: "bg-purple-100 text-purple-600", green: "bg-green-100 text-green-600", blue: "bg-blue-100 text-blue-600", red: "bg-red-100 text-red-600", orange: "bg-orange-100 text-orange-600", amber: "bg-amber-100 text-amber-600", cyan: "bg-cyan-100 text-cyan-600", slate: "bg-slate-100 text-slate-600" };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${colors[color] || colors.purple}`}>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoField({ label, value }) {
  if (!value) return null;
  const str = String(value);
  const isLong = str.length > 40;
  return (
    <div className={isLong ? "col-span-2 md:col-span-3" : ""}>
      <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">{label}</p>
      <p className={`text-sm text-gray-800 font-medium ${isLong ? "" : "capitalize"}`}>{str}</p>
    </div>
  );
}

function BrochureDownloadBtn({ drugId }) {
  const [downloading, setDownloading] = useState(false);
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/v1/drugs/${drugId}/brochure/download`, { headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" } });
      if (!res.ok) throw new Error("Download failed");
      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename[^;=\n]*=["']?([^"'\n;]+)/i);
      const filename = match?.[1]?.trim() || `drug-brochure.pdf`;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (e) { alert(e.message || "Download failed"); }
    setDownloading(false);
  };
  return (
    <button onClick={handleDownload} disabled={downloading}
      className="w-full flex items-center gap-3 bg-gray-50 hover:bg-purple-50 rounded-xl p-3 border border-gray-200 hover:border-purple-200 transition-all group disabled:opacity-50">
      <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-white text-[10px] font-bold">PDF</span></div>
      <div className="flex-1 text-left"><p className="text-xs font-semibold text-gray-700 group-hover:text-purple-700">Drug Brochure</p><p className="text-[10px] text-gray-400">{downloading ? "Downloading..." : "Click to download"}</p></div>
      <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
    </button>
  );
}

// ── Edit Drug Modal ───────────────────────────────────────────────────────────
function EditDrugModal({ drug, drugId, onClose, onSaved }) {
  // Build form from ALL top-level fields (skip internal ones)
  const SKIP = new Set(["_id","template_id","field_values","search_text","packaging","packaging_type","created_at","updated_at","is_active","has_brochure"]);
  const ARRAY_FIELDS = new Set(["composition","indications","symptoms","contraindications","warnings_precautions","side_effects","drug_interactions"]);

  const initialForm = {};
  Object.entries(drug).forEach(([k, v]) => {
    if (SKIP.has(k)) return;
    if (v === null || v === undefined) { initialForm[k] = ""; return; }
    if (Array.isArray(v)) { initialForm[k] = v.join(", "); return; }
    if (typeof v === "object") return;
    initialForm[k] = String(v);
  });

  const [form, setForm] = useState(initialForm);
  const [packaging, setPackaging] = useState({
    sales_unit: drug.packaging?.sales_unit || "",
    pack_quantity: drug.packaging?.pack_quantity || "",
    measurement_unit: drug.packaging?.measurement_unit || "",
    selling_price: drug.packaging?.selling_price || "",
    mrp: drug.packaging?.mrp || "",
    sales_units_per_box: drug.packaging?.sales_units_per_box || "",
    box_pricing_mode: drug.packaging?.box_pricing_mode || "auto",
    box_discount_percent: drug.packaging?.box_discount_percent || "",
    box_price: drug.packaging?.box_price || "",
    max_discount_percent: drug.packaging?.max_discount_percent || ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-populate measurement_unit based on dosage_form
  useEffect(() => {
    const MEASUREMENT_MAP = {
      "Tablet": "Tablets", "Capsule": "Capsules", "Syrup": "ml", "Injection": "ml",
      "Drops": "ml", "Cream": "gm", "Ointment": "gm", "Gel": "gm",
      "Powder": "gm", "Lotion": "ml", "Inhaler": "doses", "Suspension": "ml",
      "Solution": "ml", "Suppository": "units", "Patch": "patches"
    };
    const dosageForm = form.dosage_form || drug.dosage_form;
    if (dosageForm && MEASUREMENT_MAP[dosageForm]) {
      setPackaging(prev => ({ ...prev, measurement_unit: MEASUREMENT_MAP[dosageForm] }));
    }
  }, [form.dosage_form]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      // Fetch current active template to get valid field_ids
      const template = await get("/api/v1/drugs/templates");
      const validFieldIds = new Set((template?.fields || []).filter(f => f.is_active !== false).map(f => f.field_id));

      // Build a map: key -> field_id (from template, not from drug)
      const templateKeyMap = {};
      (template?.fields || []).forEach(f => { if (f.is_active !== false) templateKeyMap[f.key] = f.field_id; });

      const fieldValues = [];
      Object.entries(form).forEach(([key, val]) => {
        // Only send fields that exist in the active template
        const fieldId = templateKeyMap[key];
        if (!fieldId) return;
        let value = val;
        if (ARRAY_FIELDS.has(key) && typeof val === "string") {
          value = val.split(",").map(s => s.trim()).filter(Boolean);
        }
        if (value === "" || value === null || value === undefined) value = null;
        if (Array.isArray(value) && value.length === 0) value = null;
        fieldValues.push({ field_id: fieldId, key, value });
      });

      const payload = { field_values: fieldValues };
      
      // Add packaging if any fields are filled
      const pkgClean = {};
      Object.entries(packaging).forEach(([k, v]) => {
        if (v === "" || v === null || v === undefined) return;
        const num = ["selling_price","mrp","pack_quantity","sales_units_per_box","box_price","max_discount_percent","box_discount_percent"].includes(k);
        pkgClean[k] = num ? Number(v) : v;
      });
      if (Object.keys(pkgClean).length > 0) payload.packaging = pkgClean;

      await put(`/api/v1/drugs/${drugId}`, payload);
      onSaved();
    } catch (err) { setError(err?.data?.detail || err.message || "Failed to update"); }
    setSaving(false);
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // Split fields into "core" (shown in structured grid) and "extra" (shown dynamically below)
  const CORE_KEYS = new Set(["drug_name","brand_name","generic_name","manufacturer","drug_class","therapeutic_category",
    "dosage_form","strength","route","prescription_type","storage_conditions","reference_url",
    "composition","indications","symptoms","mechanism_of_action","contraindications","warnings_precautions","side_effects","drug_interactions"]);
  const extraKeys = Object.keys(form).filter(k => !CORE_KEYS.has(k) && form[k] !== "");

  const F = (label, key, ph = "") => (
    <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</label>
    <input value={form[key] || ""} onChange={(e) => update(key, e.target.value)} placeholder={ph}
      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 transition-all" /></div>
  );

  const TA = (label, key, ph = "") => (
    <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</label>
    <textarea value={form[key] || ""} onChange={(e) => update(key, e.target.value)} placeholder={ph} rows={2}
      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-100 resize-none" /></div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-white font-bold text-sm flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>Edit Drug</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>}
          {/* Core fields — structured */}
          <div className="grid grid-cols-2 gap-3">{F("Drug Name","drug_name","Paracetamol")}{F("Brand Name","brand_name","Crocin")}</div>
          <div className="grid grid-cols-2 gap-3">{F("Generic Name","generic_name")}{F("Manufacturer","manufacturer","GSK")}</div>
          <div className="grid grid-cols-2 gap-3">{F("Drug Class","drug_class","Analgesic")}{F("Category","therapeutic_category","Pain Management")}</div>
          <div className="grid grid-cols-3 gap-3">{F("Form","dosage_form","Tablet")}{F("Strength","strength","500mg")}{F("Route","route","Oral")}</div>
          <div className="grid grid-cols-2 gap-3">{F("Prescription Type","prescription_type","OTC")}{F("Storage","storage_conditions","Below 25°C")}</div>
          {TA("Composition (comma separated)","composition")}
          {TA("Indications (comma separated)","indications")}
          {TA("Symptoms (comma separated)","symptoms")}
          {TA("Mechanism of Action","mechanism_of_action")}
          {TA("Contraindications (comma separated)","contraindications")}
          {TA("Side Effects (comma separated)","side_effects")}
          {TA("Drug Interactions (comma separated)","drug_interactions")}
          {TA("Warnings & Precautions (comma separated)","warnings_precautions")}
          {F("Reference URL","reference_url","https://...")}

          {/* Dynamic extra fields */}
          {extraKeys.length > 0 && (
            <>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <p className="text-[10px] font-bold text-purple-600 uppercase mb-2">Additional Fields</p>
              </div>
              {extraKeys.map(key => {
                const val = form[key] || "";
                const label = fmt(key);
                const isLong = val.length > 80;
                return <div key={key}>{isLong ? TA(label, key) : F(label, key)}</div>;
              })}
            </>
          )}

          {/* Packaging & Pricing */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-xs font-bold text-emerald-700 uppercase mb-3 flex items-center gap-2">📦 Packaging & Pricing</p>
            
            {/* Sales Unit — button selector */}
            <div className="mb-3">
              <label className="block text-xs font-bold text-gray-700 mb-2">Sales Unit <span className="text-red-500">*</span> <span className="text-gray-400 font-normal text-[10px]">— how you sell a single unit</span></label>
              <div className="flex gap-2 flex-wrap">
                {["Strip", "Bottle", "Blister Pack", "Vial", "Tube", "Sachet"].map(unit => (
                  <button key={unit} type="button" onClick={() => setPackaging({...packaging, sales_unit: unit})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${packaging.sales_unit === unit ? "bg-emerald-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300"}`}>{unit}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Pack Quantity <span className="text-red-500">*</span></label><input type="number" value={packaging.pack_quantity} onChange={(e) => setPackaging({...packaging, pack_quantity: e.target.value})} placeholder="How many Tablets per Strip" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Measurement Unit <span className="text-red-500">*</span></label><input value={packaging.measurement_unit} readOnly className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-gray-50 text-gray-600" /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Selling Price (per {packaging.sales_unit || "Unit"}) <span className="text-red-500">*</span></label><div className="relative"><span className="absolute left-3 top-2.5 text-gray-400">₹</span><input type="number" step="0.01" value={packaging.selling_price} onChange={(e) => setPackaging({...packaging, selling_price: e.target.value})} placeholder="0.00" className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" /></div></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">MRP (optional)</label><div className="relative"><span className="absolute left-3 top-2.5 text-gray-400">₹</span><input type="number" step="0.01" value={packaging.mrp} onChange={(e) => setPackaging({...packaging, mrp: e.target.value})} placeholder="0.00" className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" /></div></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Max Discount %</label><input type="number" step="0.1" value={packaging.max_discount_percent} onChange={(e) => setPackaging({...packaging, max_discount_percent: e.target.value})} placeholder="10" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Box Pricing Mode</label><select value={packaging.box_pricing_mode} onChange={(e) => setPackaging({...packaging, box_pricing_mode: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-white"><option value="auto">Auto</option><option value="manual">Manual</option></select></div>
              {packaging.box_pricing_mode === "auto" && <div><label className="block text-xs font-bold text-gray-700 mb-1">Box Discount %</label><input type="number" step="0.1" value={packaging.box_discount_percent} onChange={(e) => setPackaging({...packaging, box_discount_percent: e.target.value})} placeholder="5" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" /></div>}
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Units per Box</label><input type="number" value={packaging.sales_units_per_box} onChange={(e) => setPackaging({...packaging, sales_units_per_box: e.target.value})} placeholder="10" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" /></div>
              {packaging.box_pricing_mode === "manual" && <div><label className="block text-xs font-bold text-gray-700 mb-1">Box Price (₹)</label><div className="relative"><span className="absolute left-3 top-2.5 text-gray-400">₹</span><input type="number" step="0.01" value={packaging.box_price} onChange={(e) => setPackaging({...packaging, box_price: e.target.value})} placeholder="0.00" className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" /></div></div>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 shadow-md">{saving ? "Saving..." : "Update Drug"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Brochure Upload Modal ─────────────────────────────────────────────────────
function BrochureUploadModal({ drugId, hasBrochure, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpload = async () => {
    if (!file) { setError("Select a file first"); return; }
    setUploading(true); setError(""); setSuccess("");
    try {
      const token = localStorage.getItem("access_token");
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/v1/drugs/${drugId}/brochure`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" }, body: fd });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || "Upload failed"); }
      setSuccess("Brochure uploaded! Text extraction started in background.");
      setTimeout(() => onUploaded(), 1200);
    } catch (e) { setError(e.message); }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white font-bold text-sm flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>{hasBrochure ? "Replace" : "Upload"} Brochure</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">×</button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-xs">{success}</div>}
          {hasBrochure && <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-center gap-2"><span>⚠️</span>Existing brochure will be replaced.</div>}
          <div className="border-2 border-dashed border-purple-200 rounded-xl p-8 text-center hover:border-purple-400 transition-all cursor-pointer" onClick={() => document.getElementById("br-file").click()}>
            <input type="file" id="br-file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3"><svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg></div>
            <p className="text-sm font-semibold text-gray-700">{file ? file.name : "Click to select file"}</p>
            <p className="text-[10px] text-gray-400 mt-1">PDF, DOC, PNG, JPG — max 10MB</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200">Cancel</button>
            <button onClick={handleUpload} disabled={uploading || !file} className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 shadow-md">{uploading ? "Uploading..." : "Upload"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Brochure Text Section ─────────────────────────────────────────────────────
function BrochureTextSection({ text }) {
  const [lines, setLines] = useState(3);

  // Split by newlines OR sentences — whichever gives cleaner chunks
  const rawLines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const isShort = rawLines.length <= 3;
  const hasMore = lines < rawLines.length;
  const canCollapse = lines > 3;
  const STEPS = [3, 8, 15, rawLines.length];

  const currentStepIdx = STEPS.findIndex(s => s >= lines);
  const nextStep = STEPS[Math.min(currentStepIdx + 1, STEPS.length - 1)];

  const visibleText = rawLines.slice(0, lines).join("\n");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs">📄</span>
        Brochure Content
        <span className="ml-auto text-[10px] text-gray-400 font-normal">{rawLines.length} lines</span>
      </h3>

      <div className="relative">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{visibleText}{hasMore ? "..." : ""}</p>
        {hasMore && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>

      {!isShort && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-50">
          {hasMore && (
            <button onClick={() => setLines(nextStep)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              Show More
            </button>
          )}
          {canCollapse && (
            <button onClick={() => setLines(3)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              Show Less
            </button>
          )}
          {hasMore && (
            <button onClick={() => setLines(rawLines.length)}
              className="ml-auto text-[11px] text-gray-400 hover:text-indigo-500 transition-all font-medium">
              View All ({rawLines.length})
            </button>
          )}
        </div>
      )}
      <p className="text-[10px] text-gray-400 mt-2">
        {hasMore ? `Showing ${lines} of ${rawLines.length} lines` : `All ${rawLines.length} lines shown`}
      </p>
    </div>
  );
}

// ── Retry Extraction Button ────────────────────────────────────────────────────
function RetryExtractionBtn({ drugId, onRetried }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/v1/drugs/${drugId}/extract-brochure`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
      });
      setDone(true);
      setTimeout(() => { setDone(false); onRetried?.(); }, 1500);
    } catch { /* silent */ }
    setLoading(false);
  };

  return (
    <button onClick={handleRetry} disabled={loading || done}
      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50 flex items-center gap-1">
      {done ? "✓ Triggered" : loading ? "..." : "↺ Retry"}
    </button>
  );
}
