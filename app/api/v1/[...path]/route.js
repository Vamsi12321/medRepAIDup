const BACKEND = process.env.BACKEND_URL;

async function forward(req, { params }) {
  const { path: segments } = await params;
  const path = segments.join("/");
  const { searchParams } = new URL(req.url);
  const query = searchParams.toString();
  const url = `${BACKEND}/api/v1/${path}${query ? "?" + query : ""}`;

  const method = req.method;
  const auth   = req.headers.get("authorization") || "";
  const contentType = req.headers.get("content-type") || "";

  let body;
  let forwardHeaders = { Authorization: auth };

  if (method !== "GET" && method !== "DELETE") {
    if (contentType.includes("multipart/form-data")) {
      // Forward FormData as-is — do NOT set Content-Type (browser sets boundary automatically)
      body = await req.formData();
    } else {
      // JSON body
      try { body = JSON.stringify(await req.json()); } catch { body = undefined; }
      forwardHeaders["Content-Type"] = "application/json";
    }
  }

  const res = await fetch(url, {
    method,
    headers: forwardHeaders,
    ...(body !== undefined ? { body } : {}),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { detail: text }; }
  return Response.json(data, { status: res.status });
}

export async function GET(req, ctx)    { return forward(req, ctx); }
export async function POST(req, ctx)   { return forward(req, ctx); }
export async function PUT(req, ctx)    { return forward(req, ctx); }
export async function DELETE(req, ctx) { return forward(req, ctx); }
export async function PATCH(req, ctx)  { return forward(req, ctx); }
