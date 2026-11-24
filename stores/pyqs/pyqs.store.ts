import { create } from "zustand";
import {
  Pyq,
  PyqSearchParams,
  getAllPyqs,
  getRecentPyqs,
  searchPyqs,
  getMyPyqs,
  createPyq,
  updatePyq,
  deletePyq,
} from "@/lib/api/pyqs/pyqs.api";
import { getErrorMessage } from "../../lib/utils/errorHandler";

interface PYQsStore {
  myPyqs: Pyq[];
  myPyqsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
  myPyqsCounts: {
    pending: number;
    approved: number;
    rejected: number;
    all: number;
  } | null;
  allPyqs: Pyq[];
  recentPyqs: Pyq[];
  searchResults: Pyq[];
  isLoading: boolean;
  error: string | null;
  lastSearchParams: PyqSearchParams | null;
  lastMyPyqsFetchedAt: number | null;

  fetchPYQs: (params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "approved" | "rejected";
    query?: string;
    sort?: "createdAt" | "updatedAt" | "title" | "courseCode" | "year";
    direction?: "asc" | "desc";
  }) => Promise<void>;
  fetchAllPyqs: () => Promise<void>;
  fetchRecentPyqs: (limit?: number) => Promise<void>;
  searchPyqs: (params: PyqSearchParams) => Promise<void>;
  addPYQ: (data: FormData) => Promise<void>;
  editPYQ: (id: string, data: FormData) => Promise<void>;
  removePYQ: (id: string) => Promise<void>;
  clearSearchResults: () => void;
  clearError: () => void;
  resetStore: () => void;
}

export const usePYQsStore = create<PYQsStore>((set) => ({
  myPyqs: [],
  myPyqsPagination: null,
  myPyqsCounts: null,
  allPyqs: [],
  recentPyqs: [],
  searchResults: [],
  isLoading: false,
  error: null,
  lastSearchParams: null,
  lastMyPyqsFetchedAt: null,

  fetchPYQs: async (params = {}) => {
    const isDefaultQuery =
      (!params.page || params.page === 1) &&
      (!params.limit || params.limit === 25) &&
      !params.status &&
      !params.query &&
      (!params.sort || params.sort === "createdAt") &&
      (!params.direction || params.direction === "desc");
    const { lastMyPyqsFetchedAt } = usePYQsStore.getState();
    if (
      isDefaultQuery &&
      lastMyPyqsFetchedAt !== null &&
      Date.now() - lastMyPyqsFetchedAt < 60_000
    ) {
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const res = await getMyPyqs(params);
      const pyqs = res.pyqs || [];
      set((state) => ({
        myPyqs: pyqs,
        myPyqsPagination: res.pagination || null,
        myPyqsCounts: res.counts || null,
        isLoading: false,
        lastMyPyqsFetchedAt: isDefaultQuery
          ? Date.now()
          : state.lastMyPyqsFetchedAt,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to fetch PYQs",
        isLoading: false,
        myPyqs: [],
      });
    }
  },

  fetchAllPyqs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getAllPyqs();
      const pyqs = res.pyqs || [];
      set({ allPyqs: pyqs, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to fetch all PYQs",
        allPyqs: [],
        isLoading: false,
      });
    }
  },

  fetchRecentPyqs: async (limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getRecentPyqs(limit);
      const pyqs = res.pyqs || [];
      set({ recentPyqs: pyqs, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to fetch recent PYQs",
        isLoading: false,
      });
    }
  },

  searchPyqs: async (params: PyqSearchParams) => {
    set({ isLoading: true, error: null, lastSearchParams: params });
    try {
      const res = await searchPyqs(params);
      const pyqs = res.pyqs || [];
      set({ searchResults: pyqs, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Search failed",
        isLoading: false,
      });
    }
  },

  addPYQ: async (data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createPyq(data);
      const newPyq = res.pyq;
      set((state) => ({ myPyqs: [newPyq, ...state.myPyqs], lastMyPyqsFetchedAt: null, isLoading: false }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to add PYQ",
        isLoading: false,
      });
      throw error;
    }
  },

  editPYQ: async (id: string, data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await updatePyq(id, data);
      const updatedPyq = res.pyq;
      set((state) => ({
        myPyqs: state.myPyqs.map((p) => (p._id === id ? updatedPyq : p)),
        lastMyPyqsFetchedAt: null,
        allPyqs: state.allPyqs.map((p) => (p._id === id ? updatedPyq : p)),
        recentPyqs: state.recentPyqs.map((p) =>
          p._id === id ? updatedPyq : p,
        ),
        searchResults: state.searchResults.map((p) =>
          p._id === id ? updatedPyq : p,
        ),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to update PYQ",
        isLoading: false,
      });
      throw error;
    }
  },

  removePYQ: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deletePyq(id);
      set((state) => ({
        myPyqs: state.myPyqs.filter((p) => p._id !== id),
        lastMyPyqsFetchedAt: null,
        allPyqs: state.allPyqs.filter((p) => p._id !== id),
        recentPyqs: state.recentPyqs.filter((p) => p._id !== id),
        searchResults: state.searchResults.filter((p) => p._id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to delete PYQ",
        isLoading: false,
      });
      throw error;
    }
  },

  clearSearchResults: () => set({ searchResults: [], lastSearchParams: null }),
  clearError: () => set({ error: null }),
  resetStore: () =>
    set({
      myPyqs: [],
      allPyqs: [],
      recentPyqs: [],
      searchResults: [],
      isLoading: false,
      error: null,
      lastSearchParams: null,
    }),
}));
