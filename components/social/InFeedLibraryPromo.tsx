"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";
import { postTypeMeta } from "./postMeta";
import { cn } from "@/lib/utils/cn";

/**
 * A promo card for the library, shown between feed posts.
 *
 * Styled to sit in the feed the way a sponsored post does — same card
 * shape, same spacing — but labelled so it never reads as something a
 * student wrote. It rotates through the three library sections on a timer.
 *
 * Note this is NOT what carries the homepage's internal links for search:
 * it only renders once the feed has loaded client-side, so it is absent
 * from the server-rendered HTML. The footer's library links are the
 * server-rendered ones. This exists to convert readers, not crawlers.
 */

const SLIDES = [
  {
    href: "/library/pyqs",
    eyebrow: "Previous Year Questions",
    title: "Thousands of Sharda past papers",
    body: "End-term question papers from every school, filed by programme, semester and year.",
    cta: "Browse PYQs",
    gradient: "from-accent-coral/25 to-accent-coral/5",
    chip: "bg-accent-coral text-accent-coral-foreground",
  },
  {
    href: "/library/notes",
    eyebrow: "Semester Notes",
    title: "Notes from students who've sat the paper",
    body: "Unit-wise study notes organised by course code, so you can find the topic you're stuck on.",
    cta: "Browse Notes",
    gradient: "from-accent-mint/25 to-accent-mint/5",
    chip: "bg-accent-mint text-accent-mint-foreground",
  },
  {
    href: "/library/syllabus",
    eyebrow: "Syllabus",
    title: "Know exactly what's examinable",
    body: "The official unit breakdown for your course, before you start revising.",
    cta: "Browse Syllabus",
    gradient: "from-accent-purple/25 to-accent-purple/5",
    chip: "bg-accent-purple text-accent-purple-foreground",
  },
];

const ROTATE_MS = 5000;

export default function InFeedLibraryPromo({
  className,
}: {
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    // Respect a reader who has asked the OS to reduce motion: for them the
    // carousel simply doesn't auto-advance, and the arrows still work.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (paused || reduced) return;

    timer.current = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      ROTATE_MS,
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  const LibraryIcon = postTypeMeta.general.Icon;

  return (
    <section
      aria-label="From the Sharda online library"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft-sm",
        className,
      )}
      // Pause while the reader is actually engaging with it, so a slide
      // can't change out from under a click.
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Labelled like a sponsored post: a promo that reads as a student's
          post would be a dark pattern, and it's the one thing that makes
          this acceptable in a social feed. */}
      <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
        <span className="flex items-center gap-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          <LibraryIcon size={13} />
          From the library
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous"
            className="cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next"
            className="cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* All three slides stay mounted and the track translates, rather
          than swapping the active slide in and out. Keeps the other two
          links real and focusable, and lets the browser animate a single
          transform instead of remounting on every tick. */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map((s) => (
            <div key={s.href} className="w-full shrink-0">
              <Link
                href={s.href}
                className={cn(
                  "block bg-gradient-to-br p-6 transition-opacity hover:opacity-95",
                  s.gradient,
                )}
              >
                <span
                  className={cn(
                    "mb-3 inline-block rounded-full px-3 py-1 text-xs font-black tracking-wider uppercase",
                    s.chip,
                  )}
                >
                  {s.eyebrow}
                </span>
                <h3 className="mb-2 text-xl leading-snug font-black text-foreground">
                  {s.title}
                </h3>
                <p className="mb-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
                <span className="inline-flex items-center gap-1.5 font-bold text-primary">
                  {s.cta}
                  <FiArrowRight size={16} />
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-1.5 pb-4">
        {SLIDES.map((s, i) => (
          <button
            key={s.href}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show ${s.eyebrow}`}
            aria-current={i === index}
            className={cn(
              "h-1.5 cursor-pointer rounded-full transition-all",
              i === index ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground",
            )}
          />
        ))}
      </div>
    </section>
  );
}
