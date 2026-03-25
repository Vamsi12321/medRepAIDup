const KEYS = ["access_token", "token_type", "token_expiry", "userEmail", "userName",
               "userId", "apiRole", "userRole", "companyName"];

export function logout(router) {
  KEYS.forEach((k) => localStorage.removeItem(k));
  document.cookie = "access_token=; path=/; max-age=0";
  document.cookie = "userRole=; path=/; max-age=0";

  if (router) {
    router.push("/login");
  } else {
    window.location.href = "/login";
  }
}

// Returns true if token is present and not expired
export function isTokenValid() {
  if (typeof window === "undefined") return false;
  const token  = localStorage.getItem("access_token");
  const expiry = localStorage.getItem("token_expiry");
  if (!token || !expiry) return false;
  return Date.now() < parseInt(expiry);
}
