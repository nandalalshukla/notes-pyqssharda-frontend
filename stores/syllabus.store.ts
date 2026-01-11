import { create } from "zustand";
import {
  Syllabus,
  getAllSyllabus,
  searchSyllabus,
  getMySyllabus,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
} from "../lib/api/syllabus.api";
import { getErrorMessage } from "../lib/utils/errorHandler";

interface SyllabusStore {
  mySyllabus: Syllabus[];
  allSyllabus: Syllabus[];
  isLoading: boolean;
  error: string | null;

  fetchSyllabus: () => Promise<void>;
  fetchAllSyllabus: () => Promise<void>;
  searchSyllabus: (query: string) => Promise<void>;
  addSyllabus: (data: FormData) => Promise<void>;
  editSyllabus: (id: string, data: FormData) => Promise<void>;
  removeSyllabus: (id: string) => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
}

export const useSyllabusStore = create<SyllabusStore>((set) => ({
  mySyllabus: [],
  allSyllabus: [],
  isLoading: false,
  error: null,

  fetchSyllabus: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getMySyllabus();
      const syllabus = res.syllabus || [];
      set({ mySyllabus: syllabus, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to fetch syllabus", isLoading: false, mySyllabus: [] });
    }
  },

  fetchAllSyllabus: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getAllSyllabus();
      const syllabus = res.syllabus || [];
      set({ allSyllabus: syllabus, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to fetch all syllabus", isLoading: false });
    }
  },

  searchSyllabus: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await searchSyllabus(query);
      const syllabus = res.syllabus || [];
      set({ allSyllabus: syllabus, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Search failed", isLoading: false });
    }
  },

  addSyllabus: async (data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createSyllabus(data);
      const newSyllabus = res.syllabus;
      set((state) => ({ mySyllabus: [newSyllabus, ...state.mySyllabus], isLoading: false }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to add syllabus", isLoading: false });
      throw error;
    }
  },

  editSyllabus: async (id: string, data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await updateSyllabus(id, data);
      const updatedSyllabus = res.syllabus;
      set((state) => ({
        mySyllabus: state.mySyllabus.map((s) => (s._id === id ? updatedSyllabus : s)),
        allSyllabus: state.allSyllabus.map((s) => (s._id === id ? updatedSyllabus : s)),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to update syllabus", isLoading: false });
      throw error;
    }
  },

  removeSyllabus: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteSyllabus(id);
      set((state) => ({
        mySyllabus: state.mySyllabus.filter((s) => s._id !== id),
        allSyllabus: state.allSyllabus.filter((s) => s._id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to delete syllabus", isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  resetStore: () => set({ mySyllabus: [], allSyllabus: [], isLoading: false, error: null }),
}));

