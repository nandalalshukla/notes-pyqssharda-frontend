"use client";

import React, { useState, useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { useBodyScroll } from "@/hooks/useBodyScroll";
import { getErrorMessage } from "@/lib/utils/errorHandler";
import toast from "react-hot-toast";
import { PostType, postWillNeedApproval } from "@/lib/api/social/social.api";
import { Modal, Button, Avatar } from "@/components/ui";
import PostComposerForm, {
  LostFoundDraft,
  emptyLostFoundDraft,
} from "./PostComposerForm";
import { appendLostFoundFields } from "./composerPayload";

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
  const [postType, setPostType] = useState<PostType>("general");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [lostFound, setLostFound] =
    useState<LostFoundDraft>(emptyLostFoundDraft);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const isLostFound = postType === "lost_found";
  // Mirrors the server's rule so the composer can warn before submit; the
  // server is still what actually decides.
  const needsApproval = postWillNeedApproval(postType, user?.role);

  const patchLostFound = useCallback((patch: Partial<LostFoundDraft>) => {
    setLostFound((prev) => ({ ...prev, ...patch }));
  }, []);

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

  const resetForm = useCallback(() => {
    setContent("");
    setPostType("general");
    setIsAnonymous(false);
    setLostFound(emptyLostFoundDraft);
    setFiles([]);
    setPreviews([]);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!content.trim()) {
        toast.error("Post content cannot be empty");
        return;
      }

      // Mirrors the server-side rule for lost & found posts, so the author
      // finds out before the upload rather than after it.
      if (isLostFound && !lostFound.itemName.trim()) {
        toast.error("Please name the item you lost or found");
        return;
      }

      const formData = new FormData();
      formData.append("content", content);
      formData.append("type", postType);
      formData.append("isAnonymous", String(isAnonymous));
      if (isLostFound) appendLostFoundFields(formData, lostFound);
      files.forEach((file) => {
        formData.append("files", file);
      });

      try {
        await createNewPost(formData);
        resetForm();
        onClose();
        toast.success(
          needsApproval
            ? "Sent for review — you'll be notified once it's approved"
            : isAnonymous
              ? "Posted anonymously"
              : isLostFound
                ? "Posted to the lost & found board"
                : "Post created successfully",
        );
      } catch (error: unknown) {
        toast.error(getErrorMessage(error) || "Failed to create post");
      }
    },
    [
      content,
      postType,
      isAnonymous,
      isLostFound,
      needsApproval,
      lostFound,
      files,
      createNewPost,
      onClose,
      resetForm,
    ],
  );

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

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
            disabled={
              !content.trim() || (isLostFound && !lostFound.itemName.trim())
            }
          >
            {needsApproval ? "Submit for Review" : "Post"}
          </Button>
        </>
      }
    >
      <PostComposerForm
        formId="create-post-form"
        onSubmit={handleSubmit}
        headerSlot={
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Avatar
              src={user?.profilePic?.url}
              alt={user?.name || "User"}
              size="lg"
            />
            <div>
              <p className="font-semibold text-foreground">
                {isAnonymous
                  ? "Anonymous"
                  : user?.name || user?.username || "User"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isAnonymous
                  ? "Your identity stays hidden on this post"
                  : user?.course || "Sharda University"}
              </p>
            </div>
          </div>
        }
        postType={postType}
        onPostTypeChange={setPostType}
        contentLabel={
          isLostFound ? "Describe it in your own words" : "What's on your mind?"
        }
        contentPlaceholder={
          isLostFound
            ? "Any detail that helps — colour, stickers, what was inside, when you noticed it missing..."
            : "Share your thoughts, ideas, or questions..."
        }
        content={content}
        onContentChange={setContent}
        autoFocusContent
        lostFound={lostFound}
        onLostFoundChange={patchLostFound}
        isAnonymous={isAnonymous}
        onIsAnonymousChange={setIsAnonymous}
        needsApproval={needsApproval}
        newFiles={files}
        newPreviews={previews}
        onRemoveNewFile={removeFile}
        onFileSelect={handleFileSelect}
        fileInputId="create-file-input"
      />
    </Modal>
  );
}
