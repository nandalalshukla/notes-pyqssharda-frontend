import { NextResponse, type NextRequest } from "next/server";

/**
 * Attach the original library URL so the server layout can return an
 * unauthenticated visitor to the exact page they asked for after sign-in.
 * Authorization is performed in the server layout against the backend;
 * this proxy only forwards routing context.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-app-pathname",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/library/:path*"],
};
