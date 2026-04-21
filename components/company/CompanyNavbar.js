"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/lib/auth";

export default function CompanyNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [companyName, setCompanyName] = useState("My Company");

  useEffect(() => {
    setCompanyName(localStorage.getItem("companyName") || "My Company");
  }, []);

  const navItems = [
    { name: "Overview",        path: "/company/overview",        icon: "🏠" },
    { name: "Drug Management", path: "/company/drug-management", icon: "💊" },
    { name: "CME Events",      path: "/company/cme-events",      icon: "📅" },
    { name: "Doctors",         path: "/company/doctors",         icon: "👨‍⚕️" },
    { name: "Medical Reps",    path: "/company/medical-reps",    icon: "💼" },
    { name: "Activity Logs",   path: "/company/activity-logs",   icon: "📋" },
    { name: "Profile",         path: "/company/profile",         icon: "👤" },
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
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Logging you out...</h2>
            <p className="text-white text-lg">See you soon!</p>
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link href="/company/overview" className="flex items-center space-x-3 group shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                <span className="text-xl">🏢</span>
              </div>
              <div className="leading-tight">
                <span className="text-base font-bold text-gray-900 block">Company Portal</span>
                <span className="text-xs text-purple-600 font-semibold">{companyName}</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    pathname === item.path
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Logout + Mobile toggle */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-1.5 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="md:hidden py-3 border-t border-gray-200">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      pathname === item.path
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2"
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
