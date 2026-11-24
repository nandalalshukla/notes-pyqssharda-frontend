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
  myNotesPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
  myNotesCounts: {
    pending: number;
    approved: number;
    rejected: number;
    all: number;
  } | null;
  allNotes: Note[];
  recentNotes: Note[];
  searchResults: Note[];
  isLoading: boolean;
  error: string | null;
  lastSearchParams: NoteSearchParams | null;
  lastMyNotesFetchedAt: number | null;

  fetchAllNotes: () => Promise<void>;
  fetchRecentNotes: (limit?: number) => Promise<void>;
  fetchMyNotes: (params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "approved" | "rejected";
    query?: string;
    sort?: "createdAt" | "updatedAt" | "title" | "courseCode" | "year";
    direction?: "asc" | "desc";
  }) => Promise<void>;
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
  myNotesPagination: null,
  myNotesCounts: null,
  allNotes: [],
  recentNotes: [],
  searchResults: [],
  isLoading: false,
  error: null,
  lastSearchParams: null,
  lastMyNotesFetchedAt: null,

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

  fetchMyNotes: async (params = {}) => {
    const isDefaultQuery =
      (!params.page || params.page === 1) &&
      (!params.limit || params.limit === 25) &&
      !params.status &&
      !params.query &&
      (!params.sort || params.sort === "createdAt") &&
      (!params.direction || params.direction === "desc");
    const { lastMyNotesFetchedAt } = useNotesStore.getState();
    if (
      isDefaultQuery &&
      lastMyNotesFetchedAt !== null &&
      Date.now() - lastMyNotesFetchedAt < 60_000
    ) {
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const res = await getMyNotes(params);
      const notes = res.notes || [];
      set((state) => ({
        myNotes: notes,
        myNotesPagination: res.pagination || null,
        myNotesCounts: res.counts || null,
        isLoading: false,
        lastMyNotesFetchedAt: isDefaultQuery
          ? Date.now()
          : state.lastMyNotesFetchedAt,
      }));
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
        lastMyNotesFetchedAt: null,
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
        lastMyNotesFetchedAt: null,
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
        lastMyNotesFetchedAt: null,
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
