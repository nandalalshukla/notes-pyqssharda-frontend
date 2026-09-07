import { apiRequest, type RequestOptions } from "../requestManager";

/**
 * Admin content management — notes, PYQs and syllabus.
 *
 * One parameterised API for all three, mirroring the backend's single
 * `/admin/content/:type/...` route set. Adding a fourth resource type is a
 * new entry in `CONTENT_TYPES` and nothing else.
 */

export const CONTENT_TYPES = ["notes", "pyqs", "syllabus"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  notes: "Notes",
  pyqs: "PYQs",
  syllabus: "Syllabus",
};

export type ContentStatus = "pending" | "approved" | "rejected";
export type ContentStatusFilter = ContentStatus | "all";

/**
 * A resource as the admin console sees it.
 *
 * The three types share a schema apart from a couple of fields (only PYQs
 * carry `year`), so one interface covers them with the differences marked
 * optional.
 */
export interface AdminContentItem {
  _id: string;
  title: string;
  fileUrl: string;
  publicId: string;
  program: string;
  courseCode: string;
  courseName: string;
  semester: number;
  /** PYQs only. */
  year?: string;
  /** PYQs only, and only on imported papers. */
  school?: string | null;
  status: ContentStatus;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  userId?:
    | { _id: string; username?: string; email?: string; name?: string }
    | string
    | null;
}

export interface ContentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ContentCounts {
  pending: number;
  approved: number;
  rejected: number;
  all: number;
}

export interface ContentListParams {
  status?: ContentStatusFilter;
  page?: number;
  limit?: number;
  query?: string;
  program?: string;
}

/** The list response keys each resource actually uses (set backend-side). */
const LIST_KEY: Record<ContentType, string> = {
  notes: "notes",
  pyqs: "pyqs",
  syllabus: "syllabus",
};

export const listContent = async (
  type: ContentType,
  params: ContentListParams = {},
  options?: RequestOptions,
) => {
  const response = await apiRequest.get<{
    success?: boolean;
    data?: Record<string, unknown> & { pagination?: ContentPagination };
  }>(`/admin/content/${type}`, {
    params: params as Record<string, unknown>,
    requestKey: options?.requestKey ?? `admin:content:${type}`,
    cancelPrevious: options?.cancelPrevious ?? true,
    dedupe: options?.dedupe ?? true,
    signal: options?.signal,
  });

  const data = response.data ?? {};
  return {
    items: (data[LIST_KEY[type]] as AdminContentItem[]) ?? [],
    pagination: data.pagination ?? {
      page: 1,
      limit: 25,
      total: 0,
      totalPages: 0,
      hasMore: false,
    },
  };
};

export const getContentCounts = async (type: ContentType) => {
  const response = await apiRequest.get<{
    success?: boolean;
    data?: { counts?: ContentCounts };
  }>(`/admin/content/${type}/counts`, {
    requestKey: `admin:content:${type}:counts`,
    dedupe: true,
  });

  return (
    response.data?.counts ?? { pending: 0, approved: 0, rejected: 0, all: 0 }
  );
};

export const approveContent = async (type: ContentType, id: string) =>
  apiRequest.patch(`/admin/content/${type}/${id}/approve`);

export const rejectContent = async (
  type: ContentType,
  id: string,
  rejectionReason: string,
) => apiRequest.patch(`/admin/content/${type}/${id}/reject`, { rejectionReason });

export const deleteContent = async (type: ContentType, id: string) =>
  apiRequest.delete(`/admin/content/${type}/${id}`);
