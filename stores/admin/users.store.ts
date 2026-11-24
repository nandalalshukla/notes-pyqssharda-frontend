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
    const shouldUseCache =
      !options?.force &&
      (options.page ?? 1) === 1 &&
      !options.query &&
      options.isActive === undefined &&
      lastFetchedAt !== null &&
      Date.now() - lastFetchedAt < cacheTtlMs;

    if (shouldUseCache) return;

    set({ isLoading: true, error: null });
    try {
      const res = await getAllUsers({
        page: options.page ?? 1,
        limit: options.limit ?? 50,
        query: options.query,
        isActive: options.isActive,
      });
      const normalized = normalizeUsers(res.users || []);
      set({
        ...normalized,
        pagination: res.pagination || null,
        counts: res.counts || null,
        isLoading: false,
        lastFetchedAt: Date.now(),
      });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  deactivateUser: async (userId) => {
    if (get().pendingActions[userId]) return;

    const previous = get().entities[userId];
    if (!previous) return;

    set((state) => ({
      entities: {
        ...state.entities,
        [userId]: { ...previous, isActive: false },
      },
      pendingActions: { ...state.pendingActions, [userId]: "deactivate" },
    }));

    try {
      await deactivateUser(userId);
      set((state) => {
        const { [userId]: _, ...rest } = state.pendingActions;
        return { pendingActions: rest };
      });
    } catch (error) {
      set((state) => ({
        entities: { ...state.entities, [userId]: previous },
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
    if (!previous) return;

    set((state) => ({
      entities: {
        ...state.entities,
        [userId]: { ...previous, isActive: true },
      },
      pendingActions: { ...state.pendingActions, [userId]: "activate" },
    }));

    try {
      await activateUser(userId);
      set((state) => {
        const { [userId]: _, ...rest } = state.pendingActions;
        return { pendingActions: rest };
      });
    } catch (error) {
      set((state) => ({
        entities: { ...state.entities, [userId]: previous },
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

    set({
      entities: Object.fromEntries(
        Object.entries(entities).filter(([id]) => id !== userId),
      ),
      ids: ids.filter((id) => id !== userId),
      pendingActions: { ...get().pendingActions, [userId]: "delete" },
    });

    try {
      await deleteUser(userId);
      set((state) => {
        const { [userId]: _, ...rest } = state.pendingActions;
        return {
          pendingActions: rest,
          pagination: state.pagination
            ? { ...state.pagination, total: Math.max(0, state.pagination.total - 1) }
            : null,
          lastFetchedAt: null,
        };
      });
    } catch (error) {
      set((state) => ({
        entities: { ...state.entities, [userId]: previous },
        ids: previousIds,
        error: getErrorMessage(error),
        pendingActions: Object.fromEntries(
          Object.entries(state.pendingActions).filter(([id]) => id !== userId),
        ),
      }));
      throw error;
    }
  },
}));
