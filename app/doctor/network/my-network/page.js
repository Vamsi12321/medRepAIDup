"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { get, post as apiPost, del } from "@/lib/api";
import { Icons } from "@/components/network/Icons";
import UserProfileModal from "@/components/network/UserProfileModal";

export default function MyNetworkPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [subTab, setSubTab] = useState("connections");
  const [viewingUserId, setViewingUserId] = useState(null);

  const { data: connData, isLoading: connLoading }    = useQuery({ queryKey: ["my-connections"], queryFn: () => get("/api/v1/network/connections?limit=50"), staleTime: 0 });
  const { data: recvData, isLoading: recvLoading }    = useQuery({ queryKey: ["requests-received"], queryFn: () => get("/api/v1/network/connections/requests/received?limit=50"), staleTime: 0 });
  const { data: sentData, isLoading: sentLoading }    = useQuery({ queryKey: ["requests-sent"], queryFn: () => get("/api/v1/network/connections/requests/sent?limit=50"), staleTime: 0 });
  const { data: blockedData, isLoading: blockedLoading } = useQuery({ queryKey: ["blocked-users"], queryFn: () => get("/api/v1/network/connections?status=blocked&limit=50"), staleTime: 0 });

  const connections = connData?.connections   || [];
  const received    = recvData?.requests      || [];
  const sent        = sentData?.requests      || [];
  const blocked     = blockedData?.connections || [];

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["my-connections"] });
    queryClient.invalidateQueries({ queryKey: ["requests-received"] });
    queryClient.invalidateQueries({ queryKey: ["requests-sent"] });
    queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    queryClient.invalidateQueries({ queryKey: ["discover-users"] });
  };

  const acceptMutation  = useMutation({ mutationFn: (id) => apiPost(`/api/v1/network/connections/requests/${id}/accept`, {}), onSuccess: invalidateAll });
  const rejectMutation  = useMutation({ mutationFn: (id) => apiPost(`/api/v1/network/connections/requests/${id}/reject`, {}), onSuccess: invalidateAll });
  const cancelMutation  = useMutation({ mutationFn: (id) => del(`/api/v1/network/connections/requests/${id}/cancel`), onSuccess: invalidateAll });
  const removeMutation  = useMutation({ mutationFn: (id) => del(`/api/v1/network/connections/${id}`), onSuccess: invalidateAll });
  const blockMutation   = useMutation({ mutationFn: (uid) => apiPost(`/api/v1/network/connections/${uid}/block`, {}), onSuccess: invalidateAll });
  const unblockMutation = useMutation({ mutationFn: (uid) => del(`/api/v1/network/connections/${uid}/unblock`), onSuccess: invalidateAll });
  const messageMutation = useMutation({ mutationFn: (uid) => apiPost(`/api/v1/network/chat/conversations/${uid}`, {}), onSuccess: () => router.push("/doctor/network/messages") });

  const subTabs = [
    { id: "connections", label: "My Connections", count: connections.length },
    { id: "received",    label: "Received",        count: received.length },
    { id: "sent",        label: "Sent",             count: sent.length },
    { id: "blocked",     label: "Blocked",          count: blocked.length },
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${subTab === t.id ? "bg-indigo-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
            {t.id === "connections" && <Icons.network />}
            {t.id === "received"    && <Icons.connect />}
            {t.id === "sent"        && <Icons.send />}
            {t.label}
            {t.count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${subTab === t.id ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"}`}>{t.count}</span>}
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
              <button onClick={() => setViewingUserId(c.user_id)} className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity">
                <Avatar name={c.name} role={c.role} />
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate hover:text-indigo-600 transition-colors">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.specialization || c.territory || c.role}</p>
                </div>
              </button>
              <span className={`text-xs px-2 py-1 rounded-lg font-bold flex-shrink-0 ${c.role === "MR" ? "bg-orange-100 text-orange-700" : "bg-indigo-100 text-indigo-700"}`}>{c.role}</span>
              <div className="flex gap-2 flex-wrap justify-end">
                <button onClick={() => messageMutation.mutate(c.user_id)} disabled={messageMutation.isPending}
                  className="flex items-center gap-1 text-xs border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                  <Icons.message /> Message
                </button>
                <button onClick={() => { if (confirm("Remove this connection?")) removeMutation.mutate(c.connection_id || c.user_id); }}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                  <Icons.trash /> Remove
                </button>
                <button onClick={() => { if (confirm(`Block ${c.name}? They won't be able to send you requests.`)) blockMutation.mutate(c.user_id); }}
                  disabled={blockMutation.isPending}
                  className="flex items-center gap-1 text-xs border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 font-semibold px-2 py-1 rounded-lg transition-colors disabled:opacity-50">
                  <Icons.block /> Block
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
                  className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                  <Icons.check /> Accept
                </button>
                <button onClick={() => rejectMutation.mutate(r.connection_id)} disabled={rejectMutation.isPending}
                  className="flex items-center gap-1 text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                  <Icons.close /> Reject
                </button>
                <button onClick={() => { if (confirm(`Block ${r.requester_name}?`)) blockMutation.mutate(r.requester_id); }}
                  disabled={blockMutation.isPending}
                  className="flex items-center gap-1 text-xs border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 font-semibold px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                  <Icons.block /> Block
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
      {subTab === "blocked" && (
        <div className="space-y-3">
          {blockedLoading ? [1,2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />) :
           blocked.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-200">
              <p className="text-gray-500 font-medium">No blocked users.</p>
            </div>
          ) : blocked.map((u) => (
            <div key={u.user_id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${u.role === "MR" ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-gray-400 to-gray-500"}`}>
                {u.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{u.name}</p>
                <p className="text-xs text-gray-500">{u.specialization || u.territory || u.role}</p>
              </div>
              <span className="text-xs bg-red-50 text-red-500 border border-red-200 px-2 py-1 rounded-lg font-semibold">Blocked</span>
              <button onClick={() => { if (confirm(`Unblock ${u.name}?`)) unblockMutation.mutate(u.user_id); }}
                disabled={unblockMutation.isPending}
                className="flex items-center gap-1 text-xs border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
      {viewingUserId && <UserProfileModal userId={viewingUserId} onClose={() => setViewingUserId(null)} />}
    </div>
  );
}
