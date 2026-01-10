import { create } from "zustand";
import {
  Syllabus,
  getAllSyllabus,
  searchSyllabus,
  getSyllabus,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
} from "@/lib/api/crud.api";

interface SyllabusStore {
  mySyllabus: Syllabus[];
  allSyllabus: Syllabus[];
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
  mySyllabus: [],
  allSyllabus: [],
  isLoading: false,
  error: null,

  fetchSyllabus: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getSyllabus();
      const syllabus = res.syllabus;
      console.log("syllabus:",syllabus);
      set({ mySyllabus: syllabus, isLoading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
        mySyllabus: [],
      });
    }
  },

  addSyllabus: async (data: FormData | Syllabus) => {
    set({ isLoading: true, error: null });
    try {
      const newSyllabus = await createSyllabus(data);
      set((state) => ({
        mySyllabus: [newSyllabus, ...state.mySyllabus],
        allSyllabus: [newSyllabus, ...state.allSyllabus],
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
        mySyllabus: state.mySyllabus.map((s) =>
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
        mySyllabus: state.mySyllabus.filter((s) => s._id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
