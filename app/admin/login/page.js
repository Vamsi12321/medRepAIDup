"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ROLE = "ADMIN";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function AdminLogin() {
  const router = useRouter();

  // Shared
  const [tab, setTab] = useState("password"); // password | email | phone
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");

  // Password tab
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Email OTP tab
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const timerRef = useRef(null);

  // ── Friendly error normalizer ────────────────────────────────────────────
  const friendlyError = (raw) => {
    const msg = Array.isArray(raw)
      ? raw.map((d) => (typeof d === "string" ? d : d.msg || JSON.stringify(d))).join(", ")
      : String(raw || "");
    const lower = msg.toLowerCase();
    if (lower.includes("authenticat") || lower.includes("bearer token")) {
      return "Invalid username or password. Please try again.";
    }
    return msg || "Something went wrong. Please try again.";
  };

  // ── Countdown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (otpSent && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) { clearInterval(timerRef.current); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [otpSent, secondsLeft]);

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Shared: finalize a successful token ──────────────────────────────────
  const finalizeLogin = async (data) => {
    const token = data.accessToken || data.access_token;
    localStorage.setItem("access_token", token);
    localStorage.setItem("token_type", data.tokenType || data.token_type || "bearer");

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
    const meRes = await fetch(BASE + "/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = meRes.ok ? await meRes.json() : {};

    localStorage.setItem("userEmail", user.email || email || otpEmail);
    localStorage.setItem("userName", user.full_name || user.name || user.email || email || otpEmail);
    localStorage.setItem("userId", user._id || user.id || "");
    localStorage.setItem("apiRole", user.role || ROLE);
    localStorage.setItem("userRole", "company");
    localStorage.setItem("userDepartment", user.department || "");
    localStorage.setItem("companyName", user.company_name || "");

    setLoggedInUser(user.full_name || user.name || user.email || email || otpEmail);
    setLoginSuccess(true);
    setIsLoggingIn(false);

    if (user.must_change_password) {
      setTimeout(() => router.push("/change-password"), 1800);
    } else {
      setTimeout(() => router.push("/company/overview"), 1800);
    }
  };

  // ── Password login ───────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter both username and password"); return; }
    setIsLoggingIn(true);
    try {
      const formBody = new URLSearchParams();
      formBody.append("username", email);
      formBody.append("password", password);
      formBody.append("grant_type", "password");
      formBody.append("additional_claims", JSON.stringify({ role: ROLE }));

      const res = await fetch(BASE + "/api/v1/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody.toString(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(friendlyError(data.detail || data.message));
        setIsLoggingIn(false);
        return;
      }
      await finalizeLogin(data);
    } catch {
      setError("Unable to connect to server. Please try again.");
      setIsLoggingIn(false);
    }
  };

  // ── Email OTP: send ──────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!otpEmail) { setError("Please enter your email address"); return; }
    setSendingOtp(true);
    try {
      const res = await fetch(BASE + "/api/v1/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Identifier: otpEmail, Channel: "email" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(friendlyError(data.detail || data.message));
        setSendingOtp(false);
        return;
      }
      setChallengeId(data.challengeId || data.challenge_id || "");
      setSecondsLeft(data.expiresIn || data.expires_in || 600);
      setOtpSent(true);
      setOtpCode("");
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
    setSendingOtp(false);
  };

  // ── Email OTP: verify ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!otpCode) { setError("Please enter the OTP code"); return; }
    setIsLoggingIn(true);
    try {
      const fd = new FormData();
      fd.append("grant_type", "otp");
      fd.append("challenge_id", challengeId);
      fd.append("otp", otpCode);
      fd.append("additional_claims", JSON.stringify({ role: ROLE }));

      const res = await fetch(BASE + "/api/v1/auth/token", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(friendlyError(data.detail || data.message));
        setIsLoggingIn(false);
        return;
      }
      await finalizeLogin(data);
    } catch {
      setError("Unable to connect to server. Please try again.");
      setIsLoggingIn(false);
    }
  };

  const switchTab = (t) => {
    if (t === "phone") return; // disabled
    setTab(t);
    setError("");
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
      <div className="hidden lg:block lg:w-[53%] relative overflow-hidden bg-[#0f0525]">
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
              <p className="text-white font-bold text-xl leading-none">MRx</p>
              <p className="text-purple-300/70 text-[12px]">Admin Portal</p>
            </div>
          </div>

          {/* Welcome + Headline */}
          <p className="text-purple-400 text-[13px] font-medium mb-1">Welcome Back!</p>
          <h1 className="text-white font-extrabold text-[1.8rem] xl:text-[2.1rem] leading-[1.15] mb-3">
            MRx Admin Portal
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
      <div className="w-full lg:w-[47%] bg-white flex flex-col items-center justify-center px-6 sm:px-10 py-4 relative overflow-y-auto">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-3 lg:hidden">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="text-base font-bold text-gray-900">MRx Admin</span>
        </div>

        <div className="w-full max-w-[400px]">
          {/* A product of Proxzar */}
          <div className="flex items-center justify-end gap-2 mb-3">
            <span className="text-[10px] text-gray-400">A product of</span>
            <span className="text-gray-200">|</span>
            <Image
              src={`${BASE}/images/admin/proxzarmainlogo.png`}
              alt="Proxzar"
              width={80}
              height={22}
              className="object-contain h-5 w-auto"
              priority
            />
          </div>

          {/* Header */}
          <p className="text-purple-500 text-[11px] font-medium mb-0.5">Welcome Back!</p>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Sign in to your account</h2>

          {/* Tabs */}
          <p className="text-[12px] font-bold text-gray-700 mb-2">Choose a sign-in method</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {/* Username & Password */}
            <button type="button" onClick={() => switchTab("password")}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl border text-center transition-all ${tab === "password" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="text-[9.5px] font-bold leading-tight">Username &amp; Password</span>
            </button>
            {/* Email OTP */}
            <button type="button" onClick={() => switchTab("email")}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl border text-center transition-all ${tab === "email" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span className="text-[9.5px] font-bold leading-tight">Email OTP</span>
            </button>
            {/* Phone OTP (disabled) */}
            <button type="button" disabled title="Coming Soon"
              className="relative flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl border border-gray-200 text-gray-300 cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" /></svg>
              <span className="text-[9.5px] font-bold leading-tight">Phone OTP</span>
              <span className="absolute -top-2 -right-1 bg-amber-100 text-amber-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-amber-200">Soon</span>
            </button>
          </div>

          {error && (
            <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
              <span className="text-xs mt-0.5">⚠️</span>
              <p className="text-[11px] font-medium">{error}</p>
            </div>
          )}

          {/* ── PASSWORD TAB ── */}
          {tab === "password" && (
            <form onSubmit={handleLogin} className="space-y-3">
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-[13px] bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none placeholder:text-gray-400 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-semibold text-gray-700">Password</label>
                  <a href={`${BASE}/forgot-password`} className="text-[11px] text-purple-600 font-semibold hover:text-purple-700">Forgot password?</a>
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
                    className="w-full pl-10 pr-16 py-2.5 border border-gray-200 rounded-xl text-[13px] bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none placeholder:text-gray-400 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-400 hover:text-gray-600">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button type="submit" disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-purple-600 via-purple-600 to-pink-500 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-[13px] shadow-lg shadow-purple-300/30 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {isLoggingIn ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in to Admin Portal</span>
                )}
              </button>
            </form>
          )}

          {/* ── EMAIL OTP TAB ── */}
          {tab === "email" && (
            <div className="space-y-3">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <input type="email" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} placeholder="Enter your email" autoComplete="email"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-[13px] bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none placeholder:text-gray-400 transition-all" />
                    </div>
                  </div>
                  <button type="submit" disabled={sendingOtp}
                    className="w-full bg-gradient-to-r from-purple-600 via-purple-600 to-pink-500 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-[13px] shadow-lg shadow-purple-300/30 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {sendingOtp ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send OTP</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5">
                    <p className="text-[12px] text-purple-700">Code sent to <span className="font-bold">{otpEmail}</span></p>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Enter OTP</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <input type="text" inputMode="numeric" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))} placeholder="Enter the code" autoComplete="one-time-code"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-[14px] tracking-[0.3em] bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none placeholder:text-gray-400 placeholder:tracking-normal transition-all" />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[11px] text-gray-400">Sent to {otpEmail}</span>
                      {secondsLeft > 0 ? (
                        <span className="text-[11px] text-gray-500 font-medium">Expires in {fmtTime(secondsLeft)}</span>
                      ) : (
                        <button type="button" onClick={handleSendOtp} disabled={sendingOtp} className="text-[11px] text-purple-600 font-semibold hover:text-purple-700 disabled:opacity-60">
                          {sendingOtp ? "Resending..." : "Resend OTP"}
                        </button>
                      )}
                    </div>
                  </div>
                  {secondsLeft > 0 && (
                    <button type="submit" disabled={isLoggingIn}
                      className="w-full bg-gradient-to-r from-purple-600 via-purple-600 to-pink-500 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-[13px] shadow-lg shadow-purple-300/30 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                      {isLoggingIn ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify &amp; Sign in</span>
                      )}
                    </button>
                  )}
                  {secondsLeft === 0 && (
                    <p className="text-[11px] text-center text-red-500">OTP expired. Please resend a new code.</p>
                  )}
                </form>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* MR Login link */}
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/login`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            <span className="text-[13px] text-gray-600">Medical Rep?</span>
            <span className="text-[13px] text-purple-600 font-bold">Sign in here</span>
          </a>

          {/* Security footer */}
          <div className="mt-4 flex items-start gap-2">
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

          <p className="mt-4 text-center text-[10px] text-gray-400">© 2025 MRx Pharma. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
