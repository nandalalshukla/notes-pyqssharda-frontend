import { NextRequest } from "next/server";
import { getNoteById } from "@/lib/api/notes/notes.api";
import { getServerAuthStatus } from "@/lib/server/auth";

function downloadName(note: { courseCode: string; courseName: string; title: string }): string {
  const name = [note.courseCode, note.courseName || note.title]
    .filter(Boolean)
    .join(" ")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return `${name || "study-note"}.pdf`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> },
) {
  const { noteId } = await params;
  if (!/^[0-9a-fA-F]{24}$/.test(noteId)) {
    return new Response("Note not found", { status: 404 });
  }

  const authStatus = await getServerAuthStatus();
  if (authStatus !== "authenticated") {
    const loginUrl = new URL(
      `/auth/login?next=${encodeURIComponent(`/library/notes/${noteId}`)}`,
      request.url,
    );
    return Response.redirect(loginUrl, 303);
  }

  const note = await getNoteById(noteId);
  if (!note?.fileUrl) return new Response("Note not found", { status: 404 });

  const range = request.headers.get("range");
  let upstream: Response;
  try {
    upstream = await fetch(note.fileUrl, {
      headers: range ? { Range: range } : undefined,
      cache: "no-store",
    });
  } catch {
    return new Response("Could not reach the file store", { status: 502 });
  }
  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Could not fetch the note", { status: upstream.status === 404 ? 404 : 502 });
  }

  const wantsDownload = request.nextUrl.searchParams.get("download") === "1";
  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": `${wantsDownload ? "attachment" : "inline"}; filename="${downloadName(note)}"`,
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
