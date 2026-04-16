"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { get, put, del } from "@/lib/api";

const TYPE_CONFIG = {
  connection_request:  { icon: "", color: "from-blue-500 to-indigo-500" },
  connection_accepted: { icon: "", color: "from-green-500 to-emerald-500" },
  post_liked:          { icon: "", color: "from-indigo-500 to-purple-500" },
  post_commented:      { icon: "", color: "from-purple-500 to-pink-500" },
  post_shared:         { icon: "", color: "from-pink-500 to-rose-500" },
  new_message:         { icon: "", color: "from-blue-500 to-cyan-500" },
  group_message:       { icon: "", color: "from-teal-500 to-cyan-500" },
  group_added:         { icon: "", color: "from-green-500 to-teal-500" },
  cme_created:         { icon: "", color: "from-green-500 to-emerald-500" },
  cme_reminder_1day:   { icon: "", color: "from-yellow-500 to-orange-500" },
  cme_reminder_1hour:  { icon: "", color: "from-orange-500 to-red-500" },
  cme_recording:       { icon: "", color: "from-purple-500 to-indigo-500" },
  drug_added:          { icon: "", color: "from-blue-500 to-cyan-500" },
  visit_scheduled:     { icon: "", color: "from-indigo-500 to-blue-500" },
  visit_rescheduled:   { icon: "", color: "from-yellow-500 to-orange-500" },
  visit_completed:     { icon: "", color: "from-green-500 to-emerald-500" },
  visit_cancelled:     { icon: "", color: "from-red-500 to-pink-500" },
};

function getNavPath(notif, role) {
  const base = role === "mr" ? "/mr" : "/doctor";
  const d = notif.data || {};
  switch (notif.type) {
    case "connection_request":
    case "connection_accepted": return `${base}/network/my-network`;
    case "post_liked":
    case "post_commented":
    case "post_shared":         return `${base}/network/feed${d.post_id ? `?post=${d.post_id}` : ""}`;
    case "new_message":         return `${base}/network/messages`;
    case "group_message":
    case "group_added":         return `${base}/network/groups`;
    case "cme_created":
    case "cme_reminder_1day":
    case "cme_reminder_1hour":
    case "cme_recording":       return `${base}/cme-events`;
    case "drug_added":          return `${base}/drug-search`;
    case "visit_scheduled":
    case "visit_rescheduled":
    case "visit_completed":
    case "visit_cancelled":     return role === "mr" ? "/mr/visits" : `${base}/home`;
    default:                    return `${base}/home`;
  }
}

const timeAgo = (ts) => {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function NotificationBell({ accentColor = "indigo" }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const ref = useRef(null);
  const role = typeof window !== "undefined" ? localStorage.getItem("userRole")?.toLowerCase() : "doctor";

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Unread count — polls every 30s
  const { data: countData } = useQuery({
    queryKey: ["notif-count"],
    queryFn: () => get("/api/v1/notifications/unread-count"),
    refetchInterval: 30000,
    staleTime: 0,
  });

  // Full list — fetched when panel opens
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: () => get(`/api/v1/notifications?limit=50${filter === "unread" ? "&unread_only=true" : ""}`),
    enabled: open,
    staleTime: 10000,
  });

  const unreadCount   = countData?.count || 0;
  const notifications = data?.notifications || [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notif-count"] });
  };

  const markReadMutation = useMutation({
    mutationFn: (id) => put(`/api/v1/notifications/${id}/read`, {}),
    onSuccess: invalidate,
  });

  const markAllMutation = useMutation({
    mutationFn: () => put("/api/v1/notifications/read-all", {}),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => del(`/api/v1/notifications/${id}`),
    onSuccess: invalidate,
  });

  const clearAllMutation = useMutation({
    mutationFn: () => del("/api/v1/notifications/clear-all"),
    onSuccess: invalidate,
  });

  const handleClick = (notif) => {
    if (!notif.is_read) markReadMutation.mutate(notif.notification_id);
    setOpen(false);
    router.push(getNavPath(notif, role));
  };

  const accent = accentColor;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)}
        className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[520px]">
          {/* Header */}
          <div className={`bg-gradient-to-r from-${accent}-600 to-purple-600 px-5 py-4 rounded-t-2xl flex-shrink-0`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 Notifications
                {unreadCount > 0 && <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount} new</span>}
              </h3>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex gap-2">
              {["all", "unread"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${filter === f ? "bg-white text-indigo-700" : "text-white/70 hover:bg-white/20"}`}>
                  {f}
                </button>
              ))}
              <div className="flex-1" />
              {unreadCount > 0 && (
                <button onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}
                  className="text-white/70 hover:text-white text-xs font-semibold disabled:opacity-50">
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <p className="text-3xl mb-2"></p>
                <p className="text-gray-500 text-sm font-medium">{filter === "unread" ? "No unread notifications" : "No notifications yet"}</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || { icon: "", color: "from-gray-400 to-gray-500" };
                return (
                  <div key={n.notification_id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer group transition-colors ${!n.is_read ? `bg-${accent}-50/40` : ""}`}
                    onClick={() => handleClick(n)}>
                    <div className={`w-10 h-10 bg-gradient-to-br ${cfg.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-lg">{cfg.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold text-gray-900 leading-tight ${!n.is_read ? "font-bold" : ""}`}>{n.title}</p>
                        {!n.is_read && <span className={`w-2 h-2 bg-${accent}-500 rounded-full flex-shrink-0 mt-1`} />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n.notification_id); }}
                      className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => { if (confirm("Clear all notifications?")) clearAllMutation.mutate(); }}
                disabled={clearAllMutation.isPending}
                className="w-full text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors disabled:opacity-50">
                {clearAllMutation.isPending ? "Clearing..." : "Clear all notifications"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
