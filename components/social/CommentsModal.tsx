"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
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
  FiCornerDownRight,
  FiMessageSquare,
  FiLogIn,
  FiFlag,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import { useBodyScroll } from "@/hooks/useBodyScroll";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import VerifiedBadge from "./VerifiedBadge";
import ReportModal from "./ReportModal";
import { Modal, Avatar } from "@/components/ui";

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
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    targetType: "comment" as const,
    targetId: "",
    targetOwner: "",
  });
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

  const openReportModal = useCallback(
    (commentId: string, targetOwner: string) => {
      if (!user) {
        toast.error("Please login to report content", {
          icon: <FiLogIn className="mr-2" />,
        });
        router.push("/auth/login");
        return;
      }

      setReportModal({
        isOpen: true,
        targetType: "comment",
        targetId: commentId,
        targetOwner,
      });
    },
    [user, router],
  );

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
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FiLoader className="animate-spin" /> Loading replies
          </div>
        ) : commentReplies.length === 0 ? (
          <div className="text-xs text-muted-foreground">No replies yet</div>
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
                  className="shrink-0 cursor-pointer"
                >
                  <Avatar src={reply.author.profilePic?.url} alt={reply.author.username || "User"} size="sm" />
                </button>
                <div className="flex-1">
                  <div className="rounded-xl border border-border bg-card p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleViewProfile(reply.author)}
                          className="inline-flex max-w-full items-center gap-1 text-xs font-semibold text-foreground underline-offset-2 hover:underline cursor-pointer"
                        >
                          <span className="truncate">
                            {reply.author.username || "Anonymous"}
                          </span>
                          <VerifiedBadge role={reply.author.role} size={11} />
                        </button>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatRelativeTime(reply.createdAt)}
                        </p>
                      </div>
                      {editingCommentId !== reply._id && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowCommentMenu(
                                showCommentMenu === reply._id
                                  ? null
                                  : reply._id,
                              )
                            }
                            className="rounded p-1 opacity-0 transition-opacity group-hover/comment:opacity-100 hover:bg-secondary cursor-pointer"
                          >
                            <FiMoreVertical
                              size={14}
                              className="text-muted-foreground"
                            />
                          </button>
                          {showCommentMenu === reply._id && (
                            <div className="absolute top-full right-0 z-20 mt-2 min-w-[120px] overflow-hidden rounded-lg border border-border bg-card shadow-soft-lg">
                              {isReplyAuthor && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(reply._id);
                                      setEditText(reply.text);
                                      setShowCommentMenu(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                                  >
                                    <FiEdit2 size={14} />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteComment(reply._id);
                                      setShowCommentMenu(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 cursor-pointer"
                                  >
                                    <FiTrash2 size={14} />
                                    Delete
                                  </button>
                                </>
                              )}
                              {!isReplyAuthor && (
                                <button
                                  onClick={() => {
                                    openReportModal(
                                      reply._id,
                                      typeof reply.author === "string"
                                        ? reply.author
                                        : reply.author?._id || "",
                                    );
                                    setShowCommentMenu(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-warning hover:bg-warning/10 cursor-pointer"
                                >
                                  <FiFlag size={14} />
                                  Report
                                </button>
                              )}
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
                          className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                          rows={2}
                        />
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleUpdateComment(reply._id)}
                            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditText("");
                            }}
                            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground">
                        {reply.text}
                      </p>
                    )}
                  </div>
                  {editingCommentId !== reply._id && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleLikeComment(reply._id)}
                        className="group flex items-center p-1 hover:text-destructive cursor-pointer"
                      >
                        {reply.likedByCurrentUser ? (
                          <FaHeart
                            size={20}
                            className="text-destructive group-hover:scale-110"
                          />
                        ) : (
                          <FiHeart
                            size={20}
                            className="group-hover:scale-110"
                          />
                        )}
                      </button>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {reply.likes || 0}{" "}
                        {(reply.likes || 0) === 1 ? "like" : "likes"}
                      </span>

                      <button
                        onClick={() => toggleReplyForm(reply._id)}
                        className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-muted-foreground transition-all hover:bg-secondary cursor-pointer"
                      >
                        <FiCornerDownRight size={12} />
                        Reply
                      </button>

                      <button
                        onClick={() => handleToggleReplies(reply._id)}
                        className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-muted-foreground transition-all hover:bg-secondary cursor-pointer"
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
                        <Avatar src={user.profilePic?.url} alt={user.name || user.username || "User"} size="xs" />
                        <div className="flex-1">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full resize-none rounded-lg border border-input bg-card p-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                            rows={2}
                          />
                          <div className="mt-3 flex gap-2">
                            <button
                              type="submit"
                              disabled={isSubmitting || !replyText.trim()}
                              className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
                            >
                              Reply
                            </button>
                            <button
                              type="button"
                              onClick={() => setReplyingToId(null)}
                              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer"
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
      <div key={comment._id} className="group/comment flex gap-3">
        {/* Avatar */}
        <button
          type="button"
          onClick={() => handleViewProfile(comment.author)}
          className="shrink-0 cursor-pointer"
        >
          <Avatar
            src={comment.author?.profilePic?.url}
            alt={comment.author?.username || "User"}
            size="sm"
          />
        </button>

        {/* Comment Content */}
        <div className="min-w-0 flex-1">
          <div className="rounded-xl bg-muted px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => handleViewProfile(comment.author)}
                  className="inline-flex max-w-full items-center gap-1 text-sm font-semibold text-foreground underline-offset-2 hover:underline cursor-pointer"
                >
                  <span className="truncate">
                    {comment.author?.username || "Anonymous"}
                  </span>
                  <VerifiedBadge role={comment.author?.role} size={12} />
                </button>
                {editingCommentId === comment._id ? (
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                      rows={2}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleUpdateComment(comment._id)}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-0.5 text-sm break-words text-foreground">
                    {comment.text}
                  </p>
                )}
              </div>
              {editingCommentId !== comment._id && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowCommentMenu(
                        showCommentMenu === comment._id ? null : comment._id,
                      )
                    }
                    className="rounded p-1 opacity-0 transition-opacity group-hover/comment:opacity-100 hover:bg-secondary-hover cursor-pointer"
                  >
                    <FiMoreVertical size={14} className="text-muted-foreground" />
                  </button>
                  {showCommentMenu === comment._id && (
                    <div className="absolute top-full right-0 z-20 mt-2 min-w-[120px] overflow-hidden rounded-lg border border-border bg-card shadow-soft-lg">
                      {isCommentAuthor && (
                        <>
                          <button
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditText(comment.text);
                              setShowCommentMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                          >
                            <FiEdit2 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteComment(comment._id);
                              setShowCommentMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <FiTrash2 size={14} />
                            Delete
                          </button>
                        </>
                      )}
                      {!isCommentAuthor && (
                        <button
                          onClick={() => {
                            openReportModal(
                              comment._id,
                              typeof comment.author === "string"
                                ? comment.author
                                : comment.author?._id || "",
                            );
                            setShowCommentMenu(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-warning hover:bg-warning/10 cursor-pointer"
                        >
                          <FiFlag size={14} />
                          Report
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comment Actions */}
          <div className="mt-2 flex flex-wrap items-center gap-3 px-3 text-xs text-muted-foreground">
            <button
              onClick={() => handleLikeComment(comment._id)}
              className="group flex items-center p-1 hover:text-destructive cursor-pointer"
            >
              {comment.likedByCurrentUser ? (
                <FaHeart
                  size={20}
                  className="text-destructive group-hover:scale-110"
                />
              ) : (
                <FiHeart size={20} className="group-hover:scale-110" />
              )}
            </button>
            <span className="text-xs font-semibold text-muted-foreground">
              {comment.likes || 0}
            </span>
            <span>{formatRelativeTime(comment.createdAt)}</span>
            <button
              onClick={() => toggleReplyForm(comment._id)}
              className="flex items-center gap-1.5 font-semibold text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <FiCornerDownRight size={12} />
              Reply
            </button>
            <button
              onClick={() => handleToggleReplies(comment._id)}
              className="flex items-center gap-1.5 font-semibold text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
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
                <Avatar src={user.profilePic?.url} alt={user.name || user.username || "User"} size="xs" />
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full resize-none rounded-lg border border-input bg-card p-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    rows={2}
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !replyText.trim()}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyingToId(null)}
                      className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer"
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
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Comments"
        size="md"
        footer={
          <form onSubmit={handleAddComment} className="flex w-full gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={user ? "Add a comment..." : "Login to comment"}
              disabled={!user || isSubmitting}
              className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:bg-card focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim() || isSubmitting || !user}
              className="rounded-full p-2.5 text-primary transition-colors hover:bg-secondary hover:text-primary-hover disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <FiLoader size={20} className="animate-spin" />
              ) : (
                <FiSend size={20} />
              )}
            </button>
          </form>
        }
      >
        <div ref={commentsListRef} className="space-y-4">
          {isLoading && postComments.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">Loading comments...</p>
              </div>
            </div>
          ) : postComments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">No comments yet</p>
              <p className="mt-1 text-xs">Be the first to comment!</p>
            </div>
          ) : (
            postComments.map((comment) => (
              <div key={comment._id} className="space-y-3">
                {renderComment(comment)}
              </div>
            ))
          )}
        </div>
      </Modal>

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
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal((prev) => ({ ...prev, isOpen: false }))}
        targetType={reportModal.targetType}
        targetId={reportModal.targetId}
        targetOwner={reportModal.targetOwner}
      />
    </>
  );
}
