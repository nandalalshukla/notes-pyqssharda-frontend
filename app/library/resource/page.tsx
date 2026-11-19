import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getServerAuthStatus } from "@/lib/server/auth";

interface PageProps {
  searchParams: Promise<{ type?: string; src?: string }>;
}

export default async function LibraryResourcePage({ searchParams }: PageProps) {
  const { type, src } = await searchParams;
  const root = type === "notes" ? "/Notes/" : type === "syllabus" ? "/Syllabus/" : null;
  if (!root || !src || !src.startsWith(root) || src.includes("\\") || src.split("/").includes("..")) {
    notFound();
  }

  const authStatus = await getServerAuthStatus();
  if (authStatus === "unavailable") {
    throw new Error("Authentication service is temporarily unavailable.");
  }
  if (authStatus !== "authenticated") {
    const returnTo = `/library/resource?type=${type}&src=${encodeURIComponent(src)}`;
    redirect(`/auth/login?next=${encodeURIComponent(returnTo)}`);
  }

  const title = src.split("/").pop()?.replace(/\.pdf$/i, "") ?? "Study resource";

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/library/${type}`}
          className="mb-5 inline-flex font-bold text-muted-foreground hover:text-primary"
        >
          Back to {type}
        </Link>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
          <div className="flex flex-wrap gap-3">
            <a
              href={`/library/resource/file?type=${type}&src=${encodeURIComponent(src)}&download=1`}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 font-black text-background"
            >
              <Download className="h-5 w-5" />
              Download PDF
            </a>
            <a
              href={`/library/resource/file?type=${type}&src=${encodeURIComponent(src)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 font-bold text-foreground hover:bg-secondary"
            >
              <ExternalLink className="h-5 w-5" />
              Open in new tab
            </a>
          </div>
        </div>
        <iframe
          src={`/library/resource/file?type=${type}&src=${encodeURIComponent(src)}`}
          title={title}
          className="h-[80vh] w-full rounded-xl border border-border bg-card"
        />
      </div>
    </main>
  );
}
