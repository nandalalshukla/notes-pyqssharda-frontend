"use client";

import PyqLibraryBrowser from "@/components/library/PyqLibraryBrowser";

/**
 * Previous-year question papers, read from the database.
 *
 * This page used to import hand-maintained arrays from `DATA/PYQs/` —
 * a few dozen B.Tech CS papers checked into the repo. Those files have
 * been deleted: the collection now lives in MongoDB with the PDFs on
 * Cloudinary, thousands of papers across every school, imported from the
 * university's own repository by
 * `notesandpyqssharda-backend/scripts/pyq-import`.
 *
 * Filtering and paging happen server-side (`/pyqs/browse-pyqs`) because
 * the collection is far too large to ship to the browser and filter there.
 */
export default function PyqsPage() {
  return <PyqLibraryBrowser />;
}
