"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { User } from "@/lib/api/social/social.api";
import { getPostLikes } from "@/lib/api/social/social.api";
import { useBodyScroll } from "@/hooks/useBodyScroll";
import useAuthStore from "@/stores/user/authStore";
import { useSocialStore } from "@/stores/social/social.store";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import VerifiedBadge from "./VerifiedBadge";
import { Modal, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

interface LikesModalProps {
  postId: string;
  likeCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function LikesModal({
  postId,
  likeCount,
  isOpen,
  onClose,
}: LikesModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toggleUserFollow, followStats } = useSocialStore();

  // Prevent body scroll when modal is open
  useBodyScroll(isOpen);

  const [likes, setLikes] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [followingStates, setFollowingStates] = useState<
    Record<string, boolean>
  >({});
  const [followingLoads, setFollowingLoads] = useState<Record<string, boolean>>(
    {},
  );
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch likes on mount or when postId changes
  useEffect(() => {
    if (isOpen && currentPage === 1) {
      fetchLikes(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, postId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLikes([]);
      setCurrentPage(1);
      setTotalPages(1);
      setFollowingStates({});
      setFollowingLoads({});
    }
  }, [isOpen]);

  const fetchLikes = useCallback(
    async (page: number) => {
      if (page < 1 || (page > totalPages && page !== 1)) return;

      setIsLoading(true);
      try {
        const response = await getPostLikes(postId, page, 20);
        if (response && response.data) {
          const likes = response.data.likes || [];
          const pagination = response.data.pagination;

          setLikes((prev) => (page === 1 ? likes : [...prev, ...likes]));
          setTotalPages(pagination?.totalPages ?? pagination?.pages ?? 1);
          setCurrentPage(page);

          // Initialize following states from the backend response
          const newFollowingStates: Record<string, boolean> = {};
          likes.forEach((like) => {
            if (like) {
              newFollowingStates[like._id] =
                like.isFollowedByCurrentUser ?? false;
            }
          });
          setFollowingStates((prev) => {
            if (page === 1) {
              return newFollowingStates;
            }
            return { ...prev, ...newFollowingStates };
          });
        }
      } catch (error) {
        console.error("Failed to fetch likes:", error);
        toast.error("Failed to load likes");
      } finally {
        setIsLoading(false);
      }
    },
    [postId, totalPages],
  );

  // Update following states when followStats changes (after user follows/unfollows)
  useEffect(() => {
    if (isOpen && likes.length > 0) {
      const newFollowingStates: Record<string, boolean> = {};
      likes.forEach((like) => {
        // Get the latest state from followStats store
        const stats = followStats.get(like._id);
        const isFollowing =
          stats?.isFollowedByCurrentUser ??
          like.isFollowedByCurrentUser ??
          false;
        newFollowingStates[like._id] = isFollowing;
      });
      setFollowingStates(newFollowingStates);
    }
  }, [followStats, isOpen, likes]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          currentPage < totalPages
        ) {
          fetchLikes(currentPage + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [currentPage, totalPages, isLoading, fetchLikes]);

  const handleFollow = useCallback(
    async (userId: string, currentFollowing: boolean) => {
      if (!user) {
        toast.error("Please login to follow users");
        router.push("/auth/login");
        return;
      }

      setFollowingLoads((prev) => ({ ...prev, [userId]: true }));
      try {
        await toggleUserFollow(userId, currentFollowing);
        // Immediately update the local state
        setFollowingStates((prev) => ({
          ...prev,
          [userId]: !currentFollowing,
        }));
        toast.success(currentFollowing ? "User unfollowed" : "User followed!");
      } catch (error) {
        console.error("Failed to update follow status", error);
        toast.error("Failed to update follow status");
      } finally {
        setFollowingLoads((prev) => ({ ...prev, [userId]: false }));
      }
    },
    [user, toggleUserFollow, router],
  );

  const handleViewProfile = useCallback(
    (userId: string) => {
      onClose();
      router.push(`/profile/${userId}`);
    },
    [router, onClose],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={likeCount === 1 ? "1 Like" : `${likeCount} Likes`}
      size="sm"
      padding="none"
    >
      {likes.length === 0 && !isLoading ? (
        <div className="flex h-32 items-center justify-center text-muted-foreground">
          No likes yet
        </div>
      ) : (
        <div>
          {likes.map((like) => (
            <div
              key={like._id}
              className="flex items-center justify-between border-b border-border px-1 py-3 transition-colors duration-200 last:border-b-0 hover:bg-secondary/60"
            >
              <div
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                onClick={() => handleViewProfile(like._id)}
              >
                <Avatar src={like.profilePic?.url || like.avatar} alt={like.username} size="md" />
                <div className="min-w-0">
                  <p className="inline-flex max-w-full items-center gap-1 text-sm font-semibold text-foreground">
                    <span className="truncate">{like.username}</span>
                    <VerifiedBadge role={like.role} size={12} />
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{like.username.toLowerCase().replace(/\s+/g, "_")}
                  </p>
                </div>
              </div>

              {user?._id !== like._id && (
                <button
                  onClick={() =>
                    handleFollow(like._id, followingStates[like._id] || false)
                  }
                  disabled={followingLoads[like._id]}
                  className={cn(
                    "ml-3 shrink-0 rounded-lg border px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer",
                    followingStates[like._id] || false
                      ? "border-border bg-secondary text-foreground hover:bg-secondary-hover"
                      : "border-primary bg-primary text-primary-foreground shadow-soft-sm hover:bg-primary-hover",
                    followingLoads[like._id] && "cursor-not-allowed opacity-60",
                  )}
                >
                  {followingLoads[like._id]
                    ? "..."
                    : followingStates[like._id]
                      ? "Following"
                      : "Follow"}
                </button>
              )}
            </div>
          ))}

          {/* Loading indicator or end of list */}
          <div ref={observerTarget} className="p-4 text-center">
            {isLoading && (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            )}
            {!isLoading && currentPage >= totalPages && likes.length > 0 && (
              <p className="text-xs text-muted-foreground">End of likes</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
