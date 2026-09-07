import api from "../axios";

export interface Pyq {
  _id: string;
  title: string;
  fileUrl: string;
  publicId: string;
  userId:
    | {
        _id: string;
        username: string;
      }
    | string;
  program: string;
  courseCode: string;
  courseName: string;
  semester: number;
  year: string;
  // The school that set the paper — one level above `program`. Null on
  // papers uploaded through the site's own form, which doesn't ask for it.
  school?: string | null;
  // Provenance for papers imported from the university's DSpace repository.
  source?: { system: string; handle: string; bitstream: string } | null;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PyqSearchParams {
  query?: string;
  program?: string;
  courseCode?: string;
  semester?: string;
  year?: string;
}

export interface PyqBrowseParams {
  page?: number;
  limit?: number;
  program?: string;
  school?: string;
  semester?: string;
  year?: string;
  courseCode?: string;
  query?: string;
}

export interface PyqPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PyqFilterOptions {
  programs: string[];
  schools: string[];
  years: string[];
  semesters: number[];
}

/**
 * Paginated, server-filtered browse.
 *
 * Distinct from `getAllPyqs`, which returns a flat top-N for the "latest
 * uploads" strip. Once the collection grew to thousands of imported
 * papers, filtering client-side would have meant downloading all of them
 * to show twenty-four.
 */
export const browsePyqs = async (
  params: PyqBrowseParams = {},
  // Passed through so a superseded search can be cancelled rather than
  // landing late and overwriting newer results.
  signal?: AbortSignal,
) => {
  const response = await api.get<{
    success: boolean;
    data: { pyqs: Pyq[]; pagination: PyqPagination };
  }>("/pyqs/browse-pyqs", { params, signal });
  return response.data.data;
};

/** Filter values that actually match something, for the dropdowns. */
export const getPyqFilterOptions = async () => {
  const response = await api.get<{ success: boolean; data: PyqFilterOptions }>(
    "/pyqs/pyq-filters",
  );
  return response.data.data;
};

export const getAllPyqs = async () => {
  const response = await api.get("/pyqs/all-pyqs");
  return response.data;
};

export const getRecentPyqs = async (limit: number = 10) => {
  const response = await api.get("/pyqs/all-pyqs", {
    params: { limit },
  });
  return response.data;
};

export const getMyPyqs = async () => {
  const response = await api.get("/pyqs/my-pyqs");
  return response.data;
};

export const createPyq = async (data: FormData) => {
  const response = await api.post("/pyqs/upload-pyqs", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updatePyq = async (id: string, data: FormData) => {
  const response = await api.put(`/pyqs/edit-pyqs/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deletePyq = async (id: string) => {
  const response = await api.delete(`/pyqs/delete-pyqs/${id}`);
  return response.data;
};

export const searchPyqs = async (params: PyqSearchParams) => {
  const response = await api.get("/pyqs/search-pyqs", {
    params: {
      ...(params.query && { query: params.query }),
      ...(params.program && { program: params.program }),
      ...(params.courseCode && { courseCode: params.courseCode }),
      ...(params.semester && { semester: params.semester }),
      ...(params.year && { year: params.year }),
    },
  });
  return response.data;
};
