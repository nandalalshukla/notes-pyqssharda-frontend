import { useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";

/**
 * Custom hook for social features
 * Provides memoized callbacks to interact with social store
 */
export const useSocial = () => {
  const store = useSocialStore();

  // Posts handlers
  const handleFetchFeed = useCallback(
    (page?: number) => store.fetchFeed(page),
    [store],
  );

  const handleCreatePost = useCallback(
    (data: FormData) => store.createNewPost(data),
    [store],
  );

  const handleUpdatePost = useCallback(
    (postId: string, data: FormData) => store.updatePost(postId, data),
    [store],
  );

  const handleDeletePost = useCallback(
    (postId: string) => store.removePost(postId),
    [store],
  );

  // Comments handlers
  const handleFetchComments = useCallback(
    (postId: string) => store.fetchPostComments(postId),
    [store],
  );

  const handleCreateComment = useCallback(
    (postId: string, text: string) => store.addComment(postId, text),
    [store],
  );

  const handleUpdateComment = useCallback(
    (postId: string, commentId: string, text: string) =>
      store.updateComment(postId, commentId, text),
    [store],
  );

  const handleDeleteComment = useCallback(
    (postId: string, commentId: string) =>
      store.removeComment(postId, commentId),
    [store],
  );

  // Likes handlers
  const handleTogglePostLike = useCallback(
    (postId: string) => store.togglePostLike(postId),
    [store],
  );

  const handleToggleCommentLike = useCallback(
    (commentId: string) => store.toggleCommentLike(commentId),
    [store],
  );

  // Follow handlers
  const handleToggleFollow = useCallback(
    (userId: string) => store.toggleUserFollow(userId),
    [store],
  );

  const handleFetchFollowers = useCallback(
    (userId: string, page?: number) => store.fetchUserFollowers(userId, page),
    [store],
  );

  const handleFetchFollowing = useCallback(
    (userId: string, page?: number) => store.fetchUserFollowing(userId, page),
    [store],
  );

  // Notifications handlers
  const handleFetchNotifications = useCallback(
    (page?: number, read?: "true" | "false") =>
      store.fetchNotifications(page, read),
    [store],
  );

  const handleMarkAllNotificationsRead = useCallback(
    () => store.markAllAsRead(),
    [store],
  );

  const handleMarkNotificationRead = useCallback(
    (notificationId: string) => store.markOneAsRead(notificationId),
    [store],
  );

  return {
    // State
    feed: store.feed,
    feedPage: store.feedPage,
    feedTotalPages: store.feedTotalPages,
    isLoadingFeed: store.isLoadingFeed,
    comments: store.comments,
    isLoadingComments: store.isLoadingComments,
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    notificationsPage: store.notificationsPage,
    notificationsTotalPages: store.notificationsTotalPages,
    isLoadingNotifications: store.isLoadingNotifications,
    followStats: store.followStats,
    followers: store.followers,
    following: store.following,
    isLoadingFollowers: store.isLoadingFollowers,
    isLoadingFollowing: store.isLoadingFollowing,
    isLoading: store.isLoading,
    error: store.error,

    // Posts handlers
    handleFetchFeed,
    handleCreatePost,
    handleUpdatePost,
    handleDeletePost,

    // Comments handlers
    handleFetchComments,
    handleCreateComment,
    handleUpdateComment,
    handleDeleteComment,

    // Likes handlers
    handleTogglePostLike,
    handleToggleCommentLike,

    // Follow handlers
    handleToggleFollow,
    handleFetchFollowers,
    handleFetchFollowing,

    // Notifications handlers
    handleFetchNotifications,
    handleMarkAllNotificationsRead,
    handleMarkNotificationRead,

    // Utility
    clearError: store.clearError,
    resetStore: store.resetStore,
  };
};
