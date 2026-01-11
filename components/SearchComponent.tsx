"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNotesStore } from "@/stores/notes.store";
import { usePYQsStore } from "@/stores/pyqs.store";
import { useSyllabusStore } from "@/stores/syllabus.store";
import { Note } from "@/lib/api/notes.api";
import { Pyq } from "@/lib/api/pyqs.api";
import { Syllabus } from "@/lib/api/syllabus.api";

interface SearchComponentProps {
  onResultsUpdate?: (results: any[]) => void;
}

export default function SearchComponent({
  onResultsUpdate,
}: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<
    "notes" | "pyqs" | "syllabus"
  >("notes");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<(Note | Pyq | Syllabus)[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { searchNotes } = useNotesStore();
  const { searchPyqs } = usePYQsStore();
  const { searchSyllabus } = useSyllabusStore();

  const programs = [
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

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    try {
      // Build search query with filters
      let query = searchQuery;
      if (selectedProgram) query += ` program:${selectedProgram}`;
      if (selectedSemester) query += ` semester:${selectedSemester}`;
      if (courseCode) query += ` code:${courseCode}`;

      let searchResults: any[] = [];

      if (selectedType === "notes") {
        await searchNotes(query);
        // Get results from store after search
        searchResults = []; // You'll need to expose search results in store
      } else if (selectedType === "pyqs") {
        await searchPyqs(query);
        searchResults = [];
      } else {
        await searchSyllabus(query);
        searchResults = [];
      }

      setResults(searchResults);
      if (onResultsUpdate) {
        onResultsUpdate(searchResults);
      }

      toast.success(`Found ${searchResults.length} ${selectedType}`);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedProgram("");
    setSelectedSemester("");
    setCourseCode("");
    setResults([]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white p-6 rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-black flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-black bg-[#4ADE80]"></span>
          Search Library
        </h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm font-bold text-[#C084FC] hover:text-[#A855F7] transition-colors"
        >
          {showAdvanced ? "Hide" : "Advanced"} Filters
        </button>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Type Selection */}
        <div className="flex gap-2 mb-4">
          {(["notes", "pyqs", "syllabus"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
                selectedType === type
                  ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-black border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Main Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${selectedType}... (e.g., "Data Structures", "Operating System")`}
            className="w-full px-4 py-3 rounded-lg border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-base font-medium text-black placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border-2 border-black">
            {/* Program Filter */}
            <div>
              <label className="block text-sm font-bold text-black mb-1">
                Program
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium bg-white text-black"
              >
                <option value="">All Programs</option>
                {programs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div>
              <label className="block text-sm font-bold text-black mb-1">
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium bg-white text-black"
              >
                <option value="">All Semesters</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Code Filter */}
            <div>
              <label className="block text-sm font-bold text-black mb-1">
                Course Code
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g., CSE101"
                className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium uppercase text-black placeholder:text-gray-500"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            Clear Filters
          </button>
          <p className="text-sm text-gray-500">
            {results.length > 0 && `${results.length} results found`}
          </p>
        </div>
      </form>

      {/* Search Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
        <p className="text-sm font-bold text-blue-900 mb-2">💡 Search Tips:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Use specific course names for better results</li>
          <li>• Filter by program and semester to narrow down results</li>
          <li>• Search by course code for exact matches</li>
        </ul>
      </div>
    </div>
  );
}
