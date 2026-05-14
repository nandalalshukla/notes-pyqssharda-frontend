"use client";

import React, { useState, useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { User } from "@/lib/api/social/social.api";
import { FiUserPlus, FiUserCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  }, [
    user._id,
    isFollowingCurrent,
    isAuthenticated,
    toggleUserFollow,
    router,
  ]);

  const avatarUrl = user.profilePic?.url || user.avatar || "";

  return (
    <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
      <div className="flex items-center gap-3 mb-3">
        <Link
          href={`/profile/${user._id}`}
          className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={user.username || "User"}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-lg">
              {(user.username || "U")[0].toUpperCase()}
            </span>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${user._id}`}
            className="block font-bold text-sm truncate hover:text-blue-600"
          >
            {user.username || "Anonymous"}
          </Link>
          <p className="text-xs text-gray-500 truncate">
            {user.email || "No email"}
          </p>
        </div>
      </div>

      {!isCurrentUser && (
        <button
          onClick={handleToggleFollow}
          disabled={isLoading}
          className={`w-full py-2 px-3 rounded-lg font-bold border-2 border-black transition-all flex items-center justify-center gap-2 text-sm ${
            isFollowingCurrent
              ? "bg-white text-black hover:bg-gray-100"
              : "bg-black text-white hover:bg-white hover:text-black hover:border-black"
          } disabled:opacity-50`}
        >
          {isFollowingCurrent ? (
            <>
              <FiUserCheck size={16} />
              Following
            </>
          ) : (
            <>
              <FiUserPlus size={16} />
              Follow
            </>
          )}
        </button>
      )}
    </div>
  );
}
