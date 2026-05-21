"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function useInView() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={className}
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [activeAI, setActiveAI] = useState(0);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "doctor") { router.push("/doctor/home"); return; }
    if (userRole === "company") { router.push("/company/overview"); return; }
    if (userRole === "mr") { router.push("/mr/dashboard"); return; }
    if (userRole === "admin") { router.push("/admin/dashboard"); return; }
    setLoaded(true);
  }, [router]);

  // Rotate AI features with transition state
  const [transitioning, setTransitioning] = useState(false);
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setActiveAI((p) => (p + 1) % 3);
        setTransitioning(false);
      }, 600);
    }, 3500);
    return () => clearInterval(interval);
  }, [loaded]);

  // Typing effect
  useEffect(() => {
    if (!loaded) return;
    const phrases = ["Check drug interactions...", "Search by symptoms...", "Analyze prescriptions...", "Get AI recommendations..."];
    let i = 0, j = 0, deleting = false;
    const tick = () => {
      const phrase = phrases[i];
      if (!deleting) {
        setTypedText(phrase.slice(0, j + 1));
        j++;
        if (j === phrase.length) { deleting = true; setTimeout(tick, 1500); return; }
      } else {
        setTypedText(phrase.slice(0, j - 1));
        j--;
        if (j === 0) { deleting = false; i = (i + 1) % phrases.length; }
      }
      setTimeout(tick, deleting ? 30 : 60);
    };
    tick();
  }, [loaded]);

  const aiCards = [
    { icon: "🧠", title: "AI Drug Analyzer", desc: "Instant composition, mechanism of action, side effects & clinical evidence for 50,000+ drugs" },
    { icon: "🔍", title: "Multi-Symptom Search", desc: "Enter symptoms → AI suggests relevant drugs with dosage, alternatives & contraindications" },
    { icon: "💬", title: "Ask Anything", desc: "Natural language Q&A — \"Can I take this with diabetes?\" answered with medical evidence" },
    { icon: "⚡", title: "Interaction Checker", desc: "Drug-drug, drug-food interactions checked instantly. Critical alerts for dangerous combos" },
  ];

  if (!loaded) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
              <span className="text-sm">💊</span>
            </div>
            <span className="text-base font-extrabold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">MedRepAI</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#ai" className="text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors">AI Features</a>
            <a href="#platform" className="text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors">Platform</a>
            <a href="#for-mrs" className="text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors">For MRs</a>
            <a href="#for-doctors" className="text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors">For Doctors</a>
            <a href="#sfe" className="text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors">SFE</a>
          </div>
          <Link href="/login" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-md shadow-indigo-200/50 hover:shadow-lg transition-all">
            Sign In →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-24 pb-4 px-4 sm:px-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-[5%] w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-[40%] w-[300px] h-[300px] bg-pink-100/20 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center min-h-[70vh]">
            {/* Left */}
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-full px-3 py-1 mb-5">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                  <span className="text-[11px] font-semibold text-indigo-700">AI-Powered Platform for MRs & Doctors</span>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="text-3xl sm:text-[2.5rem] font-extrabold text-gray-900 leading-[1.15] mb-4 tracking-tight">
                  Pharma Intelligence,<br />
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Powered by AI</span>
                </h1>
              </Reveal>

              <Reveal delay={200}>
                <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
                  For MRs: Plan visits, log calls with GPS, track MCR & MVC, and search drugs with AI.
                  For Doctors: Connect with peers, share posts, discover CME events, and get complete drug intelligence — all from one platform.
                </p>
              </Reveal>

              <Reveal delay={300}>
                <div className="flex items-center gap-3 mb-8">
                  <Link href="/login" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-300/40 hover:shadow-xl hover:shadow-indigo-400/40 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                    Start Free <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                  <a href="#ai" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">
                    <span className="w-7 h-7 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center"><svg className="w-3 h-3 text-indigo-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
                    Watch Demo
                  </a>
                </div>
              </Reveal>

              <Reveal delay={400}>
                <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                  {[{ v: "98%", l: "MCR Rate" }, { v: "3x", l: "Faster Reports" }, { v: "24/7", l: "AI Available" }].map((s) => (
                    <div key={s.l}><p className="text-base font-extrabold text-gray-900">{s.v}</p><p className="text-[10px] text-gray-400 font-medium">{s.l}</p></div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Right — AI Demo Carousel */}
            <Reveal delay={200}>
              <div className="relative">
                <div className="absolute inset-4 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-5 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {activeAI === 0 ? "MedRepAI — Multi-Symptom Search" : activeAI === 1 ? "MedRepAI — AI Analyzer" : "MedRepAI — Ask AI"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-b from-gray-50 to-white min-h-[310px] relative overflow-hidden">
                    {/* Transition splash */}
                    <div style={{ opacity: transitioning ? 1 : 0, pointerEvents: "none", transition: "opacity 0.3s ease" }} className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-3 animate-pulse">
                        <span className="text-base">💊</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>

                    {/* View 0: Drug Search + Multi-Symptom */}
                    <div style={{ opacity: activeAI === 0 ? 1 : 0, position: activeAI === 0 ? "relative" : "absolute", top: 0, left: 0, right: 0, transition: "opacity 0.5s ease", padding: activeAI === 0 ? 0 : "0 20px" }} className="space-y-3">
                      <div className="bg-white rounded-xl border border-gray-200 px-4 py-2.5 flex items-center gap-2 shadow-sm">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <span className="text-xs text-gray-400 font-medium">{typedText}<span className="animate-pulse text-indigo-500">|</span></span>
                      </div>
                      {/* Multi-symptom tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {["headache", "fever", "body pain"].map((s) => (
                          <span key={s} className="text-[9px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                            {s} <span className="text-indigo-300">×</span>
                          </span>
                        ))}
                        <span className="text-[9px] text-gray-400 italic px-1">multi-symptom search</span>
                      </div>
                      <div className="bg-white rounded-xl border border-indigo-100 p-3.5 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center"><span className="text-[8px]">🤖</span></div>
                          <span className="text-[10px] font-bold text-gray-700">AI Suggestions</span>
                          <span className="ml-auto text-[9px] text-green-500 font-semibold">● 3 matches</span>
                        </div>
                        <div className="space-y-2">
                          {[{ name: "Dolo 650mg", cat: "Antipyretic + Analgesic", tag: "Fever" },{ name: "Combiflam", cat: "NSAID + Paracetamol", tag: "Pain" },{ name: "Crocin Advance", cat: "Paracetamol 500mg", tag: "Multi" }].map((d) => (
                            <div key={d.name} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                              <span className="text-[10px]">💊</span>
                              <div className="flex-1 min-w-0"><p className="text-[10px] font-bold text-gray-800">{d.name}</p><p className="text-[9px] text-gray-400">{d.cat}</p></div>
                              <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{d.tag}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* View 1: AI Analyzer */}
                    <div style={{ opacity: activeAI === 1 ? 1 : 0, position: activeAI === 1 ? "relative" : "absolute", top: 0, left: 0, right: 0, transition: "opacity 0.5s ease", padding: activeAI === 1 ? 0 : "0 20px" }} className="space-y-3">
                      <div className="border-2 border-dashed border-indigo-200 rounded-xl p-3 text-center bg-indigo-50/30">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        </div>
                        <p className="text-[10px] font-semibold text-indigo-700">Upload Prescription or Report</p>
                        <p className="text-[9px] text-gray-400">PDF, Image — AI gives instant summary</p>
                      </div>
                      <div className="bg-white rounded-xl border border-green-100 p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-green-500 rounded-md flex items-center justify-center"><span className="text-[9px] text-white font-bold">✓</span></div>
                          <span className="text-[10px] font-bold text-gray-700">Analysis Complete</span>
                          <span className="ml-auto text-[9px] text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">2.3s</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="bg-blue-50 rounded-lg px-2.5 py-1.5"><p className="text-[9px] text-blue-500 font-semibold">Detected</p><p className="text-[10px] text-blue-800 font-bold">Prescription — Dr. Arjun Mehta</p></div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="bg-purple-50 rounded-lg px-2.5 py-1.5"><p className="text-[9px] text-purple-500 font-semibold">Drugs</p><p className="text-[10px] text-purple-800 font-bold">3 found</p></div>
                            <div className="bg-orange-50 rounded-lg px-2.5 py-1.5"><p className="text-[9px] text-orange-500 font-semibold">Alerts</p><p className="text-[10px] text-orange-800 font-bold">1 warning ⚠️</p></div>
                          </div>
                          <div className="bg-gray-50 rounded-lg px-2.5 py-1.5"><p className="text-[9px] text-gray-500 font-semibold">Summary</p><p className="text-[10px] text-gray-700">Amlovas + Metformin + Atorva prescribed. Low risk. Monitor liver enzymes.</p></div>
                        </div>
                      </div>
                    </div>

                    {/* View 2: Ask AI */}
                    <div style={{ opacity: activeAI === 2 ? 1 : 0, position: activeAI === 2 ? "relative" : "absolute", top: 0, left: 0, right: 0, transition: "opacity 0.5s ease", padding: activeAI === 2 ? 0 : "0 20px" }} className="space-y-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center"><span className="text-[10px]">🤖</span></div>
                        <span className="text-[10px] font-bold text-gray-700">Ask AI Anything About Drugs</span>
                        <span className="ml-auto flex items-center gap-1 text-[9px] text-green-500 font-semibold"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Ready</span>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl rounded-tl-sm px-3.5 py-2 max-w-[80%]">
                        <p className="text-[11px] text-indigo-800 font-medium">Can a diabetic patient take Amlovas 5mg safely?</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl rounded-tr-sm px-3.5 py-2.5 ml-auto max-w-[90%] shadow-sm">
                        <p className="text-[11px] text-gray-700 leading-relaxed">Yes, Amlodipine is safe for diabetic patients. It does not affect blood glucose. Commonly co-prescribed with Metformin.</p>
                        <p className="text-[9px] text-indigo-500 mt-1 font-medium">Confidence: 96% • Source: FDA Guidelines</p>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl rounded-tl-sm px-3.5 py-2 max-w-[75%]">
                        <p className="text-[11px] text-indigo-800 font-medium">What about with alcohol?</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl rounded-tr-sm px-3.5 py-2.5 ml-auto max-w-[90%] shadow-sm">
                        <p className="text-[11px] text-gray-700"><span className="text-orange-600 font-semibold">⚠️ Caution:</span> Alcohol may enhance hypotensive effect, causing dizziness or fainting.</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 flex items-center gap-2 mt-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span className="text-[10px] text-gray-400">Ask anything about drugs, dosage, interactions...</span>
                      </div>
                    </div>
                  </div>

                  {/* Tab indicators */}
                  <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-center gap-3 bg-white">
                    {["🔍 Search", "📄 Analyze", "💬 Ask AI"].map((label, i) => (
                      <button key={label} onClick={() => { setTransitioning(true); setTimeout(() => { setActiveAI(i); setTransitioning(false); }, 500); }}
                        className={`text-[9px] font-bold px-2.5 py-1 rounded-full transition-all ${activeAI === i ? "bg-indigo-100 text-indigo-700" : "text-gray-400 hover:text-gray-600"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-3 -right-3 bg-white rounded-xl px-3 py-1.5 shadow-lg border border-gray-100" style={{ animation: "float 3s ease-in-out infinite" }}>
                  <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">✓ Instant Analysis</span>
                </div>
                <div className="absolute -bottom-3 -left-3 bg-white rounded-xl px-3 py-1.5 shadow-lg border border-gray-100" style={{ animation: "float 3s ease-in-out infinite 1.5s" }}>
                  <span className="text-[10px] font-bold text-purple-600 flex items-center gap-1">🧠 AI-Powered</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Trusted by bar */}
      <Reveal>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-4">Trusted by pharma teams across India</p>
          <div className="flex items-center justify-center gap-8 opacity-40">
            {["Sun Pharma", "Cipla", "Dr. Reddy's", "Lupin", "Zydus"].map((name) => (
              <span key={name} className="text-sm font-bold text-gray-400">{name}</span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* AI FEATURES */}
      <section id="ai" className="py-16 px-4 sm:px-6 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <Reveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-4">
                <span className="text-xs">🧠</span>
                <span className="text-[11px] font-semibold text-indigo-300">Artificial Intelligence</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">AI That Understands Medicine</h2>
              <p className="text-indigo-200 text-sm max-w-md mx-auto">Not a simple database — an intelligent engine that analyzes, cross-references, and delivers clinical insights in seconds.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { icon: "🧠", title: "Drug Analyzer", desc: "Composition, MOA, side effects, clinical trials — instant breakdown for any drug.", tag: "ANALYSIS" },
              { icon: "🔍", title: "Symptom Search", desc: "Multiple symptoms → ranked drug suggestions with dosage & alternatives.", tag: "SEARCH" },
              { icon: "💬", title: "Ask Anything", desc: "\"Is this safe during pregnancy?\" — evidence-based answers in plain language.", tag: "Q&A" },
              { icon: "⚡", title: "Interaction Alert", desc: "Drug-drug & drug-food interactions. Critical warnings for dangerous combos.", tag: "SAFETY" },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <div className="bg-white/[0.06] border border-white/[0.12] rounded-2xl p-5 hover:bg-white/[0.10] hover:border-indigo-400/30 transition-all group h-full backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-xl flex items-center justify-center text-base group-hover:scale-110 transition-transform border border-white/10">
                      {item.icon}
                    </div>
                    <span className="text-[8px] font-bold text-indigo-300 bg-indigo-400/20 px-2 py-0.5 rounded-full tracking-widest">{item.tag}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* AI Chat Demo */}
          <Reveal delay={200}>
            <div className="max-w-xl mx-auto bg-white/[0.06] border border-white/[0.12] rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <span className="text-xs">🤖</span>
                </div>
                <span className="text-xs font-bold text-white">MedRepAI Chat</span>
                <span className="ml-auto flex items-center gap-1 text-[9px] text-green-400 font-semibold">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Ready
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="bg-indigo-500/20 border border-indigo-400/20 rounded-xl rounded-tl-sm px-3.5 py-2 max-w-[75%]">
                  <p className="text-[11px] text-indigo-100">What are the side effects of Atorvastatin 20mg?</p>
                </div>
                <div className="bg-white/[0.08] border border-white/[0.12] rounded-xl rounded-tr-sm px-3.5 py-2.5 ml-auto max-w-[85%]">
                  <p className="text-[11px] text-gray-200 leading-relaxed">Common: muscle pain (2-5%), headache, nausea. Rare: rhabdomyolysis (&lt;0.1%), liver enzyme elevation. <span className="text-indigo-200 font-semibold">Monitor CK levels if muscle symptoms appear.</span></p>
                  <p className="text-[9px] text-indigo-300 mt-1.5 font-medium">Sources: FDA label, UpToDate • Confidence: 96%</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section id="platform" className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Complete Field Force Platform</h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">Every tool your pharma team needs — from daily visits to strategic analytics.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "📅", title: "Visit Planner & GPS", desc: "Schedule doctor visits, auto-create follow-ups, GPS-verify attendance, and submit daily call reports.", color: "bg-blue-500" },
              { icon: "📊", title: "SFE & MCR Tracking", desc: "Real-time MCR%, MVC compliance, doctor coverage, and prescription commitment tracking.", color: "bg-purple-500" },
              { icon: "🧠", title: "AI Drug Intelligence", desc: "Multi-symptom search, drug analyzer, interaction checker, and natural language Q&A for MRs.", color: "bg-indigo-500" },
              { icon: "👨‍⚕️", title: "Doctor & Territory Mgmt", desc: "A/B/C classification, territory assignment, visit frequency targets, and doctor request workflow.", color: "bg-green-500" },
              { icon: "🌐", title: "Doctor Network", desc: "Professional feed, peer groups, CME events, and knowledge sharing — a LinkedIn for healthcare.", color: "bg-teal-500" },
              { icon: "🏢", title: "Company Dashboard", desc: "MR leaderboard, territory heatmaps, grievance management, announcements, and drug catalog.", color: "bg-orange-500" },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all group h-full">
                  <div className={`w-10 h-10 ${f.color} rounded-xl flex items-center justify-center text-lg mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MR USE CASE */}
      <section id="for-mrs" className="py-16 px-4 sm:px-6 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-3 py-1 mb-4">
                  <span className="text-xs">💼</span>
                  <span className="text-[11px] font-semibold text-orange-700">For Medical Representatives</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Your Entire Day,<br /><span className="text-orange-600">One App</span></h2>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">No more paper DCR, no more end-of-day reporting headaches. Plan your route, visit doctors, log calls with GPS proof, and track your MCR — all in real-time.</p>
                <div className="space-y-3">
                  {[
                    { icon: "🌅", title: "Morning: Plan Your Day", desc: "See today's scheduled visits, pending follow-ups, and doctors to cover this month" },
                    { icon: "🏥", title: "At Clinic: Log the Call", desc: "One-tap check-in with GPS, select products promoted, note doctor's mood & feedback" },
                    { icon: "💊", title: "Drug Info On-the-Go", desc: "AI-powered drug search — get composition, interactions & talking points before meeting" },
                    { icon: "📊", title: "Evening: Track Progress", desc: "See your MCR%, MVC compliance, and how you rank vs other MRs — no surprises at month-end" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{item.title}</p>
                        <p className="text-[11px] text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 flex items-center gap-2">
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center"><span className="text-sm">💼</span></div>
                  <span className="text-xs font-bold text-white">MR Daily View</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-blue-700">4</p><p className="text-[9px] text-blue-500 font-medium">Visits Today</p></div>
                    <div className="bg-green-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-green-700">87%</p><p className="text-[9px] text-green-500 font-medium">MCR</p></div>
                    <div className="bg-purple-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-purple-700">3</p><p className="text-[9px] text-purple-500 font-medium">Follow-ups</p></div>
                  </div>
                  {[
                    { doc: "Dr. Arjun Mehta", time: "10:30 AM", status: "Completed", color: "bg-green-100 text-green-700" },
                    { doc: "Dr. Sneha Reddy", time: "2:00 PM", status: "Next Up", color: "bg-blue-100 text-blue-700" },
                    { doc: "Dr. Vikram Patel", time: "4:30 PM", status: "Scheduled", color: "bg-gray-100 text-gray-600" },
                  ].map((v) => (
                    <div key={v.doc} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">{v.doc.charAt(4)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-gray-800">{v.doc}</p>
                        <p className="text-[10px] text-gray-400">{v.time}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${v.color}`}>{v.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* DOCTOR USE CASE */}
      <section id="for-doctors" className="py-16 px-4 sm:px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <Reveal delay={100}>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden order-2 lg:order-1">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center gap-2">
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center"><span className="text-sm">🩺</span></div>
                  <span className="text-xs font-bold text-white">Doctor Network Feed</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { name: "Dr. Sarah Sharma", spec: "Cardiologist", text: "New ACC guidelines on hypertension management — key takeaways from my practice...", likes: 24, comments: 8 },
                    { name: "Dr. Vikram Patel", spec: "Neurologist", text: "Interesting case: 45M with atypical migraine + visual aura. Started on Topiramate. Thoughts?", likes: 18, comments: 12 },
                  ].map((post) => (
                    <div key={post.name} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-[9px] font-bold">{post.name.charAt(4)}</div>
                        <div><p className="text-[10px] font-bold text-gray-800">{post.name}</p><p className="text-[9px] text-gray-400">{post.spec}</p></div>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed mb-2">{post.text}</p>
                      <div className="flex items-center gap-3 text-[9px] text-gray-400">
                        <span>❤️ {post.likes}</span><span>💬 {post.comments}</span><span className="ml-auto text-indigo-500 font-semibold">Share</span>
                      </div>
                    </div>
                  ))}
                  <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">🎓</span>
                      <span className="text-[10px] font-bold text-indigo-800">Upcoming CME</span>
                    </div>
                    <p className="text-[11px] text-indigo-700 font-semibold">Advances in Type 2 Diabetes Management</p>
                    <p className="text-[9px] text-indigo-500">May 25, 2026 • Online • 2 CME Credits</p>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 bg-indigo-100 border border-indigo-200 rounded-full px-3 py-1 mb-4">
                  <span className="text-xs">🩺</span>
                  <span className="text-[11px] font-semibold text-indigo-700">For Doctors</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Your Professional<br /><span className="text-indigo-600">Medical Network</span></h2>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">A verified community of healthcare professionals. Share knowledge, discuss cases, discover CME events, and access AI-powered drug intelligence — all in one place.</p>
                <div className="space-y-3">
                  {[
                    { icon: "💬", title: "Share & Discuss", desc: "Post clinical insights, case studies, and get peer feedback from verified doctors" },
                    { icon: "👥", title: "Specialty Groups", desc: "Join cardiology, neurology, or any specialty group for focused discussions" },
                    { icon: "🎓", title: "CME Events", desc: "Discover, register, and earn credits from continuing medical education events" },
                    { icon: "🧠", title: "AI Drug Assistant", desc: "Check interactions, search by symptoms, and get evidence-based drug information instantly" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{item.title}</p>
                        <p className="text-[11px] text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">One Platform, Three Portals</h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">Each role gets a tailored experience designed for their daily workflow — no clutter, just what matters.</p>
            </div>
          </Reveal>

          <div className="space-y-5">
            {/* MR Row */}
            <Reveal>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 sm:p-8 border border-orange-100 hover:border-orange-200 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 flex-shrink-0">
                    <span className="text-2xl">💼</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Medical Representatives</h3>
                    <p className="text-sm text-gray-600 mb-3">Your field companion — plan routes, log visits with GPS, search drugs with AI, and track your performance in real-time.</p>
                    <div className="flex flex-wrap gap-2">
                      {["Visit Planning", "GPS Check-in", "AI Drug Search", "MCR Reports", "MVC Tracking", "Grievance"].map((f) => (
                        <span key={f} className="text-[11px] font-medium text-orange-700 bg-white border border-orange-200 px-2.5 py-1 rounded-lg">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Admin Row */}
            <Reveal delay={100}>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 sm:p-8 border border-purple-100 hover:border-purple-200 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 flex-shrink-0">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Company Admins</h3>
                    <p className="text-sm text-gray-600 mb-3">Full visibility into your field force — SFE analytics, territory management, doctor classification, and team performance at a glance.</p>
                    <div className="flex flex-wrap gap-2">
                      {["SFE Dashboard", "Doctor A/B/C", "Territory Mgmt", "Drug Catalog", "CME Events", "Leaderboard"].map((f) => (
                        <span key={f} className="text-[11px] font-medium text-purple-700 bg-white border border-purple-200 px-2.5 py-1 rounded-lg">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Doctor Row */}
            <Reveal delay={200}>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 sm:p-8 border border-indigo-100 hover:border-indigo-200 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                    <span className="text-2xl">🩺</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Doctors</h3>
                    <p className="text-sm text-gray-600 mb-3">A professional medical network — connect with peers, share clinical insights, attend CME events, and access AI-powered drug intelligence.</p>
                    <div className="flex flex-wrap gap-2">
                      {["Network Feed", "Peer Groups", "CME Events", "AI Drug Search", "Case Discussions", "Connections"].map((f) => (
                        <span key={f} className="text-[11px] font-medium text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SFE */}
      <section id="sfe" className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 mb-4">
                <span className="text-xs">📊</span>
                <span className="text-[11px] font-semibold text-indigo-700">Sales Force Effectiveness</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Real-Time Field Performance</h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">Know exactly who's performing, who needs help, and where the opportunities are.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              { metric: "MCR", value: "84%", label: "Doctor Coverage", sub: "42/50 doctors visited", color: "border-l-blue-500 bg-blue-50/50" },
              { metric: "MVC", value: "76%", label: "Frequency Hit", sub: "Class A/B/C compliance", color: "border-l-purple-500 bg-purple-50/50" },
              { metric: "RCPA", value: "142", label: "Rx/Week", sub: "Committed prescriptions", color: "border-l-green-500 bg-green-50/50" },
              { metric: "GPS", value: "99%", label: "Verified", sub: "Location-stamped visits", color: "border-l-orange-500 bg-orange-50/50" },
            ].map((item, i) => (
              <Reveal key={item.metric} delay={i * 80}>
                <div className={`rounded-xl p-4 border border-gray-100 border-l-4 ${item.color}`}>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.metric}</p>
                  <p className="text-xl font-extrabold text-gray-900">{item.value}</p>
                  <p className="text-[11px] font-semibold text-gray-700">{item.label}</p>
                  <p className="text-[10px] text-gray-400">{item.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Leaderboard */}
          <Reveal delay={150}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-2xl mx-auto">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">MR Leaderboard</p>
                  <p className="text-[10px] text-gray-400">May 2026 — Top performers</p>
                </div>
                <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">● LIVE</span>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { rank: 1, name: "Vamsi Vakada", territory: "Visakhapatnam", mcr: 95, mvc: 92, badge: "🥇" },
                  { rank: 2, name: "Rahul Kumar", territory: "Hyderabad", mcr: 88, mvc: 84, badge: "🥈" },
                  { rank: 3, name: "Priya Sharma", territory: "Chennai", mcr: 82, mvc: 78, badge: "🥉" },
                  { rank: 4, name: "Amit Patel", territory: "Mumbai", mcr: 78, mvc: 72, badge: "" },
                ].map((mr) => (
                  <div key={mr.rank} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <span className="text-base w-6 text-center">{mr.badge || <span className="text-xs font-bold text-gray-400">#{mr.rank}</span>}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800">{mr.name}</p>
                      <p className="text-[10px] text-gray-400">{mr.territory}</p>
                    </div>
                    <div className="flex items-center gap-4 text-center">
                      <div><p className="text-xs font-bold text-blue-600">{mr.mcr}%</p><p className="text-[8px] text-gray-400">MCR</p></div>
                      <div><p className="text-xs font-bold text-purple-600">{mr.mvc}%</p><p className="text-[8px] text-gray-400">MVC</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Get Started in 4 Steps</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "01", icon: "🏢", title: "Sign Up", desc: "Company creates account & sets up divisions" },
              { n: "02", icon: "👥", title: "Add Team", desc: "Onboard MRs, assign territories & doctors" },
              { n: "03", icon: "📱", title: "Execute", desc: "MRs visit, report & log from the field" },
              { n: "04", icon: "📊", title: "Optimize", desc: "Real-time SFE, AI insights & forecasting" },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-xl mx-auto mb-3 shadow-lg shadow-indigo-200/50">
                    {s.icon}
                  </div>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{s.n}</span>
                  <h3 className="text-xs font-bold text-gray-900 mt-1 mb-0.5">{s.title}</h3>
                  <p className="text-[10px] text-gray-500">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <Reveal>
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 sm:p-10 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-xl sm:text-2xl font-extrabold mb-3">Ready to Supercharge Your Field Force?</h2>
              <p className="text-indigo-100 text-xs mb-6 max-w-sm mx-auto">Join pharma companies using AI to boost MCR, track SFE, and grow prescriptions.</p>
              <Link href="/login" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
                Start Free Today <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center"><span className="text-xs">💊</span></div>
                <span className="text-sm font-bold">MedRepAI</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">AI-powered pharma intelligence for modern field teams.</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-2">Platform</h4>
              <ul className="space-y-1.5 text-[11px] text-gray-400">
                <li><a href="#ai" className="hover:text-white transition-colors">AI Features</a></li>
                <li><a href="#sfe" className="hover:text-white transition-colors">SFE Analytics</a></li>
                <li><a href="#platform" className="hover:text-white transition-colors">All Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-2">Teams</h4>
              <ul className="space-y-1.5 text-[11px] text-gray-400">
                <li>Medical Reps</li><li>Admins</li><li>Doctors</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-2">Links</h4>
              <ul className="space-y-1.5 text-[11px] text-gray-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-gray-500">© 2026 MedRepAI. All rights reserved.</p>
            <div className="flex gap-4 text-[10px] text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
