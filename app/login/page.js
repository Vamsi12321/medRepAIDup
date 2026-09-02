"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ROLE = "MR";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function MRLogin() {
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
    document.cookie = `userRole=mr; path=/; max-age=3600; SameSite=Lax`;

    // Call /auth/me to get real user info from platform DB
    const meRes = await fetch(BASE + "/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = meRes.ok ? await meRes.json() : {};

    localStorage.setItem("userEmail", user.email || email || otpEmail);
    localStorage.setItem("userName", user.name || user.full_name || user.email || email || otpEmail);
    localStorage.setItem("userId", user._id || user.id || "");
    localStorage.setItem("apiRole", user.role || ROLE);
    localStorage.setItem("userRole", "mr");
    localStorage.setItem("userDepartment", user.department || "");
    localStorage.setItem("companyName", user.company_name || "");

    setLoggedInUser(user.name || user.full_name || user.email || email || otpEmail);
    setLoginSuccess(true);
    setIsLoggingIn(false);

    if (user.must_change_password) {
      setTimeout(() => router.push("/change-password"), 1800);
    } else {
      setTimeout(() => router.push("/mr/dashboard"), 1800);
    }
  };

  // ── Password login (existing flow) ───────────────────────────────────────
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
    <div className="h-screen w-screen overflow-hidden flex bg-[#1a0a3e] lg:flex-row flex-col">
      {/* Success overlay */}
      {loginSuccess && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#1a0a3e] via-[#2d1b69] to-[#4a1d96] z-50 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-6 mx-auto animate-bounce">
              <span className="text-5xl">💊</span>
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

      {/* LEFT SIDE */}
      <div className="hidden lg:block lg:w-[56%] relative overflow-hidden">
        {/* Decorative particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[8%] left-[25%] w-1 h-1 bg-purple-400/40 rounded-full" />
          <div className="absolute top-[12%] left-[55%] w-1.5 h-1.5 bg-purple-300/30 rounded-full" />
          <div className="absolute top-[25%] left-[75%] w-1 h-1 bg-purple-400/40 rounded-full" />
          <div className="absolute top-[45%] left-[10%] w-1 h-1 bg-purple-300/30 rounded-full" />
          <div className="absolute top-[60%] left-[65%] w-1.5 h-1.5 bg-purple-400/20 rounded-full" />
          <div className="absolute top-[80%] left-[35%] w-1 h-1 bg-purple-300/30 rounded-full" />
          <div className="absolute top-[5%] left-[45%] w-[2px] h-[2px] bg-white/20 rounded-full" />
          <div className="absolute top-[35%] left-[85%] w-[2px] h-[2px] bg-white/20 rounded-full" />
        </div>

        <div className="h-full flex flex-col px-8 xl:px-10 py-5 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/40">
              <span className="text-lg">💊</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">MRx</p>
              <p className="text-purple-300/80 text-[12px]">Pharma. Data. Performance.</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mt-6 mb-1">
            <p className="text-white font-bold text-[15px] leading-tight">MRx for</p>
            <h1 className="text-white font-extrabold text-[1.5rem] xl:text-[1.75rem] leading-[1.15]">
              Medical <span className="text-purple-300">Representatives</span>
            </h1>
          </div>

          <p className="text-purple-200/60 text-[12px] mb-4 max-w-[280px] leading-relaxed">
            Your complete field engagement and productivity platform — in your pocket.
          </p>

          {/* Features + Phone */}
          <div className="flex flex-1 min-h-0 items-stretch">
            {/* Features */}
            <div className="space-y-2 w-[230px] xl:w-[260px] flex-shrink-0 self-center">
              {[
                { icon: "📅", title: "My Schedule & Visits", desc: "Plan your day, manage doctor visits and check-in on the move." },
                { icon: "📊", title: "MCR & Reporting", desc: "Submit MCRs, activity reports and manage your commitments." },
                { icon: "💊", title: "Product & Resources", desc: "Access latest product information, brochures, and digital aids." },
                { icon: "📈", title: "Performance Dashboard", desc: "Track your achievements, targets, and performance in real-time." },
                { icon: "🛡️", title: "Secure & Reliable", desc: "Enterprise-grade security to keep your data safe and your journey worry-free." },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{f.icon}</span>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-white text-[11.5px] font-bold leading-tight">{f.title}</p>
                    <p className="text-purple-200/50 text-[9.5px] leading-snug mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Phone image with decorative elements */}
            <div className="flex-1 flex items-center justify-end relative overflow-visible">
              {/* Location pins connected to phone with dotted lines */}
              <svg className="absolute top-[5%] left-[28%] w-5 h-7 z-20 opacity-70" viewBox="0 0 24 36" fill="none">
                <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="#a855f7"/>
                <circle cx="12" cy="12" r="4" fill="#1a0a3e"/>
              </svg>
              <div className="absolute top-[9%] left-[36%] w-1 h-1 bg-purple-400/60 rounded-full z-20" />
              <div className="absolute top-[10%] left-[43%] w-1 h-1 bg-purple-400/50 rounded-full z-20" />
              <div className="absolute top-[11%] left-[50%] w-1 h-1 bg-purple-400/40 rounded-full z-20" />
              <div className="absolute top-[12%] left-[57%] w-1 h-1 bg-purple-400/30 rounded-full z-20" />

              <svg className="absolute top-[30%] left-[21%] w-4.5 h-6 z-20 opacity-55" viewBox="0 0 24 36" fill="none">
                <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="#c084fc"/>
                <circle cx="12" cy="12" r="4" fill="#1a0a3e"/>
              </svg>
              <div className="absolute top-[33%] left-[30%] w-1 h-1 bg-purple-300/50 rounded-full z-20" />
              <div className="absolute top-[33.5%] left-[38%] w-1 h-1 bg-purple-300/40 rounded-full z-20" />
              <div className="absolute top-[34%] left-[46%] w-1 h-1 bg-purple-300/30 rounded-full z-20" />
              <div className="absolute top-[34.5%] left-[54%] w-1 h-1 bg-purple-300/25 rounded-full z-20" />

              <svg className="absolute top-[55%] left-[24%] w-4 h-5.5 z-20 opacity-45" viewBox="0 0 24 36" fill="none">
                <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="#9333ea"/>
                <circle cx="12" cy="12" r="4" fill="#1a0a3e"/>
              </svg>
              <div className="absolute top-[57%] left-[32%] w-1 h-1 bg-purple-400/40 rounded-full z-20" />
              <div className="absolute top-[56.5%] left-[40%] w-1 h-1 bg-purple-400/30 rounded-full z-20" />
              <div className="absolute top-[56%] left-[48%] w-1 h-1 bg-purple-400/25 rounded-full z-20" />
              <div className="absolute top-[55.5%] left-[56%] w-1 h-1 bg-purple-400/20 rounded-full z-20" />

              <Image
                src={`${BASE}/images/mr/phone.png`}
                alt="MRx App"
                width={500}
                height={950}
                className="object-contain h-[120%] w-auto max-w-[120%] drop-shadow-[0_25px_70px_rgba(120,60,220,0.4)] relative z-10 translate-x-28"
                priority
              />
            </div>
          </div>

          {/* Bottom tagline */}
          <div className="border-l-[3px] border-purple-500 pl-3 mt-3">
            <p className="text-purple-200/60 text-[12px]">
              Empowering <span className="text-green-400 font-bold italic">every</span> MR. Driving <span className="text-green-400 font-bold italic">every</span> connection.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - White background */}
      <div className="w-full lg:w-[44%] flex flex-col items-center justify-center px-4 sm:px-6 py-4 relative overflow-y-auto bg-white">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-4 lg:hidden">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-sm">💊</span>
          </div>
          <div>
            <p className="text-gray-900 font-bold text-base leading-none">MRx</p>
            <p className="text-gray-400 text-[10px]">Pharma. Data. Performance.</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[440px] px-4 py-2">
          {/* "A product of Proxzar" */}
          <div className="flex items-center justify-end gap-2 mb-2">
            <span className="text-[10px] text-gray-400">A product of</span>
            <span className="text-gray-200">|</span>
            <Image
              src={`${BASE}/images/mr/proxzarmainlogo.png`}
              alt="Proxzar"
              width={80}
              height={22}
              className="object-contain h-5 w-auto"
              priority
            />
          </div>

          {/* Title */}
          <div className="mb-3">
            <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-400 text-[11px] mt-0.5">Sign in with your Proxzar account</p>
          </div>

          {/* Card wrapper */}
          <div className="border border-gray-200 rounded-2xl p-4">
            <p className="text-[12px] font-bold text-gray-700 mb-2.5">Choose a sign-in method</p>

            {/* Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {/* Username & Password */}
              <button
                type="button"
                onClick={() => switchTab("password")}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1.5 rounded-xl border text-center transition-all ${
                  tab === "password"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[10px] font-bold leading-tight">Username &amp; Password</span>
              </button>

              {/* Email OTP */}
              <button
                type="button"
                onClick={() => switchTab("email")}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1.5 rounded-xl border text-center transition-all ${
                  tab === "email"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-bold leading-tight">Email OTP</span>
              </button>

              {/* Phone OTP (disabled) */}
              <button
                type="button"
                disabled
                title="Coming Soon"
                className="relative flex flex-col items-center justify-center gap-1 py-2.5 px-1.5 rounded-xl border border-gray-200 text-gray-300 cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                </svg>
                <span className="text-[10px] font-bold leading-tight">Phone OTP</span>
                <span className="absolute -top-2 -right-1 bg-amber-100 text-amber-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-amber-200">Soon</span>
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-2.5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
                <span className="text-xs mt-0.5">⚠️</span>
                <p className="text-[11px] font-medium">{error}</p>
              </div>
            )}

            {/* ── PASSWORD TAB ── */}
            {tab === "password" && (
              <form onSubmit={handleLogin} className="space-y-2.5">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Username</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter username"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none placeholder:text-gray-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-16 py-2 border border-gray-200 rounded-lg text-[13px] bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none placeholder:text-gray-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <a href={`${BASE}/forgot-password`} className="text-[11px] text-purple-600 font-semibold hover:text-purple-700">Forgot password?</a>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 text-[13px] shadow-lg shadow-purple-500/20 hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                    <span>Sign in to access your portal</span>
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
                      <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Email Address</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          placeholder="Enter your email"
                          autoComplete="email"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none placeholder:text-gray-400 transition-all"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={sendingOtp}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 text-[13px] shadow-lg shadow-purple-500/20 hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {sendingOtp ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send OTP</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 flex items-center justify-between">
                      <p className="text-[11px] text-purple-700">Code sent to <span className="font-bold">{otpEmail}</span></p>
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Enter OTP</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter the 6-digit code"
                          autoComplete="one-time-code"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] tracking-[0.3em] bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none placeholder:text-gray-400 placeholder:tracking-normal transition-all"
                        />
                      </div>
                      {/* Timer / Resend */}
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[11px] text-gray-400">Sent to {otpEmail}</span>
                        {secondsLeft > 0 ? (
                          <span className="text-[11px] text-gray-500 font-medium">Expires in {fmtTime(secondsLeft)}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp}
                            className="text-[11px] text-purple-600 font-semibold hover:text-purple-700 disabled:opacity-60"
                          >
                            {sendingOtp ? "Resending..." : "Resend OTP"}
                          </button>
                        )}
                      </div>
                    </div>

                    {secondsLeft > 0 && (
                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 text-[13px] shadow-lg shadow-purple-500/20 hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isLoggingIn ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <span>Verify & Sign in</span>
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

            {/* ── PHONE OTP TAB (never active — disabled) ── */}
          </div>

          {/* Company Login link */}
          <a
            href={`${BASE}/admin/login`}
            className="mt-2.5 w-full flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">Company Login</p>
                <p className="text-[10px] text-gray-400">For Admin / Management access</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* Footer */}
          <div className="mt-2.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secured by Proxzar Authentication</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
