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

function isShardaSocialUrl(rawUrl: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl, "https://sharda.social");
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (hostname !== "sharda.social") return null;

  return parsed.origin === "https://sharda.social" ||
    parsed.origin === "http://sharda.social" ||
    parsed.origin === "https://www.sharda.social" ||
    parsed.origin === "http://www.sharda.social"
    ? parsed.toString()
    : null;
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

  const parts = text.split(/(@[a-zA-Z0-9._]+|https?:\/\/[^\s<]+)/gi);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (/^https?:\/\//i.test(part)) {
          const internalUrl = isShardaSocialUrl(part);
          if (internalUrl) {
            return (
              <a
                key={`link-${index}`}
                href={internalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:text-primary-hover hover:underline"
                onClick={(event) => event.stopPropagation()}
              >
                {part}
              </a>
            );
          }
        }
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
