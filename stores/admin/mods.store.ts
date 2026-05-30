import { create } from "zustand";
import { getAllMods, removeModRole } from "@/lib/api/admin/admin.api";
import { getErrorMessage } from "@/lib/utils/errorHandler";
import type { AdminUser } from "./users.store";

const cacheTtlMs = 60_000;

interface ModsState {
  entities: Record<string, AdminUser>;
  ids: string[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  pendingActions: Record<string, "remove">;
  fetchMods: (options?: { force?: boolean }) => Promise<void>;
  removeModRole: (userId: string) => Promise<void>;
}

const normalizeMods = (mods: AdminUser[]) => {
  const entities: Record<string, AdminUser> = {};
  const ids: string[] = [];

  mods.forEach((mod) => {
    entities[mod._id] = mod;
    ids.push(mod._id);
  });

  return { entities, ids };
};

export const useAdminModsStore = create<ModsState>((set, get) => ({
  entities: {},
  ids: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,
  pendingActions: {},

  fetchMods: async (options) => {
    const { lastFetchedAt, ids } = get();
    const shouldUseCache =
      !options?.force &&
      lastFetchedAt !== null &&
      Date.now() - lastFetchedAt < cacheTtlMs &&
      ids.length > 0;

    if (shouldUseCache) return;

    set({ isLoading: true, error: null });
    try {
      const res = await getAllMods();
      const normalized = normalizeMods(res.mods || []);
      set({
        ...normalized,
        isLoading: false,
        lastFetchedAt: Date.now(),
      });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  removeModRole: async (userId) => {
    if (get().pendingActions[userId]) return;

    const previous = get().entities[userId];
    const previousIds = get().ids;
    if (!previous) return;

    set((state) => ({
      entities: Object.fromEntries(
        Object.entries(state.entities).filter(([id]) => id !== userId),
      ),
      ids: state.ids.filter((id) => id !== userId),
      pendingActions: { ...state.pendingActions, [userId]: "remove" },
    }));

    try {
      await removeModRole(userId);
      set((state) => {
        const { [userId]: _, ...rest } = state.pendingActions;
        return { pendingActions: rest };
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
