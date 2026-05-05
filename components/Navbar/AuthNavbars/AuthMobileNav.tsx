"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FiKey,
  FiLogOut,
  FiMail,
  FiMenu,
  FiSettings,
  FiShield,
  FiX,
} from "react-icons/fi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import ModRequestForm from "@/components/forms/ModRequestForm";
import useAuthStore from "@/stores/user/authStore";

const navLinks = [
  { href: "/", label: "Feed" },
  { href: "/library/explore", label: "Explore" },
  { href: "/library/dashboard", label: "Dashboard" },
  { href: "/about-us", label: "About" },
];

const AuthMobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showModRequestModal, setShowModRequestModal] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const profileImage = user?.profilePic?.url || "";
  const displayName = user?.username || user?.name || "User";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isProfileOpen &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/auth/login");
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <div className="relative w-full px-4 py-3 text-gray-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-950 text-sm font-black text-white">
              S
            </span>
            <span className="text-xl font-black tracking-tight">SOL</span>
          </Link>
          <div className="flex items-center gap-1">
            <a
              href="https://www.linkedin.com/posts/nandalalshukla_shardauniversity-btech-engineering-activity-7417953428888293376-ToZ4?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAENPXPMBJ4aMSVhVHnrqUrH1E6gGnQdaGss"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="rounded-lg p-2 text-gray-500"
            >
              <FaLinkedin className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/nandalalshukla/notes-pyqssharda-frontend"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="rounded-lg p-2 text-gray-500"
            >
              <FaGithub className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            ref={profileButtonRef}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-10 w-10 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200"
            aria-label="Profile menu"
          >
            {profileImage ? (
              <Image
                src={profileImage}
                alt={displayName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-gray-950 text-sm font-bold text-white">
                {displayName[0]?.toUpperCase() || "U"}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm"
            aria-label="Navigation menu"
          >
            {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isProfileOpen && (
        <div
          ref={profileRef}
          className="absolute right-4 top-16 z-50 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-950/10"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-bold">{displayName}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
          <div className="p-2">
            <Link
              href="/auth/verify-email"
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <FiMail className="h-4 w-4" />
              Verify Email
            </Link>
            <Link
              href="/profile-settings"
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <FiSettings className="h-4 w-4" />
              Profile Settings
            </Link>
            <Link
              href="/auth/change-password"
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <FiKey className="h-4 w-4" />
              Change Password
            </Link>
            {user?.role === "user" && (
              <button
                onClick={() => {
                  setShowModRequestModal(true);
                  setIsProfileOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <FiShield className="h-4 w-4" />
                Become Moderator
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <FiLogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="mt-3 grid gap-1 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          {navLinks.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  active
                    ? "bg-gray-950 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      {showModRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl">
            <ModRequestForm
              onClose={() => setShowModRequestModal(false)}
              onSuccess={() => {
                setShowModRequestModal(false);
                toast.success("Request submitted successfully!");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthMobileNav;
