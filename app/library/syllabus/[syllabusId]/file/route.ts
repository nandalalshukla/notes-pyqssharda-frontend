import { NextRequest } from "next/server";
import { getSyllabusById } from "@/lib/api/syllabus/syllabus.api";
import { getServerAuthStatus } from "@/lib/server/auth";

function downloadName(syllabus: { courseCode: string; courseName: string; title: string }): string {
  const name = [syllabus.courseCode, syllabus.courseName || syllabus.title]
    .filter(Boolean)
    .join(" ")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return `${name || "syllabus"}.pdf`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ syllabusId: string }> },
) {
  const { syllabusId } = await params;
  if (!/^[0-9a-fA-F]{24}$/.test(syllabusId)) {
    return new Response("Syllabus not found", { status: 404 });
  }

  const authStatus = await getServerAuthStatus();
  if (authStatus !== "authenticated") {
    const loginUrl = new URL(
      `/auth/login?next=${encodeURIComponent(`/library/syllabus/${syllabusId}`)}`,
      request.url,
    );
    return Response.redirect(loginUrl, 303);
  }

  const syllabus = await getSyllabusById(syllabusId);
  if (!syllabus?.fileUrl) return new Response("Syllabus not found", { status: 404 });

  const range = request.headers.get("range");
  let upstream: Response;
  try {
    upstream = await fetch(syllabus.fileUrl, {
      headers: range ? { Range: range } : undefined,
      cache: "no-store",
    });
  } catch {
    return new Response("Could not reach the file store", { status: 502 });
  }
  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Could not fetch the syllabus", { status: upstream.status === 404 ? 404 : 502 });
  }

  const wantsDownload = request.nextUrl.searchParams.get("download") === "1";
  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": `${wantsDownload ? "attachment" : "inline"}; filename="${downloadName(syllabus)}"`,
    "Cache-Control": "private, no-store",
    "Vary": "Cookie",
    "X-Content-Type-Options": "nosniff",
  });
  for (const header of ["content-length", "content-range", "accept-ranges", "etag"]) {
    const value = upstream.headers.get(header);
    if (value) headers.set(header, value);
  }
  if (!headers.has("accept-ranges")) headers.set("Accept-Ranges", "bytes");
  return new Response(upstream.body, {
    status: upstream.status === 206 ? 206 : 200,
    headers,
  });
}
