"use client";

import React from "react";
import { FiClock, FiXCircle } from "react-icons/fi";
import type { PostModerationStatus } from "@/lib/api/social/social.api";

interface PostModerationBannerProps {
  status: PostModerationStatus;
  rejectionReason?: string | null;
  /** Singular label for the post's type, e.g. "Announcement". */
  typeLabel: string;
}

/**
 * Explains, on the author's own card, why a post they can see isn't in
 * anyone else's feed.
 *
 * Only the author ever receives an unapproved post from the API, so this
 * needs no viewer check of its own — if the status isn't "approved", the
 * person reading it wrote it.
 */
export default function PostModerationBanner({
  status,
  rejectionReason,
  typeLabel,
}: PostModerationBannerProps) {
  if (status === "approved") return null;

  const isRejected = status === "rejected";

  return (
    <div
      className={`mx-5 mt-4 rounded-xl border p-4 ${
        isRejected
          ? "border-destructive/30 bg-destructive/5"
          : "border-warning/30 bg-warning/10"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 shrink-0 ${
            isRejected ? "text-destructive" : "text-warning"
          }`}
        >
          {isRejected ? <FiXCircle size={16} /> : <FiClock size={16} />}
        </span>
        <div className="min-w-0">
          <p
            className={`text-sm font-semibold ${
              isRejected ? "text-destructive" : "text-warning"
            }`}
          >
            {isRejected
              ? `${typeLabel} not approved`
              : `${typeLabel} awaiting approval`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isRejected
              ? "Only you can see this. Edit it to send it back for review."
              : "Only you can see this until a moderator approves it."}
          </p>
          {isRejected && rejectionReason && (
            <p className="mt-2 rounded-lg bg-card px-3 py-2 text-xs break-words text-foreground">
              <span className="font-semibold">Reason: </span>
              {rejectionReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
