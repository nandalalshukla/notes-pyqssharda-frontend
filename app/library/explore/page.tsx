"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSearchStore } from "@/stores";
import { SearchParams, ResourceType, SearchResult } from "@/lib/api/search.api";
import { Badge, EmptyState, type BadgeVariant } from "@/components/ui";

export default function ExplorePage() {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ResourceType>("all");
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use search store
  const { results, isLoading, error, searchResources, clearResults } =
    useSearchStore();

  // Load search params from URL on mount
  useEffect(() => {
    const query = urlSearchParams.get("q");
    if (!query) return;

    const type = urlSearchParams.get("type") as ResourceType | null;
    const program = urlSearchParams.get("program");
    const code = urlSearchParams.get("code");
    const year = urlSearchParams.get("year");
    const semester = urlSearchParams.get("semester");

    // Set state from URL params
    setSearchQuery(query);
    if (type) setSelectedType(type);
    if (program) setSelectedProgram(program);
    if (code) setCourseCode(code);
    if (year) setSelectedYear(year);
    if (semester) setSelectedSemester(semester);

    // Auto-trigger search if URL has params
    const params: SearchParams = {
      query,
      type: type || "all",
      ...(program && { program }),
      ...(code && { courseCode: code }),
      ...(year && { year }),
      ...(semester && { semester }),
    };

    searchResources(params).then(() => {
      setHasSearched(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleSelect = (
    type: "type" | "program" | "year" | "semester",
    value: string,
  ) => {
    if (type === "type") setSelectedType(value.toLowerCase() as ResourceType);
    if (type === "program") setSelectedProgram(value);
    if (type === "year") setSelectedYear(value);
    if (type === "semester") setSelectedSemester(value);
    setActiveDropdown(null);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    const searchParams: SearchParams = {
      query: searchQuery.trim(),
      type: selectedType,
      ...(selectedProgram && { program: selectedProgram }),
      ...(courseCode && { courseCode: courseCode.toUpperCase() }),
      ...(selectedYear && { year: selectedYear }),
      ...(selectedSemester && { semester: selectedSemester }),
    };

    // Update URL search params
    const urlParams = new URLSearchParams();
    urlParams.set("q", searchParams.query);
    if (searchParams.type && searchParams.type !== "all") {
      urlParams.set("type", searchParams.type);
    }
    if (searchParams.program) {
      urlParams.set("program", searchParams.program);
    }
    if (searchParams.courseCode) {
      urlParams.set("code", searchParams.courseCode);
    }
    if (searchParams.year) {
      urlParams.set("year", searchParams.year);
    }
    if (searchParams.semester) {
      urlParams.set("semester", searchParams.semester);
    }

    // Update the browser URL without reloading
    router.push(`?${urlParams.toString()}`, { scroll: false });

    try {
      await searchResources(searchParams);
      setHasSearched(true);
      toast.success("Search completed!");
    } catch {
      toast.error("Search failed. Please try again.");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedProgram(null);
    setCourseCode("");
    setSelectedYear(null);
    setSelectedSemester(null);
    setHasSearched(false);
    clearResults();

    // Clear URL params
    router.push(window.location.pathname, { scroll: false });
  };

  const getResourceTypeLabel = (result: SearchResult): string => {
    // Determine resource type from the result object
    if (result.noteType) return "Note";
    if (result.pyqType) return "PYQ";
    if (result.syllabusType) return "Syllabus";
    return "Resource";
  };

  const getResourceTypeBadgeVariant = (result: SearchResult): BadgeVariant => {
    if (result.noteType) return "mint";
    if (result.pyqType) return "coral";
    if (result.syllabusType) return "purple";
    return "default";
  };

  const categories = [
    {
      name: "Notes",
      bg: "bg-accent-mint",
      fg: "text-accent-mint-foreground",
      icon: <FileTextIcon />,
    },
    {
      name: "PYQs",
      bg: "bg-accent-coral",
      fg: "text-accent-coral-foreground",
      icon: <FileQuestionIcon />,
    },
    {
      name: "Syllabus",
      bg: "bg-accent-purple",
      fg: "text-accent-purple-foreground",
      icon: <BookIcon />,
    },
  ];

  const newItems = [
    {
      title: "New Notes Added",
      subtitle: "Computer Networks - Unit 3",
      bg: "bg-accent-coral",
      fg: "text-accent-coral-foreground",
    },
    {
      title: "Exam Schedule",
      subtitle: "End Term Dates Announced",
      bg: "bg-accent-sky",
      fg: "text-accent-sky-foreground",
    },
    {
      title: "Result Out",
      subtitle: "Mid Term Results Declared",
      bg: "bg-primary",
      fg: "text-primary-foreground",
    },
    {
      title: "Holiday List",
      subtitle: "Upcoming Holidays 2025",
      bg: "bg-accent-mint",
      fg: "text-accent-mint-foreground",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background p-8 pb-20 text-foreground">
      <div className="pointer-events-none absolute top-10 right-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-56 w-56 rounded-full bg-accent-purple/15 blur-3xl" />

      {/* Hero Section */}
      <div className="relative mx-auto mt-10 mb-16 flex max-w-6xl flex-col items-center">
        <h1 className="mb-8 text-center text-4xl font-black tracking-tight md:text-6xl">
          <span className="text-primary">What will you</span>{" "}
          <span className="inline-flex">
            <span className="inline-block cursor-default text-accent-sky transition-transform duration-200 hover:-translate-y-2">
              l
            </span>
            <span className="inline-block cursor-default text-accent-coral transition-transform duration-200 hover:-translate-y-2">
              e
            </span>
            <span className="inline-block cursor-default text-primary transition-transform duration-200 hover:-translate-y-2">
              a
            </span>
            <span className="inline-block cursor-default text-accent-purple transition-transform duration-200 hover:-translate-y-2">
              r
            </span>
            <span className="inline-block cursor-default text-destructive transition-transform duration-200 hover:-translate-y-2">
              n
            </span>
          </span>{" "}
          <span className="text-accent-purple">today?</span>
        </h1>

        {/* Pill Buttons */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <button className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
            <NotesIcon className="h-5 w-5" />
            Notes
          </button>
          <button className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
            <FolderIcon className="h-5 w-5" />
            Syllabus
          </button>
          <button className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
            <PreviousYearQuestionsIcon className="h-5 w-5" />
            PYQs
          </button>
          <button className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
            <SparklesIcon className="h-5 w-5" /> Ask AI
          </button>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="z-20 w-full max-w-5xl overflow-visible rounded-2xl border border-border bg-card shadow-soft-md transition-all hover:shadow-soft-lg"
        >
          {/* Top Section: Search Input */}
          <div className="flex items-center rounded-t-2xl px-6 py-4">
            <SearchIcon className="mr-4 h-6 w-6 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, pyqs, topics..."
              className="w-full bg-transparent text-lg text-foreground placeholder-muted-foreground outline-none"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-full bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Bottom Section: Filters */}
          <div
            ref={dropdownRef}
            className="flex flex-wrap items-center gap-3 rounded-b-2xl border-t border-border bg-secondary px-6 py-3"
          >
            {/* Type Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("type")}
                className={`flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary ${
                  selectedType !== "all"
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
              >
                {selectedType === "all"
                  ? "All"
                  : selectedType.charAt(0).toUpperCase() +
                    selectedType.slice(1)}{" "}
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              {activeDropdown === "type" && (
                <div className="absolute top-full left-0 z-50 mt-2 w-48 rounded-xl border border-border bg-card py-2 shadow-soft-lg">
                  {[
                    { label: "All", value: "all" },
                    { label: "Notes", value: "notes" },
                    { label: "PYQs", value: "pyqs" },
                    { label: "Syllabus", value: "syllabus" },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => handleSelect("type", opt.value)}
                      className="cursor-pointer px-4 py-2 text-sm text-foreground hover:bg-primary/10"
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Program Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("program")}
                className={`flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary ${
                  selectedProgram
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
              >
                {selectedProgram || "Program"}{" "}
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              {activeDropdown === "program" && (
                <div className="absolute top-full left-0 z-50 mt-2 max-h-60 w-64 overflow-y-auto rounded-xl border border-border bg-card py-2 shadow-soft-lg">
                  {[
                    "Computer Science",
                    "Law",
                    "Business",
                    "Agriculture",
                    "Medical",
                    "Biotech",
                    "Civil",
                    "Mechanical",
                    "Electrical",
                    "Architecture",
                    "Design",
                    "Pharmacy",
                  ].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => handleSelect("program", opt)}
                      className="cursor-pointer px-4 py-2 text-sm text-foreground hover:bg-primary/10"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Course Code Input */}
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition-colors focus-within:border-primary">
              <span className="text-muted-foreground">Code:</span>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CSE101"
                className="w-24 bg-transparent text-foreground uppercase outline-none placeholder:normal-case"
              />
            </div>

            {/* Year Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("year")}
                className={`flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary ${
                  selectedYear
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
              >
                {selectedYear || "Year"} <ChevronDownIcon className="h-4 w-4" />
              </button>
              {activeDropdown === "year" && (
                <div className="absolute top-full left-0 z-50 mt-2 w-40 rounded-xl border border-border bg-card py-2 shadow-soft-lg">
                  {[
                    "2025-26",
                    "2024-25",
                    "2023-24",
                    "2022-23",
                    "2021-22",
                    "2020-21",
                  ].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => handleSelect("year", opt)}
                      className="cursor-pointer px-4 py-2 text-sm text-foreground hover:bg-primary/10"
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
                className={`flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary ${
                  selectedSemester
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
              >
                {selectedSemester || "Semester"}{" "}
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              {activeDropdown === "semester" && (
                <div className="absolute top-full left-0 z-50 mt-2 max-h-60 w-32 overflow-y-auto rounded-xl border border-border bg-card py-2 shadow-soft-lg">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((opt) => (
                    <div
                      key={opt}
                      onClick={() =>
                        handleSelect("semester", `Semester ${opt}`)
                      }
                      className="cursor-pointer px-4 py-2 text-sm text-foreground hover:bg-primary/10"
                    >
                      Semester {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Search Results Section */}
      {hasSearched && (
        <div className="relative mx-auto mb-20 max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black">
              Search Results
              {results.length > 0 && (
                <span className="ml-2 text-primary">
                  ({results.length} found)
                </span>
              )}
            </h2>
            <button
              onClick={handleClearFilters}
              className="cursor-pointer rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Clear Search
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="font-semibold text-muted-foreground">
                Searching resources...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
              <p className="font-semibold text-destructive">{error}</p>
              <button
                onClick={() => handleSearch()}
                className="mt-4 cursor-pointer rounded-full bg-destructive px-4 py-2 font-semibold text-destructive-foreground transition-colors hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={<span className="text-4xl">🔍</span>}
              title="No results found"
              description="Try adjusting your search query or filters"
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((result) => (
                <div
                  key={result._id}
                  className="cursor-pointer rounded-xl border border-border bg-card p-6 shadow-soft-sm transition-all hover:-translate-y-1 hover:shadow-soft-md"
                >
                  {/* Resource Type Badge */}
                  <div className="mb-3 flex items-start justify-between">
                    <Badge variant={getResourceTypeBadgeVariant(result)}>
                      {getResourceTypeLabel(result)}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 line-clamp-2 text-lg font-bold">
                    {result.title}
                  </h3>

                  {/* Details */}
                  <div className="mb-4 space-y-2">
                    {result.program && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-muted-foreground">
                          Program:
                        </span>
                        <span className="text-foreground">{result.program}</span>
                      </div>
                    )}
                    {result.courseCode && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-muted-foreground">
                          Code:
                        </span>
                        <span className="font-mono text-foreground">
                          {result.courseCode}
                        </span>
                      </div>
                    )}
                    {result.courseName && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-muted-foreground">
                          Course:
                        </span>
                        <span className="line-clamp-1 text-foreground">
                          {result.courseName}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      {result.year && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          {result.year}
                        </span>
                      )}
                      {result.semester && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          {result.semester}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Uploaded By */}
                  {result.userId && typeof result.userId === "object" && (
                    <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                      by{" "}
                      <span className="font-semibold text-foreground">
                        {result.userId.username}
                      </span>
                    </div>
                  )}

                  {/* View Button */}
                  <button className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover">
                    View Details
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories Icons */}
      <div className="relative mx-auto mb-20 max-w-5xl">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="group flex cursor-pointer flex-col items-center gap-3"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full shadow-soft-md transition-all group-hover:-translate-y-1 group-hover:shadow-soft-lg md:h-20 md:w-20 ${cat.bg} ${cat.fg}`}
              >
                {cat.icon}
              </div>
              <span className="text-sm font-bold md:text-base">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* "See what's new" Section */}
      <div className="relative mx-auto max-w-7xl">
        <h2 className="mb-6 text-2xl font-black">See what&apos;s new</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {newItems.map((item, index) => (
            <div
              key={index}
              className={`relative flex h-64 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-soft-md transition-all hover:-translate-y-1 hover:shadow-soft-lg ${item.bg} ${item.fg}`}
            >
              <div className="z-10">
                <h3 className="mb-2 text-2xl leading-tight font-black">
                  {item.title}
                </h3>
                <p className="font-bold opacity-80">{item.subtitle}</p>
              </div>

              <div className="z-10 mt-auto self-start rounded-full bg-card/90 p-2 text-foreground shadow-soft-sm backdrop-blur-sm">
                <ArrowRightIcon className="h-5 w-5" />
              </div>

              {/* Decorative Circle */}
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white opacity-20"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Icons Components
const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
);

const FileTextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const FileQuestionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <path d="M12 18h.01"></path>
    <path d="M12 14a2 2 0 1 0 0-4"></path>
  </svg>
);

const BookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const VideoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="23 7 16 12 23 17 23 7"></polygon>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const MoreIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const FolderIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const NotesIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4z" />
    <path d="M8 7h8" />
    <path d="M8 11h8" />
    <path d="M8 15h6" />
  </svg>
);

const PreviousYearQuestionsIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M10 10.3c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2" />
    <path d="M12 17h.01" />
  </svg>
);

const LayoutIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
  </svg>
);
