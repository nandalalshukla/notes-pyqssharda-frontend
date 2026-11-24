import { create } from "zustand";
import {
  activateUser,
  deactivateUser,
  deleteUser,
  getAllUsers,
} from "@/lib/api/admin/admin.api";
import { getErrorMessage } from "@/lib/utils/errorHandler";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  contributions: number;
  createdAt: string;
  contactNo?: string;
  modRequest?: "pending" | "approved" | "rejected";
  modMotivation?: string;
  modRequestAt?: string;
}

const cacheTtlMs = 60_000;
let usersFetchVersion = 0;

interface UsersState {
  entities: Record<string, AdminUser>;
  ids: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
  counts: { active: number; inactive: number } | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  pendingActions: Record<string, "activate" | "deactivate" | "delete">;
  fetchUsers: (options?: {
    force?: boolean;
    page?: number;
    limit?: number;
    query?: string;
    isActive?: boolean;
  }) => Promise<void>;
  deactivateUser: (userId: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const normalizeUsers = (users: AdminUser[]) => {
  const entities: Record<string, AdminUser> = {};
  const ids: string[] = [];

  users.forEach((user) => {
    entities[user._id] = user;
    ids.push(user._id);
  });

  return { entities, ids };
};

export const useAdminUsersStore = create<UsersState>((set, get) => ({
  entities: {},
  ids: [],
  pagination: null,
  counts: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
  pendingActions: {},

  fetchUsers: async (options = {}) => {
    const { lastFetchedAt } = get();
    const isDefaultQuery =
      (options.page ?? 1) === 1 &&
      (options.limit ?? 50) === 50 &&
      !options.query &&
      options.isActive === undefined;
    const shouldUseCache =
      !options?.force &&
      isDefaultQuery &&
      lastFetchedAt !== null &&
      Date.now() - lastFetchedAt < cacheTtlMs;

    if (shouldUseCache) return;

    const requestVersion = ++usersFetchVersion;
    set((state) => ({
      isLoading: true,
      error: null,
      lastFetchedAt: isDefaultQuery ? state.lastFetchedAt : null,
    }));
    try {
      const res = await getAllUsers({
        page: options.page ?? 1,
        limit: options.limit ?? 50,
        query: options.query,
        isActive: options.isActive,
      });
      if (requestVersion !== usersFetchVersion) return;
      const normalized = normalizeUsers(res.users || []);
      set({
        ...normalized,
        pagination: res.pagination || null,
        counts: res.counts || null,
        isLoading: false,
        lastFetchedAt: isDefaultQuery ? Date.now() : null,
      });
    } catch (error) {
      if (requestVersion !== usersFetchVersion) return;
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  deactivateUser: async (userId) => {
    if (get().pendingActions[userId]) return;

    const previous = get().entities[userId];
    if (!previous || !previous.isActive) return;

    set((state) => ({
      entities: {
        ...state.entities,
        [userId]: { ...previous, isActive: false },
      },
      counts: state.counts
        ? { active: Math.max(0, state.counts.active - 1), inactive: state.counts.inactive + 1 }
        : null,
      lastFetchedAt: null,
      pendingActions: { ...state.pendingActions, [userId]: "deactivate" },
    }));

    try {
      await deactivateUser(userId);
      set((state) => {
        const { [userId]: _, ...rest } = state.pendingActions;
        return { pendingActions: rest, lastFetchedAt: null };
      });
    } catch (error) {
      set((state) => ({
        entities: { ...state.entities, [userId]: previous },
        counts: get().counts
          ? { active: get().counts!.active + 1, inactive: Math.max(0, get().counts!.inactive - 1) }
          : null,
        lastFetchedAt: null,
        error: getErrorMessage(error),
        pendingActions: Object.fromEntries(
          Object.entries(state.pendingActions).filter(([id]) => id !== userId),
        ),
      }));
      throw error;
    }
  },

  activateUser: async (userId) => {
    if (get().pendingActions[userId]) return;

    const previous = get().entities[userId];
    if (!previous || previous.isActive) return;

    set((state) => ({
      entities: {
        ...state.entities,
        [userId]: { ...previous, isActive: true },
      },
      counts: state.counts
        ? { active: state.counts.active + 1, inactive: Math.max(0, state.counts.inactive - 1) }
        : null,
      lastFetchedAt: null,
      pendingActions: { ...state.pendingActions, [userId]: "activate" },
    }));

    try {
      await activateUser(userId);
      set((state) => {
        const { [userId]: _, ...rest } = state.pendingActions;
        return { pendingActions: rest, lastFetchedAt: null };
      });
    } catch (error) {
      set((state) => ({
        entities: { ...state.entities, [userId]: previous },
        counts: get().counts
          ? { active: Math.max(0, get().counts!.active - 1), inactive: get().counts!.inactive + 1 }
          : null,
        lastFetchedAt: null,
        error: getErrorMessage(error),
        pendingActions: Object.fromEntries(
          Object.entries(state.pendingActions).filter(([id]) => id !== userId),
        ),
      }));
      throw error;
    }
  },

  deleteUser: async (userId) => {
    if (get().pendingActions[userId]) return;

    const { entities, ids } = get();
    const previous = entities[userId];
    const previousIds = ids;
    if (!previous) return;

    set((state) => ({
      entities: Object.fromEntries(
        Object.entries(state.entities).filter(([id]) => id !== userId),
      ),
      ids: state.ids.filter((id) => id !== userId),
      counts: state.counts
        ? previous.isActive
          ? { ...state.counts, active: Math.max(0, state.counts.active - 1) }
          : { ...state.counts, inactive: Math.max(0, state.counts.inactive - 1) }
        : null,
      pagination: state.pagination
        ? { ...state.pagination, total: Math.max(0, state.pagination.total - 1) }
        : null,
      lastFetchedAt: null,
      pendingActions: { ...state.pendingActions, [userId]: "delete" },
    }));

    try {
      await deleteUser(userId);
      set((state) => {
        const { [userId]: _, ...rest } = state.pendingActions;
        return {
          pendingActions: rest,
          lastFetchedAt: null,
        };
      });
    } catch (error) {
      set((state) => ({
        entities: { ...state.entities, [userId]: previous },
        ids: previousIds,
        counts: state.counts
          ? previous.isActive
            ? { ...state.counts, active: state.counts.active + 1 }
            : { ...state.counts, inactive: state.counts.inactive + 1 }
          : null,
        pagination: state.pagination
          ? { ...state.pagination, total: state.pagination.total + 1 }
          : null,
        error: getErrorMessage(error),
        pendingActions: Object.fromEntries(
          Object.entries(state.pendingActions).filter(([id]) => id !== userId),
        ),
      }));
      throw error;
    }
  },
}));
