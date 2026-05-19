import api from "../axios";
import { ApiResponse, PaginatedResponse, PaginationInfo } from "../types";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface User {
  _id: string;
  username: string;
  email?: string;
  profilePic?: {
    url: string;
    publicId?: string;
  };
  avatar?: string;
  role?: string;
  isFollowedByCurrentUser?: boolean;
}

export interface Post {
  _id: string;
  content: string;
  author: User;
  files?: string[];
  publicIds?: string[];
  likes: number;
  likedByCurrentUser?: boolean;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  text: string;
  author: User;
  post: string;
  parentComment?: string | null;
  likes: number;
  likedByCurrentUser?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: "like" | "comment" | "follow" | "post" | "share";
  actor: User;
  post?: {
    _id: string;
    content: string;
    author: { _id: string; username: string };
    createdAt: string;
  } | null;
  comment?: {
    _id: string;
    content: string;
    post: string;
    author: { _id: string; username: string };
    createdAt: string;
  } | null;
  message: string;
  isRead: boolean; // Backend uses isRead, not read
  read?: boolean; // Add optional read for backward compatibility
  createdAt: string;
  updatedAt: string;
  actionLink?: string; // Used for navigation
}

// Custom type for notification response from backend
export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface FollowStats {
  followerCount: number;
  followingCount: number;
  isFollowedByCurrentUser?: boolean;
}

export interface UserProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  profilePic?: {
    url: string;
    publicId?: string;
  };
  course?: string;
  contactNo?: string;
  role: string;
  stats: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    contributions: number;
  };
  isFollowedByCurrentUser: boolean;
  isOwnProfile: boolean;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * POSTS API
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const getFeed = async (page: number = 1, limit: number = 10) => {
  const response = await api.get<ApiResponse<PaginatedResponse<Post>>>(
    "/social/feed",
    {
      params: { page, limit },
    },
  );
  return response.data;
};

export const createPost = async (data: FormData) => {
  const response = await api.post<ApiResponse<{ post: Post }>>(
    "/social/posts",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const editPost = async (postId: string, data: FormData) => {
  const response = await api.patch<ApiResponse<{ post: Post }>>(
    `/social/posts/${postId}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const deletePost = async (postId: string) => {
  const response = await api.delete<ApiResponse>(`/social/posts/${postId}`);
  return response.data;
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMMENTS API
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const getComments = async (postId: string) => {
  const response = await api.get<
    ApiResponse<{ comments: Comment[]; pagination: PaginationInfo }>
  >(`/social/posts/${postId}/comments`);
  return response.data;
};

export const createComment = async (
  postId: string,
  text: string,
  parentComment?: string,
) => {
  const response = await api.post<ApiResponse<{ comment: Comment }>>(
    `/social/posts/${postId}/comments`,
    { text, parentComment },
  );
  return response.data;
};

export const getCommentReplies = async (
  postId: string,
  commentId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const response = await api.get<
    ApiResponse<{ replies: Comment[]; pagination: PaginationInfo }>
  >(`/social/posts/${postId}/comments/${commentId}/replies`, {
    params: { page, limit },
  });
  return response.data;
};

export const editComment = async (
  postId: string,
  commentId: string,
  text: string,
) => {
  const response = await api.patch<ApiResponse<{ comment: Comment }>>(
    `/social/posts/${postId}/comments/${commentId}`,
    { text },
  );
  return response.data;
};

export const deleteComment = async (postId: string, commentId: string) => {
  const response = await api.delete<ApiResponse<{ deletedCount: number }>>(
    `/social/posts/${postId}/comments/${commentId}`,
  );
  return response.data;
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LIKES API
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const toggleLike = async (
  targetId: string,
  targetType: "post" | "comment",
) => {
  const response = await api.post<
    ApiResponse<{
      liked: boolean;
      likeCount: number;
      likes: number;
      targetId: string;
      targetType: string;
    }>
  >("/social/likes/toggle", {
    targetId,
    targetType,
  });
  return response.data;
};

export const getPostLikes = async (
  postId: string,
  page: number = 1,
  limit: number = 20,
) => {
  const response = await api.get<
    ApiResponse<{
      likes: User[];
      pagination: PaginationInfo;
    }>
  >(`/social/posts/${postId}/likes`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FOLLOW API
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const toggleFollow = async (userId: string) => {
  const response = await api.post<
    ApiResponse<{ following: boolean; followStats: FollowStats }>
  >(`/social/users/${userId}/follow`, {});
  return response.data;
};

export const getFollowers = async (
  userId: string,
  page: number = 1,
  limit: number = 20,
) => {
  const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
    `/social/users/${userId}/followers`,
    {
      params: { page, limit },
    },
  );
  return response.data;
};

export const getFollowing = async (
  userId: string,
  page: number = 1,
  limit: number = 20,
) => {
  const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
    `/social/users/${userId}/following`,
    {
      params: { page, limit },
    },
  );
  return response.data;
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * USER PROFILE API
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const getUserProfile = async (userId: string) => {
  const response = await api.get<ApiResponse<{ profile: UserProfile }>>(
    `/social/users/${userId}`,
  );
  return response.data;
};

export const getUserPosts = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const response = await api.get<
    ApiResponse<{
      data: Post[];
      totalPages: number;
      currentPage: number;
      total: number;
    }>
  >(`/social/users/${userId}/posts`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NOTIFICATIONS API
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const getNotifications = async (
  page: number = 1,
  limit: number = 20,
  read?: "true" | "false",
) => {
  const response = await api.get<ApiResponse<NotificationsResponse>>(
    "/social/notifications",
    {
      params: { page, limit, ...(read && { read }) },
    },
  );
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch<ApiResponse<{ markedCount: number }>>(
    "/social/notifications/read-all",
    {},
  );
  return response.data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await api.patch<ApiResponse>(
    `/social/notifications/${notificationId}/read`,
    {},
  );
  return response.data;
};
