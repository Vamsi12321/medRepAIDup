"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/auth";
import { get } from "@/lib/api";

const PAGE_TITLES = {
  "/company/overview":        { title: "Overview",        icon: "🏠", sub: "Company dashboard" },
  "/company/drug-management": { title: "Drug Management", icon: "💊", sub: "Manage your drug catalog" },
  "/company/cme-events":      { title: "CME Events",      icon: "🎓", sub: "Manage medical education events" },
  "/company/doctors":         { title: "Doctors",         icon: "🩺", sub: "Doctor network" },
  "/company/medical-reps":    { title: "Medical Reps",    icon: "💼", sub: "Your field team" },
  "/company/sfe":             { title: "SFE Analytics",   icon: "📊", sub: "Sales force effectiveness" },
  "/company/analytics":       { title: "RCPA Analytics",  icon: "📈", sub: "Revenue & prescription intelligence" },
  "/company/communications":  { title: "Communications",  icon: "📢", sub: "Send announcements & alerts" },
  "/company/grievances":      { title: "Grievances",      icon: "📝", sub: "Manage MR tickets" },
  "/company/activity-logs":   { title: "Activity Logs",   icon: "📋", sub: "Track all activity" },
  "/company/admin-management": { title: "Admin Mgmt", icon: "⚙️", sub: "Departments & admins" },
  "/company/profile":         { title: "Profile",         icon: "👤", sub: "Company account" },
};

export default function CompanyNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [companyName, setCompanyName] = useState("My Company");
  const [isGeneralAdmin, setIsGeneralAdmin] = useState(false);
  const queryClient = useQueryClient();

  const prefetchOnHover = (path) => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    if (path === "/company/overview") {
      queryClient.prefetchQuery({ queryKey: ["company-overview"], queryFn: () => get("/api/v1/admin/dashboard"), staleTime: 5 * 60 * 1000 });
    } else if (path === "/company/medical-reps") {
      queryClient.prefetchQuery({ queryKey: ["mrs"], queryFn: () => get("/api/v1/mrs?page_size=1000").then((d) => d.mrs || []), staleTime: 5 * 60 * 1000 });
    } else if (path === "/company/sfe") {
      queryClient.prefetchQuery({ queryKey: ["sfe-dashboard", month, year], queryFn: () => get("/api/v1/sfe/dashboard", { month, year }), staleTime: 5 * 60 * 1000 });
    } else if (path === "/company/doctors") {
      queryClient.prefetchQuery({ queryKey: ["doctors"], queryFn: () => get("/api/v1/doctors?page_size=1000").then((d) => Array.isArray(d) ? d : (d?.doctors || [])), staleTime: 5 * 60 * 1000 });
    } else if (path === "/company/drug-management") {
      queryClient.prefetchQuery({ queryKey: ["drugs"], queryFn: () => get("/api/v1/drugs?limit=500"), staleTime: 5 * 60 * 1000 });
    }
  };

  useEffect(() => {
    setCompanyName(localStorage.getItem("companyName") || "My Company");
    const dept = localStorage.getItem("userDepartment");
    // general admin has no department — treat empty, null, "null", "undefined", "general" as no dept
    const hasNoDept = !dept || dept === "null" || dept === "undefined" || dept === "general" || dept.trim() === "";
    setIsGeneralAdmin(hasNoDept);
  }, []);

  const navItems = [
    { name: "Overview",   path: "/company/overview",        icon: "🏠" },
    { name: "Drugs",      path: "/company/drug-management", icon: "💊" },
    { name: "CME",        path: "/company/cme-events",      icon: "📅" },
    { name: "Doctors",    path: "/company/doctors",         icon: "🩺" },
    { name: "MRs",        path: "/company/medical-reps",    icon: "💼" },
    { name: "SFE",        path: "/company/sfe",             icon: "📊" },
    { name: "Analytics",  path: "/company/analytics",       icon: "📈" },
    { name: "Comms",      path: "/company/communications",  icon: "📢" },
    { name: "Grievances", path: "/company/grievances",      icon: "📝" },
    { name: "Logs",       path: "/company/activity-logs",   icon: "📋" },
    ...(isGeneralAdmin ? [{ name: "Admin", path: "/company/admin-management", icon: "⚙️" }] : []),
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
          <div className="flex justify-between items-center h-14">

            {/* Logo */}
            <Link href="/company/overview" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform shadow">
                <span className="text-base">🏢</span>
              </div>
              <div className="leading-tight hidden sm:block">
                <span className="text-sm font-bold text-gray-900 block">Company Portal</span>
                <span className="text-xs text-purple-500 -mt-0.5 block truncate max-w-[120px]">{companyName}</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onMouseEnter={() => prefetchOnHover(item.path)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    pathname === item.path
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Logout + Profile + Mobile toggle */}
            <div className="flex items-center gap-1 shrink-0">
              <Link href="/company/profile"
                className={"hidden lg:flex items-center px-2 py-1.5 rounded-lg text-xs font-semibold transition-all " + (pathname === "/company/profile" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow" : "text-gray-600 hover:bg-gray-100")}>
                <span className="text-sm">👤</span>
              </Link>
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center justify-center w-9 h-9 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
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
            <div className="lg:hidden py-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
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
                  className="col-span-2 text-left px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Page title bar */}
      {PAGE_TITLES[pathname] && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2">
            <span className="text-sm">{PAGE_TITLES[pathname].icon}</span>
            <span className="text-sm font-bold text-gray-800">{PAGE_TITLES[pathname].title}</span>
            <span className="text-gray-400 text-xs hidden sm:inline">· {PAGE_TITLES[pathname].sub}</span>
          </div>
        </div>
      )}
    </>
  );
}
