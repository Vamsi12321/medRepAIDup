"use client";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";

export default function MessagesPage() {
  // Polls every 3 seconds — only runs while this page is mounted
  const { data, isLoading } = useQuery({
    queryKey: ["messages-list"],
    queryFn: () => get("/api/v1/network/messages"),
    refetchInterval: 3000,
    staleTime: 0,
  });

  const conversations = data?.conversations || [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Messages</h2>
          <p className="text-xs text-gray-400 mt-0.5">Updates every 3 seconds</p>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                  <div className="h-2.5 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4"></p>
            <p className="text-gray-500 font-medium">No messages yet.</p>
            <p className="text-gray-400 text-sm mt-1">Connect with doctors and MRs to start a conversation.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((c) => (
              <div key={c.conversation_id || c.user_id} className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${c.role === "MR" ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-indigo-500 to-purple-500"}`}>
                  {c.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900 truncate">{c.name}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{c.last_message_at ? new Date(c.last_message_at).toLocaleDateString() : ""}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{c.last_message || "No messages yet"}</p>
                </div>
                {c.unread_count > 0 && (
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">{c.unread_count}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}