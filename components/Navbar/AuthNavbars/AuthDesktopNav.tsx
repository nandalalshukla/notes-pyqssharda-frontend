"use client";
import Link from "next/link";
import { useState } from "react";
import useAuthStore from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const AuthDesktopNav = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/auth/login");
  };

  return (
    <div className="flex items-center justify-between w-full py-4 px-8 text-black">
      <Link
        href="/"
        className="text-2xl font-black tracking-tighter hover:scale-105 transition-transform"
      >
        Sharda Online Library
      </Link>
      <div className="flex items-center gap-8 font-bold text-sm">
        <Link
          href="/explore"
          className="hover:text-blue-600 transition-colors"
        >
          Explore
        </Link>
        <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
          Dashboard
        </Link>
        <Link href="/about-us" className="hover:text-blue-600 transition-colors">
          About Us
        </Link>
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-12 h-12 flex items-center justify-center bg-[#FF6666] border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-4 w-56 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 flex flex-col gap-2 z-50">
              <Link
                href="/auth/verify-email"
                onClick={() => setIsProfileOpen(false)}
                className="w-full text-center px-4 py-2 bg-yellow-300 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm font-bold"
              >
                Verify Email
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setIsProfileOpen(false)}
                className="w-full text-center px-4 py-2 bg-blue-300 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm font-bold"
              >
                Edit Profile
              </Link>
              <Link
                href="/auth/change-password"
                onClick={() => setIsProfileOpen(false)}
                className="w-full text-center px-4 py-2 bg-green-300 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm font-bold"
              >
                Change Password
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-center px-4 py-2 bg-red-400 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm font-bold"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthDesktopNav;
