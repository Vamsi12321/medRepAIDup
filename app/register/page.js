"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const DATA_SOURCE = "MRx";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-[#1a0a3e]"><div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full" /></div>}>
      <MRRegister />
    </Suspense>
  );
}

function MRRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  // step: "form" | "otp" | "done"
  const [step, setStep] = useState("form");

  const [form, setForm] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Prefill email if the invite link includes it
  useEffect(() => {
    const inviteEmail = searchParams.get("email");
    if (inviteEmail) setForm((f) => ({ ...f, email: inviteEmail }));
  }, [searchParams]);

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const friendlyError = (raw) =>
    Array.isArray(raw)
      ? raw.map((d) => (typeof d === "string" ? d : d.msg || JSON.stringify(d))).join(", ")
      : String(raw || "Something went wrong. Please try again.");

  const validateForm = () => {
    if (!token) return "Invalid or missing invitation token.";
    if (!/^[a-z0-9_]{3,30}$/.test(form.username)) return "Username must be 3-30 characters, only lowercase letters, numbers, and underscores.";
    if (form.full_name.trim().length < 2 || form.full_name.trim().length > 100) return "Full name must be 2-100 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
    const phoneDigits = form.phone.replace(/\D/g, "").replace(/^91/, "");
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) return "Phone must be a valid 10-digit Indian mobile number.";
    const pwd = form.password;
    if (pwd.length < 8 || pwd.length > 64) return "Password must be 8-64 characters.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least 1 uppercase letter.";
    if (!/[a-z]/.test(pwd)) return "Password must contain at least 1 lowercase letter.";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least 1 number.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return "Password must contain at least 1 symbol.";
    if (pwd !== form.confirmPassword) return "Passwords do not match.";
    return "";
  };

  const phoneWithCode = () => {
    const digits = form.phone.replace(/\D/g, "").replace(/^91/, "");
    return `+91${digits}`;
  };

  // ── Step 1: Register (Proxzar) → sends OTP to email ──────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    const v = validateForm();
    if (v) { setError(v); return; }
    setSubmitting(true);
    try {
      const res = await fetch(BASE + "/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserName: form.username.trim(),
          UserPassword: form.password,
          UserFullName: form.full_name.trim(),
          UserEmail: form.email.trim(),
          UserPhone: phoneWithCode(),
          DataSource: DATA_SOURCE,
          EmailVerified: false,
          PhoneVerified: false,
          CallbackUrl: typeof window !== "undefined" ? window.location.origin + BASE + "/login" : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(friendlyError(data.detail || data.message));
        setSubmitting(false);
        return;
      }
      setStep("otp");
      setOtpCode("");
    } catch {
      setError("Unable to connect to server. Please try again.");
    }
    setSubmitting(false);
  };

  // ── Step 2: Verify Email OTP (Proxzar) → permanent registration ──────────
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (!otpCode) { setError("Please enter the OTP sent to your email."); return; }
    setSubmitting(true);
    try {
      const res = await fetch(BASE + "/api/v1/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserEmail: form.email.trim(), OTP: otpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(friendlyError(data.detail || data.message));
        setSubmitting(false);
        return;
      }

      // ── STEP 3: Register in MRX platform (token authorizes the request) ──
      const platformRes = await fetch(BASE + "/api/v1/mrs/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          username: form.username.trim(),
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.replace(/\D/g, "").replace(/^91/, ""),
        }),
      });
      const platformData = await platformRes.json();
      if (!platformRes.ok) {
        setError(friendlyError(platformData.detail || platformData.message));
        setSubmitting(false);
        return;
      }

      setStep("done");
      setSubmitting(false);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Unable to connect to server. Please try again.");
      setSubmitting(false);
    }
  };

  // ── Resend OTP: re-run register ──────────────────────────────────────────
  const handleResend = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(BASE + "/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserName: form.username.trim(),
          UserPassword: form.password,
          UserFullName: form.full_name.trim(),
          UserEmail: form.email.trim(),
          UserPhone: phoneWithCode(),
          DataSource: DATA_SOURCE,
          EmailVerified: false,
          PhoneVerified: false,
          CallbackUrl: typeof window !== "undefined" ? window.location.origin + BASE + "/login" : "",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(friendlyError(data.detail || data.message));
      }
    } catch {
      setError("Failed to resend OTP. Please try again.");
    }
    setSubmitting(false);
  };

  const inputCls = "w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-[12.5px] bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none placeholder:text-gray-400 transition-all";

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white lg:flex-row flex-col">
      {/* LEFT SIDE — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex-col px-8 xl:px-12 py-8">
        {/* Decorative blobs */}
        <div className="absolute top-[-60px] right-[-60px] w-56 h-56 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 bg-indigo-200/30 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-300/40">
            <span className="text-lg">💊</span>
          </div>
          <div>
            <p className="text-gray-900 font-bold text-lg leading-none">MRx</p>
            <p className="text-gray-400 text-[11px]">Medical Representative</p>
          </div>
        </div>

        {/* Headline */}
        <div className="mt-8 relative z-10">
          <h1 className="text-gray-900 font-extrabold text-2xl xl:text-[1.7rem] leading-tight">Welcome to MRx</h1>
          <p className="text-gray-500 text-[13px] mt-2 max-w-[260px] leading-relaxed">
            Complete your registration to get started with your medical representative account.
          </p>
        </div>

        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center relative z-10 min-h-0">
          <Image
            src={`${BASE}/images/mr/notepad-register.png`}
            alt="Register"
            width={340}
            height={340}
            className="object-contain max-h-[300px] w-auto drop-shadow-[0_20px_50px_rgba(120,60,220,0.2)]"
            priority
          />
        </div>

        {/* Feature icons */}
        <div className="grid grid-cols-3 gap-3 relative z-10">
          {[
            { icon: "🔒", title: "Secure", desc: "Your data is always protected" },
            { icon: "⚡", title: "Fast", desc: "Quick and easy registration" },
            { icon: "🤝", title: "Support", desc: "We're here to help you" },
          ].map((f) => (
            <div key={f.title}>
              <div className="flex items-center gap-1.5 text-purple-600 mb-1">
                <span className="text-sm">{f.icon}</span>
                <span className="text-[12px] font-bold">{f.title}</span>
              </div>
              <p className="text-gray-400 text-[9.5px] leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE — form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 py-3 relative overflow-y-auto bg-white">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-4 lg:hidden">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-sm">💊</span>
          </div>
          <div>
            <p className="text-gray-900 font-bold text-base leading-none">MRx</p>
            <p className="text-gray-400 text-[10px]">Medical Representative</p>
          </div>
        </div>

        <div className="w-full max-w-[440px]">
          {step === "done" ? (
            /* ── DONE ── */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-500 text-sm max-w-[320px] mx-auto">
                Your registration is complete. Your profile will be finalized by the admin. Redirecting to login...
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-5">
                {[0, 150, 300].map((d) => (
                  <div key={d} className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Title */}
              <div className="mb-3">
                <h2 className="text-xl font-bold text-gray-900">
                  {step === "form" ? "Complete your registration" : "Verify your email"}
                </h2>
                <p className="text-gray-400 text-[12px] mt-0.5">
                  {step === "form" ? "Fill in your details to activate your account" : `Enter the OTP sent to ${form.email}`}
                </p>
              </div>

              {/* No token warning */}
              {step === "form" && !token && (
                <div className="mb-3 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg">
                  <span className="text-xs mt-0.5">⚠️</span>
                  <p className="text-[11px] font-medium">This registration link is invalid or missing its token. Please use the link from your invitation email.</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
                  <span className="text-xs mt-0.5">⚠️</span>
                  <p className="text-[11px] font-medium">{error}</p>
                </div>
              )}

              {/* ── STEP 1: FORM ── */}
              {step === "form" && (
                <form onSubmit={handleRegister} className="space-y-2">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <input type="text" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Rajesh Kumar" className={inputCls} />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Username</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <input type="text" value={form.username} onChange={(e) => update("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="rajesh_kumar" className={inputCls} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="rajesh@pharma.com" className={inputCls} />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Phone</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </div>
                      <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="9876543210" className={inputCls} />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Create a password" className="w-full pl-10 pr-16 py-2 border border-gray-200 rounded-lg text-[12.5px] bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none placeholder:text-gray-400 transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-400 hover:text-gray-600">{showPassword ? "Hide" : "Show"}</button>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5">Min 8 chars · 1 upper · 1 lower · 1 number · 1 symbol</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Re-enter your password" className={inputCls} />
                    </div>
                  </div>

                  <button type="submit" disabled={submitting || !token} className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-[14px] shadow-lg shadow-purple-500/20 hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1">
                    {submitting ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <span>Complete Registration</span>
                    )}
                  </button>
                </form>
              )}

              {/* ── STEP 2: OTP VERIFY ── */}
              {step === "otp" && (
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5">
                    <p className="text-[12px] text-purple-700">We sent a verification code to <span className="font-bold">{form.email}</span></p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Email OTP</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <input type="text" inputMode="numeric" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))} placeholder="Enter the code" autoComplete="one-time-code" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-[14px] tracking-[0.3em] bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none placeholder:text-gray-400 placeholder:tracking-normal transition-all" />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <button type="button" onClick={() => { setStep("form"); setError(""); }} className="text-[11px] text-gray-500 font-semibold hover:text-gray-700">← Edit details</button>
                      <button type="button" onClick={handleResend} disabled={submitting} className="text-[11px] text-purple-600 font-semibold hover:text-purple-700 disabled:opacity-60">Resend OTP</button>
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-[14px] shadow-lg shadow-purple-500/20 hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitting ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify Email</span>
                    )}
                  </button>
                </form>
              )}

              {/* Footer */}
              <div className="mt-3 text-center">
                <p className="text-[12px] text-gray-400">
                  Already have an account?{" "}
                  <a href={`${BASE}/login`} className="text-purple-600 font-semibold hover:text-purple-700">Sign in</a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
