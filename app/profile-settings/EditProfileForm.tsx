"use client";

import React, { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfileSchema, EditProfileInput } from "@/lib/validators/auth.zod";
import { FiSave, FiAlertCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { Button, Input, Textarea } from "@/components/ui";

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
    <div className="rounded-2xl border border-border bg-card p-8 shadow-soft-sm">
      <h2 className="mb-8 text-2xl font-bold text-foreground">Edit Profile</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Full Name <span className="text-destructive">*</span>
          </label>
          <Input
            {...register("name")}
            type="text"
            placeholder="Enter your full name"
            error={!!errors.name}
          />
          {errors.name && (
            <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
              <FiAlertCircle size={16} />
              <span>{errors.name.message}</span>
            </div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Letters and spaces only</p>
        </div>

        {/* Bio */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Bio
          </label>
          <Textarea
            {...register("bio")}
            placeholder="Tell us about yourself..."
            rows={4}
            maxLength={500}
            error={!!errors.bio}
          />
          {errors.bio && (
            <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
              <FiAlertCircle size={16} />
              <span>{errors.bio.message}</span>
            </div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Maximum 500 characters</p>
        </div>

        {/* Course */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Course / Program
          </label>
          <Input
            {...register("course")}
            type="text"
            placeholder="e.g., B.Tech Computer Science"
            error={!!errors.course}
          />
          {errors.course && (
            <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
              <FiAlertCircle size={16} />
              <span>{errors.course.message}</span>
            </div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Your degree program or course
          </p>
        </div>

        {/* Contact Number */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Contact Number
          </label>
          <Input
            {...register("contactNo")}
            type="tel"
            placeholder="10-digit mobile number"
            error={!!errors.contactNo}
          />
          {errors.contactNo && (
            <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
              <FiAlertCircle size={16} />
              <span>{errors.contactNo.message}</span>
            </div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Exactly 10 digits (no spaces or dashes)
          </p>
        </div>

        {/* Email (Read-only) */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Email Address
          </label>
          <Input type="email" value={user?.email || ""} disabled className="cursor-not-allowed bg-muted" />
          <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        {/* Username (Read-only) */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Username
          </label>
          <Input type="text" value={user?.username || ""} disabled className="cursor-not-allowed bg-muted" />
          <p className="mt-1 text-xs text-muted-foreground">
            Username cannot be changed
          </p>
        </div>

        {/* Submission */}
        <div className="border-t border-border pt-6">
          <Button
            type="submit"
            disabled={!isDirty || isLoading || isSaving}
            loading={isSaving}
            icon={<FiSave size={20} />}
            className="w-full"
          >
            Save Changes
          </Button>
          {!isDirty && (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              No changes made
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
