import { create } from "zustand";
import {
  login as loginApi,
  logout as logoutApi,
  getMe,
} from "@/lib/api/auth.api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;

  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  authLoading: true, // important

  login: async (data) => {
    const res = await loginApi(data);
    set({
      user: res.data.user,
      isAuthenticated: true,
      authLoading: false,
    });
  },

  logout: async () => {
    await logoutApi();
    set({
      user: null,
      isAuthenticated: false,
      authLoading: false,
    });
  },

  fetchMe: async () => {
    try {
      const res = await getMe();
      set({
        user: res.data.user,
        isAuthenticated: true,
        authLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        authLoading: false,
      });
    }
  },
}));

export default useAuthStore;
