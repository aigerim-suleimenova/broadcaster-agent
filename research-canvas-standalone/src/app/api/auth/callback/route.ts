import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}?auth_error=${encodeURIComponent(error)}`,
      );
    }

    if (code) {
      // Redirect to home page with code in query param
      // The frontend will then make a POST request to /api/auth/token
      return NextResponse.redirect(
        `${request.nextUrl.origin}?code=${encodeURIComponent(code)}`,
      );
    }

    return NextResponse.redirect(request.nextUrl.origin);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}?auth_error=callback_error`,
    );
  }
}
