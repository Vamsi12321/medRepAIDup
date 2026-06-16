"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import DCRPrintTemplate from "@/components/DCRPrintTemplate";
import { get } from "@/lib/api";
import { formatISTDate, formatISTTime } from "@/lib/time";

const today = () => new Date().toISOString().split("T")[0];

const MOOD_ICON = { positive: "😊", neutral: "😐", negative: "😞" };
const MOOD_LABEL = { positive: "Positive", neutral: "Neutral", negative: "Negative" };

export default function MRDCRPage() {
  const [selectedDate, setSelectedDate] = useState(today());
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const mrId   = typeof window !== "undefined" ? localStorage.getItem("userId")    : null;
  const mrName = typeof window !== "undefined" ? localStorage.getItem("userName") || "" : "";

  // MR full profile
  const { data: mrList } = useQuery({
    queryKey: ["my-mr-info"],
    queryFn: () => get("/api/v1/mrs").then((r) => r.mrs || []),
    staleTime: 10 * 60 * 1000,
  });
  const mrInfo = (mrList || []).find((m) => m.id === mrId) || null;

  // Visits for selected date
  const { data: visitsResponse, isLoading } = useQuery({
    queryKey: ["mr-dcr", selectedDate],
    queryFn: () => get(`/api/v1/visits?date_from=${selectedDate}&date_to=${selectedDate}`),
    enabled: !!mrId,
    staleTime: 0,
  });

  // Month data for calendar
  const [yr, mo] = selectedDate.split("-").map(Number);
  const daysInMonth = new Date(yr, mo, 0).getDate();
  const monthStart  = `${yr}-${String(mo).padStart(2,"0")}-01`;
  const monthEnd    = `${yr}-${String(mo).padStart(2,"0")}-${String(daysInMonth).padStart(2,"0")}`;
  const monthKey    = `${yr}-${String(mo).padStart(2,"0")}`;

  const { data: monthResponse } = useQuery({
    queryKey: ["mr-dcr-month", monthKey],
    queryFn: () => get(`/api/v1/visits?date_from=${monthStart}&date_to=${monthEnd}`),
    enabled: !!mrId,
    staleTime: 5 * 60 * 1000,
  });

  const allVisits   = visitsResponse?.visits || [];
  const completed   = allVisits.filter((v) => v.status === "completed");
  const monthVisits = monthResponse?.visits || [];

  // Stats
  const totalSamples  = completed.reduce((a, v) => a + (v.report?.samples_given || 0), 0);
  const rxCommits     = completed.filter((v) => v.report?.rx_commitment).length;
  const followUps     = completed.filter((v) => v.report?.follow_up_date).length;
  const competitors   = completed.filter((v) => v.report?.competitor_info).length;
  const moodCounts    = { positive: 0, neutral: 0, negative: 0 };
  completed.forEach((v) => { if (v.report?.doctor_mood) moodCounts[v.report.doctor_mood]++; });
  const productsSet   = new Set();
  completed.forEach((v) => (v.report?.products_discussed || []).forEach((p) => productsSet.add(typeof p === "string" ? p : p.name)));

  // Calendar day map
  const dayMap = {};
  monthVisits.filter((v) => v.status === "completed").forEach((v) => {
    const d = v.scheduled_date || v.completed_at?.split("T")[0];
    if (d) dayMap[d] = (dayMap[d] || 0) + 1;
  });
  const calDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = `${yr}-${String(mo).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`;
    return { date: d, day: i + 1, count: dayMap[d] || 0 };
  });

  const displayDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const generatedAt = new Date().toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true });

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <MRNavbar />
      <main className="max-w-4xl mx-auto px-3 sm:px-5 py-5">
        <Breadcrumb />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Daily Call Report</h1>
            <p className="text-sm text-gray-400 mt-0.5">Your day's field activity summary</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={selectedDate} max={today()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white font-medium text-gray-700 focus:ring-2 focus:ring-orange-300 outline-none" />
            {completed.length > 0 && (
              <button onClick={() => setShowPrintPreview(true)}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all">
                🖨️ Print DCR
              </button>
            )}
          </div>
        </div>

        {/* Calendar strip */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
            {new Date(yr, mo-1).toLocaleString("default", { month: "long", year: "numeric" })} — Activity Calendar
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {calDays.map(({ date, day, count }) => {
              const isSelected = date === selectedDate;
              const isFuture   = date > today();
              return (
                <button key={date} onClick={() => !isFuture && setSelectedDate(date)} disabled={isFuture}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all border ${
                    isSelected     ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : count > 0    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : isFuture     ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                    :                "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                  }`}>
                  <span>{day}</span>
                  {count > 0 && !isSelected && <span className="w-1 h-1 bg-emerald-500 rounded-full mt-0.5" />}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-2">
            {[{ color:"bg-emerald-500", label:"Visits done" },{ color:"bg-orange-500", label:"Selected" },{ color:"bg-gray-200", label:"No visits" }].map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className={`w-2 h-2 rounded-full ${l.color}`} />{l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Day summary */}
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />)}</div>
        ) : completed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center">
            <span className="text-4xl block mb-3">📋</span>
            <p className="text-gray-600 font-bold text-sm mb-1">No completed visits on {displayDate}</p>
            <p className="text-gray-400 text-xs">Select a different date</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                { label:"Visits",      value: completed.length, color:"text-purple-700",  bg:"bg-purple-50 border-purple-100",  icon:"📅" },
                { label:"Samples",     value: totalSamples,     color:"text-blue-700",    bg:"bg-blue-50 border-blue-100",      icon:"💉" },
                { label:"Rx Commits",  value: rxCommits,        color:"text-emerald-700", bg:"bg-emerald-50 border-emerald-100",icon:"✅" },
                { label:"Follow-ups",  value: followUps,        color:"text-orange-700",  bg:"bg-orange-50 border-orange-100",  icon:"📆" },
                { label:"Competitors", value: competitors,      color:"text-red-700",     bg:"bg-red-50 border-red-100",        icon:"⚔️" },
                { label:"Products",    value: productsSet.size, color:"text-indigo-700",  bg:"bg-indigo-50 border-indigo-100",  icon:"💊" },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl p-3 border text-center ${s.bg}`}>
                  <span className="text-lg block mb-1">{s.icon}</span>
                  <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Visit cards preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-orange-50/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">Visit Details — {displayDate}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{completed.length} completed visit{completed.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowPrintPreview(true)}
                  className="text-xs text-orange-600 font-bold bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg transition-all">
                  🖨️ Print Full Report
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {completed.map((v, i) => {
                  const r = v.report || {};
                  return (
                    <div key={v.id} className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">{i+1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{v.doctor_name}</p>
                        <p className="text-[11px] text-gray-400">{v.purpose}{v.location ? ` · ${v.location}` : ""}{v.duration_minutes > 0 ? ` · ${v.duration_minutes} min` : ""}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {r.doctor_mood && <span className="text-sm">{MOOD_ICON[r.doctor_mood]}</span>}
                        {r.rx_commitment && <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">Rx ✓</span>}
                        {r.samples_given > 0 && <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">{r.samples_given} samp</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <DCRPrintTemplate
          date={selectedDate}
          displayDate={displayDate}
          mrInfo={mrInfo}
          mrName={mrName}
          completed={completed}
          moodCounts={moodCounts}
          productsToday={[...productsSet]}
          totalSamples={totalSamples}
          rxCommits={rxCommits}
          followUps={followUps}
          competitors={competitors}
          generatedAt={generatedAt}
          onClose={() => setShowPrintPreview(false)}
        />
      )}
    </div>
  );
}

// ── DCR Print Modal ──────────────────────────────────────────────────────────
function DCRPrintModal({ date, displayDate, mrInfo, mrName, completed, moodCounts, productsToday, totalSamples, rxCommits, followUps, competitors, generatedAt, onClose }) {

  const handlePrint = () => {
    const printContents = document.getElementById("dcr-print-area").innerHTML;
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>DCR - ${mrInfo?.name || mrName} - ${date}</title>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1f2937; background: #fff; }
    .page { max-width: 800px; margin: 0 auto; padding: 32px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 2px solid #f97316; margin-bottom: 20px; }
    .header-left .company { font-size: 11px; color: #f97316; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .header-left .title { font-size: 22px; font-weight: 800; color: #111827; }
    .header-left .subtitle { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .header-right { text-align: right; }
    .header-right .date-box { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px 16px; }
    .header-right .date-label { font-size: 9px; color: #f97316; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .header-right .date-val { font-size: 14px; font-weight: 800; color: #ea580c; margin-top: 2px; }

    /* MR Info */
    .mr-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 18px; margin-bottom: 18px; }
    .mr-card .section-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; margin-bottom: 10px; }
    .mr-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .mr-field label { display: block; font-size: 9px; color: #9ca3af; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
    .mr-field span { font-size: 12px; font-weight: 700; color: #111827; }
    .mr-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
    .mr-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #f97316, #dc2626); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: 800; flex-shrink: 0; }
    .mr-name { font-size: 16px; font-weight: 800; color: #111827; }
    .mr-sub { font-size: 11px; color: #6b7280; margin-top: 1px; }

    /* Summary stats */
    .summary-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 18px; }
    .stat-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 6px; text-align: center; }
    .stat-box .val { font-size: 18px; font-weight: 800; color: #111827; }
    .stat-box .lbl { font-size: 9px; color: #9ca3af; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
    .stat-box.green { background: #f0fdf4; border-color: #bbf7d0; }
    .stat-box.green .val { color: #16a34a; }
    .stat-box.blue  { background: #eff6ff; border-color: #bfdbfe; }
    .stat-box.blue  .val { color: #2563eb; }
    .stat-box.orange{ background: #fff7ed; border-color: #fed7aa; }
    .stat-box.orange .val { color: #ea580c; }
    .stat-box.red   { background: #fef2f2; border-color: #fecaca; }
    .stat-box.red   .val { color: #dc2626; }

    /* Section title */
    .sec-title { font-size: 11px; font-weight: 800; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }

    /* Mood + Products row */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
    .info-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 14px; }
    .info-card .ic-title { font-size: 10px; font-weight: 700; color: #374151; margin-bottom: 8px; }
    .mood-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
    .mood-bar-wrap { flex: 1; height: 6px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
    .mood-bar { height: 6px; border-radius: 4px; }
    .mood-count { font-size: 11px; font-weight: 700; color: #374151; width: 16px; text-align: right; }
    .mood-label { font-size: 10px; color: #6b7280; width: 50px; }
    .tag { display: inline-block; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 20px; padding: 2px 10px; font-size: 10px; font-weight: 600; margin: 2px; }

    /* Visit cards */
    .visit-card { border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 14px; overflow: hidden; page-break-inside: avoid; }
    .visit-header { background: #f9fafb; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; }
    .visit-num { background: #f97316; color: white; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 20px; margin-right: 8px; }
    .visit-doctor { font-size: 13px; font-weight: 800; color: #111827; }
    .visit-meta { font-size: 10px; color: #6b7280; margin-top: 2px; }
    .mood-badge { font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
    .mood-pos { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .mood-neu { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
    .mood-neg { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .visit-body { padding: 12px 14px; }
    .visit-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
    .vg-field { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 7px 9px; }
    .vg-label { font-size: 8px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; }
    .vg-val { font-size: 11px; font-weight: 700; color: #111827; }
    .vg-val.green { color: #16a34a; }
    .vg-val.orange { color: #ea580c; }
    .products-row { margin-bottom: 8px; }
    .outcome-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px 10px; margin-bottom: 6px; }
    .outcome-box .ob-label { font-size: 8px; color: #16a34a; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; }
    .outcome-box .ob-text { font-size: 11px; color: #14532d; }
    .competitor-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 8px 10px; margin-bottom: 6px; }
    .competitor-box .ob-label { font-size: 8px; color: #dc2626; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; }
    .competitor-box .ob-text { font-size: 11px; color: #7f1d1d; }
    .notes-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; margin-bottom: 6px; }
    .notes-box .ob-label { font-size: 8px; color: #6b7280; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; }
    .notes-box .ob-text { font-size: 11px; color: #374151; }

    /* Footer */
    .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af; }
    .signature-section { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .sig-box { border-top: 1px solid #374151; padding-top: 6px; }
    .sig-label { font-size: 9px; color: #6b7280; font-weight: 600; text-transform: uppercase; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 20px; }
    }
  </style>
</head>
<body>
  ${printContents}
</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  const totalVisits = completed.length;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-bold text-gray-900">DCR Print Preview</p>
            <p className="text-[11px] text-gray-400">{displayDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
              🖨️ Print / Save PDF
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-lg">×</button>
          </div>
        </div>

        {/* Preview area */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <div id="dcr-print-area" className="bg-white">
            <div className="page" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "12px", color: "#1f2937" }}>

              {/* ── Document Header ── */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingBottom:"16px", borderBottom:"2px solid #f97316", marginBottom:"20px" }}>
                <div>
                  <div style={{ fontSize:"11px", color:"#f97316", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"4px" }}>MedRepAI · Daily Call Report</div>
                  <div style={{ fontSize:"22px", fontWeight:"800", color:"#111827" }}>Daily Call Report (DCR)</div>
                  <div style={{ fontSize:"12px", color:"#6b7280", marginTop:"2px" }}>Official field activity record</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:"8px", padding:"10px 16px" }}>
                    <div style={{ fontSize:"9px", color:"#f97316", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.5px" }}>Report Date</div>
                    <div style={{ fontSize:"14px", fontWeight:"800", color:"#ea580c", marginTop:"2px" }}>{displayDate}</div>
                  </div>
                </div>
              </div>

              {/* ── MR Info ── */}
              <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"10px", padding:"14px 18px", marginBottom:"18px" }}>
                <div style={{ fontSize:"9px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.8px", color:"#9ca3af", marginBottom:"10px" }}>Medical Representative Details</div>
                <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"12px", paddingBottom:"12px", borderBottom:"1px solid #e5e7eb" }}>
                  <div style={{ width:"42px", height:"42px", background:"linear-gradient(135deg,#f97316,#dc2626)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:"18px", fontWeight:"800", flexShrink:0 }}>
                    {(mrInfo?.name || mrName || "M").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize:"16px", fontWeight:"800", color:"#111827" }}>{mrInfo?.name || mrName}</div>
                    <div style={{ fontSize:"11px", color:"#6b7280", marginTop:"1px" }}>
                      {[mrInfo?.territory, mrInfo?.zone, mrInfo?.state].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
                  {[
                    { label:"Employee ID",   value: mrInfo?.id || mrId || "—" },
                    { label:"Territory",     value: mrInfo?.territory || "—" },
                    { label:"Zone",          value: mrInfo?.zone     || "—" },
                    { label:"State",         value: mrInfo?.state    || "—" },
                    { label:"Email",         value: mrInfo?.email    || "—" },
                    { label:"Phone",         value: mrInfo?.phone    || "—" },
                  ].map((f) => (
                    <div key={f.label}>
                      <div style={{ fontSize:"9px", color:"#9ca3af", fontWeight:"600", textTransform:"uppercase", marginBottom:"2px" }}>{f.label}</div>
                      <div style={{ fontSize:"12px", fontWeight:"700", color:"#111827" }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Day Summary Stats ── */}
              <div style={{ marginBottom:"18px" }}>
                <div style={{ fontSize:"11px", fontWeight:"800", color:"#374151", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"10px", paddingBottom:"6px", borderBottom:"1px solid #e5e7eb" }}>Day Summary</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"8px" }}>
                  {[
                    { label:"Total Visits",   value: totalVisits,      bg:"#fff7ed", border:"#fed7aa", color:"#ea580c" },
                    { label:"Samples Given",  value: totalSamples,     bg:"#eff6ff", border:"#bfdbfe", color:"#2563eb" },
                    { label:"Rx Commitments", value: rxCommits,        bg:"#f0fdf4", border:"#bbf7d0", color:"#16a34a" },
                    { label:"Follow-ups Set", value: followUps,        bg:"#fff7ed", border:"#fed7aa", color:"#d97706" },
                    { label:"Competitor Info",value: competitors,      bg:"#fef2f2", border:"#fecaca", color:"#dc2626" },
                    { label:"Products Discussed", value: [...productsToday].length, bg:"#f5f3ff", border:"#ddd6fe", color:"#7c3aed" },
                  ].map((s) => (
                    <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:"8px", padding:"10px 6px", textAlign:"center" }}>
                      <div style={{ fontSize:"20px", fontWeight:"800", color:s.color }}>{s.value}</div>
                      <div style={{ fontSize:"8px", color:"#9ca3af", fontWeight:"600", textTransform:"uppercase", marginTop:"2px" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Mood + Products ── */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"18px" }}>
                <div style={{ border:"1px solid #e5e7eb", borderRadius:"8px", padding:"12px 14px" }}>
                  <div style={{ fontSize:"10px", fontWeight:"700", color:"#374151", marginBottom:"8px" }}>Doctor Mood Summary</div>
                  {[
                    { key:"positive", label:"Positive", color:"#16a34a" },
                    { key:"neutral",  label:"Neutral",  color:"#d97706" },
                    { key:"negative", label:"Negative", color:"#dc2626" },
                  ].map((m) => {
                    const count = moodCounts[m.key] || 0;
                    const pct   = totalVisits > 0 ? Math.round((count/totalVisits)*100) : 0;
                    return (
                      <div key={m.key} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"5px" }}>
                        <span style={{ fontSize:"10px", color:"#6b7280", width:"50px" }}>{m.label}</span>
                        <div style={{ flex:1, height:"6px", background:"#f3f4f6", borderRadius:"4px", overflow:"hidden" }}>
                          <div style={{ height:"6px", width:`${pct}%`, background:m.color, borderRadius:"4px" }} />
                        </div>
                        <span style={{ fontSize:"11px", fontWeight:"700", color:"#374151", width:"16px", textAlign:"right" }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ border:"1px solid #e5e7eb", borderRadius:"8px", padding:"12px 14px" }}>
                  <div style={{ fontSize:"10px", fontWeight:"700", color:"#374151", marginBottom:"8px" }}>Products Discussed Today</div>
                  <div>
                    {[...productsToday].length === 0
                      ? <span style={{ fontSize:"10px", color:"#9ca3af" }}>None recorded</span>
                      : [...productsToday].map((p, i) => (
                        <span key={i} style={{ display:"inline-block", background:"#eff6ff", color:"#1d4ed8", border:"1px solid #bfdbfe", borderRadius:"20px", padding:"2px 10px", fontSize:"10px", fontWeight:"600", margin:"2px" }}>{p}</span>
                      ))
                    }
                  </div>
                </div>
              </div>

              {/* ── Visit-by-Visit ── */}
              <div>
                <div style={{ fontSize:"11px", fontWeight:"800", color:"#374151", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"12px", paddingBottom:"6px", borderBottom:"1px solid #e5e7eb" }}>
                  Visit Details ({totalVisits} visit{totalVisits !== 1 ? "s" : ""})
                </div>
                {completed.map((v, i) => {
                  const r    = v.report || {};
                  const mood = r.doctor_mood || "neutral";
                  const moodStyle = mood === "positive" ? { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" } : mood === "negative" ? { bg:"#fef2f2", color:"#dc2626", border:"#fecaca" } : { bg:"#fffbeb", color:"#d97706", border:"#fde68a" };
                  return (
                    <div key={v.id} style={{ border:"1px solid #e5e7eb", borderRadius:"10px", marginBottom:"14px", overflow:"hidden" }}>
                      {/* Visit header */}
                      <div style={{ background:"#f9fafb", padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #e5e7eb" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <span style={{ background:"#f97316", color:"white", fontSize:"10px", fontWeight:"800", padding:"2px 8px", borderRadius:"20px" }}>Visit {i+1}</span>
                          <div>
                            <div style={{ fontSize:"13px", fontWeight:"800", color:"#111827" }}>{v.doctor_name}</div>
                            <div style={{ fontSize:"10px", color:"#6b7280", marginTop:"1px" }}>
                              {[v.location && `📍 ${v.location}`, v.completed_at && `🕐 ${formatISTTime(v.completed_at)}`, v.duration_minutes > 0 && `⏱️ ${v.duration_minutes} min`].filter(Boolean).join("  ·  ")}
                            </div>
                          </div>
                        </div>
                        {r.doctor_mood && (
                          <span style={{ background:moodStyle.bg, color:moodStyle.color, border:`1px solid ${moodStyle.border}`, fontSize:"10px", fontWeight:"700", padding:"3px 10px", borderRadius:"20px" }}>
                            {MOOD_ICON[mood]} {MOOD_LABEL[mood]}
                          </span>
                        )}
                      </div>

                      {/* Visit body */}
                      <div style={{ padding:"12px 14px" }}>
                        {/* Data grid */}
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px", marginBottom:"10px" }}>
                          {[
                            { label:"Purpose",       value: v.purpose || "—",    style:{} },
                            { label:"Samples Given", value: r.samples_given ?? "—", style:{} },
                            { label:"Rx Commitment", value: r.rx_commitment ? `Yes · ${r.expected_rx_per_month || "—"}/mo` : "No", style: r.rx_commitment ? { color:"#16a34a", background:"#f0fdf4", border:"1px solid #bbf7d0" } : {} },
                            { label:"Follow-up",     value: r.follow_up_date ? formatISTDate(r.follow_up_date + "T00:00:00") : "None", style: r.follow_up_date ? { color:"#d97706", background:"#fffbeb", border:"1px solid #fde68a" } : {} },
                          ].map((f) => (
                            <div key={f.label} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"6px", padding:"7px 9px", ...f.style }}>
                              <div style={{ fontSize:"8px", color:"#9ca3af", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.3px", marginBottom:"2px" }}>{f.label}</div>
                              <div style={{ fontSize:"11px", fontWeight:"700", color:"#111827" }}>{f.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Products discussed */}
                        {(r.products_discussed || []).length > 0 && (
                          <div style={{ marginBottom:"8px" }}>
                            <div style={{ fontSize:"8px", color:"#9ca3af", fontWeight:"700", textTransform:"uppercase", marginBottom:"4px" }}>Products Discussed</div>
                            <div>
                              {r.products_discussed.map((p, pi) => (
                                <span key={pi} style={{ display:"inline-block", background:"#eff6ff", color:"#1d4ed8", border:"1px solid #bfdbfe", borderRadius:"20px", padding:"2px 10px", fontSize:"10px", fontWeight:"600", margin:"2px" }}>
                                  {typeof p === "string" ? p : p.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Outcome */}
                        {r.outcome && (
                          <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"6px", padding:"8px 10px", marginBottom:"6px" }}>
                            <div style={{ fontSize:"8px", color:"#16a34a", fontWeight:"700", textTransform:"uppercase", marginBottom:"3px" }}>Outcome</div>
                            <div style={{ fontSize:"11px", color:"#14532d" }}>{r.outcome}</div>
                          </div>
                        )}

                        {/* Competitor */}
                        {r.competitor_info && (
                          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"6px", padding:"8px 10px", marginBottom:"6px" }}>
                            <div style={{ fontSize:"8px", color:"#dc2626", fontWeight:"700", textTransform:"uppercase", marginBottom:"3px" }}>Competitor Information</div>
                            <div style={{ fontSize:"11px", color:"#7f1d1d" }}>{r.competitor_info}</div>
                          </div>
                        )}

                        {/* Notes */}
                        {r.notes && (
                          <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"6px", padding:"8px 10px" }}>
                            <div style={{ fontSize:"8px", color:"#6b7280", fontWeight:"700", textTransform:"uppercase", marginBottom:"3px" }}>Notes</div>
                            <div style={{ fontSize:"11px", color:"#374151" }}>{r.notes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Signature section ── */}
              <div style={{ marginTop:"30px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"40px" }}>
                <div style={{ borderTop:"1px solid #374151", paddingTop:"6px" }}>
                  <div style={{ fontSize:"9px", color:"#6b7280", fontWeight:"600", textTransform:"uppercase" }}>MR Signature · {mrInfo?.name || mrName}</div>
                </div>
                <div style={{ borderTop:"1px solid #374151", paddingTop:"6px" }}>
                  <div style={{ fontSize:"9px", color:"#6b7280", fontWeight:"600", textTransform:"uppercase" }}>Manager / Reviewer Signature</div>
                </div>
              </div>

              {/* ── Footer ── */}
              <div style={{ marginTop:"20px", paddingTop:"12px", borderTop:"1px solid #e5e7eb", display:"flex", justifyContent:"space-between", fontSize:"9px", color:"#9ca3af" }}>
                <span>Generated: {generatedAt}</span>
                <span>MedRepAI · Daily Call Report · {date}</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
