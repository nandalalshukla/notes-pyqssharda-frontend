import Link from "next/link";
import HomeContentShowcase from "@/components/HomeContentShowcase";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background px-4 pt-10 pb-24 text-center font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-20 h-16 w-16 animate-pulse rounded-full bg-primary/30 blur-xl"></div>
      <div className="absolute right-20 bottom-20 h-24 w-24 animate-pulse rounded-full bg-accent-purple/30 blur-xl delay-700"></div>

      {/* Three Colored Buttons */}
      <div className="mb-8 flex flex-wrap justify-center gap-3 animate-fade-in-up">
        <Link
          className="lift-on-hover rounded-full bg-accent-coral px-8 py-3 font-semibold text-accent-coral-foreground shadow-soft-sm transition-shadow hover:shadow-soft-md"
          href="/library/pyqs"
        >
          PYQs
        </Link>
        <Link
          className="lift-on-hover rounded-full bg-accent-mint px-8 py-3 font-semibold text-accent-mint-foreground shadow-soft-sm transition-shadow hover:shadow-soft-md"
          href="/library/notes"
        >
          Notes
        </Link>
        <Link
          className="lift-on-hover rounded-full bg-accent-purple px-8 py-3 font-semibold text-accent-purple-foreground shadow-soft-sm transition-shadow hover:shadow-soft-md"
          href="/library/syllabus"
        >
          Syllabus
        </Link>
      </div>

      {/* Main Headline */}
      <h1 className="mb-6 animate-fade-in-up text-5xl leading-tight font-black tracking-tight text-foreground delay-100 md:text-7xl">
        Ace your exams at <br className="hidden md:block" />
        <span className="mt-2 inline-block bg-linear-to-r from-primary to-accent-purple bg-clip-text px-1 text-transparent">
          Sharda Online Library
        </span>
      </h1>

      {/* Subheadline */}
      <p className="mb-10 max-w-2xl animate-fade-in-up text-lg leading-relaxed text-muted-foreground delay-200 md:text-xl">
        Your one-stop destination for everything you need for Sharda University semester exams.
        Just click on the Notes, PYQs or Syllabus buttons and find what you need.
        <br />
        You can also contribute by sharing your notes and PYQs with the community.
      </p>

      {/* CTA Buttons */}
      <div className="mb-16 flex flex-wrap justify-center gap-6 animate-fade-in-up delay-300">
        <Link
          href="/library/pyqs"
          className="lift-on-hover rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-soft-md transition-shadow hover:shadow-soft-lg"
        >
          Explore
        </Link>
        <Link
          href="/library/dashboard"
          className="lift-on-hover rounded-xl border border-border bg-card px-8 py-4 font-semibold text-foreground shadow-soft-sm transition-shadow hover:shadow-soft-md"
        >
          Contribute
        </Link>
      </div>

      {/* Content Showcase Section */}
      <HomeContentShowcase />
    </div>
  );
}
