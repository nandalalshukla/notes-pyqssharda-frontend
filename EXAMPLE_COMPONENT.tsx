/**
 * Complete Example: Notes Page Component
 *
 * This file demonstrates how to use the API layer and Zustand stores
 * in a real-world Next.js component with proper error handling,
 * loading states, and user feedback.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotesStore } from "@/stores/notes.store";
import { Note } from "@/lib/api/notes.api";

export default function NotesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Destructure store state and actions
  const {
    allNotes,
    isLoading,
    error,
    fetchAllNotes,
    searchNotes,
    removeNote,
    clearError,
  } = useNotesStore();

  // Fetch notes on component mount
  useEffect(() => {
    fetchAllNotes();
  }, [fetchAllNotes]);

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Handle search with debouncing
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchNotes(query);
    } else {
      await fetchAllNotes();
    }
  };

  // Handle note deletion
  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      await removeNote(noteId);
      alert("Note deleted successfully!");
    } catch (err) {
      // Error is already in store, just show feedback
      alert("Failed to delete note");
    }
  };

  // Handle note view
  const handleView = (note: Note) => {
    window.open(note.fileUrl, "_blank");
  };

  // Handle note edit
  const handleEdit = (note: Note) => {
    router.push(`/notes/edit/${note._id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notes</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Upload Note
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search notes by title, subject, or semester..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading notes...</span>
        </div>
      )}

      {/* Notes Grid */}
      {!isLoading && allNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allNotes.map((note) => (
            <div
              key={note._id}
              className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{note.title}</h3>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>
                  <strong>Program:</strong> {note.program}
                </p>
                <p>
                  <strong>Course:</strong> {note.courseCode} - {note.courseName}
                </p>
                <p>
                  <strong>Semester:</strong> {note.semester}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(note.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Approval Status Badge */}
              <div className="mb-4">
                {note.isApproved ? (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    ✓ Approved
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    ⏳ Pending
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(note)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  View
                </button>
                <button
                  onClick={() => handleEdit(note)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(note._id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && allNotes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-semibold mb-2">No notes found</h2>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? "Try a different search term"
              : "Start by uploading your first note"}
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Upload Note
          </button>
        </div>
      )}

      {/* Upload Modal would go here */}
      {isUploadModalOpen && (
        <UploadNoteModal onClose={() => setIsUploadModalOpen(false)} />
      )}
    </div>
  );
}

/**
 * Upload Note Modal Component
 */
function UploadNoteModal({ onClose }: { onClose: () => void }) {
  const { addNote, isLoading } = useNotesStore();
  const [formData, setFormData] = useState({
    title: "",
    program: "",
    courseCode: "",
    courseName: "",
    semester: "",
    file: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file) {
      alert("Please select a file");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("program", formData.program);
    data.append("courseCode", formData.courseCode);
    data.append("courseName", formData.courseName);
    data.append("semester", formData.semester);
    data.append("file", formData.file);

    try {
      await addNote(data);
      alert("Note uploaded successfully!");
      onClose();
    } catch (error) {
      alert("Failed to upload note");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Upload Note</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Program</label>
            <input
              type="text"
              required
              value={formData.program}
              onChange={(e) =>
                setFormData({ ...formData, program: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Course Code
            </label>
            <input
              type="text"
              required
              value={formData.courseCode}
              onChange={(e) =>
                setFormData({ ...formData, courseCode: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Course Name
            </label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) =>
                setFormData({ ...formData, courseName: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Semester</label>
            <select
              required
              value={formData.semester}
              onChange={(e) =>
                setFormData({ ...formData, semester: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">File (PDF)</label>
            <input
              type="file"
              required
              accept=".pdf"
              onChange={(e) =>
                setFormData({ ...formData, file: e.target.files?.[0] || null })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
