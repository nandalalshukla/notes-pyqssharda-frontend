"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { CheckCircle, Megaphone } from "lucide-react";
import { SectionCard, Toolbar } from "@/components/dashboards/SectionCard";
import { Avatar, Badge, Button, EmptyState, Input, Skeleton } from "@/components/ui";
import { resolvePostTypeMeta } from "@/components/social/postMeta";
import type { PendingPost } from "@/lib/api/mod/mod.api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const RejectionModal = dynamic(
  () => import("@/components/modals/RejectionModal"),
);

interface PendingPostsPanelProps {
  posts: PendingPost[];
  isLoading: boolean;
  pendingActions: Record<string, "approve" | "reject">;
  approvePost: (postId: string) => Promise<void>;
  rejectPost: (postId: string, reason: string) => Promise<void>;
}

interface RejectionModalState {
  isOpen: boolean;
  postId: string;
  postTitle: string;
}

const formatSubmitted = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

/**
 * The queue itself.
 *
 * Rendered as full cards rather than the DataTable the other panels use:
 * a reviewer is deciding whether a piece of writing should go out to the
 * whole campus, and that decision needs the actual body text and images in
 * front of them — a truncated title cell would mean approving things
 * unread.
 */
export default function PendingPostsPanel({
  posts,
  isLoading,
  pendingActions,
  approvePost,
  rejectPost,
}: PendingPostsPanelProps) {
  const [search, setSearch] = useState("");
  // The table below re-filters and re-renders every row on each
  // change; with a few thousand rows loaded that is enough work per
  // keystroke to make typing feel sticky. The input stays bound to
  // `search` so it still updates instantly.
  const debouncedSearch = useDebouncedValue(search, 250);
  const [rejectionModal, setRejectionModal] = useState<RejectionModalState>({
    isOpen: false,
    postId: "",
    postTitle: "",
  });

  const filteredPosts = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    if (!needle) return posts;

    return posts.filter(
      (post) =>
        post.content?.toLowerCase().includes(needle) ||
        post.author?.username?.toLowerCase().includes(needle) ||
        post.type?.toLowerCase().includes(needle),
    );
  }, [posts, debouncedSearch]);

  const handleApprove = async (postId: string) => {
    try {
      await approvePost(postId);
      toast.success("Post approved and published");
    } catch {
      toast.error("Failed to approve post");
    }
  };

  const handleConfirmReject = async (reason: string) => {
    try {
      await rejectPost(rejectionModal.postId, reason);
      toast.success("Post rejected");
      setRejectionModal((prev) => ({ ...prev, isOpen: false }));
    } catch {
      toast.error("Failed to reject post");
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <Toolbar
        title="Pending Posts"
        description={`${filteredPosts.length} event${
          filteredPosts.length === 1 ? "" : "s"
        } and announcements awaiting review`}
      >
        <Input
          type="text"
          placeholder="Search by content, author or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </Toolbar>

      <SectionCard
        title="Review Queue"
        description="Members' events and announcements stay hidden from the feed until approved."
        icon={<Megaphone size={20} />}
      >
        {isLoading && posts.length === 0 ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            icon={<CheckCircle size={32} />}
            title={search ? "No matching posts" : "Nothing waiting for review"}
            description={
              search
                ? "Try a different search term."
                : "Members' events and announcements will show up here."
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const typeMeta = resolvePostTypeMeta(post.type);
              const TypeIcon = typeMeta.Icon;
              const isBusy = Boolean(pendingActions[post._id]);

              return (
                <article
                  key={post._id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <header className="mb-3 flex flex-wrap items-center gap-3">
                    <Avatar
                      src={post.author?.profilePic?.url || post.author?.avatar}
                      alt={post.author?.username || "User"}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {post.author?.username || "Unknown user"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {formatSubmitted(post.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={typeMeta.badgeVariant}
                      icon={<TypeIcon size={13} />}
                    >
                      {typeMeta.label}
                    </Badge>
                    {post.isAnonymous && (
                      // The reviewer still sees the real author above —
                      // this only flags that the byline will be hidden from
                      // other students once it's live.
                      <Badge variant="outline">Anonymous to students</Badge>
                    )}
                  </header>

                  <p className="mb-3 text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground">
                    {post.content}
                  </p>

                  {post.files && post.files.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {post.files.map((file, idx) =>
                        file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <a
                            key={file}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative h-24 w-24 overflow-hidden rounded-lg border border-border"
                          >
                            <Image
                              src={file}
                              alt={`Attachment ${idx + 1}`}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          </a>
                        ) : (
                          <a
                            key={file}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-24 w-24 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold text-muted-foreground hover:bg-secondary"
                          >
                            Open file
                          </a>
                        ),
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<CheckCircle size={14} />}
                      onClick={() => handleApprove(post._id)}
                      disabled={isBusy}
                    >
                      Approve &amp; Publish
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        setRejectionModal({
                          isOpen: true,
                          postId: post._id,
                          postTitle:
                            post.content?.slice(0, 60) || typeMeta.label,
                        })
                      }
                      disabled={isBusy}
                    >
                      Reject
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>

      <RejectionModal
        isOpen={rejectionModal.isOpen}
        itemTitle={rejectionModal.postTitle}
        itemType="post"
        onClose={() => setRejectionModal((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleConfirmReject}
      />
    </div>
  );
}
