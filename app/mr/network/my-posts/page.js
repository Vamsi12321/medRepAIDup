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

export default function MyPostsPage() {
  const queryClient = useQueryClient();
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") : "";
  const userRole = typeof window !== "undefined" ? localStorage.getItem("userRole") : "";
  const userId   = typeof window !== "undefined" ? localStorage.getItem("userId")   : null;

  const { data, isLoading } = useQuery({
    queryKey: ["my-posts"],
    queryFn: () => get("/api/v1/network/posts/me?limit=50"),
    staleTime: 60000,
  });

  const posts      = data?.posts || [];
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["my-posts"] });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
            {userName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{userName}</h3>
            <p className="text-sm text-gray-500 capitalize">{userRole}</p>
            <p className="text-xs text-gray-400 mt-0.5">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-200">
            <p className="text-gray-500 mt-4 font-medium">You have not posted anything yet.</p>
          </div>
        ) : (
          posts.map((p) => <MyPostCard key={p.post_id} post={p} currentUserId={userId} onDeleted={invalidate} />)
        )}
      </div>
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
          <h3 className="text-base sm:text-lg font-bold mb-3">Your Network Impact</h3>
          <div className="space-y-2">
            {[{ label: "Profile Views", value: "---" }, { label: "Post Reach", value: "---" }].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-orange-100 text-sm">{s.label}</span>
                <span className="text-xl font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MyPostCard({ post, currentUserId, onDeleted }) {
  const queryClient = useQueryClient();
  const [showComments, setShowComments]   = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);

  const deleteMutation = useMutation({
    mutationFn: () => del(`/api/v1/network/posts/${post.post_id}`),
    onSuccess: onDeleted,
  });

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
        <button onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(); }}
          disabled={deleteMutation.isPending}
          className="text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
          {deleteMutation.isPending ? "Deleting..." : "Delete"}
        </button>
      </div>
      <p className="text-gray-800 leading-relaxed mb-4">{post.content}</p>
      <div className="flex gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3 mb-2">
        <span>{post.likes_count || 0} likes</span>
        <button onClick={() => setShowComments((s) => !s)}
          className={`font-semibold transition-colors ${showComments ? "text-orange-600" : "hover:text-orange-500"}`}>
          {commentsCount} comments
        </button>
      </div>
      {showComments && (
        <CommentsSection postId={post.post_id} currentUserId={currentUserId} onCountChange={setCommentsCount} />
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
      {isLoading ? <div className="text-xs text-gray-400 py-2">Loading comments...</div>
      : comments.length === 0 ? <p className="text-xs text-gray-400 py-2">No comments yet. Be the first!</p>
      : (
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