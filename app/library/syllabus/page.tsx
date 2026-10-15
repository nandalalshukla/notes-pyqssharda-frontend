"use client";

import SYLLABUS2_DATA_2024_25 from "@/DATA/Syllabus/BtechCS/2ndSem";
import SYLLABUS4_DATA_2024_25 from "@/DATA/Syllabus/BtechCS/4thSem";
import SYLLABUS5_DATA_2024_25 from "@/DATA/Syllabus/BtechCS/5thSem";
import SYLLABUS6_DATA_2024_25 from "@/DATA/Syllabus/BtechCS/6thSem";
import { ResourceLibraryPage, type LibraryItem } from "@/components/library/ResourceLibraryPage";

const allSyllabus: LibraryItem[] = [
  ...SYLLABUS2_DATA_2024_25,
  ...SYLLABUS4_DATA_2024_25,
  ...SYLLABUS5_DATA_2024_25,
  ...SYLLABUS6_DATA_2024_25,
];

export default function SyllabusPage() {
  return (
    <ResourceLibraryPage
      accent="purple"
      heading={{ prefix: "Sharda University ", highlight: "Syllabus" }}
      description="Access the Sharda University syllabus for B.Tech CS courses, organised by semester and course code so you can plan your exam preparation."
      items={allSyllabus}
      programOptions={["B.Tech CS"]}
      programLabel="B.Tech CS"
      noun={{ singular: "Syllabus", plural: "Syllabus" }}
      viewLabel="View Syllabus"
      codePlaceholder="e.g. CSE251"
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
