"use client";

import React, { useRef, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { FiUpload, FiX, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import toast from "react-hot-toast";

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
    <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900 mb-8">
        Profile Picture
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="w-40 h-40 flex items-center justify-center overflow-hidden mb-6 rounded-lg bg-gradient-to-br from-blue-50 to-slate-100 border border-slate-200 shadow-sm">
            {currentProfilePic ? (
              <Image
                src={currentProfilePic}
                alt="Profile"
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-slate-400 font-bold text-5xl bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg w-full h-full flex items-center justify-center">
                {(user?.name || "U")[0].toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-center text-slate-900 font-semibold">
            {user?.name}
          </p>
          <p className="text-center text-slate-500 text-sm mt-1">
            @{user?.username}
          </p>
        </div>

        {/* Upload Area */}
        <div className="flex flex-col justify-center space-y-4">
          {selectedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-900 mb-3">
                Preview
              </p>
              <div className="w-full h-32 bg-white rounded-lg overflow-hidden border border-blue-200">
                {previewUrl && (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <p className="text-xs text-blue-700 mt-2 truncate">
                {selectedFile.name}
              </p>
            </div>
          )}

          <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-blue-50/50 hover:border-blue-400 transition-colors bg-white">
            <FiUpload size={24} className="text-slate-600" />
            <div className="text-center">
              <p className="font-semibold text-slate-900">
                {selectedFile ? "Choose Another" : "Upload Picture"}
              </p>
              <p className="text-xs text-slate-500">JPG, PNG, GIF (max 5MB)</p>
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
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="flex-1 py-2 px-4 bg-slate-100 text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <FiX size={18} />
                Cancel
              </button>
            )}

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? "Uploading..." : "Upload"}
              </button>
            )}

            {!selectedFile && currentProfilePic && (
              <button
                onClick={handleRemove}
                disabled={isRemoving || isLoading}
                className="flex-1 py-2 px-4 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm border border-red-200"
              >
                <FiTrash2 size={18} />
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
