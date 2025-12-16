import api from "./axios";



export const register = (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => api.post("/auth/register", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

export const forgotPassword = (data: { email: string }) =>
  api.post("/auth/forgot-password",  data);

export const resetPassword = (data: { token: string; otp:string, newPassword: string, confirmNewPassword:string }) =>
  api.post("/auth/reset-password", data);

export const verifyEmail = (data: { otp: string, token: string }) => api.post("/auth/verify-email", data);

export const logout = () => api.post("/auth/logout", {});

export const changePassword = (data: {
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string; 
}) => api.post("/auth/change-password", data);
