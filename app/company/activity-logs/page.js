"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import { get } from "@/lib/api";

import { formatIST, formatISTFull } from "@/lib/time";

const SEVERITY = {
  info:     { cls: "bg-blue-100 text-blue-700",    dot: "bg-blue-500",    border: "border-blue-200" },
  warning:  { cls: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500",  border: "border-yellow-200" },
  critical: { cls: "bg-red-100 text-red-700",      dot: "bg-red-500",     border: "border-red-200" },
};

const ACTION_ICONS = {
  user_created:      { icon: "👤", color: "bg-green-100 text-green-700" },
  user_updated:      { icon: "✏️", color: "bg-blue-100 text-blue-700" },
  user_activated:    { icon: "✅", color: "bg-emerald-100 text-emerald-700" },
  user_deactivated:  { icon: "🚫", color: "bg-red-100 text-red-700" },
  user_login:        { icon: "🔑", color: "bg-indigo-100 text-indigo-700" },
  user_logout:       { icon: "🚪", color: "bg-gray-100 text-gray-600" },
  visit_scheduled:   { icon: "📅", color: "bg-orange-100 text-orange-700" },
  visit_completed:   { icon: "✅", color: "bg-green-100 text-green-700" },
  visit_cancelled:   { icon: "❌", color: "bg-red-100 text-red-700" },
  visit_checked_in:  { icon: "📍", color: "bg-teal-100 text-teal-700" },
  visit_checked_out: { icon: "🏁", color: "bg-slate-100 text-slate-700" },
  cme_created:       { icon: "📅", color: "bg-purple-100 text-purple-700" },
  cme_updated:       { icon: "📝", color: "bg-indigo-100 text-indigo-700" },
  cme_deleted:       { icon: "🗑️", color: "bg-red-100 text-red-700" },
  drug_created:      { icon: "💊", color: "bg-cyan-100 text-cyan-700" },
  drug_updated:      { icon: "💊", color: "bg-blue-100 text-blue-700" },
  drug_deleted:      { icon: "💊", color: "bg-red-100 text-red-700" },
  rcpa_created:      { icon: "📈", color: "bg-pink-100 text-pink-700" },
  rcpa_updated:      { icon: "📊", color: "bg-violet-100 text-violet-700" },
  settings_updated:  { icon: "⚙️", color: "bg-gray-100 text-gray-700" },
  doctor_created:    { icon: "🩺", color: "bg-green-100 text-green-700" },
  doctor_updated:    { icon: "🩺", color: "bg-blue-100 text-blue-700" },
  grievance_created: { icon: "📢", color: "bg-amber-100 text-amber-700" },
  grievance_updated: { icon: "📢", color: "bg-blue-100 text-blue-700" },
};

const ROLE_COLORS = {
  MR:      "bg-orange-100 text-orange-700",
  ADMIN:   "bg-purple-100 text-purple-700",
  DOCTOR:  "bg-blue-100 text-blue-700",
  MANAGER: "bg-teal-100 text-teal-700",
};

export default function ActivityLogsPage() {
  const [page, setPage]             = useState(1);
  const [actionType, setActionType] = useState("");
  const [targetType, setTargetType] = useState("");
  const [severity, setSeverity]     = useState("");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const buildParams = () => {
    const p = new URLSearchParams({ page, limit: 20 });
    if (actionType) p.append("action_type", actionType);
    if (targetType) p.append("target_type", targetType);
    if (severity)   p.append("severity", severity);
    if (dateFrom)   p.append("date_from", new Date(dateFrom).toISOString());
    if (dateTo)     p.append("date_to", new Date(dateTo + "T23:59:59").toISOString());
    return p.toString();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["activity-logs", page, actionType, targetType, severity, dateFrom, dateTo],
    queryFn: () => get(`/api/v1/admin/activity-logs?${buildParams()}`),
    staleTime: 30000,
  });

  const { data: stats } = useQuery({
    queryKey: ["activity-stats"],
    queryFn: () => get("/api/v1/admin/activity-logs/stats"),
    staleTime: 60000,
  });

  const logs       = data?.logs        || [];
  const totalPages = data?.total_pages || 1;
  const total      = data?.total       || 0;

  const handleExport = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : "";
    const params = new URLSearchParams();
    if (actionType) params.append("action_type", actionType);
    if (targetType) params.append("target_type", targetType);
    if (severity)   params.append("severity", severity);
    if (dateFrom)   params.append("date_from", new Date(dateFrom).toISOString());
    if (dateTo)     params.append("date_to", new Date(dateTo + "T23:59:59").toISOString());
    try {
      const res  = await fetch(`/api/v1/admin/activity-logs/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `activity-logs-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed. Please try again.");
    }
  };

  const reset = () => { setActionType(""); setTargetType(""); setSeverity(""); setDateFrom(""); setDateTo(""); setPage(1); };

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <CompanyNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
            <p className="text-gray-500 text-sm mt-0.5">Track all platform activity — click any row for details</p>
          </div>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl font-semibold text-xs transition-all shadow">
            📤 Export CSV
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Logs",  value: stats.total_logs,                 color: "purple" },
              { label: "Info",        value: stats.by_severity?.info || 0,     color: "blue" },
              { label: "Warnings",    value: stats.by_severity?.warning || 0,  color: "yellow" },
              { label: "Critical",    value: stats.by_severity?.critical || 0, color: "red" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 shadow border border-gray-200">
                <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value?.toLocaleString()}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow border border-gray-200 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <input type="text" placeholder="Action type" value={actionType}
              onChange={(e) => { setActionType(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" />
            <input type="text" placeholder="Target type" value={targetType}
              onChange={(e) => { setTargetType(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" />
            <select value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200 bg-white">
              <option value="">All severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" />
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">{total.toLocaleString()} logs</p>
            <p className="text-xs text-gray-400">Click a row to view details</p>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-2">
              {[1,2,3,4,5].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 font-medium text-sm">No logs found.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Action", "Actor", "Role", "Target", "Details", "Severity", "IP", "Time"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.map((log) => {
                      const sev = SEVERITY[log.severity] || SEVERITY.info;
                      const act = ACTION_ICONS[log.action_type] || { icon: "📋", color: "bg-gray-100 text-gray-600" };
                      const roleColor = ROLE_COLORS[log.actor_role] || "bg-gray-100 text-gray-600";
                      const details = log.action_details || {};
                      const detailSummary = details.action
                        ? details.action + (details.doctor_name ? ` — ${details.doctor_name}` : "")
                        : details.doctor_name
                        ? details.doctor_name
                        : details.email
                        ? details.email
                        : details.outcome
                        ? details.outcome.slice(0, 40) + (details.outcome.length > 40 ? "…" : "")
                        : "—";
                      return (
                        <tr key={log.log_id} onClick={() => setSelectedLog(log)}
                          className="hover:bg-purple-50/40 transition-colors cursor-pointer">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${act.color}`}>{act.icon}</span>
                              <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{log.action_type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-900 text-sm">{log.actor_name || "—"}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${roleColor}`}>{log.actor_role || "—"}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-700 text-sm">{log.target_name || "—"}</p>
                            <p className="text-xs text-gray-400">{log.target_type}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-gray-600 max-w-[180px] truncate">{detailSummary}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${sev.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-gray-400 font-mono">{log.ip_address || "—"}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                            {formatIST(log.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-50">
                {logs.map((log) => {
                  const sev = SEVERITY[log.severity] || SEVERITY.info;
                  const act = ACTION_ICONS[log.action_type] || { icon: "📋", color: "bg-gray-100 text-gray-600" };
                  const roleColor = ROLE_COLORS[log.actor_role] || "bg-gray-100 text-gray-600";
                  return (
                    <div key={log.log_id} onClick={() => setSelectedLog(log)}
                      className="p-3 hover:bg-purple-50/40 cursor-pointer transition-colors">
                      <div className="flex items-start gap-2.5 mb-2">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${act.color}`}>{act.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-gray-700 font-semibold">{log.action_type}</p>
                          <p className="text-xs text-gray-400">{formatIST(log.created_at)}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold flex-shrink-0 ${sev.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                          {log.severity}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <span className="text-gray-600 font-semibold">{log.actor_name || "—"}</span>
                        <span className={`px-1.5 py-0.5 rounded font-semibold ${roleColor}`}>{log.actor_role}</span>
                        {log.target_name && <span className="text-gray-400">→ {log.target_name}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-purple-400 disabled:opacity-40 transition-all">
                Prev
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-purple-400 disabled:opacity-40 transition-all">
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Slide-in detail panel */}
      {selectedLog && <LogDetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}

function LogDetailPanel({ log, onClose }) {
  const sev      = SEVERITY[log.severity] || SEVERITY.info;
  const act      = ACTION_ICONS[log.action_type] || { icon: "📋", color: "bg-gray-100 text-gray-600" };
  const roleColor = ROLE_COLORS[log.actor_role] || "bg-gray-100 text-gray-600";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-lg">Log Details</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
          </div>
          <div className="flex items-center gap-3">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${act.color}`}>{act.icon}</span>
            <div>
              <p className="text-white font-bold">{log.action_type?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</p>
              <p className="text-purple-200 text-xs">{formatIST(log.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Severity */}
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${sev.border} ${sev.cls}`}>
            <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
            <span className="font-semibold text-sm capitalize">{log.severity} severity</span>
          </div>

          {/* Actor */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Performed By</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                {log.actor_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-bold text-gray-900">{log.actor_name || "—"}</p>
                <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${roleColor}`}>{log.actor_role}</span>
              </div>
            </div>
          </div>

          {/* Target */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Target</p>
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900">{log.target_name || "—"}</p>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-lg font-semibold capitalize">{log.target_type?.replace(/_/g, " ")}</span>
            </div>
            {log.target_id && <p className="text-xs text-gray-400 font-mono break-all">ID: {log.target_id}</p>}
          </div>

          {/* Action details */}
          {log.action_details && Object.keys(log.action_details).length > 0 && (
            <div className="bg-indigo-50 rounded-2xl p-4 space-y-3 border border-indigo-100">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Action Details</p>
              {log.action_details.updated_fields && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Updated fields:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {log.action_details.updated_fields.map((f) => (
                      <span key={f} className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-mono">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {Object.entries(log.action_details)
                .filter(([k]) => k !== "updated_fields")
                .map(([k, v]) => {
                  // Format values nicely
                  let displayValue = v;
                  if (v === null || v === undefined) displayValue = "—";
                  else if (typeof v === "boolean") displayValue = v ? "Yes" : "No";
                  else if (typeof v === "object") displayValue = JSON.stringify(v);
                  else displayValue = String(v);

                  // Special styling for certain keys
                  const isGps = k === "gps";
                  const isMood = k === "doctor_mood";

                  return (
                    <div key={k} className="flex items-start justify-between gap-3">
                      <span className="text-xs text-gray-500 font-semibold capitalize flex-shrink-0">{k.replace(/_/g, " ")}</span>
                      <span className={"text-xs font-medium text-right break-all " + (
                        isMood && v === "positive" ? "text-green-700" :
                        isMood && v === "negative" ? "text-red-700" :
                        isGps ? "font-mono text-gray-500" :
                        "text-gray-800"
                      )}>{displayValue}</span>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Timestamp */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Timestamp</p>
            <p className="text-sm font-semibold text-gray-800">{formatISTFull(log.created_at)}</p>
            {log.log_id && <p className="text-xs text-gray-400 font-mono mt-1">Log ID: {log.log_id}</p>}
          </div>

          {/* IP / User Agent if present */}
          {(log.ip_address || log.user_agent) && (
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Request Info</p>
              {log.ip_address && <p className="text-xs text-gray-600">IP: <span className="font-mono">{log.ip_address}</span></p>}
              {log.user_agent && <p className="text-xs text-gray-400 break-all">{log.user_agent}</p>}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl text-sm font-semibold transition-all">
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.25s ease-out; }
      `}</style>
    </>
  );
}
