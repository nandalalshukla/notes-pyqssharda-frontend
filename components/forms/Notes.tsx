"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Note } from "@/lib/api/crud.api";
import { useNotesStore } from "@/stores/notes.store";

interface NotesFormProps {
  onClose?: () => void;
  initialData?: Note;
  onSuccess?: () => void;
}

export default function NotesForm({
  onClose,
  initialData,
  onSuccess,
}: NotesFormProps) {
  const { addNote, editNote } = useNotesStore();
  const [formData, setFormData] = useState({
    title: "",
    program: "",
    courseCode: "",
    courseName: "",
    semester: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        program: initialData.program,
        courseCode: initialData.courseCode,
        courseName: initialData.courseName,
        semester: initialData.semester,
      });
    }
  }, [initialData]);

  const programs = [
    "Computer Science",
    "Law",
    "Business",
    "Agriculture",
    "Medical",
    "Biotech",
    "Civil",
    "Mechanical",
    "Electrical",
    "Architecture",
    "Design",
    "Pharmacy",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { title, program, courseCode, courseName, semester } = formData;

    // Validation logic
    if (title.trim().length < 2 || title.length > 100) {
      toast.error("Title must be between 2 and 100 characters");
      setLoading(false);
      return;
    }

    if (!initialData && !file) {
      toast.error("Please select a file");
      setLoading(false);
      return;
    }

    if (program.length < 2 || program.length > 100) {
      toast.error("Please select a valid program");
      setLoading(false);
      return;
    }
    if (courseCode.trim().length < 3 || courseCode.length > 10) {
      toast.error("Course Code must be between 3 and 10 characters");
      setLoading(false);
      return;
    }
    if (courseName.trim().length < 2 || courseName.length > 100) {
      toast.error("Course Name must be between 2 and 100 characters");
      setLoading(false);
      return;
    }
    const sem = parseInt(semester);
    if (isNaN(sem) || sem < 1 || sem > 12) {
      toast.error("Semester must be between 1 and 12");
      setLoading(false);
      return;
    }

    try {
      if (initialData) {
        // For update, send JSON object (backend expects req.body fields)
        await editNote(initialData._id, {
          ...initialData,
          title: formData.title,
          program: formData.program,
          courseCode: formData.courseCode,
          courseName: formData.courseName,
          semester: formData.semester,
          // Keep existing fileUrl if no new file, or handle file upload separately
          fileUrl: initialData.fileUrl,
        });
        toast.success("Notes updated successfully!");
      } else {
        // For create, use FormData (file upload)
        const data = new FormData();
        data.append("title", formData.title.trim());
        data.append("program", formData.program);
        data.append("courseCode", formData.courseCode.trim().toUpperCase());
        data.append("courseName", formData.courseName.trim());
        data.append("semester", semester); // Send as string, backend will handle conversion
        if (file) {
          data.append("file", file);
        }
        await addNote(data);
        toast.success("Notes uploaded successfully! Pending approval.");
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      toast.error(
        initialData ? "Failed to update notes." : "Failed to upload notes."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-black flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-black bg-[#4ADE80]"></span>
          {initialData ? "Edit Notes" : "Upload Notes"}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-black hover:text-gray-600 transition-colors font-bold text-xl"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-black mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Unit 1 - Introduction"
            className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500"
            required
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-bold text-black mb-1">
            File
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.ppt,.pptx,.txt,image/*"
              className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-2 file:border-black file:text-xs file:font-bold file:bg-[#4ADE80] file:text-black hover:file:bg-[#22c55e] cursor-pointer"
              required={!initialData}
            />
          </div>
          {initialData && initialData.fileUrl && (
            <div className="mt-1 text-xs">
              Current file:{" "}
              <a
                href={initialData.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline font-bold"
              >
                View
              </a>
            </div>
          )}
        </div>

        {/* Program & Semester Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Program
            </label>
            <select
              name="program"
              value={formData.program}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium bg-white text-black"
              required
            >
              <option value="">Select</option>
              {programs.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Semester
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium bg-white text-black"
              required
            >
              <option value="">Select</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Code & Name Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-bold text-black mb-1">
              Code
            </label>
            <input
              type="text"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              placeholder="CSE101"
              className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium uppercase text-black placeholder:text-gray-500"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-bold text-black mb-1">
              Course Name
            </label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              placeholder="Computer Networks"
              className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-70 disabled:cursor-not-allowed border-2 border-transparent hover:border-black"
        >
          {loading
            ? initialData
              ? "Updating..."
              : "Uploading..."
            : initialData
            ? "Update Notes"
            : "Upload Notes"}
        </button>
      </form>
    </div>
  );
}
