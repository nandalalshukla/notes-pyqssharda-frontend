"use client";

import React, { useState, useCallback, useMemo, useRef, memo } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { useRouter } from "next/navigation";
import { Post } from "@/lib/api/social/social.api";
import {
  FiMessageCircle,
  FiShare2,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiUserMinus,
  FiArrowUp,
  FiArrowDown,
  FiBookmark,
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
import { motion } from "framer-motion";

interface PostCardProps {
  post: Post;
  isAboveFold?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function PostCard({ post, isAboveFold = false, className = "", style }: PostCardProps) {
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
  const hoverCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [doubleTapLikeAnimation, setDoubleTapLikeAnimation] = useState(false);
  const [saved, setSaved] = useState(false);

  const getAuthorFollowStatus = useCallback((sourcePost: Post) => {
    return typeof sourcePost.author === "object"
      ? sourcePost.author?.isFollowedByCurrentUser
      : undefined;
  }, []);

  const [isFollowingLocal, setIsFollowingLocal] = useState(() => {
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

  const currentPost = useMemo(() => {
    return (
      feed.find((p) => p._id === post._id) ||
      Array.from(userPosts.values()).flat().find((p) => p._id === post._id) ||
      post
    );
  }, [feed, post, userPosts]);

  const authorId = useMemo(() => {
    return typeof (currentPost.author as unknown) === "string"
      ? (currentPost.author as unknown as string)
      : (currentPost.author as { _id?: string })?._id;
  }, [currentPost.author]);

  const isAuthor =
    user?._id && authorId ? String(user._id) === String(authorId) : false;
  const currentAuthorFollowStatus = getAuthorFollowStatus(currentPost);
  const isFollowing =
    (authorId ? followStats.get(authorId)?.isFollowedByCurrentUser : undefined) ??
    currentAuthorFollowStatus ??
    isFollowingLocal;

  const likeCount = currentPost.likes || 0;
  const isLiked = currentPost.likedByCurrentUser || false;
  const authorImage =
    (currentPost.author as { profilePic?: { url?: string } })?.profilePic?.url || "";
  const authorName =
    (currentPost.author as { username?: string })?.username || "User";

  const handleLike = useCallback(async () => {
    if (!user) { toast.error("Please login to like posts"); router.push("/auth/login"); return; }
    if (isLiking) return;
    setIsLiking(true);
    try {
      await togglePostLike(post._id);
    } catch {
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  }, [post._id, isLiking, user, togglePostLike, router]);

  const handleDoubleTap = useCallback(async () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) {
        setDoubleTapLikeAnimation(true);
        setTimeout(() => setDoubleTapLikeAnimation(false), 700);
        await handleLike();
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [isLiked, handleLike]);

  const handleComment = useCallback(() => {
    if (!user) { toast.error("Please login to comment"); router.push("/auth/login"); return; }
    setShowComments(true);
  }, [user, router]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await removePost(post._id);
      setShowDeleteDialog(false);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  }, [post._id, removePost]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/?postId=${post._id}`);
    toast.success("Link copied!");
  }, [post._id]);

  const handleViewProfile = useCallback(() => {
    if (authorId) router.push(`/profile/${authorId}`);
  }, [authorId, router]);

  const openProfileHover = useCallback(() => {
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
    setShowProfileHover(true);
  }, []);

  const scheduleProfileHoverClose = useCallback(() => {
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
    hoverCloseTimerRef.current = setTimeout(() => setShowProfileHover(false), 250);
  }, []);

  const handleFollow = useCallback(async () => {
    if (!user) { toast.error("Please login to follow users"); router.push("/auth/login"); return; }
    if (isAuthor) return;
    setIsFollowLoading(true);
    const prev = isFollowing;
    try {
      setIsFollowingLocal(!isFollowing);
      await toggleUserFollow(authorId || "", isFollowing);
      toast.success(isFollowing ? "Unfollowed" : "Following!");
    } catch {
      setIsFollowingLocal(prev);
      toast.error("Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
    }
  }, [user, isAuthor, isFollowing, toggleUserFollow, authorId, router]);

  const formatDate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7) return `${d}d ago`;
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatCount = (n: number) =>
    n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);

  return (
    <>
      <div
        style={style}
        className={`group relative overflow-visible ${showProfileHover ? "z-50" : "z-0"} ${className}`}
      >
        <div
          className="rounded-2xl overflow-hidden transition-all duration-200"
          style={{
            background: "var(--paper-surface)",
            border: "1.5px solid rgba(15,15,15,0.08)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(15,15,15,0.16)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(15,15,15,0.08)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
          }}
        >
          <div className="flex">

            {/* ── Vote rail ── */}
            <div
              className="flex flex-col items-center gap-1 px-2 py-3 rounded-l-2xl flex-shrink-0"
              style={{ background: "rgba(15,15,15,0.025)", width: "44px" }}
            >
              <motion.button
                onClick={handleLike}
                disabled={isLiking}
                whileTap={{ scale: 0.85 }}
                className="p-1 rounded-lg transition-colors"
                style={{ color: isLiked ? "#f97316" : "var(--muted-ink)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(249,115,22,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                aria-label="Upvote"
              >
                <FiArrowUp size={18} strokeWidth={isLiked ? 2.5 : 1.8} />
              </motion.button>

              <button
                onClick={() => setShowLikesModal(true)}
                disabled={likeCount === 0}
                className="text-xs font-bold leading-none transition-colors"
                style={{ color: isLiked ? "#f97316" : "var(--ink)" }}
              >
                {formatCount(likeCount)}
              </button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                className="p-1 rounded-lg transition-colors"
                style={{ color: "var(--muted-ink)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                aria-label="Downvote"
              >
                <FiArrowDown size={18} strokeWidth={1.8} />
              </motion.button>
            </div>

            {/* ── Main content ── */}
            <div className="flex-1 min-w-0 py-3 pr-3 pl-2">

              {/* Meta row: avatar + author + time + menu */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Avatar */}
                  <span
                    className="relative flex-shrink-0 cursor-pointer"
                    onClick={handleViewProfile}
                    onMouseEnter={openProfileHover}
                    onMouseLeave={scheduleProfileHoverClose}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden border"
                      style={{ borderColor: "rgba(15,15,15,0.12)" }}>
                      <Image
                        src={authorImage || "/images/default-avatar.png"}
                        alt={authorName}
                        width={28}
                        height={28}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {showProfileHover && authorId && (
                      <ProfileCardHover
                        userId={authorId}
                        className="absolute left-0 top-full mt-2 z-[999]"
                        onClose={() => setShowProfileHover(false)}
                        onMouseEnter={openProfileHover}
                      />
                    )}
                  </span>

                  {/* Author name */}
                  <span
                    className="relative"
                    onMouseEnter={openProfileHover}
                    onMouseLeave={scheduleProfileHoverClose}
                  >
                    <button
                      onClick={handleViewProfile}
                      className="text-xs font-semibold hover:underline underline-offset-2 transition-opacity"
                      style={{ color: "var(--ink)" }}
                    >
                      u/{authorName}
                    </button>
                  </span>

                  <span className="text-xs" style={{ color: "var(--muted-ink)" }}>·</span>
                  <span className="text-xs" style={{ color: "var(--muted-ink)" }}>
                    {formatDate(currentPost.createdAt)}
                  </span>
                </div>

                {/* More menu */}
                <Menu as="div" className="relative flex-shrink-0">
                  <Menu.Button
                    className="p-1 rounded-lg transition-colors focus:outline-none"
                    style={{ color: "var(--muted-ink)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(15,15,15,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    aria-label="Post options"
                  >
                    <FiMoreVertical size={15} />
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
                    <Menu.Items
                      className="absolute right-0 mt-1 w-40 origin-top-right rounded-xl border focus:outline-none z-20"
                      style={{
                        background: "var(--paper-surface)",
                        borderColor: "rgba(15,15,15,0.12)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div className="py-1 px-1">
                        {!isAuthor && (
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleFollow}
                                disabled={isFollowLoading}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${active ? "bg-black/5" : ""}`}
                                style={{ color: "var(--ink)" }}
                              >
                                {isFollowing ? <><FiUserMinus size={13} /> Unfollow</> : <><FiUserPlus size={13} /> Follow</>}
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
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${active ? "bg-black/5" : ""}`}
                                  style={{ color: "var(--ink)" }}
                                >
                                  <FiEdit2 size={13} /> Edit
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => setShowDeleteDialog(true)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${active ? "bg-red-50" : ""}`}
                                  style={{ color: "#dc2626" }}
                                >
                                  <FiTrash2 size={13} /> Delete
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

              {/* Post content */}
              {post.content && (
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap break-words mb-3"
                  style={{ color: "var(--ink)" }}
                >
                  {post.content}
                </p>
              )}

              {/* Media */}
              {post.files && post.files.length > 0 && (
                <div
                  className="mb-3 rounded-xl overflow-hidden border"
                  style={{ borderColor: "rgba(15,15,15,0.08)" }}
                  onDoubleClick={handleDoubleTap}
                >
                  <div
                    className={`grid gap-0.5 ${
                      post.files.length === 1 ? "grid-cols-1"
                      : post.files.length === 2 ? "grid-cols-2"
                      : "grid-cols-2"
                    }`}
                  >
                    {post.files.slice(0, 4).map((file, idx) => (
                      <div
                        key={idx}
                        className="relative overflow-hidden bg-gray-100"
                        style={{
                          aspectRatio: post.files!.length === 1 ? "16/9" : "1",
                          maxHeight: post.files!.length === 1 ? "420px" : "200px",
                        }}
                      >
                        {file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <>
                            <Image
                              src={file}
                              alt={`Post media ${idx + 1}`}
                              fill
                              className="object-cover hover:scale-[1.02] transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, 600px"
                              priority={isAboveFold && idx === 0}
                            />
                            {doubleTapLikeAnimation && idx === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.div
                                  initial={{ scale: 0, opacity: 1 }}
                                  animate={{ scale: 1.4, opacity: 0 }}
                                  transition={{ duration: 0.6 }}
                                >
                                  <FaHeart size={72} className="text-red-500 drop-shadow-lg" />
                                </motion.div>
                              </div>
                            )}
                            {/* Show +N overlay on last visible if more exist */}
                            {idx === 3 && post.files!.length > 4 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-xl font-bold">+{post.files!.length - 4}</span>
                              </div>
                            )}
                          </>
                        ) : file.match(/\.mp4$/i) ? (
                          <video src={file} controls className="w-full h-full object-cover" />
                        ) : (
                          <a href={file} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center h-full bg-gray-100 hover:bg-gray-200 transition-colors">
                            <span className="text-xs font-semibold text-gray-600">View File</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Action bar ── */}
              <div className="flex items-center gap-1">
                {/* Comments */}
                <button
                  onClick={handleComment}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ color: "var(--muted-ink)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(15,15,15,0.06)";
                    (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--muted-ink)";
                  }}
                >
                  <FiMessageCircle size={15} strokeWidth={1.8} />
                  <span>{formatCount(post.commentCount || 0)} Comments</span>
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ color: "var(--muted-ink)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(15,15,15,0.06)";
                    (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--muted-ink)";
                  }}
                >
                  <FiShare2 size={15} strokeWidth={1.8} />
                  <span>Share</span>
                </button>

                {/* Save */}
                <button
                  onClick={() => setSaved((s) => !s)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ color: saved ? "var(--primary-blue)" : "var(--muted-ink)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(15,15,15,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                  aria-label={saved ? "Unsave post" : "Save post"}
                >
                  <FiBookmark size={15} strokeWidth={saved ? 2.5 : 1.8} />
                  <span>{saved ? "Saved" : "Save"}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CommentsModal postId={post._id} isOpen={showComments} onClose={() => setShowComments(false)} />
      {showEditModal && (
        <EditPostModal post={currentPost} onClose={() => setShowEditModal(false)} />
      )}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Post?"
        message="This post will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
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

export default memo(PostCard);
