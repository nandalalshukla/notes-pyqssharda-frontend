import { NextRequest } from "next/server";
import { getPyqById } from "@/lib/api/pyqs/pyqs.api";

/**
 * Serves a question paper's PDF from this domain.
 *
 * The file lives in Cloudinary, but linking straight at it sends students
 * to `res.cloudinary.com` — a different brand in the address bar, with no
 * way back to the site. This streams the bytes through so the URL a
 * student sees, shares or bookmarks is always sharda.social.
 *
 * Deliberately keyed on the paper's **id**, never on a URL passed in by
 * the caller. Accepting a `?url=` parameter would make this an open proxy
 * that would happily fetch and serve anything on the internet under your
 * domain. The id is resolved against the database, and only papers that
 * are actually approved resolve at all.
 *
 *   /library/pyqs/<id>/file              → opens inline in the browser
 *   /library/pyqs/<id>/file?download=1   → saves with a readable filename
 */

/** A filename a student will recognise in their downloads folder. */
function downloadName(parts: (string | undefined)[]): string {
  const name = parts
    .filter(Boolean)
    .join(" ")
    // Characters Windows and macOS refuse in filenames.
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return `${name || "question-paper"}.pdf`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pyqId: string }> },
) {
  const { pyqId } = await params;
  const pyq = await getPyqById(pyqId);

  if (!pyq?.fileUrl) {
    return new Response("Paper not found", { status: 404 });
  }

  // Range requests matter here: browsers' built-in PDF viewers fetch large
  // documents in chunks, and a proxy that ignored Range would force the
  // whole file on every seek — or fail to render at all.
  const range = request.headers.get("range");

  let upstream: Response;
  try {
    upstream = await fetch(pyq.fileUrl, {
      headers: range ? { Range: range } : undefined,
      // Cloudinary is the source of truth for the bytes; caching them in
      // Next's data cache would double-store every PDF for no gain.
      cache: "no-store",
    });
  } catch {
    return new Response("Could not reach the file store", { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Could not fetch the paper", {
      status: upstream.status === 404 ? 404 : 502,
    });
  }

  const wantsDownload = request.nextUrl.searchParams.get("download") === "1";
  const filename = downloadName([
    pyq.courseCode,
    pyq.courseName || pyq.title,
    pyq.year,
  ]);

  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set(
    "Content-Disposition",
    `${wantsDownload ? "attachment" : "inline"}; filename="${filename}"`,
  );

  // Pass through what the viewer needs to seek within the document.
  for (const header of ["content-length", "content-range", "accept-ranges", "etag"]) {
    const value = upstream.headers.get(header);
    if (value) headers.set(header, value);
  }
  if (!headers.has("accept-ranges")) headers.set("Accept-Ranges", "bytes");

  // A paper never changes once imported, so let the CDN and the browser
  // keep it. This is what stops every view costing a round trip to
  // Cloudinary and burning your hosting bandwidth.
  headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400, immutable");
  headers.set("X-Content-Type-Options", "nosniff");

  // Streamed rather than buffered: the route hands the upstream body
  // straight to the client instead of holding a whole PDF in memory.
  return new Response(upstream.body, {
    status: upstream.status === 206 ? 206 : 200,
    headers,
  });
}
