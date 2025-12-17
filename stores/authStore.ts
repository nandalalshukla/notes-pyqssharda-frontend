import { create } from "zustand";

interface AuthStore {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  newPassword: string;
  setNewPassword: (newPassword: string) => void;
  currentPassword: string;
  setCurrentPassword: (currentPassword: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (confirmNewPassword: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  loading: false,
  setLoading: (loading: boolean) => set({ loading: true }),
  name: "",
  setName: (name: string) => set({ name }),
  email: "",
  setEmail: (email: string) => set({ email }),
  password: "",
  setPassword: (password: string) => set({ password }),
  confirmPassword: "",
  setConfirmPassword: (confirmPassword: string) => set({ confirmPassword }),
  newPassword: "",
  setNewPassword: (newPassword: string) => set({ newPassword }),
  currentPassword: "",
  setCurrentPassword: (currentPassword: string) => set({ currentPassword }),
  confirmNewPassword: "",
  setConfirmNewPassword: (confirmNewPassword: string) =>
    set({ confirmNewPassword }),
  otp: "",
  setOtp: (otp: string) => set({ otp }),
}));

export default useAuthStore;
