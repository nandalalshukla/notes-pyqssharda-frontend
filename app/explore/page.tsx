"use client";

import React from "react";
import Link from "next/link";

export default function ExplorePage() {
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
    <div className="min-h-screen bg-white text-black p-8 pb-20">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto flex flex-col items-center mt-10 mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-center mb-8">
          What will you{" "}
          <span className="inline-flex">
            <span className="text-blue-600">l</span>
            <span className="text-red-500">e</span>
            <span className="text-yellow-500">a</span>
            <span className="text-green-600">r</span>
            <span className="text-purple-600">n</span>
          </span>{" "}
          today?
        </h1>

        {/* Search Bar */}
        <div className="w-full max-w-3xl relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <SearchIcon className="w-6 h-6 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search for notes, pyqs, topics..."
            className="w-full py-4 pl-14 pr-12 text-lg font-bold rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:font-normal"
          />
          <div className="absolute inset-y-0 right-4 flex items-center cursor-pointer">
            <FilterIcon className="w-6 h-6 text-black" />
          </div>
        </div>
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
        <h2 className="text-2xl font-black mb-6">See what's new</h2>
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
