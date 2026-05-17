"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FiChevronDown,
  FiKey,
  FiLogOut,
  FiMail,
  FiSettings,
  FiShield,
} from "react-icons/fi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import ModRequestForm from "@/components/forms/ModRequestForm";
import NotificationsDropdown from "@/components/social/NotificationsDropdown";
import { resendOtp } from "@/lib/api/user/auth.api";
import useAuthStore from "@/stores/user/authStore";

const navLinks = [
  { href: "/", label: "Social" },
  { href: "/library", label: "Library" },
  { href: "/library/dashboard", label: "Dashboard" },
  { href: "/about-us", label: "About" },
];

const AuthMobileNav = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showModRequestModal, setShowModRequestModal] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const profileImage = user?.profilePic?.url || "";
  const displayName = user?.username || user?.name || "User";
  const handleLogoClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

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
    setIsProfileOpen(false);
  };

  const handleVerifyEmail = async () => {
    if (!user?.email) {
      toast.error("Could not find your email address");
      return;
    }

    if (user.isEmailVerified) {
      toast.success("Your email is already verified");
      setIsProfileOpen(false);
      return;
    }

    try {
      sessionStorage.setItem("verifyEmail", user.email);
      await resendOtp({ email: user.email });
      toast.success("OTP sent to your email");
      router.push("/auth/verify-email");
    } catch {
      toast.error("Could not send OTP. Please try again.");
    } finally {
      setIsProfileOpen(false);
    }
  };

  return (
    <div className="w-full px-4 py-3 text-gray-950">
      <div className="flex items-center justify-between gap-3">
        {/* Logo */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <Image
            src="/shardasocial.png"
            alt="Sharda Social"
            width={100}
            height={100}
            className="h-[100px] w-[100px] object-contain drop-shadow-md"
            priority
          />
        </Link>

        {/* Right Actions: Notifications & Profile */}
        <div className="flex items-center gap-2">
          <NotificationsDropdown />

          <button
            ref={profileButtonRef}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-9 w-9 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200 flex-shrink-0"
            aria-label="Profile menu"
          >
            {profileImage ? (
              <Image
                src={profileImage}
                alt={displayName}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-gray-950 text-xs font-bold text-white">
                {displayName[0]?.toUpperCase() || "U"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Links - Always Visible */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 rounded-lg bg-white/50 border border-gray-200 p-1 backdrop-blur-sm">
        {navLinks.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                active
                  ? "bg-white text-gray-950 shadow-sm"
                  : "text-gray-600 hover:text-gray-950"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Profile Dropdown */}
      {isProfileOpen && (
        <div
          ref={profileRef}
          className="absolute right-4 left-4 z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg shadow-gray-950/10"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-bold">{displayName}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
          <div className="p-2">
            <button
              type="button"
              onClick={handleVerifyEmail}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <FiMail className="h-4 w-4 flex-shrink-0" />
              {user?.isEmailVerified ? "Email Verified" : "Verify Email"}
            </button>
            <Link
              href="/profile-settings"
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <FiSettings className="h-4 w-4 flex-shrink-0" />
              Profile Settings
            </Link>
            <Link
              href="/auth/change-password"
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <FiKey className="h-4 w-4 flex-shrink-0" />
              Change Password
            </Link>
            {user?.role === "user" && (
              <button
                onClick={() => {
                  setShowModRequestModal(true);
                  setIsProfileOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <FiShield className="h-4 w-4 flex-shrink-0" />
                Become Moderator
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <FiLogOut className="h-4 w-4 flex-shrink-0" />
              Logout
            </button>
          </div>
        </div>
      )}

      <ModRequestForm
        isOpen={showModRequestModal}
        onClose={() => setShowModRequestModal(false)}
        onSuccess={() => {
          setShowModRequestModal(false);
          toast.success("Request submitted successfully!");
        }}
      />
    </div>
  );
};

export default AuthMobileNav;
