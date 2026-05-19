"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiTrendingUp,
  FiSpeaker,
  FiCalendar,
  FiGrid,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

/* ── Nav items for section 1 ── */
const NAV_ITEMS = [
  { label: "Home", icon: FiHome, href: "/" },
  { label: "General", icon: FiGrid, href: "/?feed=general" },
  { label: "Top", icon: FiTrendingUp, href: "/?feed=top" },
  { label: "Announcements", icon: FiSpeaker, href: "/?feed=announcements" },
  { label: "Events", icon: FiCalendar, href: "/?feed=events" },
];

/* ── Club communities ── */
const CLUBS = [
  { name: "Tech Club", emoji: "💻", href: "/?community=tech" },
  { name: "Coding Society", emoji: "⌨️", href: "/?community=coding" },
  { name: "Robotics Club", emoji: "🤖", href: "/?community=robotics" },
  { name: "Photography", emoji: "📷", href: "/?community=photography" },
  { name: "Music Society", emoji: "🎵", href: "/?community=music" },
  { name: "Drama Club", emoji: "🎭", href: "/?community=drama" },
  { name: "Sports Council", emoji: "⚽", href: "/?community=sports" },
  { name: "Debate Club", emoji: "🗣️", href: "/?community=debate" },
  { name: "Art Society", emoji: "🎨", href: "/?community=art" },
  { name: "Entrepreneurship", emoji: "🚀", href: "/?community=entrepreneurship" },
];

export default function FeedSidebar() {
  const pathname = usePathname();
  const [clubsOpen, setClubsOpen] = useState(true);

  return (
    <aside className="hidden lg:flex flex-col gap-2 w-56 xl:w-60 flex-shrink-0 pt-6">

      {/* ── Section 1: Feed navigation ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--paper-surface)",
          border: "1.5px solid rgba(15,15,15,0.08)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <nav className="p-2 space-y-0.5" aria-label="Feed navigation">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const active = pathname === href || (href === "/" && pathname === "/");
            return (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
                style={{
                  background: active ? "rgba(15,15,15,0.07)" : "transparent",
                  color: active ? "var(--ink)" : "var(--muted-ink)",
                  fontWeight: active ? 700 : 500,
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(15,15,15,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Icon
                  size={16}
                  strokeWidth={active ? 2.5 : 1.8}
                  style={{ color: active ? "var(--ink)" : "var(--muted-ink)", flexShrink: 0 }}
                />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Section 2: Club communities ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--paper-surface)",
          border: "1.5px solid rgba(15,15,15,0.08)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <button
          onClick={() => setClubsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
          style={{ color: "var(--muted-ink)" }}
          aria-expanded={clubsOpen}
        >
          <span>Communities</span>
          {clubsOpen
            ? <FiChevronUp size={14} />
            : <FiChevronDown size={14} />
          }
        </button>

        <AnimatePresence initial={false}>
          {clubsOpen && (
            <motion.nav
              key="clubs"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
              aria-label="Club communities"
            >
              <div className="px-2 pb-2 space-y-0.5">
                {CLUBS.map(({ name, emoji, href }) => (
                  <Link
                    key={name}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150"
                    style={{ color: "var(--muted-ink)", fontWeight: 500 }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(15,15,15,0.04)";
                      (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--muted-ink)";
                    }}
                  >
                    {/* Club avatar */}
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                      style={{
                        background: "var(--paper-bg)",
                        border: "1.5px solid rgba(15,15,15,0.08)",
                      }}
                    >
                      {emoji}
                    </span>
                    <span className="truncate">{name}</span>
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
