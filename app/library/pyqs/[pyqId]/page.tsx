import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ChevronLeft, ExternalLink } from "lucide-react";
import { getPyqById, type Pyq } from "@/lib/api/pyqs/pyqs.api";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/structuredData";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * One question paper, on this site.
 *
 * The card used to link straight at the Cloudinary file, which handed the
 * reader off to `res.cloudinary.com` — off the brand, and with no title,
 * context or way back. This keeps them on sharda.social: the paper renders
 * inline, with its course, semester and year around it.
 *
 * It's also thousands of new indexable pages. A search for "CSE 252
 * computer networks sharda previous year paper" has something specific to
 * match now, where before the only candidate was the section listing.
 */

interface PageProps {
  params: Promise<{ pyqId: string }>;
}

/** Human-readable label, e.g. "CSE 252 — Computer Networks". */
function paperTitle(pyq: Pyq): string {
  const name = pyq.courseName || pyq.title;
  return pyq.courseCode ? `${pyq.courseCode} — ${name}` : name;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { pyqId } = await params;
  const pyq = await getPyqById(pyqId);

  if (!pyq) {
    return { title: "Paper not found", robots: { index: false } };
  }

  const title = `${paperTitle(pyq)} — Sharda University Question Paper ${pyq.year}`;
  const description = `Download the Sharda University ${pyq.year} end-term question paper for ${
    pyq.courseName || pyq.title
  }${pyq.courseCode ? ` (${pyq.courseCode})` : ""}, semester ${pyq.semester}${
    pyq.program ? `, ${pyq.program}` : ""
  }. Free previous year paper from the Sharda online library.`;

  return {
    title,
    description,
    alternates: { canonical: `/library/pyqs/${pyqId}` },
    openGraph: {
      title,
      description,
      url: `/library/pyqs/${pyqId}`,
      type: "article",
      images: ["/shardasocial.png"],
    },
  };
}

export default async function PyqPaperPage({ params }: PageProps) {
  const { pyqId } = await params;
  const pyq = await getPyqById(pyqId);

  if (!pyq) notFound();

  const title = paperTitle(pyq);

  // Served from sharda.social rather than res.cloudinary.com, so the URL a
  // student opens, shares or bookmarks stays on the site. See ./file/route.ts.
  const fileUrl = `/library/pyqs/${pyqId}/file`;
  const facts: { label: string; value: string }[] = [
    { label: "Course code", value: pyq.courseCode },
    { label: "Semester", value: `Semester ${pyq.semester}` },
    { label: "Academic year", value: pyq.year },
    { label: "Programme", value: pyq.program },
    ...(pyq.school ? [{ label: "School", value: pyq.school }] : []),
  ].filter((f) => Boolean(f.value));

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Library", path: "/library" },
            { name: "PYQs", path: "/library/pyqs" },
            { name: title, path: `/library/pyqs/${pyqId}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: title,
            description: `Sharda University ${pyq.year} end-term question paper for ${
              pyq.courseName || pyq.title
            }.`,
            url: absoluteUrl(`/library/pyqs/${pyqId}`),
            learningResourceType: "Exam paper",
            educationalLevel: `Semester ${pyq.semester}`,
            inLanguage: "en-IN",
            isAccessibleForFree: true,
            about: { "@type": "Course", name: pyq.courseName || pyq.title },
            provider: {
              "@type": "CollegeOrUniversity",
              name: "Sharda University",
            },
          },
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/library/pyqs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          All previous year questions
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl leading-tight font-black text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sharda University end-term question paper, {pyq.year}.
          </p>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs font-black tracking-wide text-muted-foreground uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-0.5 font-bold text-foreground">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`${fileUrl}?download=1`}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 font-black text-background transition-opacity hover:opacity-90"
            >
              <Download className="h-5 w-5" />
              Download PDF
            </a>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-bold text-foreground transition-colors hover:bg-secondary"
            >
              <ExternalLink className="h-5 w-5" />
              Open in new tab
            </a>
          </div>
        </header>

        {/* The paper itself. An <object> rather than an <iframe>: it falls
            back to its children when the browser has no inline PDF viewer,
            which is the common case on mobile — an iframe would just show
            an empty box there. */}
        <object
          data={fileUrl}
          type="application/pdf"
          className="h-[80vh] w-full rounded-2xl border border-border bg-card"
          aria-label={`${title} question paper`}
        >
          <div className="p-10 text-center">
            <p className="mb-4 font-bold text-foreground">
              Your browser can&apos;t display PDFs inline.
            </p>
            <a
              href={`${fileUrl}?download=1`}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 font-black text-background"
            >
              <Download className="h-5 w-5" />
              Download the paper
            </a>
          </div>
        </object>
      </div>
    </div>
  );
}
