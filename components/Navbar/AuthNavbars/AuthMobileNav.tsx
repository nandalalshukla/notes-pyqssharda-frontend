"use client";
import Link from "next/link";
import { useState } from "react";
import useAuthStore from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const AuthMobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/api/v1/auth/login");
    setIsOpen(false);
  };

  return (
    <div className="w-full bg-white text-black border-b-2 border-black p-4">
      <div className="flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-black tracking-tighter">
          Sharda Online Library
        </Link>
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

      {isOpen && (
        <div className="flex flex-col gap-4 mt-4 pb-4 font-bold">
          <Link
            href="/dashboard"
            className="hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/notes"
            className="hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Notes
          </Link>
          <Link
            href="/pyqs"
            className="hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            PYQs
          </Link>
          <div className="mt-2">
            <button
              onClick={handleLogout}
              className="w-full text-center px-6 py-2 bg-[#FF6666] border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthMobileNav;
