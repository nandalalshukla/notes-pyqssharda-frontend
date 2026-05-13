"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { useRouter } from "next/navigation";
import { Post } from "@/lib/api/social/social.api";
import {
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiLink2,
  FiUserPlus,
  FiUserMinus,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import CommentsSection from "./CommentsSection";
import EditPostModal from "./EditPostModal";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    togglePostLike,
    removePost,
    fetchPostComments,
    toggleUserFollow,
    followStats,
    feed,
  } = useSocialStore();

  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Get the current post from feed to ensure state is in sync with store
  const currentPost = useMemo(() => {
    return feed.find((p) => p._id === post._id) || post;
  }, [feed, post]);

  const authorId =
    typeof (currentPost.author as unknown) === "string"
      ? (currentPost.author as unknown as string)
      : (currentPost.author as { _id?: string })?._id;

  const isAuthor =
    user?._id && authorId ? String(user._id) === String(authorId) : false;

  const isFollowing =
    followStats.get(authorId || "")?.isFollowedByCurrentUser || false;

  const likeCount = currentPost.likes || 0;
  const isLiked = currentPost.likedByCurrentUser || false;
  const authorImage =
    (currentPost.author as { profilePic?: { url?: string }; avatar?: string })
      ?.profilePic?.url ||
    (currentPost.author as { avatar?: string })?.avatar ||
    "";

  const handleLike = useCallback(async () => {
    if (!user) {
      toast.error("Please login to like posts");
      router.push("/auth/login");
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    try {
      await togglePostLike(post._id);
      toast.success(isLiked ? "Post unliked" : "Post liked!");
    } catch (error: unknown) {
      console.error("Error:", error);
      const errorMsg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to like post";
      toast.error(errorMsg);
    } finally {
      setIsLiking(false);
    }
  }, [post._id, isLiking, isLiked, user, togglePostLike, router]);

  const handleComment = useCallback(async () => {
    if (!user) {
      toast.error("Please login to comment");
      router.push("/auth/login");
      return;
    }

    try {
      await fetchPostComments(post._id);
      setShowComments(!showComments);
    } catch (error) {
      console.error("Failed to load comments", error);
      toast.error("Failed to load comments");
    }
  }, [post._id, showComments, fetchPostComments, user, router]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await removePost(post._id);
      setShowDeleteDialog(false);
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Failed to delete post", error);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  }, [post._id, removePost]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/?postId=${post._id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Post link copied to clipboard");
    });
  }, [post._id]);

  const handleViewProfile = useCallback(() => {
    router.push(`/profile/${authorId}`);
  }, [authorId, router]);

  const handleFollow = useCallback(async () => {
    if (!user) {
      toast.error("Please login to follow users");
      router.push("/auth/login");
      return;
    }

    if (isAuthor) return;

    setIsFollowLoading(true);
    try {
      await toggleUserFollow(authorId || "");
      toast.success(isFollowing ? "User unfollowed" : "User followed!");
    } catch (error: unknown) {
      console.error("Failed to update follow status", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
    }
  }, [user, isAuthor, isFollowing, toggleUserFollow, authorId, router]);

  const formatDate = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return postDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Header Section */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleViewProfile}
          >
            <Image
              src={authorImage || "/images/default-avatar.png"}
              alt={
                (currentPost.author as { username?: string })?.username ||
                "User"
              }
              width={44}
              height={44}
              className="rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {(currentPost.author as { username?: string })?.username}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(currentPost.createdAt)}
              </p>
            </div>
          </div>

          {/* More Menu */}
          <Menu as="div" className="relative flex-shrink-0">
            <Menu.Button className="p-1.5 hover:bg-gray-100 rounded-full focus:outline-none transition-colors">
              <FiMoreVertical className="h-5 w-5 text-gray-600 hover:text-gray-900" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none z-20">
                <div className="py-1">
                  {!isAuthor && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleFollow}
                          disabled={isFollowLoading}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                            active
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-900"
                          } ${isFollowLoading ? "opacity-50" : ""}`}
                        >
                          {isFollowing ? (
                            <>
                              <FiUserMinus size={16} />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <FiUserPlus size={16} />
                              Follow
                            </>
                          )}
                        </button>
                      )}
                    </Menu.Item>
                  )}
                  {isAuthor && (
                    <>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setShowEditModal(true)}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                              active
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-900"
                            }`}
                          >
                            <FiEdit2 size={16} />
                            Edit Post
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setShowDeleteDialog(true)}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                              active ? "bg-red-50 text-red-600" : "text-red-600"
                            }`}
                          >
                            <FiTrash2 size={16} />
                            Delete Post
                          </button>
                        )}
                      </Menu.Item>
                    </>
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Content Section */}
        <div className="px-5 py-4">
          <p className="text-base leading-relaxed text-gray-900 whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>

        {/* Media Gallery */}
        {post.files && post.files.length > 0 && (
          <div className="px-5 py-3">
            <div
              className={`grid gap-2 rounded-lg overflow-hidden ${
                post.files.length === 1
                  ? "grid-cols-1"
                  : post.files.length === 2
                    ? "grid-cols-2"
                    : post.files.length === 3
                      ? "grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-3"
              }`}
            >
              {post.files.map((file, idx) => (
                <div
                  key={idx}
                  className="group/media relative overflow-hidden rounded-lg bg-gray-100 aspect-square"
                >
                  {file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <>
                      <Image
                        src={file}
                        alt={`Post media ${idx + 1}`}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                        priority={idx === 0}
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover/media:opacity-10 transition-opacity" />
                    </>
                  ) : file.match(/\.mp4$/i) ? (
                    <video
                      src={file}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <a
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center h-full bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 transition-colors"
                    >
                      <span className="text-sm font-semibold text-gray-700">
                        File
                      </span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-between text-xs font-semibold text-gray-600 bg-gray-50">
          <span className="hover:text-red-600 cursor-pointer transition-colors">
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">
            {post.commentCount}{" "}
            {post.commentCount === 1 ? "comment" : "comments"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="px-5 py-3 flex gap-2">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-semibold rounded-lg transition-all duration-200 text-sm ${
              isLiked
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300"
            } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLiked ? (
              <FaHeart size={16} className="fill-current" />
            ) : (
              <FiHeart size={16} />
            )}
            <span className="hidden sm:inline">
              {isLiked ? "Liked" : "Like"}
            </span>
          </button>

          <button
            onClick={handleComment}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 font-semibold rounded-lg bg-gray-50 text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 text-sm"
          >
            <FiMessageCircle size={16} />
            <span className="hidden sm:inline">Reply</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 font-semibold rounded-lg bg-gray-50 text-gray-700 border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-all duration-200 text-sm"
          >
            <FiLink2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && <CommentsSection postId={post._id} />}

      {/* Edit Modal */}
      {showEditModal && (
        <EditPostModal
          post={currentPost}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Post?"
        message="This post will be permanently deleted. You cannot undo this action."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
