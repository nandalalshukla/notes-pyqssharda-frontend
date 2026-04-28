/**
 * useSyllabus Hook
 * Custom hook for Syllabus operations
 */

import { useSyllabusStore } from "@/stores";
import { useCallback } from "react";

export const useSyllabus = () => {
  const {
    mySyllabus,
    allSyllabus,
    recentSyllabus,
    searchResults,
    isLoading,
    error,
    fetchSyllabus,
    fetchAllSyllabus,
    fetchRecentSyllabus,
    searchSyllabus,
    addSyllabus,
    editSyllabus,
    removeSyllabus,
    clearSearchResults,
    clearError,
  } = useSyllabusStore();

  const handleFetchMySyllabus = useCallback(async () => {
    await fetchSyllabus();
  }, [fetchSyllabus]);

  const handleFetchAllSyllabus = useCallback(async () => {
    await fetchAllSyllabus();
  }, [fetchAllSyllabus]);

  const handleFetchRecentSyllabus = useCallback(
    async (limit?: number) => {
      await fetchRecentSyllabus(limit);
    },
    [fetchRecentSyllabus],
  );

  const handleSearchSyllabus = useCallback(
    async (params: Parameters<typeof searchSyllabus>[0]) => {
      await searchSyllabus(params);
    },
    [searchSyllabus],
  );

  const handleUploadSyllabus = useCallback(
    async (data: FormData) => {
      await addSyllabus(data);
    },
    [addSyllabus],
  );

  const handleUpdateSyllabus = useCallback(
    async (id: string, data: FormData) => {
      await editSyllabus(id, data);
    },
    [editSyllabus],
  );

  const handleDeleteSyllabus = useCallback(
    async (id: string) => {
      await removeSyllabus(id);
    },
    [removeSyllabus],
  );

  return {
    // State
    mySyllabus,
    allSyllabus,
    recentSyllabus,
    searchResults,
    isLoading,
    error,

    // Handlers
    handleFetchMySyllabus,
    handleFetchAllSyllabus,
    handleFetchRecentSyllabus,
    handleSearchSyllabus,
    handleUploadSyllabus,
    handleUpdateSyllabus,
    handleDeleteSyllabus,
    handleClearSearchResults: clearSearchResults,
    clearError,
  };
};
