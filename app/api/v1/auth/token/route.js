const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "https://oauth2.proxzar.ai/api/v1/token";

export async function POST(req) {
  try {
    const body = await req.text();

    const res = await fetch(AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err) {
    return Response.json({ detail: `Auth proxy error: ${err.message}` }, { status: 502 });
  }
}
