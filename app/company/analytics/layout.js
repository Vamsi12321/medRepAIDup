"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import { get } from "@/lib/api";

const now = new Date();
const CM = now.getMonth() + 1;
const CY = now.getFullYear();

const TABS = [
  { id: "overview", path: "/company/analytics", label: "Overview", icon: "📊" },
  { id: "commitments", path: "/company/analytics/commitments", label: "Commitments", icon: "✅" },
  { id: "drugs", path: "/company/analytics/drugs", label: "Drugs", icon: "💊" },
  { id: "mrs", path: "/company/analytics/mrs", label: "MRs", icon: "👤" },
  { id: "doctors", path: "/company/analytics/doctors", label: "Doctors", icon: "🩺" },
  { id: "regions", path: "/company/analytics/regions", label: "Regions", icon: "🗺️" },
];

export default function AnalyticsLayout({ children }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Prefetch OTHER tabs data AFTER current page loads (delayed, non-blocking)
  useEffect(() => {
    const timer = setTimeout(() => {
      const m = CM, y = CY;
      // Only prefetch tabs that aren't the current one
      if (!pathname.includes("/drugs"))       queryClient.prefetchQuery({ queryKey: ["analytics-drugs", m, y], queryFn: () => get(`/api/v1/analytics/drugs?month=${m}&year=${y}`), staleTime: 3 * 60 * 1000 });
      if (!pathname.includes("/mrs"))         queryClient.prefetchQuery({ queryKey: ["analytics-mrs", m, y], queryFn: () => get(`/api/v1/analytics/mrs?month=${m}&year=${y}`), staleTime: 3 * 60 * 1000 });
      if (!pathname.includes("/doctors"))     queryClient.prefetchQuery({ queryKey: ["analytics-doctors", m, y], queryFn: () => get(`/api/v1/analytics/doctors?month=${m}&year=${y}`), staleTime: 3 * 60 * 1000 });
      if (!pathname.includes("/regions"))     queryClient.prefetchQuery({ queryKey: ["analytics-regions", "state", {}, m, y], queryFn: () => get(`/api/v1/analytics/regions?level=state&month=${m}&year=${y}`), staleTime: 3 * 60 * 1000 });
      if (!pathname.includes("/commitments")) queryClient.prefetchQuery({ queryKey: ["rcpa-pending"], queryFn: () => get("/api/v1/sfe/rcpa/pending-approvals"), staleTime: 2 * 60 * 1000 });
    }, 2000); // Wait 2s after page load, then prefetch others in background
    return () => clearTimeout(timer);
  }, [queryClient, pathname]);

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <CompanyNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumb />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">RCPA Analytics</h1>
            <p className="text-sm text-gray-400 mt-0.5">Revenue, commitments & prescription intelligence</p>
          </div>
        </div>
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm mb-6 overflow-x-auto">
          {TABS.map((t) => {
            const active = t.path === "/company/analytics" ? pathname === t.path : pathname.startsWith(t.path);
            return (
              <Link key={t.id} href={t.path} prefetch={true}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  active ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"
                }`}>
                <span>{t.icon}</span> {t.label}
              </Link>
            );
          })}
        </div>
        {children}
      </main>
    </div>
  );
}
