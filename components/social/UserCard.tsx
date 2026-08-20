"use client";

import React, { useState, useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { User } from "@/lib/api/social/social.api";
import { FiUserPlus, FiUserCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VerifiedBadge from "./VerifiedBadge";
import { Avatar, Button } from "@/components/ui";

interface UserCardProps {
  user: User;
  isFollowing?: boolean;
}

export default function UserCard({
  user,
  isFollowing: initialFollowing = false,
}: UserCardProps) {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const { toggleUserFollow, followStats } = useSocialStore();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const isCurrentUser = currentUser?._id === user._id;
  const isFollowingCurrent =
    followStats.get(user._id)?.isFollowedByCurrentUser ??
    user.isFollowedByCurrentUser ??
    isFollowing;

  const handleToggleFollow = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to follow");
      router.push("/auth/login");
      return;
    }

    setIsLoading(true);
    try {
      await toggleUserFollow(user._id, isFollowingCurrent);
      setIsFollowing(!isFollowingCurrent);
      toast.success(isFollowingCurrent ? "Unfollowed" : "Followed");
    } catch {
      toast.error("Failed to follow user");
    } finally {
      setIsLoading(false);
    }
  }, [user._id, isFollowingCurrent, isAuthenticated, toggleUserFollow, router]);

  const avatarUrl = user.profilePic?.url || user.avatar || "";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft-sm transition-shadow hover:shadow-soft-md">
      <div className="mb-3 flex items-center gap-3">
        <Link href={`/profile/${user._id}`} className="shrink-0">
          <Avatar src={avatarUrl} alt={user.username || "User"} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${user._id}`}
            className="inline-flex items-center gap-1 truncate text-sm font-bold text-foreground hover:text-primary"
          >
            {user.username || "Anonymous"}
            <VerifiedBadge role={user.role} size={12} />
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {user.email || "No email"}
          </p>
        </div>
      </div>

      {!isCurrentUser && (
        <Button
          onClick={handleToggleFollow}
          loading={isLoading}
          variant={isFollowingCurrent ? "outline" : "primary"}
          size="sm"
          icon={isFollowingCurrent ? <FiUserCheck size={16} /> : <FiUserPlus size={16} />}
          className="w-full"
        >
          {isFollowingCurrent ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}
