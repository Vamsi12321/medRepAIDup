"use client";
import { useState } from "react";
import CompanyNavbar from "@/components/company/CompanyNavbar";
import Breadcrumb from "@/components/Breadcrumb";

// Fake DRX doctors available to browse/request
const DRX_DOCTORS = [
  { id: "dr_001", name: "Dr. Kavitha Reddy", specialization: "Pulmonologist", city: "Hyderabad", hospital: "KIMS", regNo: "MCI-TS-22334", orgs: 0, status: "Available" },
  { id: "dr_002", name: "Dr. Mohan Das", specialization: "Orthopedic", city: "Chennai", hospital: "MIOT Hospital", regNo: "MCI-TN-55678", orgs: 1, status: "Available" },
  { id: "dr_003", name: "Dr. Fatima Shaikh", specialization: "Dermatologist", city: "Mumbai", hospital: "Hinduja Hospital", regNo: "MCI-MH-88901", orgs: 2, status: "Available" },
  { id: "dr_004", name: "Dr. Sanya Verma", specialization: "Endocrinologist", city: "Delhi", hospital: "Max Hospital", regNo: "MCI-DL-33445", orgs: 1, status: "Available" },
  { id: "dr_005", name: "Dr. Ravi Shankar", specialization: "Cardiologist", city: "Bangalore", hospital: "Narayana Health", regNo: "MCI-KA-77890", orgs: 3, status: "Available" },
  { id: "dr_006", name: "Dr. Meera Nair", specialization: "Neurologist", city: "Kochi", hospital: "Aster Medcity", regNo: "MCI-KL-12345", orgs: 0, status: "Available" },
  { id: "dr_007", name: "Dr. Amit Joshi", specialization: "Gastroenterologist", city: "Pune", hospital: "Ruby Hall Clinic", regNo: "MCI-MH-99012", orgs: 2, status: "Available" },
  { id: "dr_008", name: "Dr. Lakshmi Rao", specialization: "Oncologist", city: "Hyderabad", hospital: "Apollo Cancer Centre", regNo: "MCI-TS-44567", orgs: 1, status: "Available" },
  { id: "dr_009", name: "Dr. Suresh Babu", specialization: "Pulmonologist", city: "Chennai", hospital: "Vijaya Hospital", regNo: "MCI-TN-66789", orgs: 0, status: "Available" },
  { id: "dr_010", name: "Dr. Nisha Kapoor", specialization: "Cardiologist", city: "Delhi", hospital: "Fortis Heart Institute", regNo: "MCI-DL-11234", orgs: 4, status: "Available" },
];

// Doctors already in our org
const MY_DOCTORS = [
  { id: "dr_101", name: "Dr. Sneha Kulkarni", specialization: "Cardiologist", city: "Mumbai", addedOn: "12 Jan 2025" },
  { id: "dr_102", name: "Dr. Rajesh Kumar", specialization: "Cardiologist", city: "Delhi", addedOn: "15 Jan 2025" },
  { id: "dr_103", name: "Dr. Ananya Iyer", specialization: "Neurologist", city: "Chennai", addedOn: "20 Feb 2025" },
];

export default function DRXDoctorsPage() {
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("all");
  const [requested, setRequested] = useState([]);
  const [showConfirm, setShowConfirm] = useState(null);

  const specs = [...new Set(DRX_DOCTORS.map((d) => d.specialization))];

  const filtered = DRX_DOCTORS.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specFilter === "all" || d.specialization === specFilter;
    return matchSearch && matchSpec;
  });

  const handleRequest = (doctorId) => {
    setRequested((prev) => [...prev, doctorId]);
    setShowConfirm(null);
  };

  return (
    <div className="min-h-screen bg-[#fafbfd] overflow-x-hidden">
      <CompanyNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb />
        <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">DRX Doctors</h1>
        <p className="text-gray-500 text-sm mt-0.5">Browse and request doctors from the DRX platform to add to your organization</p>
      </div>

      {/* Info banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 flex items-start gap-3">
        <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <p className="text-sm font-semibold text-indigo-800">How it works</p>
          <p className="text-xs text-indigo-600 mt-0.5">When you request a doctor, DRX admin reviews it. If approved, the doctor receives a notification. Once they accept, they appear in your organization with access to your drugs, CME events, and communications.</p>
        </div>
      </div>

      {/* Already linked doctors */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Your Linked Doctors ({MY_DOCTORS.length})</h3>
        <div className="flex flex-wrap gap-3">
          {MY_DOCTORS.map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {doc.name.split(" ").slice(1).map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{doc.name}</p>
                <p className="text-[10px] text-gray-500">{doc.specialization} · {doc.city}</p>
              </div>
              <span className="text-[10px] text-green-600 font-bold ml-2">✓ Linked</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search & filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctors by name, city, hospital..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <select value={specFilter} onChange={(e) => setSpecFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100">
          <option value="all">All Specializations</option>
          {specs.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-sm text-gray-500">{filtered.length} available</span>
      </div>

      {/* DRX Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((doc) => {
          const isRequested = requested.includes(doc.id);
          return (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {doc.name.split(" ").slice(1).map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.specialization}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{doc.hospital} · {doc.city}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{doc.regNo}</p>
                  </div>
                </div>
                <div className="text-right">
                  {doc.orgs > 0 && (
                    <span className="text-[10px] text-gray-400 block mb-1">{doc.orgs} org{doc.orgs > 1 ? "s" : ""}</span>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                {isRequested ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-xs font-semibold">Request Sent · Pending DRX Approval</span>
                  </div>
                ) : (
                  <button onClick={() => setShowConfirm(doc)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all">
                    Request to Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Request Doctor</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send a request to DRX to add <span className="font-bold">{showConfirm.name}</span> ({showConfirm.specialization}, {showConfirm.city}) to your organization?
            </p>
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 mb-4">
              <p className="text-xs text-amber-700">The doctor will receive a notification to accept your organization. They can choose to enable/disable notifications from you.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
              <textarea placeholder="Why do you want to add this doctor?" rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 resize-none" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleRequest(showConfirm.id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold">Send Request</button>
            </div>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
