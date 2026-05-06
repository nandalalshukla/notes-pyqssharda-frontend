"use client";

import React from "react";
import { UserProfile } from "@/lib/api/social/social.api";
import Image from "next/image";
import { FiMail, FiPhone, FiUserCheck, FiUserPlus } from "react-icons/fi";

interface ProfileHeaderProps {
  profile: UserProfile;
  onFollowToggle: () => void;
  isFollowLoading: boolean;
}

export default function ProfileHeader({
  profile,
  onFollowToggle,
  isFollowLoading,
}: ProfileHeaderProps) {
  return (
    <>
      <div className="h-48 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden" />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 pb-8">
            <div className="shrink-0">
              <div className="w-32 h-32 bg-linear-to-br from-blue-400 to-purple-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {profile.profilePic?.url ? (
                  <Image
                    src={profile.profilePic.url}
                    alt={profile.username}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl text-white font-bold">
                    {(profile.username || "U")[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile.name}
                  </h1>
                  <p className="text-lg text-gray-500 mt-1">
                    @{profile.username}
                  </p>
                </div>

                {!profile.isOwnProfile && (
                  <button
                    onClick={onFollowToggle}
                    disabled={isFollowLoading}
                    className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 ${
                      profile.isFollowedByCurrentUser
                        ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    } disabled:opacity-50`}
                  >
                    {profile.isFollowedByCurrentUser ? (
                      <>
                        <FiUserCheck size={18} />
                        Following
                      </>
                    ) : (
                      <>
                        <FiUserPlus size={18} />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-6 py-4 border-y border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.stats.postsCount}
                  </p>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.stats.followersCount}
                  </p>
                  <p className="text-sm text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.stats.followingCount}
                  </p>
                  <p className="text-sm text-gray-500">Following</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-8">
            {profile.bio && (
              <p className="text-gray-700 mb-4 leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {profile.course && (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600">C</span>
                  </div>
                  <span>{profile.course}</span>
                </div>
              )}
              {profile.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FiMail size={18} className="shrink-0 text-blue-500" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.contactNo && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FiPhone size={18} className="shrink-0 text-blue-500" />
                  <span>{profile.contactNo}</span>
                </div>
              )}
              {profile.stats.contributions > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-green-600">OK</span>
                  </div>
                  <span>{profile.stats.contributions} contributions</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
