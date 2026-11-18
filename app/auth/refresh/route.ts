import { NextRequest, NextResponse } from "next/server";
import { getServerAuthCookies, safeReturnTo } from "@/lib/server/auth";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const backendOrigin = (process.env.BACKEND_ORIGIN || "http://localhost:5000").replace(/\/$/, "");
const refreshNonceCookie = "refresh_nonce";

function allowedRefreshOrigins(request: NextRequest): Set<string> {
  const origins = new Set([
    "https://sharda.social",
    "https://www.sharda.social",
  ]);

  for (const value of [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined,
  ]) {
    if (!value) continue;
    try {
      origins.add(new URL(value).origin);
    } catch {
      // Ignore malformed optional configuration.
    }
  }

  origins.add(request.nextUrl.origin);
  return origins;
}

function hasValidRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return allowedRefreshOrigins(request).has(new URL(origin).origin);
  } catch {
    return false;
  }
}

function hashesMatch(expected: string | undefined, supplied: string): boolean {
  if (!expected) return false;
  const expectedHash = createHash("sha256").update(expected).digest();
  const suppliedHash = createHash("sha256").update(supplied).digest();
  return timingSafeEqual(expectedHash, suppliedHash);
}

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
  response.cookies.set(refreshNonceCookie, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/auth/refresh",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));
  const { refreshToken } = await getServerAuthCookies();
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("next", returnTo);

  if (!refreshToken) return redirectToLogin(request, loginUrl);

  const nonce = randomBytes(32).toString("base64url");
  const secure = request.nextUrl.protocol === "https:";

  // Refresh rotates credentials, so the state-changing request must be POST.
  // This same-origin interstitial preserves a normal server redirect from a
  // protected page while keeping refresh out of GET semantics.
  const escapedReturnTo = returnTo
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
  const escapedNonce = nonce
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
  const response = new NextResponse(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Restoring your session</title><body><main><p>Restoring your secure session…</p><form id="refresh" method="post" action="/auth/refresh"><input type="hidden" name="returnTo" value="${escapedReturnTo}"><input type="hidden" name="refreshNonce" value="${escapedNonce}"><button type="submit">Continue</button></form></main><script>document.getElementById('refresh').submit()</script></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } },
  );
  response.cookies.set(refreshNonceCookie, nonce, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/auth/refresh",
    maxAge: 300,
  });
  return response;
}

export async function POST(request: NextRequest) {
  if (!hasValidRequestOrigin(request)) {
    return new NextResponse("Invalid request origin", {
      status: 403,
      headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
    });
  }

  const formData = await request.formData();
  const nonce = formData.get("refreshNonce")?.toString();
  const cookieNonce = request.cookies.get(refreshNonceCookie)?.value;
  if (!nonce || !cookieNonce || !hashesMatch(cookieNonce, nonce)) {
    return new NextResponse("Invalid refresh request", {
      status: 403,
      headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
    });
  }
  const returnTo = safeReturnTo(formData.get("returnTo")?.toString());
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
    response.cookies.set(refreshNonceCookie, "", {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/auth/refresh",
      maxAge: 0,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return new NextResponse("Authentication service is temporarily unavailable. Please try again.", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "30" },
    });
  }
}
