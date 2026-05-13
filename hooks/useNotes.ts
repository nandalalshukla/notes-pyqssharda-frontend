/**
 * useNotes Hook
 * Custom hook for notes operations
 */

import { useNotesStore } from "@/stores";
import { useCallback } from "react";

export const useNotes = () => {
  const {
    myNotes,
    allNotes,
    recentNotes,
    searchResults,
    isLoading,
    error,
    fetchAllNotes,
    fetchMyNotes,
    fetchRecentNotes,
    searchNotes,
    addNote,
    editNote,
    removeNote,
    clearSearchResults,
    clearError,
  } = useNotesStore();

  const handleFetchAllNotes = useCallback(async () => {
    await fetchAllNotes();
  }, [fetchAllNotes]);

  const handleFetchMyNotes = useCallback(async () => {
    await fetchMyNotes();
  }, [fetchMyNotes]);

  const handleFetchRecentNotes = useCallback(
    async (limit?: number) => {
      await fetchRecentNotes(limit);
    },
    [fetchRecentNotes],
  );

  const handleSearchNotes = useCallback(
    async (params: Parameters<typeof searchNotes>[0]) => {
      await searchNotes(params);
    },
    [searchNotes],
  );

  const handleUploadNotes = useCallback(
    async (data: FormData) => {
      await addNote(data);
    },
    [addNote],
  );

  const handleUpdateNote = useCallback(
    async (id: string, data: FormData) => {
      await editNote(id, data);
    },
    [editNote],
  );

  const handleDeleteNote = useCallback(
    async (id: string) => {
      await removeNote(id);
    },
    [removeNote],
  );

  return {
    // State
    myNotes,
    allNotes,
    recentNotes,
    searchResults,
    isLoading,
    error,

    // Handlers
    handleFetchAllNotes,
    handleFetchMyNotes,
    handleFetchRecentNotes,
    handleSearchNotes,
    handleUploadNotes,
    handleUpdateNote,
    handleDeleteNote,
    handleClearSearchResults: clearSearchResults,
    clearError,
  };
};
