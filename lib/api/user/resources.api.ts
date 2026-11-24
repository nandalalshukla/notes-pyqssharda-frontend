import api from "../axios";

export interface MineResourceParams {
  page?: number;
  limit?: number;
  query?: string;
  type?: "note" | "pyq" | "syllabus" | "all";
  status?: "pending" | "approved" | "rejected" | "all";
  sort?: "createdAt" | "updatedAt" | "title" | "courseCode";
  direction?: "asc" | "desc";
}

export const getMineResources = async (params: MineResourceParams = {}) => {
  const response = await api.get("/resources/mine", { params });
  return response.data;
};
