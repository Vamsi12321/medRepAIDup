"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import { Icons } from "@/components/network/Icons";

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
  return (
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
    </div>
  );
}
