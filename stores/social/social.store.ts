import { create } from "zustand";
import {
  createPost,
  editPost,
  deletePost,
  getFeed,
  getUserPosts,
  getUserProfile,
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
  deleteNotification as deleteNotificationApi,
  NOTIFICATION_STREAM_URL,
  Post,
  PostType,
  Comment,
  FollowStats,
  Notification,
  User,
  UserProfile,
} from "@/lib/api/social/social.api";
import { getErrorMessage } from "@/lib/utils/errorHandler";
import useAuthStore from "@/stores/user/authStore";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

interface PostsState {
  feed: Post[];
  userPosts: Map<string, Post[]>;
  userPostsPage: Map<string, number>;
  userPostsTotalPages: Map<string, number>;
  isLoadingUserPosts: Map<string, boolean>;
  feedPage: number;
  feedTotalPages: number;
  isLoadingFeed: boolean;
  currentFeedType: PostType;
}

interface CommentsState {
  comments: Map<string, Comment[]>;
  isLoadingComments: Map<string, boolean>;
  replies: Map<string, Comment[]>;
  isLoadingReplies: Map<string, boolean>;
}

type NotificationStreamStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected";

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  notificationsPage: number;
  notificationsTotalPages: number;
  isLoadingNotifications: boolean;
  // Separate from the store's generic `error` — a background sync hiccup
  // shouldn't surface (or get clobbered by) unrelated feed/post errors.
  notificationsError: string | null;
  notificationStreamStatus: NotificationStreamStatus;
}

interface FollowState {
  followStats: Map<string, FollowStats>;
  followers: Map<string, User[]>;
  following: Map<string, User[]>;
  isLoadingFollowers: Map<string, boolean>;
  isLoadingFollowing: Map<string, boolean>;
  userProfiles: Map<string, UserProfile>;
  isLoadingUserProfiles: Map<string, boolean>;
}

interface SocialStore
  extends PostsState, CommentsState, NotificationsState, FollowState {
  isLoading: boolean;
  error: string | null;

  // Posts actions
  fetchFeed: (page?: number, type?: PostType) => Promise<void>;
  fetchUserPosts: (userId: string, page?: number) => Promise<void>;
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
  toggleUserFollow: (
    userId: string,
    currentFollowing?: boolean,
  ) => Promise<void>;
  fetchUserFollowers: (userId: string, page?: number) => Promise<void>;
  fetchUserFollowing: (userId: string, page?: number) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<void>;

  // Notifications actions
  fetchNotifications: (page?: number, read?: "true" | "false") => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markOneAsRead: (notificationId: string) => Promise<void>;
  removeNotification: (notificationId: string) => Promise<void>;
  // Opens the live SSE connection (idempotent — safe to call from every
  // component that wants notifications, even if several are mounted at
  // once) and starts a polling fallback that only actually polls while the
  // stream isn't connected. disconnectNotificationStream tears both down;
  // call it once on logout, not on every consuming component's unmount.
  connectNotificationStream: () => void;
  disconnectNotificationStream: () => void;

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
    fetchUserPosts: unknown;
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
    fetchUserProfile: unknown;
    fetchNotifications: unknown;
    markAllAsRead: unknown;
    markOneAsRead: unknown;
    removeNotification: unknown;
    connectNotificationStream: unknown;
    disconnectNotificationStream: unknown;
    clearError: unknown;
    resetStore: unknown;
  }
> = {
  // Posts
  feed: [],
  userPosts: new Map(),
  userPostsPage: new Map(),
  userPostsTotalPages: new Map(),
  isLoadingUserPosts: new Map(),
  feedPage: 1,
  feedTotalPages: 0,
  isLoadingFeed: false,
  currentFeedType: "general",

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
  notificationsError: null,
  notificationStreamStatus: "idle",

  // Follow
  followStats: new Map(),
  followers: new Map(),
  following: new Map(),
  isLoadingFollowers: new Map(),
  isLoadingFollowing: new Map(),
  userProfiles: new Map(),
  isLoadingUserProfiles: new Map(),

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

const normalizePost = (
  post: Post & {
    type?: string | null;
    media?: { url: string; publicId?: string }[];
    commentsCount?: number;
    comments?: number;
  },
): Post => ({
  ...post,
  type:
    post.type === "event" || post.type === "announcement"
      ? post.type
      : "general",
  files: post.files || post.media?.map((media) => media.url) || [],
  publicIds:
    post.publicIds || post.media?.map((media) => media.publicId || "") || [],
  commentCount: post.commentCount ?? post.commentsCount ?? post.comments ?? 0,
});

const createTempId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getCurrentUser = () => useAuthStore.getState().user;

const buildOptimisticPost = (
  data: FormData,
  previousPost?: Post,
  previewUrls?: string[],
) => {
  const content = String(data.get("content") || "");
  const now = new Date().toISOString();
  const user = getCurrentUser();

  const baseFiles = previousPost?.files || [];
  const basePublicIds = previousPost?.publicIds || [];
  const removePublicIdsRaw = data.get("removePublicIds");
  let removePublicIds: string[] = [];

  if (typeof removePublicIdsRaw === "string") {
    try {
      removePublicIds = JSON.parse(removePublicIdsRaw);
    } catch {
      removePublicIds = [];
    }
  }

  const kept = baseFiles.filter((_, idx) =>
    removePublicIds.includes(basePublicIds[idx] || "") ? false : true,
  );
  const keptPublicIds = basePublicIds.filter(
    (id) => !removePublicIds.includes(id || ""),
  );

  const newFiles = previewUrls || [];
  const newPublicIds = newFiles.map(() => "");

  return {
    _id: previousPost?._id || createTempId("post"),
    type: (data.get("type") as PostType) || previousPost?.type || "general",
    content,
    author: {
      _id: user?._id || "",
      username: user?.username || "You",
      profilePic: user?.profilePic,
      avatar: user?.profilePic?.url || "",
      role: user?.role,
    },
    files: [...kept, ...newFiles],
    publicIds: [...keptPublicIds, ...newPublicIds],
    likes: previousPost?.likes || 0,
    likedByCurrentUser: previousPost?.likedByCurrentUser || false,
    commentCount: previousPost?.commentCount || 0,
    createdAt: previousPost?.createdAt || now,
    updatedAt: now,
  } as Post;
};

const buildOptimisticComment = (
  postId: string,
  text: string,
  parentComment?: string,
) => {
  const now = new Date().toISOString();
  const user = getCurrentUser();

  return {
    _id: createTempId("comment"),
    text,
    author: {
      _id: user?._id || "",
      username: user?.username || "You",
      profilePic: user?.profilePic,
      avatar: user?.profilePic?.url || "",
      role: user?.role,
    },
    post: postId,
    parentComment: parentComment || null,
    likes: 0,
    likedByCurrentUser: false,
    createdAt: now,
    updatedAt: now,
  } as Comment;
};

const getPostAuthorId = (post: Post) =>
  typeof (post.author as unknown) === "string"
    ? (post.author as unknown as string)
    : post.author?._id;

const getPostAuthorFollowStatus = (post: Post) =>
  typeof post.author === "object"
    ? post.author?.isFollowedByCurrentUser
    : undefined;

const mergeFollowStatsFromPosts = (
  currentStats: Map<string, FollowStats>,
  posts: Post[],
) => {
  const nextStats = new Map(currentStats);

  posts.forEach((post) => {
    const authorId = getPostAuthorId(post);
    const isFollowedByCurrentUser = getPostAuthorFollowStatus(post);

    if (!authorId || isFollowedByCurrentUser === undefined) return;

    const existing = nextStats.get(authorId);
    nextStats.set(authorId, {
      followerCount: existing?.followerCount ?? 0,
      followingCount: existing?.followingCount ?? 0,
      ...existing,
      isFollowedByCurrentUser,
    });
  });

  return nextStats;
};

const updateAuthorFollowState = (
  post: Post,
  userId: string,
  isFollowedByCurrentUser: boolean,
) => {
  const authorId = getPostAuthorId(post);

  if (String(authorId) !== String(userId) || typeof post.author !== "object") {
    return post;
  }

  return {
    ...post,
    author: {
      ...post.author,
      isFollowedByCurrentUser,
    },
  };
};

const updateAuthorFollowEverywhere = (
  userPosts: Map<string, Post[]>,
  userId: string,
  isFollowedByCurrentUser: boolean,
) => {
  const nextUserPosts = new Map(userPosts);

  for (const [profileUserId, posts] of nextUserPosts.entries()) {
    nextUserPosts.set(
      profileUserId,
      posts.map((post) =>
        updateAuthorFollowState(post, userId, isFollowedByCurrentUser),
      ),
    );
  }

  return nextUserPosts;
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NOTIFICATION STREAM — module-level singletons
 * ═══════════════════════════════════════════════════════════════════════════════
 * EventSource/interval/listener handles aren't serializable store state, and
 * more importantly must be process-wide singletons: the app mounts more than
 * one component that wants the notification stream open at once (desktop
 * AND mobile nav are both always in the DOM, just CSS-hidden), so
 * connect/disconnect need to be idempotent rather than tied 1:1 to any one
 * component's lifecycle.
 */
let notificationEventSource: EventSource | null = null;
let notificationPollTimer: ReturnType<typeof setInterval> | null = null;
let notificationVisibilityHandler: (() => void) | null = null;

const NOTIFICATION_POLL_FALLBACK_MS = 45_000;

export const useSocialStore = create<SocialStore>((set, get) => ({
  ...initialState,

  /**
   * ───────────────────────────────────────────────────────────────────────────────
   * POSTS MANAGEMENT
   * ───────────────────────────────────────────────────────────────────────────────
   */

  fetchFeed: async (page = 1, type = "general") => {
    set({ isLoadingFeed: true, error: null, currentFeedType: type });
    try {
      const res = await getFeed(page, 10, type);
      const posts = (res.data?.data || []).map(normalizePost);
      set((state) => ({
        feed: page > 1 ? [...state.feed, ...posts] : posts,
        followStats: mergeFollowStatsFromPosts(state.followStats, posts),
        feedPage: page,
        feedTotalPages: res.data?.totalPages || 0,
        isLoadingFeed: false,
        currentFeedType: type,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to fetch feed",
        isLoadingFeed: false,
      });
    }
  },

  fetchUserPosts: async (userId: string, page = 1) => {
    set((state) => ({
      isLoadingUserPosts: new Map(state.isLoadingUserPosts).set(userId, true),
      error: null,
    }));
    try {
      const res = await getUserPosts(userId, page, 10);
      const rawPosts = Array.isArray(res.data?.data) ? res.data.data : [];
      const posts = rawPosts.map(normalizePost);
      const totalPages = res.data?.totalPages || 1;

      set((state) => {
        const existing = state.userPosts.get(userId) || [];
        const nextPosts = page > 1 ? [...existing, ...posts] : posts;

        return {
          userPosts: new Map(state.userPosts).set(userId, nextPosts),
          followStats: mergeFollowStatsFromPosts(state.followStats, posts),
          userPostsPage: new Map(state.userPostsPage).set(userId, page),
          userPostsTotalPages: new Map(state.userPostsTotalPages).set(
            userId,
            totalPages,
          ),
          isLoadingUserPosts: new Map(state.isLoadingUserPosts).set(
            userId,
            false,
          ),
        };
      });
    } catch (error: unknown) {
      set((state) => ({
        error: getErrorMessage(error) || "Failed to fetch user posts",
        isLoadingUserPosts: new Map(state.isLoadingUserPosts).set(
          userId,
          false,
        ),
      }));
      throw error;
    }
  },

  createNewPost: async (data: FormData) => {
    set({ isLoading: true, error: null });
    const files = data.getAll("files").filter((file) => file instanceof File);
    const previewUrls = (files as File[]).map((file) =>
      URL.createObjectURL(file),
    );
    const optimisticPost = buildOptimisticPost(data, undefined, previewUrls);
    const previousFeed = get().feed;
    const previousUserPosts = get().userPosts;

    set((state) => {
      const nextUserPosts = new Map(state.userPosts);
      const userId = optimisticPost.author?._id;
      if (userId) {
        const existing = nextUserPosts.get(userId) || [];
        nextUserPosts.set(userId, [optimisticPost, ...existing]);
      }
      const shouldShowInCurrentFeed =
        state.currentFeedType === "general" ||
        state.currentFeedType === optimisticPost.type;
      return {
        feed: shouldShowInCurrentFeed
          ? [optimisticPost, ...state.feed]
          : state.feed,
        userPosts: nextUserPosts,
      };
    });
    try {
      const res = await createPost(data);
      const newPost = res.data?.post ? normalizePost(res.data.post) : null;
      if (newPost) {
        set((state) => ({
          feed:
            state.currentFeedType === "general" ||
            state.currentFeedType === newPost.type
              ? state.feed.map((post) =>
                  post._id === optimisticPost._id ? newPost : post,
                )
              : state.feed.filter((post) => post._id !== optimisticPost._id),
          userPosts: updatePostEverywhere(
            state.userPosts,
            optimisticPost._id,
            () => newPost,
          ),
          isLoading: false,
        }));
      }
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    } catch (error: unknown) {
      set({
        feed: previousFeed,
        userPosts: previousUserPosts,
        error: getErrorMessage(error) || "Failed to create post",
        isLoading: false,
      });
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      throw error;
    }
  },

  updatePost: async (postId: string, data: FormData) => {
    set({ isLoading: true, error: null });
    const previousPost =
      get().feed.find((post) => post._id === postId) ||
      Array.from(get().userPosts.values())
        .flat()
        .find((post) => post._id === postId);
    const previousFeed = get().feed;
    const previousUserPosts = get().userPosts;
    const files = data.getAll("files").filter((file) => file instanceof File);
    const previewUrls = (files as File[]).map((file) =>
      URL.createObjectURL(file),
    );

    if (previousPost) {
      const optimisticPost = buildOptimisticPost(
        data,
        previousPost,
        previewUrls,
      );
      set((state) => ({
        feed:
          state.currentFeedType === "general" ||
          state.currentFeedType === optimisticPost.type
            ? state.feed.map((post) =>
                post._id === postId ? optimisticPost : post,
              )
            : state.feed.filter((post) => post._id !== postId),
        userPosts: updatePostEverywhere(
          state.userPosts,
          postId,
          () => optimisticPost,
        ),
      }));
    }
    try {
      const res = await editPost(postId, data);
      const updatedPost = res.data?.post ? normalizePost(res.data.post) : null;
      if (updatedPost) {
        set((state) => ({
          feed:
            state.currentFeedType === "general" ||
            state.currentFeedType === updatedPost.type
              ? state.feed.map((p) => (p._id === postId ? updatedPost : p))
              : state.feed.filter((p) => p._id !== postId),
          userPosts: updatePostEverywhere(
            state.userPosts,
            postId,
            () => updatedPost,
          ),
          isLoading: false,
        }));
      }
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    } catch (error: unknown) {
      set({
        feed: previousFeed,
        userPosts: previousUserPosts,
        error: getErrorMessage(error) || "Failed to update post",
        isLoading: false,
      });
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      throw error;
    }
  },

  removePost: async (postId: string) => {
    set({ isLoading: true, error: null });
    const previousFeed = get().feed;
    const previousUserPosts = get().userPosts;
    const previousComments = get().comments;
    const previousReplies = get().replies;
    const previousIsLoading = get().isLoading;
    const previousError = get().error;

    set((state) => {
      const nextFeed = state.feed.filter((p) => p._id !== postId);
      const nextUserPosts = new Map(
        Array.from(state.userPosts.entries()).map(([userId, posts]) => [
          userId,
          posts.filter((post) => post._id !== postId),
        ]),
      );

      const postComments = state.comments.get(postId) || [];
      const commentIdsToDelete = new Set<string>(
        postComments.map((c) => c._id),
      );

      const nextComments = new Map(state.comments);
      nextComments.delete(postId);

      const nextReplies = new Map(state.replies);
      for (const commentId of commentIdsToDelete) {
        nextReplies.delete(commentId);
      }

      return {
        feed: nextFeed,
        userPosts: nextUserPosts,
        comments: nextComments,
        replies: nextReplies,
      };
    });
    try {
      await deletePost(postId);
      set((state) => {
        // Remove the post from feed and userPosts
        const nextFeed = state.feed.filter((p) => p._id !== postId);
        const nextUserPosts = new Map(
          Array.from(state.userPosts.entries()).map(([userId, posts]) => [
            userId,
            posts.filter((post) => post._id !== postId),
          ]),
        );

        // Get all comment IDs for this post that we need to delete
        const postComments = state.comments.get(postId) || [];
        const commentIdsToDelete = new Set<string>(
          postComments.map((c) => c._id),
        );

        // Remove the post's comments
        const nextComments = new Map(state.comments);
        nextComments.delete(postId);

        // Remove replies for comments of this post
        const nextReplies = new Map(state.replies);
        for (const commentId of commentIdsToDelete) {
          nextReplies.delete(commentId);
        }

        return {
          feed: nextFeed,
          userPosts: nextUserPosts,
          comments: nextComments,
          replies: nextReplies,
          isLoading: false,
        };
      });
    } catch (error: unknown) {
      set({
        feed: previousFeed,
        userPosts: previousUserPosts,
        comments: previousComments,
        replies: previousReplies,
        isLoading: previousIsLoading,
        error:
          getErrorMessage(error) || previousError || "Failed to delete post",
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
    const optimisticComment = buildOptimisticComment(
      postId,
      text,
      parentComment,
    );
    const previousComments = get().comments;
    const previousReplies = get().replies;
    const previousFeed = get().feed;
    const previousUserPosts = get().userPosts;
    const updatePostCount = (post: Post, delta: number) => ({
      ...post,
      commentCount: Math.max(0, (post.commentCount || 0) + delta),
    });

    set((state) => {
      if (parentComment) {
        const commentReplies = state.replies.get(parentComment) || [];
        const updatedReplies = new Map(state.replies).set(parentComment, [
          ...commentReplies,
          optimisticComment,
        ]);
        return {
          replies: updatedReplies,
          feed: state.feed.map((post) =>
            post._id === postId ? updatePostCount(post, 1) : post,
          ),
          userPosts: updatePostEverywhere(state.userPosts, postId, (post) =>
            updatePostCount(post, 1),
          ),
        };
      }

      const postComments = state.comments.get(postId) || [];
      return {
        comments: new Map(state.comments).set(postId, [
          optimisticComment,
          ...postComments,
        ]),
        feed: state.feed.map((post) =>
          post._id === postId ? updatePostCount(post, 1) : post,
        ),
        userPosts: updatePostEverywhere(state.userPosts, postId, (post) =>
          updatePostCount(post, 1),
        ),
      };
    });
    try {
      const res = await createComment(postId, text, parentComment);
      const newComment = res.data?.comment;
      if (newComment) {
        set((state) => {
          if (parentComment) {
            const commentReplies = state.replies.get(parentComment) || [];
            const updatedReplies = new Map(state.replies).set(
              parentComment,
              commentReplies.map((comment) =>
                comment._id === optimisticComment._id ? newComment : comment,
              ),
            );
            return {
              replies: updatedReplies,
              isLoading: false,
            };
          }

          const postComments = state.comments.get(postId) || [];
          return {
            comments: new Map(state.comments).set(
              postId,
              postComments.map((comment) =>
                comment._id === optimisticComment._id ? newComment : comment,
              ),
            ),
            isLoading: false,
          };
        });
      }
    } catch (error: unknown) {
      set({
        comments: previousComments,
        replies: previousReplies,
        feed: previousFeed,
        userPosts: previousUserPosts,
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

    if (previousComment) {
      const optimisticComment = { ...previousComment, text };
      const updated = updateCommentEverywhere(
        get().comments,
        get().replies,
        commentId,
        () => optimisticComment,
      );
      set({ comments: updated.comments, replies: updated.replies });
    }
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
      if (previousComment) {
        const restored = updateCommentEverywhere(
          get().comments,
          get().replies,
          commentId,
          () => previousComment as Comment,
        );
        set({ comments: restored.comments, replies: restored.replies });
      }
      set({
        error: getErrorMessage(error) || "Failed to update comment",
        isLoading: false,
      });
      throw error;
    }
  },

  removeComment: async (postId: string, commentId: string) => {
    set({ isLoading: true, error: null });
    const previousComments = get().comments;
    const previousReplies = get().replies;
    const previousFeed = get().feed;
    const previousUserPosts = get().userPosts;
    const repliesToRemove = get().replies.get(commentId) || [];
    const optimisticDeletedCount = 1 + repliesToRemove.length;

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
                  (post.commentCount || 0) - optimisticDeletedCount,
                ),
              }
            : post,
        ),
        userPosts: updatePostEverywhere(state.userPosts, postId, (post) => ({
          ...post,
          commentCount: Math.max(
            0,
            (post.commentCount || 0) - optimisticDeletedCount,
          ),
        })),
      };
    });
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
        comments: previousComments,
        replies: previousReplies,
        feed: previousFeed,
        userPosts: previousUserPosts,
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

    const previousPost =
      get().feed.find((p) => p._id === postId) ||
      Array.from(get().userPosts.values())
        .flat()
        .find((p) => p._id === postId);
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
      userPosts: updatePostEverywhere(state.userPosts, postId, (p) => ({
        ...p,
        likedByCurrentUser: optimisticLiked,
        likes: optimisticLikeCount,
      })),
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
          userPosts: updatePostEverywhere(state.userPosts, postId, (p) => ({
            ...p,
            likedByCurrentUser,
            likes: likeCount,
          })),
        };
      });
    } catch (error: unknown) {
      set((state) => ({
        feed: state.feed.map((p) => (p._id === postId ? previousPost : p)),
        userPosts: updatePostEverywhere(state.userPosts, postId, (p) =>
          p._id === postId ? previousPost : p,
        ),
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

  toggleUserFollow: async (userId: string, currentFollowing?: boolean) => {
    set({ error: null });
    const previousStats = get().followStats.get(userId);
    const previousFeed = get().feed;
    const previousUserPosts = get().userPosts;
    const optimisticFollowing = !(
      currentFollowing ??
      previousStats?.isFollowedByCurrentUser ??
      false
    );

    set((state) => {
      const optimisticStats: FollowStats = {
        followerCount: Math.max(
          0,
          (previousStats?.followerCount ?? 0) + (optimisticFollowing ? 1 : -1),
        ),
        followingCount: previousStats?.followingCount ?? 0,
        ...previousStats,
        isFollowedByCurrentUser: optimisticFollowing,
      };

      return {
        followStats: new Map(state.followStats).set(userId, optimisticStats),
        feed: state.feed.map((post) =>
          updateAuthorFollowState(post, userId, optimisticFollowing),
        ),
        userPosts: updateAuthorFollowEverywhere(
          state.userPosts,
          userId,
          optimisticFollowing,
        ),
      };
    });

    try {
      const res = await toggleFollow(userId);
      const isFollowedByCurrentUser =
        res.data?.followStats?.isFollowedByCurrentUser ?? res.data?.following;
      const stats =
        res.data?.followStats && isFollowedByCurrentUser !== undefined
          ? {
              ...res.data.followStats,
              isFollowedByCurrentUser,
            }
          : undefined;

      if (stats && isFollowedByCurrentUser !== undefined) {
        set((state) => ({
          followStats: new Map(state.followStats).set(userId, stats),
          feed: state.feed.map((post) =>
            updateAuthorFollowState(post, userId, isFollowedByCurrentUser),
          ),
          userPosts: updateAuthorFollowEverywhere(
            state.userPosts,
            userId,
            isFollowedByCurrentUser,
          ),
        }));
      }
    } catch (error: unknown) {
      const restoredStats = new Map(get().followStats);
      if (previousStats) {
        restoredStats.set(userId, previousStats);
      } else {
        restoredStats.delete(userId);
      }

      set({
        followStats: restoredStats,
        feed: previousFeed,
        userPosts: previousUserPosts,
        error: getErrorMessage(error) || "Failed to toggle follow",
      });
      throw error;
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

  fetchUserProfile: async (userId: string) => {
    set((state) => ({
      isLoadingUserProfiles: new Map(state.isLoadingUserProfiles).set(
        userId,
        true,
      ),
      error: null,
    }));
    try {
      const res = await getUserProfile(userId);
      const profile = res.data?.profile;
      if (profile) {
        set((state) => {
          const nextProfiles = new Map(state.userProfiles);
          nextProfiles.set(userId, profile);

          // Update followStats with data from profile
          const nextFollowStats = new Map(state.followStats);
          nextFollowStats.set(userId, {
            followerCount: profile.stats.followersCount,
            followingCount: profile.stats.followingCount,
            isFollowedByCurrentUser: profile.isFollowedByCurrentUser,
          });

          return {
            userProfiles: nextProfiles,
            followStats: nextFollowStats,
            isLoadingUserProfiles: new Map(state.isLoadingUserProfiles).set(
              userId,
              false,
            ),
          };
        });
      }
    } catch (error: unknown) {
      set((state) => ({
        error: getErrorMessage(error) || "Failed to fetch profile",
        isLoadingUserProfiles: new Map(state.isLoadingUserProfiles).set(
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
    set({ isLoadingNotifications: true, notificationsError: null });
    try {
      const res = await getNotifications(page, 20, read);
      if (res?.data) {
        const notificationsList = res.data.notifications || [];
        const paginationInfo = res.data.pagination;
        const calculatedTotalPages = paginationInfo?.total
          ? Math.ceil(paginationInfo.total / (paginationInfo?.limit || 20))
          : 0;

        set({
          notifications: notificationsList,
          notificationsPage: page,
          notificationsTotalPages: calculatedTotalPages,
          // Authoritative count from the server (covers ALL unread
          // notifications, not just whichever page happens to be loaded —
          // deriving it via .filter() over one page undercounted whenever
          // unread notifications existed beyond page 1).
          unreadCount: res.data.unreadCount,
          isLoadingNotifications: false,
        });
      }
    } catch (error: unknown) {
      set({
        notificationsError:
          getErrorMessage(error) || "Failed to fetch notifications",
        isLoadingNotifications: false,
      });
    }
  },

  markAllAsRead: async () => {
    set({ notificationsError: null });
    const previousNotifications = get().notifications;
    const previousUnreadCount = get().unreadCount;
    set({
      notifications: get().notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    });
    try {
      await markAllNotificationsAsRead();
    } catch (error: unknown) {
      set({
        notifications: previousNotifications,
        unreadCount: previousUnreadCount,
        notificationsError: getErrorMessage(error) || "Failed to mark all as read",
      });
      throw error;
    }
  },

  markOneAsRead: async (notificationId: string) => {
    set({ notificationsError: null });
    const previousNotifications = get().notifications;
    const previousUnreadCount = get().unreadCount;
    set((state) => {
      const notification = state.notifications.find(
        (n) => n._id === notificationId,
      );
      return {
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
        unreadCount:
          notification && !notification.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      };
    });
    try {
      await markNotificationAsRead(notificationId);
    } catch (error: unknown) {
      set({
        notifications: previousNotifications,
        unreadCount: previousUnreadCount,
        notificationsError: getErrorMessage(error) || "Failed to mark as read",
      });
      throw error;
    }
  },

  removeNotification: async (notificationId: string) => {
    set({ notificationsError: null });
    const previousNotifications = get().notifications;
    const previousUnreadCount = get().unreadCount;
    const notification = previousNotifications.find(
      (n) => n._id === notificationId,
    );
    set({
      notifications: previousNotifications.filter(
        (n) => n._id !== notificationId,
      ),
      unreadCount:
        notification && !notification.isRead
          ? Math.max(0, previousUnreadCount - 1)
          : previousUnreadCount,
    });
    try {
      await deleteNotificationApi(notificationId);
    } catch (error: unknown) {
      set({
        notifications: previousNotifications,
        unreadCount: previousUnreadCount,
        notificationsError: getErrorMessage(error) || "Failed to delete notification",
      });
      throw error;
    }
  },

  connectNotificationStream: () => {
    if (typeof window === "undefined") return;
    if (notificationEventSource) return; // already connecting/connected

    set({ notificationStreamStatus: "connecting" });

    const stopPolling = () => {
      if (notificationPollTimer) {
        clearInterval(notificationPollTimer);
        notificationPollTimer = null;
      }
    };

    const startPolling = () => {
      if (notificationPollTimer) return;
      notificationPollTimer = setInterval(() => {
        if (document.visibilityState !== "visible") return;
        get().fetchNotifications(1);
      }, NOTIFICATION_POLL_FALLBACK_MS);
    };

    const source = new EventSource(NOTIFICATION_STREAM_URL, {
      withCredentials: true,
    });
    notificationEventSource = source;

    source.addEventListener("open", () => {
      set({ notificationStreamStatus: "connected" });
      stopPolling();
    });

    source.addEventListener("error", () => {
      // EventSource retries the connection on its own; we just track state
      // and lean on polling as a safety net while it's down.
      set({ notificationStreamStatus: "disconnected" });
      startPolling();
    });

    source.addEventListener("unread-count", (event) => {
      try {
        const { unreadCount } = JSON.parse(
          (event as MessageEvent).data,
        ) as { unreadCount: number };
        set({ unreadCount });
      } catch {
        // ignore malformed event
      }
    });

    source.addEventListener("notification", (event) => {
      try {
        const notification = JSON.parse(
          (event as MessageEvent).data,
        ) as Notification;
        set((state) => {
          const alreadyPresent = state.notifications.some(
            (n) => n._id === notification._id,
          );
          const notifications = alreadyPresent
            ? state.notifications.map((n) =>
                n._id === notification._id ? notification : n,
              )
            : [notification, ...state.notifications];
          return { notifications };
        });
      } catch {
        // ignore malformed event
      }
    });

    // Pausing the polling fallback while the tab is hidden (handled inside
    // startPolling's guard) isn't enough on its own — also catch up
    // immediately when the tab regains focus, in case events were missed
    // while backgrounded and the SSE connection itself dropped too.
    if (!notificationVisibilityHandler) {
      notificationVisibilityHandler = () => {
        if (
          document.visibilityState === "visible" &&
          get().notificationStreamStatus !== "connected"
        ) {
          get().fetchNotifications(1);
        }
      };
      document.addEventListener("visibilitychange", notificationVisibilityHandler);
    }
  },

  disconnectNotificationStream: () => {
    notificationEventSource?.close();
    notificationEventSource = null;
    if (notificationPollTimer) {
      clearInterval(notificationPollTimer);
      notificationPollTimer = null;
    }
    if (notificationVisibilityHandler) {
      document.removeEventListener("visibilitychange", notificationVisibilityHandler);
      notificationVisibilityHandler = null;
    }
    set({ notificationStreamStatus: "idle" });
  },

  /**
   * ───────────────────────────────────────────────────────────────────────────────
   * UTILITY ACTIONS
   * ───────────────────────────────────────────────────────────────────────────────
   */

  clearError: () => set({ error: null }),

  resetStore: () => {
    // set(initialState) only resets Zustand state — the SSE connection,
    // poll timer, and visibility listener are module-level singletons (see
    // top of file) and need their own explicit teardown, or a logout would
    // leave a live stream running against an endpoint that no longer has a
    // valid session, retrying forever in the background.
    get().disconnectNotificationStream();
    set(initialState);
  },
}));

// Drive the notification stream off auth state directly, rather than
// requiring every call site that logs in/out to remember to connect or
// disconnect it. This is a one-way dependency (social store reacts to auth
// store); authStore.ts must never import back from here, or the two stores
// would form an import cycle.
if (typeof window !== "undefined") {
  if (useAuthStore.getState().isAuthenticated) {
    useSocialStore.getState().connectNotificationStream();
  }

  useAuthStore.subscribe((state, prevState) => {
    if (state.isAuthenticated === prevState.isAuthenticated) return;
    if (state.isAuthenticated) {
      useSocialStore.getState().connectNotificationStream();
    } else {
      useSocialStore.getState().disconnectNotificationStream();
    }
  });
}
