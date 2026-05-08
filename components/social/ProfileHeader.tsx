"use client";

import React from "react";
import { UserProfile } from "@/lib/api/social/social.api";
import Image from "next/image";
import {
  FiMail,
  FiPhone,
  FiUserCheck,
  FiUserPlus,
  FiBook,
} from "react-icons/fi";

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
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
          {/* Profile Picture */}
          <div className="shrink-0">
            <div className="w-32 h-32 rounded-xl shadow-md overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100 border border-slate-200 flex items-center justify-center">
              {profile.profilePic?.url ? (
                <Image
                  src={profile.profilePic.url}
                  alt={profile.username}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-blue-600">
                  {(profile.username || "U")[0].toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-1">
                  {profile.name}
                </h1>
                <p className="text-lg text-slate-500">@{profile.username}</p>
              </div>

              {!profile.isOwnProfile && (
                <button
                  onClick={onFollowToggle}
                  disabled={isFollowLoading}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap shadow-sm ${
                    profile.isFollowedByCurrentUser
                      ? "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
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

            {/* Bio */}
            {profile.bio && (
              <p className="text-slate-700 leading-relaxed mb-6 max-w-2xl">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-8 mb-8 py-6 border-y border-slate-200">
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {profile.stats.postsCount}
                </p>
                <p className="text-sm text-slate-500 mt-1">Posts</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {profile.stats.followersCount}
                </p>
                <p className="text-sm text-slate-500 mt-1">Followers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {profile.stats.followingCount}
                </p>
                <p className="text-sm text-slate-500 mt-1">Following</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.course && (
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="flex-shrink-0 w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FiBook size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{profile.course}</span>
                </div>
              )}
              {profile.email && (
                <div className="flex items-center gap-3 text-slate-700">
                  <FiMail size={18} className="flex-shrink-0 text-slate-400" />
                  <span className="text-sm font-medium break-all">
                    {profile.email}
                  </span>
                </div>
              )}
              {profile.contactNo && (
                <div className="flex items-center gap-3 text-slate-700">
                  <FiPhone size={18} className="flex-shrink-0 text-slate-400" />
                  <span className="text-sm font-medium">
                    {profile.contactNo}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
