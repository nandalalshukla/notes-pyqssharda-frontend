import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Feed } from "@/components/social";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo/structuredData";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";
import { HOME_FAQS } from "@/lib/seo/faqs";

/**
 * Home.
 *
 * A server component that renders the page's copy, headings and links into
 * the HTML, with the campus feed mounted inside it as a client island. The
 * page used to be a single `"use client"` wrapper around `<Feed />`, which
 * meant a crawler received a document with no heading, no text and no
 * links — nothing to rank.
 */

export const metadata: Metadata = {
  // The one page that shouldn't use the "%s | Sharda Social" template —
  // a homepage title reads better leading with the brand and the thing it
  // is, and this is the title that has to win the query "sharda social".
  title: {
    absolute:
      "Sharda Social — Sharda University Notes, PYQs, Syllabus & Student Community",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const SECTIONS = [
  {
    href: "/library/pyqs",
    eyebrow: "Previous Year Questions",
    title: "Sharda University past year question papers",
    body: "Thousands of end-term papers from every school, filed by programme, semester and academic year — imported straight from the university's own question-paper repository.",
    cta: "Browse PYQs",
    accent: "bg-accent-coral text-accent-coral-foreground",
  },
  {
    href: "/library/notes",
    eyebrow: "Semester Notes",
    title: "Sharda University notes, unit by unit",
    body: "Study notes shared by students who have already sat the paper, organised by course code so you can find the unit you're stuck on.",
    cta: "Browse Notes",
    accent: "bg-accent-mint text-accent-mint-foreground",
  },
  {
    href: "/library/syllabus",
    eyebrow: "Syllabus",
    title: "Sharda University syllabus PDFs",
    body: "The official unit breakdown for your course, so you know exactly what's examinable before you start revising.",
    cta: "Browse Syllabus",
    accent: "bg-accent-purple text-accent-purple-foreground",
  },
];

export default function ShardaSocialHome() {
  return (
    <>
      <JsonLd data={faqSchema(HOME_FAQS)} />

      <div className="bg-background">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-10 text-center sm:px-6 lg:px-8">
          <p className="mb-4 inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-black tracking-wide text-muted-foreground uppercase">
            For students of Sharda University, Greater Noida
          </p>

          <h1 className="text-4xl leading-tight font-black tracking-tight text-foreground md:text-6xl">
            {SITE_NAME}
            <span className="mt-3 block bg-linear-to-r from-primary to-accent-purple bg-clip-text text-transparent">
              Your campus feed &amp; online library
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Everything you need for semester exams in one place —{" "}
            <strong className="font-semibold text-foreground">
              previous year question papers
            </strong>
            ,{" "}
            <strong className="font-semibold text-foreground">notes</strong> and{" "}
            <strong className="font-semibold text-foreground">syllabus</strong>{" "}
            for every school at Sharda University, alongside a student feed
            for announcements, events and lost &amp; found.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/library"
              className="lift-on-hover rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground shadow-soft-sm transition-shadow hover:shadow-soft-md"
            >
              Open the Online Library
            </Link>
            <Link
              href="/library/pyqs"
              className="lift-on-hover rounded-full border border-border bg-card px-8 py-3 font-bold text-foreground shadow-soft-sm transition-shadow hover:shadow-soft-md"
            >
              Find a past paper
            </Link>
          </div>
        </section>

        {/* ── What's in the library ────────────────────────────────────── */}
        <section
          aria-labelledby="library-heading"
          className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
        >
          <h2
            id="library-heading"
            className="mb-3 text-center text-3xl font-black text-foreground md:text-4xl"
          >
            The Sharda online library
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            Free, searchable and open to every Sharda student — no sign-up
            needed to browse.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {SECTIONS.map((section) => (
              <article
                key={section.href}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft-sm transition-shadow hover:shadow-soft-md"
              >
                <span
                  className={`mb-4 w-fit rounded-full px-3 py-1 text-xs font-black tracking-wider uppercase ${section.accent}`}
                >
                  {section.eyebrow}
                </span>
                <h3 className="mb-3 text-xl leading-snug font-black text-foreground">
                  {section.title}
                </h3>
                <p className="mb-6 flex-grow text-sm leading-relaxed text-muted-foreground">
                  {section.body}
                </p>
                <Link
                  href={section.href}
                  className="mt-auto font-bold text-primary underline-offset-4 hover:underline"
                >
                  {section.cta} →
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* ── The social feed ──────────────────────────────────────────── */}
        <section
          aria-labelledby="feed-heading"
          className="border-t border-border"
        >
          <div className="mx-auto max-w-3xl px-4 pt-12 text-center sm:px-6 lg:px-8">
            <h2
              id="feed-heading"
              className="text-3xl font-black text-foreground md:text-4xl"
            >
              The campus feed
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Announcements, events, lost &amp; found and everything else
              happening around campus — posted by Sharda students.
            </p>
          </div>

          {/* Client island: interactive and reads live data.
              Given its own Suspense boundary so the feed's lazy chunks
              can't hold up the static copy around them, and so there's a
              deliberate loading state rather than a blank gap.

              Note this does NOT change where the content lands in the raw
              HTML: the App Router always streams a route segment
              separately from its layout, so <footer> appears earlier in
              the byte stream than the page body regardless. That's normal
              — the renderer Google uses resolves the stream to the correct
              DOM order, and the copy is all present either way. */}
          <Suspense
            fallback={
              <div className="mx-auto max-w-3xl px-4 py-12 text-center text-muted-foreground">
                Loading the campus feed…
              </div>
            }
          >
            <Feed />
          </Suspense>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="faq-heading"
          className="border-t border-border bg-card/40"
        >
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <h2
              id="faq-heading"
              className="mb-10 text-center text-3xl font-black text-foreground md:text-4xl"
            >
              Frequently asked questions
            </h2>

            <dl className="space-y-6">
              {HOME_FAQS.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm"
                >
                  <dt className="mb-2 text-lg font-black text-foreground">
                    {faq.question}
                  </dt>
                  <dd className="leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </>
  );
}
