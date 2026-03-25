"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

const allDrugs = [
  { id: 1, name: "Amlodipine", indication: "Hypertension", company: "Generic Pharma", category: "Cardiovascular", rating: 4.8, reviews: 234, status: "Active", dosage: "5mg-10mg", symptoms: ["chest pain", "high blood pressure", "dizziness", "headache"] },
  { id: 2, name: "CardioSafe", indication: "Hypertension", company: "XYZ Pharma", category: "Cardiovascular", rating: 4.9, reviews: 189, status: "New", dosage: "10mg", symptoms: ["high blood pressure", "chest pain", "palpitations"] },
  { id: 3, name: "HeartFlow", indication: "Arrhythmia", company: "ABCD Labs", category: "Cardiovascular", rating: 4.7, reviews: 456, status: "New", dosage: "20mg", symptoms: ["irregular heartbeat", "palpitations", "chest pain", "dizziness"] },
  { id: 4, name: "BPShield", indication: "Hypertension", company: "MediCorp", category: "Cardiovascular", rating: 4.6, reviews: 123, status: "Active", dosage: "5mg", symptoms: ["high blood pressure", "headache", "fatigue"] },
  { id: 5, name: "BetaGuard", indication: "Heart Failure", company: "PharmaTech", category: "Cardiovascular", rating: 4.8, reviews: 345, status: "Active", dosage: "25mg-50mg", symptoms: ["shortness of breath", "fatigue", "swelling", "chest pain"] },
  { id: 6, name: "Lisinopril", indication: "Hypertension", company: "HealthCare Inc", category: "Cardiovascular", rating: 4.7, reviews: 567, status: "Active", dosage: "10mg-20mg", symptoms: ["high blood pressure", "chest pain", "dizziness"] },
  { id: 7, name: "Metformin", indication: "Type 2 Diabetes", company: "DiabCare", category: "Diabetes", rating: 4.9, reviews: 890, status: "Active", dosage: "500mg-1000mg", symptoms: ["high blood sugar", "frequent urination", "excessive thirst", "fatigue"] },
  { id: 8, name: "Insulin Glargine", indication: "Diabetes", company: "EndoCorp", category: "Diabetes", rating: 4.8, reviews: 678, status: "Active", dosage: "10-80 units", symptoms: ["high blood sugar", "frequent urination", "blurred vision", "fatigue"] },
  { id: 9, name: "Atorvastatin", indication: "High Cholesterol", company: "LipidCare", category: "Cardiovascular", rating: 4.7, reviews: 723, status: "Active", dosage: "10mg-80mg", symptoms: ["high cholesterol", "chest pain", "fatigue"] },
  { id: 10, name: "Losartan", indication: "Hypertension", company: "CardioMed", category: "Cardiovascular", rating: 4.6, reviews: 445, status: "Active", dosage: "25mg-100mg", symptoms: ["high blood pressure", "dizziness", "headache"] },
  { id: 11, name: "Omeprazole", indication: "GERD", company: "GastroPharma", category: "Gastroenterology", rating: 4.8, reviews: 612, status: "Active", dosage: "20mg-40mg", symptoms: ["heartburn", "acid reflux", "stomach pain", "nausea"] },
  { id: 12, name: "Levothyroxine", indication: "Hypothyroidism", company: "EndoHealth", category: "Endocrinology", rating: 4.9, reviews: 834, status: "Active", dosage: "25mcg-200mcg", symptoms: ["fatigue", "weight gain", "cold intolerance", "depression"] },
  { id: 13, name: "Sertraline", indication: "Depression", company: "MindCare", category: "Psychiatry", rating: 4.7, reviews: 556, status: "Active", dosage: "50mg-200mg", symptoms: ["depression", "anxiety", "mood swings", "sleep problems"] },
  { id: 14, name: "Albuterol", indication: "Asthma", company: "RespiraTech", category: "Respiratory", rating: 4.8, reviews: 489, status: "Active", dosage: "90mcg/spray", symptoms: ["shortness of breath", "wheezing", "cough", "chest tightness"] },
  { id: 15, name: "Gabapentin", indication: "Neuropathic Pain", company: "NeuroPharma", category: "Neurology", rating: 4.6, reviews: 378, status: "Active", dosage: "300mg-600mg", symptoms: ["nerve pain", "tingling", "numbness", "burning sensation"] },
];

export default function DoctorDrugSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isSymptomMode, setIsSymptomMode] = useState(false);
  const [showSymptomPrompt, setShowSymptomPrompt] = useState(false);
  const [currentSymptom, setCurrentSymptom] = useState("");
  const [collectedSymptoms, setCollectedSymptoms] = useState([]);
  const [promptStep, setPromptStep] = useState("input"); // "input" or "continue"



  const handleSymptomSearch = () => {
    setIsSymptomMode(true);
    setShowSymptomPrompt(true);
    setSearchTerm("");
    setCollectedSymptoms([]);
    setCurrentSymptom("");
    setPromptStep("input");
  };

  const handleRegularSearch = () => {
    setIsSymptomMode(false);
    setShowSymptomPrompt(false);
    setCollectedSymptoms([]);
    setCurrentSymptom("");
  };

  const handleSymptomSubmit = () => {
    if (currentSymptom.trim()) {
      setCollectedSymptoms([...collectedSymptoms, currentSymptom.trim()]);
      setCurrentSymptom("");
      setPromptStep("continue");
    }
  };

  const handleAddMoreSymptoms = () => {
    setPromptStep("input");
  };

  const handleFinishSymptoms = () => {
    setShowSymptomPrompt(false);
  };

  const handleRemoveSymptom = (index) => {
    setCollectedSymptoms(collectedSymptoms.filter((_, i) => i !== index));
  };

  const filteredDrugs = allDrugs.filter((drug) => {
    // If symptom search is active and we have collected symptoms
    if (isSymptomMode && collectedSymptoms.length > 0) {
      return collectedSymptoms.some(symptom => 
        drug.symptoms.some(drugSymptom => 
          drugSymptom.toLowerCase().includes(symptom.toLowerCase()) ||
          drug.indication.toLowerCase().includes(symptom.toLowerCase()) ||
          drug.name.toLowerCase().includes(symptom.toLowerCase())
        )
      );
    }
    
    // Regular text search
    if (!isSymptomMode && searchTerm.trim()) {
      return drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             drug.indication.toLowerCase().includes(searchTerm.toLowerCase()) ||
             drug.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
             drug.category.toLowerCase().includes(searchTerm.toLowerCase());
    }

    // Show all drugs if no search term
    return true;
  });

  const sortedDrugs = [...filteredDrugs].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 overflow-x-hidden">
      <DoctorNavbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <Breadcrumb />
        
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-4 sm:p-6 shadow-lg text-white">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">💊 Drug Database</h1>
            <p className="text-indigo-100 text-xs sm:text-sm">Comprehensive medication library with detailed information</p>
          </div>

        {/* Search Mode Toggle */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-indigo-100 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={handleRegularSearch}
              className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                !isSymptomMode
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>🔍</span>
              <span className="text-sm">Drug Search</span>
            </button>
            <button
              onClick={handleSymptomSearch}
              className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                isSymptomMode
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>🩺</span>
              <span className="text-sm">Symptom Search</span>
            </button>
          </div>

          {/* Regular Search Input */}
          {!isSymptomMode && (
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search by drug name, indication, company, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm font-medium transition-all shadow-sm"
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          {/* Collected Symptoms Display */}
          {isSymptomMode && collectedSymptoms.length > 0 && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm font-semibold text-green-700 mb-3">🩺 Collected Symptoms:</p>
              <div className="flex flex-wrap gap-2">
                {collectedSymptoms.map((symptom, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center space-x-2"
                  >
                    <span>{symptom}</span>
                    <button
                      onClick={() => handleRemoveSymptom(index)}
                      className="text-green-600 hover:text-green-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleAddMoreSymptoms}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all text-sm"
                >
                  + Add More Symptoms
                </button>
                <button
                  onClick={() => setCollectedSymptoms([])}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Empty State for Symptom Mode */}
          {isSymptomMode && collectedSymptoms.length === 0 && !showSymptomPrompt && (
            <div className="text-center py-8 bg-green-50 rounded-xl border border-green-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🩺</span>
              </div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Ready for Symptom Search</h3>
              <p className="text-green-600 text-sm mb-4">Click "Symptom Search" above to start collecting symptoms one by one</p>
            </div>
          )}

          {/* View Mode Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-gray-700">Sort:</span>
              <select className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 font-semibold text-sm">
                <option>A-Z</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode("grid")} className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button onClick={() => setViewMode("list")} className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Step-by-Step Symptom Collection Modal */}
        {showSymptomPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🩺</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Symptom Collection</h3>
                <p className="text-gray-600">
                  {promptStep === "input" 
                    ? `Tell me about ${collectedSymptoms.length === 0 ? 'the first' : 'another'} symptom`
                    : "Do you have more symptoms to add?"
                  }
                </p>
              </div>

              {promptStep === "input" && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter a symptom:
                  </label>
                  <input
                    type="text"
                    value={currentSymptom}
                    onChange={(e) => setCurrentSymptom(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSymptomSubmit()}
                    placeholder="e.g., chest pain, headache, fatigue..."
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Examples: chest pain, dizziness, high blood pressure, fatigue, headache
                  </p>
                </div>
              )}

              {promptStep === "continue" && collectedSymptoms.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-green-700 mb-3">✅ Added symptom:</p>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-semibold">
                      {collectedSymptoms[collectedSymptoms.length - 1]}
                    </span>
                  </div>
                  
                  {collectedSymptoms.length > 1 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">All symptoms so far:</p>
                      <div className="flex flex-wrap gap-2">
                        {collectedSymptoms.map((symptom, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center space-x-4">
                {promptStep === "input" ? (
                  <>
                    <button
                      onClick={() => setShowSymptomPrompt(false)}
                      className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSymptomSubmit}
                      disabled={!currentSymptom.trim()}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Symptom
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFinishSymptoms}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg"
                    >
                      🔍 Search Drugs ({collectedSymptoms.length} symptoms)
                    </button>
                    <button
                      onClick={handleAddMoreSymptoms}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg"
                    >
                      + Add More
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 font-semibold">
            {isSymptomMode && collectedSymptoms.length > 0 ? (
              <>
                Showing <span className="text-green-600 font-bold">{sortedDrugs.length}</span> drugs matching {collectedSymptoms.length} symptom{collectedSymptoms.length > 1 ? 's' : ''}
              </>
            ) : (
              <>
                Showing <span className="text-indigo-600 font-bold">{sortedDrugs.length}</span> drugs
              </>
            )}
          </p>
        </div>

        {/* Drug Results */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDrugs.map((drug) => (
              <Link key={drug.id} href={`/drug-details/${drug.id}`}>
                <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">{drug.name}</h3>
                      {drug.status === "New" && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                          🆕 New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
                      <span className="text-yellow-500 font-bold mr-1 text-sm">⭐</span>
                      <span className="text-xs font-bold text-yellow-700">{drug.rating}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Company</span>
                      <span className="text-gray-900 font-semibold">{drug.company}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Category</span>
                      <span className="text-indigo-600 font-semibold">{drug.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Indication</span>
                      <span className="text-gray-900 font-semibold">{drug.indication}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Dosage</span>
                      <span className="text-gray-900 font-semibold">{drug.dosage}</span>
                    </div>
                    {isSymptomMode && collectedSymptoms.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-600 font-medium mb-1">Treats symptoms:</p>
                        <div className="flex flex-wrap gap-1">
                          {drug.symptoms.slice(0, 3).map((symptom, index) => (
                            <span key={index} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                              {symptom}
                            </span>
                          ))}
                          {drug.symptoms.length > 3 && (
                            <span className="text-xs text-gray-500">+{drug.symptoms.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg font-bold shadow-sm hover:shadow-md transition-all text-sm">
                    View Details →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedDrugs.map((drug) => (
              <Link key={drug.id} href={`/drug-details/${drug.id}`}>
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{drug.name}</h3>
                        {drug.status === "New" && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">
                            🆕 New
                          </span>
                        )}
                        <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                          <span className="text-yellow-500 font-bold mr-1 text-xs">⭐</span>
                          <span className="text-xs font-bold text-yellow-700">{drug.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                        <span><span className="font-medium">Company:</span> <span className="font-semibold text-gray-900">{drug.company}</span></span>
                        <span><span className="font-medium">Category:</span> <span className="font-semibold text-indigo-600">{drug.category}</span></span>
                        <span><span className="font-medium">Indication:</span> <span className="font-semibold text-gray-900">{drug.indication}</span></span>
                        <span><span className="font-medium">Dosage:</span> <span className="font-semibold text-gray-900">{drug.dosage}</span></span>
                      </div>
                      {isSymptomMode && collectedSymptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-xs text-gray-600 font-medium mr-2">Symptoms:</span>
                          {drug.symptoms.slice(0, 4).map((symptom, index) => (
                            <span key={index} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                              {symptom}
                            </span>
                          ))}
                          {drug.symptoms.length > 4 && (
                            <span className="text-xs text-gray-500">+{drug.symptoms.length - 4} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:shadow-md transition-all text-sm ml-4">
                      View Details →
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {sortedDrugs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No drugs found</h3>
            <p className="text-gray-600 text-sm">
              {isSymptomMode && collectedSymptoms.length > 0 
                ? "Try different symptoms or add more symptoms to your search" 
                : "Try adjusting your search terms"
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
