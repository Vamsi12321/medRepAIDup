"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/auth";

export default function MRNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard",   path: "/mr/dashboard",   icon: "🏠" },
    { name: "My Doctors",  path: "/mr/doctors",     icon: "👨‍⚕️" },
    { name: "Visits",      path: "/mr/visits",      icon: "📅" },
    { name: "Drug Search", path: "/mr/drug-search", icon: "🔍" },
    { name: "Network",    path: "/mr/network",     icon: "🤝" },
    { name: "Profile",     path: "/mr/profile",     icon: "👤" },
  ];

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
            <Link href="/mr/dashboard" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <span className="text-2xl">💼</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">MR Portal</span>
                <span className="block text-xs text-gray-500 -mt-1">Medical Representative</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                    pathname === item.path
                      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
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
                        ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
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
