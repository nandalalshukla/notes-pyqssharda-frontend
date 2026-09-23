"use client";

import { Skeleton } from "@/components/ui";

export function PostCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-secondary/20 p-5 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full bg-gradient-to-br from-muted/80 via-muted to-muted/60" />
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Skeleton className="h-4 w-28 bg-gradient-to-r from-muted/80 via-muted to-muted/60" />
            <Skeleton className="h-5 w-16 rounded-full bg-gradient-to-r from-muted/80 via-muted to-muted/60" />
          </div>
          <Skeleton className="h-3 w-32 bg-gradient-to-r from-muted/80 via-muted to-muted/60" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full bg-gradient-to-r from-muted/80 via-muted to-muted/60" />
      </div>

      <div className="mb-5 space-y-3">
        <Skeleton className="h-4 w-5/6 bg-gradient-to-r from-muted/80 via-muted to-muted/60" />
        <Skeleton className="h-4 w-4/6 bg-gradient-to-r from-muted/80 via-muted to-muted/60" />
        <Skeleton className="h-4 w-2/5 bg-gradient-to-r from-muted/80 via-muted to-muted/60" />

        <div className="overflow-hidden rounded-2xl border border-border/70 bg-secondary/40 shadow-inner">
          <Skeleton className="h-32 w-full bg-gradient-to-br from-muted/70 via-muted/50 to-muted/80" />
        </div>
      </div>

      <div className="mb-4 flex gap-4 border-y border-border/70 py-3">
        <Skeleton className="h-4 w-16 bg-gradient-to-r from-muted/80 via-muted to-muted/60" />
        <Skeleton className="h-4 w-20 bg-gradient-to-r from-muted/80 via-muted to-muted/60" />
        <Skeleton className="ml-auto h-4 w-14 bg-gradient-to-r from-muted/80 via-muted to-muted/60" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl bg-gradient-to-r from-muted/80 via-muted to-muted/60" />
        <Skeleton className="h-10 flex-1 rounded-xl bg-gradient-to-r from-muted/80 via-muted to-muted/60" />
        <Skeleton className="h-10 flex-1 rounded-xl bg-gradient-to-r from-muted/80 via-muted to-muted/60" />
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 rounded-xl border border-border bg-card p-3">
        <Skeleton className="mb-2 h-3 w-24" />
        <Skeleton className="h-12" />
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft-sm">
      <div className="mb-3 flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="h-2 w-24" />
        </div>
      </div>
      <Skeleton className="h-10" />
    </div>
  );
}

export function FeedLoadingState() {
  return (
    <div aria-live="polite" aria-busy="true" className="min-h-[60vh] space-y-6 pt-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-fade-in [animation-delay:0.04s]">
          <PostCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
          <Skeleton className="h-32 w-32 rounded-2xl" />
          <div className="w-full min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="w-full">
                <Skeleton className="mb-3 h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>

            <Skeleton className="mb-6 h-4 w-2/3" />

            <div className="mb-8 flex gap-8 border-y border-border py-6">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="mb-2 h-6 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfilePageLoadingState() {
  return (
    <div className="min-h-screen bg-background">
      <ProfileHeaderSkeleton />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="mb-6 h-7 w-28" />
          <FeedLoadingState />
        </div>
      </div>
    </div>
  );
}
