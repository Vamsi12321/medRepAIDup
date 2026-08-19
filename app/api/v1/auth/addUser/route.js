const AUTH_BASE = (process.env.NEXT_PUBLIC_AUTH_URL || "https://oauth2.proxzar.ai/api/v1/token").replace("/token", "");

export async function POST(req) {
  try {
    const body = await req.json();

    const res = await fetch(`${AUTH_BASE}/addUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err) {
    return Response.json({ detail: `Auth proxy error: ${err.message}` }, { status: 502 });
  }
}
