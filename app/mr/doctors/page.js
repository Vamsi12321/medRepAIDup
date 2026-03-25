"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MRNavbar from "@/components/mr/MRNavbar";
import Breadcrumb from "@/components/Breadcrumb";

export default function MRDoctors() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: "Dr. Rajesh Sharma",
      specialty: "Cardiology",
      hospital: "City General Hospital",
      email: "dr.sharma@hospital.com",
      phone: "+91 98765 43210",
      location: "Mumbai, Maharashtra",
      lastVisit: "2026-03-10",
      nextVisit: "2026-03-20",
      status: "Active",
      relationship: "Excellent",
      prescriptions: 15
    },
    {
      id: 2,
      name: "Dr. Priya Patel",
      specialty: "Neurology",
      hospital: "Metro Medical Center",
      email: "dr.patel@metro.com",
      phone: "+91 98765 43211",
      location: "Delhi, NCR",
      lastVisit: "2026-03-08",
      nextVisit: "2026-03-22",
      status: "Active",
      relationship: "Good",
      prescriptions: 8
    },
    {
      id: 3,
      name: "Dr. Amit Kumar",
      specialty: "Diabetology",
      hospital: "Apollo Hospital",
      email: "dr.kumar@apollo.com",
      phone: "+91 98765 43212",
      location: "Bangalore, Karnataka",
      lastVisit: "2026-03-05",
      nextVisit: "2026-03-25",
      status: "Active",
      relationship: "Excellent",
      prescriptions: 22
    }
  ]);

  const filteredDoctors = doctors.filter(doctor => {
    if (activeTab === "all") return true;
    if (activeTab === "high-prescribers") return doctor.prescriptions >= 15;
    if (activeTab === "due-visits") return new Date(doctor.nextVisit) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-x-hidden">
      <MRNavbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Doctors</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your assigned healthcare professionals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl sm:text-2xl">👨‍⚕️</span>
              </div>
            </div>
            <p className="text-gray-600 mb-1 font-semibold text-xs sm:text-base">Total Doctors</p>
            <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{doctors.length}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl sm:text-2xl">📊</span>
              </div>
            </div>
            <p className="text-gray-600 mb-1 font-semibold text-xs sm:text-base">High Prescribers</p>
            <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {doctors.filter(d => d.prescriptions >= 15).length}
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl sm:text-2xl">📅</span>
              </div>
            </div>
            <p className="text-gray-600 mb-1 font-semibold text-xs sm:text-base">Due Visits</p>
            <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {doctors.filter(d => new Date(d.nextVisit) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 sm:mb-8 bg-white rounded-xl p-2 shadow-lg border border-gray-100 overflow-x-auto">
          {[
            { key: "all", label: "All Doctors", count: doctors.length, icon: "📋" },
            { key: "high-prescribers", label: "High Prescribers", count: doctors.filter(d => d.prescriptions >= 15).length, icon: "📊" },
            { key: "due-visits", label: "Due Visits", count: doctors.filter(d => new Date(d.nextVisit) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length, icon: "📅" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="text-xs sm:text-sm">{tab.label} ({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold">
                  {doctor.specialty}
                </span>
                <span className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold ${
                  doctor.relationship === "Excellent" 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {doctor.relationship}
                </span>
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{doctor.name}</h3>
              <p className="text-gray-600 mb-3 text-sm sm:text-base font-semibold">{doctor.hospital}</p>
              
              <div className="space-y-2 mb-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border-l-4 border-indigo-500">
                  <p className="text-xs sm:text-sm text-indigo-600 font-semibold mb-1">📍 Location</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-800">{doctor.location}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-l-4 border-green-500">
                  <p className="text-xs sm:text-sm text-green-600 font-semibold mb-1">📊 Prescriptions</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-800">{doctor.prescriptions} this month</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border-l-4 border-orange-500">
                  <p className="text-xs sm:text-sm text-orange-600 font-semibold mb-1">📅 Next Visit</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-800">{new Date(doctor.nextVisit).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-orange-100 text-orange-600 px-3 py-2 rounded-lg font-semibold hover:bg-orange-200 transition-all text-xs sm:text-sm">
                  Schedule Visit
                </button>
                <button className="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-all text-xs sm:text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
