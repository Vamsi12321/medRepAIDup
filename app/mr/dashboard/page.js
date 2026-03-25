"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

const stats = [
  { label: "Assigned Doctors", value: 45, icon: "👨‍⚕️", color: "from-blue-500 to-cyan-500", change: "+5 this month", link: "/mr/doctors" },
  { label: "Territory Coverage", value: "85%", icon: "📍", color: "from-green-500 to-emerald-500", change: "+10% improvement", link: "/mr/doctors" },
  { label: "Network Connections", value: 128, icon: "🤝", color: "from-orange-500 to-red-500", change: "+15 new connections", link: "/mr/network" },
  { label: "Drug Database Access", value: "24/7", icon: "💊", color: "from-purple-500 to-pink-500", change: "Always updated", link: "/mr/drug-search" },
];

const recentVisits = [
  { id: 1, doctor: "Dr. Rajesh Sharma", hospital: "City General Hospital", date: "Today", time: "2:30 PM", status: "Completed", activity: "Drug consultation" },
  { id: 2, doctor: "Dr. Priya Patel", hospital: "Metro Medical Center", date: "Yesterday", time: "11:00 AM", status: "Completed", activity: "Network discussion" },
  { id: 3, doctor: "Dr. Amit Kumar", hospital: "Apollo Hospital", date: "Tomorrow", time: "10:00 AM", status: "Scheduled", activity: "Product information" },
];

export default function MRDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "MR");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-x-hidden">
      <MRNavbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />
        
        <div className="mb-6 sm:mb-8 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-2xl p-5 sm:p-7 shadow-lg text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome Back, {userName}! 💼</h1>
          <p className="text-orange-100 text-sm sm:text-base">Your territory performance and daily activities</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Visits */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">🏥</span>
                Recent Visits
              </h2>
              <Link href="/mr/visits">
                <button className="text-orange-600 font-semibold hover:text-orange-700 text-sm">
                  View All →
                </button>
              </Link>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {recentVisits.map((visit) => (
                <div key={visit.id} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">{visit.doctor}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">{visit.hospital}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      visit.status === "Completed" 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {visit.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">{visit.date} • {visit.time}</span>
                    <div className="flex space-x-1">
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-semibold">
                        {visit.activity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <span className="text-xl sm:text-2xl mr-2">⚡</span>
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Link href="/mr/doctors">
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                  <span className="text-xl sm:text-2xl block mb-1">👨‍⚕️</span>
                  <span className="text-xs sm:text-sm">My Doctors</span>
                </button>
              </Link>
              <Link href="/mr/drug-search">
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 sm:p-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                  <span className="text-xl sm:text-2xl block mb-1">💊</span>
                  <span className="text-xs sm:text-sm">Drug Search</span>
                </button>
              </Link>
              <Link href="/mr/network">
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 sm:p-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                  <span className="text-xl sm:text-2xl block mb-1">🤝</span>
                  <span className="text-xs sm:text-sm">MR Network</span>
                </button>
              </Link>
              <Link href="/mr/profile">
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 sm:p-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                  <span className="text-xl sm:text-2xl block mb-1">📊</span>
                  <span className="text-xs sm:text-sm">My Profile</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
