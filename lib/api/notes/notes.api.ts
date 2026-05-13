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

export const getMyNotes = async () => {
  const response = await api.get("/notes/my-notes");
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
