"use client";

import React, { useState, useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import { useBodyScroll } from "@/hooks/useBodyScroll";
import { Post, PostType } from "@/lib/api/social/social.api";
import toast from "react-hot-toast";
import { Modal, Button } from "@/components/ui";
import PostComposerForm, {
  LostFoundDraft,
  emptyLostFoundDraft,
} from "./PostComposerForm";
import { appendLostFoundFields } from "./composerPayload";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
}

/**
 * Seeds the composer's lost & found state from a post being edited.
 * Anything the post doesn't carry (because it wasn't a lost & found post,
 * or predates a field) falls back to the empty draft, so switching a post
 * over to lost & found opens a blank — not half-populated — form.
 */
const draftFromPost = (post: Post): LostFoundDraft => {
  const details = post.lostFound;
  if (!details) return emptyLostFoundDraft;

  return {
    kind: details.kind ?? emptyLostFoundDraft.kind,
    itemName: details.itemName ?? "",
    category: details.category ?? emptyLostFoundDraft.category,
    location: details.location ?? "",
    // The <input type="date"> control only accepts yyyy-mm-dd, while the
    // API sends a full ISO timestamp.
    date: details.dateOccurred ? details.dateOccurred.slice(0, 10) : "",
    contactInfo: details.contactInfo ?? "",
  };
};

export default function EditPostModal({ post, onClose }: EditPostModalProps) {
  const { updatePost, isLoading } = useSocialStore();

  // Prevent body scroll when modal is open
  useBodyScroll(true);

  const [content, setContent] = useState(post.content);
  const [postType, setPostType] = useState<PostType>(post.type || "general");
  const [isAnonymous, setIsAnonymous] = useState(Boolean(post.isAnonymous));
  const [lostFound, setLostFound] = useState<LostFoundDraft>(() =>
    draftFromPost(post),
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState(
    (post.files || []).map((url, index) => ({
      url,
      publicId: post.publicIds?.[index],
    })),
  );

  const isLostFound = postType === "lost_found";

  const patchLostFound = useCallback((patch: Partial<LostFoundDraft>) => {
    setLostFound((prev) => ({ ...prev, ...patch }));
  }, []);

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

      if (isLostFound && !lostFound.itemName.trim()) {
        toast.error("Please name the item you lost or found");
        return;
      }

      const formData = new FormData();
      formData.append("content", content);
      formData.append("type", postType);
      formData.append("isAnonymous", String(isAnonymous));
      if (isLostFound) appendLostFoundFields(formData, lostFound);

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
      isAnonymous,
      isLostFound,
      lostFound,
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
          <Button
            type="submit"
            form="edit-post-form"
            loading={isLoading}
            disabled={isLostFound && !lostFound.itemName.trim()}
          >
            Update Post
          </Button>
        </>
      }
    >
      <PostComposerForm
        formId="edit-post-form"
        onSubmit={handleSubmit}
        postType={postType}
        onPostTypeChange={setPostType}
        contentLabel={
          isLostFound ? "Describe it in your own words" : "Post Content"
        }
        content={content}
        onContentChange={setContent}
        lostFound={lostFound}
        onLostFoundChange={patchLostFound}
        isAnonymous={isAnonymous}
        onIsAnonymousChange={setIsAnonymous}
        existingMedia={existingMedia}
        onRemoveExistingMedia={removeExistingFile}
        newFiles={newFiles}
        newPreviews={newPreviews}
        onRemoveNewFile={removeNewFile}
        onFileSelect={handleFileSelect}
        fileInputId="edit-file-input"
      />
    </Modal>
  );
}
