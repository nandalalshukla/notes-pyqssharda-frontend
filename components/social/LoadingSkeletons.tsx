"use client";

/**
 * Loading Skeleton Components for Social Feed
 * Provides visual feedback during data loading
 */

export function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full border-2 border-gray-300" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-24 mb-2" />
          <div className="h-3 bg-gray-300 rounded w-32" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-gray-300 rounded" />
        <div className="h-4 bg-gray-300 rounded w-5/6" />
        <div className="h-24 bg-gray-300 rounded" />
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-4 py-3 border-y-2 border-gray-300">
        <div className="h-4 bg-gray-300 rounded w-16" />
        <div className="h-4 bg-gray-300 rounded w-20" />
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-2">
        <div className="flex-1 h-10 bg-gray-300 rounded-lg" />
        <div className="flex-1 h-10 bg-gray-300 rounded-lg" />
        <div className="flex-1 h-10 bg-gray-300 rounded-lg" />
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-gray-300 flex-shrink-0" />
      <div className="flex-1 bg-white border-2 border-gray-300 rounded-xl p-3">
        <div className="h-3 bg-gray-300 rounded w-24 mb-2" />
        <div className="h-12 bg-gray-300 rounded" />
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gray-300 rounded-full border-2 border-gray-300" />
        <div className="flex-1">
          <div className="h-3 bg-gray-300 rounded w-20 mb-2" />
          <div className="h-2 bg-gray-300 rounded w-24" />
        </div>
      </div>
      <div className="h-10 bg-gray-300 rounded-lg" />
    </div>
  );
}

export function FeedLoadingState() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
