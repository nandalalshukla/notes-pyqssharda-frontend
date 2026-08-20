"use client";

import React, { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { useRouter } from "next/navigation";
import { Post, PostType } from "@/lib/api/social/social.api";
import {
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiUserMinus,
  FiBell,
  FiCalendar,
  FiMessageSquare,
  FiFlag,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import ProfileCardHover from "./ProfileCardHover";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import VerifiedBadge from "./VerifiedBadge";
import { Avatar, Badge, type BadgeVariant } from "@/components/ui";

// Interaction-only modals: only needed after a click, so keep them out of
// PostCard's (list-rendered) initial bundle.
const CommentsModal = dynamic(() => import("./CommentsModal"));
const EditPostModal = dynamic(() => import("./EditPostModal"));
const LikesModal = dynamic(() => import("./LikesModal"));
const ReportModal = dynamic(() => import("./ReportModal"));
const ConfirmationDialog = dynamic(
  () => import("@/components/shared/ConfirmationDialog"),
);

interface PostCardProps {
  post: Post;
  className?: string;
  style?: React.CSSProperties;
}

const postTypeMeta: Record<
  PostType,
  {
    label: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
    badgeVariant: BadgeVariant;
  }
> = {
  general: {
    label: "General",
    Icon: FiMessageSquare,
    badgeVariant: "default",
  },
  announcement: {
    label: "Announcement",
    Icon: FiBell,
    badgeVariant: "coral",
  },
  event: {
    label: "Event",
    Icon: FiCalendar,
    badgeVariant: "mint",
  },
};

export default function PostCard({
  post,
  className = "",
  style,
}: PostCardProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const togglePostLike = useSocialStore((s) => s.togglePostLike);
  const removePost = useSocialStore((s) => s.removePost);
  const toggleUserFollow = useSocialStore((s) => s.toggleUserFollow);
  const followStats = useSocialStore((s) => s.followStats);
  const feed = useSocialStore((s) => s.feed);
  const userPosts = useSocialStore((s) => s.userPosts);

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
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    targetType: "post" as "post" | "comment" | "user",
    targetId: "",
    targetOwner: "",
  });

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
  const authorRole =
    (currentPost.author as { role?: string } | undefined)?.role ?? undefined;
  const postType =
    currentPost.type === "event" || currentPost.type === "announcement"
      ? currentPost.type
      : "general";
  const typeMeta = postTypeMeta[postType];
  const TypeIcon = typeMeta.Icon;

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

  const openReportModal = useCallback(
    (targetType: "post" | "comment" | "user", targetId: string) => {
      if (!user) {
        toast.error("Please login to report content");
        router.push("/auth/login");
        return;
      }

      if (!authorId) return;

      setReportModal({
        isOpen: true,
        targetType,
        targetId,
        targetOwner: targetType === "user" ? targetId : authorId,
      });
    },
    [authorId, router, user],
  );

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
      <div
        style={style}
        className={`relative isolate overflow-visible rounded-2xl border border-border bg-card shadow-soft-sm transition-all duration-300 hover:shadow-soft-md ${
          showProfileHover ? "z-50" : "z-0"
        } ${className}`}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-border px-5 pt-4 pb-3">
          <div className="relative flex min-w-0 flex-1 items-center gap-3">
            <span
              onClick={handleViewProfile}
              onMouseEnter={openProfileHover}
              onMouseLeave={scheduleProfileHoverClose}
              className="cursor-pointer flex-shrink-0"
            >
              <Avatar
                src={authorImage}
                alt={
                  (currentPost.author as { username?: string })?.username ||
                  "User"
                }
                size="md"
              />
            </span>
            <div className="min-w-0 flex-1">
              <span
                className="relative inline-flex w-fit flex-col min-w-0"
                onMouseEnter={openProfileHover}
                onMouseLeave={scheduleProfileHoverClose}
              >
                <p
                  className="cursor-pointer truncate text-sm font-semibold text-foreground underline-offset-2 decoration-2 transition-opacity hover:underline"
                  onClick={handleViewProfile}
                >
                  <span className="inline-flex items-center gap-1">
                    {(currentPost.author as { username?: string })?.username}
                    <VerifiedBadge role={authorRole} size={12} />
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(currentPost.createdAt)}
                </p>

                {showProfileHover && authorId && (
                  <ProfileCardHover
                    userId={authorId}
                    className="absolute left-0 top-full mt-2 z-[999]"
                    onClose={() => setShowProfileHover(false)}
                    onMouseEnter={openProfileHover}
                  />
                )}
              </span>
            </div>
          </div>

          <Badge variant={typeMeta.badgeVariant} icon={<TypeIcon size={13} />} className="mr-2 shrink-0">
            {typeMeta.label}
          </Badge>

          {/* More Menu */}
          <Menu as="div" className="relative flex-shrink-0">
            <Menu.Button className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none cursor-pointer">
              <FiMoreVertical className="h-5 w-5" />
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
              <Menu.Items className="absolute right-0 z-20 mt-2 w-44 origin-top-right rounded-xl border border-border bg-card shadow-soft-lg focus:outline-none">
                <div className="py-1">
                  {!isAuthor && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleFollow}
                          disabled={isFollowLoading}
                          className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-foreground"
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
                  {!isAuthor && (
                    <>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => openReportModal("post", post._id)}
                            className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                              active
                                ? "bg-warning/10 text-warning"
                                : "text-foreground"
                            }`}
                          >
                            <FiFlag size={16} />
                            Report Post
                          </button>
                        )}
                      </Menu.Item>
                      {authorId && (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() =>
                                openReportModal("user", authorId)
                              }
                              className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                                active
                                  ? "bg-warning/10 text-warning"
                                  : "text-foreground"
                              }`}
                            >
                              <FiFlag size={16} />
                              Report User
                            </button>
                          )}
                        </Menu.Item>
                      )}
                    </>
                  )}
                  {isAuthor && (
                    <>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setShowEditModal(true)}
                            className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                              active
                                ? "bg-primary/10 text-primary"
                                : "text-foreground"
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
                            className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                              active ? "bg-destructive/10 text-destructive" : "text-destructive"
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
          <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-foreground">
            {post.content}
          </p>
        </div>

        {/* Media Gallery */}
        {post.files && post.files.length > 0 && (
          <div className="border-t border-b border-border bg-muted/50 px-5 py-3">
            <div
              className={`grid gap-2 rounded-xl overflow-hidden ${
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
                  className="group/media relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted"
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
                      className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-secondary-hover transition-colors hover:opacity-80"
                    >
                      <span className="text-sm font-semibold text-foreground">
                        File
                      </span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 border-t border-border px-5 py-3 text-sm font-semibold text-muted-foreground">
          {/* Like Section */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLike}
              className="group flex items-center p-1 hover:text-destructive cursor-pointer"
            >
              {isLiked ? (
                <FaHeart
                  size={20}
                  className="text-destructive group-hover:scale-110"
                />
              ) : (
                <FiHeart size={20} className="group-hover:scale-110" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowLikesModal(true)}
              disabled={likeCount === 0}
              className="font-bold text-foreground hover:text-destructive disabled:opacity-50 cursor-pointer"
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
              className="group flex items-center transition-colors hover:text-primary cursor-pointer"
            >
              <FiMessageCircle
                size={20}
                className="transition-transform group-hover:scale-110"
              />
            </button>
            <button
              type="button"
              onClick={handleComment}
              className="font-bold text-foreground transition-colors hover:text-primary cursor-pointer"
            >
              {post.commentCount}
            </button>
          </div>

          {/* Share Section */}
          <button
            onClick={handleShare}
            className="group flex items-center transition-colors hover:text-success cursor-pointer"
          >
            <FiShare2
              size={20}
              className="transition-transform group-hover:scale-110"
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

      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal((prev) => ({ ...prev, isOpen: false }))}
        targetType={reportModal.targetType}
        targetId={reportModal.targetId}
        targetOwner={reportModal.targetOwner}
      />

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
