"use client";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get, post } from "@/lib/api";
import { formatIST } from "@/lib/time";

const STATUS_STYLES = {
  open:        { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500" },
  in_progress: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  resolved:    { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  rejected:    { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500" },
};

const PRIORITY_STYLES = {
  low:    { bg: "bg-gray-100",   text: "text-gray-600" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-700" },
  high:   { bg: "bg-red-100",    text: "text-red-700" },
};

export default function GrievancePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => get("/api/v1/departments").then((d) => Array.isArray(d) ? d : d.departments || d.data || []),
    staleTime: 5 * 60 * 1000,
  });

  const departments = Array.isArray(deptData) ? deptData : (deptData?.departments || []);

  const { data, isLoading } = useQuery({
    queryKey: ["grievances", activeTab],
    queryFn: () => get("/api/v1/grievances?limit=50" + (activeTab !== "all" ? "&department=" + activeTab : "")),
    staleTime: 30000,
  });

  const tickets = data?.grievances || [];
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["grievances"] });

  return (
    <div className="min-h-screen bg-[#fafbfd]">
      <MRNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumb />
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Grievances</h1>
            <p className="text-sm text-gray-400 mt-0.5">Raise and track your tickets</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5">
            ➕ New Ticket
          </button>
        </div>

        {/* Department tabs */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
          <button onClick={() => setActiveTab("all")}
            className={"px-4 py-2 rounded-full text-xs font-bold transition-all " + (
              activeTab === "all" ? "bg-orange-500 text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
            )}>
            All
          </button>
          {departments.map((d) => (
            <button key={d.code} onClick={() => setActiveTab(d.code)}
              className={"px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap " + (
                activeTab === d.code ? "bg-orange-500 text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
              )}>
              {d.name}
            </button>
          ))}
        </div>

        {/* Tickets */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <span className="text-4xl block mb-3">📝</span>
            <p className="text-gray-700 font-bold text-sm mb-1">No tickets yet</p>
            <p className="text-gray-400 text-xs">Create one to get started</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tickets.map((ticket) => {
              const s = STATUS_STYLES[ticket.status] || STATUS_STYLES.open;
              const p = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium;
              return (
                <div key={ticket.ticket_id || ticket._id || ticket.id} onClick={() => setSelectedTicket(ticket)}
                  className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-sm flex-1 line-clamp-1">{ticket.subject}</h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border " + s.bg + " " + s.text}>
                        <span className={"w-1.5 h-1.5 rounded-full " + s.dot} />
                        {(ticket.status || "open").replace("_", " ")}
                      </span>
                      <span className={"px-2 py-0.5 rounded-full text-[10px] font-bold " + p.bg + " " + p.text}>
                        {ticket.priority || "medium"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-2">{ticket.description}</p>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="bg-gray-50 px-2 py-0.5 rounded border border-gray-100 capitalize">{ticket.department}</span>
                    <span>{ticket.created_at ? formatIST(ticket.created_at, { day: "2-digit", month: "short" }) : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create ticket modal */}
      {showCreate && (
        <CreateTicketModal
          department={activeTab}
          onClose={() => setShowCreate(false)}
          onCreated={() => { invalidate(); setShowCreate(false); }}
        />
      )}

      {/* Ticket detail modal */}
      {selectedTicket && (
        <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </div>
  );
}

function CreateTicketModal({ department, onClose, onCreated }) {
  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => get("/api/v1/departments").then((d) => Array.isArray(d) ? d : d.departments || d.data || []),
    staleTime: 5 * 60 * 1000,
  });
  const departments = Array.isArray(deptData) ? deptData : (deptData?.departments || []);

  const [form, setForm] = useState({
    department: department === "all" ? (departments[0]?.code || "hr") : department,
    subject: "",
    description: "",
    priority: "medium",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim()) { setError("Subject is required"); return; }
    if (!form.description.trim()) { setError("Description is required"); return; }
    setSaving(true); setError("");
    try {
      await post("/api/v1/grievances", form);
      onCreated();
    } catch (err) {
      setError(err.message || "Failed to create ticket");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white font-bold text-sm">New Grievance Ticket</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-200 bg-white">
                {departments.map((d) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
                {departments.length === 0 && <>
                  <option value="hr">HR</option>
                  <option value="finance">Finance</option>
                </>}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-200 bg-white">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Subject <span className="text-red-500">*</span></label>
            <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Brief summary of your issue..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-200" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your issue in detail..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-200 resize-none" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl font-semibold text-xs hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-xl font-bold text-xs disabled:opacity-50 transition-all">
              {saving ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TicketDetailModal({ ticket, onClose }) {
  // Fetch full ticket detail to get the latest admin_response
  const { data: detail } = useQuery({
    queryKey: ["grievance-detail", ticket.ticket_id || ticket._id],
    queryFn: () => get(`/api/v1/grievances/${ticket.ticket_id || ticket._id}`),
    staleTime: 0,
  });

  const fullTicket = detail || ticket;
  const s = STATUS_STYLES[fullTicket.status] || STATUS_STYLES.open;
  const p = PRIORITY_STYLES[fullTicket.priority] || PRIORITY_STYLES.medium;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-white/20 text-white"}>
              {(fullTicket.status || "open").replace("_", " ")}
            </span>
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl">&times;</button>
          </div>
          <h2 className="text-white font-bold text-base">{fullTicket.subject}</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={"px-2 py-0.5 rounded-md text-xs font-semibold " + s.bg + " " + s.text}>
              {(fullTicket.status || "open").replace("_", " ")}
            </span>
            <span className={"px-2 py-0.5 rounded-md text-xs font-semibold " + p.bg + " " + p.text}>
              {fullTicket.priority}
            </span>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 capitalize">
              {fullTicket.department}
            </span>
          </div>

          {fullTicket.description && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {fullTicket.description}
            </div>
          )}

          <div className="text-xs text-gray-400 space-y-1">
            <p>Created: {fullTicket.created_at ? formatIST(fullTicket.created_at) : "—"}</p>
            {fullTicket.updated_at && <p>Updated: {formatIST(fullTicket.updated_at)}</p>}
            {fullTicket.resolved_at && <p>Resolved: {formatIST(fullTicket.resolved_at)}</p>}
          </div>

          {(fullTicket.admin_response || fullTicket.response) && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs font-bold text-green-700 mb-1">Admin Response</p>
              <p className="text-sm text-green-800 whitespace-pre-wrap">{fullTicket.admin_response || fullTicket.response}</p>
              {fullTicket.responded_by_name && <p className="text-xs text-green-600 mt-2">— {fullTicket.responded_by_name}</p>}
              {fullTicket.responded_at && <p className="text-xs text-green-500 mt-0.5">{formatIST(fullTicket.responded_at)}</p>}
            </div>
          )}

          <button onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
