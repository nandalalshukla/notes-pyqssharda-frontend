"use client";

import React, { useState, useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import { Post } from "@/lib/api/social/social.api";
import { FiX, FiImage } from "react-icons/fi";
import toast from "react-hot-toast";
import Image from "next/image";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
}

export default function EditPostModal({ post, onClose }: EditPostModalProps) {
  const { updatePost, isLoading } = useSocialStore();

  const [content, setContent] = useState(post.content);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>(
    post.files || [],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);

      // Validate total files
      if (selectedFiles.length + newFiles.length + existingFiles.length > 5) {
        toast.error("Maximum 5 files total allowed");
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
          setNewPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      setNewFiles((prev) => [...prev, ...validFiles]);
    },
    [newFiles, existingFiles],
  );

  const removeNewFile = useCallback((index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingFile = useCallback((index: number) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
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

      // Append existing files to keep
      existingFiles.forEach((file) => {
        formData.append("existingFiles", file);
      });

      // Append new files
      newFiles.forEach((file) => {
        formData.append("files", file);
      });

      try {
        await updatePost(post._id, formData);
        onClose();
        toast.success("Post updated successfully");
      } catch (error) {
        toast.error("Failed to update post");
      }
    },
    [content, existingFiles, newFiles, post._id, updatePost, onClose],
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-black p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Content Input */}
          <div>
            <label className="block text-sm font-bold mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/2000</p>
          </div>

          {/* Existing File Previews */}
          {existingFiles.length > 0 && (
            <div>
              <label className="block text-sm font-bold mb-2">
                Current Files
              </label>
              <div
                className={`grid gap-2 ${
                  existingFiles.length === 1
                    ? "grid-cols-1"
                    : existingFiles.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-3"
                }`}
              >
                {existingFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative border-2 border-black rounded-lg overflow-hidden bg-gray-100"
                  >
                    {file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <Image
                        src={file}
                        alt={`File ${idx}`}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover"
                      />
                    ) : file.match(/\.mp4$/i) ? (
                      <video src={file} className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-gray-200">
                        <span className="text-sm font-bold">📄 File</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingFile(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New File Previews */}
          {newPreviews.length > 0 && (
            <div>
              <label className="block text-sm font-bold mb-2">New Files</label>
              <div
                className={`grid gap-2 ${
                  newPreviews.length === 1
                    ? "grid-cols-1"
                    : newPreviews.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-3"
                }`}
              >
                {newPreviews.map((preview, idx) => (
                  <div
                    key={idx}
                    className="relative border-2 border-black rounded-lg overflow-hidden bg-gray-100"
                  >
                    {newFiles[idx]?.type.startsWith("image") ? (
                      <Image
                        src={preview}
                        alt={`Preview ${idx}`}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover"
                      />
                    ) : newFiles[idx]?.type.startsWith("video") ? (
                      <video
                        src={preview}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-gray-200">
                        <span className="text-sm font-bold">
                          📄 {newFiles[idx]?.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
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
                {newFiles.length === 0
                  ? "Add new files"
                  : `${newFiles.length} new file(s)`}
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
              {`${existingFiles.length + newFiles.length}/5 files total`}
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
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
