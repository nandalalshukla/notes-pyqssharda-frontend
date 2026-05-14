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
  FiUserPlus,
  FiUserMinus,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import CommentsModal from "./CommentsModal";
import EditPostModal from "./EditPostModal";
import LikesModal from "./LikesModal";
import ProfileCardHover from "./ProfileCardHover";
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
    toggleUserFollow,
    followStats,
    feed,
    userPosts,
  } = useSocialStore();

  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showProfileHover, setShowProfileHover] = useState(false);
  const [hoverCloseTimer, setHoverCloseTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [doubleTapLikeAnimation, setDoubleTapLikeAnimation] = useState(false);

  const getAuthorFollowStatus = useCallback((sourcePost: Post) => {
    return typeof sourcePost.author === "object"
      ? sourcePost.author?.isFollowedByCurrentUser
      : undefined;
  }, []);

  // Initialize isFollowingLocal - will be synced with store
  const [isFollowingLocal, setIsFollowingLocal] = useState(() => {
    // Try to get initial value from store
    const initialAuthorId =
      typeof (post.author as unknown) === "string"
        ? (post.author as unknown as string)
        : (post.author as { _id?: string })?._id;

    if (initialAuthorId) {
      return (
        followStats.get(initialAuthorId)?.isFollowedByCurrentUser ??
        getAuthorFollowStatus(post) ??
        false
      );
    }
    return getAuthorFollowStatus(post) ?? false;
  });

  const lastTapRef = React.useRef<number>(0);

  // Get the current post from feed to ensure state is in sync with store
  const currentPost = useMemo(() => {
    return (
      feed.find((p) => p._id === post._id) ||
      Array.from(userPosts.values())
        .flat()
        .find((p) => p._id === post._id) ||
      post
    );
  }, [feed, post, userPosts]);

  // Consistently extract authorId - single source of truth
  const authorId = useMemo(() => {
    return typeof (currentPost.author as unknown) === "string"
      ? (currentPost.author as unknown as string)
      : (currentPost.author as { _id?: string })?._id;
  }, [currentPost.author]);

  const isAuthor =
    user?._id && authorId ? String(user._id) === String(authorId) : false;
  const currentAuthorFollowStatus = getAuthorFollowStatus(currentPost);
  const isFollowing =
    (authorId
      ? followStats.get(authorId)?.isFollowedByCurrentUser
      : undefined) ??
    currentAuthorFollowStatus ??
    isFollowingLocal;

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

  const handleDoubleTap = useCallback(async () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (!isLiked) {
        setDoubleTapLikeAnimation(true);
        setTimeout(() => setDoubleTapLikeAnimation(false), 600);
        await handleLike();
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [isLiked, handleLike]);

  const handleComment = useCallback(async () => {
    if (!user) {
      toast.error("Please login to comment");
      router.push("/auth/login");
      return;
    }

    setShowComments(true);
  }, [user, router]);

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
    if (authorId) {
      router.push(`/profile/${authorId}`);
    }
  }, [authorId, router]);

  const openProfileHover = useCallback(() => {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
    }
    setShowProfileHover(true);
  }, [hoverCloseTimer]);

  const scheduleProfileHoverClose = useCallback(() => {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
    }
    const timer = setTimeout(() => setShowProfileHover(false), 250);
    setHoverCloseTimer(timer);
  }, [hoverCloseTimer]);

  const handleFollow = useCallback(async () => {
    if (!user) {
      toast.error("Please login to follow users");
      router.push("/auth/login");
      return;
    }

    if (isAuthor) return;

    setIsFollowLoading(true);
    const previousFollowingState = isFollowing;

    try {
      // Optimistically update UI
      setIsFollowingLocal(!isFollowing);

      await toggleUserFollow(authorId || "", isFollowing);
      toast.success(isFollowing ? "User unfollowed" : "User followed!");
    } catch (error: unknown) {
      // Revert on error
      setIsFollowingLocal(previousFollowingState);
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
      <div className="bg-white border-gray-600 border-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Header Section */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="relative flex items-center gap-3 flex-1 min-w-0">
            {/* Profile Image - Hover Trigger */}
            <div
              onClick={handleViewProfile}
              onMouseEnter={openProfileHover}
              onMouseLeave={scheduleProfileHoverClose}
              className="cursor-pointer flex-shrink-0"
            >
              <Image
                src={authorImage || "/images/default-avatar.png"}
                alt={
                  (currentPost.author as { username?: string })?.username ||
                  "User"
                }
                width={44}
                height={44}
                className="rounded-full object-cover"
              />
            </div>

            {/* Username & Date - Username is also a hover trigger */}
            <div
              className="min-w-0 flex-1"
              onMouseEnter={openProfileHover}
              onMouseLeave={scheduleProfileHoverClose}
            >
              <p
                className="font-semibold text-gray-900 text-sm truncate cursor-pointer hover:underline underline-offset-2 decoration-2 transition-opacity"
                onClick={handleViewProfile}
              >
                {(currentPost.author as { username?: string })?.username}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(currentPost.createdAt)}
              </p>
            </div>

            {/* Profile Card Portal - positioned absolutely at top level */}
            {showProfileHover && authorId && (
              <ProfileCardHover
                userId={authorId}
                onClose={() => setShowProfileHover(false)}
                onMouseEnter={openProfileHover}
              />
            )}
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
          <p className="text-base leading-relaxed text-black whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>

        {/* Media Gallery */}
        {post.files && post.files.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t border-b border-gray-100">
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
              onDoubleClick={handleDoubleTap}
            >
              {post.files.map((file, idx) => (
                <div
                  key={idx}
                  className="group/media relative overflow-hidden rounded-lg bg-gray-100 aspect-square cursor-pointer"
                  onDoubleClick={handleDoubleTap}
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

                      {/* Double-tap like animation */}
                      {doubleTapLikeAnimation && idx === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="animate-bounce">
                            <FaHeart
                              size={80}
                              className="text-white drop-shadow-lg fill-current"
                            />
                          </div>
                        </div>
                      )}
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

        <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-6 text-sm font-semibold text-gray-700">
          {/* Like Section */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLike}
              disabled={isLiking}
              className="flex items-center hover:text-red-600 transition-colors group disabled:opacity-50 cursor-pointer"
            >
              {isLiked ? (
                <FaHeart
                  size={20}
                  className="text-red-600 group-hover:scale-110 transition-transform"
                />
              ) : (
                <FiHeart
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowLikesModal(true)}
              disabled={likeCount === 0}
              className="font-bold text-gray-900 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {likeCount > 1000
                ? (likeCount / 1000).toFixed(1) + "K"
                : likeCount}
            </button>
          </div>

          {/* Comment Section */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleComment}
              className="flex items-center hover:text-blue-600 transition-colors group cursor-pointer"
            >
              <FiMessageCircle
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
            </button>
            <button
              type="button"
              onClick={handleComment}
              className="font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {post.commentCount}
            </button>
          </div>

          {/* Share Section */}
          <button
            onClick={handleShare}
            className="flex items-center hover:text-green-600 transition-colors group cursor-pointer"
          >
            <FiShare2
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      <CommentsModal
        postId={post._id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />

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

      <LikesModal
        postId={post._id}
        likeCount={likeCount}
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
      />
    </>
  );
}
