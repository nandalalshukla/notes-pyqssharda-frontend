import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/structuredData";
import { LibrarySeoContent } from "@/components/library/LibrarySeoContent";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import PyqsLibrary from "./PyqsLibrary";

export const metadata = pageMetadata('Sharda University PYQs: Previous Year Question Papers', 'Browse Sharda University previous year question papers by course code, semester and year. Find a matching PYQ, then sign in to read or download the PDF.', "/library/pyqs");

export default function Page() {
  return <>
    <JsonLd data={[
      collectionSchema({ name: 'Sharda University Previous Year Question Papers', description: 'Browse Sharda University previous year question papers by course code, semester and year. Find a matching PYQ, then sign in to read or download the PDF.', path: "/library/pyqs" }),
      breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Library", path: "/library" }, { name: "PYQS", path: "/library/pyqs" }]),
    ]} />
    <header className="mx-auto max-w-5xl px-4 pt-12 pb-8 text-center sm:px-6">
      <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Sharda University Previous Year Question Papers</h1>
      <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">Browse Sharda University PYQs by programme, course code, semester and academic year. Searching is free and public; sign in when you open a paper to read or download its PDF. Match the paper to your current syllabus before practising.</p>
    </header>
    <Suspense fallback={<div className="mx-auto min-h-96 max-w-5xl px-6 py-8" role="status">Loading library filters and resources...</div>}>
      <PyqsLibrary />
    </Suspense>
    <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <LibrarySeoContent {...{
        heading: "Sharda University previous year question papers",
        paragraphs: [
          "Looking for Sharda University previous year question papers or a PYQ PDF download? This library keeps past exam papers organised by programme, semester, academic year and course code so you can find the right paper without searching through scattered links.",
          "Open a paper to read it on sharda.social or download the PDF for offline revision. Use the subject search for a course name such as Computer Networks, or enter a code such as CSE252. Papers are shared for student revision and the collection grows as students contribute useful material.",
        ],
        links: [
          {
            href: "/library/syllabus",
            label: "Sharda University syllabus",
            description:
              "Check the semester and course-unit syllabus before using a PYQ for revision.",
          },
          {
            href: "/library/notes",
            label: "Sharda University notes",
            description:
              "Review unit-wise notes alongside previous year questions.",
          },
          {
            href: "/library",
            label: "Sharda online library",
            description:
              "Browse the complete Sharda library for PYQs, notes and syllabus material.",
          },
        ],
        faqs: [
          {
            question:
              "Where can I download Sharda University previous year question papers?",
            answer:
              "Use the Sharda Social PYQ library to filter papers by programme, semester, year or course code. Select a paper and choose Download PDF to save it for offline exam preparation.",
          },
          {
            question: "Are Sharda University PYQ PDFs free to download?",
            answer:
              "Yes. You can browse and search papers without signing in. Sign in with your Sharda account when you open a specific paper.",
          },
          {
            question: "How do I find a specific Sharda University question paper?",
            answer:
              "Search by subject name or course code, then narrow the results using the programme, academic year and semester filters.",
          },
        ],
      }} />
      <RelatedGuides target="/library/pyqs" />
    </div>
  </>;
}
