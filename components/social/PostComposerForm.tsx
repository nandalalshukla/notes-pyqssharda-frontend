"use client";

import React from "react";
import Image from "next/image";
import {
  FiImage,
  FiFile,
  FiTrash2,
  FiVideo,
  FiMessageSquare,
  FiBell,
  FiCalendar,
} from "react-icons/fi";
import { PostType } from "@/lib/api/social/social.api";
import { cn } from "@/lib/utils/cn";

export const postTypeOptions: {
  value: PostType;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { value: "general", label: "General", Icon: FiMessageSquare },
  { value: "announcement", label: "Announcement", Icon: FiBell },
  { value: "event", label: "Event", Icon: FiCalendar },
];

export interface ExistingMediaItem {
  url: string;
  publicId?: string;
}

export interface PostComposerFormProps {
  formId: string;
  onSubmit: (e: React.FormEvent) => void;
  headerSlot?: React.ReactNode;
  postType: PostType;
  onPostTypeChange: (type: PostType) => void;
  contentLabel: string;
  contentPlaceholder?: string;
  content: string;
  onContentChange: (value: string) => void;
  autoFocusContent?: boolean;
  existingMedia?: ExistingMediaItem[];
  onRemoveExistingMedia?: (index: number) => void;
  newFiles: File[];
  newPreviews: string[];
  onRemoveNewFile: (index: number) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputId: string;
  maxFiles?: number;
}

function MediaGrid({
  items,
  onRemove,
}: {
  items: { key: string; preview: string; kind: "image" | "video" | "file" }[];
  onRemove: (index: number) => void;
}) {
  return (
    <div
      className={cn("grid gap-3", items.length <= 2 ? "grid-cols-2" : "grid-cols-3")}
    >
      {items.map((item, idx) => (
        <div
          key={item.key}
          className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
        >
          {item.kind === "image" ? (
            <Image
              src={item.preview}
              alt={`Media ${idx}`}
              width={200}
              height={200}
              className="h-full w-full object-cover"
            />
          ) : item.kind === "video" ? (
            <>
              <video src={item.preview} className="h-full w-full object-cover" />
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
            onClick={() => onRemove(idx)}
            className="absolute top-2 right-2 rounded-lg bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-all group-hover:opacity-100 hover:opacity-90 cursor-pointer"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function PostComposerForm({
  formId,
  onSubmit,
  headerSlot,
  postType,
  onPostTypeChange,
  contentLabel,
  contentPlaceholder,
  content,
  onContentChange,
  autoFocusContent,
  existingMedia,
  onRemoveExistingMedia,
  newFiles,
  newPreviews,
  onRemoveNewFile,
  onFileSelect,
  fileInputId,
  maxFiles = 5,
}: PostComposerFormProps) {
  const totalMediaCount = (existingMedia?.length || 0) + newPreviews.length;

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-5">
      {headerSlot}

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
                onClick={() => onPostTypeChange(value)}
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
          {contentLabel}
        </label>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={contentPlaceholder}
          className="w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-foreground transition-all placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring focus:outline-none"
          rows={5}
          maxLength={2000}
          autoFocus={autoFocusContent}
        />
        <p className="mt-2 text-right text-xs text-muted-foreground">
          {content.length}/2000
        </p>
      </div>

      {existingMedia && existingMedia.length > 0 && (
        <div>
          <label className="mb-3 block text-sm font-semibold text-foreground">
            Current Media ({existingMedia.length})
          </label>
          <MediaGrid
            items={existingMedia.map((media, idx) => ({
              key: media.publicId || media.url || String(idx),
              preview: media.url,
              kind: media.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                ? "image"
                : media.url.match(/\.mp4$/i)
                  ? "video"
                  : "file",
            }))}
            onRemove={(idx) => onRemoveExistingMedia?.(idx)}
          />
        </div>
      )}

      <div>
        <label className="mb-3 block text-sm font-semibold text-foreground">
          Add Media ({totalMediaCount}/{maxFiles})
        </label>
        <div className="rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50">
          <input
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={onFileSelect}
            className="hidden"
            id={fileInputId}
          />
          <label
            htmlFor={fileInputId}
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
            {existingMedia ? `New Media (${newPreviews.length})` : `Attached Files (${newPreviews.length}/${maxFiles})`}
          </label>
          <MediaGrid
            items={newPreviews.map((preview, idx) => ({
              key: String(idx),
              preview,
              kind: newFiles[idx]?.type.startsWith("image")
                ? "image"
                : newFiles[idx]?.type.startsWith("video")
                  ? "video"
                  : "file",
            }))}
            onRemove={onRemoveNewFile}
          />
        </div>
      )}
    </form>
  );
}
