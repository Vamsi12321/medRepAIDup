"use client";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { get, post as apiPost } from "@/lib/api";
import { Icons } from "@/components/network/Icons";

export default function DiscoverPage() {
  const queryClient = useQueryClient();
  const [search, setSearch]   = useState("");
  const [roleFilter, setRole] = useState("");
  const [page, setPage]       = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["discover-users", page, roleFilter, search],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit: 20 });
      if (roleFilter) params.append("role", roleFilter);
      if (search)     params.append("search", search);
      return get(`/api/v1/network/connections/discover?${params}`);
    },
    staleTime: 30000,
  });

  const users      = data?.users       || [];
  const totalPages = data?.total_pages || 1;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["discover-users"] });
    queryClient.invalidateQueries({ queryKey: ["my-connections"] });
    queryClient.invalidateQueries({ queryKey: ["requests-sent"] });
  };

  const connectMutation = useMutation({ mutationFn: (uid) => apiPost(`/api/v1/network/connections/request/${uid}`, {}), onSuccess: invalidateAll });
  const blockMutation   = useMutation({ mutationFn: (uid) => apiPost(`/api/v1/network/connections/${uid}/block`, {}), onSuccess: invalidateAll });

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icons.discover /></span>
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200" />
        </div>
        <div className="flex gap-2">
          {[{ v: "", l: "All" }, { v: "DOCTOR", l: "Doctors" }, { v: "MR", l: "MRs" }].map((f) => (
            <button key={f.v} onClick={() => { setRole(f.v); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${roleFilter === f.v ? "bg-orange-600 text-white shadow" : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-orange-300"}`}>
              {f.l}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-200">
          <p className="text-gray-500 font-medium">No users found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.user_id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${u.role === "MR" ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-indigo-500 to-purple-500"}`}>
                  {u.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.specialization || u.territory || u.role}</p>
                  {u.hospital && <p className="text-xs text-gray-400">{u.hospital}</p>}
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-bold ${u.role === "MR" ? "bg-orange-100 text-orange-700" : "bg-orange-100 text-orange-700"}`}>{u.role}</span>
                <div className="flex gap-2">
                  <button onClick={() => connectMutation.mutate(u.user_id)} disabled={connectMutation.isPending}
                    className="flex items-center gap-1 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                    <Icons.connect /> Connect
                  </button>
                  <button onClick={() => { if (confirm("Block this user?")) blockMutation.mutate(u.user_id); }}
                    className="flex items-center gap-1 text-xs border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 font-semibold px-2 py-1.5 rounded-lg transition-colors">
                    <Icons.block /> Block
                  </button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-orange-400 disabled:opacity-40 transition-all text-sm">Prev</button>
              <span className="text-gray-600 font-medium text-sm">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-orange-400 disabled:opacity-40 transition-all text-sm">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
