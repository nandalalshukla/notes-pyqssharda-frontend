"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiFileText,
  FiBookOpen,
  FiClipboard,
} from "react-icons/fi";
import { cn } from "@/lib/utils/cn";

/**
 * A bold promo card for the library, shown once in the feed.
 *
 * Styled to stand apart from the posts around it rather than blend in: a
 * solid accent fill, a hard ink border and oversized type, so it reads
 * instantly as "this is the library", not as one more student post. It
 * rotates through the three sections on a timer.
 *
 * Note this is NOT what carries the homepage's internal links for search:
 * it only renders once the feed has loaded client-side, so it is absent
 * from the server-rendered HTML. The footer's library links are the
 * server-rendered ones. This exists to convert readers, not crawlers.
 */

const SLIDES = [
  {
    href: "/library/pyqs",
    Icon: FiFileText,
    kicker: "Previous Year Questions",
    title: "5,000+ past papers",
    body: "Every school, every semester, back five years.",
    cta: "Browse PYQs",
    // A solid accent fill paired with its own foreground token, so contrast
    // holds in both light and dark themes without a second set of overrides.
    surface: "bg-accent-coral text-accent-coral-foreground",
    dot: "bg-accent-coral",
  },
  {
    href: "/library/notes",
    Icon: FiBookOpen,
    kicker: "Semester Notes",
    title: "Notes that actually helped",
    body: "Unit-wise, written by students who sat the paper.",
    cta: "Browse Notes",
    surface: "bg-accent-mint text-accent-mint-foreground",
    dot: "bg-accent-mint",
  },
  {
    href: "/library/syllabus",
    Icon: FiClipboard,
    kicker: "Syllabus",
    title: "Know what's examinable",
    body: "The official unit breakdown, before you start revising.",
    cta: "Browse Syllabus",
    surface: "bg-accent-purple text-accent-purple-foreground",
    dot: "bg-accent-purple",
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
    // carousel simply doesn't auto-advance, and the controls still work.
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

  return (
    <section
      aria-label="From the Sharda online library"
      className={cn(
        // The hard 2px ink border is what makes this read as a distinct
        // object in the feed rather than one more soft-edged card.
        "relative overflow-hidden rounded-2xl border-2 border-ink bg-card shadow-soft-lg",
        className,
      )}
      // Pause while the reader is actually engaging, so a slide can't
      // change out from under a click.
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Sliding track. All three slides stay mounted and the track
          translates — keeps the other two links real and focusable, and
          animates one transform instead of remounting on each tick. */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map(({ href, Icon, kicker, title, body, cta, surface }) => (
            <div key={href} className="w-full shrink-0">
              <Link
                href={href}
                className={cn(
                  "group flex items-center gap-5 p-6 sm:gap-6 sm:p-8",
                  surface,
                )}
              >
                {/* Icon tile outlined in the current text colour, so it
                    stays legible whichever accent is showing. */}
                <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-current sm:flex">
                  <Icon size={30} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="mb-1.5 block text-[11px] font-black tracking-[0.14em] uppercase opacity-70">
                    {kicker}
                  </span>
                  <span className="block text-2xl leading-tight font-black sm:text-3xl">
                    {title}
                  </span>
                  <span className="mt-1.5 block text-sm font-medium opacity-80">
                    {body}
                  </span>
                </span>

                {/* Ink on accent is the strongest contrast pair the palette
                    offers, which is what keeps the CTA unmissable. */}
                <span className="hidden shrink-0 items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-black text-background transition-transform group-hover:translate-x-0.5 md:inline-flex">
                  {cta}
                  <FiArrowRight size={16} />
                </span>
                <FiArrowRight
                  size={22}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5 md:hidden"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Controls sit on a neutral strip so they never fight the accent. */}
      <div className="flex items-center justify-between border-t-2 border-ink bg-card px-5 py-2.5">
        <span className="text-[11px] font-black tracking-[0.14em] text-muted-foreground uppercase">
          Sharda Online Library
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((s, i) => (
              <button
                key={s.href}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${s.kicker}`}
                aria-current={i === index}
                className={cn(
                  "h-2 cursor-pointer rounded-full transition-all",
                  i === index
                    ? cn("w-7", s.dot)
                    : "w-2 bg-border hover:bg-muted-foreground",
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous"
              className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next"
              className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
