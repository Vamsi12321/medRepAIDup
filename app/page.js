"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (!userRole) {
      router.push("/login");
    } else if (userRole === "doctor") {
      router.push("/doctor/home");
    } else if (userRole === "company") {
      router.push("/company/overview");
    } else if (userRole === "mr") {
      router.push("/mr/dashboard");
    } else if (userRole === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-6 mx-auto animate-bounce">
          <span className="text-6xl">💊</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Loading...</h1>
        <p className="text-indigo-100">Redirecting...</p>
      </div>
    </div>
  );
}
