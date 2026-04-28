import { useCallback } from "react";
import { useProfileStore } from "@/stores/user/profile.store";

/**
 * Custom hook for profile management operations
 * Provides memoized callback wrappers around the profile store
 */
export const useProfile = () => {
  const {
    user,
    isLoading,
    error,
    updateProfile: updateProfileStore,
    removeProfilePic: removeProfilePicStore,
    deactivateAccount: deactivateAccountStore,
    deleteAccount: deleteAccountStore,
    setUser,
    clearError,
  } = useProfileStore();

  // Profile update with optional file
  const updateProfile = useCallback(
    async (data: {
      name?: string;
      bio?: string;
      course?: string;
      contactNo?: string;
      profilePic?: File;
    }) => {
      return updateProfileStore(data);
    },
    [updateProfileStore],
  );

  // Remove profile picture
  const removeProfilePicture = useCallback(async () => {
    return removeProfilePicStore();
  }, [removeProfilePicStore]);

  // Deactivate account
  const deactivateUserAccount = useCallback(async () => {
    return deactivateAccountStore();
  }, [deactivateAccountStore]);

  // Delete account permanently
  const deleteUserAccount = useCallback(async () => {
    return deleteAccountStore();
  }, [deleteAccountStore]);

  return {
    // State
    user,
    isLoading,
    error,

    // Methods
    updateProfile,
    removeProfilePicture,
    deactivateUserAccount,
    deleteUserAccount,
    setUser,
    clearError,
  };
};
