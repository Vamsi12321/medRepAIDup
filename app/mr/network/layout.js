"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import MRNavbar from "@/components/mr/MRNavbar";

const tabs = [
  { href: "/mr/network/feed",       label: "Feed" },
  { href: "/mr/network/my-posts",   label: "My Posts" },
  { href: "/mr/network/my-network", label: "My Network" },
  { href: "/mr/network/messages",   label: "Messages" },
  { href: "/mr/network/discover",   label: "Discover" },
];

export default function MRNetworkLayout({ children }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-gray-50">
      <MRNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Network</h1>
          <p className="text-orange-100 text-base sm:text-lg">Connect with doctors and fellow MRs, share product updates and insights</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex items-center space-x-2 p-2 min-w-max">
            {tabs.map((tab) => (
              <Link key={tab.href} href={tab.href}
                className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                  pathname === tab.href ? "bg-orange-600 text-white shadow-lg" : "text-gray-700 hover:bg-gray-50"
                }`}>
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}