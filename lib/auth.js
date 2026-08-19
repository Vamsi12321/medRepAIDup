const KEYS = ["access_token", "token_type", "token_expiry", "userEmail", "userName",
               "userId", "apiRole", "userRole", "userDepartment", "companyName"];

function clearSession() {
  KEYS.forEach((k) => localStorage.removeItem(k));
  document.cookie = "access_token=; path=/; max-age=0";
  document.cookie = "userRole=; path=/; max-age=0";
}

export function logout(router) {
  clearSession();
  if (router) {
    router.push("/login");
  } else {
    window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH || '') + "/login";
  }
}

// Called when token expires mid-session — shows overlay before redirect
export function sessionExpired() {
  clearSession();
  // Dispatch custom event — SessionExpiredOverlay listens for this
  window.dispatchEvent(new CustomEvent("session-expired"));
}

// Returns true if token is present and not expired
export function isTokenValid() {
  if (typeof window === "undefined") return false;
  const token  = localStorage.getItem("access_token");
  const expiry = localStorage.getItem("token_expiry");
  if (!token || !expiry) return false;
  return Date.now() < parseInt(expiry);
}
