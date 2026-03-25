"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

export default function CompanyOverview() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [companyName, setCompanyName] = useState("My Company");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Admin");
    setCompanyName(localStorage.getItem("companyName") || "My Company");
  }, []);

  const stats = [
    { label: "Total Drugs", value: 24, icon: "💊", color: "from-blue-500 to-cyan-500", change: "+3 this month", link: "/company/drug-management" },
    { label: "Active MRs", value: 45, icon: "💼", color: "from-orange-500 to-red-500", change: "+5 this month", link: "/company/medical-reps" },
    { label: "CME Events", value: 12, icon: "📅", color: "from-green-500 to-emerald-500", change: "+2 upcoming", link: "/company/cme-events" },
    { label: "Registered Doctors", value: 1250, icon: "👨‍⚕️", color: "from-purple-500 to-pink-500", change: "+120 this month", link: "/company/doctors" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <CompanyNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />
        
        <div className="mb-6 sm:mb-8 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-5 sm:p-7 shadow-lg text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
          <p className="text-purple-100 text-sm sm:text-base">{companyName} Dashboard</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <Link key={index} href={stat.link}>
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 shadow-md`}>
                  {stat.icon}
                </div>
                <p className="text-2xl sm:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">{stat.value}</p>
                <p className="text-gray-600 font-semibold text-xs sm:text-base mb-1 sm:mb-2">{stat.label}</p>
                <p className="text-xs sm:text-sm text-green-600 font-semibold">{stat.change}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <span className="text-xl mr-2">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <Link href="/company/drug-management">
              <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                <span className="text-xl sm:text-2xl block mb-1">💊</span>
                <span className="text-xs sm:text-sm">Add New Drug</span>
              </button>
            </Link>
            <Link href="/company/cme-events">
              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 sm:p-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                <span className="text-xl sm:text-2xl block mb-1">📅</span>
                <span className="text-xs sm:text-sm">Create Event</span>
              </button>
            </Link>
            <Link href="/company/doctors">
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 sm:p-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                <span className="text-xl sm:text-2xl block mb-1">👨‍⚕️</span>
                <span className="text-xs sm:text-sm">Add Doctor</span>
              </button>
            </Link>
            <Link href="/company/medical-reps">
              <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 sm:p-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                <span className="text-xl sm:text-2xl block mb-1">💼</span>
                <span className="text-xs sm:text-sm">Add MR</span>
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

