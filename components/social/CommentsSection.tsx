"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { Comment } from "@/lib/api/social/social.api";
import {
  FiHeart,
  FiMoreVertical,
  FiSend,
  FiEdit2,
  FiTrash2,
  FiLoader,
  FiLogIn,
  FiCornerDownRight,
  FiMessageSquare,
  FiCheckCircle,
  FiMessageCircle,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import Image from "next/image";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import VerifiedBadge from "./VerifiedBadge";

interface CommentsSectionProps {
  postId: string;
}

const getApiErrorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message || fallback;

const getAuthorId = (author: Comment["author"]) =>
  typeof (author as unknown) === "string"
    ? (author as unknown as string)
    : (author as { _id?: string })?._id;

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    comments,
    isLoadingComments,
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
  const [likeAnimating, setLikeAnimating] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set(),
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const postComments = comments.get(postId) || [];
  const isLoading = isLoadingComments.get(postId) || false;

  const handleAddComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCommentText.trim()) {
        toast.error("Comment cannot be empty");
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
        toast.success("Comment added!");
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Failed to add comment"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [postId, newCommentText, addComment],
  );

  const handleAddReply = useCallback(
    async (e: React.FormEvent, parentCommentId: string) => {
      e.preventDefault();
      if (!replyText.trim()) {
        toast.error("Reply cannot be empty");
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
        toast.success("Reply added!");
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Failed to add reply"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [postId, replyText, addComment],
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
        toast.success("Comment updated!");
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Failed to update comment"));
      }
    },
    [postId, editText, updateComment],
  );

  const handleDeleteComment = useCallback(async (commentId: string) => {
    setShowDeleteConfirm(commentId);
  }, []);

  const confirmDeleteComment = useCallback(
    async (commentId: string) => {
      setIsDeleting(true);
      try {
        await removeComment(postId, commentId);
        toast.success("Comment deleted successfully");
        setShowDeleteConfirm(null);
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Failed to delete comment"));
      } finally {
        setIsDeleting(false);
      }
    },
    [postId, removeComment],
  );

  const handleLikeComment = useCallback(
    async (commentId: string) => {
      // Check authentication first
      if (!user) {
        toast.error("Please login to like comments", {
          icon: <FiLogIn className="mr-2" />,
        });
        router.push("/auth/login");
        return;
      }

      try {
        setLikeAnimating(commentId);
        await toggleCommentLike(commentId);
        // Don't manually update - let the store update sync via useEffect
        setTimeout(() => setLikeAnimating(null), 300);
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, "Failed to react to comment"));
        setTimeout(() => setLikeAnimating(null), 300);
      }
    },
    [toggleCommentLike, user, router],
  );

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return commentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const toggleReplyForm = (commentId: string) => {
    setReplyingToId(commentId);
    setReplyText("");
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
          commentReplies.map((reply) => (
            <div key={reply._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-green-400 to-blue-500 shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
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
              </div>
              <div className="flex-1">
                <div className="bg-white border border-gray-200 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="inline-flex max-w-full items-center gap-1 font-semibold text-xs text-gray-900">
                        <span className="truncate">
                          {reply.author.username || "Anonymous"}
                        </span>
                        <VerifiedBadge role={reply.author.role} size={11} />
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatRelativeTime(reply.createdAt)}
                      </p>
                    </div>
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
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap wrap-break-word">
                      {reply.text}
                    </p>
                  )}
                </div>
                {editingCommentId !== reply._id && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <button
                      onClick={() => handleLikeComment(reply._id)}
                      className="flex items-center p-1 hover:text-red-600 group cursor-pointer"
                    >
                      {reply.likedByCurrentUser ? (
                        <FaHeart
                          size={20}
                          className="text-red-600 group-hover:scale-110"
                        />
                      ) : (
                        <FiHeart size={20} className="group-hover:scale-110" />
                      )}
                    </button>
                    <span className="text-xs font-semibold text-gray-600">
                      {reply.likes || 0}{" "}
                      {(reply.likes || 0) === 1 ? "like" : "likes"}
                    </span>

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

                    {user?._id &&
                      getAuthorId(reply.author) &&
                      String(user._id) ===
                        String(getAuthorId(reply.author)) && (
                        <>
                          <button
                            onClick={() => {
                              setEditingCommentId(reply._id);
                              setEditText(reply.text);
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                          >
                            <FiEdit2 size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(reply._id)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold text-red-600 hover:bg-red-50 transition-all"
                          >
                            <FiTrash2 size={12} />
                            Delete
                          </button>
                        </>
                      )}
                  </div>
                )}

                {replyingToId === reply._id && user && (
                  <form
                    onSubmit={(e) => handleAddReply(e, reply._id)}
                    className="mt-3"
                  >
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-400 to-purple-500 shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
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
          ))
        )}
      </div>
    );
  };

  return (
    <div className="mt-8 bg-linear-to-b from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Comments</h3>
          <p className="text-xs text-gray-500 mt-1">
            {postComments.length}{" "}
            {postComments.length === 1 ? "comment" : "comments"}
          </p>
        </div>
      </div>

      {/* New Comment Input */}
      {user ? (
        <form
          onSubmit={handleAddComment}
          className="mb-8 pb-8 border-b border-gray-200"
        >
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 shrink-0 flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-sm">
              {user.profilePic?.url ? (
                <Image
                  src={user.profilePic.url}
                  alt={user.name || user.username || "User"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {(user.name || user.username || "U")[0].toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-4 pr-14 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400 text-sm transition-all"
                  rows={2}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newCommentText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={
                    newCommentText.trim()
                      ? "Send comment"
                      : "Write a comment first"
                  }
                >
                  {isSubmitting ? (
                    <FiLoader size={18} className="animate-spin" />
                  ) : (
                    <FiSend size={18} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {newCommentText.length}/1000
              </p>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 pb-8 border-b border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Sign in to comment on this post
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : postComments.length > 0 ? (
          postComments.map((comment: Comment, index: number) => {
            const commentAuthorImage =
              comment.author.profilePic?.url || comment.author.avatar || "";
            const isExpanded = expandedReplies.has(comment._id);

            return (
              <div
                key={comment._id}
                className="flex gap-3 group/comment animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-400 to-blue-500 shrink-0 flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-sm">
                  {commentAuthorImage ? (
                    <Image
                      src={commentAuthorImage}
                      alt={comment.author.username || "User"}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {(comment.author.username || "U")[0].toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Comment Content */}
                <div className="flex-1">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 transition-all group-hover/comment:border-gray-300 group-hover/comment:shadow-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="inline-flex max-w-full items-center gap-1 font-semibold text-sm text-gray-900">
                          <span className="truncate">
                            {comment.author.username || "Anonymous"}
                          </span>
                          <VerifiedBadge
                            role={comment.author.role}
                            size={12}
                          />
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatRelativeTime(comment.createdAt)}
                        </p>
                      </div>

                      {/* Menu */}
                      {user?._id &&
                        getAuthorId(comment.author) &&
                        String(user._id) ===
                          String(getAuthorId(comment.author)) && (
                          <div className="relative opacity-100">
                            <button
                              onClick={() =>
                                setShowCommentMenu(
                                  showCommentMenu === comment._id
                                    ? null
                                    : comment._id,
                                )
                              }
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <FiMoreVertical
                                size={16}
                                className="text-gray-600"
                              />
                            </button>
                            {showCommentMenu === comment._id && (
                              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden min-w-max">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment._id);
                                    setEditText(comment.text);
                                    setShowCommentMenu(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50 font-medium text-sm text-gray-700 border-b border-gray-100 transition-colors"
                                >
                                  <FiEdit2 size={16} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteComment(comment._id);
                                    setShowCommentMenu(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-red-50 font-medium text-sm text-red-600 transition-colors"
                                >
                                  <FiTrash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Comment Text */}
                    {editingCommentId === comment._id ? (
                      <div className="mb-3">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleUpdateComment(comment._id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditText("");
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap wrap-break-word">
                        {comment.text}
                      </p>
                    )}
                  </div>

                  {/* Reactions Bar */}
                  {!editingCommentId && (
                    <div className="flex items-center gap-4 mt-3 px-2">
                      <button
                        onClick={() => handleLikeComment(comment._id)}
                        className="flex items-center p-1 hover:text-red-600 group cursor-pointer"
                      >
                        {comment.likedByCurrentUser ? (
                          <FaHeart
                            size={20}
                            className="text-red-600 group-hover:scale-110"
                          />
                        ) : (
                          <FiHeart
                            size={20}
                            className="group-hover:scale-110"
                          />
                        )}
                      </button>
                      <span className="text-xs font-semibold text-gray-600">
                        {comment.likes || 0}{" "}
                        {(comment.likes || 0) === 1 ? "like" : "likes"}
                      </span>

                      <button
                        onClick={() => toggleReplyForm(comment._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                      >
                        <FiCornerDownRight size={14} />
                        Reply
                      </button>

                      <button
                        onClick={() => handleToggleReplies(comment._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                      >
                        <FiMessageSquare size={14} />
                        {isExpanded ? "Hide replies" : "View replies"}
                      </button>

                      {user?._id &&
                        getAuthorId(comment.author) &&
                        String(user._id) ===
                          String(getAuthorId(comment.author)) && (
                          <>
                            <button
                              onClick={() => {
                                setEditingCommentId(comment._id);
                                setEditText(comment.text);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                            >
                              <FiEdit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 hover:bg-red-50 transition-all"
                            >
                              <FiTrash2 size={14} />
                              Delete
                            </button>
                          </>
                        )}
                    </div>
                  )}

                  {replyingToId === comment._id && user && (
                    <form
                      onSubmit={(e) => handleAddReply(e, comment._id)}
                      className="mt-4 ml-2"
                    >
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500 shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                          {user.profilePic?.url ? (
                            <Image
                              src={user.profilePic.url}
                              alt={user.name || user.username || "User"}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-xs">
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
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              Reply
                            </button>
                            <button
                              type="button"
                              onClick={() => setReplyingToId(null)}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
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
          })
        ) : (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <FiMessageCircle size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm !== null}
        title="Delete Comment?"
        message="This comment will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={() => {
          if (showDeleteConfirm) confirmDeleteComment(showDeleteConfirm);
        }}
        onCancel={() => setShowDeleteConfirm(null)}
      />
    </div>
  );
}
