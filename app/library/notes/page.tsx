import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/structuredData";
import { LibrarySeoContent } from "@/components/library/LibrarySeoContent";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import NotesLibrary from "./NotesLibrary";

export const metadata = pageMetadata('Sharda University Notes by Semester | Sharda Social', 'Find Sharda University B.Tech CS notes by semester, subject and course code. Pair unit-wise notes with your syllabus and PYQs; sign in to open a resource.', "/library/notes");

export default function Page() {
  return <>
    <JsonLd data={[
      collectionSchema({ name: 'Sharda University Notes', description: 'Find Sharda University B.Tech CS notes by semester, subject and course code. Pair unit-wise notes with your syllabus and PYQs; sign in to open a resource.', path: "/library/notes" }),
      breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Library", path: "/library" }, { name: "Notes", path: "/library/notes" }]),
    ]} />
    <header className="mx-auto max-w-5xl px-4 pt-12 pb-8 text-center sm:px-6">
      <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Sharda University Notes</h1>
      <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">Browse student-shared Sharda University B.Tech CS notes by course code and semester. Use your current syllabus to check coverage and practise with the matching PYQs. Browse freely; sign in to open an individual resource.</p>
    </header>
    <Suspense fallback={<div className="mx-auto min-h-96 max-w-5xl px-6 py-8" role="status">Loading library filters and resources...</div>}>
      <NotesLibrary />
    </Suspense>
    <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <LibrarySeoContent heading="Use notes with your course syllabus" paragraphs={["Student notes are revision aids, not a replacement for department instructions or the prescribed textbook. Check the unit list and note any missing diagrams, exercises or lab requirements before you use a set of notes."]} links={[{href: "/library/syllabus", label: "Sharda syllabus PDFs", description: "Confirm the correct units and course code."}, {href: "/library/pyqs", label: "Sharda University PYQs", description: "Test your understanding with available past papers."}]} faqs={[]} />
      <RelatedGuides target="/library/notes" />
    </div>
  </>;
}
