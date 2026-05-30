import React from "react";

interface LoadingSkeletonProps {
  rows?: number;
}

export default function LoadingSkeleton({ rows = 6 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-10 w-full animate-pulse rounded-xl bg-slate-100"
        />
      ))}
    </div>
  );
}
