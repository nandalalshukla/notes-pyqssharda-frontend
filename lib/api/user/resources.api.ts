import api from "../axios";

export interface MineResourceParams {
  page?: number;
  limit?: number;
  query?: string;
}

export const getMineResources = async (params: MineResourceParams = {}) => {
  const response = await api.get("/resources/mine", { params });
  return response.data;
};
