import { create } from "zustand";
import {
  getAllUsers,
  deleteUser,
  deactivateUser,
  activateUser,
  getActiveUsers,
  getInactiveUsers,
  getAllMods,
  getModRequests,
  reviewModRequest,
  removeModRole,
} from "@/lib/api/admin/admin.api";

interface User {
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

interface ModRequest {
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

interface AdminState {
  users: User[];
  mods: User[];
  activeUsers: User[];
  inactiveUsers: User[];
  modRequests: ModRequest[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  fetchActiveUsers: () => Promise<void>;
  fetchInactiveUsers: () => Promise<void>;
  deactivateUser: (userId: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  fetchMods: () => Promise<void>;
  fetchModRequests: () => Promise<void>;
  processModRequest: (
    userId: string,
    action: "approve" | "reject",
  ) => Promise<void>;
  removeModRole: (userId: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  mods: [],
  activeUsers: [],
  inactiveUsers: [],
  modRequests: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getAllUsers();
      set({ users: res.users, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch users";
      set({ isLoading: false, error: message });
    }
  },

  fetchActiveUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getActiveUsers();
      set({ activeUsers: res.users || [], isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch active users";
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  fetchInactiveUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getInactiveUsers();
      set({ inactiveUsers: res.users || [], isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch inactive users";
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  fetchMods: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getAllMods();
      set({ mods: res.mods, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch mods";
      set({ isLoading: false, error: message });
    }
  },

  fetchModRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getModRequests();
      // Backend returns { success: true, mods: [...] } for mod requests
      set({ modRequests: res.mods || [], isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch requests";
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  deactivateUser: async (userId: string) => {
    try {
      await deactivateUser(userId);
      const updatedUsers = get().users.map((u) =>
        u._id === userId ? { ...u, isActive: false } : u,
      );
      set({ users: updatedUsers });
    } catch (err: unknown) {
      console.error("Failed to deactivate user", err);
      throw err;
    }
  },

  activateUser: async (userId: string) => {
    try {
      await activateUser(userId);
      const updatedUsers = get().users.map((u) =>
        u._id === userId ? { ...u, isActive: true } : u,
      );
      set({ users: updatedUsers });
    } catch (err: unknown) {
      console.error("Failed to activate user", err);
      throw err;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      await deleteUser(userId);
      const updatedUsers = get().users.filter((u) => u._id !== userId);
      set({ users: updatedUsers });
    } catch (err: unknown) {
      console.error("Failed to delete user", err);
      throw err;
    }
  },

  processModRequest: async (userId: string, action) => {
    try {
      await reviewModRequest(userId, action);
      const updatedRequests = get().modRequests.filter(
        (req) => req._id !== userId,
      );
      set({ modRequests: updatedRequests });

      if (action === "approve") {
        get().fetchMods();
      }
    } catch (err: unknown) {
      console.error("Failed to process request", err);
      throw err;
    }
  },

  removeModRole: async (userId: string) => {
    try {
      await removeModRole(userId);
      const updatedMods = get().mods.filter((m) => m._id !== userId);
      set({ mods: updatedMods });
    } catch (err: unknown) {
      console.error("Failed to remove mod role", err);
      throw err;
    }
  },
}));
