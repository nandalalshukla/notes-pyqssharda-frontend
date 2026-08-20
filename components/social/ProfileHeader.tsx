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
import VerifiedBadge from "./VerifiedBadge";
import { Button } from "@/components/ui";

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
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
          {/* Profile Picture */}
          <div className="shrink-0">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent-purple/10 shadow-soft-md">
              {profile.profilePic?.url ? (
                <Image
                  src={profile.profilePic.url}
                  alt={profile.username}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-primary">
                  {(profile.username || "U")[0].toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h1 className="text-4xl font-bold text-foreground">{profile.name}</h1>
                  <VerifiedBadge role={profile.role} size={18} />
                </div>
                <p className="text-lg text-muted-foreground">@{profile.username}</p>
              </div>

              {!profile.isOwnProfile && (
                <Button
                  onClick={onFollowToggle}
                  loading={isFollowLoading}
                  variant={profile.isFollowedByCurrentUser ? "outline" : "primary"}
                  icon={
                    profile.isFollowedByCurrentUser ? (
                      <FiUserCheck size={18} />
                    ) : (
                      <FiUserPlus size={18} />
                    )
                  }
                  className="whitespace-nowrap"
                >
                  {profile.isFollowedByCurrentUser ? "Following" : "Follow"}
                </Button>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mb-6 max-w-2xl leading-relaxed text-foreground">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="mb-8 flex gap-8 border-y border-border py-6">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {profile.stats.postsCount}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {profile.stats.followersCount}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {profile.stats.followingCount}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Following</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profile.course && (
                <div className="flex items-center gap-3 text-foreground">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                    <FiBook size={16} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium">{profile.course}</span>
                </div>
              )}
              {profile.email && (
                <div className="flex items-center gap-3 text-foreground">
                  <FiMail size={18} className="shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium break-all">{profile.email}</span>
                </div>
              )}
              {profile.contactNo && (
                <div className="flex items-center gap-3 text-foreground">
                  <FiPhone size={18} className="shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium">{profile.contactNo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
