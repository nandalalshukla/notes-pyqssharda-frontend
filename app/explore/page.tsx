"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ExplorePage() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

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
    value: string
  ) => {
    if (type === "type") setSelectedType(value);
    if (type === "program") setSelectedProgram(value);
    if (type === "year") setSelectedYear(value);
    if (type === "semester") setSelectedSemester(value);
    setActiveDropdown(null);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (
      !searchQuery ||
      !selectedType ||
      !selectedProgram ||
      !courseCode ||
      !selectedYear ||
      !selectedSemester
    ) {
      toast.error("Please fill all fields to search");
      return;
    }

    console.log("Searching with:", {
      searchQuery,
      selectedType,
      selectedProgram,
      courseCode,
      selectedYear,
      selectedSemester,
    });
    toast.success("Search submitted!");
  };

  const categories = [
    { name: "Notes", color: "bg-blue-300", icon: <FileTextIcon /> },
    { name: "PYQs", color: "bg-red-300", icon: <FileQuestionIcon /> },
    { name: "Syllabus", color: "bg-yellow-300", icon: <BookIcon /> },
    { name: "Videos", color: "bg-green-300", icon: <VideoIcon /> },
    { name: "Teachers", color: "bg-purple-300", icon: <UsersIcon /> },
    { name: "More", color: "bg-gray-200", icon: <MoreIcon /> },
  ];

  const newItems = [
    {
      title: "New Notes Added",
      subtitle: "Computer Networks - Unit 3",
      color: "bg-[#FF6666]",
      image: "/images/notes.png", // Placeholder
    },
    {
      title: "Exam Schedule",
      subtitle: "End Term Dates Announced",
      color: "bg-yellow-300",
      image: "/images/exam.png", // Placeholder
    },
    {
      title: "Result Out",
      subtitle: "Mid Term Results Declared",
      color: "bg-blue-300",
      image: "/images/result.png", // Placeholder
    },
    {
      title: "Holiday List",
      subtitle: "Upcoming Holidays 2025",
      color: "bg-green-300",
      image: "/images/holiday.png", // Placeholder
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-purple-100 to-white text-black p-8 pb-20">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto flex flex-col items-center mt-10 mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-center mb-8">
          <span className="text-[#4E54C8]">What will you</span>{" "}
          <span className="inline-flex">
            <span className="inline-block transition-transform duration-200 hover:-translate-y-2 text-[#00C4CC] cursor-default">
              l
            </span>
            <span className="inline-block transition-transform duration-200 hover:-translate-y-2 text-[#FF6B00] cursor-default">
              e
            </span>
            <span className="inline-block transition-transform duration-200 hover:-translate-y-2 text-[#0073E6] cursor-default">
              a
            </span>
            <span className="inline-block transition-transform duration-200 hover:-translate-y-2 text-[#D939CD] cursor-default">
              r
            </span>
            <span className="inline-block transition-transform duration-200 hover:-translate-y-2 text-[#FF3366] cursor-default">
              n
            </span>
          </span>{" "}
          <span className="text-[#8C52FF]">today?</span>
        </h1>

        {/* Pill Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button className="px-5 py-2.5 rounded-full border border-purple-300 bg-white text-gray-700 hover:bg-purple-100 hover:text-purple-700 font-semibold flex items-center gap-2 hover:bg-purple-200 transition-colors hover:cursor-pointer">
            <NotesIcon className="w-5 h-5" />
            Notes
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors hover:bg-purple-100 hover:text-purple-700 hover:cursor-pointer ">
            <FolderIcon className="w-5 h-5" />
            Syllabus
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors hover:bg-purple-100 hover:text-purple-700 hover:cursor-pointer ">
            <PreviousYearQuestionsIcon className="w-5 h-5" />
            PYQs
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors hover:bg-purple-100 hover:text-purple-700 hover:cursor-pointer ">
            <SparklesIcon className="w-5 h-5" /> Ask AI
          </button>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-purple-200 overflow-visible transition-all hover:shadow-xl z-20"
        >
          {/* Top Section: Search Input */}
          <div className="flex items-center px-6 py-4 bg-white rounded-t-2xl">
            <SearchIcon className="w-6 h-6 text-gray-400 mr-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, pyqs, topics..."
              className="w-full text-lg text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            />
            <button
              type="submit"
              className="p-2 bg-purple-600 rounded-full text-white hover:bg-purple-700 transition-colors"
            >
              <SearchIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Section: Filters */}
          <div
            ref={dropdownRef}
            className="bg-purple-50 px-6 py-3 flex flex-wrap items-center gap-3 border-t border-purple-100 rounded-b-2xl"
          >
            {/* Type Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("type")}
                className={`flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border ${
                  selectedType
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200"
                } text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors`}
              >
                {selectedType || "Type"} <ChevronDownIcon className="w-4 h-4" />
              </button>
              {activeDropdown === "type" && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {["Notes", "Syllabus", "PYQs"].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => handleSelect("type", opt)}
                      className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm text-gray-700"
                    >
                      {opt}
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
                className={`flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border ${
                  selectedProgram
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200"
                } text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors`}
              >
                {selectedProgram || "Program"}{" "}
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {activeDropdown === "program" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-60 overflow-y-auto">
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
                      className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm text-gray-700"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Course Code Input */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-gray-200 text-sm font-medium text-gray-700 focus-within:border-purple-400 transition-colors">
              <span className="text-gray-500">Code:</span>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CSE101"
                className="w-24 outline-none text-gray-700 bg-transparent uppercase placeholder:normal-case"
              />
            </div>

            {/* Year Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("year")}
                className={`flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border ${
                  selectedYear
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200"
                } text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors`}
              >
                {selectedYear || "Year"} <ChevronDownIcon className="w-4 h-4" />
              </button>
              {activeDropdown === "year" && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
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
                      className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm text-gray-700"
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
                className={`flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border ${
                  selectedSemester
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200"
                } text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors`}
              >
                {selectedSemester || "Semester"}{" "}
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {activeDropdown === "semester" && (
                <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-60 overflow-y-auto">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((opt) => (
                    <div
                      key={opt}
                      onClick={() =>
                        handleSelect("semester", `Semester ${opt}`)
                      }
                      className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm text-gray-700"
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

      {/* Categories Icons */}
      <div className="max-w-5xl mx-auto mb-20">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${cat.color}`}
              >
                {cat.icon}
              </div>
              <span className="font-bold text-sm md:text-base">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* "See what's new" Section */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-black mb-6">See what&apos;s new</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newItems.map((item, index) => (
            <div
              key={index}
              className={`h-64 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer ${item.color} relative overflow-hidden`}
            >
              <div className="z-10">
                <h3 className="text-2xl font-black leading-tight mb-2">
                  {item.title}
                </h3>
                <p className="font-bold opacity-80">{item.subtitle}</p>
              </div>

              <div className="self-start mt-auto z-10 bg-white border-2 border-black rounded-full p-2">
                <ArrowRightIcon className="w-5 h-5" />
              </div>

              {/* Decorative Circle */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-20 rounded-full pointer-events-none"></div>
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
