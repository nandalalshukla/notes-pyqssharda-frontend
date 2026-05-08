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
    <div className="bg-white rounded-2xl border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-bold mb-8">Profile Picture</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="w-40 h-40 flex items-center justify-center overflow-hidden mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {currentProfilePic ? (
              <Image
                src={currentProfilePic}
                alt="Profile"
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-black text-5xl">
                {(user?.name || "U")[0].toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-center text-gray-600 font-semibold">
            {user?.name}
          </p>
          <p className="text-center text-gray-500 text-sm">@{user?.username}</p>
        </div>

        {/* Upload Area */}
        <div className="flex flex-col justify-center space-y-4">
          {selectedFile && (
            <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-4">
              <p className="text-sm font-bold text-blue-900 mb-2">Preview</p>
              <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden border-2 border-blue-400">
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
              <p className="text-xs text-blue-700 mt-2">{selectedFile.name}</p>
            </div>
          )}

          <label className="flex items-center justify-center gap-3 p-6 border-4 border-dashed border-black rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors bg-white">
            <FiUpload size={24} className="font-bold" />
            <div className="text-center">
              <p className="font-bold">
                {selectedFile ? "Choose Another" : "Upload Picture"}
              </p>
              <p className="text-xs text-gray-600">JPG, PNG, GIF (max 5MB)</p>
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
                className="flex-1 py-3 px-4 bg-gray-200 text-black font-bold border-2 border-black rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <FiX size={18} />
                Cancel
              </button>
            )}

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-green-500 text-white font-bold border-2 border-black rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Uploading..." : "Upload"}
              </button>
            )}

            {!selectedFile && currentProfilePic && (
              <button
                onClick={handleRemove}
                disabled={isRemoving || isLoading}
                className="flex-1 py-3 px-4 bg-red-500 text-white font-bold border-2 border-black rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
