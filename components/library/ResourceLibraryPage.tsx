"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Download, FileText, Loader2, X } from "lucide-react";
import { EmptyState, Skeleton } from "@/components/ui";
import {
  emptyFilters,
  matchesLibraryFilters,
  type LibraryFilters,
  type LibraryItem,
  type LibraryQuery,
} from "./libraryFilters";
import { useLibraryFilters } from "./useLibraryFilters";
import { cn } from "@/lib/utils/cn";
import {
  LibrarySeoContent,
  type LibrarySeoContentProps,
} from "@/components/library/LibrarySeoContent";

export type { LibraryItem, LibraryQuery } from "./libraryFilters";

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

/** The paginated source used by PYQs and the combined notes collection. */
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
  }
> = {
  mint: {
    heading: "text-accent-mint-foreground dark:text-accent-mint",
    activeChip: "border-accent-mint bg-accent-mint/15",
    panelBg: "bg-accent-mint/10",
    badge: "bg-accent-mint/25 text-accent-mint-foreground dark:text-accent-mint",
    dot: "bg-accent-mint",
    ring: "focus-within:ring-accent-mint",
  },
  coral: {
    heading: "text-accent-coral-foreground dark:text-accent-coral",
    activeChip: "border-accent-coral bg-accent-coral/15",
    panelBg: "bg-accent-coral/10",
    badge: "bg-accent-coral/25 text-accent-coral-foreground dark:text-accent-coral",
    dot: "bg-accent-coral",
    ring: "focus-within:ring-accent-coral",
  },
  purple: {
    heading: "text-accent-purple-foreground dark:text-accent-purple",
    activeChip: "border-accent-purple bg-accent-purple/15",
    panelBg: "bg-accent-purple/10",
    badge: "bg-accent-purple/25 text-accent-purple-foreground dark:text-accent-purple",
    dot: "bg-accent-purple",
    ring: "focus-within:ring-accent-purple",
  },
};

function extractUnitName(filePath: string): string {
  const filename = filePath.split("/").pop() || "";
  const unitMatch = filename.match(/^(unit|UNIT)\s*([\d.]+)/i);
  if (unitMatch) return `Unit ${unitMatch[2]}`;
  return filename;
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

  const { filters: savedFilters, setFilters } = useLibraryFilters(resourceType ?? "pyqs");
  const filters = savedFilters ?? emptyFilters;
  const { query: searchQuery, program: selectedProgram, courseCode, year: selectedYear, semester: selectedSemester } = filters;
  const [cursor, setCursor] = useState({ page: 1, delay: 0 });
  const request = useMemo<LibraryQuery>(() => ({
    ...filters, query: filters.query.trim(), courseCode: filters.courseCode.trim(), page: cursor.page,
  }), [filters, cursor]);

  function changeFilters(change: Partial<LibraryFilters>, delay = 0) {
    setCursor({ page: 1, delay });
    setFilters({ ...filters, ...change });
  }

  const cache = useRef(new Map<string, LibraryPage>());
  const [results, setResults] = useState<(LibraryPage & { filters: LibraryFilters; page: number }) | null>(null);
  const [failedRequest, setFailedRequest] = useState<LibraryQuery | null>(null);
  const currentResults = results?.filters === filters ? results : null;
  const loadError = failedRequest === request;
  const isLoading = Boolean(dataSource) && !loadError && currentResults?.page !== request.page;

  useEffect(() => {
    if (!dataSource || !savedFilters) return;
    const controller = new AbortController();
    const cacheKey = JSON.stringify(request);
    const load = async () => {
      try {
        const cached = cache.current.get(cacheKey);
        const result = cached ?? await dataSource.fetchPage(request, controller.signal);
        if (controller.signal.aborted) return;
        if (!cached) {
          if (cache.current.size >= 48) cache.current.delete(cache.current.keys().next().value!);
          cache.current.set(cacheKey, result);
        }
        setResults((previous) => ({
          ...result, filters, page: request.page,
          items: request.page > 1 && previous?.filters === filters && previous.page === request.page - 1
            ? [...previous.items, ...result.items]
            : result.items,
        }));
      } catch {
        if (!controller.signal.aborted) setFailedRequest(request);
      }
    };
    // Dropdowns and clears commit the entire draft immediately. Text edits
    // wait briefly so typing never queues a request for every character.
    const timer = window.setTimeout(load, cache.current.has(cacheKey) ? 0 : cursor.delay);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [dataSource, savedFilters, filters, request, cursor.delay]);

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

  const clientFilteredItems = useMemo(() =>
    staticItems.filter((item) => matchesLibraryFilters(item, filters, programLabel)),
    [staticItems, filters, programLabel],
  );
  const filteredItems = dataSource ? currentResults?.items : clientFilteredItems;

  const semesterGroups = useMemo(() => {
    const grouped = new Map<number | null, LibraryItem[]>();
    filteredItems?.forEach((item) => {
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

  const resultCount = dataSource ? currentResults?.total ?? 0 : clientFilteredItems.length;
  const hasActiveFilter = Object.values(filters).some(Boolean);

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
            <div className={cn("flex items-center rounded-t-2xl border-b-2 border-dashed border-border px-6 py-4 focus-within:ring-2 focus-within:ring-inset", styles.ring)}>
              <Search className="mr-4 h-6 w-6 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                maxLength={100}
                onChange={(e) => changeFilters({ query: e.target.value }, e.target.value ? 250 : 0)}
                aria-label="Search by subject name or course code"
                placeholder="Search subjects or course codes..."
                className="min-w-0 flex-1 bg-transparent text-lg text-foreground placeholder-muted-foreground outline-none"
              />
              {searchQuery && <ClearButton label="Clear search" onClick={() => changeFilters({ query: "" })} />}
            </div>

            <div className={cn("flex flex-wrap items-center gap-3 rounded-b-2xl px-6 py-3", styles.panelBg)}>
              <FilterSelect label="Program" value={selectedProgram} options={resolvedProgramOptions}
                onChange={(program) => changeFilters({ program })} activeClass={styles.activeChip} />

              {/* Course Code Input */}
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-soft-sm transition-all focus-within:ring-2",
                  styles.ring,
                )}
              >
                <span className="text-muted-foreground">Code:</span>
                <input
                  type="text"
                  value={courseCode}
                  maxLength={100}
                  onChange={(e) => changeFilters({ courseCode: e.target.value }, e.target.value ? 250 : 0)}
                  aria-label="Filter by course code"
                  placeholder={codePlaceholder}
                  className="w-24 bg-transparent font-bold text-foreground uppercase outline-none placeholder:normal-case"
                />
                {courseCode && <ClearButton label="Clear course code" onClick={() => changeFilters({ courseCode: "" })} />}
              </div>

              <FilterSelect label="Year" value={selectedYear} options={yearOptions}
                onChange={(year) => changeFilters({ year })} activeClass={styles.activeChip} />
              <FilterSelect label="Semester" value={selectedSemester} options={semesterOptions}
                onChange={(semester) => changeFilters({ semester })} activeClass={styles.activeChip} />

              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={() => changeFilters(emptyFilters)}
                  className="ml-auto text-sm font-black text-destructive underline decoration-2 underline-offset-2 hover:opacity-80 cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        <div role="status" className="mb-8 flex items-center justify-center gap-3 text-sm font-bold text-muted-foreground">
          {isLoading && dataSource ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : loadError ? null : (
            <span>
              {resultCount.toLocaleString()}{" "}
              {resultCount === 1 ? noun.singular.toLowerCase() : noun.plural.toLowerCase()}
              {hasActiveFilter ? " matched" : " available"}
            </span>
          )}
        </div>

        {loadError && (
          <div role="alert" className="mb-8 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center text-sm font-bold text-destructive">
            Could not load these results.{" "}
            <button type="button" className="underline" onClick={() => setCursor({ page: request.page, delay: 0 })}>
              Try again
            </button>
          </div>
        )}

        {/* Results Section */}
        {isLoading && !currentResults ? (
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

            {dataSource && currentResults?.hasMore && !loadError && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setCursor({ page: request.page + 1, delay: 0 })}
                  disabled={isLoading}
                  className="cursor-pointer rounded-lg bg-ink px-8 py-3 font-black text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isLoading ? "Loading..." : `Load more ${noun.plural.toLowerCase()}`}
                </button>
              </div>
            )}
          </div>
        ) : loadError ? null : (
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

function ClearButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick}
      className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
      <X aria-hidden="true" className="size-4" />
    </button>
  );
}

function FilterSelect({ label, value, options, onChange, activeClass }: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
  activeClass: string;
}) {
  return (
    <div className={cn("flex max-w-full items-center rounded-full border bg-card text-sm font-bold shadow-soft-sm focus-within:ring-2",
      value ? activeClass : "border-border")}>
      <div className="relative min-w-0">
        <select aria-label={label} value={value ?? ""} onChange={(event) => onChange(event.target.value || null)}
          className="max-w-full cursor-pointer appearance-none truncate rounded-full bg-transparent py-1.5 pr-8 pl-4 outline-none [field-sizing:content]">
          <option value="">{label}</option>
          {(value && !options.includes(value) ? [value, ...options] : options).map((option) => (
            <option key={option} value={option} className="bg-card text-foreground">
              {label === "Semester" ? `Semester ${option}` : option}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
      </div>
      {value && <ClearButton label={`Clear ${label.toLowerCase()}`} onClick={() => onChange(null)} />}
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
