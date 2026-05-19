"use client";

import React, { useState, useCallback, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useSocialStore } from "@/stores/social/social.store";
import { useBodyScroll } from "@/hooks/useBodyScroll";
import { Post, PostType } from "@/lib/api/social/social.api";
import {
  FiX,
  FiImage,
  FiFile,
  FiTrash2,
  FiVideo,
  FiMessageSquare,
  FiBell,
  FiCalendar,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Image from "next/image";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
}

const postTypeOptions: {
  value: PostType;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { value: "general", label: "General", Icon: FiMessageSquare },
  { value: "announcement", label: "Announcement", Icon: FiBell },
  { value: "event", label: "Event", Icon: FiCalendar },
];

export default function EditPostModal({ post, onClose }: EditPostModalProps) {
  const { updatePost, isLoading } = useSocialStore();

  // Prevent body scroll when modal is open
  useBodyScroll(true);

  const [content, setContent] = useState(post.content);
  const [postType, setPostType] = useState<PostType>(post.type || "general");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState(
    (post.files || []).map((url, index) => ({
      url,
      publicId: post.publicIds?.[index],
    })),
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);

      if (selectedFiles.length + newFiles.length + existingMedia.length > 5) {
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

      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      setNewFiles((prev) => [...prev, ...validFiles]);
    },
    [newFiles, existingMedia],
  );

  const removeNewFile = useCallback((index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingFile = useCallback((index: number) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (
        !content.trim() &&
        existingMedia.length === 0 &&
        newFiles.length === 0
      ) {
        toast.error("Add text or at least one file");
        return;
      }

      const formData = new FormData();
      formData.append("content", content);
      formData.append("type", postType);

      const keptPublicIds = new Set(
        existingMedia
          .map((media) => media.publicId)
          .filter((publicId): publicId is string => Boolean(publicId)),
      );
      const removePublicIds = (post.publicIds || []).filter(
        (publicId) => !keptPublicIds.has(publicId),
      );
      formData.append("removePublicIds", JSON.stringify(removePublicIds));

      newFiles.forEach((file) => {
        formData.append("files", file);
      });

      try {
        await updatePost(post._id, formData);
        onClose();
        toast.success("Post updated successfully");
      } catch {
        toast.error("Failed to update post");
      }
    },
    [
      content,
      postType,
      existingMedia,
      newFiles,
      post._id,
      post.publicIds,
      updatePost,
      onClose,
    ],
  );

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    Edit Post
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex-1 overflow-y-auto p-6 space-y-5"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Post Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {postTypeOptions.map(({ value, label, Icon }) => {
                        const selected = postType === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setPostType(value)}
                            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                              selected
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <Icon size={16} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Post Content
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 transition-all"
                      rows={5}
                      maxLength={2000}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-right">
                      {content.length}/2000
                    </p>
                  </div>

                  {existingMedia.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Current Media ({existingMedia.length})
                      </label>
                      <div
                        className={`grid gap-3 ${
                          existingMedia.length <= 2
                            ? "grid-cols-2"
                            : "grid-cols-3"
                        }`}
                      >
                        {existingMedia.map((media, idx) => (
                          <div
                            key={media.publicId || media.url}
                            className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50 aspect-square group"
                          >
                            {media.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <Image
                                src={media.url}
                                alt={`File ${idx}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            ) : media.url.match(/\.mp4$/i) ? (
                              <>
                                <video
                                  src={media.url}
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
                              onClick={() => removeExistingFile(idx)}
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
                      Add Media ({newPreviews.length + existingMedia.length}/5)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="edit-file-input"
                      />
                      <label
                        htmlFor="edit-file-input"
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

                  {newPreviews.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        New Media ({newPreviews.length})
                      </label>
                      <div
                        className={`grid gap-3 ${
                          newPreviews.length <= 2
                            ? "grid-cols-2"
                            : "grid-cols-3"
                        }`}
                      >
                        {newPreviews.map((preview, idx) => (
                          <div
                            key={idx}
                            className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50 aspect-square group"
                          >
                            {newFiles[idx]?.type.startsWith("image") ? (
                              <Image
                                src={preview}
                                alt={`Preview ${idx}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            ) : newFiles[idx]?.type.startsWith("video") ? (
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
                              onClick={() => removeNewFile(idx)}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </form>

                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    {isLoading ? "Updating..." : "Update Post"}
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
