import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/structuredData";
import { LibrarySeoContent } from "@/components/library/LibrarySeoContent";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import SyllabusLibrary from "./SyllabusLibrary";

export const metadata = pageMetadata('Sharda Syllabus: B.Tech CSE PDFs | Sharda Social', 'Find Sharda University syllabus PDFs for available B.Tech CS semesters. Search by course code, check your batch and units, then sign in to view a document.', "/library/syllabus");

export default function Page() {
  return <>
    <JsonLd data={[
      collectionSchema({ name: 'Sharda University Syllabus PDFs', description: 'Find Sharda University syllabus PDFs for available B.Tech CS semesters. Search by course code, check your batch and units, then sign in to view a document.', path: "/library/syllabus" }),
      breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Library", path: "/library" }, { name: "Syllabus", path: "/library/syllabus" }]),
    ]} />
    <header className="mx-auto max-w-5xl px-4 pt-12 pb-8 text-center sm:px-6">
      <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Sharda University Syllabus PDFs</h1>
      <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">Find Sharda syllabus PDFs for the available B.Tech CS second, fourth, fifth and sixth semester collection. Search by course code, then verify the document against your admission batch and department guidance. Sign in to open a syllabus PDF.</p>
    </header>
    <Suspense fallback={<div className="mx-auto min-h-96 max-w-5xl px-6 py-8" role="status">Loading library filters and resources...</div>}>
      <SyllabusLibrary />
    </Suspense>
    <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <LibrarySeoContent {...{
        heading: "Sharda University syllabus PDFs and course units",
        paragraphs: [
          "Find the Sharda University syllabus for B.Tech CSE courses in one searchable place. These syllabus resources are grouped by semester and course code, making it easier to confirm the subjects and units included in your exam preparation plan.",
          "Use the course code search to find a specific syllabus, then compare the listed units with your notes and previous year question papers. This page currently focuses on B.Tech CS syllabus material and will expand as more verified student resources are added.",
        ],
        links: [
          {
            href: "/library/pyqs",
            label: "Sharda University previous year question papers",
            description:
              "Practise with past papers after checking the relevant syllabus units.",
          },
          {
            href: "/library/notes",
            label: "B.Tech CSE notes",
            description:
              "Use unit-wise notes to revise the topics listed in your syllabus.",
          },
          {
            href: "/library",
            label: "Sharda e-library",
            description:
              "Explore the complete online library for Sharda University students.",
          },
        ],
        faqs: [
          {
            question: "Where can I find the Sharda University syllabus PDF?",
            answer:
              "Browse the Sharda Social syllabus library and filter by semester or enter your course code. Open the matching syllabus resource to view the available document.",
          },
          {
            question: "Does this page include the Sharda University B.Tech CSE syllabus?",
            answer:
              "Yes. The current collection includes B.Tech CS syllabus resources organised by semester and course code, including the available second, fourth, fifth and sixth semester material.",
          },
          {
            question: "How should I use the syllabus with previous year papers?",
            answer:
              "Start with the units listed in the syllabus, revise them using notes, and then solve the matching previous year question papers to identify recurring exam topics.",
          },
        ],
      }} />
      <RelatedGuides target="/library/syllabus" />
    </div>
  </>;
}
