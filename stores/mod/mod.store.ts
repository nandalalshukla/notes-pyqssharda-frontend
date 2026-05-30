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
} from "@/lib/api/mod/mod.api";
import { toast } from "react-hot-toast";

// Simplified generic interface for pending items
interface PendingItem {
  _id: string;
  title: string;
  courseCode?: string;
  courseName?: string;
  program?: string;
  semester?: string | number;
  year?: string;
  fileUrl?: string;
  userId?: {
    _id: string;
    name?: string;
    username?: string;
    email?: string;
  };
  createdAt?: string;
  status?: string;
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
  rejectItem: (
    id: string,
    type: "note" | "pyq" | "syllabus",
    rejectionReason: string,
  ) => Promise<void>;
}

type PendingNotesResponse = { notes?: PendingItem[] };
type PendingPyqsResponse = { pyqs?: PendingItem[] };
type PendingSyllabusResponse = { syllabus?: PendingItem[] };

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
        getPendingNotes().catch((err) => {
          console.error("Error fetching pending notes:", err);
          return { notes: [] };
        }) as Promise<PendingNotesResponse>,
        getPendingPyqs().catch((err) => {
          console.error("Error fetching pending pyqs:", err);
          return { pyqs: [] };
        }) as Promise<PendingPyqsResponse>,
        getPendingSyllabus().catch((err) => {
          console.error("Error fetching pending syllabus:", err);
          return { syllabus: [] };
        }) as Promise<PendingSyllabusResponse>,
      ]);

      set({
        pendingNotes: notesRes.notes || [],
        pendingPyqs: pyqsRes.pyqs || [],
        pendingSyllabus: syllabusRes.syllabus || [],
        isLoading: false,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch pending content";
      set({
        isLoading: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
    }
  },

  approveItem: async (id, type) => {
    set({ error: null });
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
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to approve ${type}`;
      set({ error: errorMessage });
      console.error(`Failed to approve ${type}`, err);
      throw new Error(errorMessage);
    }
  },

  rejectItem: async (id, type, rejectionReason) => {
    set({ error: null });
    try {
      if (!rejectionReason || rejectionReason.trim() === "") {
        throw new Error("Rejection reason is required");
      }

      if (type === "note") {
        await rejectNote(id, rejectionReason);
        set((s) => ({
          pendingNotes: s.pendingNotes.filter((i) => i._id !== id),
        }));
      } else if (type === "pyq") {
        await rejectPyq(id, rejectionReason);
        set((s) => ({
          pendingPyqs: s.pendingPyqs.filter((i) => i._id !== id),
        }));
      } else if (type === "syllabus") {
        await rejectSyllabus(id, rejectionReason);
        set((s) => ({
          pendingSyllabus: s.pendingSyllabus.filter((i) => i._id !== id),
        }));
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to reject ${type}`;
      set({ error: errorMessage });
      console.error(`Failed to reject ${type}`, err);
      throw new Error(errorMessage);
    }
  },
}));
