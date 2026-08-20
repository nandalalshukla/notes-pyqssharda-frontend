"use client";

import React, { useState, useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import { useBodyScroll } from "@/hooks/useBodyScroll";
import { Post, PostType } from "@/lib/api/social/social.api";
import {
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
import { Modal, Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

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
    <Modal
      isOpen
      onClose={onClose}
      title="Edit Post"
      size="xl"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-post-form" loading={isLoading}>
            Update Post
          </Button>
        </>
      }
    >
      <form id="edit-post-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Post Type
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {postTypeOptions.map(({ value, label, Icon }) => {
              const selected = postType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPostType(value)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:bg-secondary",
                  )}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Post Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-foreground transition-all placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring focus:outline-none"
            rows={5}
            maxLength={2000}
          />
          <p className="mt-2 text-right text-xs text-muted-foreground">
            {content.length}/2000
          </p>
        </div>

        {existingMedia.length > 0 && (
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              Current Media ({existingMedia.length})
            </label>
            <div
              className={cn(
                "grid gap-3",
                existingMedia.length <= 2 ? "grid-cols-2" : "grid-cols-3",
              )}
            >
              {existingMedia.map((media, idx) => (
                <div
                  key={media.publicId || media.url}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                >
                  {media.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <Image
                      src={media.url}
                      alt={`File ${idx}`}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  ) : media.url.match(/\.mp4$/i) ? (
                    <>
                      <video src={media.url} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
                        <FiVideo className="text-white" size={32} />
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted">
                      <FiFile className="text-muted-foreground" size={28} />
                      <span className="text-xs font-medium text-muted-foreground">File</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingFile(idx)}
                    className="absolute top-2 right-2 rounded-lg bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-all group-hover:opacity-100 hover:opacity-90 cursor-pointer"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-3 block text-sm font-semibold text-foreground">
            Add Media ({newPreviews.length + existingMedia.length}/5)
          </label>
          <div className="rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50">
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
              className="flex cursor-pointer flex-col items-center gap-2"
            >
              <FiImage className="text-muted-foreground" size={32} />
              <span className="text-sm font-medium text-foreground">Click to add files</span>
              <span className="text-xs text-muted-foreground">
                Images, videos, or documents up to 10MB each
              </span>
            </label>
          </div>
        </div>

        {newPreviews.length > 0 && (
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              New Media ({newPreviews.length})
            </label>
            <div
              className={cn(
                "grid gap-3",
                newPreviews.length <= 2 ? "grid-cols-2" : "grid-cols-3",
              )}
            >
              {newPreviews.map((preview, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                >
                  {newFiles[idx]?.type.startsWith("image") ? (
                    <Image
                      src={preview}
                      alt={`Preview ${idx}`}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  ) : newFiles[idx]?.type.startsWith("video") ? (
                    <>
                      <video src={preview} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
                        <FiVideo className="text-white" size={32} />
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted">
                      <FiFile className="text-muted-foreground" size={28} />
                      <span className="text-xs font-medium text-muted-foreground">File</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeNewFile(idx)}
                    className="absolute top-2 right-2 rounded-lg bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-all group-hover:opacity-100 hover:opacity-90 cursor-pointer"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
