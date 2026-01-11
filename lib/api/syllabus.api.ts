import api from "./axios";

export interface Syllabus {
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

export const getAllSyllabus = async () => {
  const response = await api.get("/syllabus/all-syllabus");
  return response.data;
};

export const getMySyllabus = async () => {
  const response = await api.get("/syllabus/my-syllabus");
  return response.data;
};

export const createSyllabus = async (data: FormData) => {
  const response = await api.post("/syllabus/upload-syllabus", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateSyllabus = async (id: string, data: FormData) => {
  const response = await api.put(`/syllabus/edit-syllabus/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteSyllabus = async (id: string) => {
  const response = await api.delete(`/syllabus/delete-syllabus/${id}`);
  return response.data;
};

export const searchSyllabus = async (query: string) => {
  const response = await api.get("/syllabus/search-syllabus", {
    params: { q: query },
  });
  return response.data;
};
