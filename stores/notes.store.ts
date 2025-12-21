import { create } from "zustand";
import {
  Note,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getAllNotes,
  searchNotes,
} from "@/lib/api/crud.api";

interface NotesStore {
  notes: Note[];
  isLoading: boolean;
  error: string | null;

  fetchNotes: () => Promise<void>;
  addNote: (data: FormData) => Promise<void>;
  editNote: (id: string, data: FormData) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesStore>((set) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getNotes();
      // Handle both array response and wrapped response
      const notes = Array.isArray(response)
        ? response
        : response.notes || response.data || [];
      set({ notes, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false, notes: [] });
    }
  },

  addNote: async (data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const newNote = await createNote(data);
      set((state) => ({
        notes: [newNote, ...state.notes],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  editNote: async (id: string, data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await updateNote(id, data);
      set((state) => ({
        notes: state.notes.map((n) => (n._id === id ? updatedNote : n)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  removeNote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteNote(id);
      set((state) => ({
        notes: state.notes.filter((n) => n._id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
