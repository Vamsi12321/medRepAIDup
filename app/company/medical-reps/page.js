"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompanyNavbar from "@/components/company/CompanyNavbar";

export default function CompanyMedicalReps() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [mrs, setMrs] = useState([
    { id: 1, name: "Rajesh Kumar", territory: "Mumbai", products: 12, email: "rajesh@xyzpharma.com", status: "Active" },
    { id: 2, name: "Priya Singh", territory: "Delhi", products: 15, email: "priya@xyzpharma.com", status: "Active" },
    { id: 3, name: "Amit Verma", territory: "Bangalore", products: 10, email: "amit@xyzpharma.com", status: "Active" },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <CompanyNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Medical Representatives Management</h1>
            <p className="text-gray-600 text-lg">Manage your field force and sales team</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => { setModalType("bulk-mr"); setShowModal(true); }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
            >
              <span>📤</span>
              <span>Bulk Upload</span>
            </button>
            <button 
              onClick={() => { setModalType("add-mr"); setShowModal(true); }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Add MR</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-bold">Name</th>
                <th className="px-6 py-4 text-left font-bold">Territory</th>
                <th className="px-6 py-4 text-left font-bold">Products</th>
                <th className="px-6 py-4 text-left font-bold">Email</th>
                <th className="px-6 py-4 text-left font-bold">Status</th>
                <th className="px-6 py-4 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mrs.map((mr, index) => (
                <tr key={mr.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4 font-bold text-gray-800">{mr.name}</td>
                  <td className="px-6 py-4 text-gray-600">{mr.territory}</td>
                  <td className="px-6 py-4 text-gray-600">{mr.products}</td>
                  <td className="px-6 py-4 text-gray-600">{mr.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold">
                      {mr.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => { setModalType("edit-mr"); setShowModal(true); }}
                        className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-all"
                      >
                        Edit
                      </button>
                      <button className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-all">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && <MRModal modalType={modalType} setShowModal={setShowModal} />}
    </div>
  );
}

function MRModal({ modalType, setShowModal }) {
  const isBulk = modalType === "bulk-mr";
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{isBulk ? "📤" : "💼"}</span>
            <h2 className="text-2xl font-bold text-white">{isBulk ? "Bulk Upload MRs (Excel)" : "Add Medical Representative"}</h2>
          </div>
          <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {isBulk ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <h3 className="font-bold text-blue-900 mb-4 text-lg">Instructions:</h3>
                <ol className="space-y-2">
                  {["Download the Excel template", "Fill in MR information", "Upload the completed file", "Review and confirm"].map((instruction, index) => (
                    <li key={index} className="flex items-center text-blue-800">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">{index + 1}</span>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
              <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                📥 Download Excel Template
              </button>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-500 transition-all cursor-pointer">
                <span className="text-6xl block mb-4">📤</span>
                <p className="text-gray-600 font-semibold mb-2">Drag and drop your Excel file here</p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </div>
            </div>
          ) : (
            <form className="space-y-4">
              {[
                { label: "Name", type: "text", placeholder: "Full Name" },
                { label: "Territory", type: "text", placeholder: "e.g., Mumbai" },
                { label: "Email", type: "email", placeholder: "mr@company.com" },
                { label: "Phone", type: "tel", placeholder: "+91 98765 43210" },
                { label: "Products", type: "number", placeholder: "Number of products" },
              ].map((field, index) => (
                <div key={index}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
              ))}
            </form>
          )}
        </div>

        <div className="p-6 bg-gray-50 rounded-b-3xl flex space-x-4">
          <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">
            Cancel
          </button>
          <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
            {isBulk ? "Upload & Process" : "Save MR"}
          </button>
        </div>
      </div>
    </div>
  );
}

