"use client";

import { SearchResult } from "@/lib/api/search.api";
import { Badge, EmptyState, type BadgeVariant } from "@/components/ui";
import { ArrowRightIcon } from "./icons";

function getResourceTypeLabel(result: SearchResult): string {
  if (result.noteType) return "Note";
  if (result.pyqType) return "PYQ";
  if (result.syllabusType) return "Syllabus";
  return "Resource";
}

function getResourceTypeBadgeVariant(result: SearchResult): BadgeVariant {
  if (result.noteType) return "mint";
  if (result.pyqType) return "coral";
  if (result.syllabusType) return "purple";
  return "default";
}

export interface ExploreResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  onClearFilters: () => void;
  onRetry: () => void;
}

export function ExploreResults({
  results,
  isLoading,
  error,
  onClearFilters,
  onRetry,
}: ExploreResultsProps) {
  return (
    <div className="relative mx-auto mb-20 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black">
          Search Results
          {results.length > 0 && (
            <span className="ml-2 text-primary">({results.length} found)</span>
          )}
        </h2>
        <button
          onClick={onClearFilters}
          className="cursor-pointer rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          Clear Search
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="font-semibold text-muted-foreground">
            Searching resources...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className="font-semibold text-destructive">{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 cursor-pointer rounded-full bg-destructive px-4 py-2 font-semibold text-destructive-foreground transition-colors hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<span className="text-4xl">🔍</span>}
          title="No results found"
          description="Try adjusting your search query or filters"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => (
            <div
              key={result._id}
              className="cursor-pointer rounded-xl border border-border bg-card p-6 shadow-soft-sm transition-all hover:-translate-y-1 hover:shadow-soft-md"
            >
              {/* Resource Type Badge */}
              <div className="mb-3 flex items-start justify-between">
                <Badge variant={getResourceTypeBadgeVariant(result)}>
                  {getResourceTypeLabel(result)}
                </Badge>
              </div>

              {/* Title */}
              <h3 className="mb-3 line-clamp-2 text-lg font-bold">
                {result.title}
              </h3>

              {/* Details */}
              <div className="mb-4 space-y-2">
                {result.program && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-muted-foreground">
                      Program:
                    </span>
                    <span className="text-foreground">{result.program}</span>
                  </div>
                )}
                {result.courseCode && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-muted-foreground">
                      Code:
                    </span>
                    <span className="font-mono text-foreground">
                      {result.courseCode}
                    </span>
                  </div>
                )}
                {result.courseName && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-muted-foreground">
                      Course:
                    </span>
                    <span className="line-clamp-1 text-foreground">
                      {result.courseName}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  {result.year && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {result.year}
                    </span>
                  )}
                  {result.semester && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {result.semester}
                    </span>
                  )}
                </div>
              </div>

              {/* Uploaded By */}
              {result.userId && typeof result.userId === "object" && (
                <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                  by{" "}
                  <span className="font-semibold text-foreground">
                    {result.userId.username}
                  </span>
                </div>
              )}

              {/* View Button */}
              <button className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover">
                View Details
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
