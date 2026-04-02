"use client";
import { useState, useEffect } from "react";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { useParams } from "next/navigation";

const drugData = {
  1:  { name: "Amlodipine",       indication: "Hypertension",     drugClass: "Calcium Channel Blocker",        dosage: "5mg-10mg daily",              sideEffects: "Ankle swelling, dizziness, flushing, fatigue",                    company: "Generic Pharma",  mechanism: "Blocks calcium channels in vascular smooth muscle, causing vasodilation",                                    contraindications: "Severe aortic stenosis, cardiogenic shock",                    interactions: "Grapefruit juice, simvastatin, cyclosporine",       color: "from-blue-500 via-indigo-500 to-purple-500" },
  2:  { name: "CardioSafe",       indication: "Hypertension",     drugClass: "Calcium Channel Blocker",        dosage: "10mg daily",                  sideEffects: "Dizziness, fatigue, headache",                                    company: "XYZ Pharma",      mechanism: "Selective calcium channel blockade with enhanced cardiovascular protection",                                  contraindications: "Severe hypotension, heart block",                              interactions: "Beta-blockers, digoxin, warfarin",                   color: "from-rose-500 via-pink-500 to-fuchsia-500" },
  3:  { name: "HeartFlow",        indication: "Arrhythmia",       drugClass: "Antiarrhythmic Agent",           dosage: "20mg twice daily",            sideEffects: "Nausea, dizziness, visual disturbances",                          company: "ABCD Labs",       mechanism: "Sodium channel blockade with prolonged refractory period",                                                   contraindications: "Complete heart block, severe heart failure",                   interactions: "Digoxin, warfarin, beta-blockers",                   color: "from-blue-500 via-cyan-500 to-teal-500" },
  4:  { name: "BPShield",         indication: "Hypertension",     drugClass: "ACE Inhibitor",                  dosage: "5mg daily",                   sideEffects: "Dry cough, hyperkalemia, angioedema",                             company: "MediCorp",        mechanism: "Inhibits angiotensin-converting enzyme, reducing vasoconstriction",                                          contraindications: "Pregnancy, bilateral renal artery stenosis",                   interactions: "Potassium supplements, NSAIDs, lithium",             color: "from-green-500 via-emerald-500 to-teal-500" },
  5:  { name: "BetaGuard",        indication: "Heart Failure",    drugClass: "Beta Blocker",                   dosage: "25mg-50mg twice daily",       sideEffects: "Fatigue, bradycardia, cold extremities",                          company: "PharmaTech",      mechanism: "Selective beta-1 receptor blockade with cardioprotective effects",                                           contraindications: "Severe bradycardia, cardiogenic shock, severe asthma",         interactions: "Insulin, calcium channel blockers, digoxin",         color: "from-orange-500 via-red-500 to-pink-500" },
  6:  { name: "Lisinopril",       indication: "Hypertension",     drugClass: "ACE Inhibitor",                  dosage: "10mg-20mg daily",             sideEffects: "Dry cough, hyperkalemia, dizziness",                              company: "HealthCare Inc",  mechanism: "Inhibits ACE, preventing conversion of angiotensin I to angiotensin II",                                     contraindications: "Pregnancy, hereditary angioedema",                             interactions: "Potassium-sparing diuretics, NSAIDs, lithium",       color: "from-purple-500 via-violet-500 to-indigo-500" },
  7:  { name: "Metformin",        indication: "Type 2 Diabetes",  drugClass: "Biguanide",                      dosage: "500mg-1000mg twice daily",    sideEffects: "Nausea, diarrhea, metallic taste, lactic acidosis (rare)",        company: "DiabCare",        mechanism: "Decreases hepatic glucose production and improves insulin sensitivity",                                      contraindications: "Severe kidney disease, metabolic acidosis",                    interactions: "Contrast agents, alcohol, cimetidine",               color: "from-cyan-500 via-blue-500 to-indigo-500" },
  8:  { name: "Insulin Glargine", indication: "Diabetes",         drugClass: "Long-acting Insulin",            dosage: "10-80 units subcutaneous daily", sideEffects: "Hypoglycemia, injection site reactions, weight gain",            company: "EndoCorp",        mechanism: "Replaces endogenous insulin, facilitating glucose uptake",                                                   contraindications: "Hypoglycemia, hypersensitivity to insulin",                    interactions: "Beta-blockers, ACE inhibitors, alcohol",             color: "from-emerald-500 via-green-500 to-teal-500" },
  9:  { name: "Atorvastatin",     indication: "High Cholesterol", drugClass: "HMG-CoA Reductase Inhibitor",    dosage: "10mg-80mg daily",             sideEffects: "Muscle pain, liver enzyme elevation, headache",                   company: "LipidCare",       mechanism: "Inhibits HMG-CoA reductase, reducing cholesterol synthesis",                                                 contraindications: "Active liver disease, pregnancy, breastfeeding",               interactions: "Grapefruit juice, cyclosporine, warfarin",           color: "from-yellow-500 via-orange-500 to-red-500" },
  10: { name: "Losartan",         indication: "Hypertension",     drugClass: "Angiotensin Receptor Blocker",   dosage: "25mg-100mg daily",            sideEffects: "Dizziness, hyperkalemia, upper respiratory infection",            company: "CardioMed",       mechanism: "Blocks angiotensin II receptors, preventing vasoconstriction",                                               contraindications: "Pregnancy, bilateral renal artery stenosis",                   interactions: "Potassium supplements, NSAIDs, lithium",             color: "from-indigo-500 via-purple-500 to-pink-500" },
  11: { name: "Omeprazole",       indication: "GERD",             drugClass: "Proton Pump Inhibitor",          dosage: "20mg-40mg daily",             sideEffects: "Headache, nausea, diarrhea, vitamin B12 deficiency",              company: "GastroPharma",    mechanism: "Irreversibly inhibits gastric proton pumps, reducing acid secretion",                                        contraindications: "Hypersensitivity to benzimidazoles",                           interactions: "Clopidogrel, warfarin, digoxin",                     color: "from-green-500 via-lime-500 to-yellow-500" },
  12: { name: "Levothyroxine",    indication: "Hypothyroidism",   drugClass: "Thyroid Hormone",                dosage: "25mcg-200mcg daily",          sideEffects: "Palpitations, insomnia, weight loss, heat intolerance",           company: "EndoHealth",      mechanism: "Replaces endogenous thyroid hormone, regulating metabolism",                                                 contraindications: "Untreated adrenal insufficiency, recent myocardial infarction", interactions: "Iron supplements, calcium, coffee, soy products",    color: "from-pink-500 via-rose-500 to-red-500" },
  13: { name: "Sertraline",       indication: "Depression",       drugClass: "SSRI Antidepressant",            dosage: "50mg-200mg daily",            sideEffects: "Nausea, sexual dysfunction, insomnia, weight changes",            company: "MindCare",        mechanism: "Selectively inhibits serotonin reuptake, improving mood",                                                    contraindications: "MAO inhibitor use, pimozide use",                              interactions: "MAO inhibitors, warfarin, NSAIDs, tramadol",         color: "from-violet-500 via-purple-500 to-indigo-500" },
  14: { name: "Albuterol",        indication: "Asthma",           drugClass: "Beta-2 Agonist",                 dosage: "90mcg/spray, 2 puffs q4-6h",  sideEffects: "Tremor, palpitations, nervousness, headache",                     company: "RespiraTech",     mechanism: "Stimulates beta-2 receptors, causing bronchodilation",                                                       contraindications: "Hypersensitivity to albuterol",                                interactions: "Beta-blockers, digoxin, diuretics",                  color: "from-sky-500 via-blue-500 to-cyan-500" },
  15: { name: "Gabapentin",       indication: "Neuropathic Pain", drugClass: "Anticonvulsant",                 dosage: "300mg-600mg three times daily", sideEffects: "Dizziness, somnolence, peripheral edema, ataxia",                company: "NeuroPharma",     mechanism: "Modulates calcium channels, reducing neuronal excitability",                                                 contraindications: "Hypersensitivity to gabapentin",                               interactions: "Antacids, morphine, hydrocodone",                    color: "from-amber-500 via-orange-500 to-red-500" },
};

export default function DrugDetails() {
  const params  = useParams();
  const drugId  = params.id;
  const drug    = drugData[drugId] || drugData[1];

  const [userRole, setUserRole]       = useState("doctor");
  const [question, setQuestion]       = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading]     = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) setUserRole(role);
  }, []);

  const handleAsk = () => {
    if (!question.trim()) return;
    setChatHistory((p) => [...p, { type: "user", text: question }]);
    setIsLoading(true);
    const q = question.toLowerCase();
    setTimeout(() => {
      let answer = "";
      if (q.includes("side effect"))           answer = `Common side effects of ${drug.name}: ${drug.sideEffects}.`;
      else if (q.includes("contraindication")) answer = `${drug.name} is contraindicated in: ${drug.contraindications}.`;
      else if (q.includes("mechanism") || q.includes("action")) answer = `${drug.name} works by: ${drug.mechanism}.`;
      else if (q.includes("dose") || q.includes("dosage"))      answer = `Recommended dosage for ${drug.name}: ${drug.dosage}.`;
      else if (q.includes("interact"))         answer = `${drug.name} interactions: ${drug.interactions}.`;
      else answer = `${drug.name} is a ${drug.drugClass} used for ${drug.indication}. Dosage: ${drug.dosage}. Key side effects: ${drug.sideEffects}.`;
      setChatHistory((p) => [...p, { type: "ai", text: answer }]);
      setIsLoading(false);
      setQuestion("");
    }, 1200);
  };

  const fields = [
    { label: "💊 Indication",          value: drug.indication },
    { label: "🧬 Drug Class",          value: drug.drugClass },
    { label: "📏 Dosage",              value: drug.dosage },
    { label: "⚙️ Mechanism of Action", value: drug.mechanism },
    { label: "⚠️ Side Effects",        value: drug.sideEffects },
    { label: "🚫 Contraindications",   value: drug.contraindications },
    { label: "🔄 Drug Interactions",   value: drug.interactions },
    { label: "🏢 Manufacturer",        value: drug.company },
  ];

  const colors = ["border-indigo-400","border-blue-400","border-green-400","border-yellow-400","border-orange-400","border-red-400","border-pink-400","border-purple-400"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {userRole === "mr" ? <MRNavbar /> : <DoctorNavbar />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb customItems={[
          { label: userRole === "mr" ? "💼 MR Portal" : "👨‍⚕️ Doctor", href: userRole === "mr" ? "/mr/dashboard" : "/doctor/home" },
          { label: "🔍 Drug Search", href: userRole === "mr" ? "/mr/drug-search" : "/doctor/drug-search" },
          { label: `💊 ${drug.name}`, href: null },
        ]} />

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${drug.color} opacity-10 rounded-full -mr-40 -mt-40`} />
          <div className="relative flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">{drug.name}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2 rounded-xl font-bold shadow">{drug.indication}</span>
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2 rounded-xl font-bold shadow">{drug.company}</span>
              </div>
            </div>
            <div className={`w-24 h-24 bg-gradient-to-br ${drug.color} rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0`}>
              <span className="text-white text-4xl font-bold">{drug.name[0]}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Drug info */}
          <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center"><span>💊</span></div>
              Drug Information
            </h2>
            <div className="space-y-3">
              {fields.map((f, i) => (
                <div key={f.label} className={`bg-gray-50 rounded-xl p-4 border-l-4 ${colors[i % colors.length]}`}>
                  <p className="text-xs font-bold text-gray-500 mb-1">{f.label}</p>
                  <p className="text-gray-800 font-medium text-sm">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents & Resources */}
          <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center"><span>📁</span></div>
              Documents & Resources
            </h2>
            <div className="space-y-4">
              {[
                { name: "Drug Brochure",          type: "PDF", size: "2.4 MB", icon: "📄", color: "from-red-500 to-orange-500" },
                { name: "Clinical Trial Report",  type: "PDF", size: "5.1 MB", icon: "📊", color: "from-blue-500 to-cyan-500" },
                { name: "Presentation Slides",    type: "PPT", size: "8.3 MB", icon: "📽️", color: "from-purple-500 to-pink-500" },
                { name: "Safety Data Sheet",      type: "PDF", size: "1.8 MB", icon: "🔒", color: "from-green-500 to-emerald-500" },
              ].map((doc, i) => (
                <div key={i} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${doc.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <span className="text-xl">{doc.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.type} · {doc.size}</p>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Chat — full width at bottom */}
        <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center"><span>🤖</span></div>
            Ask AI About This Drug
          </h2>

          <div className="overflow-y-auto space-y-3 mb-4 max-h-64">
            {chatHistory.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {["What are the side effects?","What are the contraindications?","What is the mechanism of action?","What is the dosage?"].map((q) => (
                  <button key={q} onClick={() => setQuestion(q)}
                    className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-100 border border-indigo-200 transition-all">
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
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl text-sm text-gray-500 animate-pulse">🤖 AI is thinking...</div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask a question about this drug..."
              className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:border-indigo-400 outline-none bg-gray-50 focus:bg-white transition-all" />
            <button onClick={handleAsk} disabled={isLoading}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:shadow-xl transition-all disabled:opacity-50">
              Ask AI →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
