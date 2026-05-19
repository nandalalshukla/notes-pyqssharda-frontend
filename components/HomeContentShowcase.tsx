"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/user/authStore";
import { getAllNotes } from "@/lib/api/notes/notes.api";
import { getAllPyqs } from "@/lib/api/pyqs/pyqs.api";
import { getAllSyllabus } from "@/lib/api/syllabus/syllabus.api";
import { motion } from "framer-motion";

interface ContentItem {
  _id: string;
  title: string;
  courseName: string;
  courseCode: string;
  program: string;
  semester: number;
  year?: string;
  fileUrl: string;
  createdAt: string;
}

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{
        background: "var(--paper-surface)",
        border: "1.5px solid #e2ddd6",
      }}
    >
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-3 w-2/3" />
      <div className="skeleton h-8 w-full mt-2" />
    </div>
  );
}

/* ── Resource item card ── */
function ResourceItem({ item, accentColor }: { item: ContentItem; accentColor: string }) {
  return (
    <motion.div
      className="paper-card-sm p-4 flex flex-col gap-2"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-start justify-between gap-2">
        <h4
          className="font-bold text-sm leading-snug line-clamp-2 flex-1"
          style={{ color: "var(--ink)" }}
          title={item.title}
        >
          {item.title}
        </h4>
        <span
          className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold border"
          style={{
            background: `${accentColor}18`,
            borderColor: `${accentColor}60`,
            color: accentColor,
          }}
        >
          {item.courseCode}
        </span>
      </div>

      <p className="text-xs font-medium line-clamp-1" style={{ color: "var(--muted-ink)" }}>
        {item.courseName}
      </p>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-semibold" style={{ color: "var(--muted-ink)" }}>
          {item.program} · Sem {item.semester}
          {item.year && ` · ${item.year}`}
        </span>
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-black transition-colors hover:opacity-70"
          style={{ color: accentColor }}
          aria-label={`View file for ${item.title}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          VIEW
        </a>
      </div>
    </motion.div>
  );
}

/* ── Empty state ── */
function EmptyState({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-10 px-4 rounded-2xl text-center"
      style={{
        border: "2px dashed #c8c3ba",
        background: "rgba(245,243,239,0.5)",
      }}
    >

      <p className="text-sm font-bold mb-1" style={{ color: "var(--ink)" }}>
        No approved {label.toLowerCase()} yet
      </p>
      <p className="text-xs mb-4" style={{ color: "var(--muted-ink)" }}>
        Be the first to contribute!
      </p>
      <button
        onClick={onAdd}
        className="text-xs font-black underline decoration-2 underline-offset-2 transition-opacity hover:opacity-60"
        style={{ color: "var(--primary-blue)" }}
      >
        + Add {label}
      </button>
    </div>
  );
}

/* ── Category config ── */
const CATEGORIES = [
  {
    key: "notes" as const,
    label: "Notes",
    icon: "📒",
    accentColor: "#16a34a",
    accentBg: "#e8faf0",
    stripeClass: "resource-card-notes",
  },
  {
    key: "pyqs" as const,
    label: "PYQs",
    icon: "📄",
    accentColor: "#ea580c",
    accentBg: "#fff3e8",
    stripeClass: "resource-card-pyqs",
  },
  {
    key: "syllabus" as const,
    label: "Syllabus",
    icon: "📋",
    accentColor: "#9333ea",
    accentBg: "#f3e8ff",
    stripeClass: "resource-card-syllabus",
  },
];

/* ── Main component ── */
export default function HomeContentShowcase() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [notes, setNotes] = useState<ContentItem[]>([]);
  const [pyqs, setPyqs] = useState<ContentItem[]>([]);
  const [syllabus, setSyllabus] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const [notesRes, pyqsRes, syllabusRes] = await Promise.all([
          getAllNotes(),
          getAllPyqs(),
          getAllSyllabus(),
        ]);

        const notesArray = Array.isArray(notesRes?.notes) ? notesRes.notes : [];
        const pyqsArray = Array.isArray(pyqsRes?.pyqs) ? pyqsRes.pyqs : [];
        const syllabusArray = Array.isArray(syllabusRes?.syllabus) ? syllabusRes.syllabus : [];

        setNotes(notesArray.filter((n: ContentItem) => "status" in n && n.status === "approved").slice(0, 3));
        setPyqs(pyqsArray.filter((p: ContentItem) => "status" in p && p.status === "approved").slice(0, 3));
        setSyllabus(syllabusArray.filter((s: ContentItem) => "status" in s && s.status === "approved").slice(0, 3));
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleAddNew = (type: "notes" | "pyqs" | "syllabus") => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else {
      router.push(`/library/dashboard?upload=${type}`);
    }
  };

  const getItems = (key: "notes" | "pyqs" | "syllabus") => {
    if (key === "notes") return notes;
    if (key === "pyqs") return pyqs;
    return syllabus;
  };

  return (
    <div className="py-12">
      {/* Section header */}
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="section-title mb-2">Recent Approved Content</h2>
        <p className="text-base font-medium" style={{ color: "var(--muted-ink)" }}>
          Fresh resources approved and ready for students
        </p>
      </motion.div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CATEGORIES.map((cat, catIdx) => {
          const items = getItems(cat.key);
          return (
            <motion.div
              key={cat.key}
              className={`paper-card overflow-hidden flex flex-col ${cat.stripeClass}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: catIdx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Card header */}
              <div className="px-5 pt-5 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border-2"
                    style={{
                      background: cat.accentBg,
                      borderColor: cat.accentColor,
                    }}
                  >
                    {cat.icon}
                  </div>
                  <h3 className="text-lg font-black" style={{ color: "var(--ink)" }}>
                    {cat.label}
                  </h3>
                </div>
                <button
                  onClick={() => handleAddNew(cat.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all hover:-translate-y-0.5 hover:opacity-80"
                  style={{
                    background: "var(--paper-surface)",
                    borderColor: `${cat.accentColor}55`,
                    color: cat.accentColor,
                  }}
                  aria-label={`Add new ${cat.label}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add New
                </button>
              </div>

              {/* Divider */}
              <div className="mx-5 border-t-2 border-dashed" style={{ borderColor: "#e2ddd6" }} />

              {/* Content */}
              <div className="px-5 py-4 flex-1 flex flex-col gap-3">
                {loading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : items.length > 0 ? (
                  items.map((item, idx) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: catIdx * 0.08 + idx * 0.06 }}
                    >
                      <ResourceItem item={item} accentColor={cat.accentColor} />
                    </motion.div>
                  ))
                ) : (
                  <EmptyState label={cat.label} onAdd={() => handleAddNew(cat.key)} />
                )}
              </div>

              {/* Footer link */}
              <div className="px-5 pb-5 pt-2">
                <a
                  href={`/library/${cat.key}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium border-2 transition-all hover:-translate-y-0.5 hover:opacity-80"
                  style={{
                    background: `${cat.accentColor}0f`,
                    borderColor: `${cat.accentColor}40`,
                    color: cat.accentColor,
                  }}
                >
                  Browse all {cat.label}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
