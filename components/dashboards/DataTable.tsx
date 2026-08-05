"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Filter,
  Eye,
  MoreVertical,
} from "lucide-react";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor(row: T): React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
  cell?(row: T): React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId?: (row: T) => string;
  onRowClick?: (row: T) => void;
  onView?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  paginated?: boolean;
  pageSize?: number;
  searchable?: boolean;
  searchFields?: (keyof T)[];
  selectable?: boolean;
  onSelectRows?: (rows: T[]) => void;
  actions?: (row: T) => React.ReactNode;
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

const DataTableInner = <T,>(
  {
    columns,
    data,
    getRowId,
    onRowClick,
    onView,
    isLoading = false,
    emptyMessage = "No data available",
    paginated = true,
    pageSize = 10,
    searchable = true,
    searchFields = [],
    selectable = false,
    onSelectRows,
    actions,
    className = "",
  }: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  }>({ key: "", direction: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const resolveRowId = (row: T) =>
    getRowId?.(row) ??
    (row as { id?: string; _id?: string }).id ??
    (row as { id?: string; _id?: string })._id ??
    "";

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm || searchFields.length === 0) return data;

    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      searchFields.some((field) => {
        const value = row[field];
        return String(value).toLowerCase().includes(term);
      }),
    );
  }, [data, searchTerm, searchFields]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.direction || !sortConfig.key) return filteredData;

    const normalizeSortValue = (value: unknown) => {
      if (typeof value === "number" || typeof value === "string") return value;
      if (value instanceof Date) return value.getTime();
      return String(value ?? "");
    };

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = normalizeSortValue(
        (a as Record<string, unknown>)[sortConfig.key],
      );
      const bValue = normalizeSortValue(
        (b as Record<string, unknown>)[sortConfig.key],
      );

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, paginated]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        } else if (prev.direction === "desc") {
          return { key: "", direction: null };
        }
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedData.map((row) => resolveRowId(row));
      setSelectedRows(allIds);
      onSelectRows?.(paginatedData);
    } else {
      setSelectedRows([]);
      onSelectRows?.([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];

      const selectedData = paginatedData.filter((r) =>
        newSelection.includes(resolveRowId(r)),
      );
      onSelectRows?.(selectedData);

      return newSelection;
    });
  };

  const getSortIcon = (columnId: string) => {
    if (sortConfig.key !== columnId) {
      return <ChevronsUpDown size={16} className="text-slate-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={16} className="text-blue-600" />
    ) : (
      <ChevronDown size={16} className="text-blue-600" />
    );
  };

  if (isLoading) {
    return (
      <div ref={ref} className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-slate-600">Loading data...</p>
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {/* Search Bar */}
      {searchable && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          <button
            className="inline-flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors sm:w-auto w-full"
            title="Filter"
          >
            <Filter size={18} className="text-slate-600" />
          </button>
        </div>
      )}

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {paginatedData.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-10 text-center shadow-sm">
            <p className="text-slate-500 text-sm">{emptyMessage}</p>
          </div>
        ) : (
          paginatedData.map((row) => (
            <div
              key={resolveRowId(row)}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="space-y-4">
                {columns.map((column) => (
                  <div
                    key={`${resolveRowId(row)}-${column.id}`}
                    className="space-y-1"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {column.header}
                    </p>
                    <div
                      className={`text-sm text-slate-700 ${column.className || ""}`}
                      onClick={() => onRowClick?.(row)}
                    >
                      {column.cell ? column.cell(row) : column.accessor(row)}
                    </div>
                  </div>
                ))}
                {(selectable || actions || onView) && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    {selectable && (
                      <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(resolveRowId(row))}
                          onChange={() => handleSelectRow(resolveRowId(row))}
                          className="rounded border-slate-300 cursor-pointer"
                        />
                        Select row
                      </label>
                    )}
                    {onView && (
                      <button
                        onClick={() => onView(row)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    )}
                    {actions && <div className="w-full">{actions(row)}</div>}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md md:block">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
              {selectable && (
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length > 0 &&
                      selectedRows.length === paginatedData.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="cursor-pointer rounded border-slate-300"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`px-6 py-4 text-left ${column.className || ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {column.header}
                    </span>
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.id)}
                        className="rounded p-1 transition-colors hover:bg-slate-200"
                        title="Sort"
                      >
                        {getSortIcon(column.id)}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {(actions || onView) && (
                <th className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-slate-900">
                    Actions
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (actions || onView ? 1 : 0)
                  }
                  className="px-6 py-12 text-center"
                >
                  <p className="text-sm text-slate-500">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={resolveRowId(row)}
                  className="cursor-pointer border-b border-slate-100 transition-colors duration-150 hover:bg-blue-50/50"
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(resolveRowId(row))}
                        onChange={() => handleSelectRow(resolveRowId(row))}
                        className="cursor-pointer rounded border-slate-300"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={`${resolveRowId(row)}-${column.id}`}
                      className={`px-6 py-4 text-sm text-slate-700 ${column.className || ""}`}
                      onClick={() => onRowClick?.(row)}
                    >
                      {column.cell ? column.cell(row) : column.accessor(row)}
                    </td>
                  ))}
                  {(actions || onView) && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {actions && (
                          <div className="group relative">
                            <button className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
                              <MoreVertical size={16} />
                            </button>
                            <div className="absolute right-0 mt-0 hidden w-48 rounded-lg border border-slate-200 bg-white shadow-lg group-hover:block z-10">
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

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{" "}
            of <span className="font-semibold">{sortedData.length}</span>{" "}
            results
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
              }
              return (
                <button
                  key={`page-${i}-${pageNum}`}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ForwardedDataTable = React.forwardRef(DataTableInner) as <T>(
  props: DataTableProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;

(
  ForwardedDataTable as typeof ForwardedDataTable & {
    displayName?: string;
  }
).displayName = "DataTable";

export const DataTable = ForwardedDataTable;
