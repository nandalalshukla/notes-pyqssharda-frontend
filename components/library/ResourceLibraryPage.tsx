"use client";

import React, { useMemo, useState } from "react";
import { Search, ChevronDown, Download } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

export interface LibraryItem {
  subject: string;
  code: string;
  credits: number;
  semester: number;
  year: string;
  src: string | string[];
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

export interface ResourceLibraryPageProps {
  accent: LibraryAccent;
  heading: { prefix?: string; highlight: string; suffix?: string };
  description: string;
  items: LibraryItem[];
  programOptions: string[];
  programLabel: string;
  noun: { singular: string; plural: string };
  viewLabel: string;
  codePlaceholder: string;
}

export function ResourceLibraryPage({
  accent,
  heading,
  description,
  items,
  programOptions,
  programLabel,
  noun,
  viewLabel,
  codePlaceholder,
}: ResourceLibraryPageProps) {
  const styles = accentConfig[accent];

  const semesterOptions = useMemo(
    () =>
      [...new Set(items.map((item) => item.semester.toString()))].sort(
        (a, b) => Number(a) - Number(b),
      ),
    [items],
  );

  const yearOptions = useMemo(
    () => [...new Set(items.map((item) => item.year))].sort().reverse(),
    [items],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      const codeLower = courseCode.toLowerCase();

      const matchesQuery =
        !searchQuery ||
        item.subject.toLowerCase().includes(searchLower) ||
        item.code.toLowerCase().includes(searchLower);
      const matchesProgram =
        !selectedProgram ||
        programLabel.toLowerCase() === selectedProgram.toLowerCase();
      const matchesCode =
        !courseCode || item.code.toLowerCase().includes(codeLower);
      const matchesYear = !selectedYear || item.year === selectedYear;
      const matchesSemester =
        !selectedSemester || item.semester.toString() === selectedSemester;

      return (
        matchesQuery &&
        matchesProgram &&
        matchesCode &&
        matchesYear &&
        matchesSemester
      );
    });
  }, [items, searchQuery, selectedProgram, programLabel, courseCode, selectedYear, selectedSemester]);

  const itemsBySemester = useMemo(() => {
    const grouped: Record<string, LibraryItem[]> = {};
    filteredItems.forEach((item) => {
      const semesterKey = `Semester ${item.semester}`;
      if (!grouped[semesterKey]) grouped[semesterKey] = [];
      grouped[semesterKey].push(item);
    });
    return grouped;
  }, [filteredItems]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedProgram(null);
    setCourseCode("");
    setSelectedYear(null);
    setSelectedSemester(null);
  };

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

  const dropdownPanelClass =
    "absolute top-full left-0 z-50 mt-2 rounded-xl border border-border bg-card py-2 shadow-soft-lg";

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
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subject name..."
                className="w-full bg-transparent text-lg text-foreground placeholder-muted-foreground outline-none"
              />
            </div>

            <div className={cn("flex flex-wrap items-center gap-3 rounded-b-2xl px-6 py-3", styles.panelBg)}>
              {/* Program Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("program")}
                  className={dropdownButtonClass(!!selectedProgram)}
                >
                  {selectedProgram || "Program"}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {activeDropdown === "program" && (
                  <div className={cn(dropdownPanelClass, "w-48")}>
                    {programOptions.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => handleSelect("program", opt)}
                        className={dropdownOptionClass}
                      >
                        {opt}
                      </div>
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
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder={codePlaceholder}
                  className="w-24 bg-transparent font-bold text-foreground uppercase outline-none placeholder:normal-case"
                />
              </div>

              {/* Year Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("year")}
                  className={dropdownButtonClass(!!selectedYear)}
                >
                  {selectedYear || "Year"}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {activeDropdown === "year" && (
                  <div className={cn(dropdownPanelClass, "w-40")}>
                    {yearOptions.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => handleSelect("year", opt)}
                        className={cn(dropdownOptionClass, "border-b border-dashed border-border last:border-0")}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Semester Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("semester")}
                  className={dropdownButtonClass(!!selectedSemester)}
                >
                  {selectedSemester ? `Sem ${selectedSemester}` : "Semester"}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {activeDropdown === "semester" && (
                  <div className={cn(dropdownPanelClass, "w-32")}>
                    {semesterOptions.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => handleSelect("semester", opt)}
                        className={dropdownOptionClass}
                      >
                        Semester {opt}
                      </div>
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

        {/* Results Section */}
        {Object.keys(itemsBySemester).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(itemsBySemester)
              .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
              .map(([semester, semesterItems]) => (
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
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search size={28} />}
            title={`No ${noun.plural.toLowerCase()} found for your search.`}
            description="Try adjusting your filters or searching for something else."
          />
        )}
      </div>
    </div>
  );
}

function ResourceCard({
  item,
  programLabel,
  viewLabel,
  styles,
}: {
  item: LibraryItem;
  programLabel: string;
  viewLabel: string;
  styles: (typeof accentConfig)[LibraryAccent];
}) {
  const srcArray = Array.isArray(item.src) ? item.src : [item.src];

  return (
    <div className="lift-on-hover flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-soft-sm hover:shadow-soft-md">
      <div className="mb-4 flex items-start justify-between">
        <span className={cn("rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase", styles.badge)}>
          {programLabel}
        </span>
        <span className="text-xs font-bold text-muted-foreground">Sem {item.semester}</span>
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

        {srcArray.length === 1 ? (
          <a
            href={srcArray[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-3 font-black text-background transition-opacity hover:opacity-90 cursor-pointer"
          >
            <Download className="h-5 w-5" />
            {viewLabel}
          </a>
        ) : (
          <div className="space-y-2">
            {srcArray.map((src, idx) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
