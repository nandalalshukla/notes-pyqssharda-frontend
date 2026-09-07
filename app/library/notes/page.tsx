"use client";

import NOTES2_DATA_2024_25 from "@/DATA/Notes/BtechCS/2ndSem";
import NOTES4_DATA_2024_25 from "@/DATA/Notes/BtechCS/4thSem";
import NOTES6_DATA_2024_25 from "@/DATA/Notes/BtechCS/6thSem";
import NOTES8_DATA_2024_25 from "@/DATA/Notes/BtechCS/8thSem";
import { ResourceLibraryPage, type LibraryItem } from "@/components/library/ResourceLibraryPage";

const allNotes: LibraryItem[] = [
  ...NOTES2_DATA_2024_25,
  ...NOTES4_DATA_2024_25,
  ...NOTES6_DATA_2024_25,
  ...NOTES8_DATA_2024_25,
];

export default function NotesPage() {
  return (
    <ResourceLibraryPage
      accent="mint"
      heading={{ prefix: "Sharda University ", highlight: "Notes" }}
      description="Find and download comprehensive study notes for your courses."
      items={allNotes}
      programOptions={["B.Tech CS"]}
      programLabel="B.Tech CS"
      noun={{ singular: "Note", plural: "Notes" }}
      viewLabel="View Note"
      codePlaceholder="e.g. CSE249"
    />
  );
}
