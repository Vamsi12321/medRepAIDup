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

  // Forward CSV/binary responses as-is without JSON parsing
  const resContentType = res.headers.get("content-type") || "";
  if (resContentType.includes("text/csv") || resContentType.includes("application/octet-stream") || resContentType.includes("text/plain")) {
    const blob = await res.blob();
    return new Response(blob, {
      status: res.status,
      headers: {
        "Content-Type": resContentType,
        "Content-Disposition": res.headers.get("content-disposition") || "attachment",
      },
    });
  }

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
