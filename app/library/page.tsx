import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/structuredData";
import HomeContentShowcase from "@/components/HomeContentShowcase";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background px-4 pt-10 pb-24 text-center font-sans">
      {/* Scoped to this page rather than the /library layout, so nested
          sections describe themselves instead of inheriting this one. */}
      <JsonLd
        data={[
          collectionSchema({
            name: "Sharda Online Library",
            description:
              "Free study material for Sharda University students: previous year question papers, semester notes and syllabus documents.",
            path: "/library",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Library", path: "/library" },
          ]),
        ]}
      />

      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-20 h-16 w-16 animate-pulse rounded-full bg-primary/30 blur-xl"></div>
      <div className="absolute right-20 bottom-20 h-24 w-24 animate-pulse rounded-full bg-accent-purple/30 blur-xl delay-700"></div>

      {/* Three Colored Buttons */}
      <div className="mb-8 flex flex-wrap justify-center gap-3 animate-fade-in-up">
        <Link
          className="lift-on-hover rounded-full bg-accent-coral px-8 py-3 font-semibold text-accent-coral-foreground shadow-soft-sm transition-shadow hover:shadow-soft-md"
          href="/library/pyqs"
        >
          PYQs
        </Link>
        <Link
          className="lift-on-hover rounded-full bg-accent-mint px-8 py-3 font-semibold text-accent-mint-foreground shadow-soft-sm transition-shadow hover:shadow-soft-md"
          href="/library/notes"
        >
          Notes
        </Link>
        <Link
          className="lift-on-hover rounded-full bg-accent-purple px-8 py-3 font-semibold text-accent-purple-foreground shadow-soft-sm transition-shadow hover:shadow-soft-md"
          href="/library/syllabus"
        >
          Syllabus
        </Link>
      </div>

      {/* Main Headline */}
      <h1 className="mb-6 animate-fade-in-up text-5xl leading-tight font-black tracking-tight text-foreground delay-100 md:text-7xl">
        Ace your exams at <br className="hidden md:block" />
        <span className="mt-2 inline-block bg-linear-to-r from-primary to-accent-purple bg-clip-text px-1 text-transparent">
          Sharda Online Library
        </span>
      </h1>

      {/* Subheadline */}
      <p className="mb-10 max-w-2xl animate-fade-in-up text-lg leading-relaxed text-muted-foreground delay-200 md:text-xl">
        Everything you need for <strong className="font-semibold text-foreground">Sharda
        University</strong> semester exams in one place — previous year question
        papers, unit-wise notes and the official syllabus for every school at
        Greater Noida. Free to browse, no sign-up required.
      </p>

      {/* CTA Buttons */}
      <div className="mb-16 flex flex-wrap justify-center gap-6 animate-fade-in-up delay-300">
        <Link
          href="/library/pyqs"
          className="lift-on-hover rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-soft-md transition-shadow hover:shadow-soft-lg"
        >
          Explore
        </Link>
        <Link
          href="/library/dashboard"
          className="lift-on-hover rounded-xl border border-border bg-card px-8 py-4 font-semibold text-foreground shadow-soft-sm transition-shadow hover:shadow-soft-md"
        >
          Contribute
        </Link>
      </div>

      {/* A short, indexable description of each section. The buttons above
          are the fast path for someone who already knows where they're
          going; this is the text that tells a search engine — and a first
          time visitor — what actually lives behind each one. */}
      <section
        aria-labelledby="library-sections"
        className="mb-16 w-full max-w-4xl text-left"
      >
        <h2
          id="library-sections"
          className="mb-6 text-center text-2xl font-black text-foreground md:text-3xl"
        >
          What&apos;s inside the Sharda online library
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-card p-5 shadow-soft-sm">
            <h3 className="mb-2 text-lg font-black text-foreground">
              <Link href="/library/pyqs" className="hover:text-primary">
                Previous year questions
              </Link>
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Thousands of Sharda University past exam papers across all nine
              schools, filed by programme, semester and academic year.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-card p-5 shadow-soft-sm">
            <h3 className="mb-2 text-lg font-black text-foreground">
              <Link href="/library/notes" className="hover:text-primary">
                Semester notes
              </Link>
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Unit-wise study notes written and shared by Sharda students who
              have already sat the paper.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-card p-5 shadow-soft-sm">
            <h3 className="mb-2 text-lg font-black text-foreground">
              <Link href="/library/syllabus" className="hover:text-primary">
                Course syllabus
              </Link>
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The official unit breakdown for each course, so you know what is
              examinable before you start revising.
            </p>
          </article>
        </div>
      </section>

      {/* Content Showcase Section */}
      <HomeContentShowcase />
    </div>
  );
}
