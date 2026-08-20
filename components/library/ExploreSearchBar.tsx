"use client";

import React from "react";
import { ResourceType } from "@/lib/api/search.api";
import {
  ChevronDownIcon,
  NotesIcon,
  FolderIcon,
  PreviousYearQuestionsIcon,
  SearchIcon,
  SparklesIcon,
} from "./icons";

const TYPE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Notes", value: "notes" },
  { label: "PYQs", value: "pyqs" },
  { label: "Syllabus", value: "syllabus" },
];

const PROGRAM_OPTIONS = [
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
];

const YEAR_OPTIONS = [
  "2025-26",
  "2024-25",
  "2023-24",
  "2022-23",
  "2021-22",
  "2020-21",
];

export interface ExploreSearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedType: ResourceType;
  selectedProgram: string | null;
  courseCode: string;
  onCourseCodeChange: (value: string) => void;
  selectedYear: string | null;
  selectedSemester: string | null;
  activeDropdown: string | null;
  onToggleDropdown: (name: string) => void;
  onCloseDropdown: () => void;
  onSelect: (
    type: "type" | "program" | "year" | "semester",
    value: string,
  ) => void;
  onSubmit: (e?: React.FormEvent) => void;
}

export function ExploreSearchBar({
  searchQuery,
  onSearchQueryChange,
  selectedType,
  selectedProgram,
  courseCode,
  onCourseCodeChange,
  selectedYear,
  selectedSemester,
  activeDropdown,
  onToggleDropdown,
  onCloseDropdown,
  onSelect,
  onSubmit,
}: ExploreSearchBarProps) {
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onCloseDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
        onSubmit={onSubmit}
        className="z-20 w-full max-w-5xl overflow-visible rounded-2xl border border-border bg-card shadow-soft-md transition-all hover:shadow-soft-lg"
      >
        {/* Top Section: Search Input */}
        <div className="flex items-center rounded-t-2xl px-6 py-4">
          <SearchIcon className="mr-4 h-6 w-6 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
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
              onClick={() => onToggleDropdown("type")}
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
                {TYPE_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => onSelect("type", opt.value)}
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
              onClick={() => onToggleDropdown("program")}
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
                {PROGRAM_OPTIONS.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => onSelect("program", opt)}
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
              onChange={(e) => onCourseCodeChange(e.target.value)}
              placeholder="e.g. CSE101"
              className="w-24 bg-transparent text-foreground uppercase outline-none placeholder:normal-case"
            />
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => onToggleDropdown("year")}
              className={`flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary ${
                selectedYear ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              {selectedYear || "Year"} <ChevronDownIcon className="h-4 w-4" />
            </button>
            {activeDropdown === "year" && (
              <div className="absolute top-full left-0 z-50 mt-2 w-40 rounded-xl border border-border bg-card py-2 shadow-soft-lg">
                {YEAR_OPTIONS.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => onSelect("year", opt)}
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
              onClick={() => onToggleDropdown("semester")}
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
                    onClick={() => onSelect("semester", `Semester ${opt}`)}
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
    </>
  );
}
