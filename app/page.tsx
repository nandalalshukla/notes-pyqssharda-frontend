import Link from "next/link";
import HomeContentShowcase from "@/components/HomeContentShowcase";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] flex flex-col items-center text-center px-4 pt-10 relative overflow-hidden font-sans pb-24">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-20 w-16 h-16 bg-blue-400 rounded-full opacity-20 blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-400 rounded-full opacity-20 blur-xl animate-pulse delay-700"></div>

      {/* Three Colored Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 animate-fade-in-up">
        <Link
          className="px-8 py-3 rounded-full bg-[#FF9F66] border-2 border-black ring-2 ring-white/30 ring-inset font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-default hover:cursor-pointer"
          href="/pyqs"
        >
          PYQs
        </Link>
        <Link
          className="px-8 py-3 rounded-full bg-[#4ADE80] border-2 border-black ring-2 ring-white/30 ring-inset font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-default hover:cursor-pointer"
          href="/notes"
        >
          Notes
        </Link>
        <Link
          className="px-8 py-3 rounded-full bg-[#C084FC] border-2 border-black ring-2 ring-white/30 ring-inset font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-default hover:cursor-pointer"
          href="/syllabus"
        >
          Syllabus
        </Link>
      </div>

      {/* Main Headline */}
      <h1 className="text-5xl md:text-7xl font-black text-black mb-6 tracking-tight leading-tight animate-fade-in-up delay-100">
        Ace your exams at <br className="hidden md:block" />
        <span className="relative inline-block mt-2 transform -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 cursor-pointer">
          <span className="absolute inset-0 bg-[#FF9F66] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></span>
          <span className="relative px-4 py-1 block">
            Sharda Online Library
          </span>
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-10 leading-relaxed animate-fade-in-up delay-200">
        Your one-stop destination for everything you need for Sharda Universtiy semester exams. 
        Just click on the Notes, PYQs or Syllabus buttons and find what you need.

        <br />
        You can also contribute by sharing your notes and PYQs with the community.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap justify-center gap-6 mb-16 animate-fade-in-up delay-300">
        <Link
          href="/pyqs"
          className="px-8 py-4 bg-[#3B82F6] text-white font-bold rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          Explore
        </Link>
        <Link
          href="/dashboard"
          className="px-8 py-4 bg-[#F3F4F6] text-black font-bold rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          Contribute
        </Link>
      </div>

      {/* Content Showcase Section */}
      <HomeContentShowcase />

    </div>
  );
}
