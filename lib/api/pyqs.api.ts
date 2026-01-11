import api from "./axios";

export interface Pyq {
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

export const getAllPyqs = async () => {
  const response = await api.get("/pyqs/all-pyqs");
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

export const searchPyqs = async (query: string) => {
  const response = await api.get("/pyqs/search-pyqs", {
    params: { q: query },
  });
  return response.data;
};
