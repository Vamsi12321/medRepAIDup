"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";

export default function CompanyCMEEvents() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  
  // Enhanced events data with location and recording
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Hypertension Management Webinar",
      description: "Learn the latest guidelines and treatment strategies for hypertension management in clinical practice.",
      date: "2026-03-25",
      time: "10:00 AM - 12:00 PM",
      type: "Webinar",
      location: "Online - Zoom Platform",
      speaker: "Dr. John Smith, MD",
      attendees: 245,
      maxAttendees: 500,
      status: "Upcoming",
      recording_url: null,
      created_at: "2026-03-10"
    },
    {
      id: 2,
      title: "Cardiology Advances Summit",
      description: "Comprehensive review of recent advances in cardiovascular medicine and interventional procedures.",
      date: "2026-04-02",
      time: "9:00 AM - 5:00 PM",
      type: "Conference",
      location: "Grand Hotel Conference Center, Mumbai",
      speaker: "Dr. Sarah Johnson, MD",
      attendees: 180,
      maxAttendees: 300,
      status: "Upcoming",
      recording_url: null,
      created_at: "2026-02-15"
    },
    {
      id: 3,
      title: "Diabetes Care Workshop",
      description: "Hands-on workshop covering latest diabetes management protocols and patient care strategies.",
      date: "2026-02-20",
      time: "2:00 PM - 6:00 PM",
      type: "Workshop",
      location: "Medical College Auditorium, Delhi",
      speaker: "Dr. Michael Chen, MD",
      attendees: 120,
      maxAttendees: 150,
      status: "Completed",
      recording_url: "https://storage.googleapis.com/cme-recordings/diabetes-care-workshop.mp4",
      created_at: "2026-01-25"
    },
    {
      id: 4,
      title: "Neurology Update 2026",
      description: "Latest developments in neurological disorders diagnosis and treatment approaches.",
      date: "2026-01-15",
      time: "11:00 AM - 3:00 PM",
      type: "Seminar",
      location: "Online - Microsoft Teams",
      speaker: "Dr. Emily Davis, MD",
      attendees: 89,
      maxAttendees: 200,
      status: "Completed",
      recording_url: null, // Missing recording
      created_at: "2025-12-20"
    }
  ]);

  const filteredEvents = events.filter(event => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") return event.status === "Upcoming";
    if (activeTab === "completed") return event.status === "Completed";
    if (activeTab === "with-recording") return event.recording_url;
    if (activeTab === "missing-recording") return event.status === "Completed" && !event.recording_url;
    return true;
  });

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleDelete = (eventId) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 overflow-x-hidden">
      <CompanyNavbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">CME Events Management</h1>
            <p className="text-gray-600 text-sm sm:text-base">Create and manage continuing medical education events with recordings</p>
          </div>
          <button 
            onClick={() => {
              setEditingEvent(null);
              setShowModal(true);
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <span>➕</span>
            <span>Add Event</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📅</span>
              </div>
            </div>
            <p className="text-gray-600 mb-1 font-semibold text-base">Total Events</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{events.length}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🔜</span>
              </div>
            </div>
            <p className="text-gray-600 mb-1 font-semibold text-base">Upcoming</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {events.filter(e => e.status === "Upcoming").length}
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎥</span>
              </div>
            </div>
            <p className="text-gray-600 mb-1 font-semibold text-base">With Recordings</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {events.filter(e => e.recording_url).length}
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">❌</span>
              </div>
            </div>
            <p className="text-gray-600 mb-1 font-semibold text-base">Missing Recordings</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              {events.filter(e => e.status === "Completed" && !e.recording_url).length}
            </p>
          </div>
        </div>
        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-8 bg-white rounded-xl p-2 shadow-lg border border-gray-100 overflow-x-auto">
          {[
            { key: "all", label: "All Events", count: events.length, icon: "📋" },
            { key: "upcoming", label: "Upcoming", count: events.filter(e => e.status === "Upcoming").length, icon: "🔜" },
            { key: "completed", label: "Completed", count: events.filter(e => e.status === "Completed").length, icon: "✅" },
            { key: "with-recording", label: "With Recordings", count: events.filter(e => e.recording_url).length, icon: "🎥" },
            { key: "missing-recording", label: "Missing Recordings", count: events.filter(e => e.status === "Completed" && !e.recording_url).length, icon: "❌" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="text-sm">{tab.label} ({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold">{event.type}</span>
                <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  event.status === "Upcoming" 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {event.status}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-3 text-sm leading-relaxed">{event.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border-l-4 border-indigo-500">
                  <p className="text-sm text-indigo-600 font-semibold mb-1">📅 Date & Time</p>
                  <p className="text-sm font-bold text-gray-800">{new Date(event.date).toLocaleDateString()} • {event.time}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-l-4 border-green-500">
                  <p className="text-sm text-green-600 font-semibold mb-1">📍 Location</p>
                  <p className="text-sm font-bold text-gray-800">{event.location}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border-l-4 border-orange-500">
                  <p className="text-sm text-orange-600 font-semibold mb-1">👨‍⚕️ Speaker</p>
                  <p className="text-sm font-bold text-gray-800">{event.speaker}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border-l-4 border-blue-500">
                  <p className="text-sm text-blue-600 font-semibold mb-1">👥 Attendees</p>
                  <p className="text-sm font-bold text-gray-800">{event.attendees} / {event.maxAttendees}</p>
                </div>
                {event.recording_url && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border-l-4 border-purple-500">
                    <p className="text-sm text-purple-600 font-semibold mb-1">🎥 Recording</p>
                    <p className="text-sm font-bold text-green-700">Available</p>
                  </div>
                )}
                {event.status === "Completed" && !event.recording_url && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3 border-l-4 border-red-500">
                    <p className="text-sm text-red-600 font-semibold mb-1">🎥 Recording</p>
                    <p className="text-sm font-bold text-red-700">Missing</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(event)}
                  className="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-all text-sm"
                >
                  Edit
                </button>
                {event.status === "Completed" && !event.recording_url && (
                  <button className="flex-1 bg-green-100 text-green-600 px-3 py-2 rounded-lg font-semibold hover:bg-green-200 transition-all text-sm">
                    Upload Recording
                  </button>
                )}
                {event.recording_url && (
                  <button className="flex-1 bg-purple-100 text-purple-600 px-3 py-2 rounded-lg font-semibold hover:bg-purple-200 transition-all text-sm">
                    View Recording
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(event.id)}
                  className="bg-red-100 text-red-600 px-3 py-2 rounded-lg font-semibold hover:bg-red-200 transition-all text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && <EventModal setShowModal={setShowModal} editingEvent={editingEvent} />}
    </div>
  );
}

function EventModal({ setShowModal, editingEvent }) {
  const isEditing = !!editingEvent;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">📅</span>
            <h2 className="text-2xl font-bold text-white">
              {isEditing ? 'Edit CME Event' : 'Add CME Event'}
            </h2>
          </div>
          <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Title *</label>
                <input 
                  type="text" 
                  defaultValue={editingEvent?.title || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  placeholder="e.g., Hypertension Management Webinar" 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea 
                  rows="3"
                  defaultValue={editingEvent?.description || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  placeholder="Event description and learning objectives..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date *</label>
                <input 
                  type="date" 
                  defaultValue={editingEvent?.date || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Time *</label>
                <input 
                  type="text" 
                  defaultValue={editingEvent?.time || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  placeholder="e.g., 10:00 AM - 12:00 PM"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Type *</label>
                <select 
                  defaultValue={editingEvent?.type || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Conference">Conference</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Symposium">Symposium</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Max Attendees</label>
                <input 
                  type="number" 
                  defaultValue={editingEvent?.maxAttendees || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  placeholder="e.g., 500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Location *</label>
                <input 
                  type="text" 
                  defaultValue={editingEvent?.location || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  placeholder="e.g., Online - Zoom Platform or Grand Hotel Conference Center, Mumbai"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Speaker *</label>
                <input 
                  type="text" 
                  defaultValue={editingEvent?.speaker || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  placeholder="e.g., Dr. John Smith, MD"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <select 
                  defaultValue={editingEvent?.status || "Upcoming"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            {/* Recording Upload Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <span className="text-2xl mr-3">🎥</span>
                Event Recording (Optional)
              </h3>
              <p className="text-gray-600 mb-4 text-sm">Upload recording for attendees who missed the event</p>
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
                <svg className="mx-auto h-12 w-12 text-purple-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold text-purple-600 hover:text-purple-500 cursor-pointer">Click to upload recording</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">MP4, AVI, MOV files (MAX. 500MB)</p>
              </div>
              {editingEvent?.recording_url && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-semibold">✅ Recording already uploaded</p>
                  <p className="text-xs text-green-600 mt-1">Click above to replace with new recording</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                {isEditing ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
