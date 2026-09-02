"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/auth";

export default function AdminNavbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => logout(router);

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
    { name: "Companies", href: "/admin/companies", icon: "🏢" },
    { name: "Drug Forms", href: "/admin/drug-forms", icon: "📝" },
    { name: "Users", href: "/admin/users", icon: "👥" },
    { name: "System", href: "/admin/system", icon: "⚙️" },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-lg sm:text-xl">💊</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-white">MRx Admin</h1>
              <p className="text-xs text-blue-100">System Administration</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-xl text-white hover:bg-white/20 transition-all font-semibold text-sm">
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:flex items-center space-x-3 bg-white/20 rounded-xl px-3 py-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-sm">⚙️</span>
              </div>
              <div className="text-white">
                <p className="text-sm font-bold">Admin</p>
                <p className="text-xs text-blue-100">System Manager</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl font-semibold transition-all text-sm flex items-center space-x-1"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/10 rounded-xl m-2 p-3 backdrop-blur-sm">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <div 
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-white hover:bg-white/20 transition-all font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}