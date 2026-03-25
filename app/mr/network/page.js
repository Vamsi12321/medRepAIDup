"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";

export default function MRNetwork() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("feed");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState("text");
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      avatar: "SJ",
      time: "2 hours ago",
      content: "Just attended an amazing conference on the latest advances in cardiovascular interventions. The new minimally invasive techniques are truly revolutionary! 🏥",
      likes: 45,
      comments: 12,
      shares: 8,
      type: "text",
      reactions: { like: 30, love: 10, insightful: 5 }
    },
    {
      id: 2,
      author: "Rajesh Kumar (MR)",
      specialty: "Medical Representative",
      avatar: "RK",
      time: "4 hours ago",
      content: "Excited to share information about our new CardioSafe launch. The clinical trial results show significant improvement in patient outcomes. Happy to discuss with interested healthcare professionals.",
      likes: 32,
      comments: 8,
      shares: 5,
      type: "product-info",
      reactions: { like: 20, love: 8, insightful: 4 }
    },
    {
      id: 3,
      author: "Dr. Michael Chen",
      specialty: "Neurology",
      avatar: "MC",
      time: "5 hours ago",
      content: "Interesting case study: Patient with rare neurological condition responded exceptionally well to new treatment protocol.",
      likes: 67,
      comments: 23,
      shares: 15,
      type: "case-study",
      reactions: { like: 40, love: 15, insightful: 12 }
    },
  ]);

  const tabs = [
    { id: "feed", name: "Feed", icon: "📰" },
    { id: "colleagues", name: "My Network", icon: "👥" },
    { id: "messages", name: "Messages", icon: "💬", badge: 3 },
    { id: "doctors", name: "Doctors", icon: "👨‍⚕️" },
    { id: "mrs", name: "MRs", icon: "💼" },
  ];

  // Show loading animation for 2 seconds on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleCreatePost = () => {
    if (postContent.trim()) {
      const newPost = {
        id: posts.length + 1,
        author: "Rajesh Kumar (MR)",
        specialty: "Medical Representative",
        avatar: "RK",
        time: "Just now",
        content: postContent,
        likes: 0,
        comments: 0,
        shares: 0,
        type: postType,
        reactions: { like: 0, love: 0, insightful: 0 }
      };
      setPosts([newPost, ...posts]);
      setPostContent("");
      setShowCreatePost(false);
    }
  };

  return (
    <>
      {/* Loading Animation */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            {/* MR Logo Animation */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse mx-auto">
                <span className="text-6xl font-bold text-white">MR</span>
              </div>
              {/* Rotating Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              </div>
            </div>
            
            {/* Loading Text */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">MR Network</h2>
            <p className="text-gray-600">Loading your professional network...</p>
            
            {/* Loading Dots */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <MRNavbar />
        
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-10">
          <Breadcrumb />
          
          {/* Header */}
          <div className="mb-6 sm:mb-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">MR Network 💼</h1>
            <p className="text-orange-100 text-base sm:text-lg">Connect with healthcare professionals and fellow MRs worldwide</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 sm:mb-8 overflow-x-auto">
            <div className="flex items-center space-x-2 p-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-orange-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg sm:text-xl">{tab.icon}</span>
                  <span className="text-sm sm:text-base">{tab.name}</span>
                  {tab.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "feed" && <FeedTab posts={posts} showCreatePost={showCreatePost} setShowCreatePost={setShowCreatePost} postContent={postContent} setPostContent={setPostContent} postType={postType} setPostType={setPostType} handleCreatePost={handleCreatePost} />}
          {activeTab === "colleagues" && <ColleaguesTab />}
          {activeTab === "messages" && <MessagesTab />}
          {activeTab === "doctors" && <DoctorsTab />}
          {activeTab === "mrs" && <MRsTab />}
        </main>
      </div>
    </>
  );
}

// Feed Tab with Create Post Modal
function FeedTab({ posts, showCreatePost, setShowCreatePost, postContent, setPostContent, postType, setPostType, handleCreatePost }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        {/* Create Post Button */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
              RK
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-left text-gray-500 font-medium transition-all"
            >
              Share product updates, insights, Rajesh...
            </button>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Create Post</h3>
                <button onClick={() => setShowCreatePost(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Post Type Selection */}
              <div className="flex space-x-2 mb-4">
                {[
                  { id: "text", label: "Text Post", icon: "📝" },
                  { id: "product-info", label: "Product Info", icon: "💊" },
                  { id: "market-update", label: "Market Update", icon: "📊" },
                  { id: "question", label: "Question", icon: "❓" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPostType(type.id)}
                    className={`flex-1 px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all ${
                      postType === type.id
                        ? "bg-orange-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span className="mr-2">{type.icon}</span>
                    <span className="text-xs sm:text-sm">{type.label}</span>
                  </button>
                ))}
              </div>

              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share product updates, market insights, or connect with healthcare professionals..."
                className="w-full h-32 sm:h-40 px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:outline-none resize-none mb-4"
              />

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2.5 sm:py-3 rounded-xl font-bold transition-all shadow-lg"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
}

// Post Card Component
function PostCard({ post }) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${post.author.includes('MR') ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'} rounded-full flex items-center justify-center text-white font-bold`}>
            {post.avatar}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{post.author}</h4>
            <p className="text-sm text-gray-600">{post.specialty} • {post.time}</p>
          </div>
        </div>
        {post.type !== "text" && (
          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
            post.type === "product-info" ? "bg-orange-100 text-orange-700" :
            post.type === "case-study" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
          }`}>
            {post.type === "product-info" ? "💊 Product Info" : 
             post.type === "case-study" ? "📋 Case Study" : "📊 Market Update"}
          </span>
        )}
      </div>

      {/* Post Content */}
      <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>

      {/* Reactions Summary */}
      <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-1">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">👍</span>
            <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs">❤️</span>
            <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs">💡</span>
          </div>
          <span className="text-sm text-gray-600 font-semibold">{post.likes}</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{post.comments} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-around">
        <button
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
          className="relative flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all"
        >
          <span className="text-xl">👍</span>
          <span className="font-semibold text-gray-700">React</span>
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-2xl p-3 flex space-x-2 border border-gray-200">
              {["👍", "❤️", "💡", "👏", "🎉", "🤔"].map((emoji, i) => (
                <button key={i} className="text-2xl hover:scale-125 transition-transform">
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all">
          <span className="text-xl">💬</span>
          <span className="font-semibold text-gray-700">Comment</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all">
          <span className="text-xl">🔄</span>
          <span className="font-semibold text-gray-700">Share</span>
        </button>
      </div>
    </div>
  );
}

// Right Sidebar
function RightSidebar() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Quick Stats */}
      <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Your Network Impact</h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-orange-100 text-sm">Profile Views</span>
            <span className="text-xl sm:text-2xl font-bold">856</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-orange-100 text-sm">Post Reach</span>
            <span className="text-xl sm:text-2xl font-bold">3,240</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-orange-100 text-sm">Connections</span>
            <span className="text-xl sm:text-2xl font-bold">128</span>
          </div>
        </div>
      </div>

      {/* Suggested Connections */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Suggested Connections</h3>
        <div className="space-y-3 sm:space-y-4">
          {[
            { name: "Dr. Robert Wilson", specialty: "Oncology", mutual: 12, type: "doctor" },
            { name: "Priya Sharma", specialty: "MR - Cardiology", mutual: 8, type: "mr" },
            { name: "Dr. James Taylor", specialty: "Surgery", mutual: 15, type: "doctor" },
          ].map((person, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${person.type === 'mr' ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'} rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm`}>
                  {person.name.split(' ')[0][0]}{person.name.split(' ')[1][0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">{person.name}</p>
                  <p className="text-xs text-gray-600">{person.specialty}</p>
                  <p className="text-xs text-gray-500">{person.mutual} mutual</p>
                </div>
              </div>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Placeholder components for other tabs
function ColleaguesTab() {
  return <div className="bg-white rounded-2xl p-8 shadow-lg text-center"><h2 className="text-2xl font-bold text-gray-800">My Network - Coming Soon</h2></div>;
}

function MessagesTab() {
  return <div className="bg-white rounded-2xl p-8 shadow-lg text-center"><h2 className="text-2xl font-bold text-gray-800">Messages - Coming Soon</h2></div>;
}

function DoctorsTab() {
  return <div className="bg-white rounded-2xl p-8 shadow-lg text-center"><h2 className="text-2xl font-bold text-gray-800">Doctors Network - Coming Soon</h2></div>;
}

function MRsTab() {
  return <div className="bg-white rounded-2xl p-8 shadow-lg text-center"><h2 className="text-2xl font-bold text-gray-800">MR Network - Coming Soon</h2></div>;
}
