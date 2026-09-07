"use client";

import { useMemo } from "react";
import {
  ResourceLibraryPage,
  type LibraryDataSource,
  type LibraryItem,
} from "@/components/library/ResourceLibraryPage";
import { browsePyqs, getPyqFilterOptions } from "@/lib/api/pyqs/pyqs.api";

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
    <ResourceLibraryPage
      accent="coral"
      heading={{ prefix: "Previous Year ", highlight: "Questions" }}
      description="Find and download past exam papers from across every school."
      dataSource={dataSource}
      programLabel="PYQ"
      noun={{ singular: "Paper", plural: "Papers" }}
      viewLabel="View Paper"
      codePlaceholder="e.g. CSE252"
    />
  );
}
