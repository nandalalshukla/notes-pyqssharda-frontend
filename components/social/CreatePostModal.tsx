"use client";

import React, { useState, useCallback, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { useBodyScroll } from "@/hooks/useBodyScroll";
import { FiX, FiImage, FiFile, FiTrash2, FiVideo } from "react-icons/fi";
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

  // Prevent body scroll when modal is open
  useBodyScroll(isOpen);

  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);

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
      } catch (error: unknown) {
        const message =
          error &&
          typeof error === "object" &&
          "response" in error &&
          typeof error.response === "object" &&
          error.response &&
          "data" in error.response &&
          typeof error.response.data === "object" &&
          error.response.data &&
          "message" in error.response.data &&
          typeof error.response.data.message === "string"
            ? error.response.data.message
            : "Failed to create post";
        toast.error(message);
      }
    },
    [content, files, createNewPost, onClose],
  );

  const handleClose = useCallback(() => {
    setContent("");
    setFiles([]);
    setPreviews([]);
    onClose();
  }, [onClose]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    Create Post
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex-1 overflow-y-auto p-6 space-y-5"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <Image
                      src={
                        user?.profilePic?.url || "/images/default-avatar.png"
                      }
                      alt={user?.name || "User"}
                      width={48}
                      height={48}
                      className="rounded-full object-cover flex-shrink-0 border border-gray-200"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user?.name || user?.username || "User"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user?.course || "Sharda University"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What's on your mind?
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share your thoughts, ideas, or questions..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 transition-all"
                      rows={5}
                      maxLength={2000}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2 text-right">
                      {content.length}/2000
                    </p>
                  </div>

                  {previews.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Attached Files ({previews.length}/5)
                      </label>
                      <div
                        className={`grid gap-3 ${
                          previews.length <= 2 ? "grid-cols-2" : "grid-cols-3"
                        }`}
                      >
                        {previews.map((preview, idx) => (
                          <div
                            key={idx}
                            className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50 aspect-square group"
                          >
                            {files[idx]?.type.startsWith("image") ? (
                              <Image
                                src={preview}
                                alt={`Preview ${idx}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            ) : files[idx]?.type.startsWith("video") ? (
                              <>
                                <video
                                  src={preview}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                  <FiVideo className="text-white" size={32} />
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-2">
                                <FiFile className="text-gray-400" size={28} />
                                <span className="text-xs font-medium text-gray-600">
                                  File
                                </span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Add Media ({previews.length}/5)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="create-file-input"
                      />
                      <label
                        htmlFor="create-file-input"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <FiImage className="text-gray-400" size={32} />
                        <span className="text-sm font-medium text-gray-700">
                          Click to add files
                        </span>
                        <span className="text-xs text-gray-500">
                          Images, videos, or documents up to 10MB each
                        </span>
                      </label>
                    </div>
                  </div>
                </form>

                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isLoading || !content.trim()}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    {isLoading ? "Posting..." : "Post"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
