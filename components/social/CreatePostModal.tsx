"use client";

import React, { useState, useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { FiX, FiImage } from "react-icons/fi";
import toast from "react-hot-toast";
import Image from "next/image";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
}: CreatePostModalProps) {
  const { user } = useAuthStore();
  const { createNewPost, isLoading } = useSocialStore();

  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);

      // Validate files
      if (selectedFiles.length + files.length > 5) {
        toast.error("Maximum 5 files allowed");
        return;
      }

      const validFiles: File[] = [];
      selectedFiles.forEach((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
        } else {
          validFiles.push(file);
        }
      });

      // Create previews
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [files],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!content.trim()) {
        toast.error("Post content cannot be empty");
        return;
      }

      const formData = new FormData();
      formData.append("content", content);
      files.forEach((file) => {
        formData.append("files", file);
      });

      try {
        await createNewPost(formData);
        setContent("");
        setFiles([]);
        setPreviews([]);
        onClose();
        toast.success("Post created successfully");
      } catch (error) {
        toast.error("Failed to create post");
      }
    },
    [content, files, createNewPost, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-black p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3 pb-4 border-b-2 border-black">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-black flex items-center justify-center overflow-hidden">
              {user?.profilePic?.url ? (
                <Image
                  src={user.profilePic.url}
                  alt={user.name || "User"}
                  width={48}
                  height={48}
                  className="rounded-full w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {(user?.name || "U")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold">
                {user?.name || user?.username || "User"}
              </h3>
              <p className="text-sm text-gray-600">
                {user?.course || "Sharda University"}
              </p>
            </div>
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-sm font-bold mb-2">
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ideas, or questions..."
              className="w-full p-4 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/2000</p>
          </div>

          {/* File Previews */}
          {previews.length > 0 && (
            <div>
              <label className="block text-sm font-bold mb-2">
                Attached Files
              </label>
              <div
                className={`grid gap-2 ${
                  previews.length === 1
                    ? "grid-cols-1"
                    : previews.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-3"
                }`}
              >
                {previews.map((preview, idx) => (
                  <div
                    key={idx}
                    className="relative border-2 border-black rounded-lg overflow-hidden bg-gray-100"
                  >
                    {files[idx]?.type.startsWith("image") ? (
                      <Image
                        src={preview}
                        alt={`Preview ${idx}`}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover"
                      />
                    ) : files[idx]?.type.startsWith("video") ? (
                      <video
                        src={preview}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-gray-200">
                        <span className="text-sm font-bold">
                          📄 {files[idx]?.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-black border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <FiImage size={20} />
              <span className="font-semibold">
                {files.length === 0
                  ? "Add images or videos"
                  : `${files.length} file(s) selected`}
              </span>
              <input
                type="file"
                multiple
                accept="image/*,video/mp4,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Up to 5 files, max 10MB each
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 font-bold border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="flex-1 py-3 font-bold bg-black text-white border-2 border-transparent rounded-lg hover:bg-white hover:text-black hover:border-black transition-all disabled:opacity-50"
            >
              {isLoading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
