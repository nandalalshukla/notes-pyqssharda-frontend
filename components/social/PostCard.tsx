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
  FiLogIn,
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
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Get the current post from feed to ensure state is in sync with store
  const currentPost = useMemo(() => {
    return feed.find((p) => p._id === post._id) || post;
  }, [feed, post]);

  const authorId =
    typeof (currentPost.author as unknown) === "string"
      ? (currentPost.author as unknown as string)
      : (currentPost.author as { _id?: string })?._id;
  const isAuthor = user?._id && authorId
    ? String(user._id) === String(authorId)
    : false;
  const isFollowing =
    followStats.get(authorId || "")?.isFollowedByCurrentUser || false;

  // Use post data directly from store, don't maintain local state for likes
  const likeCount = currentPost.likes || 0;
  const isLiked = currentPost.likedByCurrentUser || false;
  const authorImage =
    (currentPost.author as { profilePic?: { url?: string }; avatar?: string })
      ?.profilePic?.url ||
    (currentPost.author as { avatar?: string })?.avatar ||
    "";

  const handleLike = useCallback(async () => {
    console.log("🔴 [PostCard.handleLike] Click detected for post:", post._id);
    console.log("🔴 [PostCard.handleLike] Current state:", {
      user: !!user,
      isLiking,
      isLiked,
      currentPostLikes: currentPost.likes,
      currentPostLikedByCurrentUser: currentPost.likedByCurrentUser,
    });

    // Check authentication first
    if (!user) {
      console.log("🔴 [PostCard.handleLike] No user, redirecting to login");
      toast.error("Please login to like posts", {
        icon: <FiLogIn className="mr-2" />,
      });
      router.push("/auth/login");
      return;
    }

    if (isLiking) {
      console.log("🔴 [PostCard.handleLike] Already liking, returning");
      return;
    }

    setIsLiking(true);
    try {
      console.log("🟠 [PostCard.handleLike] Calling togglePostLike");
      await togglePostLike(post._id);
      console.log("🟢 [PostCard.handleLike] togglePostLike successful");
      toast.success(isLiked ? "Unliked" : "Liked!", {
        icon: isLiked ? "💔" : "❤️",
      });
    } catch (error: unknown) {
      console.error("❌ [PostCard.handleLike] Error:", error);
      const errorMsg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to like post";
      toast.error(errorMsg);
    } finally {
      setIsLiking(false);
    }
  }, [
    post._id,
    isLiking,
    isLiked,
    user,
    togglePostLike,
    router,
    currentPost.likes,
    currentPost.likedByCurrentUser,
  ]);

  const handleComment = useCallback(async () => {
    // Check authentication for comments
    if (!user) {
      toast.error("Please login to comment", {
        icon: <FiLogIn className="mr-2" />,
      });
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
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await removePost(post._id);
      toast.success("Post deleted");
    } catch (error) {
      console.error("Failed to delete post", error);
      toast.error("Failed to delete post");
    }
  }, [post._id, removePost]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/?postId=${post._id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Post link copied to clipboard");
    });
  }, [post._id]);

  const handleViewProfile = useCallback(() => {
    router.push(`/profile/${post.author._id}`);
  }, [post.author._id, router]);

  const handleFollow = useCallback(async () => {
    if (!user) {
      toast.error("Please login to follow users", {
        icon: <FiLogIn className="mr-2" />,
      });
      router.push("/auth/login");
      return;
    }

    if (isAuthor) return;

    try {
      await toggleUserFollow(post.author._id);
      toast.success(isFollowing ? "Unfollowed" : "Followed");
    } catch (error: unknown) {
      console.error("Failed to update follow status", error);
      toast.error("Failed to update follow status");
    }
  }, [user, isAuthor, isFollowing, toggleUserFollow, post.author._id, router]);

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
      <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Header Section */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={handleViewProfile}
              className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-purple-500 rounded-full border-2 border-gray-200 shrink-0 flex items-center justify-center overflow-hidden shadow-md">
                {authorImage ? (
                  <Image
                    src={authorImage}
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 truncate">
                    {post.author.username || "Anonymous"}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(post.createdAt)}
                </p>
              </div>
            </button>

            {!isAuthor && (
              <button
                onClick={handleFollow}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                  isFollowing
                    ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                    : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}

            {isAuthor && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900"
                >
                  <FiMoreVertical size={18} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2.5 hover:bg-gray-50 font-medium text-sm text-gray-900 border-b border-gray-100"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2.5 hover:bg-red-50 font-medium text-sm text-red-600"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 py-4">
          <p className="text-base leading-relaxed text-gray-900 whitespace-pre-wrap wrap-break-word">
            {post.content}
          </p>
        </div>

        {/* Media Gallery */}
        {post.files && post.files.length > 0 && (
          <div className="px-6 py-3">
            <div
              className={`grid gap-3 rounded-xl overflow-hidden ${
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
                      className="flex items-center justify-center h-full bg-linear-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 transition-colors"
                    >
                      <span className="text-sm font-bold text-gray-700">
                        📎 File
                      </span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-between text-xs font-semibold text-gray-600 bg-gray-50">
          <span className="hover:text-red-600 cursor-pointer transition-colors">
            ❤️ {likeCount} {likeCount === 1 ? "like" : "likes"}
          </span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">
            💬 {post.commentCount}{" "}
            {post.commentCount === 1 ? "comment" : "comments"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-3 flex gap-2 flex-wrap">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-semibold rounded-lg transition-all duration-200 text-sm ${
              isLiked
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-red-50 hover:border-red-200"
            } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLiked ? (
              <FaHeart size={16} className="fill-current" />
            ) : (
              <FiHeart size={16} />
            )}
            {isLiked ? "Liked" : "Like"}
          </button>
          <button
            onClick={handleComment}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 font-semibold rounded-lg bg-gray-50 text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 text-sm"
          >
            <FiMessageCircle size={16} />
            Reply
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 font-semibold rounded-lg bg-gray-50 text-gray-700 border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-all duration-200 text-sm"
          >
            <FiShare2 size={16} />
            Share
          </button>
          {isAuthor && (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 font-semibold rounded-lg bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-all duration-200 text-sm"
            >
              ✏️ Edit
            </button>
          )}
          {isAuthor && (
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 font-semibold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all duration-200 text-sm"
            >
              🗑️ Delete
            </button>
          )}
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
    </>
  );
}
