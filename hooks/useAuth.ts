/**
 * useAuth Hook
 * Custom hook for authentication operations
 */

import { useAuthStore } from "@/stores";
import { useCallback } from "react";

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    authLoading,
    login,
    logout,
    logoutAll,
    fetchMe,
    setAuthLoading,
  } = useAuthStore();

  const handleLogin = useCallback(
    async (data: { email: string; password: string }) => {
      try {
        await login(data);
        return true;
      } catch {
        return false;
      }
    },
    [login],
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleLogoutAll = useCallback(async () => {
    await logoutAll();
  }, [logoutAll]);

  const handleFetchCurrentUser = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  return {
    // State
    user,
    isAuthenticated,
    authLoading,

    // Handlers
    handleLogin,
    handleLogout,
    handleLogoutAll,
    handleFetchCurrentUser,
    setAuthLoading,
  };
};
