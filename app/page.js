"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "doctor") { router.replace("/doctor/home"); return; }
    if (userRole === "company") { router.replace("/company/overview"); return; }
    if (userRole === "mr") { router.replace("/mr/dashboard"); return; }
    if (userRole === "admin") { router.replace("/admin/dashboard"); return; }
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
