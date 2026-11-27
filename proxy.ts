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
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const path = request.nextUrl.pathname;
  const isListing = /^\/library\/(pyqs|notes|syllabus)$/.test(path);
  const hasFilters = ["q", "query", "program", "code", "courseCode", "semester", "year", "page"]
    .some((key) => request.nextUrl.searchParams.has(key));
  const isPrivate = /^\/library\/(resource|dashboard)(\/|$)/.test(path) ||
    /^\/library\/(pyqs|notes|syllabus)\/[^/]+(?:\/file)?$/.test(path);
  if (isPrivate || (isListing && hasFilters)) {
    response.headers.set("X-Robots-Tag", "noindex, follow");
  }
  return response;
}

export const config = {
  matcher: ["/library/:path*"],
};
