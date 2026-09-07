"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import { Pyq } from "@/lib/api/pyqs/pyqs.api";
import { usePYQsStore } from "@/stores/pyqs/pyqs.store";
import { Button, Input, Select } from "@/components/ui";
import { PROGRAM_OPTIONS } from "@/lib/constants/programs";

interface PyqsFormProps {
  onClose?: () => void;
  initialData?: Pyq;
  onSuccess?: () => void;
}

export default function PyqsForm({
  onClose,
  initialData,
  onSuccess,
}: PyqsFormProps) {
  const { addPYQ, editPYQ } = usePYQsStore();
  const [formData, setFormData] = useState({
    title: "",
    program: "",
    courseCode: "",
    courseName: "",
    semester: "",
    year: "",
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
        year: initialData.year,
      });
    }
  }, [initialData]);

  const programs = PROGRAM_OPTIONS;

  const years = [
    "2024-25",
    "2023-24",
    "2022-23",
    "2021-22",
    "2020-21",
    "2019-20",
  ];

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

    // Validation logic
    if (formData.title.trim().length < 2 || formData.title.length > 100) {
      toast.error("Title must be between 2 and 100 characters");
      setLoading(false);
      return;
    }

    if (!initialData && !file) {
      toast.error("Please select a file to upload");
      setLoading(false);
      return;
    }

    if (!formData.program) {
      toast.error("Please select a program");
      setLoading(false);
      return;
    }
    if (formData.courseCode.trim().length < 2) {
      toast.error("Invalid Course Code");
      setLoading(false);
      return;
    }
    if (!formData.year) {
      toast.error("Please select a year");
      setLoading(false);
      return;
    }

    // Validate semester
    const sem = parseInt(formData.semester);
    if (isNaN(sem) || sem < 1 || sem > 12) {
      toast.error("Semester must be between 1 and 12");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("program", formData.program);
      data.append("courseCode", formData.courseCode.trim().toUpperCase());
      data.append("courseName", formData.courseName.trim());
      data.append("semester", formData.semester); // Send as string, backend handles conversion
      data.append("year", formData.year);

      if (file) {
        data.append("file", file);
      }

      if (initialData) {
        await editPYQ(initialData._id, data);
        toast.success("PYQ updated successfully!");
      } else {
        await addPYQ(data);
        toast.success("PYQ uploaded successfully! Pending approval.");
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        initialData ? "Failed to update PYQ." : "Failed to upload PYQ.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-soft-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-black text-foreground">
          <span className="h-4 w-4 rounded-full bg-accent-coral"></span>
          {initialData ? "Edit PYQ" : "Upload PYQ"}
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
            placeholder="e.g. End Term 2023 Paper"
            required
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="mb-1 block text-sm font-bold text-foreground">
            File
          </label>
          <div className="relative">
            <input
              type="file"
              id="pyq-file-upload"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
            />
            <label
              htmlFor="pyq-file-upload"
              className="flex w-full cursor-pointer items-center rounded-xl border border-input bg-card px-3.5 py-2 transition-colors focus-within:ring-2 focus-within:ring-ring"
            >
              <span className="mr-4 rounded-full bg-accent-coral px-3 py-1 text-xs font-bold whitespace-nowrap text-accent-coral-foreground">
                Choose File
              </span>
              <span className="truncate text-sm font-medium text-muted-foreground">
                {file ? file.name : "No file chosen"}
              </span>
            </label>
          </div>
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

        {/* Program & Year Row */}
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
              Year
            </label>
            <Select
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
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
              placeholder="Intro to Programming"
              required
            />
          </div>
        </div>

        {/* Semester */}
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
            <option value="">Select Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </Select>
        </div>

        <Button type="submit" loading={loading} className="mt-6 w-full" size="lg">
          {loading
            ? initialData
              ? "Updating..."
              : "Uploading..."
            : initialData
              ? "Update PYQ"
              : "Upload PYQ"}
        </Button>
      </form>
    </div>
  );
}
