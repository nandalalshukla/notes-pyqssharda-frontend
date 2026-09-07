"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import { Note } from "@/lib/api/notes/notes.api";
import { useNotesStore } from "@/stores/notes/notes.store";
import { Button, Input, Select } from "@/components/ui";
import { PROGRAM_OPTIONS } from "@/lib/constants/programs";

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
        semester: String(initialData.semester),
      });
    }
  }, [initialData]);

  const programs = PROGRAM_OPTIONS;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
        // For update, use FormData (backend expects multipart/form-data)
        const data = new FormData();
        data.append("title", formData.title.trim());
        data.append("program", formData.program);
        data.append("courseCode", formData.courseCode.trim().toUpperCase());
        data.append("courseName", formData.courseName.trim());
        data.append("semester", semester); // Send as string, backend will handle conversion
        if (file) {
          data.append("file", file);
        }
        await editNote(initialData._id, data);
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
        initialData ? "Failed to update notes." : "Failed to upload notes.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-soft-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-black text-foreground">
          <span className="h-4 w-4 rounded-full bg-accent-mint"></span>
          {initialData ? "Edit Notes" : "Upload Notes"}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer text-foreground transition-colors hover:text-muted-foreground"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-bold text-foreground">
            Title
          </label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Unit 1 - Introduction"
            required
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="mb-1 block text-sm font-bold text-foreground">
            File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,.ppt,.pptx,.txt,image/*"
            className="w-full cursor-pointer rounded-xl border border-input bg-card px-3.5 py-2 text-sm font-medium text-foreground outline-none transition-colors file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent-mint file:px-3 file:py-1 file:text-xs file:font-bold file:text-accent-mint-foreground hover:file:opacity-90 focus:ring-2 focus:ring-ring"
            required={!initialData}
          />
          {initialData && initialData.fileUrl && (
            <div className="mt-1 text-xs">
              Current file:{" "}
              <a
                href={initialData.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary underline"
              >
                View
              </a>
            </div>
          )}
        </div>

        {/* Program & Semester Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              Program
            </label>
            <Select
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {programs.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              Semester
            </label>
            <Select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Course Code & Name Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-bold text-foreground">
              Code
            </label>
            <Input
              type="text"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              placeholder="CSE101"
              className="uppercase"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-bold text-foreground">
              Course Name
            </label>
            <Input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              placeholder="Computer Networks"
              required
            />
          </div>
        </div>

        <Button type="submit" loading={loading} className="mt-6 w-full" size="lg">
          {loading
            ? initialData
              ? "Updating..."
              : "Uploading..."
            : initialData
              ? "Update Notes"
              : "Upload Notes"}
        </Button>
      </form>
    </div>
  );
}
