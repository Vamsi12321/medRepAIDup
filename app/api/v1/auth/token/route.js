const PROXZAR_AUTH_URL = process.env.PROXZAR_AUTH_URL || "https://oauth2.proxzar.ai";
const TOKEN_URL = `${PROXZAR_AUTH_URL}/api/v1/token`;

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Forward FormData (OTP + password login via FormData) or urlencoded body as-is
    let fetchOptions = { method: "POST" };
    if (contentType.includes("multipart/form-data")) {
      // Rebuild FormData so fetch sets its own boundary header
      const incoming = await req.formData();
      const fd = new FormData();
      for (const [key, value] of incoming.entries()) fd.append(key, value);
      fetchOptions.body = fd;
    } else {
      const body = await req.text();
      fetchOptions.headers = { "Content-Type": "application/x-www-form-urlencoded" };
      fetchOptions.body = body;
    }

    const res = await fetch(TOKEN_URL, fetchOptions);
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err) {
    return Response.json({ detail: `Auth proxy error: ${err.message}` }, { status: 502 });
  }
}
