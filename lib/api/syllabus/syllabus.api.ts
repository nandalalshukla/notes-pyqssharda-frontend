import api from "../axios";

export interface Syllabus {
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
  year?: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyllabusSearchParams {
  query?: string;
  program?: string;
  courseCode?: string;
  semester?: string;
  year?: string;
}

export const getAllSyllabus = async () => {
  const response = await api.get("/syllabus/all-syllabus");
  return response.data;
};

export const getRecentSyllabus = async (limit: number = 10) => {
  const response = await api.get("/syllabus/all-syllabus", {
    params: { limit },
  });
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

export const searchSyllabus = async (params: SyllabusSearchParams) => {
  const response = await api.get("/syllabus/search-syllabus", {
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
