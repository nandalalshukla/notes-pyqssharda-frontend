import { create } from "zustand";
import {
  Note,
  getAllNotes,
  getMyNotes,
  searchNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../lib/api/notes.api";
import { getErrorMessage } from "../lib/utils/errorHandler";

interface NotesStore {
  myNotes: Note[];
  allNotes: Note[];
  isLoading: boolean;
  error: string | null;

  fetchAllNotes: () => Promise<void>;
  fetchMyNotes: () => Promise<void>;
  searchNotes: (query: string) => Promise<void>;
  addNote: (data: FormData) => Promise<void>;
  editNote: (id: string, data: FormData) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
}

export const useNotesStore = create<NotesStore>((set) => ({
  myNotes: [],
  allNotes: [],
  isLoading: false,
  error: null,

  fetchAllNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getAllNotes();
      const notes = res.notes || [];
      set({ allNotes: notes, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to fetch notes", isLoading: false });
    }
  },

  fetchMyNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getMyNotes();
      const notes = res.notes || [];
      set({ myNotes: notes, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to fetch my notes", isLoading: false });
    }
  },

  searchNotes: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await searchNotes(query);
      const notes = res.notes || [];
      set({ allNotes: notes, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Search failed", isLoading: false });
    }
  },

  addNote: async (data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createNote(data);
      const newNote = res.note;
      set((state) => ({ myNotes: [newNote, ...state.myNotes], isLoading: false }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to add note", isLoading: false });
      throw error;
    }
  },

  editNote: async (id: string, data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await updateNote(id, data);
      const updatedNote = res.note;
      set((state) => ({
        myNotes: state.myNotes.map((n) => (n._id === id ? updatedNote : n)),
        allNotes: state.allNotes.map((n) => (n._id === id ? updatedNote : n)),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to update note", isLoading: false });
      throw error;
    }
  },

  removeNote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteNote(id);
      set((state) => ({
        myNotes: state.myNotes.filter((n) => n._id !== id),
        allNotes: state.allNotes.filter((n) => n._id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) || "Failed to delete note", isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  resetStore: () => set({ myNotes: [], allNotes: [], isLoading: false, error: null }),
}));

