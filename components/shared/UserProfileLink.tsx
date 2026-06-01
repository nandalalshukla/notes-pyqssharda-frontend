"use client";

import React from "react";
import Link from "next/link";
import { User } from "lucide-react";

export interface UserProfileLinkProps {
  userId?: string;
  username?: string;
  profilePic?: { url?: string } | null;
  showAvatar?: boolean;
  className?: string;
  linkClassName?: string;
}

/**
 * UserProfileLink Component
 * Renders a clickable user profile link with optional avatar
 * Used in reports and other user references to navigate to profiles
 */
export const UserProfileLink: React.FC<UserProfileLinkProps> = ({
  userId,
  username = "Unknown User",
  profilePic,
  showAvatar = true,
  className = "",
  linkClassName = "text-blue-600 hover:text-blue-700 hover:underline font-medium",
}) => {
  if (!userId) {
    return <span className={className}>{username}</span>;
  }

  return (
    <Link
      href={`/profile/${userId}`}
      className={`inline-flex items-center gap-2 transition-colors ${linkClassName} ${className}`}
    >
      {showAvatar && (
        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
          {profilePic?.url ? (
            <img
              src={profilePic.url}
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={14} className="text-slate-600" />
            </div>
          )}
        </div>
      )}
      <span>{username}</span>
    </Link>
  );
};

export default UserProfileLink;
