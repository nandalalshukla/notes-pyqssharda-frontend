"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/user/authStore";
import { getAllNotes, Note } from "@/lib/api/notes/notes.api";
import { getAllPyqs, Pyq } from "@/lib/api/pyqs/pyqs.api";
import { getAllSyllabus, Syllabus } from "@/lib/api/syllabus/syllabus.api";
import { Badge, Skeleton } from "@/components/ui";

type ContentItem = Note | Pyq | Syllabus;

export default function HomeContentShowcase() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [notes, setNotes] = useState<ContentItem[]>([]);
  const [pyqs, setPyqs] = useState<ContentItem[]>([]);
  const [syllabus, setSyllabus] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [notesRes, pyqsRes, syllabusRes] = await Promise.all([
        getAllNotes(),
        getAllPyqs(),
        getAllSyllabus(),
      ]);

      // Extract arrays from response - API returns { notes: [], success: true }
      const notesArray = Array.isArray(notesRes?.notes) ? notesRes.notes : [];
      const pyqsArray = Array.isArray(pyqsRes?.pyqs) ? pyqsRes.pyqs : [];
      const syllabusArray = Array.isArray(syllabusRes?.syllabus)
        ? syllabusRes.syllabus
        : [];

      // Filter approved items and take only 3 of each
      const approvedNotes = (notesArray as Note[])
        .filter((n) => n.status === "approved")
        .slice(0, 3);
      const approvedPyqs = (pyqsArray as Pyq[])
        .filter((p) => p.status === "approved")
        .slice(0, 3);
      const approvedSyllabus = (syllabusArray as Syllabus[])
        .filter((s) => s.status === "approved")
        .slice(0, 3);

      setNotes(approvedNotes);
      setPyqs(approvedPyqs);
      setSyllabus(approvedSyllabus);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = (type: "notes" | "pyqs" | "syllabus") => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else {
      router.push(`/library/dashboard?upload=${type}`);
    }
  };

  const ContentCard = ({
    title,
    items,
    type,
  }: {
    title: string;
    items: ContentItem[];
    type: "notes" | "pyqs" | "syllabus";
  }) => (
    <div className="min-w-[300px] flex-1 rounded-2xl border border-border bg-card p-6 shadow-soft-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        <button
          onClick={() => handleAddNew(type)}
          className="rounded-lg border-2 border-transparent bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft-sm transition-all hover:bg-primary-hover cursor-pointer"
        >
          + Add New
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="rounded-xl border border-border bg-card p-4 shadow-soft-sm transition-shadow hover:shadow-soft-md"
            >
              <div className="mb-3">
                <h3
                  className="mb-2 text-base font-bold text-foreground"
                  title={item.title}
                >
                  {item.title}
                </h3>
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{item.courseCode}</Badge>
                <span className="text-sm font-medium text-muted-foreground">
                  {item.courseName}
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div className="text-xs font-bold text-muted-foreground">
                  {item.program} • Sem {item.semester}
                  {item.year && ` • ${item.year}`}
                </div>
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black text-foreground underline decoration-2 transition-colors hover:text-primary"
                >
                  VIEW FILE →
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border py-12 text-center text-muted-foreground">
          <p className="text-sm font-medium">
            No approved {title.toLowerCase()} yet
          </p>
          <p className="mt-1 text-xs">Be the first to contribute!</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12">
      <h2 className="mb-8 text-center text-4xl font-black text-foreground">
        Recent Approved Content
      </h2>
      <div className="flex flex-col gap-6 md:flex-row">
        <ContentCard title="Notes" items={notes} type="notes" />
        <ContentCard title="PYQs" items={pyqs} type="pyqs" />
        <ContentCard title="Syllabus" items={syllabus} type="syllabus" />
      </div>
    </div>
  );
}
