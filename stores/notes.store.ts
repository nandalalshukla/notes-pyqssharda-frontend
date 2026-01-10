import { create } from "zustand";
import {
  Note,
  getMyNotes,
  getAllNotes,
  searchNotes as searchNotesApi,
  createNote,
  updateNote,
  deleteNote,
} from "@/lib/api/crud.api";

interface NotesStore {
  myNotes: Note[];
  allNotes: Note[];
  isLoading: boolean;
  error: string | null;

  fetchNotes: () => Promise<void>; // user-specific notes
  fetchAllNotes: () => Promise<void>; // public/admin notes
  searchNotes: (query: string) => Promise<void>;

  addNote: (data: FormData) => Promise<void>;
  editNote: (id: string, data: FormData) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesStore>((set) => ({
  myNotes: [],
  allNotes: [],
  isLoading: false,
  error: null,

  /* ---------------- FETCH MY NOTES ---------------- */
  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getMyNotes();
      const notes = res.notes;
      console.log("notes",notes);
      set({ myNotes: notes, isLoading: false });
    } catch (err) {
      set({ myNotes: [], isLoading: false, error: String(err) });
    }
  },

  /* ---------------- FETCH ALL NOTES ---------------- */
  fetchAllNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getAllNotes();
      const notes = res.notes || [];
      set({ allNotes: notes, isLoading: false });
    } catch (err) {
      set({ allNotes: [], isLoading: false, error: String(err) });
    }
  },

  /* ---------------- SEARCH NOTES ---------------- */
  searchNotes: async (query: string) => {
    if (!query.trim()) return;

    set({ isLoading: true, error: null });
    try {
      const res = await searchNotesApi(query);
      const notes = res.notes || [];

      set({
        allNotes: notes,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: String(err) });
    }
  },

  /* ---------------- ADD NOTE ---------------- */
  addNote: async (data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createNote(data);
      const note = res.note;

      set((state) => ({
        myNotes: [note, ...state.myNotes],
        isLoading: false,
        allNotes: [note, ...state.allNotes],
      }));
    } catch (err) {
      set({ isLoading: false, error: String(err) });
      throw err;
    }
  },

  /* ---------------- EDIT NOTE ---------------- */
  editNote: async (id: string, data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await updateNote(id, data);
      const updatedNote = res.note;

      set((state) => ({
        myNotes: state.myNotes.map((n) => (n._id === id ? updatedNote : n)),
        isLoading: false,
      }));
    } catch (err) {
      set({ isLoading: false, error: String(err) });
      throw err;
    }
  },

  /* ---------------- DELETE NOTE ---------------- */
  removeNote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteNote(id);
      set((state) => ({
        myNotes: state.myNotes.filter((n) => n._id !== id),
        allNotes: state.allNotes.filter((n) => n._id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({ isLoading: false, error: String(err) });
      throw err;
    }
  },
}));
