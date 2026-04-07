"use client";
import { useState, useEffect } from "react";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { useParams } from "next/navigation";
import { get } from "@/lib/api";

const formatKey = (key) => key?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";
const getVal = (drug, key) => drug?.field_values?.find((f) => f.key === key)?.value || "";

const HEADER_KEYS = ["brand_name","drug_name","drug_class","specialization","brochure_url"];

const FIELD_COLORS = [
  { border: "border-indigo-400", label: "text-indigo-600", bg: "bg-indigo-50" },
  { border: "border-blue-400",   label: "text-blue-600",   bg: "bg-blue-50" },
  { border: "border-green-400",  label: "text-green-600",  bg: "bg-green-50" },
  { border: "border-yellow-400", label: "text-yellow-600", bg: "bg-yellow-50" },
  { border: "border-red-400",    label: "text-red-600",    bg: "bg-red-50" },
  { border: "border-pink-400",   label: "text-pink-600",   bg: "bg-pink-50" },
  { border: "border-purple-400", label: "text-purple-600", bg: "bg-purple-50" },
  { border: "border-orange-400", label: "text-orange-600", bg: "bg-orange-50" },
  { border: "border-teal-400",   label: "text-teal-600",   bg: "bg-teal-50" },
  { border: "border-cyan-400",   label: "text-cyan-600",   bg: "bg-cyan-50" },
];

export default function DrugDetails() {
  const params  = useParams();
  const drugId  = params.id;

  const [drug, setDrug]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [userRole, setUserRole] = useState("doctor");
  const [question, setQuestion]       = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isAsking, setIsAsking]       = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) setUserRole(role);
  }, []);

  useEffect(() => {
    if (!drugId) return;
    get(`/api/v1/drugs/${drugId}`)
      .then((data) => setDrug(data))
      .catch(() => setDrug(null))
      .finally(() => setLoading(false));
  }, [drugId]);

  const handleAsk = () => {
    if (!question.trim() || !drug) return;
    setChatHistory((p) => [...p, { type: "user", text: question }]);
    setIsAsking(true);
    const q   = question.toLowerCase();
    const ctx = (drug.field_values || []).map((fv) => `${formatKey(fv.key)}: ${fv.value}`).join(". ");
    setTimeout(() => {
      const sideEffects = getVal(drug, "side_effects");
      const mechanism   = getVal(drug, "mechanism_of_action");
      const dosage      = getVal(drug, "dosage_strength") || getVal(drug, "dosage");
      const name        = getVal(drug, "brand_name") || getVal(drug, "drug_name");
      let answer = "";
      if (q.includes("side effect"))           answer = sideEffects ? `Side effects of ${name}: ${sideEffects}.` : "No side effects data available.";
      else if (q.includes("mechanism") || q.includes("action")) answer = mechanism ? `${name} works by: ${mechanism}.` : "Mechanism not available.";
      else if (q.includes("dose") || q.includes("dosage"))      answer = dosage ? `Dosage for ${name}: ${dosage}.` : "Dosage not available.";
      else answer = `Here is what I know about ${name}: ${ctx}`;
      setChatHistory((p) => [...p, { type: "ai", text: answer }]);
      setIsAsking(false);
      setQuestion("");
    }, 1200);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading drug details...</p>
    </div>
  );

  if (!drug) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Drug not found.</p>
    </div>
  );

  const name           = getVal(drug, "brand_name") || getVal(drug, "drug_name") || "Drug";
  const genericName    = getVal(drug, "drug_name");
  const drugClass      = getVal(drug, "drug_class");
  const manufacturer   = getVal(drug, "manufacturer");
  const specialization = getVal(drug, "specialization");

  // All fields except header ones
  const detailFields = (drug.field_values || []).filter((fv) => !HEADER_KEYS.includes(fv.key) && fv.value);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {userRole === "mr" ? <MRNavbar /> : <DoctorNavbar />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb customItems={[
          { label: userRole === "mr" ? "💼 MR Portal" : "👨‍⚕️ Doctor", href: userRole === "mr" ? "/mr/dashboard" : "/doctor/home" },
          { label: "🔍 Drug Search", href: userRole === "mr" ? "/mr/drug-search" : "/doctor/drug-search" },
          { label: `💊 ${name}`, href: null },
        ]} />

        {/* Header */}
        <div className="bg-white rounded-3xl p-7 shadow-xl mb-8 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-400 to-purple-500 opacity-10 rounded-full -mr-36 -mt-36" />
          <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl" />
          <div className="relative flex items-start justify-between gap-6 mt-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 capitalize">{name}</h1>
                  {genericName && name !== genericName && <p className="text-sm text-gray-400 capitalize">{genericName}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {drugClass      && <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-xl font-semibold text-sm">{drugClass}</span>}
                {specialization && <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-xl font-semibold text-sm">{specialization}</span>}
                {manufacturer   && <span className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-xl font-semibold text-sm">🏢 {manufacturer}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Drug info — all fields */}
          <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center"><span>💊</span></div>
              Drug Information
            </h2>
            {detailFields.length === 0 ? (
              <p className="text-gray-400 text-sm">No additional information available.</p>
            ) : (
              <div className="space-y-3">
                {detailFields.map((fv, i) => {
                  const c = FIELD_COLORS[i % FIELD_COLORS.length];
                  return (
                    <div key={fv.field_id || fv.key} className={`${c.bg} rounded-xl p-3.5 border-l-4 ${c.border}`}>
                      <p className={`text-xs font-bold ${c.label} mb-1`}>{formatKey(fv.key)}</p>
                      <p className="text-gray-800 font-medium text-sm">{fv.value}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center"><span>📁</span></div>
              Documents & Resources
            </h2>
            <div className="space-y-3">
              {getVal(drug, "brochure_url") ? (
                <a href={getVal(drug, "brochure_url")} target="_blank" rel="noreferrer"
                  className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-xl">📄</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">Drug Brochure</p>
                    <p className="text-sm text-gray-500">PDF · Click to view</p>
                  </div>
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm">View</span>
                </a>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">No documents available yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* AI Chat */}
        <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center"><span>🤖</span></div>
            Ask AI About This Drug
          </h2>

          <div className="overflow-y-auto space-y-3 mb-4 max-h-64">
            {chatHistory.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {["What are the side effects?","What is the mechanism of action?","What is the dosage?","What are the indications?"].map((q) => (
                  <button key={q} onClick={() => setQuestion(q)}
                    className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-100 border border-indigo-200 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-2xl px-5 py-3 rounded-2xl text-sm shadow ${msg.type === "user" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" : "bg-white border border-gray-200 text-gray-800"}`}>
                  <p className="text-xs font-bold mb-1 opacity-70">{msg.type === "user" ? "👤 You" : "🤖 AI Assistant"}</p>
                  {msg.text}
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl text-sm text-gray-500 animate-pulse">🤖 Thinking...</div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask a question about this drug..."
              className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:border-indigo-400 outline-none bg-gray-50 focus:bg-white transition-all" />
            <button onClick={handleAsk} disabled={isAsking}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:shadow-xl transition-all disabled:opacity-50">
              Ask AI →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
