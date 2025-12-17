import { create } from "zustand";


interface UserStore {
    name: string;
    setName: (name: string) => void;
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    confirmPassword: string;
    setConfirmPassword: (confirmPassword: string) => void;
    otp: string;
    setOtp: (otp: string) => void;
    currentPassword: string;
    setCurrentPassword: (currentPassword: string) => void;
 }
   
const useUserStore = create((set) => ({
 
}));
