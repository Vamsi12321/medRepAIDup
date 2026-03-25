"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";

const profileData = {
  name: "Dr. Sharma",
  specialty: "Cardiology",
  email: "dr.sharma@hospital.com",
  phone: "+91 98765 43210",
  hospital: "City General Hospital",
  experience: "15 years",
  license: "MCI-12345678",
};

const activityStats = [
  { label: "Drugs Reviewed", value: 48, icon: "💊", color: "from-blue-500 to-cyan-500" },
  { label: "Events Attended", value: 12, icon: "📅", color: "from-green-500 to-emerald-500" },
  { label: "Conversations", value: 36, icon: "💬", color: "from-orange-500 to-red-500" },
];

const recentActivity = [
  { id: 1, action: "Reviewed CardioSafe", date: "2 hours ago", icon: "💊", color: "from-blue-500 to-cyan-500" },
  { id: 2, action: "Attended Hypertension Webinar", date: "1 day ago", icon: "📅", color: "from-purple-500 to-pink-500" },
  { id: 3, action: "Downloaded Clinical Trial Report", date: "2 days ago", icon: "📄", color: "from-green-500 to-emerald-500" },
  { id: 4, action: "Chatted with Dr. Patel", date: "3 days ago", icon: "💬", color: "from-orange-500 to-red-500" },
  { id: 5, action: "Searched for Diabetes drugs", date: "5 days ago", icon: "🔍", color: "from-indigo-500 to-purple-500" },
];

export default function DoctorProfile() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <DoctorNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Profile
              </h1>
              <p className="text-gray-600 text-base">Manage your account and view your activity</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10 rounded-full -mr-20 -mt-20"></div>
              
              <div className="relative z-10">
                <div className="relative inline-block mb-5">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg">
                    DS
                  </div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white"></div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{profileData.name}</h2>
                <p className="text-indigo-600 font-bold text-base mb-5">{profileData.specialty}</p>
                
                <div className="space-y-3 text-left mb-5">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border-l-4 border-indigo-500">
                    <p className="text-sm text-indigo-600 font-semibold mb-1">📧 Email</p>
                    <p className="text-sm font-bold text-gray-800">{profileData.email}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border-l-4 border-blue-500">
                    <p className="text-sm text-blue-600 font-semibold mb-1">📱 Phone</p>
                    <p className="text-sm font-bold text-gray-800">{profileData.phone}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border-l-4 border-purple-500">
                    <p className="text-sm text-purple-600 font-semibold mb-1">🏥 Hospital</p>
                    <p className="text-sm font-bold text-gray-800">{profileData.hospital}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-l-4 border-green-500">
                    <p className="text-sm text-green-600 font-semibold mb-1">⏱️ Experience</p>
                    <p className="text-sm font-bold text-gray-800">{profileData.experience}</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border-l-4 border-orange-500">
                    <p className="text-sm text-orange-600 font-semibold mb-1">🎫 License</p>
                    <p className="text-sm font-bold text-gray-800">{profileData.license}</p>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 shadow-md text-base">
                  Edit Profile →
                </button>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-5">
              {activityStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-5 shadow-lg card-hover border border-gray-100 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-10 -mt-10`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-xl mb-3 shadow-lg`}>
                      {stat.icon}
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</p>
                    <p className="text-gray-600 font-semibold text-base">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">📊</span>
                </div>
                Recent Activity
              </h3>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 hover:shadow-md transition-all flex items-center justify-between border border-gray-100 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 bg-gradient-to-br ${activity.color} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <span className="text-lg">{activity.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-base">{activity.action}</p>
                        <p className="text-sm text-gray-500 font-semibold">{activity.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">⚙️</span>
                </div>
                Preferences
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                  <div>
                    <p className="font-bold text-gray-800 text-base">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates about new drugs and events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                  <div>
                    <p className="font-bold text-gray-800 text-base">SMS Alerts</p>
                    <p className="text-sm text-gray-600">Get SMS for urgent updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-cyan-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <div>
                    <p className="font-bold text-gray-800 text-base">Weekly Digest</p>
                    <p className="text-sm text-gray-600">Receive weekly summary of activities</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-600 peer-checked:to-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

