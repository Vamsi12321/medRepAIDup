"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";
import Breadcrumb from "@/components/Breadcrumb";

const mockUsers = [
  { id: 1, name: "Dr. Sarah Johnson", email: "sarah.johnson@hospital.com", role: "doctor", company: "City General Hospital", status: "Active", lastLogin: "2024-03-15" },
  { id: 2, name: "Mike Chen", email: "mike.chen@pharmatech.com", role: "mr", company: "PharmaTech Solutions", status: "Active", lastLogin: "2024-03-16" },
  { id: 3, name: "Lisa Rodriguez", email: "lisa@medicorp.com", role: "company", company: "MediCorp Industries", status: "Active", lastLogin: "2024-03-14" },
  { id: 4, name: "Dr. James Wilson", email: "james.wilson@clinic.com", role: "doctor", company: "Wilson Clinic", status: "Pending", lastLogin: "Never" },
  { id: 5, name: "Admin User", email: "admin@medrepai.com", role: "admin", company: "MedRepAI", status: "Active", lastLogin: "2024-03-16" },
];

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case "doctor": return "👨‍⚕️";
      case "mr": return "💼";
      case "company": return "🏢";
      case "admin": return "⚙️";
      default: return "👤";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "doctor": return "bg-blue-100 text-blue-700";
      case "mr": return "bg-orange-100 text-orange-700";
      case "company": return "bg-purple-100 text-purple-700";
      case "admin": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 overflow-x-hidden">
      <AdminNavbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Breadcrumb />
        
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">User Management 👥</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage user accounts across all roles and companies</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 shadow-lg">👥</div>
            <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{users.length}</p>
            <p className="text-gray-600 font-semibold text-xs sm:text-base">Total Users</p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 shadow-lg">👨‍⚕️</div>
            <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{users.filter(u => u.role === "doctor").length}</p>
            <p className="text-gray-600 font-semibold text-xs sm:text-base">Doctors</p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 shadow-lg">💼</div>
            <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{users.filter(u => u.role === "mr").length}</p>
            <p className="text-gray-600 font-semibold text-xs sm:text-base">MRs</p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 shadow-lg">🏢</div>
            <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{users.filter(u => u.role === "company").length}</p>
            <p className="text-gray-600 font-semibold text-xs sm:text-base">Companies</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search users by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 text-sm font-medium transition-all shadow-sm"
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 font-semibold text-sm"
            >
              <option value="all">All Roles</option>
              <option value="doctor">Doctors</option>
              <option value="mr">Medical Reps</option>
              <option value="company">Companies</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Last Login</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${getRoleColor(user.role)}`}>
                        <span className="mr-1">{getRoleIcon(user.role)}</span>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{user.company}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${
                        user.status === "Active" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.lastLogin}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg font-semibold hover:bg-blue-200 transition-all text-sm">
                          Edit
                        </button>
                        <button className="bg-red-100 text-red-600 px-3 py-1 rounded-lg font-semibold hover:bg-red-200 transition-all text-sm">
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200 mt-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 text-sm">Try adjusting your search terms or filters</p>
          </div>
        )}
      </main>
    </div>
  );
}
