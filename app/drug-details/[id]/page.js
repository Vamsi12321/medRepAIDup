"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { useParams } from "next/navigation";
import { get } from "@/lib/api";

const formatKey = (key) => key?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";
const getVal = (drug, key) => {
  // Primary: field_values array (official GET /api/v1/drugs/{id} format)
  if (Array.isArray(drug?.field_values)) {
    const fv = drug.field_values.find((f) => f.key === key);
    if (fv !== undefined) {
      if (Array.isArray(fv.value)) return fv.value.join(", ");
      return fv.value ?? "";
    }
  }
  // Fallback: top-level field (list endpoint format)
  if (drug?.[key] !== undefined && drug?.[key] !== null) {
    const v = drug[key];
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
  }
  return "";
};

// Helper — fetch with auth, get blob, trigger download using server-provided filename
async function downloadBrochure(url, fallbackName) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "Download failed");
  }
  // Extract filename from Content-Disposition header
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename[^;=\n]*=["']?([^"'\n;]+)["']?/i);
  const filename = match?.[1]?.trim() || fallbackName;
  const blob = await res.blob();
  const objUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objUrl);
}

// Brochure download — uses fetch with auth token so the backend accepts the request
function BrochureDownloadButton({ drugId }) {
  const [downloading, setDownloading] = useState(false);
  const [err, setErr] = useState("");

  const handleDownload = async () => {
    setDownloading(true);
    setErr("");
    try {
      await downloadBrochure(
        `/api/v1/drugs/${drugId}/brochure/download`,
        `drug-${drugId}-brochure.pdf`
      );
    } catch (e) {
      setErr(e.message || "Download failed");
    }
    setDownloading(false);
  };

  return (
    <div>
      <button onClick={handleDownload} disabled={downloading}
        className="w-full flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all group disabled:opacity-50">
        <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-sm">📄</span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-semibold text-gray-800 text-xs group-hover:text-indigo-600 transition-colors">Drug Brochure</p>
          <p className="text-xs text-gray-400">{downloading ? "Downloading..." : "PDF · Click to download"}</p>
        </div>
        <span className="text-xs text-indigo-600 font-bold flex-shrink-0">{downloading ? "..." : "↓"}</span>
      </button>
      {err && <p className="text-xs text-red-500 mt-1 px-1">{err}</p>}
    </div>
  );
}

// Style presets to cycle through for dynamic fields
const FIELD_STYLES = [
  { icon: "🩺", bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700"    },
  { icon: "🤒", bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700"  },
  { icon: "⚠️", bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700"     },
  { icon: "🔬", bg: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700"  },
  { icon: "💊", bg: "bg-green-50",   border: "border-green-200",   text: "text-green-700"   },
  { icon: "💉", bg: "bg-teal-50",    border: "border-teal-200",    text: "text-teal-700"    },
  { icon: "🔄", bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700"    },
  { icon: "💰", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  { icon: "🏷️", bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700"   },
  { icon: "📋", bg: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700"  },
  { icon: "🧪", bg: "bg-pink-50",    border: "border-pink-200",    text: "text-pink-700"    },
  { icon: "📊", bg: "bg-slate-50",   border: "border-slate-200",   text: "text-slate-700"   },
];

// Keys to skip in the drug info section (shown elsewhere or internal)
const SKIP_KEYS = ["drug_name", "brand_name", "drug_class", "manufacturer", "specialization",
  "pack_type", "units_per_pack", "packs_per_box", "pack_price", "box_price", "mrp", "price_per_drug", "price"];

// Pricing keys to render in dedicated Pricing section
const PRICING_KEYS = ["pack_type", "units_per_pack", "packs_per_box", "pack_price", "box_price", "mrp", "price_per_drug", "price"];


export default function DrugDetails() {
  const params = useParams();
  const drugId = params.id;
  const [userRole, setUserRole]       = useState("doctor");
  const [question, setQuestion]       = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isAsking, setIsAsking]       = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) setUserRole(role);
  }, []);

  const { data: drug, isLoading: loading } = useQuery({
    queryKey: ["drug", drugId],
    queryFn:  () => get(`/api/v1/drugs/${drugId}`),
    enabled:  !!drugId,
    staleTime: 10 * 60 * 1000,
  });

  const handleAsk = () => {
    if (!question.trim() || !drug) return;
    setChatHistory((p) => [...p, { type: "user", text: question }]);
    setIsAsking(true);
    const q   = question.toLowerCase();
    const ctx = (drug.field_values?.length > 0
      ? drug.field_values
      : Object.entries(drug)
          .filter(([k, v]) => v && typeof v !== "object")
          .map(([k, v]) => ({ key: k, value: v }))
    ).map((fv) => `${formatKey(fv.key)}: ${fv.value}`).join(". ");
    setTimeout(() => {
      const sideEffects = drug.side_effects     || getVal(drug, "side_effects");
      const mechanism   = drug.mechanism_of_action || getVal(drug, "mechanism_of_action");
      const dosage      = drug.dosage_strength  || getVal(drug, "dosage_strength") || drug.dosage || getVal(drug, "dosage");
      const name        = drug.drug_name || getVal(drug, "drug_name") || drug.brand_name || getVal(drug, "brand_name") || "this drug";
      let answer = "";
      if (q.includes("side effect"))                              answer = sideEffects ? `Side effects of ${name}: ${sideEffects}.` : "No side effects data available.";
      else if (q.includes("mechanism") || q.includes("action"))  answer = mechanism ? `${name} works by: ${mechanism}.` : "Mechanism not available.";
      else if (q.includes("dose") || q.includes("dosage"))       answer = dosage ? `Dosage for ${name}: ${dosage}.` : "Dosage not available.";
      else answer = `Here is what I know about ${name}: ${ctx}`;
      setChatHistory((p) => [...p, { type: "ai", text: answer }]);
      setIsAsking(false);
      setQuestion("");
    }, 1200);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );
  if (!drug) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Drug not found.</p>
    </div>
  );

  const drugName       = getVal(drug, "drug_name")     || drug.drug_name     || drug.name || "Drug";
  const brandName      = getVal(drug, "brand_name")    || drug.brand_name;
  const drugClass      = getVal(drug, "drug_class")    || drug.drug_class;
  const manufacturer   = getVal(drug, "manufacturer")  || drug.manufacturer;
  const specialization = getVal(drug, "specialization") || drug.specialization;

  return (
    <div className="min-h-screen bg-gray-50">
      {userRole === "mr" ? <MRNavbar /> : <DoctorNavbar />}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb customItems={[
          { label: userRole === "mr" ? "MR Portal" : "Doctor", href: userRole === "mr" ? "/mr/dashboard" : "/doctor/home" },
          { label: "Drug Search", href: userRole === "mr" ? "/mr/drug-search" : "/doctor/drug-search" },
          { label: drugName, href: null },
        ]} />

        {/* Compact header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-5 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow flex-shrink-0">
              {drugName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 capitalize leading-tight">{drugName}</h1>
              {brandName && drugName !== brandName && (
                <p className="text-sm text-indigo-500 font-semibold capitalize">{brandName}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {drugClass      && <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-semibold">{drugClass}</span>}
              {specialization && <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold">{specialization}</span>}
              {manufacturer   && <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-semibold">{manufacturer}</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Drug info — 2/3 width — main highlight */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-5" style={{ boxShadow: "0 0 0 2px rgba(99,102,241,0.08), 0 4px 24px 0 rgba(99,102,241,0.06)" }}>
            <h2 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
              <span className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xs">💊</span>
              Drug Information
            </h2>
            <div className="space-y-3">
              {(() => {
                // Get all displayable fields dynamically from field_values or top-level keys
                const fields = drug.field_values?.length > 0
                  ? drug.field_values.filter((fv) => !SKIP_KEYS.includes(fv.key) && fv.value !== null && fv.value !== undefined && fv.value !== "" && !(Array.isArray(fv.value) && fv.value.length === 0))
                  : Object.entries(drug)
                      .filter(([k, v]) => !SKIP_KEYS.includes(k) && !k.startsWith("_") && !["id","template_id","field_values","created_at","updated_at","is_active","search_text","has_brochure"].includes(k) && v !== null && v !== undefined && v !== "")
                      .map(([k, v]) => ({ key: k, value: v, type: Array.isArray(v) ? "array" : typeof v === "number" ? "number" : "text" }));

                return fields.map((fv, idx) => {
                  const style = FIELD_STYLES[idx % FIELD_STYLES.length];
                  const rawVal = fv.value;
                  const fieldType = fv.type || (Array.isArray(rawVal) ? "array" : "text");
                  const label = formatKey(fv.key);

                  return (
                    <div key={fv.key || idx} className={`${style.bg} border ${style.border} rounded-xl p-3`}>
                      <p className={`text-xs font-bold ${style.text} mb-1.5 flex items-center gap-1.5`}>
                        <span>{style.icon}</span>{label}
                      </p>
                      {(fieldType === "array" || Array.isArray(rawVal)) ? (
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(rawVal) ? rawVal : []).map((item, i) => (
                            <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text} border ${style.border}`}>
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : fieldType === "textarea" ? (
                        <p className="text-gray-800 text-xs leading-relaxed whitespace-pre-wrap">{String(rawVal)}</p>
                      ) : fieldType === "number" ? (
                        <p className="text-gray-900 text-sm font-bold">{String(rawVal)}</p>
                      ) : fieldType === "date" ? (
                        <p className="text-gray-800 text-xs font-semibold">{(() => { try { return new Date(rawVal).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); } catch { return String(rawVal); } })()}</p>
                      ) : fieldType === "url" ? (
                        <a href={String(rawVal)} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 text-xs font-medium underline break-all">{String(rawVal)}</a>
                      ) : fieldType === "select" ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${style.bg} ${style.text} border ${style.border}`}>{String(rawVal)}</span>
                      ) : (
                        <p className="text-gray-800 text-xs leading-relaxed">{String(rawVal)}</p>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
            </div>
          </div>

          {/* Right column — docs + brochure */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center text-xs">📁</span>
                Documents
              </h2>
              {drug.has_brochure ? (
                <div className="space-y-2">
                  <BrochureDownloadButton drugId={drugId} />
                </div>
              ) : (
                <div className="flex items-center gap-2 py-3 px-1">
                  <span className="text-gray-300 text-lg">📄</span>
                  <p className="text-gray-400 text-xs">No brochure available for this drug</p>
                </div>
              )}
            </div>

            {/* Quick facts */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-4">
              <p className="text-xs font-bold text-indigo-700 mb-2 uppercase tracking-wide">Quick Facts</p>
              <div className="space-y-1.5 text-xs">
                {(() => {
                  // Build quick facts from all available fields
                  const facts = [];
                  if (drugName) facts.push({ label: "Drug Name", value: drugName });
                  if (brandName) facts.push({ label: "Brand", value: brandName });
                  if (drugClass) facts.push({ label: "Class", value: drugClass });
                  if (manufacturer) facts.push({ label: "By", value: manufacturer });
                  // Add pricing summary from drug.packaging
                  const shownKeys = ["drug_name","brand_name","drug_class","manufacturer","specialization",
                    "pack_type","units_per_pack","packs_per_box","pack_price","box_price","mrp","price_per_drug","price"];
                  if (drug.field_values?.length > 0) {
                    drug.field_values.forEach((fv) => {
                      if (shownKeys.includes(fv.key)) return;
                      if (fv.type === "array" || fv.type === "textarea" || fv.type === "url") return;
                      if (Array.isArray(fv.value)) return;
                      if (!fv.value || String(fv.value).length > 50) return;
                      facts.push({ label: formatKey(fv.key), value: String(fv.value) });
                    });
                  }
                  return facts.map((r) => (
                    <div key={r.label} className="flex items-center justify-between gap-2">
                      <span className="text-gray-400 font-medium flex-shrink-0">{r.label}</span>
                      {String(r.value).startsWith("http") ? (
                        <a href={r.value} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold text-right truncate hover:underline text-[11px]">
                          {r.label === "Reference Url" ? "View Reference ↗" : r.value}
                        </a>
                      ) : (
                        <span className="text-gray-700 font-semibold text-right truncate capitalize">{r.value}</span>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Pricing & Packaging — compact, below Quick Facts (MR only) */}
            {userRole === "mr" && drug.packaging?.sales_unit && (() => {
              const rawPkg = drug.packaging;
              const pricing = rawPkg.pricing || {};
              const boxPricing = pricing.box_pricing || {};
              const pkg = {
                ...rawPkg,
                selling_price: rawPkg.selling_price ?? pricing.selling_price,
                mrp: rawPkg.mrp ?? pricing.mrp,
                max_discount_percent: rawPkg.max_discount_percent ?? pricing.max_discount_percent,
                box_price: rawPkg.box_price ?? boxPricing.box_price,
              };
              return (
                <div className="bg-white rounded-2xl border border-emerald-100 p-4">
                  <p className="text-xs font-bold text-emerald-700 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                    <span>💰</span> Pricing & Packaging
                  </p>
                  {/* Hierarchy */}
                  {(pkg.pack_quantity || pkg.sales_units_per_box) && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {pkg.pack_quantity && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 text-center">
                          <p className="text-[8px] text-emerald-600 font-bold uppercase">1 {pkg.sales_unit}</p>
                          <p className="text-[11px] font-bold text-gray-700">{pkg.pack_quantity} {pkg.measurement_unit || "units"}</p>
                        </div>
                      )}
                      {pkg.pack_quantity && pkg.sales_units_per_box && <span className="text-gray-300 text-sm">→</span>}
                      {pkg.sales_units_per_box && (
                        <div className="bg-teal-50 border border-teal-100 rounded-lg px-2.5 py-1.5 text-center">
                          <p className="text-[8px] text-teal-600 font-bold uppercase">1 Box</p>
                          <p className="text-[11px] font-bold text-gray-700">{pkg.sales_units_per_box} {pkg.sales_unit}s</p>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Prices */}
                  <div className="grid grid-cols-2 gap-2">
                    {pkg.selling_price != null && <div className="bg-emerald-50 rounded-lg p-2 text-center border border-emerald-100"><p className="text-[8px] text-emerald-600 font-bold uppercase">/{pkg.sales_unit}</p><p className="text-sm font-extrabold text-emerald-800">₹{pkg.selling_price}</p></div>}
                    {pkg.box_price != null && <div className="bg-teal-50 rounded-lg p-2 text-center border border-teal-100"><p className="text-[8px] text-teal-600 font-bold uppercase">/Box</p><p className="text-sm font-extrabold text-teal-800">₹{pkg.box_price}</p></div>}
                    {pkg.mrp != null && <div className="bg-amber-50 rounded-lg p-2 text-center border border-amber-100"><p className="text-[8px] text-amber-600 font-bold uppercase">MRP</p><p className="text-sm font-extrabold text-amber-800">₹{pkg.mrp}</p></div>}
                    {pkg.max_discount_percent != null && <div className="bg-red-50 rounded-lg p-2 text-center border border-red-100"><p className="text-[8px] text-red-500 font-bold uppercase">Max Disc</p><p className="text-sm font-extrabold text-red-700">{pkg.max_discount_percent}%</p></div>}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* AI Chat — light premium */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl border border-indigo-100 p-5 relative overflow-hidden">
          {/* Subtle background accents */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full -mr-24 -mt-24 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100/30 rounded-full -ml-16 -mb-16 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-2.5 mb-4 relative">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 font-bold text-sm leading-tight">Ask AI About This Drug</p>
              <p className="text-indigo-400 text-xs">Powered by AI · Instant answers</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600 text-xs font-medium">Online</span>
            </div>
          </div>

          {/* Chat area */}
          <div className="overflow-y-auto space-y-2.5 mb-4 max-h-48 relative">
            {chatHistory.length === 0 && (
              <div className="space-y-2">
                <p className="text-gray-400 text-xs">Quick questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Side effects?","Mechanism of action?","Dosage?","Indications?"].map((q) => (
                    <button key={q} onClick={() => setQuestion(q)}
                      className="bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} items-end gap-2`}>
                {msg.type === "ai" && (
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                )}
                <div className={`max-w-sm px-3.5 py-2.5 rounded-xl text-xs leading-relaxed shadow-sm ${
                  msg.type === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-indigo-100 rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="bg-white border border-indigo-100 px-3.5 py-2.5 rounded-xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1">
                    {[0,1,2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: `${i*150}ms`}} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 relative">
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask anything about this drug..."
              className="flex-1 px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm" />
            <button onClick={handleAsk} disabled={isAsking || !question.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-40 shadow-md shadow-indigo-200 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Ask
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
