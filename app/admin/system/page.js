"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";
import Breadcrumb from "@/components/Breadcrumb";

export default function AdminSystem() {
  const router = useRouter();

  const systemStats = [
    { label: "System Uptime", value: "99.9%", icon: "⚡", color: "from-green-500 to-emerald-500" },
    { label: "Database Size", value: "2.4 GB", icon: "💾", color: "from-blue-500 to-cyan-500" },
    { label: "Active Sessions", value: "127", icon: "👥", color: "from-purple-500 to-pink-500" },
    { label: "API Calls Today", value: "15,234", icon: "🔄", color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-x-hidden">
      <AdminNavbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />
        
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">System Settings ⚙️</h1>
          <p className="text-gray-600 text-sm sm:text-base">Monitor system health and configure platform settings</p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {systemStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 shadow-lg`}>
                {stat.icon}
              </div>
              <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-gray-600 font-semibold text-xs sm:text-base">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💚</span>
              System Health
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="font-semibold text-green-800">Database Connection</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold">✅ Healthy</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="font-semibold text-green-800">API Services</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold">✅ Running</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="font-semibold text-green-800">File Storage</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold">✅ Available</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="font-semibold text-yellow-800">Backup Status</span>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-bold">⚠️ Scheduled</span>
              </div>
            </div>
          </div>

          {/* Platform Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">⚙️</span>
              Platform Settings
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-semibold text-gray-800 block">User Registration</span>
                  <span className="text-sm text-gray-600">Allow new user signups</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-semibold text-gray-800 block">Email Notifications</span>
                  <span className="text-sm text-gray-600">Send system notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-semibold text-gray-800 block">Maintenance Mode</span>
                  <span className="text-sm text-gray-600">Disable user access</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🔧</span>
            System Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-blue-100 text-blue-600 p-4 rounded-xl font-semibold hover:bg-blue-200 transition-all flex items-center justify-center space-x-2">
              <span>💾</span>
              <span>Backup Database</span>
            </button>
            <button className="bg-green-100 text-green-600 p-4 rounded-xl font-semibold hover:bg-green-200 transition-all flex items-center justify-center space-x-2">
              <span>🔄</span>
              <span>Clear Cache</span>
            </button>
            <button className="bg-purple-100 text-purple-600 p-4 rounded-xl font-semibold hover:bg-purple-200 transition-all flex items-center justify-center space-x-2">
              <span>📊</span>
              <span>Generate Report</span>
            </button>
            <button className="bg-orange-100 text-orange-600 p-4 rounded-xl font-semibold hover:bg-orange-200 transition-all flex items-center justify-center space-x-2">
              <span>🔄</span>
              <span>Restart Services</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
