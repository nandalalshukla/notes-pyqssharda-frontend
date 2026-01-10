"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Pyq } from "@/lib/api/crud.api";
import { usePYQsStore } from "@/stores/pyqs.store";

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
        semester: initialData.semester,
        year: initialData.year,
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

  const years = [
    "2024-25",
    "2023-24",
    "2022-23",
    "2021-22",
    "2020-21",
    "2019-20",
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

    try {
      console.log(formData.courseCode, file);
      const data = new FormData();
      data.append("title", formData.title);
      data.append("program", formData.program);
      data.append("courseCode", formData.courseCode);
      data.append("courseName", formData.courseName);
      data.append("semester", formData.semester);
      data.append("year", formData.year);

      if (file) {
        data.append("file", file);
      }

      if (initialData) {
        await editPYQ(initialData._id, data);
        toast.success("PYQ updated successfully!");
      } else {
        await addPYQ(data);
        toast.success("PYQ uploaded successfully!");
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        initialData ? "Failed to update PYQ." : "Failed to upload PYQ."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-black flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-black bg-[#FF9F66]"></span>
          {initialData ? "Edit PYQ" : "Upload PYQ"}
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
            placeholder="e.g. End Term 2023 Paper"
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
              id="pyq-file-upload"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
            />
            <label
              htmlFor="pyq-file-upload"
              className="w-full px-4 py-2 rounded-lg border-2 border-black cursor-pointer bg-white flex items-center focus-within:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <span className="mr-4 py-1 px-3 rounded-full border-2 border-black text-xs font-bold bg-[#FF9F66] text-black whitespace-nowrap">
                Choose File
              </span>
              <span className="text-sm font-medium text-gray-500 truncate">
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
                className="text-blue-600 underline font-bold"
              >
                View
              </a>
            </div>
          )}
        </div>

        {/* Program & Year Row */}
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
              Year
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium bg-white text-black"
              required
            >
              <option value="">Select</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
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
              placeholder="Intro to Programming"
              className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500"
              required
            />
          </div>
        </div>

        {/* Semester */}
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
            <option value="">Select Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
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
            ? "Update PYQ"
            : "Upload PYQ"}
        </button>
      </form>
    </div>
  );
}
