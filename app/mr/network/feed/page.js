"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { get, post as apiPost, del } from "@/lib/api";
import { Icons } from "@/components/network/Icons";
import { timeAgoIST as timeAgo, formatIST } from "@/lib/time";


export default function FeedPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const highlightPostId = searchParams?.get("post") || null;
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
              Share insights...
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
                  <div className="space-y-2 flex-1"><div className="h-3.5 bg-gray-200 rounded w-1/3" /><div className="h-2.5 bg-gray-100 rounded w-1/4" /></div>
                </div>
                <div className="space-y-2"><div className="h-3 bg-gray-200 rounded w-full" /><div className="h-3 bg-gray-200 rounded w-4/5" /></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-200">
            <p className="text-gray-500 mt-4 font-medium">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <>
            {posts.map((p) => <PostCard key={p.post_id} post={p} currentUserId={userId} accentColor="orange" highlight={highlightPostId === p.post_id} />)}
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
        <CreatePostModal userName={userName} accentColor="orange" onClose={() => setShowCreate(false)}
          onCreated={() => { invalidate(); setShowCreate(false); }} />
      )}
    </div>
  );
}

export function PostCard({ post: postData, currentUserId, accentColor = "orange", highlight = false }) {
  const [liked, setLiked]                 = useState(false);
  const [likesCount, setLikesCount]       = useState(postData.likes_count || 0);
  const [showComments, setShowComments]   = useState(false);
  const [commentsCount, setCommentsCount] = useState(postData.comments_count || 0);
  const [showShare, setShowShare]         = useState(false);
  const accent = accentColor;
  const cardRef = useRef(null);

  useEffect(() => {
    if (highlight && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlight]);

  const likeMutation = useMutation({
    mutationFn: () => apiPost(`/api/v1/network/posts/${postData.post_id}/like`, {}),
    onSuccess: (res) => { setLiked(res.liked); setLikesCount(res.likes_count); },
  });

  return (
    <div ref={cardRef} className={`bg-white rounded-2xl p-4 sm:p-6 shadow-lg border transition-all ${highlight ? "border-orange-400 ring-2 ring-orange-200" : "border-gray-200"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${postData.author_role === "MR" ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-indigo-500 to-purple-500"}`}>
            {postData.author_name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{postData.author_name}</h4>
            <p className="text-sm text-gray-500">{postData.author_specialization || postData.author_territory || postData.author_role} &middot; {timeAgo(postData.created_at)}</p>
          </div>
        </div>
        {postData.author_role && (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${postData.author_role === "MR" ? "bg-orange-100 text-orange-700" : "bg-indigo-100 text-indigo-700"}`}>
            {postData.author_role}
          </span>
        )}
      </div>
      <p className="text-gray-800 mb-4 leading-relaxed">{postData.content}</p>
      <div className="flex items-center justify-between py-2.5 border-t border-b border-gray-100 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Icons.likedFill />{likesCount} likes</span>
        <span className="flex items-center gap-1"><Icons.comment />{commentsCount} comments</span>
      </div>
      <div className="flex items-center justify-around mb-2">
        <button onClick={() => likeMutation.mutate()}
          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all font-semibold text-sm ${liked ? `text-${accent}-600` : "text-gray-600"}`}>
          {liked ? <Icons.likedFill /> : <Icons.like />} {liked ? "Liked" : "Like"}
        </button>
        <button onClick={() => setShowComments((s) => !s)}
          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all font-semibold text-sm ${showComments ? `text-${accent}-600` : "text-gray-600"}`}>
          <Icons.comment /> Comment
        </button>
        <button onClick={() => setShowShare(true)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all font-semibold text-sm text-gray-600">
          <Icons.share /> Share
        </button>
      </div>
      {showComments && (
        <CommentsSection postId={postData.post_id} currentUserId={currentUserId} accentColor={accent} onCountChange={setCommentsCount} />
      )}
      {showShare && (
        <SharePostModal post={postData} accentColor={accent} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

export function CommentsSection({ postId, currentUserId, accentColor = "orange", onCountChange }) {
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
  const accent = accentColor;
  return (
    <div className={`mt-3 pt-3 border-t border-${accent}-100`}>
      {isLoading ? <div className="text-xs text-gray-400 py-2">Loading comments...</div>
      : comments.length === 0 ? <p className="text-xs text-gray-400 py-2">No comments yet. Be the first!</p>
      : (
        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.comment_id} className={`bg-${accent}-50 rounded-xl px-3 py-2 flex items-start gap-2`}>
              <div className="w-7 h-7 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {c.author_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">{c.author_name}</span>
                  <span className="text-xs text-gray-400">{c.created_at ? formatIST(c.created_at, { day: "2-digit", month: "short", year: "numeric" }) : ""}</span>
                </div>
                <p className="text-xs text-gray-700 mt-0.5">{c.content}</p>
              </div>
              {c.author_id === currentUserId && (
                <button onClick={() => deleteMutation.mutate(c.comment_id)} className="text-gray-300 hover:text-red-400 flex-shrink-0 transition-colors">
                  <Icons.close />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && newComment.trim() && addMutation.mutate()}
          placeholder="Write a comment..." maxLength={1000}
          className={`flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-${accent}-200`} />
        <button onClick={() => addMutation.mutate()} disabled={!newComment.trim() || addMutation.isPending}
          className={`bg-${accent}-600 hover:bg-${accent}-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1`}>
          <Icons.send /> {addMutation.isPending ? "..." : "Post"}
        </button>
      </div>
    </div>
  );
}

export function CreatePostModal({ userName, accentColor = "orange", onClose, onCreated }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const accent = accentColor;
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icons.close /></button>
        </div>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br from-${accent}-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold`}>
            {userName?.charAt(0)?.toUpperCase()}
          </div>
          <p className="font-semibold text-gray-800">{userName}</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm mb-4">{error}</div>}
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Share insights, ask questions, or connect with healthcare professionals..."
          className={`w-full h-36 sm:h-40 px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl focus:border-${accent}-500 focus:outline-none resize-none mb-2 text-sm sm:text-base`}
          maxLength={5000} />
        <p className="text-xs text-gray-400 text-right mb-4">{content.length}/5000</p>
        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={!content.trim() || mutation.isPending}
            className={`flex-1 bg-${accent}-600 hover:bg-${accent}-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 text-sm`}>
            {mutation.isPending ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}



export function SharePostModal({ post, onClose, accentColor = "indigo" }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState([]);
  const [message, setMessage]   = useState("");
  const [result, setResult]     = useState(null);
  const accent = accentColor;

  const { data: connData, isLoading } = useQuery({
    queryKey: ["my-connections"],
    queryFn: () => get("/api/v1/network/connections?limit=50"),
    staleTime: 30000,
  });

  const connections = connData?.connections || [];

  const toggle = (uid) => {
    setSelected((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : prev.length < 10 ? [...prev, uid] : prev
    );
  };

  const shareMutation = useMutation({
    mutationFn: () => apiPost(`/api/v1/network/posts/${post.post_id}/share`, {
      user_ids: selected,
      message: message.trim() || undefined,
    }),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Icons.share /> Share Post
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icons.close /></button>
        </div>

        {result ? (
          /* Success state */
          <div className="p-6 text-center space-y-3">
            <div className={`w-14 h-14 bg-${accent}-100 rounded-full flex items-center justify-center mx-auto`}>
              <Icons.check />
            </div>
            <p className="font-bold text-gray-900">{result.message}</p>
            <p className="text-sm text-gray-500">Shared to {result.shared_to} user{result.shared_to !== 1 ? "s" : ""}</p>
            {result.failed?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-left">
                <p className="text-xs font-semibold text-yellow-700 mb-1">Could not share to:</p>
                {result.failed.map((f) => (
                  <p key={f.user_id} className="text-xs text-yellow-600">{f.user_id} — {f.reason}</p>
                ))}
              </div>
            )}
            <button onClick={onClose} className={`w-full bg-${accent}-600 hover:bg-${accent}-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all`}>Done</button>
          </div>
        ) : (
          <>
            {/* Post preview */}
            <div className="p-4 border-b border-gray-100 flex-shrink-0">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-700">{post.author_name}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span>{post.likes_count || 0} likes</span>
                  <span>{post.comments_count || 0} comments</span>
                </div>
              </div>
            </div>

            {/* Optional message */}
            <div className="px-4 pt-3 flex-shrink-0">
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message (optional)..." maxLength={500}
                rows={2}
                className={`w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-${accent}-200 resize-none`} />
              <p className="text-xs text-gray-400 text-right">{message.length}/500</p>
            </div>

            {/* Connections list */}
            <div className="px-4 pb-2 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Select recipients ({selected.length}/10)
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-2 min-h-0">
              {isLoading ? (
                <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : connections.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No connections to share with.</p>
              ) : connections.map((c) => {
                const isSelected = selected.includes(c.user_id);
                return (
                  <button key={c.user_id} onClick={() => toggle(c.user_id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1.5 transition-all border ${
                      isSelected ? `border-${accent}-300 bg-${accent}-50` : "border-transparent hover:bg-gray-50"
                    }`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${c.role === "MR" ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-indigo-500 to-purple-500"}`}>
                      {c.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.specialization || c.territory || c.role}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected ? `bg-${accent}-600 border-${accent}-600` : "border-gray-300"
                    }`}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Send button */}
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => shareMutation.mutate()} disabled={selected.length === 0 || shareMutation.isPending}
                className={`w-full flex items-center justify-center gap-2 bg-${accent}-600 hover:bg-${accent}-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50`}>
                <Icons.share />
                {shareMutation.isPending ? "Sharing..." : `Share with ${selected.length || ""} ${selected.length === 1 ? "person" : selected.length > 1 ? "people" : "..."}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
