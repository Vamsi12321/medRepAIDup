import { logout } from "@/lib/auth";

const apiRequest = async ({ url, method = "GET", data = null, headers = {}, params = null }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // Check token expiry before making the request
  if (typeof window !== "undefined") {
    const expiry = localStorage.getItem("token_expiry");
    if (expiry && Date.now() > parseInt(expiry)) {
      logout(); // no router — will use window.location
      return;
    }
  }

  const fullUrl = params ? `${url}?${new URLSearchParams(params)}` : url;
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  const config = {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
  };

  if (data) config.body = isFormData ? data : JSON.stringify(data);

  const response = await fetch(fullUrl, config);

  // 401 = token rejected by server — force logout
  if (response.status === 401) {
    if (typeof window !== "undefined") logout();
    return;
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message = err.detail?.[0]?.msg || err.detail || "API error";
    throw Object.assign(new Error(message), { status: response.status, data: err });
  }

  return response.json();
};

export const get    = (url, params) => apiRequest({ url, params });
export const post   = (url, data)   => apiRequest({ url, method: "POST",   data });
export const put    = (url, data)   => apiRequest({ url, method: "PUT",    data });
export const patch  = (url, data)   => apiRequest({ url, method: "PATCH",  data });
export const del    = (url, data)   => apiRequest({ url, method: "DELETE", data });
export const upload = (url, data)   => apiRequest({ url, method: "POST",   data });

export default apiRequest;
