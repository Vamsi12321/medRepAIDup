import { logout, sessionExpired } from "@/lib/auth";

const apiRequest = async ({ url, method = "GET", data = null, headers = {}, params = null }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // Check token expiry before making the request
  if (typeof window !== "undefined") {
    const expiry = localStorage.getItem("token_expiry");
    if (expiry && Date.now() > parseInt(expiry)) {
      sessionExpired();
      throw new Error("Session expired. Please log in again.");
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

  // 401 = token rejected by server — show session expired overlay
  if (response.status === 401) {
    if (typeof window !== "undefined") sessionExpired();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    // detail can be a string, an array of strings, or an array of FastAPI validation objects
    let message = "API error";
    if (typeof err.detail === "string") {
      message = err.detail;
    } else if (Array.isArray(err.detail)) {
      // FastAPI 422 validation errors: [{msg, loc, type, ...}]
      message = err.detail.map((d) => (typeof d === "string" ? d : d.msg || JSON.stringify(d))).join(", ");
    } else if (err.message) {
      message = err.message;
    }
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
