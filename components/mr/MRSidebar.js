"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/auth";
import { get } from "@/lib/api";

export default function MRSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "MR" : "MR";
  const mrId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const { data: unreadData } = useQuery({
    queryKey: ["comms-unread-count"],
    queryFn: () => get("/api/v1/communications/unread/count"),
    refetchInterval: 60000,
    staleTime: 7 * 60 * 1000,
  });
  const unreadCount = unreadData?.unread_count || 0;

  const prefetchOnHover = (path) => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    if (path === "/mr/dashboard") queryClient.prefetchQuery({ queryKey: ["mr-dashboard"], queryFn: () => get("/api/v1/dashboard"), staleTime: 7 * 60 * 1000 });
    else if (path === "/mr/doctors") queryClient.prefetchQuery({ queryKey: ["mr-doctors"], queryFn: () => get("/api/v1/doctors"), staleTime: 7 * 60 * 1000 });
    else if (path === "/mr/visits") queryClient.prefetchQuery({ queryKey: ["visits", mrId, "", "", ""], queryFn: () => get("/api/v1/visits"), staleTime: 0 });
    else if (path === "/mr/sfe") queryClient.prefetchQuery({ queryKey: ["sfe-mcr", month, year], queryFn: () => get("/api/v1/sfe/mcr", { month, year }), staleTime: 7 * 60 * 1000 });
    else if (path === "/mr/announcements") queryClient.prefetchQuery({ queryKey: ["communications"], queryFn: () => get("/api/v1/communications"), staleTime: 7 * 60 * 1000 });
  };

  const handleLogout = () => { setIsLoggingOut(true); setTimeout(() => logout(router), 2500); };
  const isActive = (path) => pathname === path;
  const handleNavClick = () => { if (onMobileClose) onMobileClose(); };

  const navItems = [
    { name: "Dashboard", path: "/mr/dashboard", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { name: "My Doctors", path: "/mr/doctors", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { name: "Visits", path: "/mr/visits", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, hasChevron: true },
    { name: "DCR", path: "/mr/dcr", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { name: "SFE", path: "/mr/sfe", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, hasChevron: true },
    { name: "Drug Search", path: "/mr/drug-search", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
    { name: "Comms", path: "/mr/announcements", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>, badge: unreadCount },
    { name: "Grievance", path: "/mr/grievance", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  // On mobile, always show expanded. On desktop, respect collapsed state.
  const showLabels = mobileOpen || !collapsed;

  return (
    <>
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 animate-[fadeIn_0.3s_ease-out]" />
          <div className="absolute inset-0 overflow-hidden">{[...Array(20)].map((_, i) => (<div key={i} className="absolute w-2 h-2 bg-white/10 rounded-full animate-[float_3s_ease-in-out_infinite]" style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${Math.random()*2}s`, animationDuration: `${2+Math.random()*3}s` }} />))}</div>
          <div className="absolute w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative text-center animate-[scaleIn_0.5s_ease-out]">
            <div className="relative mx-auto mb-8 w-28 h-28"><div className="absolute inset-0 rounded-full border-4 border-purple-400/30 animate-[spin_3s_linear_infinite]" /><div className="absolute inset-2 rounded-full border-2 border-dashed border-white/20 animate-[spin_5s_linear_infinite_reverse]" /><div className="absolute inset-4 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border border-white/20"><span className="text-5xl animate-[wave_1s_ease-in-out_infinite]">👋</span></div></div>
            <h2 className="text-2xl font-bold text-white mb-2 animate-[slideUp_0.5s_ease-out_0.2s_both]">See you soon, {userName.split(" ")[0]}!</h2>
            <p className="text-purple-200/70 text-sm animate-[slideUp_0.5s_ease-out_0.4s_both]">Logging you out securely...</p>
            <div className="mt-6 w-48 mx-auto"><div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-[progress_2s_ease-in-out]" /></div></div>
            <div className="flex justify-center gap-1.5 mt-4">{[0,1,2].map(i => (<div key={i} className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: `${i*200}ms` }} />))}</div>
          </div>
          <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes scaleIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes wave{0%,100%{transform:rotate(0)}25%{transform:rotate(20deg)}75%{transform:rotate(-20deg)}}@keyframes float{0%,100%{transform:translateY(0) scale(1);opacity:.3}50%{transform:translateY(-30px) scale(1.5);opacity:.8}}@keyframes progress{from{width:0}to{width:100%}}`}</style>
        </div>
      )}

      {/* Mobile backdrop overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={onMobileClose} />}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
          hidden md:flex md:z-40
          ${collapsed ? "md:w-[60px]" : "md:w-[220px]"}
        `}
      >
        {/* Desktop sidebar content */}
        <SidebarContent showLabels={!collapsed} navItems={navItems} isActive={isActive} prefetchOnHover={prefetchOnHover} onToggle={onToggle} handleLogout={handleLogout} userName={userName} collapsed={collapsed} handleNavClick={handleNavClick} />
      </aside>

      {/* Mobile sidebar — slide in from left */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[270px] bg-white border-r border-gray-200 flex flex-col z-50 overflow-hidden transition-transform duration-300 ease-in-out md:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button */}
        <div className="absolute top-4 right-3 z-10">
          <button onClick={onMobileClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <SidebarContent showLabels={true} navItems={navItems} isActive={isActive} prefetchOnHover={prefetchOnHover} onToggle={onToggle} handleLogout={handleLogout} userName={userName} collapsed={false} handleNavClick={handleNavClick} />
      </aside>
    </>
  );
}

function SidebarContent({ showLabels, navItems, isActive, prefetchOnHover, onToggle, handleLogout, userName, collapsed, handleNavClick }) {
  return (
    <>
      {/* Logo */}
      <div className={`px-4 py-5 flex items-center ${showLabels ? "gap-3" : "justify-center"} border-b border-gray-100`}>
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
          <span className="text-sm">💼</span>
        </div>
        {showLabels && (
          <div>
            <p className="text-gray-900 font-bold text-sm leading-none">MR Portal</p>
            <p className="text-gray-400 text-[10px] mt-0.5">Medical Representative</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 mt-3 overflow-y-auto scrollbar-sidebar">
        {navItems.map((item) => (
          <Link key={item.name + item.path} href={item.path} onClick={handleNavClick}
            onMouseEnter={() => prefetchOnHover(item.path)}
            title={!showLabels ? item.name : ""}
            className={`flex items-center ${showLabels ? "gap-3 px-3" : "justify-center"} py-2.5 rounded-xl text-[13px] font-medium transition-all mb-1 relative ${
              isActive(item.path) ? "bg-purple-50 text-purple-700 border border-purple-100" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}>
            <span className={`flex-shrink-0 ${isActive(item.path) ? "text-purple-600" : "text-gray-400"}`}>{item.icon}</span>
            {showLabels && <span className="truncate">{item.name}</span>}
            {showLabels && item.badge > 0 && <span className="ml-auto w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{item.badge > 9 ? "9+" : item.badge}</span>}
            {showLabels && item.hasChevron && <svg className="w-3 h-3 ml-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
            {!showLabels && item.badge > 0 && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full" />}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      {showLabels ? (
        <div className="px-3 pb-3 mt-auto space-y-2 border-t border-gray-100 pt-3">
          <button onClick={onToggle} className="w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all hidden md:flex">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" /></svg>
            <span>Collapse</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Logout</span>
          </button>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-100 rounded-xl p-3 hidden md:block">
            <div className="flex items-start gap-2">
              <span className="text-base">🎯</span>
              <div><p className="text-gray-800 text-[10px] font-bold">Keep it up, {userName.split(" ")[0]}!</p><p className="text-gray-400 text-[8px] mt-0.5">You&apos;re performing better than last month.</p></div>
            </div>
            <Link href="/mr/sfe" className="mt-2 flex items-center gap-1 bg-purple-700 hover:bg-purple-800 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-md transition-all w-fit shadow-sm">Performance →</Link>
          </div>
        </div>
      ) : (
        <div className="px-2 pb-3 mt-auto space-y-1 border-t border-gray-100 pt-3">
          <button onClick={onToggle} title="Expand" className="w-full flex items-center justify-center py-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
          <button onClick={handleLogout} title="Logout" className="w-full flex items-center justify-center py-2.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
