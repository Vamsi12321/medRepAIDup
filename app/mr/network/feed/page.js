"use client";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { get, post as apiPost, del } from "@/lib/api";

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

export default function FeedPage() {
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
      return get(`/api/v1/network/posts?${params}`);
    },
    staleTime: 60000,
  });

  const posts      = data?.posts       || [];
  const totalPages = data?.total_pages || 1;
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["network-feed"] });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {userName?.charAt(0)?.toUpperCase()}
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-left text-gray-500 font-medium transition-all text-sm sm:text-base">
              Share product updates, insights...
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          {[{ v: "", l: "All" }, { v: "DOCTOR", l: "Doctors" }, { v: "MR", l: "MRs" }].map((f) => (
            <button key={f.v} onClick={() => { setFilterRole(f.v); setPage(1); }}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${filterRole === f.v ? "bg-orange-600 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}>
              {f.l}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
            <p className="text-gray-500 mt-4 font-medium">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <>
            {posts.map((p) => (
              <PostCard key={p.post_id} post={p} currentUserId={userId} onDeleted={invalidate} />
            ))}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4">
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
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Your Network Impact</h3>
          <div className="space-y-2 sm:space-y-3">
            {[{ label: "Profile Views", value: "---" }, { label: "Post Reach", value: "---" }, { label: "Connections", value: "---" }].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-orange-100 text-sm">{s.label}</span>
                <span className="text-xl sm:text-2xl font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Trending Topics</h3>
          <div className="space-y-2">
            {["#CardiovascularHealth", "#DiabetesCare", "#MedicalResearch", "#PatientCare"].map((topic) => (
              <div key={topic} className="hover:bg-gray-50 p-2 sm:p-3 rounded-xl cursor-pointer">
                <p className="font-semibold text-orange-600 text-sm">{topic}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showCreate && (
        <CreatePostModal userName={userName} onClose={() => setShowCreate(false)}
          onCreated={() => { invalidate(); setShowCreate(false); }} />
      )}
    </div>
  );
}

function PostCard({ post: postData, currentUserId }) {
  const [liked, setLiked]                 = useState(false);
  const [likesCount, setLikesCount]       = useState(postData.likes_count || 0);
  const [showComments, setShowComments]   = useState(false);
  const [commentsCount, setCommentsCount] = useState(postData.comments_count || 0);

  const likeMutation = useMutation({
    mutationFn: () => apiPost(`/api/v1/network/posts/${postData.post_id}/like`, {}),
    onSuccess: (res) => { setLiked(res.liked); setLikesCount(res.likes_count); },
  });

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${postData.author_role === "MR" ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-indigo-500 to-purple-500"}`}>
            {postData.author_name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{postData.author_name}</h4>
            <p className="text-sm text-gray-600">{postData.author_specialization || postData.author_territory || postData.author_role} - {timeAgo(postData.created_at)}</p>
          </div>
        </div>
        {postData.author_role && (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${postData.author_role === "MR" ? "bg-orange-100 text-orange-700" : "bg-indigo-100 text-indigo-700"}`}>
            {postData.author_role}
          </span>
        )}
      </div>
      <p className="text-gray-800 mb-4 leading-relaxed">{postData.content}</p>
      <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-3 text-sm text-gray-600">
        <span>{likesCount} likes</span>
        <span>{commentsCount} comments</span>
      </div>
      <div className="flex items-center justify-around mb-2">
        <button onClick={() => likeMutation.mutate()}
          className={`flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all ${liked ? "text-orange-600" : "text-gray-700"}`}>
          <span className="font-semibold text-sm">{liked ? "Liked" : "Like"}</span>
        </button>
        <button onClick={() => setShowComments((s) => !s)}
          className={`flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all ${showComments ? "text-orange-600" : "text-gray-700"}`}>
          <span className="font-semibold text-sm">Comment</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all text-gray-700">
          <span className="font-semibold text-sm">Share</span>
        </button>
      </div>
      {showComments && (
        <CommentsSection postId={postData.post_id} currentUserId={currentUserId} onCountChange={setCommentsCount} />
      )}
    </div>
  );
}

function CommentsSection({ postId, currentUserId, onCountChange }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => get(`/api/v1/network/posts/${postId}/comments?limit=50&sort=asc`),
    staleTime: 30000,
  });
  const comments = data?.comments || [];
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    if (data?.total !== undefined) onCountChange(data.total);
  };
  const addMutation = useMutation({
    mutationFn: () => apiPost(`/api/v1/network/posts/${postId}/comments`, { content: newComment }),
    onSuccess: () => { setNewComment(""); invalidate(); },
  });
  const deleteMutation = useMutation({
    mutationFn: (commentId) => del(`/api/v1/network/posts/${postId}/comments/${commentId}`),
    onSuccess: invalidate,
  });
  return (
    <div className="mt-3 pt-3 border-t border-orange-100">
      {isLoading ? (
        <div className="text-xs text-gray-400 py-2">Loading comments...</div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.comment_id} className="bg-orange-50 rounded-xl px-3 py-2 flex items-start gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {c.author_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">{c.author_name}</span>
                  <span className="text-xs text-gray-400">{c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</span>
                </div>
                <p className="text-xs text-gray-700 mt-0.5">{c.content}</p>
              </div>
              {c.author_id === currentUserId && (
                <button onClick={() => deleteMutation.mutate(c.comment_id)}
                  className="text-gray-300 hover:text-red-400 text-xs flex-shrink-0 transition-colors">x</button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && newComment.trim() && addMutation.mutate()}
          placeholder="Write a comment..." maxLength={1000}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-200" />
        <button onClick={() => addMutation.mutate()} disabled={!newComment.trim() || addMutation.isPending}
          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50">
          {addMutation.isPending ? "..." : "Post"}
        </button>
      </div>
    </div>
  );
}

function CreatePostModal({ userName, onClose, onCreated }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: () => apiPost("/api/v1/network/posts", { content }),
    onSuccess: onCreated,
    onError: (err) => setError(err.message || "Failed to post"),
  });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Create Post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
            {userName?.charAt(0)?.toUpperCase()}
          </div>
          <p className="font-semibold text-gray-800">{userName}</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm mb-4">{error}</div>}
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Share product updates, market insights, or connect with healthcare professionals..."
          className="w-full h-36 sm:h-40 px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:outline-none resize-none mb-2 text-sm sm:text-base"
          maxLength={5000} />
        <p className="text-xs text-gray-400 text-right mb-4">{content.length}/5000</p>
        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={!content.trim() || mutation.isPending}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 text-sm">
            {mutation.isPending ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}