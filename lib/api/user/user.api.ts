import api from "../axios";

export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: "user" | "mod" | "admin";
  isActive: boolean;
  isEmailVerified: boolean;
  contributions: number;
  modRequest?: "pending" | "approved" | "rejected" | null;
  contactNo?: string;
  modRequestAt?: string;
  modMotivation?: string;
  bio?: string;
  course?: string;
  profilePic?: {
    url: string;
    publicId: string;
  };
  followersCount?: number;
  followingCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Profile Management
export const updateProfile = async (data: {
  name?: string;
  bio?: string;
  course?: string;
  contactNo?: string;
  profilePic?: File;
}) => {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.bio) formData.append("bio", data.bio);
  if (data.course) formData.append("course", data.course);
  if (data.contactNo) formData.append("contactNo", data.contactNo);
  if (data.profilePic) formData.append("profilePic", data.profilePic);

  const response = await api.put("/auth/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const removeProfilePic = async () => {
  const response = await api.delete("/auth/profile-pic");
  return response.data;
};

export const deactivateAccount = async () => {
  const response = await api.post("/auth/deactivate", {});
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete("/auth/account");
  return response.data;
};

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

// Search from all resources
export const searchFromAllResources = async (params: {
  query: string;
  type?: "all" | "notes" | "pyqs" | "syllabus";
}) => {
  const response = await api.get("/resources/search", { params });
  return response.data;
};
