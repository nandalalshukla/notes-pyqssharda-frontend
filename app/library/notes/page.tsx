"use client";
import React, { useState, useMemo } from "react";
import NOTES2_DATA_2024_25 from "@/DATA/Notes/BtechCS/2ndSem";
import NOTES4_DATA_2024_25 from "@/DATA/Notes/BtechCS/4thSem";
import NOTES6_DATA_2024_25 from "@/DATA/Notes/BtechCS/6thSem";
import NOTES8_DATA_2024_25 from "@/DATA/Notes/BtechCS/8thSem";

// Define the type for a Note item based on the data structure
interface Note {
  subject: string;
  code: string;
  credits: number;
  semester: number;
  year: string;
  src: string | string[];
}

export default function NotesPage() {
  const allNotes: Note[] = [
    ...NOTES2_DATA_2024_25,
    ...NOTES4_DATA_2024_25,
    ...NOTES6_DATA_2024_25,
    ...NOTES8_DATA_2024_25,
  ];

  const semesterOptions = useMemo(
    () =>
      [...new Set(allNotes.map((note) => note.semester.toString()))].sort(
        (a, b) => Number(a) - Number(b),
      ),
    [allNotes],
  );

  const yearOptions = useMemo(
    () => [...new Set(allNotes.map((note) => note.year))].sort().reverse(),
    [allNotes],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    return allNotes.filter((note) => {
      const searchLower = searchQuery.toLowerCase();
      const codeLower = courseCode.toLowerCase();

      const matchesQuery =
        !searchQuery ||
        note.subject.toLowerCase().includes(searchLower) ||
        note.code.toLowerCase().includes(searchLower);
      const matchesProgram =
        !selectedProgram ||
        "B.Tech CS".toLowerCase() === selectedProgram.toLowerCase();
      const matchesCode =
        !courseCode || note.code.toLowerCase().includes(codeLower);
      const matchesYear = !selectedYear || note.year === selectedYear;
      const matchesSemester =
        !selectedSemester || note.semester.toString() === selectedSemester;

      return (
        matchesQuery &&
        matchesProgram &&
        matchesCode &&
        matchesYear &&
        matchesSemester
      );
    });
  }, [
    allNotes,
    searchQuery,
    selectedProgram,
    courseCode,
    selectedYear,
    selectedSemester,
  ]);

  const notesBySemester = useMemo(() => {
    const grouped: Record<string, Note[]> = {};
    filteredNotes.forEach((note) => {
      const semesterKey = `Semester ${note.semester}`;
      if (!grouped[semesterKey]) {
        grouped[semesterKey] = [];
      }
      grouped[semesterKey].push(note);
    });
    return grouped;
  }, [filteredNotes]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedProgram(null);
    setCourseCode("");
    setSelectedYear(null);
    setSelectedSemester(null);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleSelect = (
    type: "program" | "year" | "semester",
    value: string,
  ) => {
    if (type === "program") setSelectedProgram(value);
    if (type === "year") setSelectedYear(value);
    if (type === "semester") setSelectedSemester(value);
    setActiveDropdown(null);
  };

  const hasActiveFilter =
    searchQuery ||
    selectedProgram ||
    courseCode ||
    selectedYear ||
    selectedSemester;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-emerald-100 to-white text-black p-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mt-8 mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="text-[#4ADE80]">Notes</span> Library
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
            Find and download comprehensive study notes for your courses.
          </p>
        </div>

        {/* Search & Filter Section */}
        <div className="flex justify-center mb-16">
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-visible transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-20">
            <div className="flex items-center px-6 py-4 bg-white rounded-t-2xl border-b-2 border-dashed border-gray-200">
              <SearchIcon className="w-6 h-6 text-gray-400 mr-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subject name..."
                className="w-full text-lg text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>

            <div className="bg-green-50 px-6 py-3 flex flex-wrap items-center gap-3 rounded-b-2xl">
              {/* Program Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("program")}
                  className={`flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border-2 ${
                    selectedProgram
                      ? "border-green-400 bg-green-50"
                      : "border-black"
                  } text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none`}
                >
                  {selectedProgram || "Program"}{" "}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                {activeDropdown === "program" && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black py-2 z-50">
                    {["B.Tech CS"].map((opt) => (
                      <div
                        key={opt}
                        onClick={() => handleSelect("program", opt)}
                        className="px-4 py-2 hover:bg-green-100 cursor-pointer text-sm text-black font-medium"
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Course Code Input */}
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border-2 border-black text-sm font-bold text-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-within:ring-2 focus-within:ring-green-400 transition-all">
                <span className="text-gray-500">Code:</span>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. CSE249"
                  className="w-24 outline-none text-gray-700 bg-transparent uppercase placeholder:normal-case font-bold"
                />
              </div>

              {/* Year Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("year")}
                  className={`flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border-2 ${
                    selectedYear
                      ? "border-green-400 bg-green-50"
                      : "border-black"
                  } text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none`}
                >
                  {selectedYear || "Year"}{" "}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                {activeDropdown === "year" && (
                  <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black py-2 z-50">
                    {yearOptions.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => handleSelect("year", opt)}
                        className="px-4 py-2 hover:bg-green-100 cursor-pointer text-sm text-black font-medium border-b border-dashed border-gray-100 last:border-0"
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
                  className={`flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border-2 ${
                    selectedSemester
                      ? "border-green-400 bg-green-50"
                      : "border-black"
                  } text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none`}
                >
                  {selectedSemester ? `Sem ${selectedSemester}` : "Semester"}{" "}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                {activeDropdown === "semester" && (
                  <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black py-2 z-50">
                    {semesterOptions.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => handleSelect("semester", opt)}
                        className="px-4 py-2 hover:bg-green-100 cursor-pointer text-sm text-black font-medium"
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
                  className="ml-auto text-sm font-black text-red-500 hover:underline decoration-2 underline-offset-2"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {Object.keys(notesBySemester).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(notesBySemester)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([semester, notes]) => (
                <div key={semester}>
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-3xl font-black">{semester} Notes</h2>
                    <span className="bg-black text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">
                      {notes.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {notes.map((note, index) => (
                      <NoteCard key={`${note.code}-${index}`} note={note} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl font-bold text-gray-700">
              No notes found for your search.
            </p>
            <p className="text-gray-500 mt-2">
              Try adjusting your filters or searching for something else.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


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

const DownloadIcon = ({ className }: { className?: string }) => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const NoteCard = ({ note }: { note: Note }) => {
  const srcArray = Array.isArray(note.src) ? note.src : [note.src];

  const extractUnitName = (filePath: string): string => {
    // Extract filename from path
    const filename = filePath.split("/").pop() || "";
    // Extract unit information (e.g., "Unit 1", "Unit 2.1", "UNIT 4")
    const unitMatch = filename.match(/^(unit|UNIT)\s*([\d.]+)/i);
    if (unitMatch) {
      return `Unit ${unitMatch[2]}`;
    }
    return filename;
  };

  return (
    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 bg-green-200 text-green-900 border-2 border-black rounded-full text-xs font-bold uppercase tracking-wider">
          B.Tech CS
        </span>
        <span className="text-xs font-bold text-gray-400">
          Sem {note.semester}
        </span>
      </div>

      <div className="mb-4 flex-grow">
        <h3 className="text-xl font-black mb-2 line-clamp-2 leading-tight">
          {note.subject}
        </h3>
        <div className="space-y-1">
          <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
            <span className="w-3 h-3 border border-black rounded-full bg-green-400"></span>
            Credits: {note.credits}
          </p>
          <p className="text-sm font-mono text-gray-500 flex items-center gap-2 pl-0.5">
            {note.code}
          </p>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-auto">
        <div className="flex items-center justify-between mb-4 text-xs font-bold text-gray-500">
          <span>{note.year}</span>
          <span>{srcArray.length} file{srcArray.length !== 1 ? 's' : ''}</span>
        </div>

        {srcArray.length === 1 ? (
          <a
            href={srcArray[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-black text-white rounded-lg font-black flex items-center justify-center gap-2 hover:bg-gray-800 transition-all border-2 border-transparent hover:border-black hover:bg-white hover:text-black active:translate-y-[1px]"
          >
            <DownloadIcon className="w-5 h-5" />
            View Note
          </a>
        ) : (
          <div className="space-y-2">
            {srcArray.map((src, idx) => (
              <a
                key={idx}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-black text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all border-2 border-transparent hover:border-black hover:bg-white hover:text-black active:translate-y-[1px]"
              >
                <DownloadIcon className="w-4 h-4" />
                {extractUnitName(src)}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
