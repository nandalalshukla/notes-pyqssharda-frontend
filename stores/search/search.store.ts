import { create } from "zustand";
import {
  SearchParams,
  SearchResult,
  searchAllResources,
} from "@/lib/api/search.api";
import { getErrorMessage } from "@/lib/utils/errorHandler";

interface SearchStore {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;

  searchResources: (params: SearchParams) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  results: [],
  isLoading: false,
  error: null,

  searchResources: async (params: SearchParams) => {
    set({ isLoading: true, error: null });
    try {
      const res = await searchAllResources(params);
      set({
        results: res.results || [],
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Search failed",
        isLoading: false,
      });
    }
  },

  clearResults: () => set({ results: [], error: null }),

  clearError: () => set({ error: null }),
}));
