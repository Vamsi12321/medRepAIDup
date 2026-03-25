"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";

export default function DoctorNetwork() {
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
    { id: "requests", name: "Requests", icon: "📬", badge: 5 },
    { id: "discover", name: "Discover", icon: "🔍" },
    { id: "mr-network", name: "MR Network", icon: "💼" },
    { id: "groups", name: "Groups", icon: "👨‍⚕️" },
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
        author: "Dr. Sharma",
        specialty: "Cardiology",
        avatar: "DS",
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
      {/* Loading Animation - Facebook Style */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            {/* DN Logo Animation */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse mx-auto">
                <span className="text-6xl font-bold text-white">DN</span>
              </div>
              {/* Rotating Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            </div>
            
            {/* Loading Text */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Doctor Network</h2>
            <p className="text-gray-600">Loading your professional network...</p>
            
            {/* Loading Dots */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
          <h1 className="text-4xl font-bold mb-2">Doctor Network 🩺</h1>
          <p className="text-indigo-100 text-lg">Connect, share knowledge, and collaborate with 15,234 medical professionals worldwide</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-x-auto">
          <div className="flex items-center space-x-2 p-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.name}</span>
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
        {activeTab === "requests" && <RequestsTab />}
        {activeTab === "discover" && <DiscoverTab />}
        {activeTab === "mr-network" && <MRNetworkTab />}
        {activeTab === "groups" && <GroupsTab />}
      </main>
    </div>
    </>
  );
}

// Feed Tab with Create Post Modal
function FeedTab({ posts, showCreatePost, setShowCreatePost, postContent, setPostContent, postType, setPostType, handleCreatePost }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-6">
        {/* Create Post Button */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              DS
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-left text-gray-500 font-medium transition-all"
            >
              Share your medical insights, Dr. Sharma...
            </button>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Create Post</h3>
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
                  { id: "case-study", label: "Case Study", icon: "📋" },
                  { id: "research", label: "Research", icon: "🔬" },
                  { id: "question", label: "Question", icon: "❓" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPostType(type.id)}
                    className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${
                      postType === type.id
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span className="mr-2">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>

              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind? Share your medical insights, case studies, or questions..."
                className="w-full h-40 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none resize-none mb-4"
              />

              {/* Upload Options */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <button className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border-2 border-blue-200">
                  <span className="text-3xl mb-2">📷</span>
                  <span className="text-xs font-semibold text-blue-700">Photo</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all border-2 border-green-200">
                  <span className="text-3xl mb-2">📄</span>
                  <span className="text-xs font-semibold text-green-700">Document</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all border-2 border-purple-200">
                  <span className="text-3xl mb-2">📊</span>
                  <span className="text-xs font-semibold text-purple-700">Poll</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all border-2 border-orange-200">
                  <span className="text-3xl mb-2">🎥</span>
                  <span className="text-xs font-semibold text-orange-700">Video</span>
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
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
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 card-professional">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
            {post.avatar}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{post.author}</h4>
            <p className="text-sm text-gray-600">{post.specialty} • {post.time}</p>
          </div>
        </div>
        {post.type !== "text" && (
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold">
            {post.type === "case-study" ? "📋 Case Study" : "🔬 Research"}
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
        <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all">
          <span className="text-xl">💾</span>
          <span className="font-semibold text-gray-700">Save</span>
        </button>
      </div>
    </div>
  );
}

// Right Sidebar
function RightSidebar() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <h3 className="text-lg font-bold mb-4">Your Impact</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-indigo-100">Profile Views</span>
            <span className="text-2xl font-bold">1,234</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-indigo-100">Post Impressions</span>
            <span className="text-2xl font-bold">5,678</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-indigo-100">Connections</span>
            <span className="text-2xl font-bold">456</span>
          </div>
        </div>
      </div>

      {/* Suggested Connections */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Suggested Connections</h3>
        <div className="space-y-4">
          {[
            { name: "Dr. Robert Wilson", specialty: "Oncology", mutual: 12 },
            { name: "Dr. Lisa Anderson", specialty: "Pediatrics", mutual: 8 },
            { name: "Dr. James Taylor", specialty: "Surgery", mutual: 15 },
          ].map((doctor, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {doctor.name.split(' ')[1][0]}{doctor.name.split(' ')[2][0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{doctor.name}</p>
                  <p className="text-xs text-gray-600">{doctor.specialty}</p>
                  <p className="text-xs text-gray-500">{doctor.mutual} mutual</p>
                </div>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Trending Topics</h3>
        <div className="space-y-3">
          {[
            { topic: "#CardiovascularHealth", posts: 234 },
            { topic: "#DiabetesCare", posts: 189 },
            { topic: "#MedicalResearch", posts: 456 },
            { topic: "#PatientCare", posts: 321 },
          ].map((item, index) => (
            <div key={index} className="hover:bg-gray-50 p-3 rounded-xl transition-all cursor-pointer">
              <p className="font-semibold text-indigo-600">{item.topic}</p>
              <p className="text-xs text-gray-500">{item.posts} posts</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Messages Tab - Chat with Doctors and MRs
function MessagesTab() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState("");

  const conversations = [
    { id: 1, name: "Dr. Sarah Johnson", role: "Doctor", specialty: "Cardiology", avatar: "SJ", lastMessage: "Thanks for the case study reference!", time: "2 min ago", unread: 2, online: true },
    { id: 2, name: "Rahul Sharma", role: "MR", company: "XYZ Pharma", avatar: "RS", lastMessage: "I have information about the new cardiac drug", time: "15 min ago", unread: 1, online: true },
    { id: 3, name: "Dr. Michael Chen", role: "Doctor", specialty: "Neurology", avatar: "MC", lastMessage: "Let's discuss the treatment protocol", time: "1 hour ago", unread: 0, online: true },
    { id: 4, name: "Priya Patel", role: "MR", company: "ABCD Labs", avatar: "PP", lastMessage: "New product launch next week", time: "2 hours ago", unread: 0, online: false },
    { id: 5, name: "Dr. Emily Davis", role: "Doctor", specialty: "Diabetes Care", avatar: "ED", lastMessage: "Great presentation today!", time: "3 hours ago", unread: 0, online: false },
    { id: 6, name: "Amit Kumar", role: "MR", company: "MediCorp", avatar: "AK", lastMessage: "Sample availability confirmed", time: "Yesterday", unread: 0, online: false },
  ];

  const chatMessages = selectedChat ? [
    { id: 1, sender: "them", text: "Hello Dr. Sharma! How are you?", time: "10:30 AM" },
    { id: 2, sender: "me", text: "Hi! I'm doing well, thanks. How can I help you?", time: "10:32 AM" },
    { id: 3, sender: "them", text: selectedChat.role === "MR" ? "I wanted to share information about our new cardiac medication." : "I wanted to discuss a complex case with you.", time: "10:35 AM" },
    { id: 4, sender: "me", text: "Sure, I'd be interested to learn more.", time: "10:36 AM" },
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h3 className="text-xl font-bold text-white mb-3">Messages</h3>
            <input type="text" placeholder="Search conversations..." className="w-full px-4 py-2 rounded-xl border-2 border-white border-opacity-30 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:bg-opacity-30" />
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {conversations.map((conv) => (
              <div key={conv.id} onClick={() => setSelectedChat(conv)} className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${selectedChat?.id === conv.id ? "bg-indigo-50 border-l-4 border-indigo-600" : ""}`}>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-12 h-12 ${conv.role === "MR" ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-indigo-600 to-purple-600"} rounded-full flex items-center justify-center text-white font-bold`}>{conv.avatar}</div>
                    {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900 truncate">{conv.name}</h4>
                      {conv.unread > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{conv.unread}</span>}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{conv.role === "MR" ? `${conv.role} - ${conv.company}` : `${conv.role} - ${conv.specialty}`}</p>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">{conv.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        {selectedChat ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col h-[700px]">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className={`w-14 h-14 ${selectedChat.role === "MR" ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-blue-500 to-cyan-500"} rounded-full flex items-center justify-center text-white font-bold text-xl`}>{selectedChat.avatar}</div>
                  {selectedChat.online && <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{selectedChat.name}</h3>
                  <p className="text-sm text-indigo-100">{selectedChat.role === "MR" ? `${selectedChat.role} - ${selectedChat.company}` : `${selectedChat.role} - ${selectedChat.specialty}`}</p>
                  {selectedChat.online && <p className="text-xs text-green-200 flex items-center mt-1"><span className="w-2 h-2 bg-green-300 rounded-full mr-1 animate-pulse"></span>Online</p>}
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md ${msg.sender === "me" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" : "bg-white border border-gray-200"} rounded-2xl px-5 py-3 shadow-md`}>
                      <p className={msg.sender === "me" ? "text-white" : "text-gray-800"}>{msg.text}</p>
                      <p className={`text-xs mt-2 ${msg.sender === "me" ? "text-indigo-200" : "text-gray-500"}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex items-center space-x-3">
                <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type your message..." className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" onKeyPress={(e) => { if (e.key === "Enter" && messageText.trim()) { setMessageText(""); } }} />
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 rounded-xl transition-all shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-[700px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a doctor or MR from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Colleagues Tab
function ColleaguesTab() {
  const colleagues = [
    { name: "Dr. Sarah Johnson", specialty: "Cardiology", connections: 245, avatar: "SJ", status: "online" },
    { name: "Dr. Michael Chen", specialty: "Neurology", connections: 189, avatar: "MC", status: "online" },
    { name: "Dr. Emily Davis", specialty: "Diabetes Care", connections: 320, avatar: "ED", status: "offline" },
    { name: "Dr. Robert Wilson", specialty: "Oncology", connections: 156, avatar: "RW", status: "offline" },
    { name: "Dr. Lisa Anderson", specialty: "Pediatrics", connections: 278, avatar: "LA", status: "online" },
    { name: "Dr. James Taylor", specialty: "Surgery", connections: 412, avatar: "JT", status: "offline" },
  ];

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search your network..."
          className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none shadow-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colleagues.map((colleague, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 card-professional">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {colleague.avatar}
                </div>
                <div className={`absolute bottom-0 right-0 w-4 h-4 ${colleague.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white`}></div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{colleague.name}</h4>
                <p className="text-sm text-gray-600">{colleague.specialty}</p>
                <p className="text-xs text-gray-500">{colleague.connections} connections</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-semibold transition-all">
                Message
              </button>
              <button className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-2 rounded-xl font-semibold transition-all">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Requests Tab
function RequestsTab() {
  const requests = [
    { name: "Dr. Amanda White", specialty: "Dermatology", mutual: 8, avatar: "AW", time: "2 days ago" },
    { name: "Dr. Kevin Brown", specialty: "Orthopedics", mutual: 12, avatar: "KB", time: "3 days ago" },
    { name: "Dr. Rachel Green", specialty: "Psychiatry", mutual: 5, avatar: "RG", time: "5 days ago" },
    { name: "Dr. Thomas Lee", specialty: "Radiology", mutual: 15, avatar: "TL", time: "1 week ago" },
    { name: "Dr. Maria Garcia", specialty: "Gynecology", mutual: 10, avatar: "MG", time: "1 week ago" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Requests</h3>
        <p className="text-gray-600">You have {requests.length} pending requests</p>
      </div>

      <div className="space-y-4">
        {requests.map((request, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 card-professional">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {request.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{request.name}</h4>
                  <p className="text-sm text-gray-600">{request.specialty}</p>
                  <p className="text-xs text-gray-500">{request.mutual} mutual connections • {request.time}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all">
                  Accept
                </button>
                <button className="border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all">
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Discover Tab
function DiscoverTab() {
  const doctors = [
    { name: "Dr. Patricia Moore", specialty: "Endocrinology", location: "New York", connections: 567, avatar: "PM" },
    { name: "Dr. Christopher Hall", specialty: "Pulmonology", location: "Los Angeles", connections: 423, avatar: "CH" },
    { name: "Dr. Jennifer Clark", specialty: "Nephrology", location: "Chicago", connections: 389, avatar: "JC" },
    { name: "Dr. Daniel Lewis", specialty: "Gastroenterology", location: "Houston", connections: 512, avatar: "DL" },
    { name: "Dr. Michelle Walker", specialty: "Rheumatology", location: "Phoenix", connections: 298, avatar: "MW" },
    { name: "Dr. Steven Young", specialty: "Hematology", location: "Philadelphia", connections: 445, avatar: "SY" },
  ];

  return (
    <div>
      <div className="mb-6 flex space-x-4">
        <input
          type="text"
          placeholder="Search doctors by name or specialty..."
          className="flex-1 px-6 py-4 bg-white rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none shadow-lg"
        />
        <select className="px-6 py-4 bg-white rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none shadow-lg font-semibold text-gray-700">
          <option>All Specialties</option>
          <option>Cardiology</option>
          <option>Neurology</option>
          <option>Oncology</option>
          <option>Pediatrics</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 card-professional">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                {doctor.avatar}
              </div>
              <h4 className="font-bold text-gray-900 text-lg">{doctor.name}</h4>
              <p className="text-sm text-gray-600">{doctor.specialty}</p>
              <p className="text-xs text-gray-500 mt-1">📍 {doctor.location}</p>
              <p className="text-xs text-gray-500">{doctor.connections} connections</p>
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all">
              Send Request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Groups Tab - NEW!
function GroupsTab() {
  const groups = [
    { name: "Cardiology Professionals", members: 2345, posts: 1234, icon: "❤️", color: "from-red-500 to-pink-500" },
    { name: "Medical Research Hub", members: 5678, posts: 3456, icon: "🔬", color: "from-blue-500 to-cyan-500" },
    { name: "Emergency Medicine", members: 1890, posts: 890, icon: "🚑", color: "from-orange-500 to-red-500" },
    { name: "Pediatrics Network", members: 3456, posts: 2345, icon: "👶", color: "from-green-500 to-emerald-500" },
    { name: "Surgical Innovations", members: 2789, posts: 1567, icon: "🔪", color: "from-purple-500 to-indigo-500" },
    { name: "Mental Health Support", members: 4123, posts: 2890, icon: "🧠", color: "from-pink-500 to-rose-500" },
  ];

  return (
    <div>
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Medical Professional Groups</h3>
        <p className="text-gray-600">Join specialized groups to connect with peers and share knowledge</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 card-professional">
            <div className={`w-20 h-20 bg-gradient-to-br ${group.color} rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg`}>
              {group.icon}
            </div>
            <h4 className="font-bold text-gray-900 text-lg text-center mb-2">{group.name}</h4>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-4">
              <span>👥 {group.members.toLocaleString()}</span>
              <span>📝 {group.posts.toLocaleString()} posts</span>
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all">
              Join Group
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// MR Network Tab - Medical Representatives
function MRNetworkTab() {
  const medicalReps = [
    { name: "Rahul Sharma", company: "XYZ Pharma", territory: "North Region", avatar: "RS", products: 12, status: "online" },
    { name: "Priya Patel", company: "ABCD Labs", territory: "West Region", avatar: "PP", products: 8, status: "online" },
    { name: "Amit Kumar", company: "MediCorp", territory: "South Region", avatar: "AK", products: 15, status: "offline" },
    { name: "Sneha Reddy", company: "PharmaTech", territory: "East Region", avatar: "SR", products: 10, status: "online" },
    { name: "Vikram Singh", company: "HealthCare Inc", territory: "Central Region", avatar: "VS", products: 9, status: "offline" },
    { name: "Anjali Gupta", company: "DiabCare", territory: "North Region", avatar: "AG", products: 7, status: "online" },
  ];

  return (
    <div>
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Medical Representatives Network 💼</h3>
        <p className="text-gray-600">Connect with pharmaceutical representatives for product information and updates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medicalReps.map((mr, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 card-professional">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {mr.avatar}
                </div>
                <div className={`absolute bottom-0 right-0 w-4 h-4 ${mr.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white`}></div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{mr.name}</h4>
                <p className="text-sm text-gray-600">{mr.company}</p>
                <p className="text-xs text-gray-500">📍 {mr.territory}</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 mb-4 border border-orange-100">
              <p className="text-sm text-gray-700">
                <span className="font-bold">Products:</span> {mr.products} medications
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 rounded-xl font-semibold transition-all">
                Connect
              </button>
              <button className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-2 rounded-xl font-semibold transition-all">
                View Products
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

