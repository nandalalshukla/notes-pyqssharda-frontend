import { create } from "zustand";
import {
  Note,
  NoteSearchParams,
  getAllNotes,
  getRecentNotes,
  getMyNotes,
  searchNotes,
  createNote,
  updateNote,
  deleteNote,
} from "@/lib/api/notes/notes.api";
import { getErrorMessage } from "../../lib/utils/errorHandler";

interface NotesStore {
  myNotes: Note[];
  allNotes: Note[];
  recentNotes: Note[];
  searchResults: Note[];
  isLoading: boolean;
  error: string | null;
  lastSearchParams: NoteSearchParams | null;

  fetchAllNotes: () => Promise<void>;
  fetchRecentNotes: (limit?: number) => Promise<void>;
  fetchMyNotes: () => Promise<void>;
  searchNotes: (params: NoteSearchParams) => Promise<void>;
  addNote: (data: FormData) => Promise<void>;
  editNote: (id: string, data: FormData) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  clearSearchResults: () => void;
  clearError: () => void;
  resetStore: () => void;
}

export const useNotesStore = create<NotesStore>((set) => ({
  myNotes: [],
  allNotes: [],
  recentNotes: [],
  searchResults: [],
  isLoading: false,
  error: null,
  lastSearchParams: null,

  fetchAllNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getAllNotes();
      const notes = res.notes || [];
      set({ allNotes: notes, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to fetch notes",
        isLoading: false,
      });
    }
  },

  fetchRecentNotes: async (limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getRecentNotes(limit);
      const notes = res.notes || [];
      set({ recentNotes: notes, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to fetch recent notes",
        isLoading: false,
      });
    }
  },

  fetchMyNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getMyNotes();
      const notes = res.notes || [];
      set({ myNotes: notes, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to fetch my notes",
        isLoading: false,
      });
    }
  },

  searchNotes: async (params: NoteSearchParams) => {
    set({ isLoading: true, error: null, lastSearchParams: params });
    try {
      const res = await searchNotes(params);
      const notes = res.notes || [];
      set({ searchResults: notes, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Search failed",
        isLoading: false,
      });
    }
  },

  addNote: async (data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createNote(data);
      const newNote = res.note;
      set((state) => ({
        myNotes: [newNote, ...state.myNotes],
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to add note",
        isLoading: false,
      });
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
        recentNotes: state.recentNotes.map((n) =>
          n._id === id ? updatedNote : n,
        ),
        searchResults: state.searchResults.map((n) =>
          n._id === id ? updatedNote : n,
        ),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to update note",
        isLoading: false,
      });
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
        recentNotes: state.recentNotes.filter((n) => n._id !== id),
        searchResults: state.searchResults.filter((n) => n._id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to delete note",
        isLoading: false,
      });
      throw error;
    }
  },

  clearSearchResults: () => set({ searchResults: [], lastSearchParams: null }),
  clearError: () => set({ error: null }),
  resetStore: () =>
    set({
      myNotes: [],
      allNotes: [],
      recentNotes: [],
      searchResults: [],
      isLoading: false,
      error: null,
      lastSearchParams: null,
    }),
}));
