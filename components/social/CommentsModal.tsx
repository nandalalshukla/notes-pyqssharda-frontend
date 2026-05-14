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
  FiCornerDownRight,
  FiMessageSquare,
  FiLogIn,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import Image from "next/image";
import { useBodyScroll } from "@/hooks/useBodyScroll";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";

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
  const [showCommentMenu, setShowCommentMenu] = useState<string | null>(null);
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

  const handleAddReply = useCallback(
    async (e: React.FormEvent, parentCommentId: string) => {
      e.preventDefault();
      if (!replyText.trim()) return;

      if (!user) {
        toast.error("Please login to reply");
        router.push("/auth/login");
        return;
      }

      if (replyText.trim().length > 1000) {
        toast.error("Reply is too long (max 1000 characters)");
        return;
      }

      setIsSubmitting(true);
      try {
        await addComment(postId, replyText, parentCommentId);
        setReplyText("");
        setReplyingToId(null);
        setExpandedReplies((prev) => new Set(prev).add(parentCommentId));
        toast.success("Reply added!", { duration: 2000 });
      } catch (error: unknown) {
        toast.error("Failed to add reply");
      } finally {
        setIsSubmitting(false);
      }
    },
    [postId, replyText, user, addComment, router],
  );

  const handleLikeComment = useCallback(
    async (commentId: string) => {
      if (!user) {
        toast.error("Please login to like", {
          icon: <FiLogIn className="mr-2" />,
        });
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

  const handleDeleteComment = useCallback(async (commentId: string) => {
    setShowDeleteConfirm(commentId);
  }, []);

  const confirmDeleteComment = useCallback(
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

  const handleUpdateComment = useCallback(
    async (commentId: string) => {
      if (!editText.trim()) {
        toast.error("Comment cannot be empty");
        return;
      }

      if (editText.trim().length > 1000) {
        toast.error("Comment is too long (max 1000 characters)");
        return;
      }

      try {
        await updateComment(postId, commentId, editText);
        setEditingCommentId(null);
        setEditText("");
        toast.success("Comment updated", { duration: 2000 });
      } catch (error: unknown) {
        toast.error("Failed to update comment");
      }
    },
    [postId, editText, updateComment],
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
        return;
      }

      setExpandedReplies((prev) => new Set(prev).add(commentId));
      const existingReplies = replies.get(commentId) || [];
      if (existingReplies.length === 0) {
        await fetchCommentReplies(postId, commentId);
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

  const toggleReplyForm = (commentId: string) => {
    setReplyingToId(commentId);
    setReplyText("");
  };

  const getAuthorId = (author: Comment["author"]) =>
    typeof (author as unknown) === "string"
      ? (author as unknown as string)
      : (author as { _id?: string })?._id;

  const handleViewProfile = (author?: Comment["author"]) => {
    const authorId = author ? getAuthorId(author) : undefined;
    if (authorId) {
      router.push(`/profile/${authorId}`);
    }
  };

  const renderReplies = (parentId: string, depth: number) => {
    const commentReplies = replies.get(parentId) || [];
    const repliesLoading = isLoadingReplies.get(parentId) || false;
    const isExpanded = expandedReplies.has(parentId);

    if (!isExpanded) return null;

    return (
      <div className={`mt-4 space-y-4 ${depth > 0 ? "ml-8" : "ml-8"}`}>
        {repliesLoading ? (
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <FiLoader className="animate-spin" /> Loading replies
          </div>
        ) : commentReplies.length === 0 ? (
          <div className="text-xs text-gray-500">No replies yet</div>
        ) : (
          commentReplies.map((reply) => {
            const isReplyAuthor =
              user?._id && getAuthorId(reply.author)
                ? String(user._id) === String(getAuthorId(reply.author))
                : false;

            return (
              <div key={reply._id} className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleViewProfile(reply.author)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 shrink-0 flex items-center justify-center overflow-hidden border border-gray-200 cursor-pointer"
                >
                  {reply.author.profilePic?.url ? (
                    <Image
                      src={reply.author.profilePic.url}
                      alt={reply.author.username || "User"}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-xs">
                      {(reply.author.username || "U")[0].toUpperCase()}
                    </span>
                  )}
                </button>
                <div className="flex-1">
                  <div className="bg-white border border-gray-200 rounded-xl p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleViewProfile(reply.author)}
                          className="font-semibold text-xs text-gray-900 hover:underline underline-offset-2"
                        >
                          {reply.author.username || "Anonymous"}
                        </button>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatRelativeTime(reply.createdAt)}
                        </p>
                      </div>
                      {isReplyAuthor && editingCommentId !== reply._id && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowCommentMenu(
                                showCommentMenu === reply._id
                                  ? null
                                  : reply._id,
                              )
                            }
                            className="opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                          >
                            <FiMoreVertical
                              size={14}
                              className="text-gray-500"
                            />
                          </button>
                          {showCommentMenu === reply._id && (
                            <div className="absolute right-0 top-full mt-2 min-w-[120px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg z-20">
                              <button
                                onClick={() => {
                                  setEditingCommentId(reply._id);
                                  setEditText(reply.text);
                                  setShowCommentMenu(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                              >
                                <FiEdit2 size={14} />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteComment(reply._id);
                                  setShowCommentMenu(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                <FiTrash2 size={14} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {editingCommentId === reply._id ? (
                      <div>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleUpdateComment(reply._id)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditText("");
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                        {reply.text}
                      </p>
                    )}
                  </div>
                  {editingCommentId !== reply._id && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <button
                        onClick={() => handleLikeComment(reply._id)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold transition-all ${
                          reply.likedByCurrentUser
                            ? "bg-red-50 text-red-600"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {reply.likedByCurrentUser ? (
                          <FaHeart size={12} className="fill-current" />
                        ) : (
                          <FiHeart size={12} />
                        )}
                        <span>
                          {reply.likes || 0}{" "}
                          {(reply.likes || 0) === 1 ? "like" : "likes"}
                        </span>
                      </button>

                      <button
                        onClick={() => toggleReplyForm(reply._id)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                      >
                        <FiCornerDownRight size={12} />
                        Reply
                      </button>

                      <button
                        onClick={() => handleToggleReplies(reply._id)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                      >
                        <FiMessageSquare size={12} />
                        {expandedReplies.has(reply._id)
                          ? "Hide replies"
                          : "View replies"}
                      </button>
                    </div>
                  )}

                  {replyingToId === reply._id && user && (
                    <form
                      onSubmit={(e) => handleAddReply(e, reply._id)}
                      className="mt-3"
                    >
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                          {user.profilePic?.url ? (
                            <Image
                              src={user.profilePic.url}
                              alt={user.name || user.username || "User"}
                              width={28}
                              height={28}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-[10px]">
                              {(user.username || "U")[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                            rows={2}
                          />
                          <div className="flex gap-2 mt-3">
                            <button
                              type="submit"
                              disabled={isSubmitting || !replyText.trim()}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              Reply
                            </button>
                            <button
                              type="button"
                              onClick={() => setReplyingToId(null)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}

                  {depth < 2 && renderReplies(reply._id, depth + 1)}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderComment = (comment: Comment) => {
    const authorId =
      typeof comment.author === "string" ? comment.author : comment.author?._id;
    const isCommentAuthor = user?._id === authorId;

    return (
      <div key={comment._id} className="flex gap-3 group/comment">
        {/* Avatar */}
        <button
          type="button"
          onClick={() => handleViewProfile(comment.author)}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-200 cursor-pointer"
        >
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
        </button>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-xl px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleViewProfile(comment.author)}
                  className="text-sm font-semibold text-gray-900 hover:underline underline-offset-2"
                >
                  {comment.author?.username || "Anonymous"}
                </button>
                {editingCommentId === comment._id ? (
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleUpdateComment(comment._id)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-800 mt-0.5 break-words">
                    {comment.text}
                  </p>
                )}
              </div>
              {isCommentAuthor && editingCommentId !== comment._id && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowCommentMenu(
                        showCommentMenu === comment._id ? null : comment._id,
                      )
                    }
                    className="opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                  >
                    <FiMoreVertical size={14} className="text-gray-500" />
                  </button>
                  {showCommentMenu === comment._id && (
                    <div className="absolute right-0 top-full mt-2 min-w-[120px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg z-20">
                      <button
                        onClick={() => {
                          setEditingCommentId(comment._id);
                          setEditText(comment.text);
                          setShowCommentMenu(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <FiEdit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteComment(comment._id);
                          setShowCommentMenu(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 px-3 flex-wrap">
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
            <button
              onClick={() => toggleReplyForm(comment._id)}
              className="flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <FiCornerDownRight size={12} />
              Reply
            </button>
            <button
              onClick={() => handleToggleReplies(comment._id)}
              className="flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <FiMessageSquare size={12} />
              {expandedReplies.has(comment._id) ? "Hide" : "View"} replies
            </button>
          </div>

          {replyingToId === comment._id && user && (
            <form
              onSubmit={(e) => handleAddReply(e, comment._id)}
              className="mt-3"
            >
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                  {user.profilePic?.url ? (
                    <Image
                      src={user.profilePic.url}
                      alt={user.name || user.username || "User"}
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-[10px]">
                      {(user.username || "U")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || !replyText.trim()}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyingToId(null)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {renderReplies(comment._id, 0)}
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
                      className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors disabled:opacity-50"
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
      <ConfirmationDialog
        isOpen={Boolean(showDeleteConfirm)}
        title="Delete comment?"
        message="This comment will be permanently deleted. You cannot undo this action."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={() => {
          if (showDeleteConfirm) {
            confirmDeleteComment(showDeleteConfirm);
          }
        }}
        onCancel={() => setShowDeleteConfirm(null)}
      />
    </Transition>
  );
}
