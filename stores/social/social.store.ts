import { create } from "zustand";
import {
  Post,
  Comment,
  Notification,
  User,
  FollowStats,
  getFeed,
  createPost,
  editPost,
  deletePost,
  getComments,
  createComment,
  editComment,
  deleteComment,
  toggleLike,
  toggleFollow,
  getFollowers,
  getFollowing,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api/social/social.api";
import { getErrorMessage } from "@/lib/utils/errorHandler";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

interface PostsState {
  feed: Post[];
  userPosts: Map<string, Post[]>;
  feedPage: number;
  feedTotalPages: number;
  isLoadingFeed: boolean;
}

interface CommentsState {
  comments: Map<string, Comment[]>;
  isLoadingComments: Map<string, boolean>;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  notificationsPage: number;
  notificationsTotalPages: number;
  isLoadingNotifications: boolean;
}

interface FollowState {
  followStats: Map<string, FollowStats>;
  followers: Map<string, User[]>;
  following: Map<string, User[]>;
  isLoadingFollowers: Map<string, boolean>;
  isLoadingFollowing: Map<string, boolean>;
}

interface SocialStore
  extends PostsState, CommentsState, NotificationsState, FollowState {
  isLoading: boolean;
  error: string | null;

  // Posts actions
  fetchFeed: (page?: number) => Promise<void>;
  createNewPost: (data: FormData) => Promise<void>;
  updatePost: (postId: string, data: FormData) => Promise<void>;
  removePost: (postId: string) => Promise<void>;

  // Comments actions
  fetchPostComments: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  updateComment: (
    postId: string,
    commentId: string,
    text: string,
  ) => Promise<void>;
  removeComment: (postId: string, commentId: string) => Promise<void>;

  // Likes actions
  togglePostLike: (postId: string) => Promise<void>;
  toggleCommentLike: (commentId: string) => Promise<void>;

  // Follow actions
  toggleUserFollow: (userId: string) => Promise<void>;
  fetchUserFollowers: (userId: string, page?: number) => Promise<void>;
  fetchUserFollowing: (userId: string, page?: number) => Promise<void>;

  // Notifications actions
  fetchNotifications: (page?: number, read?: "true" | "false") => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markOneAsRead: (notificationId: string) => Promise<void>;

  // Utility actions
  clearError: () => void;
  resetStore: () => void;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * INITIAL STATE
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const initialState: Omit<
  SocialStore,
  keyof {
    fetchFeed: any;
    createNewPost: any;
    updatePost: any;
    removePost: any;
    fetchPostComments: any;
    addComment: any;
    updateComment: any;
    removeComment: any;
    togglePostLike: any;
    toggleCommentLike: any;
    toggleUserFollow: any;
    fetchUserFollowers: any;
    fetchUserFollowing: any;
    fetchNotifications: any;
    markAllAsRead: any;
    markOneAsRead: any;
    clearError: any;
    resetStore: any;
  }
> = {
  // Posts
  feed: [],
  userPosts: new Map(),
  feedPage: 1,
  feedTotalPages: 0,
  isLoadingFeed: false,

  // Comments
  comments: new Map(),
  isLoadingComments: new Map(),

  // Notifications
  notifications: [],
  unreadCount: 0,
  notificationsPage: 1,
  notificationsTotalPages: 0,
  isLoadingNotifications: false,

  // Follow
  followStats: new Map(),
  followers: new Map(),
  following: new Map(),
  isLoadingFollowers: new Map(),
  isLoadingFollowing: new Map(),

  // General
  isLoading: false,
  error: null,
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ZUSTAND STORE
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const useSocialStore = create<SocialStore>((set, get) => ({
  ...initialState,

  /**
   * ───────────────────────────────────────────────────────────────────────────────
   * POSTS MANAGEMENT
   * ───────────────────────────────────────────────────────────────────────────────
   */

  fetchFeed: async (page = 1) => {
    set({ isLoadingFeed: true, error: null });
    try {
      const res = await getFeed(page, 10);
      set({
        feed: res.data?.data || [],
        feedPage: page,
        feedTotalPages: res.data?.totalPages || 0,
        isLoadingFeed: false,
      });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to fetch feed",
        isLoadingFeed: false,
      });
    }
  },

  createNewPost: async (data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createPost(data);
      const newPost = res.data?.post;
      if (newPost) {
        set((state) => ({
          feed: [newPost, ...state.feed],
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to create post",
        isLoading: false,
      });
      throw error;
    }
  },

  updatePost: async (postId: string, data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await editPost(postId, data);
      const updatedPost = res.data?.post;
      if (updatedPost) {
        set((state) => ({
          feed: state.feed.map((p) => (p._id === postId ? updatedPost : p)),
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to update post",
        isLoading: false,
      });
      throw error;
    }
  },

  removePost: async (postId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deletePost(postId);
      set((state) => ({
        feed: state.feed.filter((p) => p._id !== postId),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to delete post",
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * ───────────────────────────────────────────────────────────────────────────────
   * COMMENTS MANAGEMENT
   * ───────────────────────────────────────────────────────────────────────────────
   */

  fetchPostComments: async (postId: string) => {
    set((state) => ({
      isLoadingComments: new Map(state.isLoadingComments).set(postId, true),
      error: null,
    }));
    try {
      const res = await getComments(postId);
      const commentsArray = res.data?.comments || [];
      set((state) => ({
        comments: new Map(state.comments).set(postId, commentsArray),
        isLoadingComments: new Map(state.isLoadingComments).set(postId, false),
      }));
    } catch (error: unknown) {
      set((state) => ({
        error: getErrorMessage(error) || "Failed to fetch comments",
        isLoadingComments: new Map(state.isLoadingComments).set(postId, false),
      }));
    }
  },

  addComment: async (postId: string, text: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createComment(postId, text);
      const newComment = res.data?.comment;
      if (newComment) {
        set((state) => {
          const postComments = state.comments.get(postId) || [];
          return {
            comments: new Map(state.comments).set(postId, [
              newComment,
              ...postComments,
            ]),
            isLoading: false,
          };
        });
      }
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to add comment",
        isLoading: false,
      });
      throw error;
    }
  },

  updateComment: async (postId: string, commentId: string, text: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await editComment(postId, commentId, text);
      const updatedComment = res.data?.comment;
      if (updatedComment) {
        set((state) => {
          const postComments = state.comments.get(postId) || [];
          return {
            comments: new Map(state.comments).set(
              postId,
              postComments.map((c) =>
                c._id === commentId ? updatedComment : c,
              ),
            ),
            isLoading: false,
          };
        });
      }
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to update comment",
        isLoading: false,
      });
      throw error;
    }
  },

  removeComment: async (postId: string, commentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteComment(postId, commentId);
      set((state) => {
        const postComments = state.comments.get(postId) || [];
        return {
          comments: new Map(state.comments).set(
            postId,
            postComments.filter((c) => c._id !== commentId),
          ),
          isLoading: false,
        };
      });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to delete comment",
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * ───────────────────────────────────────────────────────────────────────────────
   * LIKES MANAGEMENT
   * ───────────────────────────────────────────────────────────────────────────────
   */

  togglePostLike: async (postId: string) => {
    set({ error: null });
    try {
      console.log("🔵 [togglePostLike] Starting for post:", postId);
      const res = await toggleLike(postId, "post");
      console.log("🟢 [togglePostLike] API Response received:", res);
      console.log("🟢 [togglePostLike] Response structure:", {
        hasData: !!res.data,
        dataKeys: res.data ? Object.keys(res.data) : [],
        dataValue: res.data,
      });

      const isLiked = res.data?.liked;
      const actualLikeCount = res.data?.likeCount;

      console.log("🟡 [togglePostLike] Extracted values:", {
        isLiked,
        actualLikeCount,
        resDataLiked: res.data?.liked,
        resDataLikeCount: res.data?.likeCount,
      });

      // Update store with ACTUAL like count from API response, not calculated
      set((state) => {
        const currentPost = state.feed.find((p) => p._id === postId);
        const likeCount = actualLikeCount ?? currentPost?.likes ?? 0;

        console.log("🟣 [togglePostLike] Store update:", {
          postId,
          newIsLiked: isLiked || false,
          newLikeCount: likeCount,
        });

        return {
          feed: state.feed.map((p) => {
            if (p._id === postId) {
              return {
                ...p,
                likedByCurrentUser: isLiked || false,
                likes: likeCount,
              };
            }
            return p;
          }),
        };
      });
    } catch (error: any) {
      console.error("❌ [togglePostLike] Error:", error);
      console.error(
        "❌ [togglePostLike] Error response:",
        error?.response?.data,
      );

      // Handle "Already liked" error - sync with backend state
      const errorStatus = error?.response?.status;
      const errorMsg = error?.response?.data?.message;

      if (errorStatus === 409 && errorMsg === "Already liked") {
        // The post IS already liked (backend confirmed it)
        // MUST REFETCH to get actual state from backend
        const state = get();
        await state.fetchFeed(state.feedPage);
        throw error;
      }

      set({
        error: getErrorMessage(error) || "Failed to toggle like",
      });
      throw error;
    }
  },

  toggleCommentLike: async (commentId: string) => {
    set({ error: null });
    try {
      const res = await toggleLike(commentId, "comment");
      const isLiked = res.data?.liked;
      const actualLikeCount = res.data?.likeCount;

      set((state) => {
        // Find current comment to use as fallback
        let currentCommentLikes = 0;
        for (const comments of state.comments.values()) {
          const current = comments.find((c) => c._id === commentId);
          if (current) {
            currentCommentLikes = current.likes;
            break;
          }
        }
        const likeCount = actualLikeCount ?? currentCommentLikes ?? 0;

        const updatedComments = new Map(state.comments);
        for (const [postId, comments] of updatedComments.entries()) {
          updatedComments.set(
            postId,
            comments.map((c) => {
              if (c._id === commentId) {
                return {
                  ...c,
                  likedByCurrentUser: isLiked || false,
                  likes: likeCount,
                };
              }
              return c;
            }),
          );
        }
        return { comments: updatedComments };
      });
    } catch (error: any) {
      // Handle "Already liked" error - sync with backend state
      const errorStatus = error?.response?.status;
      const errorMsg = error?.response?.data?.message;

      if (errorStatus === 409 && errorMsg === "Already liked") {
        // The comment IS already liked (backend confirmed it)
        // Refetch comments to get actual state
        const state = get();
        const postId = Array.from(state.comments.entries()).find(
          ([_, comments]) => comments.some((c) => c._id === commentId),
        )?.[0];
        if (postId) {
          await state.fetchPostComments(postId);
        }
        throw error;
      }

      set({
        error: getErrorMessage(error) || "Failed to toggle comment like",
      });
      throw error;
    }
  },

  /**
   * ───────────────────────────────────────────────────────────────────────────────
   * FOLLOW MANAGEMENT
   * ───────────────────────────────────────────────────────────────────────────────
   */

  toggleUserFollow: async (userId: string) => {
    set({ error: null });
    try {
      const res = await toggleFollow(userId);
      const stats = res.data?.followStats;
      if (stats) {
        set((state) => ({
          followStats: new Map(state.followStats).set(userId, stats),
        }));
      }
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to toggle follow",
      });
    }
  },

  fetchUserFollowers: async (userId: string, page = 1) => {
    set((state) => ({
      isLoadingFollowers: new Map(state.isLoadingFollowers).set(userId, true),
      error: null,
    }));
    try {
      const res = await getFollowers(userId, page, 20);
      set((state) => ({
        followers: new Map(state.followers).set(userId, res.data?.data || []),
        isLoadingFollowers: new Map(state.isLoadingFollowers).set(
          userId,
          false,
        ),
      }));
    } catch (error: unknown) {
      set((state) => ({
        error: getErrorMessage(error) || "Failed to fetch followers",
        isLoadingFollowers: new Map(state.isLoadingFollowers).set(
          userId,
          false,
        ),
      }));
    }
  },

  fetchUserFollowing: async (userId: string, page = 1) => {
    set((state) => ({
      isLoadingFollowing: new Map(state.isLoadingFollowing).set(userId, true),
      error: null,
    }));
    try {
      const res = await getFollowing(userId, page, 20);
      set((state) => ({
        following: new Map(state.following).set(userId, res.data?.data || []),
        isLoadingFollowing: new Map(state.isLoadingFollowing).set(
          userId,
          false,
        ),
      }));
    } catch (error: unknown) {
      set((state) => ({
        error: getErrorMessage(error) || "Failed to fetch following",
        isLoadingFollowing: new Map(state.isLoadingFollowing).set(
          userId,
          false,
        ),
      }));
    }
  },

  /**
   * ───────────────────────────────────────────────────────────────────────────────
   * NOTIFICATIONS MANAGEMENT
   * ───────────────────────────────────────────────────────────────────────────────
   */

  fetchNotifications: async (page = 1, read?: "true" | "false") => {
    set({ isLoadingNotifications: true, error: null });
    try {
      const res = await getNotifications(page, 20, read);
      const unreadCount = res.data?.data?.filter((n) => !n.read).length || 0;
      set({
        notifications: res.data?.data || [],
        notificationsPage: page,
        notificationsTotalPages: res.data?.totalPages || 0,
        unreadCount,
        isLoadingNotifications: false,
      });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to fetch notifications",
        isLoadingNotifications: false,
      });
    }
  },

  markAllAsRead: async () => {
    set({ error: null });
    try {
      await markAllNotificationsAsRead();
      set({
        notifications: get().notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to mark all as read",
      });
    }
  },

  markOneAsRead: async (notificationId: string) => {
    set({ error: null });
    try {
      await markNotificationAsRead(notificationId);
      set((state) => {
        const notification = state.notifications.find(
          (n) => n._id === notificationId,
        );
        return {
          notifications: state.notifications.map((n) =>
            n._id === notificationId ? { ...n, read: true } : n,
          ),
          unreadCount:
            notification && !notification.read
              ? state.unreadCount - 1
              : state.unreadCount,
        };
      });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to mark as read",
      });
    }
  },

  /**
   * ───────────────────────────────────────────────────────────────────────────────
   * UTILITY ACTIONS
   * ───────────────────────────────────────────────────────────────────────────────
   */

  clearError: () => set({ error: null }),

  resetStore: () => set(initialState),
}));
