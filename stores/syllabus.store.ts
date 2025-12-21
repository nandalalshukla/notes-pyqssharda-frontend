import { create } from "zustand";
import {
  Syllabus,
  getSyllabus,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
} from "@/lib/api/crud.api";

interface SyllabusStore {
  syllabusList: Syllabus[];
  isLoading: boolean;
  error: string | null;

  fetchSyllabus: () => Promise<void>;
  addSyllabus: (data: FormData | Syllabus) => Promise<void>;
  editSyllabus: (
    id: string,
    data: Partial<Syllabus> | FormData
  ) => Promise<void>;
  removeSyllabus: (id: string) => Promise<void>;
}

export const useSyllabusStore = create<SyllabusStore>((set) => ({
  syllabusList: [],
  isLoading: false,
  error: null,

  fetchSyllabus: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getSyllabus();
      // Handle both array response and wrapped response
      const list = Array.isArray(response)
        ? response
        : response.syllabus || response.data || [];
      set({ syllabusList: list, isLoading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
        syllabusList: [],
      });
    }
  },

  addSyllabus: async (data: FormData | Syllabus) => {
    set({ isLoading: true, error: null });
    try {
      const newSyllabus = await createSyllabus(data);
      set((state) => ({
        syllabusList: [newSyllabus, ...state.syllabusList],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  editSyllabus: async (id: string, data: Partial<Syllabus> | FormData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedSyllabus = await updateSyllabus(id, data);
      set((state) => ({
        syllabusList: state.syllabusList.map((s) =>
          s._id === id ? updatedSyllabus : s
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  removeSyllabus: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteSyllabus(id);
      set((state) => ({
        syllabusList: state.syllabusList.filter((s) => s._id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
