"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import useAuthStore from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const AuthMobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isProfileOpen &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/auth/login");
    setIsOpen(false);
  };

  return (
    <div className="w-full text-black p-4">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-xl font-black tracking-tighter">
          Sharda Online Library
        </Link>
        <button
          ref={buttonRef}
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="w-12 h-12 flex items-center justify-center bg-[#FF6666] border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          aria-label="Profile Menu"
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
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? (
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
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
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {isProfileOpen && (
        <div
          ref={profileRef}
          className="absolute right-4 top-20 w-64 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col gap-3 z-50"
        >
          <Link
            href="/auth/verify-email"
            onClick={() => setIsProfileOpen(false)}
            className="w-full text-center px-4 py-2 bg-yellow-300 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-sm font-bold"
          >
            Verify Email
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setIsProfileOpen(false)}
            className="w-full text-center px-4 py-2 bg-blue-300 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-sm font-bold"
          >
            Edit Profile
          </Link>
          <Link
            href="/auth/change-password"
            onClick={() => setIsProfileOpen(false)}
            className="w-full text-center px-4 py-2 bg-green-300 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-sm font-bold"
          >
            Change Password
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-center px-4 py-2 bg-red-400 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-sm font-bold"
          >
            Logout
          </button>
        </div>
      )}

      {isOpen && (
        <div className="flex flex-col gap-4 mt-4 pb-4 font-bold">
          <Link
            href="/explore"
            className="hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Explore
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/about-us"
            className="hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            About Us
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthMobileNav;
