"use client";

import React, { useState, useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { Post } from "@/lib/api/social/social.api";
import {
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiMoreVertical,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import CommentsSection from "./CommentsSection";
import EditPostModal from "./EditPostModal";
import Image from "next/image";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuthStore();
  const { togglePostLike, removePost, fetchPostComments } = useSocialStore();

  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(post.likedByCurrentUser || false);

  const isAuthor = user?._id === post.author._id;

  const handleLike = useCallback(async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await togglePostLike(post._id);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  }, [post._id, isLiking, isLiked, likeCount, togglePostLike]);

  const handleComment = useCallback(async () => {
    try {
      await fetchPostComments(post._id);
      setShowComments(!showComments);
    } catch (error) {
      toast.error("Failed to load comments");
    }
  }, [post._id, showComments, fetchPostComments]);

  const handleDelete = useCallback(async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await removePost(post._id);
      toast.success("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  }, [post._id, removePost]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/?postId=${post._id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Post link copied to clipboard");
    });
  }, [post._id]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-black flex items-center justify-center overflow-hidden">
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.username || "User"}
                  width={48}
                  height={48}
                  className="rounded-full w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {(post.author.username || "U")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {post.author.username || "Anonymous"}
              </h3>
              <p className="text-sm text-gray-600">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiMoreVertical size={20} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10">
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setShowMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-semibold border-b border-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-red-50 font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <p className="text-base leading-relaxed mb-4 text-gray-900">
          {post.content}
        </p>

        {/* Files/Images */}
        {post.files && post.files.length > 0 && (
          <div
            className={`grid gap-2 mb-4 ${
              post.files.length === 1
                ? "grid-cols-1"
                : post.files.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
            }`}
          >
            {post.files.map((file, idx) => (
              <div
                key={idx}
                className="border-2 border-black rounded-lg overflow-hidden bg-gray-100"
              >
                {file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <Image
                    src={file}
                    alt={`Post media ${idx}`}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                ) : file.match(/\.mp4$/i) ? (
                  <video
                    src={file}
                    controls
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-48 bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    <span className="text-sm font-bold text-gray-700">
                      📎 View File
                    </span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 mb-4 text-sm font-semibold border-y-2 border-black py-3">
          <span>{likeCount} likes</span>
          <span>{post.commentCount} comments</span>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-2">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex-1 flex items-center justify-center gap-2 py-3 font-bold border-2 border-black rounded-lg hover:bg-red-50 transition-colors"
          >
            {isLiked ? (
              <FaHeart size={18} className="text-red-500" />
            ) : (
              <FiHeart size={18} />
            )}
            {isLiked ? "Liked" : "Like"}
          </button>
          <button
            onClick={handleComment}
            className="flex-1 flex items-center justify-center gap-2 py-3 font-bold border-2 border-black rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiMessageCircle size={18} />
            Comment
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 font-bold border-2 border-black rounded-lg hover:bg-green-50 transition-colors"
          >
            <FiShare2 size={18} />
            Share
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && <CommentsSection postId={post._id} />}

      {/* Edit Modal */}
      {showEditModal && (
        <EditPostModal post={post} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
}
