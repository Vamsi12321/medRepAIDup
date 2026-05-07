const BACKEND = process.env.BACKEND_URL;

async function forward(req, { params }) {
  // Guard — if BACKEND_URL not set, return clear error
  if (!BACKEND) {
    console.error("[proxy] BACKEND_URL is not set in environment");
    return Response.json({ detail: "Proxy misconfigured: BACKEND_URL not set" }, { status: 500 });
  }

  const { path: segments } = await params;
  const path = segments.join("/");
  const { searchParams } = new URL(req.url);
  const query = searchParams.toString();
  const url = `${BACKEND}/api/v1/${path}${query ? "?" + query : ""}`;

  const method = req.method;
  const auth = req.headers.get("authorization") || "";
  const contentType = req.headers.get("content-type") || "";

  const forwardHeaders = {
    Authorization: auth,
    "ngrok-skip-browser-warning": "true",
    "User-Agent": "MedRepAI-Proxy/1.0",
  };

  let body;

  if (method !== "GET" && method !== "HEAD" && method !== "DELETE") {
    if (contentType.includes("multipart/form-data")) {
      // Forward FormData as-is — browser sets Content-Type with boundary
      body = await req.formData();
    } else {
      // Read raw body text — avoids req.json() stream consumption issues
      const rawText = await req.text();
      if (rawText && rawText.trim()) {
        body = rawText;
        forwardHeaders["Content-Type"] = "application/json";
      }
    }
  }

  const res = await fetch(url, {
    method,
    headers: forwardHeaders,
    redirect: "follow",
    ...(body !== undefined ? { body } : {}),
  });

  // Forward binary/CSV/PDF responses as-is
  const resContentType = res.headers.get("content-type") || "";
  if (
    resContentType.includes("text/csv") ||
    resContentType.includes("application/octet-stream") ||
    resContentType.includes("application/pdf") ||
    resContentType.includes("text/plain")
  ) {
    const blob = await res.blob();
    const disposition = res.headers.get("content-disposition") || "attachment; filename=brochure.pdf";
    return new Response(blob, {
      status: res.status,
      headers: {
        "Content-Type": resContentType,
        "Content-Disposition": disposition,
      },
    });
  }

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { detail: text }; }

  if (!res.ok) {
    console.error(`[proxy] ${method} ${url} → ${res.status}`, JSON.stringify(data));
  }

  return Response.json(data, { status: res.status });
}

export async function GET(req, ctx)    { return forward(req, ctx); }
export async function POST(req, ctx)   { return forward(req, ctx); }
export async function PUT(req, ctx)    { return forward(req, ctx); }
export async function DELETE(req, ctx) { return forward(req, ctx); }
export async function PATCH(req, ctx)  { return forward(req, ctx); }
