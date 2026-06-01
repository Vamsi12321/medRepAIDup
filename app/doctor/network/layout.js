"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, createContext, useContext } from "react";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import { Icons } from "@/components/network/Icons";

// ── Network Toast Context ─────────────────────────────────────────────────────
export const NetworkToastContext = createContext({ showToast: () => {} });
export const useNetworkToast = () => useContext(NetworkToastContext);

function NetworkToast({ toasts }) {
  return (
    <div className="fixed top-5 right-5 z-[200] space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold animate-[fadeSlide_0.3s_ease-out] pointer-events-auto ${
          t.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
          t.type === "error"   ? "bg-red-50 border-red-200 text-red-800" :
          "bg-blue-50 border-blue-200 text-blue-800"
        }`}>
          <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

const tabs = [
  { href: "/doctor/network/feed",       label: "Feed",       icon: Icons.feed },
  { href: "/doctor/network/my-posts",   label: "My Posts",   icon: Icons.myPosts },
  { href: "/doctor/network/my-network", label: "My Network", icon: Icons.network },
  { href: "/doctor/network/messages",   label: "Messages",   icon: Icons.messages },
  { href: "/doctor/network/discover",   label: "Discover",   icon: Icons.discover },
  { href: "/doctor/network/groups",     label: "Groups",     icon: Icons.groups },
];

export default function DoctorNetworkLayout({ children }) {
  const pathname = usePathname();
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  return (
    <NetworkToastContext.Provider value={{ showToast }}>
      <div className="min-h-screen bg-gray-50">
        <DoctorNavbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4">

          {/* Compact hero */}
          <div className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl px-5 py-4 text-white shadow-lg flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🤝</span>
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Doctor Network</h1>
              <p className="text-indigo-200 text-xs">Connect, share and collaborate with medical professionals</p>
            </div>
          </div>

          {/* Tab bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-x-auto">
            <div className="flex items-center gap-0.5 p-1 min-w-max">
              {tabs.map((tab) => {
                const active = pathname === tab.href;
                return (
                  <Link key={tab.href} href={tab.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-xs ${
                      active
                        ? "bg-indigo-600 text-white shadow"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}>
                    <tab.icon />
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {children}
        </main>
        <NetworkToast toasts={toasts} />
      </div>
    </NetworkToastContext.Provider>
  );
}
