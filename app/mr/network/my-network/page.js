"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { get, post as apiPost, del } from "@/lib/api";
import { Icons } from "@/components/network/Icons";

export default function MyNetworkPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [subTab, setSubTab] = useState("connections");

  const { data: connData, isLoading: connLoading } = useQuery({ queryKey: ["my-connections"], queryFn: () => get("/api/v1/network/connections?limit=50"), staleTime: 30000 });
  const { data: recvData, isLoading: recvLoading } = useQuery({ queryKey: ["requests-received"], queryFn: () => get("/api/v1/network/connections/requests/received?limit=50"), staleTime: 30000 });
  const { data: sentData, isLoading: sentLoading } = useQuery({ queryKey: ["requests-sent"], queryFn: () => get("/api/v1/network/connections/requests/sent?limit=50"), staleTime: 30000 });

  const connections = connData?.connections || [];
  const received    = recvData?.requests    || [];
  const sent        = sentData?.requests    || [];

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["my-connections"] });
    queryClient.invalidateQueries({ queryKey: ["requests-received"] });
    queryClient.invalidateQueries({ queryKey: ["requests-sent"] });
    queryClient.invalidateQueries({ queryKey: ["discover-users"] });
  };

  const acceptMutation  = useMutation({ mutationFn: (id) => apiPost(`/api/v1/network/connections/requests/${id}/accept`, {}), onSuccess: invalidateAll });
  const rejectMutation  = useMutation({ mutationFn: (id) => apiPost(`/api/v1/network/connections/requests/${id}/reject`, {}), onSuccess: invalidateAll });
  const cancelMutation  = useMutation({ mutationFn: (id) => del(`/api/v1/network/connections/requests/${id}/cancel`), onSuccess: invalidateAll });
  const removeMutation  = useMutation({ mutationFn: (id) => del(`/api/v1/network/connections/${id}`), onSuccess: invalidateAll });
  const messageMutation = useMutation({ mutationFn: (uid) => apiPost(`/api/v1/network/chat/conversations/${uid}`, {}), onSuccess: () => router.push("/mr/network/messages") });

  const subTabs = [
    { id: "connections", label: "My Connections", count: connections.length },
    { id: "received",    label: "Received",        count: received.length },
    { id: "sent",        label: "Sent",             count: sent.length },
  ];

  const Avatar = ({ name, role }) => (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${role === "MR" ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-indigo-500 to-purple-500"}`}>
      {name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 flex gap-2 overflow-x-auto">
        {subTabs.map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${subTab === t.id ? "bg-orange-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
            {t.id === "connections" && <Icons.network />}
            {t.id === "received"    && <Icons.connect />}
            {t.id === "sent"        && <Icons.send />}
            {t.label}
            {t.count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${subTab === t.id ? "bg-white/20 text-white" : "bg-orange-100 text-orange-700"}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {subTab === "connections" && (
        <div className="space-y-3">
          {connLoading ? [1,2,3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />) :
           connections.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-200">
              <p className="text-gray-500 font-medium">No connections yet.</p>
            </div>
          ) : connections.map((c) => (
            <div key={c.user_id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 flex items-center gap-4">
              <Avatar name={c.name} role={c.role} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-500">{c.specialization || c.territory || c.role}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg font-bold ${c.role === "MR" ? "bg-orange-100 text-orange-700" : "bg-orange-100 text-orange-700"}`}>{c.role}</span>
              <div className="flex gap-2">
                <button onClick={() => messageMutation.mutate(c.user_id)} disabled={messageMutation.isPending}
                  className="flex items-center gap-1 text-xs border border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                  <Icons.message /> Message
                </button>
                <button onClick={() => { if (confirm("Remove this connection?")) removeMutation.mutate(c.connection_id || c.user_id); }}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                  <Icons.trash /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === "received" && (
        <div className="space-y-3">
          {recvLoading ? [1,2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />) :
           received.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-200">
              <p className="text-gray-500 font-medium">No pending requests.</p>
            </div>
          ) : received.map((r) => (
            <div key={r.connection_id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 flex items-center gap-4">
              <Avatar name={r.requester_name} role={r.requester_role} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{r.requester_name}</p>
                <p className="text-xs text-gray-500">{r.requester_specialization || r.requester_role}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => acceptMutation.mutate(r.connection_id)} disabled={acceptMutation.isPending}
                  className="flex items-center gap-1 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                  <Icons.check /> Accept
                </button>
                <button onClick={() => rejectMutation.mutate(r.connection_id)} disabled={rejectMutation.isPending}
                  className="flex items-center gap-1 text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                  <Icons.close /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === "sent" && (
        <div className="space-y-3">
          {sentLoading ? [1,2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />) :
           sent.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-200">
              <p className="text-gray-500 font-medium">No sent requests.</p>
            </div>
          ) : sent.map((r) => (
            <div key={r.connection_id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 flex items-center gap-4">
              <Avatar name={r.requester_name} role={r.requester_role} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{r.requester_name}</p>
                <p className="text-xs text-gray-500">{r.requester_specialization || r.requester_role}</p>
              </div>
              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg font-semibold">Pending</span>
              <button onClick={() => cancelMutation.mutate(r.connection_id)} disabled={cancelMutation.isPending}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                <Icons.close /> Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
