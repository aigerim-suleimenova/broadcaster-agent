import { NextRequest, NextResponse } from "next/server";

/**
 * AG-UI Proxy: Forwards CopilotKit requests directly to the Pydantic AI backend.
 *
 * The Python agent at runtimeUrl handles AG-UI protocol communication.
 * This endpoint acts as a transparent proxy for all HTTP methods.
 */

async function forwardRequest(
  req: NextRequest,
  method: string,
): Promise<NextResponse> {
  try {
    const runtimeUrl = process.env.AGENT_RUNTIME_URL || "http://localhost:8000";

    // Get the path from the dynamic route parameter
    const { searchParams } = req.nextUrl;
    const pathParam = req.nextUrl.pathname.replace("/api/copilotkit", "");
    const targetUrl = `${runtimeUrl}${pathParam || "/"}${searchParams.toString() ? `?${searchParams}` : ""}`;

    // Read body if present (for POST, PUT, PATCH)
    let body: any = null;
    if (method !== "GET" && method !== "HEAD" && method !== "DELETE") {
      try {
        const text = await req.text();
        if (text) {
          body = text;
        }
      } catch {
        // No body or error reading — proceed without it
      }
    }

    // Forward the request to the backend
    const response = await fetch(targetUrl, {
      method,
      headers: {
        "Content-Type": req.headers.get("Content-Type") || "application/json",
        Accept: req.headers.get("Accept") || "application/json",
        // Forward other important headers
        ...(req.headers.get("User-Agent") && {
          "User-Agent": req.headers.get("User-Agent")!,
        }),
        ...(req.headers.get("Authorization") && {
          Authorization: req.headers.get("Authorization")!,
        }),
      },
      body:
        body && method !== "GET" && method !== "HEAD" && method !== "DELETE"
          ? body
          : undefined,
    });

    // Read and return the backend response
    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[AG-UI Proxy Error]", error);
    return NextResponse.json(
      { error: "Failed to proxy request to AG-UI backend" },
      { status: 502 },
    );
  }
}

export async function POST(req: NextRequest) {
  return forwardRequest(req, "POST");
}

export async function GET(req: NextRequest) {
  return forwardRequest(req, "GET");
}

export async function PUT(req: NextRequest) {
  return forwardRequest(req, "PUT");
}

export async function PATCH(req: NextRequest) {
  return forwardRequest(req, "PATCH");
}

export async function DELETE(req: NextRequest) {
  return forwardRequest(req, "DELETE");
}

export async function HEAD(req: NextRequest) {
  return forwardRequest(req, "HEAD");
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
      "Content-Type": "application/json",
    },
  });
}
