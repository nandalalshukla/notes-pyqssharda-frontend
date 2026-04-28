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
  avatar?: string;
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
  likes: number;
  likedByCurrentUser?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: "like" | "comment" | "follow" | "post";
  actor: User;
  targetPost?: string;
  targetComment?: string;
  targetUser?: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FollowStats {
  followerCount: number;
  followingCount: number;
  isFollowedByCurrentUser?: boolean;
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

export const createComment = async (postId: string, text: string) => {
  const response = await api.post<ApiResponse<{ comment: Comment }>>(
    `/social/posts/${postId}/comments`,
    { text },
  );
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
  const response = await api.delete<ApiResponse>(
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
    ApiResponse<{ liked: boolean; likeCount: number }>
  >("/social/likes/toggle", {
    targetId,
    targetType,
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
 * NOTIFICATIONS API
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const getNotifications = async (
  page: number = 1,
  limit: number = 20,
  read?: "true" | "false",
) => {
  const response = await api.get<ApiResponse<PaginatedResponse<Notification>>>(
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
