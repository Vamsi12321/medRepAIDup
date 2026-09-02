const PROXZAR_AUTH_URL = process.env.PROXZAR_AUTH_URL || "https://oauth2.proxzar.ai";
const REGISTER_URL = `${PROXZAR_AUTH_URL}/api/v1/register`;

export async function POST(req) {
  try {
    const body = await req.json();

    const res = await fetch(REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err) {
    return Response.json({ detail: `Registration failed. Please try again.` }, { status: 502 });
  }
}
