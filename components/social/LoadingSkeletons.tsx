"use client";

import { Skeleton } from "@/components/ui";

export function PostCardSkeleton() {
  return (
    <div className="rounded-2xl p-4 sm:p-5">
      <div className="mb-3 space-y-3">
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      <div className="mb-4 overflow-hidden rounded-xl">
        <Skeleton className="h-36 w-full" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>

      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-md" />
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
    <div
      aria-live="polite"
      aria-busy="true"
      className="min-h-[60vh] space-y-1 pt-2"
    >
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
