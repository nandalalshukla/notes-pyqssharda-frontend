import api from "./axios";

export interface Note {
  _id: string;
  title: string;
  fileUrl: string;
  publicId: string;
  userId: string;
  program: string;
  courseCode: string;
  courseName: string;
  semester: number;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllNotes = async () => {
  const response = await api.get("/notes/all-notes");
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

export const searchNotes = async (query: string) => {
  const response = await api.get("/notes/search-notes", {
    params: { q: query },
  });
  return response.data;
};
