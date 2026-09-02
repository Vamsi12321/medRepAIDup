const PROXZAR_AUTH_URL = process.env.PROXZAR_AUTH_URL || "https://oauth2.proxzar.ai";
const OTP_URL = `${PROXZAR_AUTH_URL}/api/v1/requestOAuth2OTP`;

export async function POST(req) {
  try {
    const body = await req.json();

    const res = await fetch(OTP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err) {
    return Response.json({ detail: `Failed to send OTP. Please try again.` }, { status: 502 });
  }
}
