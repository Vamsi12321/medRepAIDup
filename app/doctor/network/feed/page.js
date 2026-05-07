"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { get, post as apiPost, del } from "@/lib/api";
import { Icons } from "@/components/network/Icons";
import { timeAgoIST as timeAgo } from "@/lib/time";

// Static accent classes — no dynamic interpolation
const ACCENT = {
  indigo: {
    btn:        "bg-indigo-600 hover:bg-indigo-700 text-white",
    ring:       "focus:ring-indigo-200",
    border:     "border-indigo-300",
    bg:         "bg-indigo-50",
    text:       "text-indigo-600",
    commentBg:  "bg-indigo-50",
    borderTop:  "border-indigo-100",
    checkBg:    "bg-indigo-600 border-indigo-600",
    selectedBg: "border-indigo-300 bg-indigo-50",
  },
  orange: {
    btn:        "bg-orange-600 hover:bg-orange-700 text-white",
    ring:       "focus:ring-orange-200",
    border:     "border-orange-300",
    bg:         "bg-orange-50",
    text:       "text-orange-600",
    commentBg:  "bg-orange-50",
    borderTop:  "border-orange-100",
    checkBg:    "bg-orange-600 border-orange-600",
    selectedBg: "border-orange-300 bg-orange-50",
  },
};

export default function FeedPage() {
  const queryClient  = useQueryClient();
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
      return get("/api/v1/network/posts?" + params);
    },
    staleTime: 60000,
  });

  const posts      = data?.posts       || [];
  const totalPages = data?.total_pages || 1;
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["network-feed"] });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main feed */}
      <div className="lg:col-span-2 space-y-3">

        {/* Create post bar */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {userName?.charAt(0)?.toUpperCase()}
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex-1 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-left text-gray-400 text-sm transition-all">
              Share insights, updates...
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all">
              Post
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5">
          {[{ v: "", l: "All Posts" }, { v: "DOCTOR", l: "Doctors" }, { v: "MR", l: "MRs" }].map((f) => (
            <button key={f.v} onClick={() => { setFilterRole(f.v); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterRole === f.v
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-300"
              }`}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
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
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <span className="text-4xl">📝</span>
            <p className="text-gray-400 mt-3 text-sm font-medium">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <>
            {posts.map((p) => (
              <PostCard key={p.post_id} post={p} currentUserId={userId}
                accentColor="indigo" highlight={highlightPostId === p.post_id} />
            ))}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-semibold text-gray-600 hover:border-indigo-400 disabled:opacity-40 transition-all text-xs">
                  ← Prev
                </button>
                <span className="text-gray-500 text-xs font-medium">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-semibold text-gray-600 hover:border-indigo-400 disabled:opacity-40 transition-all text-xs">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-3">
        {/* Trending topics */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Trending Topics</p>
          <div className="space-y-1">
            {["#CardiovascularHealth", "#DiabetesCare", "#MedicalResearch", "#PatientCare", "#Oncology"].map((topic) => (
              <div key={topic} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                <p className="text-xs font-semibold text-indigo-600">{topic}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick tips */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <p className="text-xs font-bold text-indigo-700 mb-2">💡 Network Tips</p>
          <ul className="space-y-1.5 text-xs text-indigo-600">
            <li className="flex items-start gap-1.5"><span className="mt-0.5">•</span>Share clinical insights to grow your reach</li>
            <li className="flex items-start gap-1.5"><span className="mt-0.5">•</span>Connect with specialists in your field</li>
            <li className="flex items-start gap-1.5"><span className="mt-0.5">•</span>Join groups to discuss specific topics</li>
          </ul>
        </div>
      </div>

      {showCreate && (
        <CreatePostModal userName={userName} accentColor="indigo"
          onClose={() => setShowCreate(false)}
          onCreated={() => { invalidate(); setShowCreate(false); }} />
      )}
    </div>
  );
}

export function PostCard({ post: postData, currentUserId, accentColor = "indigo", highlight = false }) {
  const [liked, setLiked]               = useState(false);
  const [likesCount, setLikesCount]     = useState(postData.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(postData.comments_count || 0);
  const [showShare, setShowShare]       = useState(false);
  const a = ACCENT[accentColor] || ACCENT.indigo;
  const cardRef = useRef(null);

  useEffect(() => {
    if (highlight && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlight]);

  const likeMutation = useMutation({
    mutationFn: () => apiPost("/api/v1/network/posts/" + postData.post_id + "/like", {}),
    onSuccess: (res) => { setLiked(res.liked); setLikesCount(res.likes_count); },
  });

  const isMR = postData.author_role === "MR";

  return (
    <div ref={cardRef}
      className={"bg-white rounded-xl shadow-sm border transition-all " + (highlight ? "border-indigo-400 ring-2 ring-indigo-100" : "border-gray-200")}>
      <div className="p-4">
        {/* Author row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={"w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 " + (isMR ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-indigo-500 to-purple-500")}>
              {postData.author_name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{postData.author_name}</p>
              <p className="text-xs text-gray-400">
                {postData.author_specialization || postData.author_territory || postData.author_role}
                {" · "}{timeAgo(postData.created_at)}
              </p>
            </div>
          </div>
          <span className={"px-2 py-0.5 rounded-md text-xs font-bold " + (isMR ? "bg-orange-100 text-orange-700" : "bg-indigo-100 text-indigo-700")}>
            {postData.author_role}
          </span>
        </div>

        {/* Content */}
        <p className="text-gray-800 text-sm leading-relaxed mb-3">{postData.content}</p>

        {/* Stats row */}
        <div className="flex items-center justify-between py-2 border-t border-b border-gray-100 mb-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Icons.likedFill /> {likesCount} likes</span>
          <span className="flex items-center gap-1"><Icons.comment /> {commentsCount} comments</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-around">
          <button onClick={() => likeMutation.mutate()}
            className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold " + (liked ? a.text + " " + a.bg : "text-gray-500 hover:bg-gray-50")}>
            {liked ? <Icons.likedFill /> : <Icons.like />} {liked ? "Liked" : "Like"}
          </button>
          <button onClick={() => setShowComments((s) => !s)}
            className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold " + (showComments ? a.text + " " + a.bg : "text-gray-500 hover:bg-gray-50")}>
            <Icons.comment /> Comment
          </button>
          <button onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold text-gray-500 hover:bg-gray-50">
            <Icons.share /> Share
          </button>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          <CommentsSection postId={postData.post_id} currentUserId={currentUserId}
            accentColor={accentColor} onCountChange={setCommentsCount} />
        </div>
      )}
      {showShare && (
        <SharePostModal post={postData} accentColor={accentColor} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

export function CommentsSection({ postId, currentUserId, accentColor = "indigo", onCountChange }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const a = ACCENT[accentColor] || ACCENT.indigo;

  const { data, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => get("/api/v1/network/posts/" + postId + "/comments?limit=50&sort=asc"),
    staleTime: 30000,
  });
  const comments = data?.comments || [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    if (data?.total !== undefined) onCountChange(data.total);
  };

  const addMutation = useMutation({
    mutationFn: () => apiPost("/api/v1/network/posts/" + postId + "/comments", { content: newComment }),
    onSuccess: () => { setNewComment(""); invalidate(); },
  });
  const deleteMutation = useMutation({
    mutationFn: (cid) => del("/api/v1/network/posts/" + postId + "/comments/" + cid),
    onSuccess: invalidate,
  });

  return (
    <div>
      {isLoading ? (
        <p className="text-xs text-gray-400 py-2">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-400 py-1 mb-2">No comments yet.</p>
      ) : (
        <div className="space-y-2 mb-3 max-h-52 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.comment_id} className={"rounded-xl px-3 py-2 flex items-start gap-2 " + a.commentBg}>
              <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {c.author_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-gray-800">{c.author_name}</span>
                <span className="text-xs text-gray-400 ml-1.5">{timeAgo(c.created_at)}</span>
                <p className="text-xs text-gray-700 mt-0.5">{c.content}</p>
              </div>
              {c.author_id === currentUserId && (
                <button onClick={() => deleteMutation.mutate(c.comment_id)}
                  className="text-gray-300 hover:text-red-400 flex-shrink-0 transition-colors">
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
          className={"flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 " + a.ring} />
        <button onClick={() => addMutation.mutate()} disabled={!newComment.trim() || addMutation.isPending}
          className={"px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 " + a.btn}>
          <Icons.send /> {addMutation.isPending ? "..." : "Post"}
        </button>
      </div>
    </div>
  );
}

export function CreatePostModal({ userName, accentColor = "indigo", onClose, onCreated }) {
  const [content, setContent] = useState("");
  const [error, setError]     = useState("");
  const a = ACCENT[accentColor] || ACCENT.indigo;

  const mutation = useMutation({
    mutationFn: () => apiPost("/api/v1/network/posts", { content }),
    onSuccess: onCreated,
    onError: (err) => setError(err.message || "Failed to post"),
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-5 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Create Post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icons.close /></button>
        </div>
        <div className="flex items-center gap-2.5 mb-3">
          <div className={"w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm"}>
            {userName?.charAt(0)?.toUpperCase()}
          </div>
          <p className="font-semibold text-gray-800 text-sm">{userName}</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs mb-3">{error}</div>}
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Share insights, ask questions, or connect with healthcare professionals..."
          className={"w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl outline-none resize-none mb-1 text-sm focus:border-indigo-400"}
          maxLength={5000} />
        <p className="text-xs text-gray-400 text-right mb-4">{content.length}/5000</p>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm">
            Cancel
          </button>
          <button onClick={() => mutation.mutate()} disabled={!content.trim() || mutation.isPending}
            className={"flex-1 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 text-sm " + a.btn}>
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
  const a = ACCENT[accentColor] || ACCENT.indigo;

  const { data: connData, isLoading } = useQuery({
    queryKey: ["my-connections"],
    queryFn: () => get("/api/v1/network/connections?limit=50"),
    staleTime: 30000,
  });
  const connections = connData?.connections || [];

  const toggle = (uid) => setSelected((prev) =>
    prev.includes(uid) ? prev.filter((id) => id !== uid) : prev.length < 10 ? [...prev, uid] : prev
  );

  const shareMutation = useMutation({
    mutationFn: () => apiPost("/api/v1/network/posts/" + post.post_id + "/share", {
      user_ids: selected,
      message: message.trim() || undefined,
    }),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Icons.share /> Share Post
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icons.close /></button>
        </div>

        {result ? (
          <div className="p-5 text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Icons.check />
            </div>
            <p className="font-bold text-gray-900 text-sm">{result.message}</p>
            <p className="text-xs text-gray-500">Shared to {result.shared_to} user{result.shared_to !== 1 ? "s" : ""}</p>
            <button onClick={onClose} className={"w-full py-2.5 rounded-xl font-bold text-sm transition-all " + a.btn}>Done</button>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-700">{post.author_name}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{post.content}</p>
              </div>
            </div>
            <div className="px-4 pt-3 flex-shrink-0">
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message (optional)..." maxLength={500} rows={2}
                className={"w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 resize-none " + a.ring} />
            </div>
            <div className="px-4 py-2 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-500">Select recipients ({selected.length}/10)</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-2 min-h-0">
              {isLoading ? (
                <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : connections.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No connections yet.</p>
              ) : connections.map((c) => {
                const isSel = selected.includes(c.user_id);
                return (
                  <button key={c.user_id} onClick={() => toggle(c.user_id)}
                    className={"w-full flex items-center gap-2.5 p-2.5 rounded-xl mb-1 transition-all border " + (isSel ? a.selectedBg : "border-transparent hover:bg-gray-50")}>
                    <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 " + (c.role === "MR" ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-indigo-500 to-purple-500")}>
                      {c.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.specialization || c.role}</p>
                    </div>
                    <div className={"w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 " + (isSel ? a.checkBg : "border-gray-300")}>
                      {isSel && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => shareMutation.mutate()} disabled={selected.length === 0 || shareMutation.isPending}
                className={"w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 " + a.btn}>
                <Icons.share />
                {shareMutation.isPending ? "Sharing..." : "Share with " + (selected.length || "...") + (selected.length === 1 ? " person" : " people")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
