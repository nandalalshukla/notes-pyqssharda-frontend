"use client";

import { useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import toast from "react-hot-toast";

/**
 * Custom hook for social post operations
 * Provides memoized callbacks for common post actions
 */
export function useSocialActions() {
  const { isAuthenticated } = useAuthStore();
  const {
    createNewPost,
    updatePost,
    removePost,
    addComment,
    updateComment,
    removeComment,
    togglePostLike,
    toggleCommentLike,
    toggleUserFollow,
  } = useSocialStore();

  // Post operations
  const createPost = useCallback(
    async (content: string, files: File[]) => {
      if (!isAuthenticated) {
        toast.error("Please sign in to create a post");
        return;
      }

      if (!content.trim()) {
        toast.error("Post content cannot be empty");
        return;
      }

      const formData = new FormData();
      formData.append("content", content);
      files.forEach((file) => formData.append("files", file));

      try {
        await createNewPost(formData);
        toast.success("Post created successfully");
        return true;
      } catch {
        toast.error("Failed to create post");
        return false;
      }
    },
    [isAuthenticated, createNewPost],
  );

  const editPost = useCallback(
    async (
      postId: string,
      content: string,
      files: File[],
      existingFiles: string[],
      publicIds: string[] = [],
    ) => {
      if (!content.trim() && existingFiles.length === 0 && files.length === 0) {
        toast.error("Add text or at least one file");
        return false;
      }

      const formData = new FormData();
      formData.append("content", content);

      const keptPublicIds = new Set(
        existingFiles
          .map((file) => publicIds[existingFiles.indexOf(file)])
          .filter((publicId): publicId is string => Boolean(publicId)),
      );
      const removePublicIds = publicIds.filter(
        (publicId) => !keptPublicIds.has(publicId),
      );
      formData.append("removePublicIds", JSON.stringify(removePublicIds));

      // Add new files
      files.forEach((file) => formData.append("files", file));

      try {
        await updatePost(postId, formData);
        toast.success("Post updated successfully");
        return true;
      } catch {
        toast.error("Failed to update post");
        return false;
      }
    },
    [updatePost],
  );

  const deletePost = useCallback(
    async (postId: string) => {
      if (!confirm("Are you sure you want to delete this post?")) return false;

      try {
        await removePost(postId);
        toast.success("Post deleted");
        return true;
      } catch {
        toast.error("Failed to delete post");
        return false;
      }
    },
    [removePost],
  );

  // Comment operations
  const createComment = useCallback(
    async (postId: string, text: string) => {
      if (!isAuthenticated) {
        toast.error("Please sign in to comment");
        return false;
      }

      if (!text.trim()) {
        toast.error("Comment cannot be empty");
        return false;
      }

      try {
        await addComment(postId, text);
        toast.success("Comment added");
        return true;
      } catch {
        toast.error("Failed to add comment");
        return false;
      }
    },
    [isAuthenticated, addComment],
  );

  const editComment = useCallback(
    async (postId: string, commentId: string, text: string) => {
      if (!text.trim()) {
        toast.error("Comment cannot be empty");
        return false;
      }

      try {
        await updateComment(postId, commentId, text);
        toast.success("Comment updated");
        return true;
      } catch {
        toast.error("Failed to update comment");
        return false;
      }
    },
    [updateComment],
  );

  const deleteComment = useCallback(
    async (postId: string, commentId: string) => {
      if (!confirm("Delete this comment?")) return false;

      try {
        await removeComment(postId, commentId);
        toast.success("Comment deleted");
        return true;
      } catch {
        toast.error("Failed to delete comment");
        return false;
      }
    },
    [removeComment],
  );

  // Like operations
  const likePost = useCallback(
    async (postId: string) => {
      if (!isAuthenticated) {
        toast.error("Please sign in to like");
        return false;
      }

      try {
        await togglePostLike(postId);
        return true;
      } catch {
        toast.error("Failed to like post");
        return false;
      }
    },
    [isAuthenticated, togglePostLike],
  );

  const likeComment = useCallback(
    async (commentId: string) => {
      if (!isAuthenticated) {
        toast.error("Please sign in to like");
        return false;
      }

      try {
        await toggleCommentLike(commentId);
        return true;
      } catch {
        toast.error("Failed to like comment");
        return false;
      }
    },
    [isAuthenticated, toggleCommentLike],
  );

  // Follow operations
  const followUser = useCallback(
    async (userId: string) => {
      if (!isAuthenticated) {
        toast.error("Please sign in to follow");
        return false;
      }

      try {
        await toggleUserFollow(userId);
        return true;
      } catch {
        toast.error("Failed to follow user");
        return false;
      }
    },
    [isAuthenticated, toggleUserFollow],
  );

  return {
    createPost,
    editPost,
    deletePost,
    createComment,
    editComment,
    deleteComment,
    likePost,
    likeComment,
    followUser,
  };
}
