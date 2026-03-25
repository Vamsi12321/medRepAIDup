"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DoctorNavbar from "@/components/doctor/DoctorNavbar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

const recentDrugs = [
  { id: 1, name: "CardioSafe", indication: "Hypertension", company: "XYZ Pharma", launch: "2 days ago", color: "from-red-500 to-pink-500" },
  { id: 2, name: "HeartFlow", indication: "Cardiology", company: "ABCD Labs", launch: "1 week ago", color: "from-blue-500 to-cyan-500" },
  { id: 3, name: "BPShield", indication: "Hypertension", company: "MediCorp", launch: "2 weeks ago", color: "from-purple-500 to-indigo-500" },
];

const upcomingEvents = [
  { id: 1, title: "Hypertension Management Webinar", date: "March 25, 2026", attendees: 245, type: "Webinar" },
  { id: 2, title: "Cardiology Advances Summit", date: "April 2, 2026", attendees: 180, type: "Conference" },
  { id: 3, title: "Clinical Trial Updates", date: "April 15, 2026", attendees: 320, type: "Workshop" },
];

export default function DoctorHome() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Doctor");
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <DoctorNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />
        
        <div className="mb-6 sm:mb-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 sm:p-7 shadow-lg text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="w-full lg:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome Back, {userName}! 👋</h1>
              <p className="text-indigo-100 text-sm sm:text-base mb-4">Stay updated with the latest drug launches and medical insights</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link href="/doctor/drug-search" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-white text-indigo-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold hover:shadow-lg transition-all text-sm sm:text-base">
                    Search Drugs
                  </button>
                </Link>
                <Link href="/doctor/cme-events" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-white text-purple-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold hover:shadow-lg transition-all text-sm sm:text-base">
                    View Events
                  </button>
                </Link>
              </div>
            </div>
            <div className="hidden xl:flex space-x-3">
              <div className="text-center bg-white rounded-xl p-5 shadow-md">
                <p className="text-4xl font-bold mb-1 text-indigo-600">24</p>
                <p className="text-sm text-gray-700 font-semibold">New Drugs</p>
              </div>
              <div className="text-center bg-white rounded-xl p-5 shadow-md">
                <p className="text-4xl font-bold mb-1 text-purple-600">8</p>
                <p className="text-sm text-gray-700 font-semibold">CME Events</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-5 gap-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3 shadow-md">
                <span className="text-xl">🔥</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recently Launched Drugs</h2>
                <p className="text-gray-600 text-xs sm:text-sm">Latest additions to our database</p>
              </div>
            </div>
            <Link href="/doctor/drug-search">
              <button className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center space-x-1 text-sm whitespace-nowrap">
                <span>View All</span>
                <span>→</span>
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDrugs.map((drug) => (
              <div key={drug.id} className="bg-white rounded-2xl p-6 card-professional shadow-md">
                <div className={`w-16 h-16 bg-gradient-to-br ${drug.color} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                  <span className="text-white text-2xl font-bold">{drug.name[0]}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{drug.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Indication</span>
                    <span className="text-gray-900 font-semibold">{drug.indication}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Company</span>
                    <span className="text-gray-900 font-semibold">{drug.company}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <span className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-bold">
                      🆕 Launched {drug.launch}
                    </span>
                  </div>
                </div>
                <Link href={`/drug-details/${drug.id}`}>
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all text-base">
                    View Details →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3 shadow-md">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upcoming CME Events</h2>
                <p className="text-gray-600 text-sm">Enhance your medical knowledge</p>
              </div>
            </div>
            <Link href="/doctor/cme-events">
              <button className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center space-x-1 text-sm">
                <span>View All</span>
                <span>→</span>
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl p-6 card-professional shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-200">
                    {event.type}
                  </span>
                  <span className="text-gray-600 text-sm font-semibold">{event.attendees} attending</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{event.title}</h3>
                <p className="text-gray-600 mb-4 flex items-center text-base">
                  <span className="mr-2">📆</span>
                  {event.date}
                </p>
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all text-base">
                  Register Now →
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

