"use client";
import { useState, useEffect } from "react";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { useParams } from "next/navigation";

const drugData = {
  1: {
    name: "Amlodipine",
    indication: "Hypertension",
    drugClass: "Calcium Channel Blocker",
    dosage: "5mg-10mg daily",
    sideEffects: "Ankle swelling, dizziness, flushing, fatigue",
    company: "Generic Pharma",
    rating: 4.8,
    description: "Amlodipine is a long-acting calcium channel blocker used to treat high blood pressure and coronary artery disease.",
    color: "from-blue-500 via-indigo-500 to-purple-500",
    mechanism: "Blocks calcium channels in vascular smooth muscle, causing vasodilation",
    contraindications: "Severe aortic stenosis, cardiogenic shock",
    interactions: "Grapefruit juice, simvastatin, cyclosporine"
  },
  2: {
    name: "CardioSafe",
    indication: "Hypertension",
    drugClass: "Calcium Channel Blocker",
    dosage: "10mg daily",
    sideEffects: "Dizziness, fatigue, headache",
    company: "XYZ Pharma",
    rating: 4.9,
    description: "CardioSafe is a novel calcium channel blocker designed for effective blood pressure management with minimal side effects.",
    color: "from-rose-500 via-pink-500 to-fuchsia-500",
    mechanism: "Selective calcium channel blockade with enhanced cardiovascular protection",
    contraindications: "Severe hypotension, heart block",
    interactions: "Beta-blockers, digoxin, warfarin"
  },
  3: {
    name: "HeartFlow",
    indication: "Arrhythmia",
    drugClass: "Antiarrhythmic Agent",
    dosage: "20mg twice daily",
    sideEffects: "Nausea, dizziness, visual disturbances",
    company: "ABCD Labs",
    rating: 4.7,
    description: "HeartFlow helps maintain normal heart rhythm in patients with cardiac arrhythmias.",
    color: "from-blue-500 via-cyan-500 to-teal-500",
    mechanism: "Sodium channel blockade with prolonged refractory period",
    contraindications: "Complete heart block, severe heart failure",
    interactions: "Digoxin, warfarin, beta-blockers"
  },
  4: {
    name: "BPShield",
    indication: "Hypertension",
    drugClass: "ACE Inhibitor",
    dosage: "5mg daily",
    sideEffects: "Dry cough, hyperkalemia, angioedema",
    company: "MediCorp",
    rating: 4.6,
    description: "BPShield is an ACE inhibitor that provides comprehensive cardiovascular protection.",
    color: "from-green-500 via-emerald-500 to-teal-500",
    mechanism: "Inhibits angiotensin-converting enzyme, reducing vasoconstriction",
    contraindications: "Pregnancy, bilateral renal artery stenosis",
    interactions: "Potassium supplements, NSAIDs, lithium"
  },
  5: {
    name: "BetaGuard",
    indication: "Heart Failure",
    drugClass: "Beta Blocker",
    dosage: "25mg-50mg twice daily",
    sideEffects: "Fatigue, bradycardia, cold extremities",
    company: "PharmaTech",
    rating: 4.8,
    description: "BetaGuard is a selective beta-blocker for heart failure management.",
    color: "from-orange-500 via-red-500 to-pink-500",
    mechanism: "Selective beta-1 receptor blockade with cardioprotective effects",
    contraindications: "Severe bradycardia, cardiogenic shock, severe asthma",
    interactions: "Insulin, calcium channel blockers, digoxin"
  },
  6: {
    name: "Lisinopril",
    indication: "Hypertension",
    drugClass: "ACE Inhibitor",
    dosage: "10mg-20mg daily",
    sideEffects: "Dry cough, hyperkalemia, dizziness",
    company: "HealthCare Inc",
    rating: 4.7,
    description: "Lisinopril is a well-established ACE inhibitor for hypertension and heart failure.",
    color: "from-purple-500 via-violet-500 to-indigo-500",
    mechanism: "Inhibits ACE, preventing conversion of angiotensin I to angiotensin II",
    contraindications: "Pregnancy, hereditary angioedema",
    interactions: "Potassium-sparing diuretics, NSAIDs, lithium"
  },
  7: {
    name: "Metformin",
    indication: "Type 2 Diabetes",
    drugClass: "Biguanide",
    dosage: "500mg-1000mg twice daily",
    sideEffects: "Nausea, diarrhea, metallic taste, lactic acidosis (rare)",
    company: "DiabCare",
    rating: 4.9,
    description: "Metformin is the first-line treatment for type 2 diabetes mellitus.",
    color: "from-cyan-500 via-blue-500 to-indigo-500",
    mechanism: "Decreases hepatic glucose production and improves insulin sensitivity",
    contraindications: "Severe kidney disease, metabolic acidosis",
    interactions: "Contrast agents, alcohol, cimetidine"
  },
  8: {
    name: "Insulin Glargine",
    indication: "Diabetes",
    drugClass: "Long-acting Insulin",
    dosage: "10-80 units subcutaneous daily",
    sideEffects: "Hypoglycemia, injection site reactions, weight gain",
    company: "EndoCorp",
    rating: 4.8,
    description: "Insulin Glargine provides 24-hour glucose control with once-daily dosing.",
    color: "from-emerald-500 via-green-500 to-teal-500",
    mechanism: "Replaces endogenous insulin, facilitating glucose uptake",
    contraindications: "Hypoglycemia, hypersensitivity to insulin",
    interactions: "Beta-blockers, ACE inhibitors, alcohol"
  },
  9: {
    name: "Atorvastatin",
    indication: "High Cholesterol",
    drugClass: "HMG-CoA Reductase Inhibitor",
    dosage: "10mg-80mg daily",
    sideEffects: "Muscle pain, liver enzyme elevation, headache",
    company: "LipidCare",
    rating: 4.7,
    description: "Atorvastatin is a potent statin for cholesterol management and cardiovascular protection.",
    color: "from-yellow-500 via-orange-500 to-red-500",
    mechanism: "Inhibits HMG-CoA reductase, reducing cholesterol synthesis",
    contraindications: "Active liver disease, pregnancy, breastfeeding",
    interactions: "Grapefruit juice, cyclosporine, warfarin"
  },
  10: {
    name: "Losartan",
    indication: "Hypertension",
    drugClass: "Angiotensin Receptor Blocker",
    dosage: "25mg-100mg daily",
    sideEffects: "Dizziness, hyperkalemia, upper respiratory infection",
    company: "CardioMed",
    rating: 4.6,
    description: "Losartan is an ARB that provides effective blood pressure control with good tolerability.",
    color: "from-indigo-500 via-purple-500 to-pink-500",
    mechanism: "Blocks angiotensin II receptors, preventing vasoconstriction",
    contraindications: "Pregnancy, bilateral renal artery stenosis",
    interactions: "Potassium supplements, NSAIDs, lithium"
  },
  11: {
    name: "Omeprazole",
    indication: "GERD",
    drugClass: "Proton Pump Inhibitor",
    dosage: "20mg-40mg daily",
    sideEffects: "Headache, nausea, diarrhea, vitamin B12 deficiency",
    company: "GastroPharma",
    rating: 4.8,
    description: "Omeprazole effectively treats gastroesophageal reflux disease and peptic ulcers.",
    color: "from-green-500 via-lime-500 to-yellow-500",
    mechanism: "Irreversibly inhibits gastric proton pumps, reducing acid secretion",
    contraindications: "Hypersensitivity to benzimidazoles",
    interactions: "Clopidogrel, warfarin, digoxin"
  },
  12: {
    name: "Levothyroxine",
    indication: "Hypothyroidism",
    drugClass: "Thyroid Hormone",
    dosage: "25mcg-200mcg daily",
    sideEffects: "Palpitations, insomnia, weight loss, heat intolerance",
    company: "EndoHealth",
    rating: 4.9,
    description: "Levothyroxine is synthetic T4 hormone replacement therapy for hypothyroidism.",
    color: "from-pink-500 via-rose-500 to-red-500",
    mechanism: "Replaces endogenous thyroid hormone, regulating metabolism",
    contraindications: "Untreated adrenal insufficiency, recent myocardial infarction",
    interactions: "Iron supplements, calcium, coffee, soy products"
  },
  13: {
    name: "Sertraline",
    indication: "Depression",
    drugClass: "SSRI Antidepressant",
    dosage: "50mg-200mg daily",
    sideEffects: "Nausea, sexual dysfunction, insomnia, weight changes",
    company: "MindCare",
    rating: 4.7,
    description: "Sertraline is a selective serotonin reuptake inhibitor for depression and anxiety disorders.",
    color: "from-violet-500 via-purple-500 to-indigo-500",
    mechanism: "Selectively inhibits serotonin reuptake, improving mood",
    contraindications: "MAO inhibitor use, pimozide use",
    interactions: "MAO inhibitors, warfarin, NSAIDs, tramadol"
  },
  14: {
    name: "Albuterol",
    indication: "Asthma",
    drugClass: "Beta-2 Agonist",
    dosage: "90mcg/spray, 2 puffs every 4-6 hours",
    sideEffects: "Tremor, palpitations, nervousness, headache",
    company: "RespiraTech",
    rating: 4.8,
    description: "Albuterol is a short-acting bronchodilator for acute asthma and COPD symptoms.",
    color: "from-sky-500 via-blue-500 to-cyan-500",
    mechanism: "Stimulates beta-2 receptors, causing bronchodilation",
    contraindications: "Hypersensitivity to albuterol",
    interactions: "Beta-blockers, digoxin, diuretics"
  },
  15: {
    name: "Gabapentin",
    indication: "Neuropathic Pain",
    drugClass: "Anticonvulsant",
    dosage: "300mg-600mg three times daily",
    sideEffects: "Dizziness, somnolence, peripheral edema, ataxia",
    company: "NeuroPharma",
    rating: 4.6,
    description: "Gabapentin is an anticonvulsant used for neuropathic pain and seizure disorders.",
    color: "from-amber-500 via-orange-500 to-red-500",
    mechanism: "Modulates calcium channels, reducing neuronal excitability",
    contraindications: "Hypersensitivity to gabapentin",
    interactions: "Antacids, morphine, hydrocodone"
  },
  1: {
    name: "CardioSafe",
    indication: "Hypertension",
    drugClass: "Calcium Channel Blocker",
    dosage: "5mg daily",
    sideEffects: "Dizziness, fatigue, headache",
    company: "XYZ Pharma",
    rating: 4.9,
    description: "CardioSafe is a novel calcium channel blocker designed for effective blood pressure management with minimal side effects.",
    color: "from-rose-500 via-pink-500 to-fuchsia-500",
  },
  2: {
    name: "HeartFlow",
    indication: "Arrhythmia",
    drugClass: "Antiarrhythmic Agent",
    dosage: "200mg twice daily",
    sideEffects: "Nausea, dizziness",
    company: "ABCD Labs",
    rating: 4.7,
    description: "HeartFlow helps maintain normal heart rhythm in patients with cardiac arrhythmias.",
    color: "from-blue-500 via-cyan-500 to-teal-500",
  },
};

const documents = [
  { id: 1, name: "Drug Brochure", type: "PDF", size: "2.4 MB", icon: "📄", color: "from-red-500 to-orange-500" },
  { id: 2, name: "Clinical Trial Report", type: "PDF", size: "5.1 MB", icon: "📊", color: "from-blue-500 to-cyan-500" },
  { id: 3, name: "Presentation Slides", type: "PPT", size: "8.3 MB", icon: "📽️", color: "from-purple-500 to-pink-500" },
  { id: 4, name: "Safety Data Sheet", type: "PDF", size: "1.8 MB", icon: "🔒", color: "from-green-500 to-emerald-500" },
];

export default function DrugDetails() {
  const params = useParams();
  const drugId = params.id || "1";
  const drug = drugData[drugId] || drugData[1];
  
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("doctor");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) {
      setUserRole(role);
    }
  }, []);

  const handleAskQuestion = () => {
    if (!question.trim()) return;

    const userMessage = { type: "user", text: question };
    setChatHistory([...chatHistory, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      let aiResponse = "";
      const questionLower = question.toLowerCase();
      
      if (questionLower.includes("safe") || questionLower.includes("elderly")) {
        aiResponse = `Based on clinical data for ${drug.name}, it should be used with caution in elderly patients. Monitor for ${drug.sideEffects.toLowerCase()}. Contraindications include: ${drug.contraindications.toLowerCase()}. Always start with the lowest effective dose.`;
      } else if (questionLower.includes("contraindication")) {
        aiResponse = `${drug.name} is contraindicated in patients with: ${drug.contraindications}. Always review patient history before prescribing.`;
      } else if (questionLower.includes("combination") || questionLower.includes("interact")) {
        aiResponse = `${drug.name} has important interactions with: ${drug.interactions}. Monitor closely when used with these medications and adjust doses as needed.`;
      } else if (questionLower.includes("mechanism") || questionLower.includes("action")) {
        aiResponse = `${drug.name} works through the following mechanism: ${drug.mechanism}. This makes it effective for treating ${drug.indication.toLowerCase()}.`;
      } else if (questionLower.includes("dose") || questionLower.includes("dosage")) {
        aiResponse = `The recommended dosage for ${drug.name} is ${drug.dosage}. Start with the lowest effective dose and titrate based on patient response and tolerability.`;
      } else if (questionLower.includes("side effect")) {
        aiResponse = `Common side effects of ${drug.name} include: ${drug.sideEffects}. Most side effects are mild and resolve with continued use or dose adjustment.`;
      } else {
        aiResponse = `${drug.name} is a ${drug.drugClass.toLowerCase()} used for ${drug.indication.toLowerCase()}. The recommended dosage is ${drug.dosage}. Key considerations include monitoring for ${drug.sideEffects.toLowerCase()} and avoiding use in patients with ${drug.contraindications.toLowerCase()}.`;
      }
      
      const aiMessage = {
        type: "ai",
        text: aiResponse
      };
      setChatHistory((prev) => [...prev, aiMessage]);
      setIsLoading(false);
      setQuestion("");
    }, 1500);
  };

  const exampleQuestions = [
    "Is this drug safe for elderly patients?",
    "What are the contraindications?",
    "Can it be combined with other medications?",
    "What is the mechanism of action?",
    "What are the common side effects?",
    "What is the recommended dosage?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {userRole === "mr" ? <MRNavbar /> : <DoctorNavbar />}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <Breadcrumb customItems={[
          { label: userRole === "mr" ? "💼 MR Portal" : "👨‍⚕️ Doctor", href: userRole === "mr" ? "/mr/dashboard" : "/doctor/home" },
          { label: "🔍 Drug Search", href: userRole === "mr" ? "/mr/drug-search" : "/doctor/drug-search" },
          { label: `💊 ${drug.name}`, href: null }
        ]} />
        {/* Drug Header */}
        <div className="bg-white rounded-3xl p-10 shadow-2xl mb-10 border border-gray-100 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${drug.color} opacity-10 rounded-full -mr-48 -mt-48`}></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-5xl font-bold text-gray-800">{drug.name}</h1>
                <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 px-5 py-2 rounded-xl shadow-lg">
                  <span className="text-white font-bold mr-2 text-xl">⭐</span>
                  <span className="font-bold text-white text-lg">{drug.rating}</span>
                </div>
              </div>
              
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">{drug.description}</p>
              
              <div className="flex items-center space-x-4">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                  {drug.indication}
                </span>
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                  {drug.company}
                </span>
              </div>
            </div>
            
            <div className={`w-32 h-32 bg-gradient-to-br ${drug.color} rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-300`}>
              <span className="text-white text-6xl font-bold">{drug.name[0]}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Drug Information */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-xl">💊</span>
              </div>
              Drug Information
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border-l-4 border-indigo-500">
                <p className="text-sm text-indigo-600 font-semibold mb-2">💊 Indication</p>
                <p className="text-lg font-bold text-gray-800">{drug.indication}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border-l-4 border-blue-500">
                <p className="text-sm text-blue-600 font-semibold mb-2">🧬 Drug Class</p>
                <p className="text-lg font-bold text-gray-800">{drug.drugClass}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border-l-4 border-green-500">
                <p className="text-sm text-green-600 font-semibold mb-2">📏 Dosage</p>
                <p className="text-lg font-bold text-gray-800">{drug.dosage}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 border-l-4 border-yellow-500">
                <p className="text-sm text-yellow-600 font-semibold mb-2">⚙️ Mechanism of Action</p>
                <p className="text-lg font-bold text-gray-800">{drug.mechanism}</p>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-5 border-l-4 border-orange-500">
                <p className="text-sm text-orange-600 font-semibold mb-2">⚠️ Side Effects</p>
                <p className="text-lg font-bold text-gray-800">{drug.sideEffects}</p>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-5 border-l-4 border-red-500">
                <p className="text-sm text-red-600 font-semibold mb-2">🚫 Contraindications</p>
                <p className="text-lg font-bold text-gray-800">{drug.contraindications}</p>
              </div>
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-5 border-l-4 border-pink-500">
                <p className="text-sm text-pink-600 font-semibold mb-2">🔄 Drug Interactions</p>
                <p className="text-lg font-bold text-gray-800">{drug.interactions}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 border-l-4 border-purple-500">
                <p className="text-sm text-purple-600 font-semibold mb-2">🏢 Manufacturer</p>
                <p className="text-lg font-bold text-gray-800">{drug.company}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-xl">📁</span>
              </div>
              Documents & Resources
            </h2>
            
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border border-gray-200 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${doc.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <span className="text-2xl">{doc.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                          {doc.name}
                        </p>
                        <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Chat Section */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <span className="text-2xl">🤖</span>
            </div>
            Ask AI About This Drug
          </h2>

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="mb-8 space-y-4 max-h-96 overflow-y-auto bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-2xl px-6 py-4 rounded-2xl shadow-lg ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm font-bold mb-2 flex items-center">
                      {message.type === "user" ? (
                        <>
                          <span className="mr-2">👤</span>
                          You
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🤖</span>
                          AI Assistant
                        </>
                      )}
                    </p>
                    <p className="leading-relaxed">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-gray-200">
                    <p className="text-gray-500 flex items-center">
                      <span className="mr-2">🤖</span>
                      AI is thinking
                      <span className="ml-2 animate-pulse">...</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Example Questions */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 font-semibold mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Example questions:
            </p>
            <div className="flex flex-wrap gap-3">
              {exampleQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => setQuestion(q)}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-5 py-3 rounded-xl text-sm font-semibold hover:from-indigo-100 hover:to-purple-100 transition-all border border-indigo-200 hover:shadow-md"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Question Input */}
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Ask a question about this drug..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-lg shadow-sm bg-gray-50 focus:bg-white transition-all"
            />
            <button
              onClick={handleAskQuestion}
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ask AI →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
