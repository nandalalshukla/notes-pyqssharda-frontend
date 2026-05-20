"use client";

import React, { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfileSchema, EditProfileInput } from "@/lib/validators/auth.zod";
import { FiSave, FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

export default function EditProfileForm() {
  const { user, isLoading, updateProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [showEmail, setShowEmail] = useState(true);
  const [showContactNo, setShowContactNo] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
      course: user?.course || "",
      contactNo: user?.contactNo || "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    reset({
      name: user?.name || "",
      bio: user?.bio || "",
      course: user?.course || "",
      contactNo: user?.contactNo || "",
    });
    setShowEmail(user?.privacySettings?.showEmail ?? true);
    setShowContactNo(user?.privacySettings?.showContactNo ?? true);
  }, [user, reset]);

  const onSubmit = async (data: EditProfileInput) => {
    setIsSaving(true);
    try {
      await updateProfile({
        ...data,
        showEmail,
        showContactNo,
      });
      reset(data);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900 mb-8">Edit Profile</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
          />
          {errors.name && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <FiAlertCircle size={16} />
              <span>{errors.name.message}</span>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-1">Letters and spaces only</p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Bio
          </label>
          <textarea
            {...register("bio")}
            placeholder="Tell us about yourself..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none transition-all"
          />
          {errors.bio && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <FiAlertCircle size={16} />
              <span>{errors.bio.message}</span>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-1">Maximum 500 characters</p>
        </div>

        {/* Course */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Course / Program
          </label>
          <input
            {...register("course")}
            type="text"
            placeholder="e.g., B.Tech Computer Science"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
          />
          {errors.course && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <FiAlertCircle size={16} />
              <span>{errors.course.message}</span>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Your degree program or course
          </p>
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Contact Number
          </label>
          <input
            {...register("contactNo")}
            type="tel"
            placeholder="10-digit mobile number"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
          />
          {errors.contactNo && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <FiAlertCircle size={16} />
              <span>{errors.contactNo.message}</span>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Exactly 10 digits (no spaces or dashes)
          </p>
        </div>

        {/* Privacy Settings Section */}
        <div className="pt-6 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Privacy Settings
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Control who can see your contact information on your profile
          </p>

          {/* Email Visibility Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              {showEmail ? (
                <FiEye size={20} className="text-blue-600" />
              ) : (
                <FiEyeOff size={20} className="text-slate-400" />
              )}
              <div>
                <p className="font-medium text-slate-900">Show Email Address</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {showEmail
                    ? "Your email is visible to everyone"
                    : "Your email will be masked (e.g., ab****@ug.sharda.ac.in)"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowEmail(!showEmail)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showEmail ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showEmail ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Phone Visibility Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              {showContactNo ? (
                <FiEye size={20} className="text-blue-600" />
              ) : (
                <FiEyeOff size={20} className="text-slate-400" />
              )}
              <div>
                <p className="font-medium text-slate-900">Show Phone Number</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {showContactNo
                    ? "Your phone number is visible to everyone"
                    : "Your phone will be masked (e.g., ********02)"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowContactNo(!showContactNo)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showContactNo ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showContactNo ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Email (Read-only) */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Username (Read-only) */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Username
          </label>
          <input
            type="text"
            value={user?.username || ""}
            disabled
            className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-1">
            Username cannot be changed
          </p>
        </div>

        {/* Submission */}
        <div className="pt-6 border-t border-slate-200">
          <button
            type="submit"
            disabled={!isDirty || isLoading || isSaving}
            className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <FiSave size={20} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          {!isDirty && (
            <p className="text-center text-slate-500 text-sm mt-3">
              No changes made
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
