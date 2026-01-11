import api from "./axios";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "mod" | "admin";
  isActive: boolean;
  isEmailVerified: boolean;
  contributions: number;
  modRequest?: "pending" | "approved" | "rejected" | null;
  contactNo?: string;
  modRequestAt?: string;
  modMotivation?: string;
  createdAt: string;
  updatedAt: string;
}

// Mod request functionality
export const requestModRole = async (data: {
  contactNo: string;
  motivation: string;
}) => {
  const response = await api.post("/auth/request-mod", data);
  return response.data;
};

// Fetch contributors (leaderboard)
export const getContributors = async () => {
  const response = await api.get("/auth/contributors");
  return response.data;
};
