import api from "./axios";

export const register = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post("/auth/register", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

export const forgotPassword = (data: { email: string }) =>
  api.post("/auth/forgot-password", data);

export const resetPassword = (data: {
  email: string;
  otp: string;
  newPassword: string;
}) => api.post("/auth/reset-password", data);

export const verifyEmail = (data: { otp: string; email: string }) =>
  api.post("/auth/verify-email", data);

export const logout = () => api.post("/auth/logout", {});

export const changePassword = (data: {
  email: string;
  currentPassword: string;
  newPassword: string;
}) => api.post("/auth/change-password", data);
export const getMe = async () => {
  const res = await api.get("/auth/me", {
    withCredentials: true,
  });
  return res;
};

