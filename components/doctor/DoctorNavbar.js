"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/auth";

export default function DoctorNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home",        path: "/doctor/home",        icon: "🏠" },
    { name: "Drug Search", path: "/doctor/drug-search", icon: "🔍" },
    { name: "CME Events",  path: "/doctor/cme-events",  icon: "📅" },
    { name: "Network",     path: "/doctor/network",     icon: "🤝" },
    { name: "Profile",     path: "/doctor/profile",     icon: "👤" },
  ];

  const notifications = [
    { id: 1, type: "drug", title: "New Drug Launch", message: "CardioSafe has been launched by XYZ Pharma", time: "5 min ago", icon: "💊", color: "from-blue-500 to-cyan-500", unread: true },
    { id: 2, type: "event", title: "Event Reminder", message: "Hypertension Management Webinar starts in 2 hours", time: "1 hour ago", icon: "📅", color: "from-green-500 to-emerald-500", unread: true },
    { id: 3, type: "message", title: "New Message", message: "Dr. Patel sent you a message", time: "2 hours ago", icon: "💬", color: "from-purple-500 to-pink-500", unread: true },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => logout(router), 1000);
  };

  return (
    <>
      {isLoggingOut && (
        <div className="fixed inset-0 bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 z-[9999] flex items-center justify-center animate-fadeIn">
          <div className="text-center">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-6 mx-auto animate-bounce">
              <span className="text-6xl">👋</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Logging you out...</h2>
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/doctor/home" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <span className="text-2xl">💊</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">MedRepAI</span>
                <span className="block text-xs text-gray-500 -mt-1">Professional Platform</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                    pathname === item.path
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 rounded-t-2xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center">
                          <span className="mr-2">🔔</span>
                          Notifications
                        </h3>
                        <button onClick={() => setShowNotifications(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${notification.unread ? 'bg-indigo-50/50' : ''}`}>
                          <div className="flex items-start space-x-3">
                            <div className={`w-12 h-12 bg-gradient-to-br ${notification.color} rounded-xl flex items-center justify-center shadow-lg`}>
                              <span className="text-2xl">{notification.icon}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-sm">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-all"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 animate-fadeIn">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                      pathname === item.path
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-all flex items-center space-x-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
