"use client";

import React from "react";
import Image from "next/image";
import { FiImage, FiFile, FiTrash2, FiVideo, FiEyeOff } from "react-icons/fi";
import {
  LostFoundCategory,
  LostFoundKind,
  PostType,
} from "@/lib/api/social/social.api";
import { cn } from "@/lib/utils/cn";
import { Input, Select, Textarea } from "@/components/ui";
import {
  lostFoundCategoryOptions,
  lostFoundKindOptions,
  postTypeOptions,
} from "./postMeta";

// Re-exported for the modals that render this form, so they don't each
// reach into ./postMeta for the same list.
export { postTypeOptions };

/** The lost & found half of the composer's state. */
export interface LostFoundDraft {
  kind: LostFoundKind;
  itemName: string;
  category: LostFoundCategory;
  location: string;
  date: string;
  contactInfo: string;
}

export const emptyLostFoundDraft: LostFoundDraft = {
  kind: "lost",
  itemName: "",
  category: "other",
  location: "",
  date: "",
  contactInfo: "",
};

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
  lostFound: LostFoundDraft;
  onLostFoundChange: (patch: Partial<LostFoundDraft>) => void;
  isAnonymous: boolean;
  onIsAnonymousChange: (value: boolean) => void;
  existingMedia?: ExistingMediaItem[];
  onRemoveExistingMedia?: (index: number) => void;
  newFiles: File[];
  newPreviews: string[];
  onRemoveNewFile: (index: number) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputId: string;
  maxFiles?: number;
}

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-semibold text-foreground"
    >
      {children}
      {hint && (
        <span className="ml-1.5 font-normal text-muted-foreground">{hint}</span>
      )}
    </label>
  );
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
      className={cn(
        "grid gap-3",
        items.length <= 2 ? "grid-cols-2" : "grid-cols-3",
      )}
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
              <video
                src={item.preview}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
                <FiVideo className="text-white" size={32} />
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted">
              <FiFile className="text-muted-foreground" size={28} />
              <span className="text-xs font-medium text-muted-foreground">
                File
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="absolute top-2 right-2 cursor-pointer rounded-lg bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-all group-hover:opacity-100 hover:opacity-90"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * The one composer body shared by the create and edit modals. Both used to
 * carry their own near-identical copy of this markup, which is how the type
 * picker in one could drift out of step with the other; every new field
 * (lost & found details, the anonymity toggle) lands here once.
 */
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
  lostFound,
  onLostFoundChange,
  isAnonymous,
  onIsAnonymousChange,
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
  const isLostFound = postType === "lost_found";

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-5">
      {headerSlot}

      <div>
        <FieldLabel>Post Type</FieldLabel>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {postTypeOptions.map(({ value, label, Icon }) => {
            const selected = postType === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onPostTypeChange(value)}
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
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

      {isLostFound && (
        <div className="space-y-5 rounded-2xl border border-accent-purple/30 bg-accent-purple/5 p-4">
          <div>
            <FieldLabel>What happened?</FieldLabel>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {lostFoundKindOptions.map((option) => {
                const selected = lostFound.kind === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onLostFoundChange({ kind: option.value })}
                    className={cn(
                      "cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-secondary",
                    )}
                  >
                    <span
                      className={cn(
                        "block text-sm font-semibold",
                        selected ? "text-primary" : "text-foreground",
                      )}
                    >
                      {option.composerLabel}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {option.composerHint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <FieldLabel htmlFor={`${formId}-item-name`}>
              Item <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id={`${formId}-item-name`}
              value={lostFound.itemName}
              onChange={(e) => onLostFoundChange({ itemName: e.target.value })}
              placeholder="e.g. Black JBL earbuds in a blue case"
              maxLength={120}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor={`${formId}-category`}>Category</FieldLabel>
              <Select
                id={`${formId}-category`}
                value={lostFound.category}
                onChange={(e) =>
                  onLostFoundChange({
                    category: e.target.value as LostFoundCategory,
                  })
                }
              >
                {lostFoundCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <FieldLabel htmlFor={`${formId}-date`}>
                {lostFound.kind === "lost" ? "Date lost" : "Date found"}
              </FieldLabel>
              <Input
                id={`${formId}-date`}
                type="date"
                value={lostFound.date}
                // A lost/found date can't be in the future, and the browser
                // enforcing that is friendlier than a server rejection.
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => onLostFoundChange({ date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor={`${formId}-location`}>
              {lostFound.kind === "lost" ? "Last seen around" : "Found at"}
            </FieldLabel>
            <Input
              id={`${formId}-location`}
              value={lostFound.location}
              onChange={(e) => onLostFoundChange({ location: e.target.value })}
              placeholder="e.g. Block 2 library, second floor"
              maxLength={200}
            />
          </div>

          <div>
            <FieldLabel
              htmlFor={`${formId}-contact`}
              hint="— shown publicly on the post"
            >
              How should people reach you?
            </FieldLabel>
            <Input
              id={`${formId}-contact`}
              value={lostFound.contactInfo}
              onChange={(e) =>
                onLostFoundChange({ contactInfo: e.target.value })
              }
              placeholder="e.g. Comment below, or DM me on the app"
              maxLength={200}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Only what you type here is shared — your profile&apos;s email and
              phone number stay under your privacy settings.
            </p>
          </div>
        </div>
      )}

      <div>
        <FieldLabel htmlFor={`${formId}-content`}>{contentLabel}</FieldLabel>
        <Textarea
          id={`${formId}-content`}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={contentPlaceholder}
          className="resize-none px-4 py-3 text-base"
          rows={5}
          maxLength={2000}
          autoFocus={autoFocusContent}
        />
        <p className="mt-2 text-right text-xs text-muted-foreground">
          {content.length}/2000
        </p>
      </div>

      {/* Anonymity toggle — a labelled checkbox rather than a custom switch
          so it keeps native keyboard behaviour and the whole block stays
          clickable. */}
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
          isAnonymous
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:bg-secondary",
        )}
      >
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => onIsAnonymousChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
        />
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FiEyeOff size={15} />
            Post anonymously
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Your name and profile picture are hidden from everyone else, and the
            post won&apos;t be listed on your profile. Moderators can still act
            on it if it gets reported.
          </span>
        </span>
      </label>

      {existingMedia && existingMedia.length > 0 && (
        <div>
          <FieldLabel>Current Media ({existingMedia.length})</FieldLabel>
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
        <FieldLabel>
          Add Media ({totalMediaCount}/{maxFiles})
        </FieldLabel>
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
            <span className="text-sm font-medium text-foreground">
              Click to add files
            </span>
            <span className="text-xs text-muted-foreground">
              {isLostFound
                ? "A photo of the item helps people recognise it"
                : "Images, videos, or documents up to 10MB each"}
            </span>
          </label>
        </div>
      </div>

      {newPreviews.length > 0 && (
        <div>
          <FieldLabel>
            {existingMedia
              ? `New Media (${newPreviews.length})`
              : `Attached Files (${newPreviews.length}/${maxFiles})`}
          </FieldLabel>
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
