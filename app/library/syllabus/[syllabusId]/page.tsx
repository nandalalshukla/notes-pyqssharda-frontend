import type { Metadata } from "next";
import Link from "next/link";
import { readLibraryFilters, withLibraryFilters, type PageSearchParams } from "@/components/library/libraryFilterUrl";
import { redirect, notFound } from "next/navigation";
import { ChevronLeft, Download, ExternalLink } from "lucide-react";
import { getSyllabusById, type Syllabus } from "@/lib/api/syllabus/syllabus.api";
import { getServerAuthStatus } from "@/lib/server/auth";

interface PageProps {
  searchParams: Promise<PageSearchParams>;
  params: Promise<{ syllabusId: string }>;
}

function titleFor(syllabus: Syllabus): string {
  return syllabus.courseCode
    ? `${syllabus.courseCode} — ${syllabus.courseName || syllabus.title}`
    : syllabus.courseName || syllabus.title;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { syllabusId } = await params;
  const syllabus = await getSyllabusById(syllabusId);
  if (!syllabus) return { title: "Syllabus not found", robots: { index: false } };
  return {
    title: `${titleFor(syllabus)} — Sharda University Syllabus`,
    description: `Download the Sharda University syllabus for ${syllabus.courseName || syllabus.title}${syllabus.courseCode ? ` (${syllabus.courseCode})` : ""}, semester ${syllabus.semester}.`,
  };
}

export default async function SyllabusPage({ params, searchParams }: PageProps) {
  const { syllabusId } = await params;
  const filters = readLibraryFilters(await searchParams);
  const authStatus = await getServerAuthStatus();
  if (authStatus === "unavailable") throw new Error("Authentication service is temporarily unavailable.");
  if (authStatus !== "authenticated") {
    redirect(`/auth/login?next=${encodeURIComponent(withLibraryFilters(`/library/syllabus/${syllabusId}`, filters))}`);
  }

  const syllabus = await getSyllabusById(syllabusId);
  if (!syllabus) notFound();
  const title = titleFor(syllabus);
  const fileUrl = `/library/syllabus/${syllabusId}/file`;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href={withLibraryFilters("/library/syllabus", filters)} className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary">
          <ChevronLeft className="h-4 w-4" />
          All syllabus
        </Link>
        <header className="mb-8">
          <h1 className="text-3xl leading-tight font-black md:text-4xl">{title}</h1>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            <div><dt className="text-xs font-black uppercase text-muted-foreground">Course code</dt><dd className="font-bold">{syllabus.courseCode}</dd></div>
            <div><dt className="text-xs font-black uppercase text-muted-foreground">Semester</dt><dd className="font-bold">Semester {syllabus.semester}</dd></div>
            <div><dt className="text-xs font-black uppercase text-muted-foreground">Programme</dt><dd className="font-bold">{syllabus.program}</dd></div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`${fileUrl}?download=1`} className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 font-black text-background"><Download className="h-5 w-5" />Download PDF</a>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-bold"><ExternalLink className="h-5 w-5" />Open in new tab</a>
          </div>
        </header>
        <object data={fileUrl} type="application/pdf" className="h-[80vh] w-full rounded-2xl border border-border" aria-label={`${title} syllabus`}>
          <a href={`${fileUrl}?download=1`} className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 font-black text-background">Download the syllabus</a>
        </object>
      </div>
    </div>
  );
}
