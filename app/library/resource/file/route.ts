import { readFile } from "node:fs/promises";
import { basename, isAbsolute, relative, resolve } from "node:path";
import { NextRequest } from "next/server";
import { getServerAuthStatus } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authStatus = await getServerAuthStatus();
  if (authStatus === "unavailable") {
    return new Response("Authentication service is temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  if (authStatus !== "authenticated") {
    return new Response("Authentication required", {
      status: 401,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const type = request.nextUrl.searchParams.get("type");
  const src = request.nextUrl.searchParams.get("src");
  const sourcePrefix = type === "notes" ? "/Notes/" : type === "syllabus" ? "/Syllabus/" : null;
  if (
    !sourcePrefix ||
    !src?.startsWith(sourcePrefix) ||
    src.includes("\\") ||
    src.includes("%") ||
    !src.toLowerCase().endsWith(".pdf")
  ) {
    return new Response("Resource not found", { status: 404 });
  }

  const segments = src.slice(sourcePrefix.length).split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    return new Response("Resource not found", { status: 404 });
  }

  const resourceRoot = resolve(process.cwd(), "private-resources", type === "notes" ? "Notes" : "Syllabus");
  const filePath = resolve(resourceRoot, ...segments);
  const fromRoot = relative(resourceRoot, filePath);
  if (fromRoot.startsWith("..") || isAbsolute(fromRoot)) {
    return new Response("Resource not found", { status: 404 });
  }

  let file: Buffer;
  try {
    file = await readFile(filePath);
  } catch {
    return new Response("Resource not found", { status: 404 });
  }

  const filename = basename(filePath).replace(/[\r\n"\\]/g, "_");
  const disposition = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(file.byteLength),
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      Vary: "Cookie",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
