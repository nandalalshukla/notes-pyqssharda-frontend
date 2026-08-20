"use client";

import React, { useRef, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { FiUpload, FiX, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import toast from "react-hot-toast";
import { Avatar, Button } from "@/components/ui";

export default function ProfilePictureSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading, updateProfile, removeProfilePicture } = useProfile();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      await updateProfile({ profilePic: selectedFile });
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error("Failed to upload profile picture");
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove your profile picture?")) return;

    setIsRemoving(true);
    try {
      await removeProfilePicture();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      toast.error("Failed to remove profile picture");
    } finally {
      setIsRemoving(false);
    }
  };

  const currentProfilePic = previewUrl || user?.profilePic?.url;

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-soft-sm">
      <h2 className="mb-8 text-2xl font-bold text-foreground">
        Profile Picture
      </h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Current Profile Picture */}
        <div className="flex flex-col items-center">
          <Avatar src={currentProfilePic} alt={user?.name || "Profile"} size="xl" className="mb-6" />
          <p className="text-center font-semibold text-foreground">
            {user?.name}
          </p>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            @{user?.username}
          </p>
        </div>

        {/* Upload Area */}
        <div className="flex flex-col justify-center space-y-4">
          {selectedFile && (
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
              <p className="mb-3 text-xs font-semibold text-primary">
                Preview
              </p>
              <div className="h-32 w-full overflow-hidden rounded-lg border border-primary/20 bg-card">
                {previewUrl && (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <p className="mt-2 truncate text-xs text-primary/80">
                {selectedFile.name}
              </p>
            </div>
          )}

          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card p-6 transition-colors hover:border-primary hover:bg-primary/5">
            <FiUpload size={24} className="text-muted-foreground" />
            <div className="text-center">
              <p className="font-semibold text-foreground">
                {selectedFile ? "Choose Another" : "Upload Picture"}
              </p>
              <p className="text-xs text-muted-foreground">JPG, PNG, GIF (max 5MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          <div className="flex gap-2">
            {selectedFile && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                icon={<FiX size={18} />}
                className="flex-1"
              >
                Cancel
              </Button>
            )}

            {selectedFile && (
              <Button
                onClick={handleUpload}
                loading={isLoading}
                className="flex-1"
              >
                Upload
              </Button>
            )}

            {!selectedFile && currentProfilePic && (
              <Button
                variant="destructive"
                onClick={handleRemove}
                loading={isRemoving}
                disabled={isLoading}
                icon={<FiTrash2 size={18} />}
                className="flex-1"
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
