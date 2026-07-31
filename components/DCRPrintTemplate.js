"use client";
import { formatISTDate, formatISTTime } from "@/lib/time";

function buildHTML({ mrInfo, mrName, date, displayDate, completed, moodCounts, productsToday, totalSamples, followUps, competitors, generatedAt }) {
  const totalVisits = completed.length;
  const name        = mrInfo?.name || mrName || "—";
  const reportId    = `MRX-DCR-${date.replace(/-/g, "")}-${(name).replace(/\s+/g,"").toUpperCase().slice(0,5)}`;

  const field = (label, value, bold = false) =>
    `<td style="padding:0 32px 14px 0;vertical-align:top;min-width:140px;">
       <div style="font-size:9px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin-bottom:3px;">${label}</div>
       <div style="font-size:${bold ? "13px" : "11px"};font-weight:${bold ? "700" : "500"};color:#111827;">${value || "—"}</div>
     </td>`;

  const visitBlocks = completed.map((v, i) => {
    const r      = v.report || {};
    const mood   = r.doctor_mood ? (r.doctor_mood.charAt(0).toUpperCase() + r.doctor_mood.slice(1)) : "—";
    const prods  = (r.products_discussed || []).map(p => typeof p === "string" ? p : p.name).join(", ") || "—";
    const checkin= v.completed_at ? formatISTTime(v.completed_at) : "—";
    // follow_up_date may be "YYYY-MM-DD" or full ISO string — handle both
    const rawFollowUp = r.follow_up_date || v.follow_up_date || null;
    const followD = rawFollowUp
      ? (() => {
          try {
            const s = String(rawFollowUp);
            return formatISTDate(s.includes("T") ? s : s + "T00:00:00");
          } catch { return rawFollowUp; }
        })()
      : "—";
    return `
    <div style="page-break-inside:avoid;margin-bottom:24px;">
      <!-- visit title row -->
      <div style="border-bottom:1.5px solid #1d4ed8;padding-bottom:5px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:flex-end;">
        <div style="font-size:11px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.5px;">Visit ${String(i+1).padStart(2,"0")} — ${v.doctor_name || "—"}</div>
        <div style="font-size:9px;color:#6b7280;">${[checkin !== "—" ? checkin : "", v.duration_minutes > 0 ? `${v.duration_minutes} min` : "", v.location || ""].filter(Boolean).join("  ·  ")}</div>
      </div>
      <!-- visit fields -->
      <table style="width:100%;border-collapse:collapse;"><tr>
        ${field("Purpose",       v.purpose || "—")}
        ${field("Samples Given", r.samples_given ?? "0")}
        ${field("Doctor Mood",   mood)}
      </tr><tr>
        ${field("Follow-up Date",followD)}
        ${field("Competitor",    r.competitor_info || "None")}
        <td colspan="2" style="padding:0 0 14px 0;vertical-align:top;">
          <div style="font-size:9px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin-bottom:3px;">Products Discussed</div>
          <div style="font-size:11px;font-weight:500;color:#111827;">${prods}</div>
        </td>
      </tr></table>
      ${r.outcome ? `
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-left:3px solid #374151;padding:8px 12px;margin-bottom:6px;">
        <div style="font-size:8px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin-bottom:3px;">Visit Outcome</div>
        <div style="font-size:11px;color:#111827;">${r.outcome}</div>
      </div>` : ""}
      ${r.notes ? `
      <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:8px 12px;">
        <div style="font-size:8px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin-bottom:3px;">Notes</div>
        <div style="font-size:11px;color:#374151;">${r.notes}</div>
      </div>` : ""}
    </div>`;
  }).join("");

  const moodTotal = (moodCounts.positive||0) + (moodCounts.neutral||0) + (moodCounts.negative||0);
  const moodRow = (label, key) => {
    const c = moodCounts[key] || 0;
    const p = moodTotal > 0 ? Math.round((c/moodTotal)*100) : 0;
    return `<tr>
      <td style="font-size:10px;color:#374151;padding:3px 10px 3px 0;width:58px;">${label}</td>
      <td style="padding:3px 10px 3px 0;">
        <div style="background:#e5e7eb;height:5px;border-radius:2px;overflow:hidden;">
          <div style="background:#374151;height:5px;width:${p}%;"></div>
        </div>
      </td>
      <td style="font-size:10px;font-weight:700;color:#111827;padding:3px 0;width:20px;text-align:right;">${c}</td>
    </tr>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>DCR · ${name} · ${date}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#111827;background:#fff;}
  @page{size:A4;margin:0;}
  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .page{padding:20mm 18mm 18mm 18mm;}
    .no-break{page-break-inside:avoid;}
  }
  .page{max-width:800px;margin:0 auto;padding:36px 40px;}
</style>
</head>
<body>
<div class="page">

  <!-- ══ HEADER ═══════════════════════════════════════════════════════ -->
  <table style="width:100%;border-collapse:collapse;padding-bottom:16px;" cellpadding="0" cellspacing="0">
    <tr>
      <!-- Logo / Brand -->
      <td style="vertical-align:middle;padding-bottom:16px;width:200px;">
        <div style="font-size:24px;font-weight:900;color:#111827;letter-spacing:-1px;line-height:1;">MR<span style="color:#7c3aed;">X</span></div>
        <div style="font-size:9px;color:#6b7280;margin-top:3px;letter-spacing:0.3px;">Pharma Intelligence Platform</div>
      </td>
      <!-- Divider -->
      <td style="width:1px;padding:0 24px 16px;vertical-align:middle;">
        <div style="width:1px;height:48px;background:#d1d5db;"></div>
      </td>
      <!-- Report Title -->
      <td style="vertical-align:middle;padding-bottom:16px;">
        <div style="font-size:18px;font-weight:800;color:#111827;">Daily Call Report</div>
        <div style="font-size:10px;color:#6b7280;margin-top:2px;">Field Activity Summary</div>
      </td>
      <!-- Report Meta -->
      <td style="text-align:right;vertical-align:top;padding-bottom:16px;">
        <div style="font-size:8px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">BACKGROUND VERIFICATION &nbsp;·&nbsp; <span style="color:#1d4ed8;">CONFIDENTIAL</span></div>
        <div style="font-size:8px;color:#6b7280;margin-top:3px;">Report ID: ${reportId}</div>
        <div style="font-size:8px;color:#1d4ed8;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-top:8px;">GENERATED</div>
        <div style="font-size:14px;font-weight:800;color:#111827;margin-top:2px;">${displayDate.split(",").slice(1).join(",").trim()}</div>
        <div style="font-size:9px;color:#374151;margin-top:2px;">${generatedAt}</div>
        <div style="font-size:9px;color:#6b7280;margin-top:2px;">mrx.app</div>
      </td>
    </tr>
  </table>

  <!-- Blue rule -->
  <div style="height:2.5px;background:#1d4ed8;margin-bottom:20px;"></div>

  <!-- Status banner -->
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#16a34a;flex-shrink:0;"></span>
    <span style="font-size:12px;font-weight:600;color:#16a34a;">Report Generated</span>
    <span style="font-size:12px;color:#374151;">— Daily Call Report for ${displayDate}</span>
  </div>

  <!-- ══ MR INFORMATION ════════════════════════════════════════════════ -->
  <div style="font-size:9px;color:#374151;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">MR Information</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:6px;"><tr>
    ${field("Full Name",   name, true)}
    ${field("Territory",   mrInfo?.territory)}
    ${field("MR ID",       (mrInfo?.id || "—").slice(-12))}
  </tr><tr>
    ${field("Zone",        mrInfo?.zone)}
    ${field("State",       mrInfo?.state)}
    ${field("Status",      mrInfo?.is_active ? "Active" : "—")}
  </tr><tr>
    ${field("Email",       mrInfo?.email)}
    ${field("Phone",       mrInfo?.phone)}
    ${field("Date",        date)}
  </tr></table>

  <!-- thin rule -->
  <div style="height:1px;background:#e5e7eb;margin:4px 0 20px 0;"></div>

  <!-- ══ DAY SUMMARY ═══════════════════════════════════════════════════ -->
  <div style="font-size:9px;color:#374151;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">Day Summary</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:6px;"><tr>
    ${field("Doctors Visited",     String(totalVisits))}
    ${field("Samples Distributed", String(totalSamples))}
    ${field("Follow-ups Planned",  String(followUps))}
    ${field("Competitor Reports",  String(competitors))}
    ${field("Products Covered",    String(productsToday.length))}
  </tr></table>

  <!-- thin rule -->
  <div style="height:1px;background:#e5e7eb;margin:4px 0 20px 0;"></div>

  <!-- ══ MOOD + PRODUCTS ═══════════════════════════════════════════════ -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:6px;">
    <tr>
      <td style="width:50%;vertical-align:top;padding-right:32px;">
        <div style="font-size:9px;color:#374151;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">Doctor Mood</div>
        <table style="width:100%;">
          ${moodRow("Positive","positive")}
          ${moodRow("Neutral","neutral")}
          ${moodRow("Negative","negative")}
        </table>
      </td>
      <td style="width:50%;vertical-align:top;padding-left:32px;border-left:1px solid #e5e7eb;">
        <div style="font-size:9px;color:#374151;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">Products Discussed</div>
        <div style="font-size:11px;color:#374151;line-height:1.7;">
          ${productsToday.length === 0 ? "<span style='color:#9ca3af;'>None recorded</span>" : productsToday.map(p => `<span style="border:1px solid #d1d5db;padding:1px 8px;margin-right:4px;font-size:10px;">${p}</span>`).join("")}
        </div>
      </td>
    </tr>
  </table>

  <!-- thin rule -->
  <div style="height:1px;background:#e5e7eb;margin:16px 0 20px 0;"></div>

  <!-- ══ VISIT DETAILS ═════════════════════════════════════════════════ -->
  <div style="font-size:9px;color:#374151;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">
    Visit Details &nbsp;<span style="font-weight:400;color:#9ca3af;">(${totalVisits} visit${totalVisits!==1?"s":""})</span>
  </div>
  ${visitBlocks || `<p style="font-size:11px;color:#9ca3af;padding:10px 0;">No completed visits on this date.</p>`}

  <!-- thin rule -->
  <div style="height:1px;background:#e5e7eb;margin:8px 0 20px 0;"></div>

  <!-- ══ DECLARATION ════════════════════════════════════════════════════ -->
  <div style="font-size:9px;color:#374151;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">Declaration</div>
  <p style="font-size:10px;color:#6b7280;line-height:1.7;margin-bottom:28px;">
    I hereby certify that the information recorded in this Daily Call Report is true, accurate and complete to the best of my knowledge. All field visits were conducted in accordance with company guidelines and applicable pharmaceutical regulations.
  </p>

  <!-- Signatures -->
  <table style="width:100%;border-collapse:collapse;">
    <tr>
      <td style="width:38%;padding-right:20px;">
        <div style="border-top:1px solid #374151;padding-top:6px;margin-top:32px;">
          <div style="font-size:9px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">MR Signature &amp; Date</div>
          <div style="font-size:10px;color:#374151;margin-top:4px;">${name}</div>
        </div>
      </td>
      <td style="width:24%;"></td>
      <td style="width:38%;padding-left:20px;">
        <div style="border-top:1px solid #374151;padding-top:6px;margin-top:32px;">
          <div style="font-size:9px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Manager / Reviewer</div>
          <div style="font-size:10px;color:#9ca3af;margin-top:4px;">&nbsp;</div>
        </div>
      </td>
    </tr>
  </table>

  <!-- Watermark -->
  <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:80px;font-weight:900;color:#111827;opacity:0.03;pointer-events:none;white-space:nowrap;z-index:0;">
    MRX
  </div>

</div>

<!-- ══ FOOTER BAR ════════════════════════════════════════════════════ -->
<div style="position:fixed;bottom:0;left:0;right:0;background:#f9fafb;border-top:1.5px solid #1d4ed8;padding:7px 40px;">
  <table style="width:100%;border-collapse:collapse;">
    <tr>
      <td style="font-size:8px;color:#6b7280;">MRX · Pharma Intelligence Platform</td>
      <td style="font-size:8px;color:#6b7280;text-align:center;">Daily Call Report &nbsp;·&nbsp; CONFIDENTIAL</td>
      <td style="font-size:8px;color:#6b7280;text-align:right;">${reportId}</td>
    </tr>
  </table>
</div>

</body>
</html>`;
}

// ── DCR Print Template Modal ─────────────────────────────────────────────────
export default function DCRPrintTemplate({ mrInfo, mrName, date, displayDate, completed, moodCounts, productsToday, totalSamples, followUps, competitors, generatedAt, onClose }) {
  const name        = mrInfo?.name || mrName || "—";
  const totalVisits = completed.length;

  const handlePrint = () => {
    const html = buildHTML({ mrInfo, mrName, date, displayDate, completed, moodCounts, productsToday, totalSamples, followUps, competitors, generatedAt });
    const win  = window.open("", "_blank", "width=960,height=780,scrollbars=yes");
    if (!win) { alert("Please allow pop-ups to print."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  // ── Inline preview (mirrors the print doc layout) ──────────────────────────
  const fieldBlock = (label, value) => (
    <div key={label}>
      <div style={{ fontSize:"9px", color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.8px", fontWeight:"600", marginBottom:"3px" }}>{label}</div>
      <div style={{ fontSize:"11px", color:"#111827", fontWeight:"500" }}>{value || "—"}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-5 px-4">
      <div className="bg-white w-full max-w-3xl shadow-2xl rounded-sm overflow-hidden border border-gray-200">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div>
            <p className="text-sm font-bold text-gray-900">DCR Preview</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{name} · {displayDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 rounded-sm">
              🖨️ Print / Save PDF
            </button>
            <button onClick={onClose}
              className="text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-xl transition-colors">
              ×
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-100 p-5 overflow-y-auto max-h-[82vh]">
          <div className="bg-white border border-gray-200 shadow-sm" style={{ fontFamily:"'Segoe UI',Arial,sans-serif", padding:"32px 36px" }}>

            {/* Header */}
            <div className="flex items-start justify-between pb-4 mb-0">
              <div className="flex items-center gap-5">
                <div>
                  <div style={{ fontSize:"22px", fontWeight:"900", color:"#111827", letterSpacing:"-1px", lineHeight:1 }}>MR<span style={{ color:"#7c3aed" }}>X</span></div>
                  <div style={{ fontSize:"9px", color:"#6b7280", marginTop:"3px" }}>Pharma Intelligence Platform</div>
                </div>
                <div style={{ width:"1px", height:"44px", background:"#d1d5db" }} />
                <div>
                  <div style={{ fontSize:"17px", fontWeight:"800", color:"#111827" }}>Daily Call Report</div>
                  <div style={{ fontSize:"10px", color:"#9ca3af", marginTop:"2px" }}>Field Activity Summary</div>
                </div>
              </div>
              <div className="text-right">
                <div style={{ fontSize:"8px", color:"#6b7280", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.5px" }}>
                  Field Activity Report &nbsp;·&nbsp; <span style={{ color:"#1d4ed8" }}>CONFIDENTIAL</span>
                </div>
                <div style={{ fontSize:"9px", color:"#6b7280", marginTop:"2px" }}>
                  {`MRX-DCR-${date.replace(/-/g,"")}`}
                </div>
                <div style={{ fontSize:"8px", color:"#1d4ed8", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.5px", marginTop:"8px" }}>GENERATED</div>
                <div style={{ fontSize:"14px", fontWeight:"800", color:"#111827", marginTop:"2px" }}>{date}</div>
                <div style={{ fontSize:"9px", color:"#6b7280", marginTop:"1px" }}>{generatedAt}</div>
              </div>
            </div>

            {/* Blue rule */}
            <div style={{ height:"2.5px", background:"#1d4ed8", margin:"0 0 16px 0" }} />

            {/* Status */}
            <div className="flex items-center gap-2 mb-4">
              <span style={{ width:"9px", height:"9px", background:"#16a34a", borderRadius:"50%", display:"inline-block", flexShrink:0 }} />
              <span style={{ fontSize:"11px", fontWeight:"600", color:"#16a34a" }}>Report Generated</span>
              <span style={{ fontSize:"11px", color:"#374151" }}>— Daily Call Report for {displayDate}</span>
            </div>

            {/* MR Info */}
            <div style={{ fontSize:"9px", color:"#374151", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", borderBottom:"1px solid #e5e7eb", paddingBottom:"4px", marginBottom:"10px" }}>MR Information</div>
            <div className="grid grid-cols-3 gap-x-6 gap-y-3 mb-2">
              {[
                { l:"Full Name",   v: name },
                { l:"Territory",  v: mrInfo?.territory },
                { l:"MR ID",      v: (mrInfo?.id||"—").slice(-12) },
                { l:"Zone",       v: mrInfo?.zone   },
                { l:"State",      v: mrInfo?.state  },
                { l:"Status",     v: mrInfo?.is_active ? "Active" : "—" },
                { l:"Email",      v: mrInfo?.email  },
                { l:"Phone",      v: mrInfo?.phone  },
                { l:"Date",       v: date },
              ].map((f) => fieldBlock(f.l, f.v))}
            </div>
            <div style={{ height:"1px", background:"#e5e7eb", margin:"12px 0 16px" }} />

            {/* Day Summary */}
            <div style={{ fontSize:"9px", color:"#374151", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", borderBottom:"1px solid #e5e7eb", paddingBottom:"4px", marginBottom:"10px" }}>Day Summary</div>
            <div className="grid grid-cols-6 gap-4 mb-2">
              {[
                { l:"Doctors Visited",    v: totalVisits      },
                { l:"Samples Given",      v: totalSamples     },
                { l:"Follow-ups",         v: followUps        },
                { l:"Competitor Reports", v: competitors      },
                { l:"Products Covered",   v: productsToday.length },
              ].map((s) => (
                <div key={s.l}>
                  <div style={{ fontSize:"9px", color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.8px", fontWeight:"600", marginBottom:"3px" }}>{s.l}</div>
                  <div style={{ fontSize:"18px", fontWeight:"800", color:"#111827", lineHeight:1 }}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{ height:"1px", background:"#e5e7eb", margin:"12px 0 16px" }} />

            {/* Visit details */}
            <div style={{ fontSize:"9px", color:"#374151", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", borderBottom:"1px solid #e5e7eb", paddingBottom:"4px", marginBottom:"14px" }}>
              Visit Details <span style={{ fontWeight:"400", color:"#9ca3af" }}>({totalVisits} visit{totalVisits!==1?"s":""})</span>
            </div>
            <div className="space-y-5">
              {completed.map((v, i) => {
                const r    = v.report || {};
                const mood = r.doctor_mood ? (r.doctor_mood.charAt(0).toUpperCase() + r.doctor_mood.slice(1)) : "—";
                const prods= (r.products_discussed||[]).map(p => typeof p==="string"?p:p.name).join(", ")||"—";
                return (
                  <div key={v.id}>
                    <div className="flex items-end justify-between mb-2" style={{ borderBottom:"1.5px solid #1d4ed8", paddingBottom:"4px" }}>
                      <div style={{ fontSize:"11px", fontWeight:"700", color:"#1d4ed8", textTransform:"uppercase", letterSpacing:"0.5px" }}>
                        Visit {String(i+1).padStart(2,"0")} — {v.doctor_name}
                      </div>
                      <div style={{ fontSize:"9px", color:"#6b7280" }}>
                        {[v.completed_at ? formatISTTime(v.completed_at) : "", v.duration_minutes > 0 ? `${v.duration_minutes} min` : "", v.location||""].filter(Boolean).join("  ·  ")}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-x-5 gap-y-3 mb-2">
                      {[
                        { l:"Purpose",       v: v.purpose||"—" },
                        { l:"Samples Given", v: r.samples_given ?? "0" },
                        { l:"Doctor Mood",   v: mood },
                        { l:"Follow-up", v: (() => { const raw = r.follow_up_date || v.follow_up_date; if (!raw) return "—"; try { const s = String(raw); return formatISTDate(s.includes("T") ? s : s + "T00:00:00"); } catch { return String(raw); } })() },
                        { l:"Competitor",    v: r.competitor_info||"None" },
                        { l:"Products Discussed", v: prods },
                      ].map((f) => fieldBlock(f.l, f.v))}
                    </div>
                    {r.outcome && (
                      <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderLeft:"3px solid #374151", padding:"7px 10px", marginBottom:"4px" }}>
                        <div style={{ fontSize:"8px", color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.8px", fontWeight:"600", marginBottom:"2px" }}>Visit Outcome</div>
                        <div style={{ fontSize:"10px", color:"#111827" }}>{r.outcome}</div>
                      </div>
                    )}
                    {r.notes && (
                      <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", padding:"7px 10px" }}>
                        <div style={{ fontSize:"8px", color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.8px", fontWeight:"600", marginBottom:"2px" }}>Notes</div>
                        <div style={{ fontSize:"10px", color:"#374151" }}>{r.notes}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer bar */}
            <div style={{ marginTop:"24px", borderTop:"1.5px solid #1d4ed8", paddingTop:"8px", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:"8px", color:"#9ca3af" }}>MRX · Pharma Intelligence Platform</span>
              <span style={{ fontSize:"8px", color:"#9ca3af" }}>Daily Call Report · CONFIDENTIAL</span>
              <span style={{ fontSize:"8px", color:"#9ca3af" }}>Generated: {generatedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
