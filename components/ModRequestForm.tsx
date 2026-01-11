"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { requestModRole } from "@/lib/api/user.api";
import useAuthStore from "@/stores/authStore";

interface ModRequestFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function ModRequestForm({
  onClose,
  onSuccess,
}: ModRequestFormProps) {
  const { user, fetchMe } = useAuthStore();
  const [formData, setFormData] = useState({
    contactNo: "",
    motivation: "",
  });
  const [loading, setLoading] = useState(false);

  // Check if user already has a pending request
  const hasPendingRequest = user?.modRequest === "pending";
  const isApproved =
    user?.modRequest === "approved" ||
    user?.role === "mod" ||
    user?.role === "admin";
  const wasRejected = user?.modRequest === "rejected";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { contactNo, motivation } = formData;

    // Validation
    if (!contactNo || contactNo.length < 10) {
      toast.error("Please provide a valid contact number");
      setLoading(false);
      return;
    }

    if (!motivation || motivation.trim().length < 50) {
      toast.error(
        "Please write at least 50 characters about why you want to become a moderator"
      );
      setLoading(false);
      return;
    }

    try {
      await requestModRole({ contactNo, motivation });
      toast.success(
        "Moderator request submitted successfully! We'll review it soon."
      );
      await fetchMe(); // Refresh user data
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  // If user is already a mod or admin
  if (isApproved) {
    return (
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-black mb-4">
            You&apos;re already a{" "}
            {user?.role === "admin" ? "Admin" : "Moderator"}!
          </h2>
          <p className="text-gray-600 mb-6">
            You have full moderation privileges. Check your dashboard to start
            moderating content.
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  // If user has pending request
  if (hasPendingRequest) {
    return (
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-black text-black mb-4">
            Request Pending
          </h2>
          <p className="text-gray-600 mb-2">
            Your moderator request is currently under review by our admin team.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Submitted on:{" "}
            {user?.modRequestAt
              ? new Date(user.modRequestAt).toLocaleDateString()
              : "Recently"}
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-black flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-black bg-[#C084FC]"></span>
          Become a Moderator
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

      {wasRejected && (
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <p className="text-sm font-bold text-yellow-800">
            Your previous request was not approved. You can submit a new request
            with updated information.
          </p>
        </div>
      )}

      <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <p className="text-sm font-bold text-blue-900 mb-2">
          📋 Moderator Responsibilities:
        </p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>
            • Review and approve/reject uploaded notes, PYQs, and syllabus
          </li>
          <li>• Ensure content quality and relevance</li>
          <li>• Help maintain library standards</li>
          <li>• Be active and responsive</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Number */}
        <div>
          <label className="block text-sm font-bold text-black mb-1">
            Contact Number *
          </label>
          <input
            type="tel"
            name="contactNo"
            value={formData.contactNo}
            onChange={handleChange}
            placeholder="e.g., +91 9876543210"
            className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            We&apos;ll use this to contact you
          </p>
        </div>

        {/* Motivation */}
        <div>
          <label className="block text-sm font-bold text-black mb-1">
            Why do you want to be a moderator? *
          </label>
          <textarea
            name="motivation"
            value={formData.motivation}
            onChange={handleChange}
            placeholder="Tell us why you'd be a great moderator (minimum 50 characters)..."
            rows={5}
            className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500 resize-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.motivation.length}/50 characters minimum
          </p>
        </div>

        {/* Current Contributions Info */}
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-sm font-bold text-green-900">
            Your Contributions: {user?.contributions || 0}
          </p>
          <p className="text-xs text-green-700 mt-1">
            Active contributors are more likely to be approved!
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-70 disabled:cursor-not-allowed border-2 border-transparent hover:border-black"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
