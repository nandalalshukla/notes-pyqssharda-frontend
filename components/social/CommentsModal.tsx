"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useRouter } from "next/navigation";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { Comment } from "@/lib/api/social/social.api";
import {
  FiHeart,
  FiMoreVertical,
  FiX,
  FiSend,
  FiEdit2,
  FiTrash2,
  FiLoader,
  FiLogIn,
  FiCornerDownRight,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import Image from "next/image";
import { useBodyScroll } from "@/hooks/useBodyScroll";

interface CommentsModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentsModal({
  postId,
  isOpen,
  onClose,
}: CommentsModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  useBodyScroll(isOpen);

  const {
    comments,
    isLoadingComments,
    fetchPostComments,
    addComment,
    updateComment,
    removeComment,
    toggleCommentLike,
    fetchCommentReplies,
    replies,
    isLoadingReplies,
  } = useSocialStore();

  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set(),
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const commentsListRef = useRef<HTMLDivElement>(null);

  const postComments = comments.get(postId) || [];
  const isLoading = isLoadingComments.get(postId) || false;

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && postComments.length === 0) {
      fetchPostComments(postId);
    }
  }, [isOpen, postId, postComments.length, fetchPostComments]);

  // Auto-scroll to bottom when new comments added
  useEffect(() => {
    if (commentsListRef.current) {
      commentsListRef.current.scrollTop = commentsListRef.current.scrollHeight;
    }
  }, [postComments]);

  const handleAddComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCommentText.trim()) return;

      if (!user) {
        toast.error("Please login to comment");
        router.push("/auth/login");
        return;
      }

      if (newCommentText.trim().length > 1000) {
        toast.error("Comment is too long (max 1000 characters)");
        return;
      }

      setIsSubmitting(true);
      try {
        await addComment(postId, newCommentText);
        setNewCommentText("");
        toast.success("Comment added!", { duration: 2000 });
      } catch (error: unknown) {
        toast.error("Failed to add comment");
      } finally {
        setIsSubmitting(false);
      }
    },
    [postId, newCommentText, user, addComment, router],
  );

  const handleLikeComment = useCallback(
    async (commentId: string) => {
      if (!user) {
        toast.error("Please login to like");
        router.push("/auth/login");
        return;
      }

      try {
        await toggleCommentLike(commentId);
      } catch (error: unknown) {
        toast.error("Failed to react to comment");
      }
    },
    [user, toggleCommentLike, router],
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      setIsDeleting(true);
      try {
        await removeComment(postId, commentId);
        toast.success("Comment deleted", { duration: 2000 });
        setShowDeleteConfirm(null);
      } catch (error: unknown) {
        toast.error("Failed to delete comment");
      } finally {
        setIsDeleting(false);
      }
    },
    [postId, removeComment],
  );

  const handleToggleReplies = useCallback(
    async (commentId: string) => {
      const isExpanded = expandedReplies.has(commentId);
      if (isExpanded) {
        setExpandedReplies((prev) => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
      } else {
        setExpandedReplies((prev) => new Set(prev).add(commentId));
        const existingReplies = replies.get(commentId) || [];
        if (existingReplies.length === 0) {
          await fetchCommentReplies(postId, commentId);
        }
      }
    },
    [expandedReplies, replies, fetchCommentReplies, postId],
  );

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return commentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderComment = (comment: Comment, isReply?: boolean) => {
    const authorId =
      typeof comment.author === "string" ? comment.author : comment.author?._id;
    const isCommentAuthor = user?._id === authorId;

    return (
      <div key={comment._id} className="flex gap-3 group/comment">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-200">
          {comment.author?.profilePic?.url ? (
            <Image
              src={comment.author.profilePic.url}
              alt={comment.author.username || "User"}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-xs">
              {(comment.author?.username || "U")[0].toUpperCase()}
            </span>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-xl px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {comment.author?.username || "Anonymous"}
                </p>
                <p className="text-sm text-gray-800 mt-0.5 break-words">
                  {comment.text}
                </p>
              </div>
              {isCommentAuthor && (
                <button
                  onClick={() => setShowDeleteConfirm(comment._id)}
                  className="opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                >
                  <FiTrash2 size={14} className="text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 px-3">
            <button
              onClick={() => handleLikeComment(comment._id)}
              className={`font-semibold hover:text-gray-900 transition-colors ${
                comment.likedByCurrentUser ? "text-red-600" : ""
              }`}
            >
              {comment.likedByCurrentUser ? (
                <span className="flex items-center gap-1">
                  <FaHeart size={12} className="fill-current" />
                  {comment.likes || 0}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <FiHeart size={12} />
                  {comment.likes || 0}
                </span>
              )}
            </button>
            <span>{formatRelativeTime(comment.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="flex items-center justify-center min-h-full p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                  <Dialog.Title className="text-lg font-bold text-gray-900">
                    Comments
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* Comments List */}
                <div
                  ref={commentsListRef}
                  className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
                >
                  {isLoading && postComments.length === 0 ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        <p className="text-sm text-gray-500">
                          Loading comments...
                        </p>
                      </div>
                    </div>
                  ) : postComments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No comments yet</p>
                      <p className="text-xs mt-1">Be the first to comment!</p>
                    </div>
                  ) : (
                    postComments.map((comment) => (
                      <div key={comment._id} className="space-y-3">
                        {renderComment(comment)}
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input */}
                <div className="border-t border-gray-200 px-5 py-3 bg-white rounded-b-2xl">
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder={
                        user ? "Add a comment..." : "Login to comment"
                      }
                      disabled={!user || isSubmitting}
                      className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!newCommentText.trim() || isSubmitting || !user}
                      className="p-2.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 text-blue-600 hover:text-blue-700"
                    >
                      {isSubmitting ? (
                        <FiLoader size={20} className="animate-spin" />
                      ) : (
                        <FiSend size={20} />
                      )}
                    </button>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
