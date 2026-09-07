"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiSearch, FiFileText, FiExternalLink, FiX } from "react-icons/fi";
import {
  browsePyqs,
  getPyqFilterOptions,
  type Pyq,
  type PyqFilterOptions,
  type PyqPagination,
} from "@/lib/api/pyqs/pyqs.api";
import { getErrorMessage } from "@/lib/utils/errorHandler";
import { Badge, Button, EmptyState, Input, Select, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

/**
 * The database-backed PYQ browser.
 *
 * This page used to render a hand-maintained array of B.Tech CS papers
 * imported from local files. It now reads the collection the API actually
 * holds — thousands of papers across every school — which is why filtering
 * and paging happen on the server rather than in the browser.
 */

const PAGE_SIZE = 24;

interface Filters {
  query: string;
  program: string;
  school: string;
  semester: string;
  year: string;
  courseCode: string;
}

const EMPTY_FILTERS: Filters = {
  query: "",
  program: "",
  school: "",
  semester: "",
  year: "",
  courseCode: "",
};

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </label>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

function PyqCard({ pyq }: { pyq: Pyq }) {
  return (
    <div className="lift-on-hover flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-soft-sm hover:shadow-soft-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge variant="coral">{pyq.program}</Badge>
        <span className="shrink-0 text-xs font-bold text-muted-foreground">
          Sem {pyq.semester}
        </span>
      </div>

      <h3 className="mb-1 line-clamp-2 text-base leading-snug font-bold text-foreground">
        {pyq.courseName || pyq.title}
      </h3>
      <p className="mb-3 text-sm font-semibold text-muted-foreground">
        {pyq.courseCode}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Badge variant="outline">{pyq.year}</Badge>
        {pyq.school && (
          <Badge variant="outline" className="max-w-full">
            <span className="truncate">{pyq.school}</span>
          </Badge>
        )}
      </div>

      <a
        href={pyq.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        <FiExternalLink size={16} />
        View Paper
      </a>
    </div>
  );
}

export default function PyqLibraryBrowser() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  // What's actually been sent to the server. Typing in the search box
  // shouldn't fire a request per keystroke.
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const [pyqs, setPyqs] = useState<Pyq[]>([]);
  const [pagination, setPagination] = useState<PyqPagination | null>(null);
  const [options, setOptions] = useState<PyqFilterOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce the free-text fields; dropdowns apply immediately.
  useEffect(() => {
    const id = setTimeout(() => {
      setApplied(filters);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    getPyqFilterOptions()
      .then((o) => {
        if (!cancelled) setOptions(o);
      })
      .catch(() => {
        // Non-fatal: the list still works, the dropdowns just stay empty.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    browsePyqs({ ...applied, page, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setPyqs(res.pyqs ?? []);
        setPagination(res.pagination);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err) || "Failed to load papers");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applied, page]);

  const set = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) =>
      setFilters((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const activeCount = useMemo(
    () => Object.values(applied).filter(Boolean).length,
    [applied],
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-foreground sm:text-5xl">
            Previous Year{" "}
            <span className="text-accent-coral">Questions</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Access past exam papers to boost your preparation.
            {pagination && (
              <span className="ml-1 font-semibold text-foreground">
                {pagination.total.toLocaleString()} papers available.
              </span>
            )}
          </p>
        </header>

        {/* Filters */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-soft-sm">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search by subject or course code..."
              value={filters.query}
              onChange={(e) => set("query", e.target.value)}
              icon={<FiSearch size={16} />}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Programme"
              allLabel="All programmes"
              value={filters.program}
              onChange={(v) => set("program", v)}
              options={(options?.programs ?? []).map((p) => ({ value: p, label: p }))}
            />
            <FilterSelect
              label="School"
              allLabel="All schools"
              value={filters.school}
              onChange={(v) => set("school", v)}
              options={(options?.schools ?? []).map((s) => ({ value: s, label: s }))}
            />
            <FilterSelect
              label="Semester"
              allLabel="All semesters"
              value={filters.semester}
              onChange={(v) => set("semester", v)}
              options={(options?.semesters ?? []).map((s) => ({
                value: String(s),
                label: `Semester ${s}`,
              }))}
            />
            <FilterSelect
              label="Academic Year"
              allLabel="All years"
              value={filters.year}
              onChange={(v) => set("year", v)}
              options={(options?.years ?? []).map((y) => ({ value: y, label: y }))}
            />
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setPage(1);
              }}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <FiX size={14} />
              Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
            </button>
          )}
        </div>

        {/* Results */}
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="font-semibold text-destructive">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-60 w-full rounded-xl" />
            ))}
          </div>
        ) : pyqs.length === 0 ? (
          <EmptyState
            icon={<FiFileText size={32} />}
            title="No papers match those filters"
            description="Try widening your search or clearing a filter."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pyqs.map((pyq) => (
                <PyqCard key={pyq._id} pyq={pyq} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm font-semibold text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={!pagination.hasMore}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
