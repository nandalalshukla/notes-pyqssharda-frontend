import { create } from "zustand";
import {
  Pyq,
  getAllPyqs,
  searchPyqs,
  getMyPyqs,
  createPyq,
  updatePyq,
  deletePyq,
} from "../lib/api/pyqs.api";
import { getErrorMessage } from "../lib/utils/errorHandler";

interface PYQsStore {
  myPyqs: Pyq[];
  allPyqs: Pyq[];
  isLoading: boolean;
  error: string | null;

  fetchPYQs: () => Promise<void>;
  fetchAllPyqs: () => Promise<void>;
  searchPyqs: (query: string) => Promise<void>;
  addPYQ: (data: FormData) => Promise<void>;
  editPYQ: (id: string, data: FormData) => Promise<void>;
  removePYQ: (id: string) => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
}

export const usePYQsStore = create<PYQsStore>((set) => ({
  myPyqs: [],
  allPyqs: [],
  isLoading: false,
  error: null,

  fetchPYQs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getMyPyqs();
      const pyqs = res.pyqs || [];
      set({ myPyqs: pyqs, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to fetch PYQs", isLoading: false, myPyqs: [] });
    }
  },

  fetchAllPyqs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getAllPyqs();
      const pyqs = res.pyqs || [];
      set({ allPyqs: pyqs, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to fetch all PYQs", allPyqs: [], isLoading: false });
    }
  },

  searchPyqs: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await searchPyqs(query);
      const pyqs = res.pyqs || [];
      set({ allPyqs: pyqs, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Search failed", isLoading: false });
    }
  },

  addPYQ: async (data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createPyq(data);
      const newPyq = res.pyq;
      set((state) => ({ myPyqs: [newPyq, ...state.myPyqs], isLoading: false }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to add PYQ", isLoading: false });
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
        allPyqs: state.allPyqs.map((p) => (p._id === id ? updatedPyq : p)),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to update PYQ", isLoading: false });
      throw error;
    }
  },

  removePYQ: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deletePyq(id);
      set((state) => ({
        myPyqs: state.myPyqs.filter((p) => p._id !== id),
        allPyqs: state.allPyqs.filter((p) => p._id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to delete PYQ", isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  resetStore: () => set({ myPyqs: [], allPyqs: [], isLoading: false, error: null }),
}));

