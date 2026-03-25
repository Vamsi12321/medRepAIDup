"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const roleRedirectMap = {
  proxzar_admin: "/admin/dashboard",
  admin:         "/admin/dashboard",
  doctor:        "/doctor/home",
  mr:            "/mr/dashboard",
  company:       "/company/overview",
  company_admin: "/company/overview",
};

const roleKeyMap = {
  proxzar_admin: "admin",
  admin:         "admin",
  doctor:        "doctor",
  mr:            "mr",
  company:       "company",
  company_admin: "company",
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter both email and password"); return; }
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.message || "Invalid email or password");
        setIsLoggingIn(false);
        return;
      }

      localStorage.setItem("access_token",  data.access_token);
      localStorage.setItem("token_type",    data.token_type);
      localStorage.setItem("token_expiry",  Date.now() + (data.expires_in || 3600) * 1000);
      localStorage.setItem("userEmail",     data.user.email);
      localStorage.setItem("userName",      data.user.name);
      localStorage.setItem("userId",        data.user.id);
      localStorage.setItem("apiRole",       data.role);
      localStorage.setItem("companyName",   data.company?.name || "My Company");

      const appRole = roleKeyMap[data.role] || data.role;
      localStorage.setItem("userRole", appRole);

      document.cookie = `access_token=${data.access_token}; path=/; max-age=3600; SameSite=Lax`;
      document.cookie = `userRole=${appRole}; path=/; max-age=3600; SameSite=Lax`;

      setLoggedInUser(data.user.name);
      setLoginSuccess(true);
      setIsLoggingIn(false);
      setTimeout(() => router.push(roleRedirectMap[data.role] || "/"), 1800);
    } catch {
      setError("Unable to connect to server. Please try again.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Success overlay */}
      {loginSuccess && (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 z-50 flex items-center justify-center">
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
            <p className="text-indigo-100 text-lg">Taking you to your dashboard...</p>
          </div>
        </div>
      )}

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute top-1/3 -right-20 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-white/5 rounded-full" />
        </div>

        <div className="relative">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💊</span>
            </div>
            <span className="text-2xl font-bold text-white">MedRepAI</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            MedRepAI Hub: Awareness & Collaboration
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Stay ahead with real-time drug launches, CME events, and a connected network of medical representatives and doctors.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative space-y-3">
          {[
            { icon: "💊", text: "Real-time drug launch updates" },
            { icon: "📅", text: "CME events & medical conferences" },
            { icon: "🤝", text: "Connected MR & doctor network" },
            { icon: "🔒", text: "Role-based secure access" },
          ].map((f) => (
            <div key={f.text} className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <span className="text-xl">{f.icon}</span>
              <span className="text-white font-medium">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center space-x-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow">
              <span className="text-xl">💊</span>
            </div>
            <span className="text-xl font-bold text-gray-900">MedRepAI</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
          <p className="text-gray-500 mb-8">Enter your credentials to access your portal</p>

          {error && (
            <div className="mb-6 flex items-start space-x-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <span className="text-lg mt-0.5">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white transition-all outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
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
                <span>Sign in to your account</span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Access is role-based and verified by the server.{" "}
            <span className="text-gray-400">Your portal is determined by your credentials.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
