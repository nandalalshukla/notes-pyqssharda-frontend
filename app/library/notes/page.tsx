"use client";

import { useMemo } from "react";
import NOTES2_DATA_2024_25 from "@/DATA/Notes/BtechCS/2ndSem";
import NOTES4_DATA_2024_25 from "@/DATA/Notes/BtechCS/4thSem";
import NOTES5_DATA_2024_25 from "@/DATA/Notes/BtechCS/5thSem";
import NOTES6_DATA_2024_25 from "@/DATA/Notes/BtechCS/6thSem";
import NOTES8_DATA_2024_25 from "@/DATA/Notes/BtechCS/8thSem";
import {
  ResourceLibraryPage,
  type LibraryDataSource,
  type LibraryItem,
} from "@/components/library/ResourceLibraryPage";
import { browseNotes, getNoteFilterOptions } from "@/lib/api/notes/notes.api";

const allNotes: LibraryItem[] = [
  ...NOTES2_DATA_2024_25,
  ...NOTES4_DATA_2024_25,
  ...NOTES5_DATA_2024_25,
  ...NOTES6_DATA_2024_25,
  ...NOTES8_DATA_2024_25,
];

export default function NotesPage() {
  const dataSource = useMemo<LibraryDataSource>(() => ({
    fetchPage: async (q, signal) => {
      const res = await browseNotes({
        page: q.page,
        limit: 24,
        query: q.query || undefined,
        program: q.program || undefined,
        courseCode: q.courseCode || undefined,
        year: q.year || undefined,
        semester: q.semester || undefined,
      }, signal);

      const matchesStatic = (item: LibraryItem) => {
        const query = q.query.toLowerCase();
        const code = q.courseCode.toLowerCase();
        return (
          (!query || item.subject.toLowerCase().includes(query) || item.code.toLowerCase().includes(query)) &&
          (!q.program || (item.program ?? "B.Tech CS").toLowerCase() === q.program.toLowerCase()) &&
          (!code || item.code.toLowerCase().includes(code)) &&
          (!q.year || item.year === q.year) &&
          (!q.semester || item.semester.toString() === q.semester)
        );
      };

      const databaseItems: LibraryItem[] = res.notes.map((note) => ({
        subject: note.courseName || note.title,
        code: note.courseCode,
        credits: 0,
        semester: note.semester,
        year: note.year || "Not stated",
        src: note.fileUrl,
        program: note.program,
        href: `/library/notes/${note._id}`,
      }));
      const staticMatches = q.page === 1 ? allNotes.filter(matchesStatic) : [];
      const staticTotal = allNotes.filter(matchesStatic).length;
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
      const options = await getNoteFilterOptions();
      return {
        programs: [...new Set([...options.programs, "B.Tech CS"])].sort(),
        years: [...new Set([...options.years, ...allNotes.map((item) => item.year)])].sort().reverse(),
        semesters: [...new Set([...options.semesters.map(String), ...allNotes.map((item) => item.semester.toString())])].sort((a, b) => Number(a) - Number(b)),
      };
    },
  }), []);

  return (
    <ResourceLibraryPage
      accent="mint"
      heading={{ prefix: "Sharda University ", highlight: "Notes" }}
      description="Browse and search Sharda University notes for B.Tech CS courses, organised by semester, course code and unit. Sign in to open a note."
      dataSource={dataSource}
      programOptions={["B.Tech CS"]}
      programLabel="B.Tech CS"
      noun={{ singular: "Note", plural: "Notes" }}
      viewLabel="View Note"
      codePlaceholder="e.g. CSE249"
      resourceType="notes"
    />
  );
}
