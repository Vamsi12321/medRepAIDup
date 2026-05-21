"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";

const TABS = [
  { id: "primary",   label: "Primary Sales",                 icon: "📦" },
  { id: "secondary", label: "Secondary Sales",                icon: "🏪" },
  { id: "mvc",       label: "MVC (Monthly Visit Coverage)",   icon: "🔄" },
  { id: "mcr",       label: "MCR (Monthly Call Report)",      icon: "📞" },
];

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK = {
  primary: {
    total_sales: "₹4,85,000", target: "₹5,00,000", achievement_pct: 97,
    top_product: "Amlodipine 5mg", monthly_trend: "+12%",
    products: [
      { name: "Amlodipine 5mg", value: "₹1,45,000", pct: 95 },
      { name: "Metformin 500mg", value: "₹1,20,000", pct: 80 },
      { name: "Atorvastatin 10mg", value: "₹98,000", pct: 72 },
      { name: "Pantoprazole 40mg", value: "₹72,000", pct: 60 },
      { name: "Azithromycin 250mg", value: "₹50,000", pct: 45 },
    ],
    territories: [
      { name: "Hyderabad Urban", value: "₹2,10,000", pct: 105 },
      { name: "Secunderabad", value: "₹1,45,000", pct: 90 },
      { name: "Kukatpally", value: "₹80,000", pct: 75 },
      { name: "Gachibowli", value: "₹50,000", pct: 62 },
    ],
  },
  secondary: {
    retail_sales: "₹3,20,000", prescriptions: "847", stock_movement: "92%", growth: "+8.5%",
    doctor_prescriptions: [
      { name: "Dr. Arjun Mehta", specialization: "Cardiologist", count: 145 },
      { name: "Dr. Sneha Reddy", specialization: "Diabetologist", count: 120 },
      { name: "Dr. Vikram Patel", specialization: "General Physician", count: 98 },
      { name: "Dr. Priya Sharma", specialization: "Neurologist", count: 76 },
      { name: "Dr. Rahul Gupta", specialization: "Orthopedic", count: 54 },
    ],
  },
  mvc: {
    doctors_covered: "42", missed_doctors: "8", repeat_visits: "156", coverage_pct: 84,
    doctors: [
      { name: "Dr. Arjun Mehta", planned: 4, actual: 4 },
      { name: "Dr. Sneha Reddy", planned: 4, actual: 3 },
      { name: "Dr. Vikram Patel", planned: 3, actual: 3 },
      { name: "Dr. Priya Sharma", planned: 3, actual: 2 },
      { name: "Dr. Rahul Gupta", planned: 2, actual: 2 },
      { name: "Dr. Kavitha Nair", planned: 2, actual: 1 },
      { name: "Dr. Suresh Kumar", planned: 3, actual: 0 },
      { name: "Dr. Anita Desai", planned: 2, actual: 2 },
    ],
  },
  mcr: {
    total_calls: 98, pending_mcr: 5, submitted_today: 4, completion_pct: 95,
    recent_reports: [
      { id: "mcr1", doctor: "Dr. Arjun Mehta", specialization: "Cardiologist", date: "2026-05-07", products: ["Amlodipine 5mg", "Atorvastatin 10mg"], samples: 3, mood: "Positive", feedback: "Interested in new clinical data. Wants samples for 10 patients.", followup: "2026-05-14", competitor: "Cipla — Amlokind" },
      { id: "mcr2", doctor: "Dr. Sneha Reddy", specialization: "Diabetologist", date: "2026-05-07", products: ["Metformin 500mg"], samples: 5, mood: "Neutral", feedback: "Already prescribing competitor. Needs price comparison.", followup: "2026-05-10", competitor: "USV — Glycomet" },
      { id: "mcr3", doctor: "Dr. Vikram Patel", specialization: "GP", date: "2026-05-06", products: ["Pantoprazole 40mg", "Azithromycin 250mg"], samples: 2, mood: "Positive", feedback: "Happy with product quality. Will increase prescriptions.", followup: "2026-05-13", competitor: null },
      { id: "mcr4", doctor: "Dr. Priya Sharma", specialization: "Neurologist", date: "2026-05-06", products: ["Pregabalin 75mg"], samples: 0, mood: "Negative", feedback: "Not interested currently. Has loyalty with Sun Pharma.", followup: "2026-05-20", competitor: "Sun Pharma — Pregastar" },
      { id: "mcr5", doctor: "Dr. Rahul Gupta", specialization: "Orthopedic", date: "2026-05-05", products: ["Diclofenac 50mg"], samples: 4, mood: "Positive", feedback: "Prescribing regularly. Wants patient education material.", followup: "2026-05-12", competitor: null },
    ],
    pending_submissions: [
      { doctor: "Dr. Kavitha Nair", specialization: "Pediatrician", visit_date: "2026-05-07" },
      { doctor: "Dr. Suresh Kumar", specialization: "Dermatologist", visit_date: "2026-05-07" },
      { doctor: "Dr. Meera Joshi", specialization: "ENT", visit_date: "2026-05-06" },
    ],
  },
};

export default function SFEPage() {
  const [activeTab, setActiveTab] = useState("primary");

  const { data, isLoading } = useQuery({
    queryKey: ["sfe", activeTab],
    queryFn: () => MOCK[activeTab] || {},
    staleTime: 2 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <MRNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <Breadcrumb />
        <div className="mb-5 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 rounded-2xl px-5 py-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Sales Force Effectiveness</h1>
              <p className="text-purple-200 text-xs">Track performance, coverage & daily execution</p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 mb-5 bg-white rounded-xl p-1 shadow-sm border border-gray-100 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={"flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap " + (
                activeTab === t.id ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"
              )}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {activeTab === "primary"   && <PrimarySales data={data} loading={isLoading} />}
        {activeTab === "secondary" && <SecondarySales data={data} loading={isLoading} />}
        {activeTab === "mvc"       && <MVCSection data={data} loading={isLoading} />}
        {activeTab === "mcr"       && <MCRSection data={data} loading={isLoading} />}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color = "from-indigo-500 to-purple-500" }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className={"w-9 h-9 bg-gradient-to-br " + color + " rounded-lg flex items-center justify-center mb-3 shadow-sm"}>
        <span className="text-base">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = "bg-indigo-500" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className={color + " h-2.5 rounded-full transition-all"} style={{ width: pct + "%" }} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-white rounded-xl animate-pulse border border-gray-100" />)}
      </div>
      <div className="h-32 bg-white rounded-xl animate-pulse border border-gray-100" />
    </div>
  );
}

// ── Primary Sales ─────────────────────────────────────────────────────────────
function PrimarySales({ data, loading }) {
  if (loading) return <LoadingSkeleton />;
  const s = data || {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="📦" label="Total Primary Sales" value={s.total_sales || "—"} color="from-blue-500 to-indigo-500" />
        <StatCard icon="🎯" label="Target Achievement" value={(s.achievement_pct || 0) + "%"} sub={s.target ? "Target: " + s.target : ""} color="from-green-500 to-emerald-500" />
        <StatCard icon="🏆" label="Top Product" value={s.top_product || "—"} color="from-orange-500 to-red-500" />
        <StatCard icon="📈" label="Monthly Trend" value={s.monthly_trend || "—"} color="from-purple-500 to-pink-500" />
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-800">Target Achievement</p>
          <span className="text-sm font-bold text-indigo-600">{s.achievement_pct || 0}%</span>
        </div>
        <ProgressBar value={s.achievement_pct || 0} color="bg-gradient-to-r from-indigo-500 to-purple-500" />
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-bold text-gray-800 mb-4">Product-wise Sales</p>
        <div className="space-y-3">
          {(s.products || []).map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                  <span className="text-xs font-bold text-indigo-600 flex-shrink-0 ml-2">{p.value}</span>
                </div>
                <ProgressBar value={p.pct || 0} color="bg-indigo-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-bold text-gray-800 mb-4">Territory Performance</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(s.territories || []).map((t, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-700">{t.name}</p>
                <span className="text-xs font-bold text-green-600">{t.value}</span>
              </div>
              <ProgressBar value={t.pct || 0} color="bg-green-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Secondary Sales ───────────────────────────────────────────────────────────
function SecondarySales({ data, loading }) {
  if (loading) return <LoadingSkeleton />;
  const s = data || {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="🏪" label="Retail Sales" value={s.retail_sales || "—"} color="from-teal-500 to-cyan-500" />
        <StatCard icon="🩺" label="Doctor Prescriptions" value={s.prescriptions || "—"} color="from-blue-500 to-indigo-500" />
        <StatCard icon="📦" label="Stock Movement" value={s.stock_movement || "—"} color="from-orange-500 to-amber-500" />
        <StatCard icon="📊" label="Growth" value={s.growth || "—"} color="from-green-500 to-emerald-500" />
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-bold text-gray-800 mb-4">Doctor Prescriptions</p>
        <div className="space-y-2">
          {(s.doctor_prescriptions || []).map((d, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{d.name?.charAt(0)}</div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.specialization}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{d.count} Rx</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MVC (Monthly Visit Coverage) ──────────────────────────────────────────────
function MVCSection({ data, loading }) {
  if (loading) return <LoadingSkeleton />;
  const s = data || {};
  const doctors = s.doctors || [];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="🩺" label="Doctors Covered" value={s.doctors_covered || "—"} color="from-green-500 to-emerald-500" />
        <StatCard icon="❌" label="Missed Doctors" value={s.missed_doctors || "—"} color="from-red-500 to-pink-500" />
        <StatCard icon="🔄" label="Repeat Visits" value={s.repeat_visits || "—"} color="from-blue-500 to-indigo-500" />
        <StatCard icon="📊" label="Coverage %" value={(s.coverage_pct || 0) + "%"} color="from-purple-500 to-pink-500" />
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-800">Overall Coverage</p>
          <span className={"text-sm font-bold " + ((s.coverage_pct || 0) >= 100 ? "text-green-600" : (s.coverage_pct || 0) >= 70 ? "text-orange-600" : "text-red-600")}>{s.coverage_pct || 0}%</span>
        </div>
        <ProgressBar value={s.coverage_pct || 0} color={(s.coverage_pct || 0) >= 100 ? "bg-green-500" : (s.coverage_pct || 0) >= 70 ? "bg-orange-400" : "bg-red-500"} />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-800">Doctor Visit Coverage</p>
        </div>
        {doctors.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No MVC data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2.5 font-bold text-gray-500">Doctor</th>
                  <th className="text-center px-4 py-2.5 font-bold text-gray-500">Planned</th>
                  <th className="text-center px-4 py-2.5 font-bold text-gray-500">Actual</th>
                  <th className="text-center px-4 py-2.5 font-bold text-gray-500">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {doctors.map((d, i) => {
                  const pct = d.planned > 0 ? Math.round((d.actual / d.planned) * 100) : 0;
                  const color = pct >= 100 ? "text-green-600 bg-green-50" : pct >= 70 ? "text-orange-600 bg-orange-50" : "text-red-600 bg-red-50";
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-semibold text-gray-800">{d.name}</td>
                      <td className="px-4 py-2.5 text-center text-gray-600">{d.planned}</td>
                      <td className="px-4 py-2.5 text-center text-gray-600">{d.actual}</td>
                      <td className="px-4 py-2.5 text-center"><span className={"px-2 py-0.5 rounded-md font-bold " + color}>{pct}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MCR (Monthly Call Report) — MR's Daily Work Journal ───────────────────────
function MCRSection({ data, loading }) {
  if (loading) return <LoadingSkeleton />;
  const s = data || {};
  const [showSubmit, setShowSubmit] = useState(false);

  const MOOD_STYLES = {
    Positive: { bg: "bg-green-100", text: "text-green-700", icon: "😊" },
    Neutral:  { bg: "bg-yellow-100", text: "text-yellow-700", icon: "😐" },
    Negative: { bg: "bg-red-100", text: "text-red-700", icon: "😞" },
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="📞" label="Total Calls" value={s.total_calls || "—"} color="from-blue-500 to-indigo-500" />
        <StatCard icon="✅" label="MCR Submitted" value={(s.total_calls - (s.pending_mcr || 0)) || "—"} color="from-green-500 to-emerald-500" />
        <StatCard icon="⏳" label="Pending MCR" value={s.pending_mcr || "—"} color="from-yellow-500 to-orange-500" />
        <StatCard icon="📊" label="Completion" value={(s.completion_pct || 0) + "%"} color="from-purple-500 to-pink-500" />
      </div>

      {/* Pending submissions alert */}
      {(s.pending_submissions || []).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
              <span>⚠️</span> Pending MCR Submissions
            </p>
            <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded-md text-xs font-bold">
              {s.pending_submissions.length} pending
            </span>
          </div>
          <div className="space-y-2">
            {s.pending_submissions.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 text-xs font-bold flex-shrink-0">
                    {p.doctor?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{p.doctor}</p>
                    <p className="text-xs text-gray-400">{p.specialization} · {p.visit_date}</p>
                  </div>
                </div>
                <button className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                  Submit MCR
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent MCR Reports — MR's work journal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-800">Recent Call Reports</p>
          <span className="text-xs text-gray-400">{(s.recent_reports || []).length} reports</span>
        </div>
        {(s.recent_reports || []).length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No MCR reports yet. Submit after each doctor visit.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {(s.recent_reports || []).map((r) => {
              const mood = MOOD_STYLES[r.mood] || MOOD_STYLES.Neutral;
              return (
                <div key={r.id} className="p-4 hover:bg-gray-50 transition-colors">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {r.doctor?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{r.doctor}</p>
                        <p className="text-xs text-gray-400">{r.specialization} · {r.date}</p>
                      </div>
                    </div>
                    <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold " + mood.bg + " " + mood.text}>
                      {mood.icon} {r.mood}
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 ml-11">
                    <div className="bg-blue-50 rounded-lg px-2.5 py-1.5">
                      <p className="text-xs text-blue-500 font-medium">Products</p>
                      <p className="text-xs font-semibold text-blue-700">{r.products?.join(", ")}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg px-2.5 py-1.5">
                      <p className="text-xs text-green-500 font-medium">Samples</p>
                      <p className="text-xs font-semibold text-green-700">{r.samples} given</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg px-2.5 py-1.5">
                      <p className="text-xs text-purple-500 font-medium">Follow-up</p>
                      <p className="text-xs font-semibold text-purple-700">{r.followup}</p>
                    </div>
                    {r.competitor && (
                      <div className="bg-red-50 rounded-lg px-2.5 py-1.5">
                        <p className="text-xs text-red-500 font-medium">Competitor</p>
                        <p className="text-xs font-semibold text-red-700">{r.competitor}</p>
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  {r.feedback && (
                    <div className="ml-11 bg-gray-50 rounded-lg px-3 py-2 border-l-3 border-l-indigo-300">
                      <p className="text-xs text-gray-600 italic">"{r.feedback}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
