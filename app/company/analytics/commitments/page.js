"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put } from "@/lib/api";

const now = new Date();
const CM = now.getMonth() + 1;
const CY = now.getFullYear();

const APPROVAL_COLORS = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

export default function CommitmentsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("pending");
  const [month, setMonth] = useState(CM);
  const [year, setYear] = useState(CY);
  const [approveDiscount, setApproveDiscount] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: pendingData, isLoading: lp, refetch } = useQuery({
    queryKey: ["rcpa-pending"],
    queryFn: () => get("/api/v1/sfe/rcpa/pending-approvals"),
    staleTime: 7 * 60 * 1000,
  });
  const { data: allData, isLoading: la } = useQuery({
    queryKey: ["rcpa-all", month, year],
    queryFn: () => get(`/api/v1/sfe/rcpa?month=${month}&year=${year}`),
    enabled: tab === "all",
    staleTime: 7 * 60 * 1000,
  });

  const approveMut = useMutation({
    mutationFn: ({ id, approved_discount, approved_quantity }) => {
      const body = { approved_discount };
      if (approved_quantity) body.approved_quantity = approved_quantity;
      return post(`/api/v1/sfe/rcpa/${id}/approve`, body);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["rcpa-pending"] }); queryClient.invalidateQueries({ queryKey: ["rcpa-all"] }); },
  });
  const rejectMut = useMutation({
    mutationFn: ({ id }) => post(`/api/v1/sfe/rcpa/${id}/reject`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["rcpa-pending"] }); queryClient.invalidateQueries({ queryKey: ["rcpa-all"] }); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => put(`/api/v1/sfe/rcpa/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["rcpa-all"] }); queryClient.invalidateQueries({ queryKey: ["rcpa-pending"] }); setEditingId(null); },
  });

  const pending = pendingData?.commitments || [];
  const all = allData?.commitments || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
          <button onClick={() => setTab("pending")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === "pending" ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}>⏳ Pending ({pending.length})</button>
          <button onClick={() => setTab("all")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === "all" ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}>📋 All</button>
        </div>
        {tab === "all" && (
          <div className="flex items-center gap-2">
            <select value={month} onChange={(e) => setMonth(+e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium">
              {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{new Date(2026, i).toLocaleString("default", { month: "short" })}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(+e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium">
              {[2024,2025,2026,2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Pending */}
      {tab === "pending" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">Pending Approvals</p>
            <button onClick={() => refetch()} className="text-xs text-indigo-600 font-semibold hover:underline">🔄 Refresh</button>
          </div>
          {lp ? <div className="p-8 text-center text-xs text-gray-400">Loading...</div> : pending.length === 0 ? (
            <div className="text-center py-12"><span className="text-4xl block mb-3">✅</span><p className="text-sm text-gray-500">No pending approvals</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pending.map((c) => (
                <div key={c.id} className="p-4 hover:bg-gray-50/50">
                  {editingId === c.id ? (
                    <div className="space-y-3 bg-amber-50/50 rounded-xl p-3 border border-amber-100">
                      <p className="text-xs font-bold text-gray-900">{c.doctor_name} · <span className="text-indigo-600">{c.drug_name}</span></p>
                      <div className="grid grid-cols-3 gap-3">
                        <div><label className="text-[10px] text-gray-500 block mb-1">Qty ({c.quantity_unit})</label><input type="number" min="1" value={editForm.committed_quantity || ""} onChange={(e) => setEditForm({...editForm, committed_quantity: e.target.value})} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none" placeholder={String(c.committed_quantity)} /></div>
                        <div><label className="text-[10px] text-gray-500 block mb-1">Rx/Mo</label><input type="number" min="1" value={editForm.rx_per_month || ""} onChange={(e) => setEditForm({...editForm, rx_per_month: e.target.value})} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none" placeholder={String(c.rx_per_month)} /></div>
                        <div><label className="text-[10px] text-gray-500 block mb-1">Disc %</label><input type="number" min="0" max="100" step="0.5" value={editForm.requested_discount ?? ""} onChange={(e) => setEditForm({...editForm, requested_discount: e.target.value})} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none" placeholder={String(c.requested_discount || 0)} /></div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 border border-gray-200">Cancel</button>
                        <button onClick={() => { const body = {}; if (editForm.committed_quantity) body.committed_quantity = parseInt(editForm.committed_quantity); if (editForm.rx_per_month) body.rx_per_month = parseInt(editForm.rx_per_month); if (editForm.requested_discount !== undefined && editForm.requested_discount !== "") body.requested_discount = parseFloat(editForm.requested_discount); updateMut.mutate({ id: c.id, body }); }}
                          disabled={updateMut.isPending} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50">{updateMut.isPending ? "..." : "Save"}</button>
                      </div>
                    </div>
                  ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.doctor_name?.charAt(0)}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900">{c.doctor_name}</p>
                        <p className="text-xs text-gray-500"><span className="font-semibold text-indigo-600">{c.drug_name}</span> · {c.committed_quantity} {c.quantity_unit} · {c.rx_per_month} Rx/mo{c.committed_revenue ? ` · ₹${c.committed_revenue.toLocaleString()}` : ""}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">MR: {c.mr_name || "—"}{c.doctor_location ? ` · 📍 ${c.doctor_location.name}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingId(c.id); setEditForm({ committed_quantity: c.committed_quantity, rx_per_month: c.rx_per_month, requested_discount: "" }); }}
                          className="text-[10px] text-indigo-600 font-semibold px-2 py-1 rounded hover:bg-indigo-50 border border-indigo-100">Edit</button>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1 text-center">
                          <p className="text-[8px] text-amber-600 font-bold uppercase">Requested</p>
                          <p className="text-sm font-extrabold text-amber-700">{c.requested_discount || 0}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input type="number" min="1" value={approveDiscount[c.id + "_qty"] ?? c.committed_quantity ?? ""} onChange={(e) => setApproveDiscount((p) => ({ ...p, [c.id + "_qty"]: e.target.value }))}
                          className="w-14 text-[10px] border border-gray-200 rounded-md px-1.5 py-1 text-center outline-none focus:ring-1 focus:ring-blue-200" placeholder="qty" title="Approved Quantity" />
                        <input type="number" min="0" max="100" step="0.5" value={approveDiscount[c.id] ?? c.requested_discount ?? ""} onChange={(e) => setApproveDiscount((p) => ({ ...p, [c.id]: e.target.value }))}
                          className="w-14 text-[10px] border border-gray-200 rounded-md px-1.5 py-1 text-center outline-none focus:ring-1 focus:ring-emerald-200" placeholder="disc%" title="Approved Discount %" />
                        <button onClick={() => approveMut.mutate({ id: c.id, approved_discount: parseFloat(approveDiscount[c.id] ?? c.requested_discount ?? 0), approved_quantity: approveDiscount[c.id + "_qty"] ? parseInt(approveDiscount[c.id + "_qty"]) : undefined })} disabled={approveMut.isPending}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white w-7 h-7 rounded-md text-xs font-bold disabled:opacity-50 flex items-center justify-center">✓</button>
                        <button onClick={() => rejectMut.mutate({ id: c.id })} disabled={rejectMut.isPending}
                          className="bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-md text-xs font-bold disabled:opacity-50 flex items-center justify-center">✕</button>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All */}
      {tab === "all" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100"><p className="text-sm font-bold text-gray-800">All Commitments ({all.length})</p></div>
          {la ? <div className="p-8 text-center text-xs text-gray-400">Loading...</div> : all.length === 0 ? (
            <div className="text-center py-12"><span className="text-3xl block mb-2">💊</span><p className="text-sm text-gray-500">No commitments</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {all.map((c) => (
                <div key={c.id} className="p-4 hover:bg-gray-50/50">
                  {editingId === c.id ? (
                    <div className="space-y-3 bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
                      <p className="text-xs font-bold text-gray-900">{c.doctor_name} · <span className="text-indigo-600">{c.drug_name}</span></p>
                      <div className="grid grid-cols-3 gap-3">
                        <div><label className="text-[10px] text-gray-500 block mb-1">Qty</label><input type="number" min="1" value={editForm.committed_quantity || ""} onChange={(e) => setEditForm({...editForm, committed_quantity: e.target.value})} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none" /></div>
                        <div><label className="text-[10px] text-gray-500 block mb-1">Rx/Mo</label><input type="number" min="1" value={editForm.rx_per_month || ""} onChange={(e) => setEditForm({...editForm, rx_per_month: e.target.value})} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none" /></div>
                        <div><label className="text-[10px] text-gray-500 block mb-1">Disc %</label><input type="number" min="0" max="100" step="0.5" value={editForm.requested_discount ?? ""} onChange={(e) => setEditForm({...editForm, requested_discount: e.target.value})} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none" /></div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 border border-gray-200">Cancel</button>
                        <button onClick={() => { const body = {}; if (editForm.committed_quantity) body.committed_quantity = parseInt(editForm.committed_quantity); if (editForm.rx_per_month) body.rx_per_month = parseInt(editForm.rx_per_month); if (editForm.requested_discount !== undefined && editForm.requested_discount !== "") body.requested_discount = parseFloat(editForm.requested_discount); updateMut.mutate({ id: c.id, body }); }}
                          disabled={updateMut.isPending} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50">{updateMut.isPending ? "..." : "Save"}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.doctor_name?.charAt(0)}</div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-gray-900">{c.doctor_name}</p>
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${APPROVAL_COLORS[c.approval_status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>{c.approval_status}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5"><span className="font-semibold text-indigo-600">{c.drug_name}</span> · {c.committed_quantity} {c.quantity_unit || "units"} · {c.rx_per_month} Rx/mo</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {c.committed_revenue && <p className="text-sm font-bold text-indigo-700">₹{c.committed_revenue.toLocaleString()}</p>}
                          {c.net_revenue != null && <p className="text-[10px] text-emerald-600 font-semibold">Net: ₹{c.net_revenue.toLocaleString()}</p>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pl-12">
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 flex-wrap">
                          <span>MR: {c.mr_name || "—"}</span>
                          {c.approved_discount != null && <span>Discount: {c.approved_discount}%</span>}
                          {c.doctor_location && <span>📍 {c.doctor_location.name}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditingId(c.id); setEditForm({ committed_quantity: c.committed_quantity, rx_per_month: c.rx_per_month, requested_discount: "" }); }}
                            className="text-[10px] text-indigo-600 font-semibold px-2 py-1 rounded hover:bg-indigo-50 border border-indigo-100">Edit</button>
                          {(c.approval_status === "PENDING" || c.approval_status === "REJECTED") && (
                            <div className="flex items-center gap-1">
                              <input type="number" min="1" value={approveDiscount[c.id + "_qty"] ?? c.committed_quantity ?? ""} onChange={(e) => setApproveDiscount((p) => ({...p, [c.id + "_qty"]: e.target.value}))}
                                className="w-12 text-[10px] border border-gray-200 rounded-md px-1 py-1 text-center outline-none" placeholder="qty" title="Qty" />
                              <input type="number" min="0" max="100" step="0.5" value={approveDiscount[c.id] ?? c.requested_discount ?? ""} onChange={(e) => setApproveDiscount((p) => ({...p, [c.id]: e.target.value}))}
                                className="w-12 text-[10px] border border-gray-200 rounded-md px-1 py-1 text-center outline-none" placeholder="%" title="Disc%" />
                              <button onClick={() => approveMut.mutate({ id: c.id, approved_discount: parseFloat(approveDiscount[c.id] ?? c.requested_discount ?? 0), approved_quantity: approveDiscount[c.id + "_qty"] ? parseInt(approveDiscount[c.id + "_qty"]) : undefined })} disabled={approveMut.isPending} className="bg-emerald-500 text-white w-6 h-6 rounded-md text-[10px] font-bold disabled:opacity-50 flex items-center justify-center">✓</button>
                              <button onClick={() => rejectMut.mutate({ id: c.id })} disabled={rejectMut.isPending} className="bg-red-500 text-white w-6 h-6 rounded-md text-[10px] font-bold disabled:opacity-50 flex items-center justify-center">✕</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
