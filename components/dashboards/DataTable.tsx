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
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
  cell?: (row: T) => React.ReactNode;
}

export interface DataTableRow {
  id: string;
  [key: string]: any;
}

interface DataTableProps<T extends DataTableRow> {
  columns: DataTableColumn<T>[];
  data: T[];
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

export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps<any>>(
  (
    {
      columns,
      data,
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
    },
    ref,
  ) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{
      key: string;
      direction: SortDirection;
    }>({ key: "", direction: null });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

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

      const sorted = [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

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
        const allIds = paginatedData.map((row) => row.id);
        setSelectedRows(allIds);
        onSelectRows?.(paginatedData);
      } else {
        setSelectedRows([]);
        onSelectRows?.([]);
      }
    };

    const handleSelectRow = (id: string, row: any) => {
      setSelectedRows((prev) => {
        const newSelection = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];

        const selectedData = paginatedData.filter((r) =>
          newSelection.includes(r.id),
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
          <div className="mb-6 flex gap-3">
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
            <button className="px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors" title="Filter">
              <Filter size={18} className="text-slate-600" />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                {selectable && (
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length > 0 &&
                        selectedRows.length === paginatedData.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={`px-6 py-4 text-left ${column.className || ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        {column.header}
                      </span>
                      {column.sortable && (
                        <button
                          onClick={() => handleSort(column.id)}
                          className="hover:bg-slate-200 p-1 rounded transition-colors"
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
                    <span className="font-semibold text-slate-900 text-sm">
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
                    <p className="text-slate-500 text-sm">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors duration-150 cursor-pointer"
                  >
                    {selectable && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleSelectRow(row.id, row)}
                          className="rounded border-slate-300 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={`${row.id}-${column.id}`}
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
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                              title="View details"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          {actions && (
                            <div className="relative group">
                              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900">
                                <MoreVertical size={16} />
                              </button>
                              <div className="hidden group-hover:block absolute right-0 mt-0 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
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
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <div className="text-sm text-slate-600">
              Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-semibold">{Math.min(currentPage * pageSize, sortedData.length)}</span> of{" "}
              <span className="font-semibold">{sortedData.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium"
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
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

DataTable.displayName = "DataTable";
