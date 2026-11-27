"use client";

import SYLLABUS2_DATA_2024_25 from "@/DATA/Syllabus/BtechCS/2ndSem";
import SYLLABUS4_DATA_2024_25 from "@/DATA/Syllabus/BtechCS/4thSem";
import SYLLABUS5_DATA_2024_25 from "@/DATA/Syllabus/BtechCS/5thSem";
import SYLLABUS6_DATA_2024_25 from "@/DATA/Syllabus/BtechCS/6thSem";
import {
  ResourceLibraryPage,
  type LibraryItem,
} from "@/components/library/ResourceLibraryPage";

const allSyllabus: LibraryItem[] = [
  ...SYLLABUS2_DATA_2024_25,
  ...SYLLABUS4_DATA_2024_25,
  ...SYLLABUS5_DATA_2024_25,
  ...SYLLABUS6_DATA_2024_25,
];

export default function SyllabusPage() {
  return (
    <ResourceLibraryPage
      hideIntro
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

    />
  );
}
