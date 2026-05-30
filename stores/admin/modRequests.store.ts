import { create } from "zustand";
import { getModRequests, reviewModRequest } from "@/lib/api/admin/admin.api";
import { getErrorMessage } from "@/lib/utils/errorHandler";

export interface ModRequest {
  _id: string;
  name: string;
  email: string;
  contactNo: string;
  modMotivation: string;
  modRequestAt: string;
  role: string;
  isActive: boolean;
  contributions: number;
}

const cacheTtlMs = 60_000;

interface ModRequestsState {
  entities: Record<string, ModRequest>;
  ids: string[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  pendingActions: Record<string, "approve" | "reject">;
  fetchModRequests: (options?: { force?: boolean }) => Promise<void>;
  processModRequest: (
    userId: string,
    action: "approve" | "reject",
  ) => Promise<void>;
}

const normalizeRequests = (requests: ModRequest[]) => {
  const entities: Record<string, ModRequest> = {};
  const ids: string[] = [];

  requests.forEach((req) => {
    entities[req._id] = req;
    ids.push(req._id);
  });

  return { entities, ids };
};

export const useAdminModRequestsStore = create<ModRequestsState>(
  (set, get) => ({
    entities: {},
    ids: [],
    isLoading: false,
    error: null,
    lastFetchedAt: null,
    pendingActions: {},

    fetchModRequests: async (options) => {
      const { lastFetchedAt, ids } = get();
      const shouldUseCache =
        !options?.force &&
        lastFetchedAt !== null &&
        Date.now() - lastFetchedAt < cacheTtlMs &&
        ids.length > 0;

      if (shouldUseCache) return;

      set({ isLoading: true, error: null });
      try {
        const res = await getModRequests();
        const normalized = normalizeRequests(res.mods || []);
        set({
          ...normalized,
          isLoading: false,
          lastFetchedAt: Date.now(),
        });
      } catch (error) {
        set({ isLoading: false, error: getErrorMessage(error) });
      }
    },

    processModRequest: async (userId, action) => {
      if (get().pendingActions[userId]) return;

      const previous = get().entities[userId];
      const previousIds = get().ids;
      if (!previous) return;

      set((state) => ({
        entities: Object.fromEntries(
          Object.entries(state.entities).filter(([id]) => id !== userId),
        ),
        ids: state.ids.filter((id) => id !== userId),
        pendingActions: { ...state.pendingActions, [userId]: action },
      }));

      try {
        await reviewModRequest(userId, action);
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
            Object.entries(state.pendingActions).filter(
              ([id]) => id !== userId,
            ),
          ),
        }));
        throw error;
      }
    },
  }),
);
