"use client";

import { useMemo } from "react";
import SYLLABUS2_DATA_2024_25 from "@/DATA/Syllabus/BtechCS/2ndSem";
import SYLLABUS4_DATA_2024_25 from "@/DATA/Syllabus/BtechCS/4thSem";
import SYLLABUS5_DATA_2024_25 from "@/DATA/Syllabus/BtechCS/5thSem";
import SYLLABUS6_DATA_2024_25 from "@/DATA/Syllabus/BtechCS/6thSem";
import {
  ResourceLibraryPage,
  matchesLibrarySearch,
  type LibraryDataSource,
  type LibraryItem,
} from "@/components/library/ResourceLibraryPage";
import { browseSyllabus, getSyllabusFilterOptions } from "@/lib/api/syllabus/syllabus.api";

const allSyllabus: LibraryItem[] = [
  ...SYLLABUS2_DATA_2024_25,
  ...SYLLABUS4_DATA_2024_25,
  ...SYLLABUS5_DATA_2024_25,
  ...SYLLABUS6_DATA_2024_25,
];

export default function SyllabusPage() {
  const dataSource = useMemo<LibraryDataSource>(() => ({
    fetchPage: async (q, signal) => {
      const res = await browseSyllabus({
        page: q.page,
        limit: 24,
        query: q.query || undefined,
        program: q.program || undefined,
        courseCode: q.courseCode || undefined,
        year: q.year || undefined,
        semester: q.semester || undefined,
      }, signal);

      const matchesStatic = (item: LibraryItem) => {
        const criteria = [
          { active: Boolean(q.query.trim()), matches: matchesLibrarySearch(q.query, [item.subject, item.code]) },
          { active: Boolean(q.program), matches: (item.program ?? "B.Tech CS").toLowerCase() === q.program?.toLowerCase() },
          { active: Boolean(q.courseCode.trim()), matches: item.code.toLowerCase().includes(q.courseCode.trim().toLowerCase()) },
          { active: Boolean(q.year), matches: item.year === q.year },
          { active: Boolean(q.semester), matches: item.semester.toString() === q.semester },
        ].filter((criterion) => criterion.active);
        return criteria.length === 0 || criteria.some((criterion) => criterion.matches);
      };

      const databaseItems: LibraryItem[] = res.syllabuses.map((syllabus) => ({
        subject: syllabus.courseName || syllabus.title,
        code: syllabus.courseCode,
        credits: 0,
        semester: syllabus.semester,
        year: syllabus.year || "Not stated",
        src: syllabus.fileUrl,
        program: syllabus.program,
        href: `/library/syllabus/${syllabus._id}`,
      }));
      const staticMatches = q.page === 1 ? allSyllabus.filter(matchesStatic) : [];
      const staticTotal = allSyllabus.filter(matchesStatic).length;
      const mergedItems = [...staticMatches, ...databaseItems].filter(
        (item, index, items) => {
          const key = `${item.subject.toLowerCase()}|${item.code.toLowerCase()}|${item.semester}`;
          return items.findIndex((candidate) =>
            `${candidate.subject.toLowerCase()}|${candidate.code.toLowerCase()}|${candidate.semester}` === key
          ) === index;
        },
      );

      return {
        items: mergedItems,
        total: res.pagination.total + staticTotal,
        hasMore: res.pagination.hasMore,
      };
    },
    fetchFilterOptions: async () => {
      const options = await getSyllabusFilterOptions();
      return {
        programs: [...new Set([...options.programs, "B.Tech CS"])].sort(),
        years: [...new Set([...options.years, ...allSyllabus.map((item) => item.year)])].sort().reverse(),
        semesters: [...new Set([...options.semesters.map(String), ...allSyllabus.map((item) => item.semester.toString())])].sort((a, b) => Number(a) - Number(b)),
      };
    },
  }), []);

  return (
    <ResourceLibraryPage
      accent="purple"
      heading={{ prefix: "Sharda University ", highlight: "Syllabus" }}
      description="Browse and search Sharda University syllabus documents for B.Tech CS courses by semester and course code. Sign in to open a syllabus."
      items={allSyllabus}
      programOptions={["B.Tech CS"]}
      programLabel="B.Tech CS"
      noun={{ singular: "Syllabus", plural: "Syllabus" }}
      viewLabel="View Syllabus"
      codePlaceholder="e.g. CSE251"
      resourceType="syllabus"
      seoContent={{
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
      }}
    />
  );
}
