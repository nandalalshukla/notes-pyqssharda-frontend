import { NextRequest, NextResponse } from "next/server";
import { getServerAuthCookies, safeReturnTo } from "@/lib/server/auth";

const backendOrigin = (process.env.BACKEND_ORIGIN || "http://localhost:5000").replace(/\/$/, "");

function redirectToLogin(request: NextRequest, loginUrl: URL) {
  const response = NextResponse.redirect(loginUrl, 303);
  const secure = request.nextUrl.protocol === "https:";
  for (const name of ["accessToken", "refreshToken"]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("next", returnTo);
  return NextResponse.redirect(loginUrl, 303);
}

export async function POST(request: NextRequest) {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") {
    return new NextResponse("Invalid request origin", {
      status: 403,
      headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
    });
  }

  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));
  const { accessToken, refreshToken } = await getServerAuthCookies();
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("next", returnTo);

  if (!refreshToken) return redirectToLogin(request, loginUrl);

  try {
    const upstream = await fetch(`${backendOrigin}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: {
        Cookie: [
          accessToken && `accessToken=${encodeURIComponent(accessToken)}`,
          `refreshToken=${encodeURIComponent(refreshToken)}`,
        ].filter(Boolean).join("; "),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!upstream.ok) return redirectToLogin(request, loginUrl);

    const response = NextResponse.redirect(new URL(returnTo, request.url), 303);
    for (const cookie of upstream.headers.getSetCookie()) {
      response.headers.append("Set-Cookie", cookie);
    }
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return new NextResponse("Authentication service is temporarily unavailable. Please try again.", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "30" },
    });
  }
}
