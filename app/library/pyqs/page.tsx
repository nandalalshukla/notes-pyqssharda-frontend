"use client";

import { useMemo } from "react";
import {
  ResourceLibraryPage,
  type LibraryDataSource,
  type LibraryItem,
} from "@/components/library/ResourceLibraryPage";
import { browsePyqs, getPyqFilterOptions } from "@/lib/api/pyqs/pyqs.api";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/structuredData";

/**
 * Previous-year question papers.
 *
 * Uses the same `ResourceLibraryPage` as Notes and Syllabus so the three
 * pages look and behave identically — but supplies a data source instead of
 * an array. Notes and Syllabus ship a few dozen hand-curated items and
 * filter them in the browser; this collection holds thousands of papers
 * imported from the university's own repository
 * (`notesandpyqssharda-backend/scripts/pyq-import`), far too many to send
 * to the client, so filtering and paging happen in MongoDB.
 */
const PAGE_SIZE = 24;

export default function PyqsPage() {
  const dataSource = useMemo<LibraryDataSource>(
    () => ({
      fetchPage: async (q, signal) => {
        const res = await browsePyqs(
          {
            page: q.page,
            limit: PAGE_SIZE,
            query: q.query || undefined,
            program: q.program || undefined,
            courseCode: q.courseCode || undefined,
            year: q.year || undefined,
            semester: q.semester || undefined,
          },
          signal,
        );

        return {
          items: res.pyqs.map(
            (p): LibraryItem => ({
              subject: p.courseName || p.title,
              code: p.courseCode,
              // The repository records no credit weighting per paper, and
              // the card shows this field; 0 reads as "not stated" rather
              // than inventing a number.
              credits: 0,
              semester: p.semester,
              year: p.year,
              src: p.fileUrl,
              program: p.program,
              // Send readers to this paper's page on sharda.social rather
              // than straight to the Cloudinary file.
              href: `/library/pyqs/${p._id}`,
            }),
          ),
          total: res.pagination.total,
          hasMore: res.pagination.hasMore,
        };
      },

      fetchFilterOptions: async () => {
        const o = await getPyqFilterOptions();
        return {
          programs: o.programs,
          years: o.years,
          semesters: o.semesters.map(String),
        };
      },
    }),
    [],
  );

  return (
    <>
      {/* Scoped to the listing, not the layout, so individual paper pages
          describe themselves rather than inheriting this. */}
      <JsonLd
        data={[
          collectionSchema({
            name: "Sharda University Previous Year Question Papers",
            description:
              "A searchable collection of previous year question papers from Sharda University, Greater Noida, covering every school and academic year.",
            path: "/library/pyqs",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Library", path: "/library" },
            { name: "PYQs", path: "/library/pyqs" },
          ]),
        ]}
      />
      <ResourceLibraryPage
      accent="coral"
      // The H1 is the strongest on-page signal for what this page is
      // about, so it names the university rather than just the section.
      heading={{ prefix: "Sharda University ", highlight: "PYQs" }}
      description="Download past exam papers from every school at Sharda University, filter by programme, semester, academic year or course code."
      dataSource={dataSource}
      programLabel="PYQ"
      noun={{ singular: "Paper", plural: "Papers" }}
      viewLabel="View Paper"
      codePlaceholder="e.g. CSE252"
      />
    </>
  );
}
