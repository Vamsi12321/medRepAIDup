"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, put } from "@/lib/api";
import { formatIST } from "@/lib/time";

const STATUS_STYLES = {
  open:        { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500" },
  in_progress: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  resolved:    { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  rejected:    { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500" },
};

export default function AdminGrievances() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminDept, setAdminDept] = useState(null); // null = general/universal admin

  const queryClient = useQueryClient();

  useEffect(() => {
    const dept = localStorage.getItem("userDepartment");
    const hasNoDept = !dept || dept === "null" || dept === "undefined" || dept === "general" || dept.trim() === "";
    if (!hasNoDept) {
      setAdminDept(dept);
      setActiveTab(dept); // lock to their department
    }
  }, []);

  // Department admin: always filter by their dept. General admin: use activeTab.
  const deptFilter = adminDept || (activeTab !== "all" ? activeTab : "");

  const { data: statsData } = useQuery({
    queryKey: ["grievance-stats", adminDept],
    queryFn: () => get("/api/v1/grievances/admin/stats/dashboard" + (adminDept ? "?department=" + adminDept : "")),
    staleTime: 30000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-grievances", deptFilter],
    queryFn: () => get("/api/v1/grievances/admin/list?limit=50" + (deptFilter ? "&department=" + deptFilter : "")),
    staleTime: 30000,
  });

  // Fetch departments list for general admin tabs
  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => get("/api/v1/departments").then((d) => Array.isArray(d) ? d : d.departments || d.data || []),
    staleTime: 5 * 60 * 1000,
    enabled: !adminDept, // only fetch if general admin
  });

  const departments = deptData || [];
  const tickets = data?.grievances || [];
  const stats = statsData || {};

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <CompanyNavbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        <Breadcrumb />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Grievance Management</h1>
              <p className="text-gray-500 text-xs">
                {adminDept ? `${adminDept.charAt(0).toUpperCase() + adminDept.slice(1)} department tickets` : "View & respond to MR tickets"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-purple-600">{stats.open ?? "—"}</p>
              <p className="text-xs text-gray-400">Open</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-yellow-600">{stats.in_progress ?? "—"}</p>
              <p className="text-xs text-gray-400">In Progress</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-600">{stats.resolved ?? "—"}</p>
              <p className="text-xs text-gray-400">Resolved</p>
            </div>
          </div>
        </div>

        {/* Tabs - only show for general/universal admin */}
        {!adminDept && (
          <div className="flex gap-1.5 mb-4 flex-wrap">
            <button onClick={() => setActiveTab("all")}
              className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-all " + (
                activeTab === "all" ? "bg-purple-600 text-white shadow" : "bg-white text-gray-500 border border-gray-200"
              )}>
              All
            </button>
            {departments.filter(d => d.is_active !== false).map((d) => (
              <button key={d.code} onClick={() => setActiveTab(d.code)}
                className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-all " + (
                  activeTab === d.code ? "bg-purple-600 text-white shadow" : "bg-white text-gray-500 border border-gray-200"
                )}>
                {d.name}
              </button>
            ))}
          </div>
        )}

        {/* Tickets */}
        {isLoading ? (
          <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />)}</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <span className="text-4xl">📝</span>
            <p className="text-gray-400 mt-3 text-sm">No grievances found.</p>
          </div>
        ) : (
        <div className="space-y-2">
          {tickets.map((t) => {
            const s = STATUS_STYLES[t.status] || STATUS_STYLES.open;
            return (
              <div key={t.ticket_id || t._id} onClick={() => setSelectedTicket(t)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">#{t.ticket_id}</span>
                      <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold " + s.bg + " " + s.text}>
                        <span className={"w-1.5 h-1.5 rounded-full " + s.dot} />
                        {(t.status || "open").replace("_", " ")}
                      </span>
                      {t.priority === "urgent" && <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-700">URGENT</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{t.subject}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span className="font-medium text-gray-600">{t.created_by_name || t.mr_name}</span>
                      <span>{t.mr_territory || t.territory}</span>
                      <span className="capitalize">{t.department}</span>
                    </div>
                  </div>
                  <button className="bg-purple-100 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-200 transition-all flex-shrink-0">
                    {t.status === "open" ? "Respond" : "View"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </main>

      {selectedTicket && (
        <GrievanceDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onResponded={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-grievances"] });
            queryClient.invalidateQueries({ queryKey: ["grievance-stats"] });
          }}
        />
      )}
    </div>
  );
}

function GrievanceDetailModal({ ticket, onClose, onResponded }) {
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState(ticket.status === "open" ? "in_progress" : ticket.status);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Fetch full ticket detail to get the latest admin_response
  const { data: detail } = useQuery({
    queryKey: ["grievance-detail", ticket.ticket_id],
    queryFn: () => get(`/api/v1/grievances/admin/${ticket.ticket_id}`),
    staleTime: 0,
  });

  const fullTicket = detail || ticket;

  const handleSend = async () => {
    if (!response.trim()) return;
    setSending(true);
    setError("");
    try {
      await put("/api/v1/grievances/admin/" + ticket.ticket_id, { admin_response: response, status });
      onResponded();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to send response");
    }
    setSending(false);
  };

  const s = STATUS_STYLES[fullTicket.status] || STATUS_STYLES.open;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-gray-400">#{fullTicket.ticket_id}</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>

          <h3 className="text-base font-bold text-gray-900 mb-2">{fullTicket.subject}</h3>

          <div className="flex items-center gap-2 mb-3 text-xs flex-wrap">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold">{fullTicket.created_by_name || fullTicket.mr_name}</span>
            <span className="text-gray-400">{fullTicket.mr_territory || fullTicket.territory}</span>
            <span className="capitalize text-gray-400">{fullTicket.department}</span>
            <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold " + s.bg + " " + s.text}>
              <span className={"w-1.5 h-1.5 rounded-full " + s.dot} />
              {(fullTicket.status || "open").replace("_", " ")}
            </span>
          </div>

          {/* Description */}
          {fullTicket.description && (
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 mb-4 whitespace-pre-wrap">
              {fullTicket.description}
            </div>
          )}

          {/* Previous admin response */}
          {(fullTicket.admin_response || fullTicket.response) && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
              <p className="text-xs font-bold text-green-600 mb-1">Admin Response:</p>
              <p className="text-sm text-green-800 whitespace-pre-wrap">{fullTicket.admin_response || fullTicket.response}</p>
              {fullTicket.responded_by_name && <p className="text-xs text-green-600 mt-2">— {fullTicket.responded_by_name}</p>}
              {fullTicket.responded_at && <p className="text-xs text-green-500 mt-0.5">{formatIST(fullTicket.responded_at)}</p>}
            </div>
          )}

          {/* Response form */}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs mb-3">{error}</div>}

          <div className="space-y-2">
            <textarea
              placeholder="Type your response..."
              rows={3}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none resize-none focus:ring-2 focus:ring-purple-200"
            />
            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none flex-1"
              >
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={handleSend}
                disabled={sending || !response.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-xs disabled:opacity-50 transition-all"
              >
                {sending ? "Sending..." : "Send Response"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
