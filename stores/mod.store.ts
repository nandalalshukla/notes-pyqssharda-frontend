import { create } from "zustand";
import {
  getPendingNotes,
  getPendingPyqs,
  getPendingSyllabus,
  approveNote,
  rejectNote,
  approvePyq,
  rejectPyq,
  approveSyllabus,
  rejectSyllabus,
} from "@/lib/api/mod.api";

// Reusing types from crud.api.ts but adding 'user' field if populated by backend
interface Note {
  _id: string;
  title: string;
  // ... add fields as needed
  user?: { name: string; email: string };
  createdAt?: string;
}

// Simplified generic interface for pending items
interface PendingItem {
  _id: string;
  title: string;
  type: "note" | "pyq" | "syllabus";
  [key: string]: any;
}

interface ModState {
  pendingNotes: PendingItem[];
  pendingPyqs: PendingItem[];
  pendingSyllabus: PendingItem[];
  isLoading: boolean;
  error: string | null;

  fetchPendingContent: () => Promise<void>;

  approveItem: (id: string, type: "note" | "pyq" | "syllabus") => Promise<void>;
  rejectItem: (id: string, type: "note" | "pyq" | "syllabus") => Promise<void>;
}

export const useModStore = create<ModState>((set, get) => ({
  pendingNotes: [],
  pendingPyqs: [],
  pendingSyllabus: [],
  isLoading: false,
  error: null,

  fetchPendingContent: async () => {
    set({ isLoading: true, error: null });
    try {
      const [notesRes, pyqsRes, syllabusRes] = await Promise.all([
        getPendingNotes(),
        getPendingPyqs(),
        getPendingSyllabus(),
      ]);

      set({
        pendingNotes: notesRes.notes || [],
        pendingPyqs: pyqsRes.pyqs || [],
        pendingSyllabus: syllabusRes.syllabus || [],
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || "Failed to fetch pending content",
      });
    }
  },

  approveItem: async (id, type) => {
    try {
      if (type === "note") {
        await approveNote(id);
        set((s) => ({
          pendingNotes: s.pendingNotes.filter((i) => i._id !== id),
        }));
      } else if (type === "pyq") {
        await approvePyq(id);
        set((s) => ({
          pendingPyqs: s.pendingPyqs.filter((i) => i._id !== id),
        }));
      } else if (type === "syllabus") {
        await approveSyllabus(id);
        set((s) => ({
          pendingSyllabus: s.pendingSyllabus.filter((i) => i._id !== id),
        }));
      }
    } catch (err: any) {
      console.error(`Failed to approve ${type}`, err);
      // Optionally set error state
    }
  },

  rejectItem: async (id, type) => {
    try {
      if (type === "note") {
        await rejectNote(id);
        set((s) => ({
          pendingNotes: s.pendingNotes.filter((i) => i._id !== id),
        }));
      } else if (type === "pyq") {
        await rejectPyq(id);
        set((s) => ({
          pendingPyqs: s.pendingPyqs.filter((i) => i._id !== id),
        }));
      } else if (type === "syllabus") {
        await rejectSyllabus(id);
        set((s) => ({
          pendingSyllabus: s.pendingSyllabus.filter((i) => i._id !== id),
        }));
      }
    } catch (err: any) {
      console.error(`Failed to reject ${type}`, err);
    }
  },
}));
