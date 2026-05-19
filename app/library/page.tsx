"use client";

import Link from "next/link";
import HomeContentShowcase from "@/components/HomeContentShowcase";
import { motion, useAnimation } from "framer-motion";

export default function LibraryPage() {
  const flipControls = useAnimation();

  const handleFlipHover = async () => {
    await flipControls.start({
      rotateY: 360,
      transition: { duration: 0.65, ease: "easeInOut" },
    });
    flipControls.set({ rotateY: 0 });
  };

  return (
    <div
      className="min-h-screen font-sans pb-28 relative overflow-hidden"
      style={{ background: "var(--paper-bg)" }}
    >
      {/* ── Decorative background blobs ── */}
      <div
        className="absolute top-0 left-0 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
          transform: "translate(-30%, -30%)",
        }}
      />
      <div
        className="absolute top-40 right-0 w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)",
          transform: "translateX(30%)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)",
          transform: "translateX(-50%) translateY(40%)",
        }}
      />

      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section className="container-main pt-14 md:pt-20 pb-16 text-center relative">

        {/* Floating decorative stickers */}
        <motion.div
          className="deco-float hidden lg:block"
          style={{ top: "2rem", left: "2rem" }}
          animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{
              background: "var(--paper-surface)",
              border: "2px solid var(--border-ink)",
              boxShadow: "3px 3px 0 var(--border-ink)",
            }}
          >
            📚
          </div>
        </motion.div>

        <motion.div
          className="deco-float hidden lg:block"
          style={{ top: "4rem", right: "3rem" }}
          animate={{ y: [0, -8, 0], rotate: [0, -4, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
            style={{
              background: "var(--paper-surface)",
              border: "2px solid var(--border-ink)",
              boxShadow: "3px 3px 0 var(--border-ink)",
            }}
          >
            ✏️
          </div>
        </motion.div>

        <motion.div
          className="deco-float hidden lg:block"
          style={{ bottom: "2rem", left: "4rem" }}
          animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: "var(--paper-surface)",
              border: "2px solid var(--border-ink)",
              boxShadow: "3px 3px 0 var(--border-ink)",
            }}
          >
            ⭐
          </div>
        </motion.div>

        <motion.div
          className="deco-float hidden lg:block"
          style={{ bottom: "3rem", right: "5rem" }}
          animate={{ y: [0, -9, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: "var(--paper-surface)",
              border: "2px solid var(--border-ink)",
              boxShadow: "3px 3px 0 var(--border-ink)",
            }}
          >
            📝
          </div>
        </motion.div>

        {/* Category pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/library/pyqs"
            className="btn-pill"
            style={{ background: "#fff3e8", color: "var(--ink)" }}
          >
            <span className="text-base">📄</span> PYQs
          </Link>
          <Link
            href="/library/notes"
            className="btn-pill"
            style={{ background: "#e8faf0", color: "var(--ink)" }}
          >
            <span className="text-base">📒</span> Notes
          </Link>
          <Link
            href="/library/syllabus"
            className="btn-pill"
            style={{ background: "#f3e8ff", color: "var(--ink)" }}
          >
            <span className="text-base">📋</span> Syllabus
          </Link>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          className="mb-5 max-w-2xl mx-auto font-black leading-tight tracking-tight"
          style={{ fontSize: "clamp(2.5rem, 5.5vw, 4rem)", color: "var(--ink)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Ace your exams at{" "}
          <br className="hidden md:block" />
          <motion.span
            className="relative inline-block mt-2 cursor-default"
            style={{ perspective: "800px", transformStyle: "preserve-3d" }}
            animate={flipControls}
            onMouseEnter={handleFlipHover}
          >
            {/* Orange sticker background */}
            <span
              className="absolute inset-0"
              style={{
                background: "var(--accent-orange)",
                border: "2px solid var(--border-ink)",
                boxShadow: "4px 4px 0 var(--border-ink)",
                borderRadius: "6px",
                transform: "rotate(-1.5deg)",
              }}
            />
            <span
              className="relative px-4 py-1 block font-black"
              style={{ color: "var(--ink)" }}
            >
              Sharda Online Library
            </span>
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: "var(--muted-ink)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Your one-stop destination for Sharda University semester exams.
          Find Notes, PYQs, and Syllabus — or contribute your own resources to help the community.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/library/explore"
            className="btn-primary"
            style={{ minWidth: "140px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Explore
          </Link>
          <Link
            href="/library/dashboard"
            className="btn-secondary"
            style={{ minWidth: "140px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Contribute
          </Link>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          RECENT APPROVED CONTENT
      ══════════════════════════════════════ */}
      <section className="container-main">
        <HomeContentShowcase />
      </section>
    </div>
  );
}
