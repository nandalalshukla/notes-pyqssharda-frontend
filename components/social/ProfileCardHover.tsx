"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getUserProfile, UserProfile, toggleFollow } from "@/lib/api/social/social.api";
import useAuthStore from "@/stores/user/authStore";
import { FiUserPlus, FiUserMinus, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";

interface ProfileCardHoverProps {
  userId: string;
  onClose?: () => void;
  onMouseEnter?: () => void;
}

const ProfileCardHover = ({ userId, onClose, onMouseEnter }: ProfileCardHoverProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await getUserProfile(userId);
        if (response.data?.profile) {
          const profileData = response.data.profile;
          setProfile(profileData);
          setIsFollowing(profileData.isFollowedByCurrentUser || false);
        }
      } catch (err: unknown) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleFollowToggle = useCallback(async () => {
    if (!currentUser) {
      toast.error("Please login to follow users");
      return;
    }

    if (profile?.isOwnProfile) {
      return;
    }

    setIsFollowLoading(true);
    try {
      await toggleFollow(userId);
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "User unfollowed" : "User followed!");
    } catch (error) {
      console.error("Failed to update follow status:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
    }
  }, [userId, currentUser, profile?.isOwnProfile, isFollowing]);

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 250);
  };

  const handleMouseEnterLocal = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    onMouseEnter?.();
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnterLocal}
      onMouseLeave={handleMouseLeave}
      className="w-72 rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-300/40 animate-in fade-in zoom-in-95 duration-150 overflow-hidden pointer-events-auto"
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <FiLoader className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : profile ? (
        <div className="px-4 py-5">
          {/* Profile Header: Picture + Follow Button */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <Link
              href={`/profile/${profile._id}`}
              onClick={() => onClose?.()}
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {profile.profilePic?.url ? (
                  <Image
                    src={profile.profilePic.url}
                    alt={profile.username}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                    {profile.username[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            </Link>

            {/* Follow Button */}
            {!profile.isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  isFollowing
                    ? "border border-gray-300 text-gray-900 hover:bg-gray-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } ${isFollowLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isFollowLoading ? (
                  <FiLoader className="h-3 w-3 animate-spin inline" />
                ) : isFollowing ? (
                  "Following"
                ) : (
                  "Follow"
                )}
              </button>
            )}
          </div>

          {/* User Name */}
          <Link
            href={`/profile/${profile._id}`}
            onClick={() => onClose?.()}
            className="group block mb-0.5"
          >
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {profile.name}
            </h3>
          </Link>

          {/* Username */}
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">@{profile.username}</p>

          {/* Bio */}
          {profile.bio && (
            <p className="text-xs text-gray-700 leading-relaxed line-clamp-2 mb-3">
              {profile.bio}
            </p>
          )}

          {/* Followers Count */}
          <div className="text-xs text-gray-600 mb-3">
            <span className="font-bold text-gray-900">{profile.stats.followersCount}</span>{" "}
            followers
          </div>

          {/* View Profile Link */}
          <Link
            href={`/profile/${profile._id}`}
            onClick={() => onClose?.()}
            className="block w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            View Profile
          </Link>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileCardHover;
