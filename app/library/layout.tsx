import LibraryMusicPlayer from "@/components/library/LibraryMusicPlayer";

// Indexation and canonicals belong to individual public pages, not this layout:
// authenticated resource pages must remain noindex.
export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<LibraryMusicPlayer /></>;
}
