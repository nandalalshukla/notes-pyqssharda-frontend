import { create } from "zustand";
import {
  approveNote,
  approvePyq,
  approveSyllabus,
  getPendingNotes,
  getPendingPyqs,
  getPendingSyllabus,
  rejectNote,
  rejectPyq,
  rejectSyllabus,
} from "@/lib/api/mod/mod.api";
import { getErrorMessage } from "@/lib/utils/errorHandler";

export type SubmissionType = "note" | "pyq" | "syllabus";

export interface PendingSubmission {
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

const cacheTtlMs = 60_000;

interface SubmissionsState {
  entities: Record<SubmissionType, Record<string, PendingSubmission>>;
  ids: Record<SubmissionType, string[]>;
  isLoading: Record<SubmissionType, boolean>;
  error: Record<SubmissionType, string | null>;
  lastFetchedAt: Record<SubmissionType, number | null>;
  pendingActions: Record<string, "approve" | "reject">;
  fetchPending: (
    type: SubmissionType,
    options?: { force?: boolean },
  ) => Promise<void>;
  fetchAllPending: (options?: { force?: boolean }) => Promise<void>;
  approveSubmission: (id: string, type: SubmissionType) => Promise<void>;
  rejectSubmission: (
    id: string,
    type: SubmissionType,
    reason: string,
  ) => Promise<void>;
}

const emptyEntities: Record<SubmissionType, Record<string, PendingSubmission>> = {
  note: {},
  pyq: {},
  syllabus: {},
};

const emptyIds: Record<SubmissionType, string[]> = {
  note: [],
  pyq: [],
  syllabus: [],
};

const normalizeList = (items: PendingSubmission[]) => {
  const entities: Record<string, PendingSubmission> = {};
  const ids: string[] = [];

  items.forEach((item) => {
    entities[item._id] = item;
    ids.push(item._id);
  });

  return { entities, ids };
};

const apiByType = {
  note: {
    fetch: getPendingNotes,
    approve: approveNote,
    reject: rejectNote,
  },
  pyq: {
    fetch: getPendingPyqs,
    approve: approvePyq,
    reject: rejectPyq,
  },
  syllabus: {
    fetch: getPendingSyllabus,
    approve: approveSyllabus,
    reject: rejectSyllabus,
  },
} as const;

export const getSubmissionActionKey = (type: SubmissionType, id: string) =>
  `${type}:${id}`;

export const useModSubmissionsStore = create<SubmissionsState>((set, get) => ({
  entities: { ...emptyEntities },
  ids: { ...emptyIds },
  isLoading: { note: false, pyq: false, syllabus: false },
  error: { note: null, pyq: null, syllabus: null },
  lastFetchedAt: { note: null, pyq: null, syllabus: null },
  pendingActions: {},

  fetchPending: async (type, options) => {
    const lastFetchedAt = get().lastFetchedAt[type];
    const ids = get().ids[type];
    const shouldUseCache =
      !options?.force &&
      lastFetchedAt !== null &&
      Date.now() - lastFetchedAt < cacheTtlMs &&
      ids.length > 0;

    if (shouldUseCache) return;

    set((state) => ({
      isLoading: { ...state.isLoading, [type]: true },
      error: { ...state.error, [type]: null },
    }));

    try {
      const response: any = await apiByType[type].fetch({
        requestKey: `mod:pending:${type}`,
        cancelPrevious: true,
        dedupe: true,
      });
      const items = response.notes || response.pyqs || response.syllabus || [];
      const normalized = normalizeList(items);

      set((state) => ({
        entities: { ...state.entities, [type]: normalized.entities },
        ids: { ...state.ids, [type]: normalized.ids },
        isLoading: { ...state.isLoading, [type]: false },
        lastFetchedAt: { ...state.lastFetchedAt, [type]: Date.now() },
      }));
    } catch (error) {
      set((state) => ({
        isLoading: { ...state.isLoading, [type]: false },
        error: { ...state.error, [type]: getErrorMessage(error) },
      }));
    }
  },

  fetchAllPending: async (options) => {
    await Promise.all([
      get().fetchPending("note", options),
      get().fetchPending("pyq", options),
      get().fetchPending("syllabus", options),
    ]);
  },

  approveSubmission: async (id, type) => {
    const actionKey = getSubmissionActionKey(type, id);
    if (get().pendingActions[actionKey]) return;

    const previous = get().entities[type][id];
    const previousIds = get().ids[type];
    if (!previous) return;

    set((state) => ({
      entities: {
        ...state.entities,
        [type]: Object.fromEntries(
          Object.entries(state.entities[type]).filter(
            ([itemId]) => itemId !== id,
          ),
        ),
      },
      ids: {
        ...state.ids,
        [type]: state.ids[type].filter((itemId) => itemId !== id),
      },
      pendingActions: { ...state.pendingActions, [actionKey]: "approve" },
    }));

    try {
      await apiByType[type].approve(id);
      set((state) => {
        const { [actionKey]: _, ...rest } = state.pendingActions;
        return { pendingActions: rest };
      });
    } catch (error) {
      set((state) => ({
        entities: {
          ...state.entities,
          [type]: { ...state.entities[type], [id]: previous },
        },
        ids: { ...state.ids, [type]: previousIds },
        error: { ...state.error, [type]: getErrorMessage(error) },
        pendingActions: Object.fromEntries(
          Object.entries(state.pendingActions).filter(
            ([key]) => key !== actionKey,
          ),
        ),
      }));
      throw error;
    }
  },

  rejectSubmission: async (id, type, reason) => {
    if (!reason.trim()) {
      throw new Error("Rejection reason is required");
    }

    const actionKey = getSubmissionActionKey(type, id);
    if (get().pendingActions[actionKey]) return;

    const previous = get().entities[type][id];
    const previousIds = get().ids[type];
    if (!previous) return;

    set((state) => ({
      entities: {
        ...state.entities,
        [type]: Object.fromEntries(
          Object.entries(state.entities[type]).filter(
            ([itemId]) => itemId !== id,
          ),
        ),
      },
      ids: {
        ...state.ids,
        [type]: state.ids[type].filter((itemId) => itemId !== id),
      },
      pendingActions: { ...state.pendingActions, [actionKey]: "reject" },
    }));

    try {
      await apiByType[type].reject(id, reason);
      set((state) => {
        const { [actionKey]: _, ...rest } = state.pendingActions;
        return { pendingActions: rest };
      });
    } catch (error) {
      set((state) => ({
        entities: {
          ...state.entities,
          [type]: { ...state.entities[type], [id]: previous },
        },
        ids: { ...state.ids, [type]: previousIds },
        error: { ...state.error, [type]: getErrorMessage(error) },
        pendingActions: Object.fromEntries(
          Object.entries(state.pendingActions).filter(
            ([key]) => key !== actionKey,
          ),
        ),
      }));
      throw error;
    }
  },
}));


