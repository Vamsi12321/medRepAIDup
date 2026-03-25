"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

const stats = [
  { label: "Total Companies", value: 12, icon: "🏢", color: "from-blue-500 to-cyan-500", change: "+2 this month", link: "/admin/companies" },
  { label: "Active Users", value: 1847, icon: "👥", color: "from-green-500 to-emerald-500", change: "+156 this month", link: "/admin/users" },
  { label: "Drug Forms", value: 8, icon: "📝", color: "from-purple-500 to-pink-500", change: "+1 this week", link: "/admin/drug-forms" },
  { label: "System Health", value: "99.9%", icon: "⚡", color: "from-orange-500 to-red-500", change: "All systems operational", link: "/admin/system" },
];

const recentActivity = [
  { id: 1, action: "New company registered", company: "MediTech Solutions", time: "2 hours ago", type: "company", icon: "🏢" },
  { id: 2, action: "Drug form updated", company: "PharmaCorp", time: "4 hours ago", type: "form", icon: "📝" },
  { id: 3, action: "User account created", company: "HealthCare Inc", time: "6 hours ago", type: "user", icon: "👤" },
  { id: 4, action: "System backup completed", company: "System", time: "12 hours ago", type: "system", icon: "💾" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [apiRole, setApiRole] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Admin");
    setApiRole(localStorage.getItem("apiRole") || "");
  }, []);

  const isProxzarAdmin = apiRole === "proxzar_admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-x-hidden">
      <AdminNavbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />
        
        <div className="mb-6 sm:mb-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-5 sm:p-7 shadow-lg text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
          <p className="text-blue-100 text-sm sm:text-base">
            {isProxzarAdmin ? "Managing the MedRepAI Platform" : "ABC Pharma Dashboard"}
          </p>
        </div>

        {/* Stats Grid */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <span className="text-xl sm:text-2xl mr-2">⚡</span>
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Link href="/admin/companies">
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                  <span className="text-xl sm:text-2xl block mb-1">🏢</span>
                  <span className="text-xs sm:text-sm">Manage Companies</span>
                </button>
              </Link>
              <Link href="/admin/drug-forms">
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 sm:p-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                  <span className="text-xl sm:text-2xl block mb-1">📝</span>
                  <span className="text-xs sm:text-sm">Drug Forms</span>
                </button>
              </Link>
              <Link href="/admin/users">
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 sm:p-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                  <span className="text-xl sm:text-2xl block mb-1">👥</span>
                  <span className="text-xs sm:text-sm">User Management</span>
                </button>
              </Link>
              <Link href="/admin/system">
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 sm:p-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                  <span className="text-xl sm:text-2xl block mb-1">⚙️</span>
                  <span className="text-xs sm:text-sm">System Settings</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <span className="text-xl sm:text-2xl mr-2">📊</span>
              Recent Activity
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{activity.icon}</span>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">{activity.action}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{activity.company}</p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
