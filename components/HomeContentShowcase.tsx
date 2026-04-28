"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/user/authStore";
import { getAllNotes } from "@/lib/api/notes/notes.api";
import { getAllPyqs } from "@/lib/api/pyqs/pyqs.api";
import { getAllSyllabus } from "@/lib/api/syllabus/syllabus.api";
import FileViewerModal from "./FileViewerModal";

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

export default function HomeContentShowcase() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [notes, setNotes] = useState<ContentItem[]>([]);
  const [pyqs, setPyqs] = useState<ContentItem[]>([]);
  const [syllabus, setSyllabus] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<{
    url: string;
    name: string;
  } | null>(null);

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

      console.log("Fetched data:", { notesRes, pyqsRes, syllabusRes });

      // Extract arrays from response - API returns { notes: [], success: true }
      const notesArray = Array.isArray(notesRes?.notes) ? notesRes.notes : [];
      const pyqsArray = Array.isArray(pyqsRes?.pyqs) ? pyqsRes.pyqs : [];
      const syllabusArray = Array.isArray(syllabusRes?.syllabus)
        ? syllabusRes.syllabus
        : [];

      // Filter approved items and take only 3 of each
      const approvedNotes = notesArray
        .filter((n: ContentItem) => "status" in n && n.status === "approved")
        .slice(0, 3);
      const approvedPyqs = pyqsArray
        .filter((p: ContentItem) => "status" in p && p.status === "approved")
        .slice(0, 3);
      const approvedSyllabus = syllabusArray
        .filter((s: ContentItem) => "status" in s && s.status === "approved")
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
      router.push(`/dashboard?upload=${type}`);
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
    <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex-1 min-w-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-black">{title}</h3>
        <button
          onClick={() => handleAddNew(type)}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all shadow-sm"
        >
          + Add New
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              <div className="mb-3">
                <h3
                  className="font-bold text-base text-black mb-2"
                  title={item.title}
                >
                  {item.title}
                </h3>
              </div>

              <div className="space-y-2 mb-3">
                <div className="inline-block px-2 py-1 bg-gray-100 border border-black rounded-md text-xs text-black font-bold mr-2">
                  {item.courseCode}
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {item.courseName}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <div className="text-xs font-bold text-gray-500">
                  {item.program} • Sem {item.semester}
                  {item.year && ` • ${item.year}`}
                </div>
                <button
                  onClick={() =>
                    setSelectedFile({
                      url: item.fileUrl,
                      name: item.title,
                    })
                  }
                  className="text-xs font-black underline decoration-2 hover:text-blue-600 transition-colors text-black cursor-pointer"
                >
                  VIEW FILE →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
          <p className="text-sm font-medium">
            No approved {title.toLowerCase()} yet
          </p>
          <p className="text-xs mt-1">Be the first to contribute!</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-black text-center mb-8 text-black">
          Recent Approved Content
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <ContentCard title="Notes" items={notes} type="notes" />
          <ContentCard title="PYQs" items={pyqs} type="pyqs" />
          <ContentCard title="Syllabus" items={syllabus} type="syllabus" />
        </div>
      </div>

      {/* File Viewer Modal */}
      {selectedFile && (
        <FileViewerModal
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          fileUrl={selectedFile.url}
          fileName={selectedFile.name}
        />
      )}
    </>
  );
}
