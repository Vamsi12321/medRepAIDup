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
  { href: "/doctor/network/discover", label: "Discover", icon: Icons.discover },
  { href: "/doctor/network/groups",   label: "Groups",   icon: Icons.groups },
];

export default function DoctorNetworkLayout({ children }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Doctor Network</h1>
          <p className="text-indigo-100 text-base sm:text-lg">Connect, share knowledge, and collaborate with medical professionals</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex items-center space-x-1 p-2 min-w-max">
            {tabs.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link key={tab.href} href={tab.href}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                    active ? "bg-indigo-600 text-white shadow-lg" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
