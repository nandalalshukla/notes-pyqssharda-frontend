/**
 * usePYQs Hook
 * Custom hook for PYQs operations
 */

import { usePYQsStore } from "@/stores";
import { useCallback } from "react";

export const usePYQs = () => {
  const {
    myPyqs,
    allPyqs,
    recentPyqs,
    searchResults,
    isLoading,
    error,
    fetchPYQs,
    fetchAllPyqs,
    fetchRecentPyqs,
    searchPyqs,
    addPYQ,
    editPYQ,
    removePYQ,
    clearSearchResults,
    clearError,
  } = usePYQsStore();

  const handleFetchMyPYQs = useCallback(async () => {
    await fetchPYQs();
  }, [fetchPYQs]);

  const handleFetchAllPYQs = useCallback(async () => {
    await fetchAllPyqs();
  }, [fetchAllPyqs]);

  const handleFetchRecentPYQs = useCallback(
    async (limit?: number) => {
      await fetchRecentPyqs(limit);
    },
    [fetchRecentPyqs],
  );

  const handleSearchPYQs = useCallback(
    async (params: Parameters<typeof searchPyqs>[0]) => {
      await searchPyqs(params);
    },
    [searchPyqs],
  );

  const handleUploadPYQ = useCallback(
    async (data: FormData) => {
      await addPYQ(data);
    },
    [addPYQ],
  );

  const handleUpdatePYQ = useCallback(
    async (id: string, data: FormData) => {
      await editPYQ(id, data);
    },
    [editPYQ],
  );

  const handleDeletePYQ = useCallback(
    async (id: string) => {
      await removePYQ(id);
    },
    [removePYQ],
  );

  return {
    // State
    myPyqs,
    allPyqs,
    recentPyqs,
    searchResults,
    isLoading,
    error,

    // Handlers
    handleFetchMyPYQs,
    handleFetchAllPYQs,
    handleFetchRecentPYQs,
    handleSearchPYQs,
    handleUploadPYQ,
    handleUpdatePYQ,
    handleDeletePYQ,
    handleClearSearchResults: clearSearchResults,
    clearError,
  };
};
