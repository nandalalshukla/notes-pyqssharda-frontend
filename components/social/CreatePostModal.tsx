"use client";

import React, { useState, useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { useBodyScroll } from "@/hooks/useBodyScroll";
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
import { PostType } from "@/lib/api/social/social.api";
import { Modal, Button, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

interface CreatePostModalProps {
  isOpen: boolean;
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

export default function CreatePostModal({
  isOpen,
  onClose,
}: CreatePostModalProps) {
  const { user } = useAuthStore();
  const { createNewPost, isLoading } = useSocialStore();

  // Prevent body scroll when modal is open
  useBodyScroll(isOpen);

  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("general");
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
      formData.append("type", postType);
      files.forEach((file) => {
        formData.append("files", file);
      });

      try {
        await createNewPost(formData);
        setContent("");
        setPostType("general");
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
    [content, postType, files, createNewPost, onClose],
  );

  const handleClose = useCallback(() => {
    setContent("");
    setPostType("general");
    setFiles([]);
    setPreviews([]);
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Post"
      size="xl"
      footer={
        <>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-post-form"
            loading={isLoading}
            disabled={!content.trim()}
          >
            Post
          </Button>
        </>
      }
    >
      <form id="create-post-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Avatar src={user?.profilePic?.url} alt={user?.name || "User"} size="lg" />
          <div>
            <p className="font-semibold text-foreground">
              {user?.name || user?.username || "User"}
            </p>
            <p className="text-sm text-muted-foreground">
              {user?.course || "Sharda University"}
            </p>
          </div>
        </div>

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
            What&apos;s on your mind?
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, ideas, or questions..."
            className="w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-foreground transition-all placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring focus:outline-none"
            rows={5}
            maxLength={2000}
            autoFocus
          />
          <p className="mt-2 text-right text-xs text-muted-foreground">
            {content.length}/2000
          </p>
        </div>

        {previews.length > 0 && (
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              Attached Files ({previews.length}/5)
            </label>
            <div
              className={cn(
                "grid gap-3",
                previews.length <= 2 ? "grid-cols-2" : "grid-cols-3",
              )}
            >
              {previews.map((preview, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                >
                  {files[idx]?.type.startsWith("image") ? (
                    <Image
                      src={preview}
                      alt={`Preview ${idx}`}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  ) : files[idx]?.type.startsWith("video") ? (
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
                    onClick={() => removeFile(idx)}
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
            Add Media ({previews.length}/5)
          </label>
          <div className="rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50">
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
      </form>
    </Modal>
  );
}
