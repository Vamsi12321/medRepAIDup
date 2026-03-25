"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import Breadcrumb from "@/components/Breadcrumb";

const upcomingEvents = [
  {
    id: 1,
    title: "Hypertension Management Webinar",
    date: "March 25, 2026",
    time: "10:00 AM - 12:00 PM",
    type: "Webinar",
    attendees: 245,
    speaker: "Dr. John Smith",
    credits: "2 CME Credits",
    description: "Learn the latest guidelines and treatment strategies for hypertension management.",
    color: "from-blue-500 via-cyan-500 to-teal-500",
    icon: "🎥",
  },
  {
    id: 2,
    title: "Cardiology Advances Summit",
    date: "April 2, 2026",
    time: "9:00 AM - 5:00 PM",
    type: "Conference",
    attendees: 180,
    speaker: "Dr. Sarah Johnson",
    credits: "6 CME Credits",
    description: "Comprehensive review of recent advances in cardiovascular medicine and interventions.",
    color: "from-purple-500 via-pink-500 to-rose-500",
    icon: "🏥",
  },
  {
    id: 3,
    title: "Clinical Trial Updates Workshop",
    date: "April 15, 2026",
    time: "2:00 PM - 4:00 PM",
    type: "Workshop",
    attendees: 320,
    speaker: "Dr. Michael Chen",
    credits: "3 CME Credits",
    description: "Review of latest clinical trial results and their implications for practice.",
    color: "from-green-500 via-emerald-500 to-teal-500",
    icon: "📊",
  },
  {
    id: 4,
    title: "Diabetes Care Symposium",
    date: "April 20, 2026",
    time: "11:00 AM - 3:00 PM",
    type: "Symposium",
    attendees: 290,
    speaker: "Dr. Emily Davis",
    credits: "4 CME Credits",
    description: "Latest developments in diabetes management and emerging therapies.",
    color: "from-orange-500 via-amber-500 to-yellow-500",
    icon: "💉",
  },
];

const pastEvents = [
  { id: 5, title: "Cardiac Drug Advances", date: "February 15, 2026", type: "Webinar", recording: true, views: "1.2K" },
  { id: 6, title: "Diabetes Treatment Trends", date: "January 28, 2026", type: "Conference", recording: true, views: "890" },
  { id: 7, title: "Neurology Update 2026", date: "January 10, 2026", type: "Workshop", recording: true, views: "2.1K" },
];

export default function DoctorCMEEvents() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upcoming");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <DoctorNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                CME Events
              </h1>
              <p className="text-gray-600 text-base">Continuing Medical Education opportunities for healthcare professionals</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-xl">📅</span>
              </div>
            </div>
            <p className="text-gray-600 mb-1 font-semibold text-base">Upcoming Events</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{upcomingEvents.length}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-xl">🎥</span>
              </div>
            </div>
            <p className="text-gray-600 mb-1 font-semibold text-base">Recordings</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{pastEvents.length}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-3 mb-8 bg-white rounded-xl p-2 shadow-lg border border-gray-100">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 px-5 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === "upcoming"
                ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-base">📅</span>
            <span className="text-base">Upcoming Events</span>
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 px-5 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === "past"
                ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-base">🎥</span>
            <span className="text-base">Past Events</span>
          </button>
        </div>

        {/* Upcoming Events */}
        {activeTab === "upcoming" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 card-hover relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${event.color} opacity-10 rounded-full -mr-20 -mt-20`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${event.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <span className="text-xl">{event.icon}</span>
                    </div>
                    <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">
                      {event.type}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-3">{event.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed text-base">{event.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border-l-4 border-indigo-500">
                      <p className="text-sm text-indigo-600 font-semibold mb-1">📆 Date</p>
                      <p className="text-sm font-bold text-gray-800">{event.date}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border-l-4 border-blue-500">
                      <p className="text-sm text-blue-600 font-semibold mb-1">🕐 Time</p>
                      <p className="text-sm font-bold text-gray-800">{event.time}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border-l-4 border-purple-500 col-span-2">
                      <p className="text-sm text-purple-600 font-semibold mb-1">👨‍⚕️ Speaker</p>
                      <p className="text-sm font-bold text-gray-800">{event.speaker}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-600 font-semibold flex items-center text-base">
                      <span className="mr-2">👥</span>
                      {event.attendees} attending
                    </span>
                    <span className="text-green-600 font-bold flex items-center text-base">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      Open
                    </span>
                  </div>

                  <button className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-base">
                    Register Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past Events */}
        {activeTab === "past" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pastEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 card-hover">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold">
                    {event.type}
                  </span>
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-md flex items-center">
                    <span className="mr-1">🎥</span>
                    Recording
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-4">{event.title}</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                    <span className="mr-2">📆</span>
                    <span className="font-semibold text-base">{event.date}</span>
                  </div>
                  <div className="flex items-center text-indigo-600 bg-indigo-50 rounded-lg p-3">
                    <span className="mr-2">👁️</span>
                    <span className="font-semibold text-base">{event.views} views</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-base">
                  Watch Recording →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

