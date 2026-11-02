"use client";

import { useSearchParams } from "next/navigation";
import PostPermalinkModal from "./PostPermalinkModal";

/**
 * Links copied before posts had their own URL look like `/?postId=<id>` and
 * used to open nothing. Anyone holding one now gets the post in a modal.
 */
export default function LegacyPostLink() {
  const postId = useSearchParams().get("postId");
  if (!postId) return null;
  return <PostPermalinkModal key={postId} postId={postId} closeHref="/" />;
}
