"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { requestModRole } from "@/lib/api/user/user.api";
import useAuthStore from "@/stores/user/authStore";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
        "Please write at least 50 characters about why you want to become a moderator",
      );
      setLoading(false);
      return;
    }

    try {
      await requestModRole({ contactNo, motivation });
      toast.success(
        "Moderator request submitted successfully! We'll review it soon.",
      );
      await fetchMe(); // Refresh user data
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit request";
      toast.error(errorMessage);
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
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-300 rounded-full opacity-50 blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-300 rounded-full opacity-50 blur-xl"></div>

        <div className="text-center relative z-10">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <h2 className="text-3xl font-black text-black mb-4">
            Request Pending
          </h2>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-gray-800 font-medium mb-2">
              Your moderator request is currently under review by our admin
              team.
            </p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Submitted on:{" "}
              {user?.modRequestAt
                ? new Date(user.modRequestAt).toLocaleDateString()
                : "Recently"}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[2px] active:scale-[0.98] ring-2 ring-black"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full -z-0"></div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-2xl font-black text-black flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg border-2 border-black bg-[#C084FC] flex items-center justify-center text-white text-sm">
            👑
          </span>
          <span className="leading-tight">
            Become a<br />
            Moderator
          </span>
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center bg-gray-100 hover:bg-red-100 transition-colors font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {wasRejected && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
          <p className="text-sm font-bold text-red-800">
            ⚠️ Your previous request was not approved. You can submit a new
            request with updated information.
          </p>
        </div>
      )}

      <div className="mb-6 p-5 bg-blue-50 border-2 border-blue-200 rounded-xl relative z-10">
        <p className="text-sm font-black text-blue-900 mb-3 uppercase tracking-wide">
          📋 Responsibilities:
        </p>
        <ul className="text-sm text-blue-800 space-y-2 font-medium">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">●</span>
            Review and approve uploaded resources
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">●</span>
            Ensure content quality standards
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">●</span>
            Help maintain library integrity
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        {/* Contact Number */}
        <div>
          <label className="block text-sm font-bold text-black mb-1.5 uppercase tracking-wide">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="contactNo"
            value={formData.contactNo}
            onChange={handleChange}
            placeholder="+91 9876543210"
            className="w-full px-4 py-3 rounded-xl border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 outline-none transition-all text-sm font-bold text-black placeholder:text-gray-400 bg-gray-50 focus:bg-white"
            required
          />
        </div>

        {/* Motivation */}
        <div>
          <label className="block text-sm font-bold text-black mb-1.5 uppercase tracking-wide">
            Why you? <span className="text-red-500">*</span>
          </label>
          <textarea
            name="motivation"
            value={formData.motivation}
            onChange={handleChange}
            placeholder="Tell us why you'd be a great moderator (minimum 50 characters)..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 outline-none transition-all text-sm font-medium text-black placeholder:text-gray-400 bg-gray-50 focus:bg-white resize-none"
            required
          />
          <div className="flex justify-end mt-1">
            <span
              className={`text-xs font-bold ${
                formData.motivation.length < 50
                  ? "text-orange-500"
                  : "text-green-600"
              }`}
            >
              {formData.motivation.length}/50 chars
            </span>
          </div>
        </div>

        {/* Current Contributions Info */}
        <div className="px-4 py-3 bg-green-50 border-2 border-dashed border-green-300 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-green-900 uppercase">
              Your Contributions
            </p>
            <p className="text-xs text-green-700">Active users preferred</p>
          </div>
          <span className="text-2xl font-black text-green-600">
            {user?.contributions || 0}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-black hover:bg-gray-800 text-white font-black py-4 rounded-xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-[1px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed border-2 border-transparent"
        >
          {loading ? "Submitting Request..." : "Submit Application 🚀"}
        </button>
      </form>
    </div>
  );
}
