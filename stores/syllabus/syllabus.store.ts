import { create } from "zustand";
import {
  Syllabus,
  SyllabusSearchParams,
  getAllSyllabus,
  getRecentSyllabus,
  searchSyllabus,
  getMySyllabus,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
} from "@/lib/api/syllabus/syllabus.api";
import { getErrorMessage } from "@/lib/utils/errorHandler";

let mySyllabusFetchVersion = 0;

interface SyllabusStore {
  mySyllabus: Syllabus[];
  mySyllabusPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
  mySyllabusCounts: {
    pending: number;
    approved: number;
    rejected: number;
    all: number;
  } | null;
  allSyllabus: Syllabus[];
  recentSyllabus: Syllabus[];
  searchResults: Syllabus[];
  isLoading: boolean;
  error: string | null;
  lastSearchParams: SyllabusSearchParams | null;
  lastMySyllabusFetchedAt: number | null;

  fetchSyllabus: (params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "approved" | "rejected";
    query?: string;
    sort?: "createdAt" | "updatedAt" | "title" | "courseCode" | "year";
    direction?: "asc" | "desc";
  }) => Promise<void>;
  fetchAllSyllabus: () => Promise<void>;
  fetchRecentSyllabus: (limit?: number) => Promise<void>;
  searchSyllabus: (params: SyllabusSearchParams) => Promise<void>;
  addSyllabus: (data: FormData) => Promise<void>;
  editSyllabus: (id: string, data: FormData) => Promise<void>;
  removeSyllabus: (id: string) => Promise<void>;
  clearSearchResults: () => void;
  clearError: () => void;
  resetStore: () => void;
}

export const useSyllabusStore = create<SyllabusStore>((set) => ({
  mySyllabus: [],
  mySyllabusPagination: null,
  mySyllabusCounts: null,
  allSyllabus: [],
  recentSyllabus: [],
  searchResults: [],
  isLoading: false,
  error: null,
  lastSearchParams: null,
  lastMySyllabusFetchedAt: null,

  fetchSyllabus: async (params = {}) => {
    const isDefaultQuery =
      (!params.page || params.page === 1) &&
      (!params.limit || params.limit === 25) &&
      !params.status &&
      !params.query &&
      (!params.sort || params.sort === "createdAt") &&
      (!params.direction || params.direction === "desc");
    const { lastMySyllabusFetchedAt } = useSyllabusStore.getState();
    if (
      isDefaultQuery &&
      lastMySyllabusFetchedAt !== null &&
      Date.now() - lastMySyllabusFetchedAt < 60_000
    ) {
      return;
    }
    const requestVersion = ++mySyllabusFetchVersion;
    set((state) => ({
      isLoading: true,
      error: null,
      lastMySyllabusFetchedAt: isDefaultQuery ? state.lastMySyllabusFetchedAt : null,
    }));
    try {
      const res = await getMySyllabus(params);
      if (requestVersion !== mySyllabusFetchVersion) return;
      const syllabus = res.syllabus || res.syllabuses || [];
      set((state) => ({
        mySyllabus: syllabus,
        mySyllabusPagination: res.pagination || null,
        mySyllabusCounts: res.counts || null,
        isLoading: false,
        lastMySyllabusFetchedAt: isDefaultQuery ? Date.now() : null,
      }));
    } catch (error: unknown) {
      if (requestVersion !== mySyllabusFetchVersion) return;
      set({
        error: getErrorMessage(error) || "Failed to fetch syllabus",
        isLoading: false,
        mySyllabus: [],
      });
    }
  },

  fetchAllSyllabus: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getAllSyllabus();
      const syllabus = res.syllabus || res.syllabuses || [];
      set({ allSyllabus: syllabus, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to fetch all syllabus",
        isLoading: false,
      });
    }
  },

  fetchRecentSyllabus: async (limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getRecentSyllabus(limit);
      const syllabus = res.syllabus || res.syllabuses || [];
      set({ recentSyllabus: syllabus, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to fetch recent syllabus",
        isLoading: false,
      });
    }
  },

  searchSyllabus: async (params: SyllabusSearchParams) => {
    set({ isLoading: true, error: null, lastSearchParams: params });
    try {
      const res = await searchSyllabus(params);
      const syllabus = res.syllabus || res.syllabuses || [];
      set({ searchResults: syllabus, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Search failed",
        isLoading: false,
      });
    }
  },

  addSyllabus: async (data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createSyllabus(data);
      const newSyllabus = res.syllabus;
      set((state) => ({
        mySyllabus: [newSyllabus, ...state.mySyllabus],
        lastMySyllabusFetchedAt: null,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to add syllabus",
        isLoading: false,
      });
      throw error;
    }
  },

  editSyllabus: async (id: string, data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await updateSyllabus(id, data);
      const updatedSyllabus = res.syllabus;
      set((state) => ({
        mySyllabus: state.mySyllabus.map((s) =>
          s._id === id ? updatedSyllabus : s,
        ),
        lastMySyllabusFetchedAt: null,
        allSyllabus: state.allSyllabus.map((s) =>
          s._id === id ? updatedSyllabus : s,
        ),
        recentSyllabus: state.recentSyllabus.map((s) =>
          s._id === id ? updatedSyllabus : s,
        ),
        searchResults: state.searchResults.map((s) =>
          s._id === id ? updatedSyllabus : s,
        ),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to update syllabus",
        isLoading: false,
      });
      throw error;
    }
  },

  removeSyllabus: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteSyllabus(id);
      set((state) => ({
        mySyllabus: state.mySyllabus.filter((s) => s._id !== id),
        lastMySyllabusFetchedAt: null,
        allSyllabus: state.allSyllabus.filter((s) => s._id !== id),
        recentSyllabus: state.recentSyllabus.filter((s) => s._id !== id),
        searchResults: state.searchResults.filter((s) => s._id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to delete syllabus",
        isLoading: false,
      });
      throw error;
    }
  },

  clearSearchResults: () => set({ searchResults: [], lastSearchParams: null }),
  clearError: () => set({ error: null }),
  resetStore: () => {
    mySyllabusFetchVersion += 1;
    set({
      mySyllabus: [],
      allSyllabus: [],
      recentSyllabus: [],
      searchResults: [],
      isLoading: false,
      error: null,
      lastSearchParams: null,
    });
  },
}));
