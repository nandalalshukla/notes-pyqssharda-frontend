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
} from "@/lib/api/admin.api";

interface User {
  _id: string; // Backend uses _id
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  contributions: number;
  createdAt: string;
}

interface ModRequest {
  userId: User;
  contactNo: string;
  modMotivation: string;
  modRequestAt: string;
  status: "pending" | "approved" | "rejected";
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
    action: "approve" | "reject"
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
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Failed to fetch users" });
    }
  },

  fetchMods: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getAllMods();
      set({ mods: res.mods, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Failed to fetch mods" });
    }
  },

  fetchModRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getModRequests();
      // Assuming response structure, adjust based on actual API return
      set({ modRequests: res.requests || [], isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || "Failed to fetch requests",
      });
    }
  },

  deactivateUser: async (userId: string) => {
    try {
      await deactivateUser(userId);
      // Optimistic update
      const updatedUsers = get().users.map((u) =>
        u._id === userId ? { ...u, isActive: false } : u
      );
      set({ users: updatedUsers });
    } catch (err: any) {
      console.error("Failed to deactivate user", err);
    }
  },

  activateUser: async (userId: string) => {
    try {
      await activateUser(userId);
      const updatedUsers = get().users.map((u) =>
        u._id === userId ? { ...u, isActive: true } : u
      );
      set({ users: updatedUsers });
    } catch (err: any) {
      console.error("Failed to activate user", err);
    }
  },

  deleteUser: async (userId: string) => {
    try {
      await deleteUser(userId);
      const updatedUsers = get().users.filter((u) => u._id !== userId);
      set({ users: updatedUsers });
    } catch (err: any) {
      console.error("Failed to delete user", err);
    }
  },

  processModRequest: async (userId: string, action) => {
    try {
      await reviewModRequest(userId, action);
      // Check if backend returns the _id of the request or the user.
      // Here assuming we remove by User ID from the request list locally
      const updatedRequests = get().modRequests.filter(
        (req) => req.userId._id !== userId
      );
      set({ modRequests: updatedRequests });

      // Refresh mods list if approved
      if (action === "approve") {
        get().fetchMods();
      }
    } catch (err: any) {
      console.error("Failed to process request", err);
    }
  },
}));
