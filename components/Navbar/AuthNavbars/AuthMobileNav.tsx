"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import useAuthStore from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ModRequestForm from "@/components/forms/ModRequestForm";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const AuthMobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showModRequestModal, setShowModRequestModal] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { logout, user } = useAuthStore();
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
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-black tracking-tighter">
            SOL
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/posts/nandalalshukla_shardauniversity-btech-engineering-activity-7417953428888293376-ToZ4?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAENPXPMBJ4aMSVhVHnrqUrH1E6gGnQdaGss"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-black hover:scale-110 transition-all"
            >
              <FaLinkedin className="w-6 h-6" />
            </a>
            <a
              href="https://github.com/nandalalshukla/notes-pyqssharda-frontend"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-black hover:scale-110 transition-all"
            >
              <FaGithub className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            ref={buttonRef}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 flex items-center justify-center bg-[#FF6666] border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            aria-label="Profile Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 25"
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
          {user?.role === "user" && (
            <button
              onClick={() => {
                setShowModRequestModal(true);
                setIsProfileOpen(false);
              }}
              className="w-full text-center px-4 py-2 bg-purple-300 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-sm font-bold"
            >
              🎯 Become Moderator
            </button>
          )}
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
      {/* Moderator Request Modal */}
      {showModRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-2xl w-full">
            <ModRequestForm
              onClose={() => setShowModRequestModal(false)}
              onSuccess={() => {
                setShowModRequestModal(false);
                toast.success("Request submitted successfully!");
              }}
            />
          </div>
        </div>
      )}{" "}
    </div>
  );
};

export default AuthMobileNav;
