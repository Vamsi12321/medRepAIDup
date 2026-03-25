const BACKEND = process.env.BACKEND_URL;

async function forward(req, { params }) {
  const { path: segments } = await params;
  const path = segments.join("/");
  const { searchParams } = new URL(req.url);
  const query = searchParams.toString();
  const url = `${BACKEND}/api/v1/${path}${query ? "?" + query : ""}`;

  const method = req.method;
  const auth = req.headers.get("authorization") || "";

  let body;
  if (method !== "GET" && method !== "DELETE") {
    try { body = await req.json(); } catch { body = undefined; }
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { detail: text }; }
  return Response.json(data, { status: res.status });
}

export async function GET(req, ctx) { return forward(req, ctx); }
export async function POST(req, ctx) { return forward(req, ctx); }
export async function PUT(req, ctx) { return forward(req, ctx); }
export async function DELETE(req, ctx) { return forward(req, ctx); }
export async function PATCH(req, ctx) { return forward(req, ctx); }
