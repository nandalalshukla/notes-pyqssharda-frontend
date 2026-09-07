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
  // `null` when the user has switched "show my email" off in their
  // privacy settings — the backend omits the value entirely rather than
  // relying on the client to hide it.
  email?: string | null;
  profilePic?: {
    url: string;
    publicId?: string;
  } | null;
  avatar?: string;
  role?: string;
  isFollowedByCurrentUser?: boolean;
}

/**
 * A post's author as the feed serves it.
 *
 * `_id` is `null` on the stand-in the backend substitutes for the author
 * of an anonymous post (its ANONYMOUS_AUTHOR): the id is the one field
 * that would deanonymize the post however the rest is masked, so it is
 * withheld rather than blanked. Anything that links to a profile, follows,
 * or reports the author has to check for that null — which is exactly why
 * this is a distinct type from `User` rather than a loosening of it.
 */
export interface PostAuthor extends Omit<User, "_id"> {
  _id: string | null;
}

export type PostType = "general" | "event" | "announcement" | "lost_found";

export type LostFoundKind = "lost" | "found";

export type LostFoundStatus = "open" | "resolved";

export type LostFoundCategory =
  | "electronics"
  | "documents"
  | "stationery"
  | "clothing"
  | "accessories"
  | "keys"
  | "wallet"
  | "id_card"
  | "other";

/** Structured details carried only by `type: "lost_found"` posts. */
export interface LostFoundDetails {
  kind: LostFoundKind;
  itemName: string;
  category: LostFoundCategory;
  location: string;
  dateOccurred: string | null;
  contactInfo: string;
  status: LostFoundStatus;
  resolvedAt: string | null;
}

export interface Post {
  _id: string;
  type: PostType;
  content: string;
  author: PostAuthor;
  // True when the post was published anonymously. The author still sees
  // their own real profile in `author` (so edit/delete stay available);
  // everyone else gets the masked stand-in.
  isAnonymous?: boolean;
  lostFound?: LostFoundDetails | null;
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

export type ReportTargetType = "post" | "comment" | "user";

export type ReportReason =
  | "spam"
  | "harassment"
  | "hate"
  | "nudity"
  | "violence"
  | "fake_information"
  | "scam"
  | "other";

export interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  message?: string;
}

export type NotificationType = "like" | "comment" | "reply" | "follow" | "share";

export interface Notification {
  _id: string;
  type: NotificationType;
  actor: User;
  // The backend only ever populates `_id` on post/comment (see
  // getNotifications.ts) — content/author aren't fetched, so don't type
  // them as present here; nothing in the UI needs them beyond the id.
  post?: { _id: string } | null;
  comment?: { _id: string; post: string } | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  actionLink?: string;
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

/**
 * Which of a user's contact details they've chosen to make public. Only
 * ever returned to the owner of the profile — to anyone else the hidden
 * fields simply arrive as `null`, with no indication of the setting.
 */
export interface PrivacySettings {
  showEmail: boolean;
  showContactNo: boolean;
  showCourse: boolean;
}

export interface UserProfile {
  _id: string;
  name: string;
  username: string;
  // These three are `null` when the profile's owner has hidden them.
  email: string | null;
  bio: string;
  profilePic?: {
    url: string;
    publicId?: string;
  };
  course?: string | null;
  contactNo?: string | null;
  privacy?: PrivacySettings;
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

export const getFeed = async (
  page: number = 1,
  limit: number = 10,
  type: PostType = "general",
  // Only honoured by the backend for the lost & found board; ignored on
  // every other feed type.
  lostFoundStatus?: LostFoundStatus,
) => {
  const response = await api.get<ApiResponse<PaginatedResponse<Post>>>(
    "/social/feed",
    {
      params: { page, limit, type, ...(lostFoundStatus && { lostFoundStatus }) },
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

export const getPost = async (postId: string) => {
  const response = await api.get<ApiResponse<{ post: Post }>>(
    `/social/posts/${postId}`,
  );
  return response.data;
};

/**
 * Marks the author's own lost & found post resolved (or reopens it).
 * A plain JSON PATCH — deliberately not routed through `editPost`, which
 * is multipart and rate-limited as an upload.
 */
export const updateLostFoundStatus = async (
  postId: string,
  status: LostFoundStatus,
) => {
  const response = await api.patch<
    ApiResponse<{ postId: string; lostFound: LostFoundDetails }>
  >(`/social/posts/${postId}/lost-found/status`, { status });
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

export const getComment = async (postId: string, commentId: string) => {
  const response = await api.get<ApiResponse<{ comment: Comment }>>(
    `/social/posts/${postId}/comments/${commentId}`,
  );
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

export const deleteNotification = async (notificationId: string) => {
  const response = await api.delete<ApiResponse>(
    `/social/notifications/${notificationId}`,
  );
  return response.data;
};

// Same-origin path for EventSource — must go through the next.config.ts
// proxy like every other request (see lib/api/axios.ts), not the backend's
// own cross-origin URL, or the connection's cookie wouldn't be sent/first-party.
export const NOTIFICATION_STREAM_URL = "/api/proxy/social/notifications/stream";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * REPORTS API
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const createReport = async (payload: CreateReportPayload) => {
  const response = await api.post<ApiResponse<{ report: unknown }>>(
    "/social/reports",
    payload,
  );
  return response.data;
};
