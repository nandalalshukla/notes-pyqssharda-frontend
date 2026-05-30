import { useCallback, useMemo, useState } from "react";

export interface UseDataTableOptions<T> {
  data: T[];
  searchFields?: (keyof T)[];
  sortField?: keyof T;
  filterField?: keyof T;
  pageSize?: number;
}

export interface UseDataTableReturn<T> {
  // Search & Filter
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterValue: string;
  setFilterValue: (value: string) => void;

  // Sorting
  sortConfig: { field?: keyof T; direction: "asc" | "desc" | null };
  handleSort: (field: keyof T) => void;

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;

  // Data
  filteredData: T[];
  paginatedData: T[];
  totalPages: number;
  totalResults: number;
}

/**
 * Hook for managing data table state (search, filter, sort, paginate)
 */
export const useDataTable = <T extends { id: string }>({
  data,
  searchFields = [],
  sortField,
  filterField,
  pageSize = 10,
}: UseDataTableOptions<T>): UseDataTableReturn<T> => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    field?: keyof T;
    direction: "asc" | "desc" | null;
  }>({ field: sortField, direction: null });
  const [currentPage, setCurrentPage] = useState(1);

  // Search & Filter
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search filter
      if (searchTerm && searchFields.length > 0) {
        const term = searchTerm.toLowerCase();
        const matchesSearch = searchFields.some((field) => {
          const value = item[field];
          return String(value).toLowerCase().includes(term);
        });
        if (!matchesSearch) return false;
      }

      // Filter filter
      if (filterValue && filterField) {
        if (item[filterField] !== filterValue) return false;
      }

      return true;
    });
  }, [data, searchTerm, searchFields, filterValue, filterField]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortConfig.direction || !sortConfig.field) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.field!];
      const bValue = b[sortConfig.field!];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Paginate
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = useCallback((field: keyof T) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        if (prev.direction === "asc") {
          return { field, direction: "desc" };
        } else if (prev.direction === "desc") {
          return { field: undefined, direction: null };
        }
      }
      return { field, direction: "asc" };
    });
    setCurrentPage(1);
  }, []);

  return {
    searchTerm,
    setSearchTerm: (term) => {
      setSearchTerm(term);
      setCurrentPage(1);
    },
    filterValue,
    setFilterValue: (value) => {
      setFilterValue(value);
      setCurrentPage(1);
    },
    sortConfig,
    handleSort,
    currentPage,
    setCurrentPage,
    pageSize,
    filteredData,
    paginatedData,
    totalPages,
    totalResults: sortedData.length,
  };
};

export interface UseDetailPanelReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Hook for managing detail panel open/close state
 */
export const useDetailPanel = (initialOpen = false): UseDetailPanelReturn => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
};

export interface UseModalReturn {
  isOpen: boolean;
  open: (data?: any) => void;
  close: () => void;
  data: any;
  toggle: () => void;
}

/**
 * Hook for managing modal open/close state with data passing
 */
export const useModal = (initialOpen = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState(null);

  return {
    isOpen,
    open: (newData?: any) => {
      setData(newData ?? null);
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
      setData(null);
    },
    data,
    toggle: () => setIsOpen((prev) => !prev),
  };
};

/**
 * Hook for managing paginated data state
 */
export const usePagination = (items: any[], pageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginatedItems = items.slice(start, start + pageSize);

  const goToPage = (page: number) => {
    const maxPage = Math.max(1, totalPages);
    setCurrentPage(Math.min(Math.max(1, page), maxPage));
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const reset = () => setCurrentPage(1);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    reset,
  };
};

/**
 * Hook for managing multi-select state
 */
export const useMultiSelect = <T extends { id: string }>(
  initialData: T[] = [],
) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = (items: T[]) => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const selectItems = (ids: string[]) => setSelectedIds(ids);
  const clearSelection = () => setSelectedIds([]);

  const selectedItems = initialData.filter((item) =>
    selectedIds.includes(item.id),
  );

  return {
    selectedIds,
    toggleItem,
    toggleAll,
    selectItems,
    clearSelection,
    selectedItems,
    isAllSelected: selectedIds.length === initialData.length,
    hasSome: selectedIds.length > 0,
    count: selectedIds.length,
  };
};
