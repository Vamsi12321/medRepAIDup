"use client";
import { useState, useRef, useEffect } from "react";

// Common symptom/condition keywords for autosuggestion
const SYMPTOM_SUGGESTIONS = [
  "fever","headache","cough","cold","nausea","vomiting","diarrhea","constipation",
  "chest pain","shortness of breath","fatigue","dizziness","back pain","joint pain",
  "muscle pain","sore throat","runny nose","skin rash","itching","swelling",
  "high blood pressure","diabetes","anxiety","depression","insomnia","allergy",
  "infection","inflammation","hypertension","asthma","migraine","acidity",
  "stomach pain","weight loss","weight gain","hair loss","eye pain","ear pain",
  "urinary infection","kidney pain","liver disease","thyroid","anemia","cholesterol",
  "heart disease","stroke","epilepsy","arthritis","osteoporosis","cancer",
];

export default function SmartSearch({ onSearch, accentColor = "indigo" }) {
  const [mode, setMode]               = useState("keyword"); // "keyword" | "natural"
  const [chips, setChips]             = useState([]);
  const [inputVal, setInputVal]       = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [naturalQuery, setNaturalQuery] = useState("");
  const [showInfo, setShowInfo]       = useState(false);
  const inputRef = useRef(null);
  const accent = accentColor;

  // Notify parent whenever chips or natural query changes
  useEffect(() => {
    if (mode === "keyword") {
      onSearch({ mode: "keyword", chips });
    }
  }, [chips, mode]);

  useEffect(() => {
    if (mode === "natural") {
      onSearch({ mode: "natural", query: naturalQuery });
    }
  }, [naturalQuery, mode]);

  const handleInput = (val) => {
    setInputVal(val);
    if (!val.trim()) { setSuggestions([]); return; }
    const q = val.toLowerCase();
    const matches = SYMPTOM_SUGGESTIONS.filter(
      (s) => s.includes(q) && !chips.includes(s)
    ).slice(0, 6);
    setSuggestions(matches);
  };

  const addChip = (val) => {
    const v = val.trim().toLowerCase();
    if (!v || chips.includes(v)) return;
    const newChips = [...chips, v];
    setChips(newChips);
    setInputVal("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeChip = (chip) => setChips(chips.filter((c) => c !== chip));

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputVal.trim()) {
      e.preventDefault();
      addChip(inputVal);
    }
    if (e.key === "Backspace" && !inputVal && chips.length > 0) {
      setChips(chips.slice(0, -1));
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setChips([]);
    setInputVal("");
    setNaturalQuery("");
    setSuggestions([]);
    onSearch({ mode: m, chips: [], query: "" });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">Smart Search</span>
          <button onClick={() => setShowInfo((s) => !s)}
            className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 text-xs flex items-center justify-center font-bold transition-colors">
            ?
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
          <button onClick={() => switchMode("keyword")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === "keyword" ? `bg-${accent}-600 text-white shadow` : "text-gray-500 hover:text-gray-700"}`}>
            Symptoms
          </button>
          <button onClick={() => switchMode("natural")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === "natural" ? `bg-${accent}-600 text-white shadow` : "text-gray-500 hover:text-gray-700"}`}>
            Ask AI
          </button>
        </div>
      </div>

      {/* Info tooltip */}
      {showInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-xs text-blue-800 space-y-1.5">
          <p><span className="font-bold">Symptoms mode:</span> Type symptoms one by one (e.g. "fever", "headache") — each becomes a chip. Drugs matching any symptom will show.</p>
          <p><span className="font-bold">Ask AI mode:</span> Describe your case naturally — "patient has fever and joint pain" — and get AI-powered drug suggestions.</p>
        </div>
      )}

      {/* Keyword / chip mode */}
      {mode === "keyword" && (
        <div className="relative">
          <div
            onClick={() => inputRef.current?.focus()}
            className={`min-h-[46px] flex flex-wrap items-center gap-2 px-3 py-2 border-2 rounded-xl cursor-text transition-all ${inputVal || chips.length > 0 ? `border-${accent}-400 ring-2 ring-${accent}-100` : "border-gray-200"}`}>
            {chips.map((chip) => (
              <span key={chip}
                className={`flex items-center gap-1 bg-${accent}-100 text-${accent}-700 text-xs font-semibold px-2.5 py-1 rounded-full`}>
                {chip}
                <button onClick={() => removeChip(chip)} className="hover:text-red-500 transition-colors leading-none">×</button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={chips.length === 0 ? "Type a symptom (e.g. fever, headache)..." : "Add more..."}
              className="flex-1 min-w-[140px] outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Autosuggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {suggestions.map((s) => (
                <button key={s} onClick={() => addChip(s)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full bg-${accent}-400`} />
                  {s}
                </button>
              ))}
            </div>
          )}

          {chips.length > 0 && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">
                Searching for drugs matching: <span className={`text-${accent}-600 font-semibold`}>{chips.join(", ")}</span>
              </p>
              <button onClick={() => setChips([])} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear all</button>
            </div>
          )}
        </div>
      )}

      {/* Natural query mode */}
      {mode === "natural" && (
        <div className="space-y-2">
          <textarea
            value={naturalQuery}
            onChange={(e) => setNaturalQuery(e.target.value)}
            placeholder="Describe the condition naturally... e.g. 'Patient has high fever, joint pain and fatigue for 3 days'"
            rows={3}
            className={`w-full px-4 py-3 border-2 rounded-xl text-sm outline-none resize-none transition-all placeholder-gray-400 ${naturalQuery ? `border-${accent}-400 ring-2 ring-${accent}-100` : "border-gray-200"}`}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">AI-powered search — coming soon. Results will show below.</p>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">Beta</span>
          </div>
        </div>
      )}
    </div>
  );
}
