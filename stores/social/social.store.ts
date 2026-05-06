import { create } from "zustand";
import {
  createPost,
  editPost,
  deletePost,
  getFeed,
  getComments,
  getCommentReplies,
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
  Post,
  Comment,
  FollowStats,
  Notification,
  User,
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
  replies: Map<string, Comment[]>;
  isLoadingReplies: Map<string, boolean>;
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
  addComment: (
    postId: string,
    text: string,
    parentComment?: string,
  ) => Promise<void>;
  updateComment: (
    postId: string,
    commentId: string,
    text: string,
  ) => Promise<void>;
  removeComment: (postId: string, commentId: string) => Promise<void>;
  fetchCommentReplies: (postId: string, commentId: string) => Promise<void>;

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
    fetchFeed: unknown;
    createNewPost: unknown;
    updatePost: unknown;
    removePost: unknown;
    fetchPostComments: unknown;
    addComment: unknown;
    updateComment: unknown;
    removeComment: unknown;
    fetchCommentReplies: unknown;
    togglePostLike: unknown;
    toggleCommentLike: unknown;
    toggleUserFollow: unknown;
    fetchUserFollowers: unknown;
    fetchUserFollowing: unknown;
    fetchNotifications: unknown;
    markAllAsRead: unknown;
    markOneAsRead: unknown;
    clearError: unknown;
    resetStore: unknown;
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
  replies: new Map(),
  isLoadingReplies: new Map(),

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

const updatePostEverywhere = (
  userPosts: Map<string, Post[]>,
  postId: string,
  updater: (post: Post) => Post,
) => {
  const nextUserPosts = new Map(userPosts);
  for (const [userId, posts] of nextUserPosts.entries()) {
    nextUserPosts.set(
      userId,
      posts.map((post) => (post._id === postId ? updater(post) : post)),
    );
  }
  return nextUserPosts;
};

const updateCommentEverywhere = (
  comments: Map<string, Comment[]>,
  replies: Map<string, Comment[]>,
  commentId: string,
  updater: (comment: Comment) => Comment,
) => {
  const nextComments = new Map(comments);
  for (const [postId, postComments] of nextComments.entries()) {
    nextComments.set(
      postId,
      postComments.map((comment) =>
        comment._id === commentId ? updater(comment) : comment,
      ),
    );
  }

  const nextReplies = new Map(replies);
  for (const [parentId, parentReplies] of nextReplies.entries()) {
    nextReplies.set(
      parentId,
      parentReplies.map((reply) =>
        reply._id === commentId ? updater(reply) : reply,
      ),
    );
  }

  return { comments: nextComments, replies: nextReplies };
};

const removeCommentEverywhere = (
  comments: Map<string, Comment[]>,
  replies: Map<string, Comment[]>,
  commentId: string,
) => {
  const nextComments = new Map(comments);
  for (const [postId, postComments] of nextComments.entries()) {
    nextComments.set(
      postId,
      postComments.filter((comment) => comment._id !== commentId),
    );
  }

  const nextReplies = new Map(replies);
  nextReplies.delete(commentId);
  for (const [parentId, parentReplies] of nextReplies.entries()) {
    nextReplies.set(
      parentId,
      parentReplies.filter((reply) => reply._id !== commentId),
    );
  }

  return { comments: nextComments, replies: nextReplies };
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
          userPosts: updatePostEverywhere(
            state.userPosts,
            postId,
            () => updatedPost,
          ),
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
        userPosts: new Map(
          Array.from(state.userPosts.entries()).map(([userId, posts]) => [
            userId,
            posts.filter((post) => post._id !== postId),
          ]),
        ),
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

  addComment: async (postId: string, text: string, parentComment?: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createComment(postId, text, parentComment);
      const newComment = res.data?.comment;
      if (newComment) {
        set((state) => {
          if (parentComment) {
            const commentReplies = state.replies.get(parentComment) || [];
            const updatedReplies = new Map(state.replies).set(parentComment, [
              ...commentReplies,
              newComment,
            ]);
            return { replies: updatedReplies, isLoading: false };
          }

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

  fetchCommentReplies: async (postId: string, commentId: string) => {
    set((state) => ({
      isLoadingReplies: new Map(state.isLoadingReplies).set(commentId, true),
      error: null,
    }));
    try {
      const res = await getCommentReplies(postId, commentId);
      const repliesArray = res.data?.replies || [];
      set((state) => ({
        replies: new Map(state.replies).set(commentId, repliesArray),
        isLoadingReplies: new Map(state.isLoadingReplies).set(commentId, false),
      }));
    } catch (error: unknown) {
      set((state) => ({
        error: getErrorMessage(error) || "Failed to fetch replies",
        isLoadingReplies: new Map(state.isLoadingReplies).set(commentId, false),
      }));
    }
  },

  updateComment: async (postId: string, commentId: string, text: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await editComment(postId, commentId, text);
      const updatedComment = res.data?.comment;
      if (updatedComment) {
        set((state) => {
          const updated = updateCommentEverywhere(
            state.comments,
            state.replies,
            commentId,
            () => updatedComment,
          );
          return {
            comments: updated.comments,
            replies: updated.replies,
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
      const res = await deleteComment(postId, commentId);
      const deletedCount = Math.max(1, res.data?.deletedCount || 1);
      set((state) => {
        const updated = removeCommentEverywhere(
          state.comments,
          state.replies,
          commentId,
        );
        return {
          comments: updated.comments,
          replies: updated.replies,
          feed: state.feed.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  commentCount: Math.max(
                    0,
                    (post.commentCount || 0) - deletedCount,
                  ),
                }
              : post,
          ),
          userPosts: updatePostEverywhere(state.userPosts, postId, (post) => ({
            ...post,
            commentCount: Math.max(0, (post.commentCount || 0) - deletedCount),
          })),
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

    const previousPost = get().feed.find((p) => p._id === postId);
    if (!previousPost) return;

    const optimisticLiked = !previousPost.likedByCurrentUser;
    const optimisticLikeCount = Math.max(
      0,
      (previousPost.likes || 0) + (optimisticLiked ? 1 : -1),
    );

    set((state) => ({
      feed: state.feed.map((p) =>
        p._id === postId
          ? {
              ...p,
              likedByCurrentUser: optimisticLiked,
              likes: optimisticLikeCount,
            }
          : p,
      ),
    }));

    try {
      const res = await toggleLike(postId, "post");
      const isLiked = res.data?.liked;
      const actualLikeCount = res.data?.likeCount ?? res.data?.likes;

      set((state) => {
        const currentPost = state.feed.find((p) => p._id === postId);
        const likeCount = actualLikeCount ?? currentPost?.likes ?? 0;
        const likedByCurrentUser =
          isLiked ?? currentPost?.likedByCurrentUser ?? false;

        return {
          feed: state.feed.map((p) =>
            p._id === postId
              ? { ...p, likedByCurrentUser, likes: likeCount }
              : p,
          ),
        };
      });
    } catch (error: unknown) {
      set((state) => ({
        feed: state.feed.map((p) => (p._id === postId ? previousPost : p)),
        error: getErrorMessage(error) || "Failed to toggle like",
      }));
      throw error;
    }
  },

  toggleCommentLike: async (commentId: string) => {
    set({ error: null });

    let previousComment: Comment | undefined;
    for (const comments of get().comments.values()) {
      previousComment = comments.find((c) => c._id === commentId);
      if (previousComment) break;
    }
    if (!previousComment) {
      for (const replies of get().replies.values()) {
        previousComment = replies.find((c) => c._id === commentId);
        if (previousComment) break;
      }
    }
    if (!previousComment) return;

    const optimisticLiked = !previousComment.likedByCurrentUser;
    const optimisticLikeCount = Math.max(
      0,
      (previousComment.likes || 0) + (optimisticLiked ? 1 : -1),
    );

    set((state) => {
      const updatedComments = new Map(state.comments);
      for (const [postId, comments] of updatedComments.entries()) {
        updatedComments.set(
          postId,
          comments.map((c) =>
            c._id === commentId
              ? {
                  ...c,
                  likedByCurrentUser: optimisticLiked,
                  likes: optimisticLikeCount,
                }
              : c,
          ),
        );
      }
      const updatedReplies = new Map(state.replies);
      for (const [parentId, replies] of updatedReplies.entries()) {
        updatedReplies.set(
          parentId,
          replies.map((c) =>
            c._id === commentId
              ? {
                  ...c,
                  likedByCurrentUser: optimisticLiked,
                  likes: optimisticLikeCount,
                }
              : c,
          ),
        );
      }
      return { comments: updatedComments, replies: updatedReplies };
    });

    try {
      const res = await toggleLike(commentId, "comment");
      const isLiked = res.data?.liked;
      const actualLikeCount = res.data?.likeCount ?? res.data?.likes;

      set((state) => {
        let currentComment: Comment | undefined;
        for (const comments of state.comments.values()) {
          const current = comments.find((c) => c._id === commentId);
          if (current) {
            currentComment = current;
            break;
          }
        }
        if (!currentComment) {
          for (const replies of state.replies.values()) {
            const current = replies.find((c) => c._id === commentId);
            if (current) {
              currentComment = current;
              break;
            }
          }
        }

        const likeCount = actualLikeCount ?? currentComment?.likes ?? 0;
        const likedByCurrentUser =
          isLiked ?? currentComment?.likedByCurrentUser ?? false;

        const updatedComments = new Map(state.comments);
        for (const [postId, comments] of updatedComments.entries()) {
          updatedComments.set(
            postId,
            comments.map((c) =>
              c._id === commentId
                ? { ...c, likedByCurrentUser, likes: likeCount }
                : c,
            ),
          );
        }
        const updatedReplies = new Map(state.replies);
        for (const [parentId, replies] of updatedReplies.entries()) {
          updatedReplies.set(
            parentId,
            replies.map((c) =>
              c._id === commentId
                ? { ...c, likedByCurrentUser, likes: likeCount }
                : c,
            ),
          );
        }
        return { comments: updatedComments, replies: updatedReplies };
      });
    } catch (error: unknown) {
      set((state) => {
        const updatedComments = new Map(state.comments);
        for (const [postId, comments] of updatedComments.entries()) {
          updatedComments.set(
            postId,
            comments.map((c) => (c._id === commentId ? previousComment : c)),
          );
        }
        const updatedReplies = new Map(state.replies);
        for (const [parentId, replies] of updatedReplies.entries()) {
          updatedReplies.set(
            parentId,
            replies.map((c) => (c._id === commentId ? previousComment : c)),
          );
        }
        return {
          comments: updatedComments,
          replies: updatedReplies,
          error: getErrorMessage(error) || "Failed to toggle comment like",
        };
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
