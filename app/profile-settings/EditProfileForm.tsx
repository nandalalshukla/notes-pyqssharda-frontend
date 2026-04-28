"use client";

import React, { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfileSchema, EditProfileInput } from "@/lib/validators/auth.zod";
import { FiSave, FiAlertCircle } from "react-icons/fi";
import toast from "react-hot-toast";

export default function EditProfileForm() {
  const { user, isLoading, updateProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);

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
  }, [user, reset]);

  const onSubmit = async (data: EditProfileInput) => {
    setIsSaving(true);
    try {
      await updateProfile(data);
      reset(data);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-bold mb-8">Edit Profile</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Enter your full name"
            className="w-full p-4 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          />
          {errors.name && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm font-bold">
              <FiAlertCircle size={16} />
              {errors.name.message}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Letters and spaces only</p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-bold mb-2">Bio</label>
          <textarea
            {...register("bio")}
            placeholder="Tell us about yourself..."
            rows={4}
            maxLength={500}
            className="w-full p-4 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold resize-none"
          />
          {errors.bio && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm font-bold">
              <FiAlertCircle size={16} />
              {errors.bio.message}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Maximum 500 characters
          </p>
        </div>

        {/* Course */}
        <div>
          <label className="block text-sm font-bold mb-2">Course / Program</label>
          <input
            {...register("course")}
            type="text"
            placeholder="e.g., B.Tech Computer Science"
            className="w-full p-4 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          />
          {errors.course && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm font-bold">
              <FiAlertCircle size={16} />
              {errors.course.message}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Your degree program or course
          </p>
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Contact Number
          </label>
          <input
            {...register("contactNo")}
            type="tel"
            placeholder="10-digit mobile number"
            className="w-full p-4 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          />
          {errors.contactNo && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm font-bold">
              <FiAlertCircle size={16} />
              {errors.contactNo.message}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Exactly 10 digits (no spaces or dashes)
          </p>
        </div>

        {/* Email (Read-only) */}
        <div>
          <label className="block text-sm font-bold mb-2">Email Address</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full p-4 border-2 border-gray-400 rounded-xl bg-gray-100 text-gray-600 font-semibold cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Email cannot be changed
          </p>
        </div>

        {/* Username (Read-only) */}
        <div>
          <label className="block text-sm font-bold mb-2">Username</label>
          <input
            type="text"
            value={user?.username || ""}
            disabled
            className="w-full p-4 border-2 border-gray-400 rounded-xl bg-gray-100 text-gray-600 font-semibold cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Username cannot be changed
          </p>
        </div>

        {/* Submission */}
        <div className="pt-6 border-t-2 border-black">
          <button
            type="submit"
            disabled={!isDirty || isLoading || isSaving}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-black text-white font-bold border-2 border-transparent rounded-xl hover:bg-white hover:text-black hover:border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <FiSave size={20} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          {!isDirty && (
            <p className="text-center text-gray-500 text-sm mt-2">
              No changes made
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
