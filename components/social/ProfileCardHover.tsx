"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getUserProfile, UserProfile, toggleFollow } from "@/lib/api/social/social.api";
import useAuthStore from "@/stores/user/authStore";
import { FiUserPlus, FiUserMinus, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";

interface ProfileCardProps {
  userId: string;
  position?: "top" | "bottom";
  onClose?: () => void;
  onMouseEnter?: () => void;
}

const ProfileCardHover = ({ userId, onClose, onMouseEnter }: ProfileCardProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        setError("Failed to load profile");
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
    }, 300);
  };

  const handleMouseEnterLocal = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    onMouseEnter?.();
  };

  if (error) {
    return (
      <div className="w-80 rounded-lg border border-gray-200 bg-white p-4 text-center shadow-md">
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnterLocal}
      onMouseLeave={handleMouseLeave}
      className="w-80 rounded-lg border border-gray-200 bg-white shadow-lg shadow-gray-200/60 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
    >
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <FiLoader className="h-6 w-6 animate-spin text-gray-400" />
            <p className="text-xs text-gray-500">Loading profile...</p>
          </div>
        </div>
      ) : profile ? (
        <>
          {/* Subtle Header Background */}
          <div className="h-20 bg-gradient-to-r from-gray-50 via-blue-50 to-gray-50 border-b border-gray-100" />

          {/* Profile Content */}
          <div className="relative px-5 pb-5">
            {/* Profile Picture Section */}
            <div className="mb-4 flex items-end justify-between -mt-10 relative z-10">
              <div className="flex-shrink-0">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  {profile.profilePic?.url ? (
                    <Image
                      src={profile.profilePic.url}
                      alt={profile.username}
                      width={96}
                      height={96}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white">
                      {profile.username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Follow Button */}
              {!profile.isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                    isFollowing
                      ? "border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                      : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                  } ${isFollowLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {isFollowLoading ? (
                    <FiLoader className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <FiUserMinus className="h-4 w-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="h-4 w-4" />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>

            {/* User Information */}
            <div className="mb-4">
              <Link
                href={`/profile/${profile._id}`}
                className="group mb-1 inline-block"
                onClick={() => onClose?.()}
              >
                <h3 className="text-base font-bold text-gray-950 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {profile.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 mb-2">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Course Info */}
            {profile.course && (
              <div className="mb-4 text-sm">
                <span className="text-gray-600">{profile.course}</span>
              </div>
            )}

            {/* Stats Grid */}
            <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-3">
              <div className="text-center">
                <p className="text-base font-bold text-gray-950">
                  {profile.stats.postsCount}
                </p>
                <p className="text-xs font-medium text-gray-600">Posts</p>
              </div>
              <div className="text-center border-l border-r border-gray-200">
                <p className="text-base font-bold text-gray-950">
                  {profile.stats.followersCount}
                </p>
                <p className="text-xs font-medium text-gray-600">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-gray-950">
                  {profile.stats.followingCount}
                </p>
                <p className="text-xs font-medium text-gray-600">Following</p>
              </div>
            </div>

            {/* View Profile Button */}
            <Link
              href={`/profile/${profile._id}`}
              onClick={() => onClose?.()}
              className="block w-full rounded-lg bg-gray-900 py-2.5 text-center text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 active:scale-95"
            >
              View Full Profile
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ProfileCardHover;
