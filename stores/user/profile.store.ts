import { create } from "zustand";
import {
  updateProfile as updateProfileAPI,
  removeProfilePic as removeProfilePicAPI,
  deactivateAccount as deactivateAccountAPI,
  deleteAccount as deleteAccountAPI,
  User,
} from "@/lib/api/user/user.api";
import { toast } from "react-hot-toast";
import useAuthStore from "./authStore";
import { getErrorMessage } from "@/lib/utils/errorHandler";

interface ProfileState {
  // State
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Profile operations
  updateProfile: (data: {
    name?: string;
    bio?: string;
    course?: string;
    contactNo?: string;
    profilePic?: File;
  }) => Promise<void>;

  removeProfilePic: () => Promise<void>;

  // Account operations
  deactivateAccount: () => Promise<void>;
  deleteAccount: () => Promise<void>;

  // Utility
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  clearError: () => set({ error: null }),

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateProfileAPI(data);
      const updatedUser = response.data.user;
      set({ user: updatedUser, isLoading: false });
      // Sync with auth store
      useAuthStore.setState({ user: updatedUser });
      toast.success(response.message || "Profile updated successfully");
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error) || "Failed to update profile";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  removeProfilePic: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await removeProfilePicAPI();
      const updatedUser = response.data.user;
      set({ user: updatedUser, isLoading: false });
      // Sync with auth store
      useAuthStore.setState({ user: updatedUser });
      toast.success(response.message || "Profile picture removed");
    } catch (error: unknown) {
      const errorMessage =
        getErrorMessage(error) || "Failed to remove profile picture";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deactivateAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await deactivateAccountAPI();
      set({ user: null, isLoading: false });
      // Sync with auth store
      useAuthStore.setState({ user: null, isAuthenticated: false });
      toast.success("Account deactivated successfully");
    } catch (error: unknown) {
      const errorMessage =
        getErrorMessage(error) || "Failed to deactivate account";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await deleteAccountAPI();
      set({ user: null, isLoading: false });
      // Sync with auth store
      useAuthStore.setState({ user: null, isAuthenticated: false });
      toast.success("Account deleted successfully");
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error) || "Failed to delete account";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },
}));
