"use client";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import { get, post, del } from "@/lib/api";

const timeAgo = (ts) => {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function DoctorNetwork() {
  const [activeTab, setActiveTab] = useState("feed");

  const tabs = [
    { id: "feed",      name: "Feed",       icon: "📰" },
    { id: "my-posts",  name: "My Posts",   icon: "👤" },
    { id: "network",   name: "My Network", icon: "👥" },
    { id: "messages",  name: "Messages",   icon: "💬" },
    { id: "discover",  name: "Discover",   icon: "🔍" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Doctor Network 🩺</h1>
          <p className="text-indigo-100 text-base sm:text-lg">Connect, share knowledge, and collaborate with medical professionals</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex items-center space-x-2 p-2 min-w-max">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg" : "text-gray-700 hover:bg-gray-50"
                }`}>
                <span className="text-lg sm:text-xl">{tab.icon}</span>
                <span className="text-sm sm:text-base">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === "feed"      && <FeedTab />}
        {activeTab === "my-posts"  && <MyPostsTab />}
        {activeTab === "network"   && <PlaceholderTab title="My Network" icon="👥" />}
        {activeTab === "messages"  && <PlaceholderTab title="Messages"   icon="💬" />}
        {activeTab === "discover"  && <PlaceholderTab title="Discover"   icon="🔍" />}
      </main>
    </div>
  );
}

// ── Feed Tab ─────────────────────────────────────────────────────────────────
function FeedTab() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [filterRole, setFilterRole] = useState("");
  const [page, setPage] = useState(1);

  const userId   = typeof window !== "undefined" ? localStorage.getItem("userId")   : null;
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") : "You";

  const { data, isLoading } = useQuery({
    queryKey: ["network-feed", page, filterRole],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filterRole) params.append("author_role", filterRole);
      return get(`/api/v1/network/feed?${params}`);
    },
    staleTime: 60 * 1000,
  });

  const posts      = data?.posts       || [];
  const totalPages = data?.total_pages || 1;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["network-feed"] });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      {/* Main feed */}
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        {/* Create post */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {userName?.charAt(0)?.toUpperCase()}
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-left text-gray-500 font-medium transition-all text-sm sm:text-base">
              Share your medical insights...
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {[{ v: "", l: "All" }, { v: "DOCTOR", l: "Doctors" }, { v: "MR", l: "MRs" }].map((f) => (
            <button key={f.v} onClick={() => { setFilterRole(f.v); setPage(1); }}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${filterRole === f.v ? "bg-indigo-600 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"}`}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-200">
            <span className="text-5xl">📰</span>
            <p className="text-gray-500 mt-4 font-medium">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.post_id} post={post} currentUserId={userId} onDeleted={invalidate} />
            ))}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-indigo-400 disabled:opacity-40 transition-all text-sm">
                  ← Prev
                </button>
                <span className="text-gray-600 font-medium text-sm">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-indigo-400 disabled:opacity-40 transition-all text-sm">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right sidebar */}
      <RightSidebar />

      {/* Create post modal */}
      {showCreate && (
        <CreatePostModal
          userName={userName}
          onClose={() => setShowCreate(false)}
          onCreated={() => { invalidate(); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, currentUserId, onDeleted }) {
  const [showReactions, setShowReactions] = useState(false);

  const isOwn = post.author_id === currentUserId;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${post.author_role === "MR" ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-blue-500 to-cyan-500"} rounded-full flex items-center justify-center text-white font-bold`}>
            {post.author_name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{post.author_name}</h4>
            <p className="text-sm text-gray-600">
              {post.author_specialization || post.author_territory || post.author_role}
              {" · "}{timeAgo(post.created_at)}
            </p>
          </div>
        </div>
        {post.author_role && (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${post.author_role === "MR" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
            {post.author_role}
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>

      {/* Stats */}
      <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-3 text-sm text-gray-600">
        <span>👍 {post.likes_count || 0} likes</span>
        <span>{post.comments_count || 0} comments</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around">
        <div onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}
          className="relative flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
          <span className="text-xl">👍</span>
          <span className="font-semibold text-gray-700 text-sm">Like</span>
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-2xl p-3 flex space-x-2 border border-gray-200 z-10">
              {["👍","❤️","💡","👏","🎉","🤔"].map((emoji, i) => (
                <button key={i} className="text-2xl hover:scale-125 transition-transform">{emoji}</button>
              ))}
            </div>
          )}
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all">
          <span className="text-xl">💬</span>
          <span className="font-semibold text-gray-700 text-sm">Comment</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all">
          <span className="text-xl">🔄</span>
          <span className="font-semibold text-gray-700 text-sm">Share</span>
        </button>
      </div>
    </div>
  );
}

// ── Create Post Modal ─────────────────────────────────────────────────────────
function CreatePostModal({ userName, onClose, onCreated }) {
  const [content, setContent] = useState("");
  const [error, setError]     = useState("");

  const mutation = useMutation({
    mutationFn: () => post("/api/v1/network/feed", { content }),
    onSuccess: onCreated,
    onError: (err) => setError(err.message || "Failed to post"),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Create Post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {userName?.charAt(0)?.toUpperCase()}
          </div>
          <p className="font-semibold text-gray-800">{userName}</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm mb-4">{error}</div>}

        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Share your medical insights, case studies, or questions..."
          className="w-full h-36 sm:h-40 px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none resize-none mb-2 text-sm sm:text-base"
          maxLength={5000}
        />
        <p className="text-xs text-gray-400 text-right mb-4">{content.length}/5000</p>

        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm">
            Cancel
          </button>
          <button onClick={() => mutation.mutate()} disabled={!content.trim() || mutation.isPending}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 text-sm">
            {mutation.isPending ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── My Posts Tab ──────────────────────────────────────────────────────────────
function MyPostsTab() {
  const queryClient = useQueryClient();
  const userId   = typeof window !== "undefined" ? localStorage.getItem("userId")   : null;
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") : "";
  const userRole = typeof window !== "undefined" ? localStorage.getItem("userRole") : "";

  const { data, isLoading } = useQuery({
    queryKey: ["my-posts"],
    queryFn:  () => get("/api/v1/network/feed/me?limit=50"),
    staleTime: 60 * 1000,
  });

  const posts      = data?.posts || [];
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["my-posts"] });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      <div className="lg:col-span-2 space-y-4">
        {/* Profile summary */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
            {userName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{userName}</h3>
            <p className="text-sm text-gray-500 capitalize">{userRole}</p>
            <p className="text-xs text-gray-400 mt-0.5">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1,2].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-200">
            <span className="text-5xl">📝</span>
            <p className="text-gray-500 mt-4 font-medium">You haven't posted anything yet.</p>
          </div>
        ) : (
          posts.map((post) => (
            <MyPostCard key={post.post_id} post={post} onDeleted={invalidate} />
          ))
        )}
      </div>
      <RightSidebar />
    </div>
  );
}

function MyPostCard({ post, onDeleted }) {
  const deleteMutation = useMutation({
    mutationFn: () => del(`/api/v1/network/feed/${post.post_id}`),
    onSuccess: onDeleted,
  });

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
        <button onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(); }}
          disabled={deleteMutation.isPending}
          className="text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
          {deleteMutation.isPending ? "Deleting..." : "🗑 Delete"}
        </button>
      </div>
      <p className="text-gray-800 leading-relaxed mb-4">{post.content}</p>
      <div className="flex gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
        <span>👍 {post.likes_count || 0} likes</span>
        <span>💬 {post.comments_count || 0} comments</span>
      </div>
    </div>
  );
}

// ── Right Sidebar ─────────────────────────────────────────────────────────────
function RightSidebar() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Your Network Impact</h3>
        <div className="space-y-2 sm:space-y-3">
          {[
            { label: "Profile Views",    value: "—" },
            { label: "Post Impressions", value: "—" },
            { label: "Connections",      value: "—" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-indigo-100 text-sm">{s.label}</span>
              <span className="text-xl sm:text-2xl font-bold">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Trending Topics</h3>
        <div className="space-y-2 sm:space-y-3">
          {["#CardiovascularHealth","#DiabetesCare","#MedicalResearch","#PatientCare"].map((topic) => (
            <div key={topic} className="hover:bg-gray-50 p-2 sm:p-3 rounded-xl transition-all cursor-pointer">
              <p className="font-semibold text-indigo-600 text-sm">{topic}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Placeholder for other tabs ────────────────────────────────────────────────
function PlaceholderTab({ title, icon }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg text-center border border-gray-200">
      <span className="text-5xl">{icon}</span>
      <h2 className="text-2xl font-bold text-gray-800 mt-4">{title} — Coming Soon</h2>
      <p className="text-gray-500 mt-2 text-sm">This feature is under development.</p>
    </div>
  );
}
