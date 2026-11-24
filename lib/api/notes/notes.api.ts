import api from "../axios";

export interface Note {
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
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteSearchParams {
  query?: string;
  program?: string;
  courseCode?: string;
  semester?: string;
  year?: string;
}

export interface NoteBrowseParams {
  page?: number;
  limit?: number;
  program?: string;
  semester?: string;
  year?: string;
  courseCode?: string;
  query?: string;
}

export interface NotePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface NoteFilterOptions {
  programs: string[];
  years: string[];
  semesters: number[];
}

export const browseNotes = async (
  params: NoteBrowseParams = {},
  signal?: AbortSignal,
) => {
  const response = await api.get<{
    success: boolean;
    data: { notes: Note[]; pagination: NotePagination };
  }>("/notes/browse-notes", { params, signal });
  return response.data.data;
};

export const getNoteFilterOptions = async () => {
  const response = await api.get<{ success: boolean; data: NoteFilterOptions }>(
    "/notes/note-filters",
  );
  return response.data.data;
};

export const getNoteById = async (noteId: string): Promise<Note | null> => {
  const origin = process.env.BACKEND_ORIGIN ?? "http://localhost:5000";
  const res = await fetch(`${origin}/api/v1/notes/note/${noteId}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { data?: { note?: Note } };
  return body.data?.note ?? null;
};

export const getAllNotes = async () => {
  const response = await api.get("/notes/all-notes");
  return response.data;
};

export const getRecentNotes = async (limit: number = 10) => {
  const response = await api.get("/notes/all-notes", {
    params: { limit },
  });
  return response.data;
};

export interface MyResourceParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
  query?: string;
}

export interface ResourcePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export const getMyNotes = async (params: MyResourceParams = {}) => {
  const response = await api.get("/notes/my-notes", { params });
  return response.data;
};

export const createNote = async (data: FormData) => {
  const response = await api.post("/notes", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateNote = async (id: string, data: FormData) => {
  const response = await api.put(`/notes/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteNote = async (id: string) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};

export const searchNotes = async (params: NoteSearchParams) => {
  const response = await api.get("/notes/search-notes", {
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
