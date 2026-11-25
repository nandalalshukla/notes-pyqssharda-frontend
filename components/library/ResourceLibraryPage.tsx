"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Download, FileText, Loader2 } from "lucide-react";
import { EmptyState, Skeleton } from "@/components/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils/cn";
import {
  LibrarySeoContent,
  type LibrarySeoContentProps,
} from "@/components/library/LibrarySeoContent";

export interface LibraryItem {
  subject: string;
  code: string;
  credits: number;
  semester: number;
  year: string;
  src: string | string[];
  /**
   * The degree this paper belongs to. Optional because the hand-curated
   * static lists this page was built on were all one programme, and pass
   * `programLabel` for the whole page instead. Database-backed items carry
   * their own, and it takes precedence wherever it's set.
   */
  program?: string;
  /**
   * An internal page for this item. When set, the card links here instead
   * of straight to the file — so a reader lands on a page on this site
   * rather than being handed off to a raw Cloudinary URL.
   */
  href?: string;
}

/** The filter state the page can be in, and what a server source is asked for. */
export interface LibraryQuery {
  query: string;
  program: string | null;
  courseCode: string;
  year: string | null;
  semester: string | null;
  page: number;
}

export interface LibraryPage {
  items: LibraryItem[];
  total: number;
  hasMore: boolean;
}

export interface LibraryFilterOptions {
  programs: string[];
  years: string[];
  semesters: string[];
}

/**
 * Lets this page be backed by an API instead of an in-memory array.
 *
 * Notes and Syllabus pass a few dozen hand-curated items and filter them in
 * the browser. PYQs holds thousands of rows imported from the university
 * repository, which can't be shipped to the client — so it supplies this
 * instead and the same component renders it. Sharing the component rather
 * than copying its markup is what keeps the three pages actually identical.
 */
export interface LibraryDataSource {
  fetchPage: (q: LibraryQuery, signal: AbortSignal) => Promise<LibraryPage>;
  fetchFilterOptions: () => Promise<LibraryFilterOptions>;
}

export type LibraryAccent = "mint" | "coral" | "purple";

const accentConfig: Record<
  LibraryAccent,
  {
    heading: string;
    activeChip: string;
    panelBg: string;
    badge: string;
    dot: string;
    ring: string;
    optionHover: string;
  }
> = {
  mint: {
    heading: "text-accent-mint-foreground dark:text-accent-mint",
    activeChip: "border-accent-mint bg-accent-mint/15",
    panelBg: "bg-accent-mint/10",
    badge: "bg-accent-mint/25 text-accent-mint-foreground dark:text-accent-mint",
    dot: "bg-accent-mint",
    ring: "focus-within:ring-accent-mint",
    optionHover: "hover:bg-accent-mint/15",
  },
  coral: {
    heading: "text-accent-coral-foreground dark:text-accent-coral",
    activeChip: "border-accent-coral bg-accent-coral/15",
    panelBg: "bg-accent-coral/10",
    badge: "bg-accent-coral/25 text-accent-coral-foreground dark:text-accent-coral",
    dot: "bg-accent-coral",
    ring: "focus-within:ring-accent-coral",
    optionHover: "hover:bg-accent-coral/15",
  },
  purple: {
    heading: "text-accent-purple-foreground dark:text-accent-purple",
    activeChip: "border-accent-purple bg-accent-purple/15",
    panelBg: "bg-accent-purple/10",
    badge: "bg-accent-purple/25 text-accent-purple-foreground dark:text-accent-purple",
    dot: "bg-accent-purple",
    ring: "focus-within:ring-accent-purple",
    optionHover: "hover:bg-accent-purple/15",
  },
};

function extractUnitName(filePath: string): string {
  const filename = filePath.split("/").pop() || "";
  const unitMatch = filename.match(/^(unit|UNIT)\s*([\d.]+)/i);
  if (unitMatch) return `Unit ${unitMatch[2]}`;
  return filename;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function isCloseSearchWord(queryWord: string, valueWord: string): boolean {
  if (valueWord.includes(queryWord)) return true;
  if (queryWord.length < 5 || Math.abs(queryWord.length - valueWord.length) > 1) return false;

  // One edit (insertion, deletion, or substitution) handles common typing
  // mistakes without turning short words into noisy matches.
  let queryIndex = 0;
  let valueIndex = 0;
  let edits = 0;
  while (queryIndex < queryWord.length && valueIndex < valueWord.length) {
    if (queryWord[queryIndex] === valueWord[valueIndex]) {
      queryIndex += 1;
      valueIndex += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (queryWord.length > valueWord.length) queryIndex += 1;
    else if (valueWord.length > queryWord.length) valueIndex += 1;
    else {
      queryIndex += 1;
      valueIndex += 1;
    }
  }
  return edits + (queryIndex < queryWord.length || valueIndex < valueWord.length ? 1 : 0) <= 1;
}

export function matchesLibrarySearch(query: string, values: string[]): boolean {
  const words = normalizeSearchText(query).split(/\s+/).filter((word) => word.length >= 2);
  if (words.length === 0) return true;
  const candidates = values.flatMap((value) => normalizeSearchText(value).split(/\s+/));
  return words.every((word) => candidates.some((candidate) => isCloseSearchWord(word, candidate)));
}

export interface ResourceLibraryPageProps {
  accent: LibraryAccent;
  heading: { prefix?: string; highlight: string; suffix?: string };
  description: string;
  /** Client-side mode: everything to show, filtered in the browser. */
  items?: LibraryItem[];
  /** Server-side mode: the page fetches, filters and pages via the API. */
  dataSource?: LibraryDataSource;
  programOptions?: string[];
  programLabel: string;
  noun: { singular: string; plural: string };
  viewLabel: string;
  codePlaceholder: string;
  seoContent?: LibrarySeoContentProps;
  /** Adds an authenticated on-site viewer for static Notes/Syllabus files. */
  resourceType?: "notes" | "syllabus";
}

export function ResourceLibraryPage({
  accent,
  heading,
  description,
  items,
  dataSource,
  programOptions,
  programLabel,
  noun,
  viewLabel,
  codePlaceholder,
  seoContent,
  resourceType,
}: ResourceLibraryPageProps) {
  const styles = accentConfig[accent];
  const staticItems = useMemo(() => items ?? [], [items]);

  // In client mode the dropdowns are derived from the items on hand; in
  // server mode they come from the API, which knows the whole collection.
  const [serverOptions, setServerOptions] = useState<LibraryFilterOptions | null>(null);

  const semesterOptions = useMemo(
    () =>
      serverOptions?.semesters.map(String).filter((value) => Number(value) > 0) ??
      [...new Set(staticItems.map((item) => item.semester.toString()).filter((value) => Number(value) > 0))].sort(
        (a, b) => Number(a) - Number(b),
      ),
    [serverOptions, staticItems],
  );

  const yearOptions = useMemo(
    () =>
      serverOptions?.years ??
      [...new Set(staticItems.map((item) => item.year))].sort().reverse(),
    [serverOptions, staticItems],
  );

  const resolvedProgramOptions = useMemo(
    () => serverOptions?.programs ?? programOptions ?? [],
    [serverOptions, programOptions],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * SERVER MODE
   * ═══════════════════════════════════════════════════════════════════════
   */
  const [serverItems, setServerItems] = useState<LibraryItem[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [serverHasMore, setServerHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(Boolean(dataSource));
  const [loadError, setLoadError] = useState<string | null>(null);

  // Typing shouldn't fire a request per keystroke, but picking a dropdown
  // should feel instant — so only the two text inputs are debounced.
  //
  // Each field gets its own timer: sharing one meant typing a subject name
  // kept restarting the course-code timer and vice versa, so whichever
  // field you weren't touching was held back by the one you were.
  const debouncedQuery = useDebouncedValue(searchQuery, 300);
  const debouncedCode = useDebouncedValue(courseCode, 300);

  const activeQuery = useMemo<LibraryQuery>(
    () => ({
      query: debouncedQuery.trim(),
      program: selectedProgram,
      courseCode: debouncedCode.trim(),
      year: selectedYear,
      semester: selectedSemester,
      page,
    }),
    [debouncedQuery, debouncedCode, selectedProgram, selectedYear, selectedSemester, page],
  );

  const cacheKey = JSON.stringify(activeQuery);

  /**
   * Results already fetched this session, keyed by the exact query.
   *
   * Browsing a library is a lot of going back and forth between the same
   * few filter combinations, and re-fetching a page the user just looked at
   * is both slow and pointless. A ref rather than state: writing to it must
   * never itself trigger a render.
   */
  const cache = useRef(new Map<string, LibraryPage>());
  const inFlight = useRef<AbortController | null>(null);

  // Any change to the filters starts a new result set, so go back to page 1.
  // Skipped when `page` itself is what changed, which is what "load more" does.
  const filterSignature = JSON.stringify({
    q: debouncedQuery.trim(),
    c: debouncedCode.trim(),
    p: selectedProgram,
    y: selectedYear,
    s: selectedSemester,
  });
  const previousSignature = useRef(filterSignature);
  useEffect(() => {
    if (previousSignature.current !== filterSignature) {
      previousSignature.current = filterSignature;
      setPage(1);
    }
  }, [filterSignature]);

  useEffect(() => {
    if (!dataSource) return;
    let cancelled = false;

    const cached = cache.current.get(cacheKey);
    if (cached) {
      // Served from memory: no request, no spinner.
      setServerItems((prev) => (activeQuery.page > 1 ? [...prev, ...cached.items] : cached.items));
      setServerTotal(cached.total);
      setServerHasMore(cached.hasMore);
      setIsLoading(false);
      return;
    }

    // Supersede whatever was still in the air — the user has moved on, and
    // a late response would otherwise overwrite the newer results.
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setIsLoading(true);
    setLoadError(null);

    dataSource
      .fetchPage(activeQuery, controller.signal)
      .then((result) => {
        if (cancelled || controller.signal.aborted) return;
        cache.current.set(cacheKey, result);
        setServerItems((prev) =>
          activeQuery.page > 1 ? [...prev, ...result.items] : result.items,
        );
        setServerTotal(result.total);
        setServerHasMore(result.hasMore);
      })
      .catch((err: unknown) => {
        if (cancelled || controller.signal.aborted) return;
        if ((err as Error)?.name === "AbortError") return;
        setLoadError("Couldn't load results. Please try again.");
      })
      .finally(() => {
        if (!cancelled && !controller.signal.aborted) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataSource, cacheKey, activeQuery]);

  // Filter options are the same for every visitor and change only when new
  // papers are imported, so they're fetched once per mount.
  useEffect(() => {
    if (!dataSource) return;
    let cancelled = false;
    dataSource
      .fetchFilterOptions()
      .then((opts) => {
        if (!cancelled) setServerOptions(opts);
      })
      .catch(() => {
        // Non-fatal — the list still works, the dropdowns just stay empty.
      });
    return () => {
      cancelled = true;
    };
  }, [dataSource]);

  const clientFilteredItems = useMemo(() => {
    return staticItems.filter((item) => {
      // Prefer the item's own programme; fall back to the page-level label
      // for the static lists, whose items are all one programme.
      const itemProgram = item.program ?? programLabel;
      const criteria = [
        { active: Boolean(searchQuery.trim()), matches: matchesLibrarySearch(searchQuery, [item.subject, item.code]) },
        { active: Boolean(selectedProgram), matches: itemProgram.toLocaleLowerCase() === selectedProgram?.toLocaleLowerCase() },
        { active: Boolean(courseCode.trim()), matches: normalizeSearchText(item.code).includes(normalizeSearchText(courseCode)) },
        { active: Boolean(selectedYear), matches: item.year === selectedYear },
        { active: Boolean(selectedSemester), matches: item.semester.toString() === selectedSemester },
      ].filter((criterion) => criterion.active);

      return criteria.length === 0 || criteria.some((criterion) => criterion.matches);
    });
  }, [staticItems, searchQuery, selectedProgram, programLabel, courseCode, selectedYear, selectedSemester]);

  const filteredItems = dataSource ? serverItems : clientFilteredItems;

  const semesterGroups = useMemo(() => {
    const grouped = new Map<number | null, LibraryItem[]>();
    filteredItems.forEach((item) => {
      const semester = Number(item.semester);
      const semesterKey = Number.isFinite(semester) && semester > 0 ? semester : null;
      const group = grouped.get(semesterKey) ?? [];
      group.push(item);
      grouped.set(semesterKey, group);
    });

    return [...grouped.entries()]
      .sort(([a], [b]) => {
        if (a === null) return b === null ? 0 : 1;
        if (b === null) return -1;
        return a - b;
      })
      .map(([semester, items]) => ({
        label: semester === null ? "Semester not listed" : `Semester ${semester}`,
        items,
      }));
  }, [filteredItems]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedProgram(null);
    setCourseCode("");
    setSelectedYear(null);
    setSelectedSemester(null);
    setPage(1);
  };

  const resultCount = dataSource ? serverTotal : filteredItems.length;

  const toggleDropdown = (name: string) =>
    setActiveDropdown((prev) => (prev === name ? null : name));

  const handleSelect = (type: "program" | "year" | "semester", value: string) => {
    if (type === "program") setSelectedProgram(value);
    if (type === "year") setSelectedYear(value);
    if (type === "semester") setSelectedSemester(value);
    setActiveDropdown(null);
  };

  const hasActiveFilter =
    searchQuery || selectedProgram || courseCode || selectedYear || selectedSemester;

  const dropdownButtonClass = (active: boolean) =>
    cn(
      "flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-soft-sm transition-colors cursor-pointer",
      active ? styles.activeChip : "border-border hover:bg-secondary",
    );

  // Capped and scrollable. The programme list is ~50 entries now that the
  // library covers every school, and an uncapped panel ran far past the
  // bottom of the viewport with no way to reach the last options.
  // `overscroll-contain` stops a scroll that reaches the end of the list
  // from continuing on to scroll the page behind it.
  const dropdownPanelClass =
    "absolute top-full left-0 z-50 mt-2 max-h-72 overflow-y-auto overscroll-contain rounded-xl border border-border bg-card py-2 shadow-soft-lg";

  const dropdownOptionClass = cn(
    "cursor-pointer px-4 py-2 text-sm font-medium text-foreground",
    styles.optionHover,
  );

  return (
    <div className="min-h-screen bg-background p-4 pb-20 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mt-8 mb-12 text-center">
          <h1 className="mb-4 text-4xl font-black md:text-6xl">
            {heading.prefix}
            <span className={styles.heading}>{heading.highlight}</span>
            {heading.suffix}
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-medium text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Search & Filter Section */}
        <div className="mb-16 flex justify-center">
          <div className="z-20 w-full max-w-5xl overflow-visible rounded-2xl border border-border bg-card shadow-soft-lg">
            <div className="flex items-center border-b-2 border-dashed border-border px-6 py-4">
              <Search className="mr-4 h-6 w-6 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search by subject name or course code"
                placeholder="Search subjects or course codes..."
                className="w-full bg-transparent text-lg text-foreground placeholder-muted-foreground outline-none"
              />
            </div>

            <div className={cn("flex flex-wrap items-center gap-3 rounded-b-2xl px-6 py-3", styles.panelBg)}>
              {/* Program Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("program")}
                  aria-expanded={activeDropdown === "program"}
                  aria-haspopup="listbox"
                  className={dropdownButtonClass(!!selectedProgram)}
                >
                  {selectedProgram || "Program"}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {activeDropdown === "program" && (
                  <div role="listbox" aria-label="Programs" className={cn(dropdownPanelClass, "w-48")}>
                    {resolvedProgramOptions.map((opt) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedProgram === opt}
                        key={opt}
                        onClick={() => handleSelect("program", opt)}
                        className={cn(dropdownOptionClass, "block w-full text-left")}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Course Code Input */}
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-soft-sm transition-all focus-within:ring-2",
                  styles.ring,
                )}
              >
                <span className="text-muted-foreground">Code:</span>
                <input
                  type="search"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  aria-label="Filter by course code"
                  placeholder={codePlaceholder}
                  className="w-24 bg-transparent font-bold text-foreground uppercase outline-none placeholder:normal-case"
                />
              </div>

              {/* Year Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("year")}
                  aria-expanded={activeDropdown === "year"}
                  aria-haspopup="listbox"
                  className={dropdownButtonClass(!!selectedYear)}
                >
                  {selectedYear || "Year"}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {activeDropdown === "year" && (
                  <div role="listbox" aria-label="Years" className={cn(dropdownPanelClass, "w-40")}>
                    {yearOptions.map((opt) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedYear === opt}
                        key={opt}
                        onClick={() => handleSelect("year", opt)}
                        className={cn(dropdownOptionClass, "block w-full text-left border-b border-dashed border-border last:border-0")}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Semester Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("semester")}
                  aria-expanded={activeDropdown === "semester"}
                  aria-haspopup="listbox"
                  className={dropdownButtonClass(!!selectedSemester)}
                >
                  {selectedSemester ? `Sem ${selectedSemester}` : "Semester"}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {activeDropdown === "semester" && (
                  <div role="listbox" aria-label="Semesters" className={cn(dropdownPanelClass, "w-32")}>
                    {semesterOptions.map((opt) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedSemester === opt}
                        key={opt}
                        onClick={() => handleSelect("semester", opt)}
                        className={cn(dropdownOptionClass, "block w-full text-left")}
                      >
                        Semester {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="ml-auto text-sm font-black text-destructive underline decoration-2 underline-offset-2 hover:opacity-80 cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* How many matched, and whether a request is in flight. Shown for
            the server-backed page because "5,704 papers" is information the
            client-side pages get for free from array length. */}
        <div className="mb-8 flex items-center justify-center gap-3 text-sm font-bold text-muted-foreground">
          {isLoading && dataSource ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <span>
              {resultCount.toLocaleString()}{" "}
              {resultCount === 1 ? noun.singular.toLowerCase() : noun.plural.toLowerCase()}
              {hasActiveFilter ? " matched" : " available"}
            </span>
          )}
        </div>

        {loadError && (
          <div className="mb-8 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center text-sm font-bold text-destructive">
            {loadError}
          </div>
        )}

        {/* Results Section */}
        {isLoading && dataSource && serverItems.length === 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : semesterGroups.length > 0 ? (
          <div className="space-y-12">
            {semesterGroups.map(({ label: semester, items: semesterItems }) => (
                <div key={semester}>
                  <div className="mb-8 flex items-center gap-4">
                    <h2 className="text-3xl font-black">
                      {semester} {noun.plural}
                    </h2>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-bold text-background">
                      {semesterItems.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {semesterItems.map((item, index) => (
                      <ResourceCard
                        key={`${item.code}-${index}`}
                        item={item}
                        programLabel={programLabel}
                        viewLabel={viewLabel}
                        styles={styles}
                        resourceType={resourceType}
                      />
                    ))}
                  </div>
                </div>
              ))}

            {dataSource && serverHasMore && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isLoading}
                  className="cursor-pointer rounded-lg bg-ink px-8 py-3 font-black text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isLoading ? "Loading..." : `Load more ${noun.plural.toLowerCase()}`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<Search size={28} />}
            title={`No ${noun.plural.toLowerCase()} found for your search.`}
            description="Try adjusting your filters or searching for something else."
          />
        )}

        {seoContent && <LibrarySeoContent {...seoContent} />}
      </div>
    </div>
  );
}

function ResourceCard({
  item,
  programLabel,
  viewLabel,
  styles,
  resourceType,
}: {
  item: LibraryItem;
  programLabel: string;
  viewLabel: string;
  styles: (typeof accentConfig)[LibraryAccent];
  resourceType?: "notes" | "syllabus";
}) {
  const srcArray = Array.isArray(item.src) ? item.src : [item.src];

  return (
    <div className="lift-on-hover flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-soft-sm hover:shadow-soft-md">
      <div className="mb-4 flex items-start justify-between">
        <span className={cn("rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase", styles.badge)}>
          {item.program ?? programLabel}
        </span>
        <span className="text-xs font-bold text-muted-foreground">
          {item.semester > 0 ? `Sem ${item.semester}` : "Semester not listed"}
        </span>
      </div>

      <div className="mb-4 flex-grow">
        <h3 className="mb-2 line-clamp-2 text-xl leading-tight font-black">{item.subject}</h3>
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <span className={cn("h-3 w-3 rounded-full", styles.dot)} />
            Credits: {item.credits}
          </p>
          <p className="pl-0.5 font-mono text-sm text-muted-foreground">{item.code}</p>
        </div>
      </div>

      <div className="mt-auto border-t-2 border-dashed border-border pt-4">
        <div className="mb-4 flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>{item.year}</span>
          {srcArray.length > 1 && (
            <span>
              {srcArray.length} file{srcArray.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {item.href ? (
          // An internal page exists for this item, so keep the reader on
          // this site instead of handing them off to a raw file URL.
          <Link
            href={item.href}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-3 font-black text-background transition-opacity hover:opacity-90 cursor-pointer"
          >
            <FileText className="h-5 w-5" />
            {viewLabel}
          </Link>
        ) : srcArray.length === 1 ? (
          resourceType ? (
            <Link
              href={`/library/resource?type=${resourceType}&src=${encodeURIComponent(srcArray[0])}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-3 font-black text-background transition-opacity hover:opacity-90 cursor-pointer"
            >
              <Download className="h-5 w-5" />
              {viewLabel}
            </Link>
          ) : (
            <a
              href={srcArray[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-3 font-black text-background transition-opacity hover:opacity-90 cursor-pointer"
            >
              <Download className="h-5 w-5" />
              {viewLabel}
            </a>
          )
        ) : (
          <div className="space-y-2">
            {srcArray.map((src, idx) =>
              resourceType ? (
                <Link
                  key={idx}
                  href={`/library/resource?type=${resourceType}&src=${encodeURIComponent(src)}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2 text-sm font-bold text-background transition-opacity hover:opacity-90 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  {extractUnitName(src)}
                </Link>
              ) : (
                <a
                  key={idx}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2 text-sm font-bold text-background transition-opacity hover:opacity-90 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  {extractUnitName(src)}
                </a>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
