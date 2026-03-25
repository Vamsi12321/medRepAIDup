"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";

const companyData = {
  name: "XYZ Pharma Ltd.",
  email: "contact@xyzpharma.com",
  phone: "+91 98765 43210",
  website: "www.xyzpharma.com",
  address: "123 Pharma Street, Medical District, Mumbai, Maharashtra 400001",
  license: "DL-MH-2024-001234",
  established: "1995",
  employees: "500-1000",
  specialization: ["Cardiology", "Diabetology", "Neurology"],
  description: "Leading pharmaceutical company focused on innovative drug development and healthcare solutions."
};

const companyStats = [
  { label: "Drugs Launched", value: 24, icon: "💊", color: "from-blue-500 to-cyan-500" },
  { label: "Active MRs", value: 45, icon: "💼", color: "from-green-500 to-emerald-500" },
  { label: "CME Events", value: 12, icon: "📅", color: "from-orange-500 to-red-500" },
  { label: "Registered Doctors", value: 1250, icon: "👨‍⚕️", color: "from-purple-500 to-pink-500" },
];

const recentActivity = [
  { id: 1, action: "Launched Tirzepatide (Mounjaro)", date: "2 days ago", icon: "💊", color: "from-blue-500 to-cyan-500" },
  { id: 2, action: "Conducted Cardiology Summit", date: "1 week ago", icon: "📅", color: "from-purple-500 to-pink-500" },
  { id: 3, action: "Added 15 new doctors", date: "2 weeks ago", icon: "👨‍⚕️", color: "from-green-500 to-emerald-500" },
  { id: 4, action: "Uploaded CME recording", date: "3 weeks ago", icon: "🎥", color: "from-orange-500 to-red-500" },
  { id: 5, action: "Hired 5 new MRs", date: "1 month ago", icon: "💼", color: "from-indigo-500 to-purple-500" },
];

export default function CompanyProfile() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 overflow-x-hidden">
      <CompanyNavbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Company Profile
              </h1>
              <p className="text-gray-600 text-base">Manage your company information and view business metrics</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10 rounded-full -mr-20 -mt-20"></div>
              
              <div className="relative z-10">
                <div className="relative inline-block mb-5">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg">
                    XYZ
                  </div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white"></div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{companyData.name}</h2>
                <p className="text-purple-600 font-bold text-base mb-5">Pharmaceutical Company</p>
                
                <div className="space-y-3 text-left mb-5">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border-l-4 border-purple-500">
                    <p className="text-sm text-purple-600 font-semibold mb-1">📧 Email</p>
                    <p className="text-sm font-bold text-gray-800">{companyData.email}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border-l-4 border-blue-500">
                    <p className="text-sm text-blue-600 font-semibold mb-1">📱 Phone</p>
                    <p className="text-sm font-bold text-gray-800">{companyData.phone}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-l-4 border-green-500">
                    <p className="text-sm text-green-600 font-semibold mb-1">🌐 Website</p>
                    <p className="text-sm font-bold text-gray-800">{companyData.website}</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border-l-4 border-orange-500">
                    <p className="text-sm text-orange-600 font-semibold mb-1">🏢 Address</p>
                    <p className="text-sm font-bold text-gray-800">{companyData.address}</p>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border-l-4 border-indigo-500">
                    <p className="text-sm text-indigo-600 font-semibold mb-1">🎫 License</p>
                    <p className="text-sm font-bold text-gray-800">{companyData.license}</p>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 shadow-md text-base">
                  Edit Profile →
                </button>
              </div>
            </div>
          </div>

          {/* Business Metrics Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-5">
              {companyStats.map((stat, index) => (
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

            {/* Company Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">ℹ️</span>
                </div>
                Company Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-blue-600 font-semibold mb-1">📅 Established</p>
                  <p className="text-lg font-bold text-gray-800">{companyData.established}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-green-600 font-semibold mb-1">👥 Employees</p>
                  <p className="text-lg font-bold text-gray-800">{companyData.employees}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                  <p className="text-sm text-purple-600 font-semibold mb-2">🎯 Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {companyData.specialization.map((spec, index) => (
                      <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-semibold">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 font-semibold mb-2">📝 Description</p>
                  <p className="text-gray-800 leading-relaxed">{companyData.description}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
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

            {/* Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">⚙️</span>
                </div>
                Company Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div>
                    <p className="font-bold text-gray-800 text-base">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates about platform activities</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <div>
                    <p className="font-bold text-gray-800 text-base">SMS Alerts</p>
                    <p className="text-sm text-gray-600">Get SMS for important updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-600 peer-checked:to-emerald-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                  <div>
                    <p className="font-bold text-gray-800 text-base">Monthly Reports</p>
                    <p className="text-sm text-gray-600">Receive monthly business analytics</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
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
