"use client";

import PYQ2_DATA_2024_25 from "@/DATA/PYQs/BtechCS/2ndSem";
import { PYQ4_DATA_2024_25 } from "@/DATA/PYQs/BtechCS/4thSem";
import { PYQ6_DATA_2024_25 } from "@/DATA/PYQs/BtechCS/6thSem";
import { ResourceLibraryPage, type LibraryItem } from "@/components/library/ResourceLibraryPage";

const allPyqs: LibraryItem[] = [
  ...PYQ2_DATA_2024_25,
  ...PYQ4_DATA_2024_25,
  ...PYQ6_DATA_2024_25,
];

export default function PyqsPage() {
  return (
    <ResourceLibraryPage
      accent="coral"
      heading={{ prefix: "Previous Year ", highlight: "Questions" }}
      description="Access past exam papers to boost your preparation."
      items={allPyqs}
      programOptions={["B.Tech CS"]}
      programLabel="B.Tech CS"
      noun={{ singular: "PYQ", plural: "PYQs" }}
      viewLabel="View PYQ"
      codePlaceholder="e.g. CSE251"
    />
  );
}
