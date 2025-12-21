import { create } from "zustand";
import {
  Pyq,
  getPyqs,
  createPyq,
  updatePyq,
  deletePyq,
} from "@/lib/api/crud.api";

interface PYQsStore {
  pyqs: Pyq[];
  isLoading: boolean;
  error: string | null;

  fetchPYQs: () => Promise<void>;
  addPYQ: (data: FormData | Pyq) => Promise<void>;
  editPYQ: (id: string, data: Partial<Pyq> | FormData) => Promise<void>;
  removePYQ: (id: string) => Promise<void>;
}

export const usePYQsStore = create<PYQsStore>((set) => ({
  pyqs: [],
  isLoading: false,
  error: null,

  fetchPYQs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getPyqs();
      // Handle both array response and wrapped response
      const pyqs = Array.isArray(response)
        ? response
        : response.pyqs || response.data || [];
      set({ pyqs, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false, pyqs: [] });
    }
  },

  addPYQ: async (data: FormData | Pyq) => {
    set({ isLoading: true, error: null });
    try {
      const newPYQ = await createPyq(data);
      set((state) => ({
        pyqs: [newPYQ, ...state.pyqs],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  editPYQ: async (id: string, data: Partial<Pyq> | FormData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPYQ = await updatePyq(id, data);
      set((state) => ({
        pyqs: state.pyqs.map((p) => (p._id === id ? updatedPYQ : p)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  removePYQ: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deletePyq(id);
      set((state) => ({
        pyqs: state.pyqs.filter((p) => p._id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
