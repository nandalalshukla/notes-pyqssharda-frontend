"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";

export default function PyqsForm({ onClose }: { onClose?: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    fileUrl: "",
    program: "",
    courseCode: "",
    courseName: "",
    semester: "",
    year: "", // PYQs usually have a year (e.g. 2023-24)
  });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation logic
    if (formData.title.trim().length < 2 || formData.title.length > 100) {
      toast.error("Title must be between 2 and 100 characters");
      setLoading(false);
      return;
    }
    try {
      new URL(formData.fileUrl);
    } catch {
      toast.error("Invalid File URL");
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
      console.log("Submitting PYQs Data:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("PYQ uploaded successfully!");
      setFormData({
        title: "",
        fileUrl: "",
        program: "",
        courseCode: "",
        courseName: "",
        semester: "",
        year: "",
      });
      if (onClose) onClose();
    } catch (error) {
      toast.error("Failed to upload PYQ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Upload PYQ</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. End Term 2023 Paper"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
            required
          />
        </div>

        {/* File URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File URL
          </label>
          <input
            type="url"
            name="fileUrl"
            value={formData.fileUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
            required
          />
        </div>

        {/* Program & Year Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program
            </label>
            <select
              name="program"
              value={formData.program}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm bg-white"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm bg-white"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <input
              type="text"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              placeholder="CSE101"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm uppercase"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name
            </label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              placeholder="Computer Networks"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload PYQ"}
        </button>
      </form>
    </div>
  );
}
