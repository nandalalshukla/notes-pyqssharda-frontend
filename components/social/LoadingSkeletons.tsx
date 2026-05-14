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

export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 animate-pulse">
          <div className="w-32 h-32 rounded-xl bg-slate-200" />
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="w-full">
                <div className="h-8 bg-slate-200 rounded w-48 mb-3" />
                <div className="h-4 bg-slate-200 rounded w-32" />
              </div>
              <div className="h-10 w-28 bg-slate-200 rounded-lg" />
            </div>

            <div className="h-4 bg-slate-200 rounded w-2/3 mb-6" />

            <div className="flex gap-8 mb-8 py-6 border-y border-slate-200">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-6 bg-slate-200 rounded w-12 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-16" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-slate-200 rounded w-full" />
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
    <div className="min-h-screen bg-gray-50">
      <ProfileHeaderSkeleton />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="h-7 bg-slate-200 rounded w-28 mb-6 animate-pulse" />
          <FeedLoadingState />
        </div>
      </div>
    </div>
  );
}
