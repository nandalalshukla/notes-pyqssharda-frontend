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
