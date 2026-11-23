"use client";

import Link from "next/link";
import React from "react";

export interface MentionReference {
  userId: string;
  username: string;
  usernameSnapshot?: string;
}

interface MentionTextProps {
  text: string;
  mentions?: MentionReference[];
  className?: string;
}

export default function MentionText({
  text,
  mentions = [],
  className,
}: MentionTextProps) {
  const byUsername = new Map<string, MentionReference>();
  mentions.forEach((mention) => {
    byUsername.set(mention.username.toLowerCase(), mention);
    if (mention.usernameSnapshot) {
      byUsername.set(mention.usernameSnapshot.toLowerCase(), mention);
    }
  });

  const parts = text.split(/(@[a-zA-Z0-9._]+)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part.startsWith("@")) return <React.Fragment key={index}>{part}</React.Fragment>;
        const username = part.slice(1).toLowerCase();
        const mention = byUsername.get(username);
        if (!mention) return <React.Fragment key={index}>{part}</React.Fragment>;
        return (
          <Link
            key={`${mention.userId}-${index}`}
            href={`/profile/${mention.userId}`}
            className="font-semibold text-primary hover:text-primary-hover hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            @{mention.username}
          </Link>
        );
      })}
    </span>
  );
}
