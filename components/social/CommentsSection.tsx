"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { Comment } from "@/lib/api/social/social.api";
import { FiHeart, FiMoreVertical, FiX } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import Image from "next/image";

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

      setIsSubmitting(true);
      try {
        await addComment(postId, newCommentText);
        setNewCommentText("");
        toast.success("Comment added");
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

      try {
        await updateComment(postId, commentId, editText);
        setEditingCommentId(null);
        setEditText("");
        toast.success("Comment updated");
      } catch (error) {
        toast.error("Failed to update comment");
      }
    },
    [postId, editText, updateComment],
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!confirm("Delete this comment?")) return;
      try {
        await removeComment(postId, commentId);
        toast.success("Comment deleted");
      } catch (error) {
        toast.error("Failed to delete comment");
      }
    },
    [postId, removeComment],
  );

  const handleLikeComment = useCallback(
    async (commentId: string) => {
      try {
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
      } catch (error) {
        toast.error("Failed to like comment");
      }
    },
    [likedComments, commentLikes, toggleCommentLike],
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gray-50 rounded-2xl border-2 border-black p-6 mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-bold text-lg mb-4">Comments</h3>

      {/* New Comment Input */}
      {user && (
        <form
          onSubmit={handleAddComment}
          className="mb-6 pb-6 border-b-2 border-black"
        >
          <div className="flex gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user.profilePic?.url ? (
                <Image
                  src={user.profilePic.url}
                  alt={user.name || user.username || "User"}
                  width={40}
                  height={40}
                  className="rounded-full w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {(user.name || user.username || "U")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !newCommentText.trim()}
                  className="px-6 py-2 bg-black text-white rounded-lg font-bold border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : postComments.length > 0 ? (
          postComments.map((comment: Comment) => (
            <div key={comment._id} className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden">
                {comment.author.avatar ? (
                  <Image
                    src={comment.author.avatar}
                    alt={comment.author.username || "User"}
                    width={40}
                    height={40}
                    className="rounded-full w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {(comment.author.username || "U")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 bg-white border-2 border-black rounded-xl p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-sm">
                      {comment.author.username || "Anonymous"}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  {user?._id === comment.author._id && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowCommentMenu(
                            showCommentMenu === comment._id
                              ? null
                              : comment._id,
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <FiMoreVertical size={14} />
                      </button>
                      {showCommentMenu === comment._id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditText(comment.text);
                              setShowCommentMenu(null);
                            }}
                            className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm font-semibold border-b border-gray-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteComment(comment._id);
                              setShowCommentMenu(null);
                            }}
                            className="block w-full text-left px-3 py-2 hover:bg-red-50 text-sm font-semibold text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editingCommentId === comment._id ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleUpdateComment(comment._id)}
                        className="px-3 py-1 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                        className="px-3 py-1 border-2 border-black rounded-lg text-sm font-bold hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-900">{comment.text}</p>
                )}

                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => handleLikeComment(comment._id)}
                    className="flex items-center gap-1 text-xs font-semibold hover:text-red-500 transition-colors"
                  >
                    {likedComments.has(comment._id) ? (
                      <FaHeart size={12} className="text-red-500" />
                    ) : (
                      <FiHeart size={12} />
                    )}
                    {commentLikes.get(comment._id) || 0}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No comments yet</p>
        )}
      </div>
    </div>
  );
}
