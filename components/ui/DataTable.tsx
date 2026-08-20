"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  MoreVertical,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Input } from "./Input";
import { Pagination } from "./Pagination";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  cell?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId?: (row: T) => string;
  onRowClick?: (row: T) => void;
  onView?: (row: T) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  paginated?: boolean;
  pageSize?: number;
  searchable?: boolean;
  searchFields?: (keyof T)[];
  actions?: (row: T) => React.ReactNode;
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

export function DataTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  onView,
  isLoading = false,
  emptyTitle = "No data available",
  emptyDescription,
  paginated = true,
  pageSize = 10,
  searchable = false,
  searchFields = [],
  actions,
  className,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; direction: SortDirection }>({
    key: "",
    direction: null,
  });
  const [search, setSearch] = useState("");

  const resolveRowId = (row: T, index: number) =>
    getRowId?.(row) ??
    (row as { id?: string; _id?: string }).id ??
    (row as { id?: string; _id?: string })._id ??
    String(index);

  const filtered = useMemo(() => {
    if (!search || searchFields.length === 0) return data;
    const term = search.toLowerCase();
    return data.filter((row) =>
      searchFields.some((field) => String(row[field] ?? "").toLowerCase().includes(term)),
    );
  }, [data, search, searchFields]);

  const sorted = useMemo(() => {
    if (!sort.direction || !sort.key) return filtered;
    const normalize = (value: unknown) => {
      if (typeof value === "number" || typeof value === "string") return value;
      if (value instanceof Date) return value.getTime();
      return String(value ?? "");
    };
    return [...filtered].sort((a, b) => {
      const av = normalize((a as Record<string, unknown>)[sort.key]);
      const bv = normalize((b as Record<string, unknown>)[sort.key]);
      if (av < bv) return sort.direction === "asc" ? -1 : 1;
      if (av > bv) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = useMemo(() => {
    if (!paginated) return sorted;
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize, paginated]);

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: "", direction: null };
      }
      return { key, direction: "asc" };
    });
    setPage(1);
  };

  const sortIcon = (columnId: string) => {
    if (sort.key !== columnId)
      return <ChevronsUpDown size={14} className="text-muted-foreground" />;
    return sort.direction === "asc" ? (
      <ChevronUp size={14} className="text-primary" />
    ) : (
      <ChevronDown size={14} className="text-primary" />
    );
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className={className} />;
  }

  const colSpan = columns.length + (actions || onView ? 1 : 0);

  return (
    <div className={className}>
      {searchable && (
        <div className="mb-5 max-w-sm">
          <Input
            icon={<Search size={16} />}
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {pageData.map((row, i) => (
          <div
            key={resolveRowId(row, i)}
            className="rounded-2xl border border-border bg-card p-4 shadow-soft-sm"
          >
            <div className="space-y-3">
              {columns.map((column) => (
                <div key={`${resolveRowId(row, i)}-${column.id}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {column.header}
                  </p>
                  <div
                    className={cn("text-sm text-foreground", column.className)}
                    onClick={() => onRowClick?.(row)}
                  >
                    {column.cell ? column.cell(row) : column.accessor(row)}
                  </div>
                </div>
              ))}
              {(actions || onView) && (
                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  {onView && (
                    <button
                      onClick={() => onView(row)}
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer"
                    >
                      <Eye size={15} />
                      View
                    </button>
                  )}
                  {actions && <div className="w-full">{actions(row)}</div>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card shadow-soft-sm md:block">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn("px-5 py-3.5 text-left", column.className)}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {column.header}
                    </span>
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.id)}
                        className="rounded p-0.5 transition-colors hover:bg-secondary cursor-pointer"
                        aria-label={`Sort by ${column.header}`}
                      >
                        {sortIcon(column.id)}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {(actions || onView) && (
                <th className="px-5 py-3.5 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  {emptyTitle}
                </td>
              </tr>
            ) : (
              pageData.map((row, i) => (
                <tr
                  key={resolveRowId(row, i)}
                  className="border-b border-border last:border-b-0 transition-colors hover:bg-secondary/60"
                >
                  {columns.map((column) => (
                    <td
                      key={`${resolveRowId(row, i)}-${column.id}`}
                      className={cn(
                        "px-5 py-3.5 text-sm text-foreground",
                        onRowClick && "cursor-pointer",
                        column.className,
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {column.cell ? column.cell(row) : column.accessor(row)}
                    </td>
                  ))}
                  {(actions || onView) && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            title="View details"
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {actions && (
                          <div className="group relative">
                            <button
                              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                              aria-label="Row actions"
                            >
                              <MoreVertical size={16} />
                            </button>
                            <div className="absolute right-0 z-10 mt-0 hidden w-48 rounded-xl border border-border bg-card shadow-soft-lg group-hover:block">
                              {actions(row)}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginated && totalPages > 1 && (
        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{(page - 1) * pageSize + 1}</span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(page * pageSize, sorted.length)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{sorted.length}</span> results
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="sm:justify-end" />
        </div>
      )}
    </div>
  );
}
