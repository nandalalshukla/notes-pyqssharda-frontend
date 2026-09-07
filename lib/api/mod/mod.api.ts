import { apiRequest, type RequestOptions } from "../requestManager";

export type ReportStatus = "pending" | "reviewed" | "resolved" | "rejected";
export type ReportTargetType = "post" | "comment" | "user";
export type ReportAction =
  | "resolve"
  | "reject"
  | "delete_post"
  | "delete_comment"
  | "suspend_user"
  | "warn_user"
  | "delete_user";

export interface ReportUserSummary {
  _id: string;
  username?: string;
  profilePic?: { url?: string } | null;
  role?: string;
}

export interface ReportTargetSummary {
  _id: string;
  author?: string;
  content?: string;
  post?: string;
  username?: string;
  profilePic?: { url?: string } | null;
  role?: string;
  isActive?: boolean;
  bio?: string;
  course?: string;
  followersCount?: number;
  followingCount?: number;
  createdAt?: string;
  isDeleted?: boolean;
  media?: Array<{ url?: string }>;
}

export interface ReportListItem {
  _id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  message?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  reporter?: ReportUserSummary | null;
  targetOwner?: ReportUserSummary | null;
  targetEntity?: ReportTargetSummary | null;
}

export interface ReportListResponse {
  reports: ReportListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ReportListFilters {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  targetType?: ReportTargetType;
  sortOrder?: "asc" | "desc";
}

/**
 * A member-submitted event or announcement waiting on review.
 *
 * The author is always the real one, even for a post published
 * anonymously — reviewers need to know who they're approving, and
 * `isAnonymous` only says whether the byline will be hidden from other
 * students once it goes live.
 */
export interface PendingPost {
  _id: string;
  type: "event" | "announcement";
  content: string;
  author?: {
    _id: string;
    username?: string;
    avatar?: string;
    profilePic?: { url?: string } | null;
    role?: string;
  } | null;
  isAnonymous?: boolean;
  files?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PendingPostsResponse {
  posts: PendingPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// --- Fetch Pending Items ---
export const getPendingNotes = async (options?: RequestOptions) =>
  apiRequest.get("/mod/notes/pending", {
    requestKey: options?.requestKey ?? "mod:notes:pending",
    cancelPrevious: options?.cancelPrevious ?? true,
    dedupe: options?.dedupe ?? true,
    signal: options?.signal,
  });

export const getPendingPyqs = async (options?: RequestOptions) =>
  apiRequest.get("/mod/pyqs/pending", {
    requestKey: options?.requestKey ?? "mod:pyqs:pending",
    cancelPrevious: options?.cancelPrevious ?? true,
    dedupe: options?.dedupe ?? true,
    signal: options?.signal,
  });

export const getPendingSyllabus = async (options?: RequestOptions) =>
  apiRequest.get("/mod/syllabus/pending", {
    requestKey: options?.requestKey ?? "mod:syllabus:pending",
    cancelPrevious: options?.cancelPrevious ?? true,
    dedupe: options?.dedupe ?? true,
    signal: options?.signal,
  });

export const getPendingPosts = async (options?: RequestOptions) => {
  const response = await apiRequest.get<{
    success?: boolean;
    data?: PendingPostsResponse;
  }>("/mod/posts/pending", {
    requestKey: options?.requestKey ?? "mod:posts:pending",
    cancelPrevious: options?.cancelPrevious ?? true,
    dedupe: options?.dedupe ?? true,
    signal: options?.signal,
  });

  return (
    response.data || {
      posts: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    }
  );
};

// --- Approval / Rejection ---
export const approveNote = async (noteId: string) =>
  apiRequest.patch(`/mod/notes/${noteId}/approve`);

export const rejectNote = async (noteId: string, rejectionReason?: string) =>
  apiRequest.patch(`/mod/notes/${noteId}/reject`, { rejectionReason });

export const approvePyq = async (pyqId: string) =>
  apiRequest.patch(`/mod/pyqs/${pyqId}/approve`);

export const rejectPyq = async (pyqId: string, rejectionReason?: string) =>
  apiRequest.patch(`/mod/pyqs/${pyqId}/reject`, { rejectionReason });

export const approveSyllabus = async (syllabusId: string) =>
  apiRequest.patch(`/mod/syllabus/${syllabusId}/approve`);

export const rejectSyllabus = async (
  syllabusId: string,
  rejectionReason?: string,
) =>
  apiRequest.patch(`/mod/syllabus/${syllabusId}/reject`, { rejectionReason });

export const approvePost = async (postId: string) =>
  apiRequest.patch(`/mod/posts/${postId}/approve`);

export const rejectPost = async (postId: string, rejectionReason?: string) =>
  apiRequest.patch(`/mod/posts/${postId}/reject`, { rejectionReason });

export const getReports = async (
  filters?: ReportListFilters,
  options?: RequestOptions,
) => {
  const queryKey = JSON.stringify({
    status: filters?.status || null,
    targetType: filters?.targetType || null,
    page: filters?.page || 1,
    limit: filters?.limit || 20,
    sortOrder: filters?.sortOrder || "desc",
  });

  const response = await apiRequest.get<{
    success?: boolean;
    data?: ReportListResponse;
  }>("/mod/reports", {
    params: filters ? (filters as Record<string, unknown>) : undefined,
    requestKey: options?.requestKey ?? `mod:reports:${queryKey}`,
    cancelPrevious: options?.cancelPrevious ?? true,
    dedupe: options?.dedupe ?? true,
    signal: options?.signal,
  });

  return (
    response.data || {
      reports: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    }
  );
};

export const resolveReport = async (reportId: string) =>
  apiRequest.patch(`/mod/reports/${reportId}/resolve`);

export const rejectReport = async (reportId: string) =>
  apiRequest.patch(`/mod/reports/${reportId}/reject`);

export const deleteReportedPost = async (reportId: string) =>
  apiRequest.patch(`/mod/reports/${reportId}/delete-post`);

export const deleteReportedComment = async (reportId: string) =>
  apiRequest.patch(`/mod/reports/${reportId}/delete-comment`);

export const suspendReportedUser = async (reportId: string) =>
  apiRequest.patch(`/mod/reports/${reportId}/suspend-user`);

export const warnReportedUser = async (reportId: string) =>
  apiRequest.patch(`/mod/reports/${reportId}/warn-user`);

export const deleteReportedUser = async (reportId: string) =>
  apiRequest.patch(`/mod/reports/${reportId}/delete-user`);
