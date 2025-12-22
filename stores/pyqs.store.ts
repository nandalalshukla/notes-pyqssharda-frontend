import { create } from "zustand";
import {
  Pyq,
  getAllPyqs,
  searchPyqs,
  getPyqs,
  createPyq,
  updatePyq,
  deletePyq,
} from "@/lib/api/crud.api";

interface PYQsStore {
  myPyqs: Pyq[];
  allPyqs: Pyq[];
  isLoading: boolean;
  error: string | null;

  fetchPYQs: () => Promise<void>;
  addPYQ: (data: FormData | Pyq) => Promise<void>;
  editPYQ: (id: string, data: Partial<Pyq> | FormData) => Promise<void>;
  removePYQ: (id: string) => Promise<void>;
}

export const usePYQsStore = create<PYQsStore>((set) => ({
  myPyqs: [],
  allPyqs: [],
  isLoading: false,
  error: null,

  fetchPYQs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getPyqs();
      const pyqs = res.pyqs || [];
      set({ myPyqs: pyqs, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false, myPyqs: [] });
    }
  },

  fetchAllPyqs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getAllPyqs();
      const pyqs = res.pyqs || [];
      set({ allPyqs: pyqs, isLoading: false });
    } catch (err) {
      set({ allPyqs: [], isLoading: false, error: String(err) });
    }
  },

  addPYQ: async (data: FormData | Pyq) => {
    set({ isLoading: true, error: null });
    try {
      const newPYQ = await createPyq(data);
      set((state) => ({
        allPyqs: [newPYQ, ...state.myPyqs],
        myPyqs: [newPYQ, ...state.myPyqs],
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
        myPyqs: state.myPyqs.map((p) => (p._id === id ? updatedPYQ : p)),
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
        myPyqs: state.myPyqs.filter((p) => p._id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
