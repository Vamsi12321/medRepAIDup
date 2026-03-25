"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";

const profileData = {
  name: "Rajesh Kumar",
  employee_id: "MR001",
  email: "rajesh.kumar@xyzpharma.com",
  phone: "+91 98765 43210",
  territory: "Mumbai Central",
  company: "XYZ Pharma Ltd.",
  joining_date: "2022-01-15",
  experience: "8 years",
  manager: "Suresh Patel"
};

const performanceStats = [
  { label: "Assigned Doctors", value: 45, icon: "👨‍⚕️", color: "from-blue-500 to-cyan-500" },
  { label: "Network Connections", value: 128, icon: "🤝", color: "from-green-500 to-emerald-500" },
  { label: "Territory Coverage", value: "85%", icon: "📍", color: "from-orange-500 to-red-500" },
  { label: "Drug Database Access", value: "24/7", icon: "💊", color: "from-purple-500 to-pink-500" },
];

const recentActivity = [
  { id: 1, action: "Connected with Dr. Rajesh Sharma", date: "2 hours ago", icon: "🤝", color: "from-blue-500 to-cyan-500" },
  { id: 2, action: "Searched CardioSafe drug info", date: "1 day ago", icon: "💊", color: "from-green-500 to-emerald-500" },
  { id: 3, action: "Updated doctor network", date: "2 days ago", icon: "👨‍⚕️", color: "from-orange-500 to-red-500" },
  { id: 4, action: "Accessed drug database", date: "3 days ago", icon: "📊", color: "from-purple-500 to-pink-500" },
];

export default function MRProfile() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-x-hidden">
      <MRNavbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage your account and view performance</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg text-center border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500 to-red-600 opacity-10 rounded-full -mr-20 -mt-20"></div>
              
              <div className="relative z-10">
                <div className="relative inline-block mb-4 sm:mb-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mx-auto shadow-lg">
                    RK
                  </div>
                  <div className="absolute bottom-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 sm:border-3 border-white"></div>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{profileData.name}</h2>
                <p className="text-orange-600 font-bold text-sm sm:text-base mb-4 sm:mb-5">Medical Representative</p>
                
                <div className="space-y-2 sm:space-y-3 text-left mb-4 sm:mb-5">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-2 sm:p-3 border-l-4 border-orange-500">
                    <p className="text-xs sm:text-sm text-orange-600 font-semibold mb-1">🆔 Employee ID</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">{profileData.employee_id}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-2 sm:p-3 border-l-4 border-blue-500">
                    <p className="text-xs sm:text-sm text-blue-600 font-semibold mb-1">📧 Email</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">{profileData.email}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 sm:p-3 border-l-4 border-green-500">
                    <p className="text-xs sm:text-sm text-green-600 font-semibold mb-1">📱 Phone</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">{profileData.phone}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 sm:p-3 border-l-4 border-purple-500">
                    <p className="text-xs sm:text-sm text-purple-600 font-semibold mb-1">📍 Territory</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">{profileData.territory}</p>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 shadow-md text-sm sm:text-base">
                  Edit Profile →
                </button>
              </div>
            </div>
          </div>

          {/* Performance Section */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {performanceStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-3 sm:p-5 shadow-lg card-hover border border-gray-100 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-base sm:text-xl mb-2 sm:mb-3 shadow-lg`}>
                      {stat.icon}
                    </div>
                    <p className="text-xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">{stat.value}</p>
                    <p className="text-gray-600 font-semibold text-xs sm:text-base">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Company Information */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-5 flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-base sm:text-lg">🏢</span>
                </div>
                Company Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                  <p className="text-xs sm:text-sm text-blue-600 font-semibold mb-1">🏢 Company</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-800">{profileData.company}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-100">
                  <p className="text-xs sm:text-sm text-green-600 font-semibold mb-1">👨‍💼 Manager</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-800">{profileData.manager}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 sm:p-4 border border-orange-100">
                  <p className="text-xs sm:text-sm text-orange-600 font-semibold mb-1">📅 Joining Date</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-800">{new Date(profileData.joining_date).toLocaleDateString()}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-purple-100">
                  <p className="text-xs sm:text-sm text-purple-600 font-semibold mb-1">⏱️ Experience</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-800">{profileData.experience}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-5 flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-base sm:text-lg">📊</span>
                </div>
                Recent Activity
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-3 sm:p-4 hover:shadow-md transition-all flex items-center justify-between border border-gray-100 group"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${activity.color} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <span className="text-base sm:text-lg">{activity.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm sm:text-base">{activity.action}</p>
                        <p className="text-xs sm:text-sm text-gray-500 font-semibold">{activity.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
