"use client";
import { formatISTDate, formatISTTime } from "@/lib/time";

const formatLoc = (loc) =>
  loc && typeof loc === "object"
    ? loc.location_name || loc.temporary_location?.name || loc.name || ""
    : loc || "";

function buildMCRHTML({ mrInfo, month, year, data, generatedAt }) {
  const s           = data || {};
  const pct         = s.mcr_percentage || 0;
  const pctColor    = pct >= 90 ? "#16a34a" : pct >= 75 ? "#d97706" : "#dc2626";
  const pctLabel    = pct >= 90 ? "Excellent" : pct >= 75 ? "Good" : pct >= 60 ? "Needs Improvement" : "Critical";
  const visited     = s.visited    || [];
  const notVisited  = s.not_visited || [];
  const name        = mrInfo?.name  || s.mr_name || "—";
  const monthName   = new Date(year, month - 1).toLocaleString("default", { month: "long" });
  const reportId    = `MCR/${year}${String(month).padStart(2,"0")}/${(mrInfo?.id || "").slice(-6).toUpperCase() || "XXXXX"}`;

  const field = (label, value) =>
    `<td style="padding:0 32px 14px 0;vertical-align:top;min-width:120px;">
       <div style="font-size:9px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin-bottom:3px;">${label}</div>
       <div style="font-size:11px;font-weight:600;color:#111827;">${value || "—"}</div>
     </td>`;

  const visitedRows = visited.map((d, i) => {
    const visits = d.visits || [];
    const visitList = visits.map((v, vi) => {
      // MCR API returns fields directly on v, not nested in v.report
      const mood  = v.doctor_mood || "";
      const prods = (v.products_discussed || []).map(p => typeof p === "string" ? p : p.name).join(", ") || "—";
      const dateStr = v.scheduled_date
        ? (v.scheduled_date.includes("T") ? v.scheduled_date.split("T")[0] : v.scheduled_date)
        : (v.completed_at ? v.completed_at.split("T")[0] : "—");
      return `
      <tr style="background:${vi % 2 === 0 ? "#f9fafb" : "#fff"};">
        <td style="padding:6px 10px;font-size:10px;color:#374151;white-space:nowrap;">Visit ${vi + 1}</td>
        <td style="padding:6px 10px;font-size:10px;color:#374151;">${dateStr}</td>
        <td style="padding:6px 10px;font-size:10px;color:#374151;">${v.purpose || "—"}</td>
        <td style="padding:6px 10px;font-size:10px;color:#374151;">${formatLoc(v.location) || "—"}</td>
        <td style="padding:6px 10px;font-size:10px;color:${mood === "positive" ? "#16a34a" : mood === "negative" ? "#dc2626" : "#374151"};">${mood ? (mood.charAt(0).toUpperCase() + mood.slice(1)) : "—"}</td>
        <td style="padding:6px 10px;font-size:10px;color:#374151;">${v.samples_given ?? "0"}</td>
        <td style="padding:6px 10px;font-size:10px;color:#374151;">${prods}</td>
        <td style="padding:6px 10px;font-size:10px;color:#374151;">${v.outcome ? v.outcome.slice(0, 60) + (v.outcome.length > 60 ? "…" : "") : "—"}</td>
      </tr>`;
    }).join("");

    return `
    <div style="margin-bottom:18px;page-break-inside:avoid;">
      <div style="border-bottom:1.5px solid #1d4ed8;padding-bottom:4px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-end;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="background:#111827;color:white;font-size:9px;font-weight:800;padding:2px 8px;border-radius:2px;">DR ${String(i+1).padStart(2,"0")}</span>
          <span style="font-size:12px;font-weight:700;color:#111827;">${d.doctor_name || "—"}</span>
          <span style="border:1px solid #d1d5db;padding:1px 8px;font-size:9px;color:#374151;font-weight:600;">${d.classification ? `Class ${d.classification}` : "—"}</span>
        </div>
        <span style="font-size:10px;font-weight:700;color:#16a34a;background:#f0fdf4;border:1px solid #bbf7d0;padding:2px 10px;">${d.visits_count || visits.length} visit${(d.visits_count || visits.length) !== 1 ? "s" : ""}</span>
      </div>
      ${visits.length > 0 ? `
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;font-size:10px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:6px 10px;text-align:left;font-size:8px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">#</th>
            <th style="padding:6px 10px;text-align:left;font-size:8px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Date</th>
            <th style="padding:6px 10px;text-align:left;font-size:8px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Purpose</th>
            <th style="padding:6px 10px;text-align:left;font-size:8px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Location</th>
            <th style="padding:6px 10px;text-align:left;font-size:8px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Mood</th>
            <th style="padding:6px 10px;text-align:left;font-size:8px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Samples</th>
            <th style="padding:6px 10px;text-align:left;font-size:8px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Products</th>
            <th style="padding:6px 10px;text-align:left;font-size:8px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Outcome</th>
          </tr>
        </thead>
        <tbody>${visitList}</tbody>
      </table>` : `<p style="font-size:10px;color:#9ca3af;padding:4px 0;">No visit detail available.</p>`}
    </div>`;
  }).join("");

  const notVisitedRows = notVisited.map((d) =>
    `<tr style="border-bottom:1px solid #f3f4f6;">
       <td style="padding:8px 12px;font-size:11px;font-weight:600;color:#111827;">${d.doctor_name || "—"}</td>
       <td style="padding:8px 12px;font-size:10px;color:#374151;">${d.classification ? `Class ${d.classification}` : "—"}</td>
       <td style="padding:8px 12px;font-size:10px;color:#6b7280;">${d.last_visited ? formatISTDate(d.last_visited) : "Never visited"}</td>
     </tr>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>MCR Report — ${name} — ${monthName} ${year}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#111827;background:#fff;}
  @page{size:A4 landscape;margin:12mm 14mm 12mm 14mm;}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;} .no-break{page-break-inside:avoid;}}
</style>
</head>
<body>
<div style="max-width:1000px;margin:0 auto;">

  <!-- HEADER -->
  <table style="width:100%;border-collapse:collapse;background:#111827;padding:0;" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:20px 28px 16px;">
        <div style="font-size:10px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:3px;">MRX · MCR Report</div>
        <div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Monthly Call Report</div>
        <div style="font-size:11px;color:#9ca3af;margin-top:2px;">${monthName} ${year}</div>
      </td>
      <td style="padding:20px 28px 16px;text-align:right;vertical-align:top;">
        <div style="font-size:8px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;">CONFIDENTIAL</div>
        <div style="font-size:9px;color:#4b5563;font-family:monospace;">${reportId}</div>
        <div style="font-size:8px;color:#1d4ed8;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-top:8px;">PERIOD</div>
        <div style="font-size:14px;font-weight:800;color:#fff;margin-top:2px;">${monthName} ${year}</div>
        <div style="font-size:9px;color:#6b7280;margin-top:2px;">${generatedAt}</div>
      </td>
    </tr>
  </table>
  <div style="height:2.5px;background:#1d4ed8;"></div>

  <!-- MR PROFILE -->
  <div style="border:1px solid #e5e7eb;border-top:none;padding:16px 24px;background:#fafcff;">
    <div style="font-size:9px;color:#374151;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:12px;">Medical Representative</div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
      <div style="width:40px;height:40px;background:#111827;border-radius:2px;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;font-weight:900;flex-shrink:0;">${name.charAt(0).toUpperCase()}</div>
      <div>
        <div style="font-size:16px;font-weight:800;color:#111827;">${name}</div>
        <div style="font-size:10px;color:#6b7280;margin-top:1px;">${[mrInfo?.territory, mrInfo?.zone, mrInfo?.state].filter(Boolean).join(" · ")}</div>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        ${field("Territory",   mrInfo?.territory)}
        ${field("Zone",        mrInfo?.zone)}
        ${field("State",       mrInfo?.state)}
        ${field("Email",       mrInfo?.email)}
        ${field("Phone",       mrInfo?.phone)}
        ${field("Report Period", `${monthName} ${year}`)}
      </tr>
    </table>
  </div>

  <!-- MCR SUMMARY -->
  <div style="border:1px solid #e5e7eb;border-top:none;padding:16px 24px;">
    <div style="font-size:9px;color:#374151;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:12px;">MCR Summary</div>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="width:16.6%;padding-right:16px;">
          <div style="border:1px solid #e5e7eb;border-top:2px solid #111827;padding:12px 10px;text-align:center;">
            <div style="font-size:28px;font-weight:900;color:${pctColor};line-height:1;">${pct.toFixed(1)}%</div>
            <div style="font-size:8px;color:#9ca3af;font-weight:700;text-transform:uppercase;margin-top:4px;">MCR Score</div>
            <div style="font-size:9px;font-weight:700;color:${pctColor};margin-top:2px;">${pctLabel}</div>
          </div>
        </td>
        ${[
          { l:"Total Assigned", v: s.total_assigned || 0 },
          { l:"Doctors Visited", v: s.doctors_visited || 0 },
          { l:"Doctors Missed", v: s.doctors_not_visited || 0 },
          { l:"Visit Coverage", v: `${pct.toFixed(0)}%` },
          { l:"Period", v: `${monthName} ${year}` },
        ].map(stat => `
          <td style="width:16.6%;padding-right:16px;">
            <div style="border:1px solid #e5e7eb;border-top:2px solid #374151;padding:12px 10px;text-align:center;">
              <div style="font-size:22px;font-weight:900;color:#111827;line-height:1;">${stat.v}</div>
              <div style="font-size:8px;color:#9ca3af;font-weight:700;text-transform:uppercase;margin-top:4px;">${stat.l}</div>
            </div>
          </td>`).join("")}
      </tr>
    </table>
  </div>

  <!-- VISITED DOCTORS -->
  <div style="border:1px solid #e5e7eb;border-top:none;padding:16px 24px;">
    <div style="font-size:9px;color:#374151;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:16px;">
      Visited Doctors <span style="font-weight:400;color:#9ca3af;">(${visited.length} doctor${visited.length!==1?"s":""})</span>
    </div>
    ${visited.length === 0
      ? `<p style="font-size:11px;color:#9ca3af;">No doctors visited in this period.</p>`
      : visitedRows}
  </div>

  <!-- NOT VISITED -->
  ${notVisited.length > 0 ? `
  <div style="border:1px solid #e5e7eb;border-top:none;padding:16px 24px;">
    <div style="font-size:9px;color:#374151;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:12px;">
      Doctors Not Visited <span style="font-weight:400;color:#9ca3af;">(${notVisited.length})</span>
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:7px 12px;text-align:left;font-size:8px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Doctor</th>
          <th style="padding:7px 12px;text-align:left;font-size:8px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Class</th>
          <th style="padding:7px 12px;text-align:left;font-size:8px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Last Visited</th>
        </tr>
      </thead>
      <tbody>${notVisitedRows}</tbody>
    </table>
  </div>` : ""}

  <!-- SIGNATURES -->
  <div style="border:1px solid #e5e7eb;border-top:none;padding:16px 24px;background:#fafcff;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="width:38%;padding-right:20px;">
          <div style="border-top:1px solid #374151;padding-top:6px;margin-top:32px;">
            <div style="font-size:9px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Prepared By (Admin)</div>
            <div style="font-size:10px;color:#9ca3af;margin-top:4px;">&nbsp;</div>
          </div>
        </td>
        <td style="width:24%;"></td>
        <td style="width:38%;padding-left:20px;">
          <div style="border-top:1px solid #374151;padding-top:6px;margin-top:32px;">
            <div style="font-size:9px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Acknowledged By — ${name}</div>
            <div style="font-size:10px;color:#9ca3af;margin-top:4px;">&nbsp;</div>
          </div>
        </td>
      </tr>
    </table>
  </div>

  <!-- FOOTER -->
  <div style="background:linear-gradient(135deg,#1e3a5f,#1d4ed8);padding:10px 24px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:8px;color:rgba(255,255,255,0.55);">Generated: ${generatedAt}</span>
    <span style="font-size:8px;color:rgba(255,255,255,0.55);">MRX · Monthly Call Report · CONFIDENTIAL</span>
    <span style="font-size:8px;color:rgba(255,255,255,0.55);">${reportId}</span>
  </div>

</div>
</body>
</html>`;
}

export default function MCRPrintTemplate({ mrInfo, month, year, data, onClose }) {
  const monthName   = new Date(year, month - 1).toLocaleString("default", { month: "long" });
  const name        = mrInfo?.name || data?.mr_name || "—";
  const generatedAt = new Date().toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true });

  const handlePrint = () => {
    const html = buildMCRHTML({ mrInfo, month, year, data, generatedAt });
    const win  = window.open("", "_blank", "width=1100,height=780,scrollbars=yes");
    if (!win) { alert("Please allow pop-ups to print."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const s          = data || {};
  const pct        = s.mcr_percentage || 0;
  const pctColor   = pct >= 90 ? "text-emerald-600" : pct >= 75 ? "text-orange-600" : "text-red-600";
  const pctBg      = pct >= 90 ? "#10b981" : pct >= 75 ? "#f97316" : "#ef4444";
  const pctLabel   = pct >= 90 ? "Excellent" : pct >= 75 ? "Good" : pct >= 60 ? "Needs Improvement" : "Critical";
  const visited    = s.visited    || [];
  const notVisited = s.not_visited || [];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-5 px-4">
      <div className="bg-white w-full max-w-4xl shadow-2xl rounded-sm overflow-hidden border border-gray-200">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div>
            <p className="text-sm font-bold text-gray-900">MCR Report Preview</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{name} · {monthName} {year}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 rounded-sm">
              🖨️ Print / Save PDF
            </button>
            <button onClick={onClose}
              className="text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-xl">×</button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-100 p-5 overflow-y-auto max-h-[82vh]">
          <div className="bg-white border border-gray-200 shadow-sm" style={{ fontFamily:"'Segoe UI',Arial,sans-serif", padding:"28px 32px" }}>

            {/* Header */}
            <div className="flex items-start justify-between pb-4 mb-0">
              <div className="flex items-center gap-5">
                <div>
                  <div style={{ fontSize:"20px", fontWeight:"900", color:"#111827", letterSpacing:"-1px", lineHeight:1 }}>MR<span style={{ color:"#7c3aed" }}>X</span></div>
                  <div style={{ fontSize:"9px", color:"#6b7280", marginTop:"3px" }}>Pharma Intelligence Platform</div>
                </div>
                <div style={{ width:"1px", height:"44px", background:"#d1d5db" }} />
                <div>
                  <div style={{ fontSize:"17px", fontWeight:"800", color:"#111827" }}>Monthly Call Report</div>
                  <div style={{ fontSize:"10px", color:"#9ca3af", marginTop:"2px" }}>{monthName} {year}</div>
                </div>
              </div>
              <div className="text-right">
                <div style={{ fontSize:"8px", color:"#6b7280", fontWeight:"600", textTransform:"uppercase" }}>MCR Report · <span style={{ color:"#1d4ed8" }}>CONFIDENTIAL</span></div>
                <div style={{ fontSize:"14px", fontWeight:"800", color:"#111827", marginTop:"4px" }}>{monthName} {year}</div>
              </div>
            </div>
            <div style={{ height:"2.5px", background:"#1d4ed8", margin:"0 0 16px 0" }} />

            {/* MR Info */}
            <div style={{ fontSize:"9px", color:"#374151", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", borderBottom:"1px solid #e5e7eb", paddingBottom:"4px", marginBottom:"10px" }}>Medical Representative</div>
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width:"38px", height:"38px", background:"#111827", borderRadius:"2px", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:"16px", fontWeight:"900" }}>
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:"15px", fontWeight:"800", color:"#111827" }}>{name}</div>
                <div style={{ fontSize:"10px", color:"#6b7280" }}>{[mrInfo?.territory, mrInfo?.zone, mrInfo?.state].filter(Boolean).join(" · ")}</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ fontSize:"9px", color:"#374151", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", borderBottom:"1px solid #e5e7eb", paddingBottom:"4px", margin:"12px 0 10px" }}>MCR Summary — {monthName} {year}</div>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {[
                { l:"MCR Score",       v: `${pct.toFixed(1)}%`, highlight: true },
                { l:"Total Assigned",  v: s.total_assigned || 0 },
                { l:"Doctors Visited", v: s.doctors_visited || 0 },
                { l:"Doctors Missed",  v: s.doctors_not_visited || 0 },
                { l:"Visit Coverage",  v: `${pct.toFixed(0)}%` },
                { l:"Rating",          v: pctLabel },
              ].map((stat) => (
                <div key={stat.l} style={{ border:"1px solid #e5e7eb", borderTop:"2px solid #111827", padding:"10px 6px", textAlign:"center" }}>
                  <div className={`text-xl font-extrabold ${stat.highlight ? pctColor : "text-gray-900"}`}>{stat.v}</div>
                  <div style={{ fontSize:"8px", color:"#9ca3af", fontWeight:"700", textTransform:"uppercase", marginTop:"3px" }}>{stat.l}</div>
                </div>
              ))}
            </div>

            {/* Visited doctors */}
            <div style={{ fontSize:"9px", color:"#374151", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", borderBottom:"1px solid #e5e7eb", paddingBottom:"4px", marginBottom:"12px" }}>
              Visited Doctors <span style={{ fontWeight:"400", color:"#9ca3af" }}>({visited.length})</span>
            </div>
            <div className="space-y-3 mb-4">
              {visited.length === 0 && <p style={{ fontSize:"11px", color:"#9ca3af" }}>No doctors visited.</p>}
              {visited.map((d, i) => (
                <div key={i} style={{ border:"1px solid #e5e7eb" }}>
                  <div className="flex items-center justify-between px-3 py-2" style={{ background:"#f9fafb", borderBottom:"1px solid #e5e7eb" }}>
                    <div className="flex items-center gap-2">
                      <span style={{ background:"#1d4ed8", color:"white", fontSize:"9px", fontWeight:"800", padding:"2px 7px" }}>DR {String(i+1).padStart(2,"0")}</span>
                      <span style={{ fontSize:"12px", fontWeight:"700", color:"#111827" }}>{d.doctor_name}</span>
                      <span style={{ border:"1px solid #d1d5db", padding:"1px 6px", fontSize:"9px", color:"#374151" }}>Class {d.classification}</span>
                    </div>
                    <span style={{ fontSize:"10px", fontWeight:"700", color:"#16a34a" }}>{d.visits_count || (d.visits||[]).length} visit{(d.visits_count||(d.visits||[]).length)!==1?"s":""}</span>
                  </div>
                  {(d.visits||[]).length > 0 && (
                    <div className="overflow-x-auto">
                      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"10px" }}>
                        <thead style={{ background:"#f3f4f6" }}>
                          <tr>{["#","Date","Purpose","Location","Mood","Samples","Products","Outcome"].map(h=>(
                            <th key={h} style={{ padding:"5px 8px", textAlign:"left", fontSize:"8px", color:"#6b7280", fontWeight:"700", textTransform:"uppercase", borderBottom:"1px solid #e5e7eb" }}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {(d.visits||[]).map((v, vi) => {
                            const mood  = v.doctor_mood || "";
                            const prods = (v.products_discussed||[]).map(p=>typeof p==="string"?p:p.name).join(", ")||"—";
                            const dateStr = v.scheduled_date
                              ? (v.scheduled_date.includes("T") ? v.scheduled_date.split("T")[0] : v.scheduled_date)
                              : (v.completed_at ? v.completed_at.split("T")[0] : "—");
                            return (
                              <tr key={vi} style={{ background: vi%2===0?"#f9fafb":"#fff", borderBottom:"1px solid #f3f4f6" }}>
                                <td style={{ padding:"5px 8px", color:"#374151" }}>V{vi+1}</td>
                                <td style={{ padding:"5px 8px", color:"#374151", whiteSpace:"nowrap" }}>{dateStr}</td>
                                <td style={{ padding:"5px 8px", color:"#374151" }}>{v.purpose||"—"}</td>
                                <td style={{ padding:"5px 8px", color:"#374151" }}>{formatLoc(v.location)||"—"}</td>
                                <td style={{ padding:"5px 8px", color: mood==="positive"?"#16a34a":mood==="negative"?"#dc2626":"#374151" }}>{mood?mood.charAt(0).toUpperCase()+mood.slice(1):"—"}</td>
                                <td style={{ padding:"5px 8px", color:"#374151" }}>{v.samples_given??0}</td>
                                <td style={{ padding:"5px 8px", color:"#374151" }}>{prods}</td>
                                <td style={{ padding:"5px 8px", color:"#374151", maxWidth:"150px" }}>{v.outcome?v.outcome.slice(0,50)+(v.outcome.length>50?"…":""):"—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Not visited */}
            {notVisited.length > 0 && (
              <>
                <div style={{ fontSize:"9px", color:"#374151", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", borderBottom:"1px solid #e5e7eb", paddingBottom:"4px", marginBottom:"10px" }}>
                  Doctors Not Visited <span style={{ fontWeight:"400", color:"#9ca3af" }}>({notVisited.length})</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {notVisited.map((d, i) => (
                    <div key={i} style={{ border:"1px solid #fecaca", background:"#fef2f2", padding:"8px 10px" }}>
                      <div style={{ fontSize:"11px", fontWeight:"700", color:"#111827" }}>{d.doctor_name}</div>
                      <div style={{ fontSize:"9px", color:"#6b7280", marginTop:"2px" }}>Class {d.classification} · Last: {d.last_visited ? d.last_visited.split("T")[0] : "Never"}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Footer */}
            <div style={{ marginTop:"20px", borderTop:"1.5px solid #1d4ed8", paddingTop:"8px", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:"8px", color:"#9ca3af" }}>MRX · Monthly Call Report</span>
              <span style={{ fontSize:"8px", color:"#9ca3af" }}>CONFIDENTIAL</span>
              <span style={{ fontSize:"8px", color:"#9ca3af" }}>Generated: {generatedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
