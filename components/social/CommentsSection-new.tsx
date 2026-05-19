"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import Image from "next/image";
import VerifiedBadge from "./VerifiedBadge";

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { user } = useAuthStore();
  const {
    comments,
    isLoadingComments,
    fetchPostComments,
    addComment,
    updateComment,
    removeComment,
    toggleCommentLike,
  } = useSocialStore();

  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showCommentMenu, setShowCommentMenu] = useState<string | null>(null);
  const [commentLikes, setCommentLikes] = useState<Map<string, number>>(
    new Map(),
  );
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [likeAnimating, setLikeAnimating] = useState<string | null>(null);

  const postComments = comments.get(postId) || [];
  const isLoading = isLoadingComments.get(postId) || false;

  // Initialize like states from comments
  useEffect(() => {
    const likes = new Map<string, number>();
    const liked = new Set<string>();
    postComments.forEach((comment) => {
      likes.set(comment._id, comment.likes);
      if (comment.likedByCurrentUser) {
        liked.add(comment._id);
      }
    });
    setCommentLikes(likes);
    setLikedComments(liked);
  }, [postComments]);

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
        toast.success("Comment added!", {
          icon: "✨",
        });
      } catch (error) {
        toast.error("Failed to add comment");
      } finally {
        setIsSubmitting(false);
      }
    },
    [postId, newCommentText, addComment],
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
        toast.success("Comment updated!", {
          icon: "✏️",
        });
      } catch (error) {
        toast.error("Failed to update comment");
      }
    },
    [postId, editText, updateComment],
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!confirm("Delete this comment? This action cannot be undone."))
        return;
      try {
        await removeComment(postId, commentId);
        toast.success("Comment deleted", {
          icon: "🗑️",
        });
      } catch (error) {
        toast.error("Failed to delete comment");
      }
    },
    [postId, removeComment],
  );

  const handleLikeComment = useCallback(
    async (commentId: string) => {
      try {
        setLikeAnimating(commentId);
        await toggleCommentLike(commentId);
        const isLiked = likedComments.has(commentId);
        const newLikes = new Map(commentLikes);
        newLikes.set(
          commentId,
          (newLikes.get(commentId) || 0) + (isLiked ? -1 : 1),
        );
        setCommentLikes(newLikes);

        const newLiked = new Set(likedComments);
        isLiked ? newLiked.delete(commentId) : newLiked.add(commentId);
        setLikedComments(newLiked);

        setTimeout(() => setLikeAnimating(null), 300);
      } catch (error) {
        toast.error("Failed to react to comment");
      }
    },
    [likedComments, commentLikes, toggleCommentLike],
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

  return (
    <div className="mt-8 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-sm">
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

            return (
            <div
              key={comment._id}
              className="flex gap-3 group/comment animate-fade-in"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-sm">
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
                        <VerifiedBadge role={comment.author.role} size={12} />
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatRelativeTime(comment.createdAt)}
                      </p>
                    </div>

                    {/* Menu */}
                    {user?._id === comment.author._id && (
                      <div className="relative opacity-0 group-hover/comment:opacity-100 transition-opacity">
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
                          <FiMoreVertical size={16} className="text-gray-600" />
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
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                      {comment.text}
                    </p>
                  )}
                </div>

                {/* Reactions Bar */}
                {!editingCommentId && (
                  <div className="flex items-center gap-4 mt-3 px-2">
                    <button
                      onClick={() => handleLikeComment(comment._id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        likedComments.has(comment._id)
                          ? "bg-red-50 text-red-600"
                          : "text-gray-600 hover:bg-gray-100"
                      } ${
                        likeAnimating === comment._id
                          ? "scale-110"
                          : "scale-100"
                      }`}
                      style={{
                        transitionDuration: "300ms",
                      }}
                    >
                      {likedComments.has(comment._id) ? (
                        <FaHeart size={14} className="fill-current" />
                      ) : (
                        <FiHeart size={14} />
                      )}
                      <span>
                        {commentLikes.get(comment._id) || 0}{" "}
                        {(commentLikes.get(comment._id) || 0) === 1
                          ? "like"
                          : "likes"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            );
          })
        ) : (
          <div className="text-center py-12 px-4">
            <div className="text-3xl mb-3">💭</div>
            <p className="text-sm text-gray-600">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
