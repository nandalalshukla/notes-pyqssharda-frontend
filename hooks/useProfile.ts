import { useCallback, useMemo } from "react";
import { useProfileStore } from "@/stores/user/profile.store";
import useAuthStore from "@/stores/user/authStore";

/**
 * Custom hook for profile management operations
 * Provides memoized callback wrappers around the profile store
 */
export const useProfile = () => {
  const authUser = useAuthStore((state) => state.user);
  
  const {
    user: profileUser,
    isLoading,
    error,
    updateProfile: updateProfileStore,
    removeProfilePic: removeProfilePicStore,
    deactivateAccount: deactivateAccountStore,
    deleteAccount: deleteAccountStore,
    setUser,
    clearError,
  } = useProfileStore();

  // Use auth user if profile user is not set
  const user = useMemo(() => profileUser || authUser, [profileUser, authUser]);

  // Profile update with optional file
  const updateProfile = useCallback(
    async (data: {
      name?: string;
      bio?: string;
      course?: string;
      contactNo?: string;
      profilePic?: File;
      showEmail?: boolean;
      showContactNo?: boolean;
      showCourse?: boolean;
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
