"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter both username and password"); return; }
    setIsLoggingIn(true);
    try {
      // Call Proxzar OAuth2 endpoint with form-urlencoded
      const formBody = new URLSearchParams();
      formBody.append("username", email);
      formBody.append("password", password);
      formBody.append("grant_type", "password");
      formBody.append("additional_claims", JSON.stringify({ role: "ADMIN" }));

      const res = await fetch((process.env.NEXT_PUBLIC_BASE_PATH || '') + "/api/v1/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody.toString(),
      });
      const data = await res.json();
      if (!res.ok) {
        const raw = data.detail || data.message || "Invalid credentials.";
        const msg = Array.isArray(raw)
          ? raw.map((d) => (typeof d === "string" ? d : d.msg || JSON.stringify(d))).join(", ")
          : String(raw);
        setError(msg);
        setIsLoggingIn(false);
        return;
      }

      // Proxzar returns { accessToken, tokenType }
      const token = data.accessToken || data.access_token;
      localStorage.setItem("access_token", token);
      localStorage.setItem("token_type", data.tokenType || data.token_type || "bearer");

      // Set token expiry from JWT
      let expiry;
      try {
        const jwtPayload = JSON.parse(atob(token.split(".")[1]));
        const backendExpiry = jwtPayload.exp ? jwtPayload.exp * 1000 : Date.now() + 3600 * 1000;
        const minExpiry = Date.now() + (30 * 60 * 1000);
        expiry = Math.max(backendExpiry, minExpiry);
      } catch {
        expiry = Date.now() + 30 * 60 * 1000;
      }
      localStorage.setItem("token_expiry", expiry);

      document.cookie = `access_token=${token}; path=/; max-age=3600; SameSite=Lax`;
      document.cookie = `userRole=company; path=/; max-age=3600; SameSite=Lax`;

      // Call /auth/me to get real user info from platform DB
      const meRes = await fetch((process.env.NEXT_PUBLIC_BASE_PATH || '') + "/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = meRes.ok ? await meRes.json() : {};

      localStorage.setItem("userEmail", user.email || email);
      localStorage.setItem("userName", user.full_name || user.name || email);
      localStorage.setItem("userId", user._id || user.id || "");
      localStorage.setItem("apiRole", user.role || "ADMIN");
      localStorage.setItem("userRole", "company");
      localStorage.setItem("userDepartment", user.department || "");
      localStorage.setItem("companyName", user.company_name || "");

      setLoggedInUser(user.full_name || user.name || email);
      setLoginSuccess(true);
      setIsLoggingIn(false);

      if (user.must_change_password) {
        setTimeout(() => router.push("/change-password"), 1800);
      } else {
        setTimeout(() => router.push("/company/overview"), 1800);
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white">
      {/* Success overlay */}
      {loginSuccess && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#1a0a3e] via-[#2d1b69] to-[#4a1d96] z-50 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-6 mx-auto animate-bounce">
              <span className="text-5xl">🏢</span>
            </div>
            <div className="flex items-center justify-center space-x-2 mb-5">
              {[0, 150, 300].map((d) => (
                <div key={d} className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {loggedInUser}!</h2>
            <p className="text-purple-200 text-lg">Taking you to your dashboard...</p>
          </div>
        </div>
      )}

      {/* LEFT SIDE - Dark with wave */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-[#0f0525]">
        {/* Wave SVG at bottom */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none" style={{ height: "120px" }}>
          <path d="M0,100 C360,180 720,20 1080,100 C1260,140 1380,80 1440,100 L1440,200 L0,200 Z" fill="#1a0a3e" fillOpacity="0.3"/>
          <path d="M0,130 C300,60 600,180 900,120 C1100,80 1300,160 1440,130 L1440,200 L0,200 Z" fill="#2d1569" fillOpacity="0.4"/>
          <path d="M0,160 C240,130 480,190 720,155 C960,120 1200,180 1440,160 L1440,200 L0,200 Z" fill="#3b1d8e" fillOpacity="0.3"/>
        </svg>

        {/* Decorative particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-1.5 h-1.5 bg-purple-400/30 rounded-full" />
          <div className="absolute top-[15%] left-[60%] w-1 h-1 bg-purple-300/25 rounded-full" />
          <div className="absolute top-[40%] left-[80%] w-1.5 h-1.5 bg-purple-400/20 rounded-full" />
          <div className="absolute top-[65%] left-[15%] w-1 h-1 bg-purple-300/25 rounded-full" />
          <div className="absolute top-[75%] left-[50%] w-1.5 h-1.5 bg-purple-400/15 rounded-full" />
        </div>

        <div className="h-full flex flex-col px-8 xl:px-12 py-7 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 relative flex items-center justify-center">
              {/* Hexagon shape */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 44 44" fill="none">
                <path d="M22 2L40 12.5V31.5L22 42L4 31.5V12.5L22 2Z" fill="url(#hexGradient)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                <defs>
                  <linearGradient id="hexGradient" x1="4" y1="2" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7c3aed"/>
                    <stop offset="1" stopColor="#6366f1"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-base font-bold text-white relative z-10">M</span>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">MRX</p>
              <p className="text-purple-300/70 text-[12px]">Admin Portal</p>
            </div>
          </div>

          {/* Welcome + Headline */}
          <p className="text-purple-400 text-[13px] font-medium mb-1">Welcome Back!</p>
          <h1 className="text-white font-extrabold text-[1.8rem] xl:text-[2.1rem] leading-[1.15] mb-3">
            MRX Admin Portal
          </h1>
          <p className="text-purple-200/60 text-[13px] mb-6 max-w-[320px] leading-relaxed">
            Manage your organization, products, users and performance from one powerful platform.
          </p>

          {/* Features + Tab Image */}
          <div className="flex flex-1 min-h-0 items-stretch">
            {/* Features */}
            <div className="space-y-3 w-[220px] xl:w-[250px] flex-shrink-0 self-center">
              {[
                { icon: "📊", title: "Advanced Analytics", desc: "Real-time insights and performance metrics at your fingertips." },
                { icon: "👥", title: "User & Role Management", desc: "Manage admins, MRs and user roles with granular permissions." },
                { icon: "💊", title: "Product & Content Control", desc: "Oversee drug information, content and marketing assets." },
                { icon: "🔒", title: "Secure & Compliant", desc: "Enterprise-grade security with role-based access and audit logs." },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-white/[0.06] border border-white/[0.1] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{f.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-[12px] font-bold leading-tight">{f.title}</p>
                    <p className="text-purple-300/50 text-[10px] leading-snug mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tab/Dashboard Image - slanted */}
            <div className="flex-1 flex items-center justify-center ml-4 relative">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/admin/tab.png`}
                alt="Admin Dashboard"
                width={400}
                height={300}
                className="object-contain w-full h-auto max-h-[85%] drop-shadow-[0_20px_50px_rgba(100,50,200,0.3)] rounded-lg -rotate-[5deg]"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - White */}
      <div className="w-full lg:w-[45%] bg-white flex flex-col items-center justify-center px-6 sm:px-10 py-6 relative">
        {/* Secure Admin Access badge - top right */}
        <div className="absolute top-5 right-5 flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-3 py-1.5">
          <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-800 leading-none">Secure Admin Access</p>
            <p className="text-[8px] text-gray-400">Authorized personnel only</p>
          </div>
        </div>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-4 lg:hidden">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="text-base font-bold text-gray-900">MRX Admin</span>
        </div>

        <div className="w-full max-w-[380px]">
          {/* Header */}
          <p className="text-purple-500 text-[12px] font-medium mb-1">Welcome Back!</p>
          <h2 className="text-[1.5rem] font-bold text-gray-900 mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
              <span className="text-xs mt-0.5">⚠️</span>
              <p className="text-[11px] font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none placeholder:text-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-semibold text-gray-700">Password</label>
                <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/forgot-password`} className="text-[11px] text-purple-600 font-semibold hover:text-purple-700">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-[13px] bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none placeholder:text-gray-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${remember ? "bg-purple-600 border-purple-600" : "border-gray-300 bg-white"}`}
              >
                {remember && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-[12px] text-gray-600">Remember me</span>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-purple-600 via-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-[13px] shadow-lg shadow-purple-300/30 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in to Admin Portal</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* MR Login link */}
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/login`}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            <span className="text-[13px] text-gray-600">Medical Rep?</span>
            <span className="text-[13px] text-purple-600 font-bold">Sign in here</span>
          </a>

          {/* Security footer */}
          <div className="mt-5 flex items-start gap-2">
            <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-700">Your security is our priority</p>
              <p className="text-[10px] text-gray-400">All access is monitored and protected with industry-leading security standards.</p>
            </div>
          </div>

          <p className="mt-4 text-center text-[10px] text-gray-400">© 2025 MRX Pharma. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
