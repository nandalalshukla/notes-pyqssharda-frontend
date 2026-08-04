"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FiChevronDown,
  FiGrid,
  FiKey,
  FiLogOut,
  FiMail,
  FiMessageCircle,
  FiSettings,
  FiShield,
  FiBookOpen,
  FiInfo,
  FiUser,
} from "react-icons/fi";
import ModRequestForm from "@/components/forms/ModRequestForm";
import NotificationsDropdown from "@/components/social/NotificationsDropdown";
import { resendOtp } from "@/lib/api/user/auth.api";
import useAuthStore from "@/stores/user/authStore";

const navLinks = [
  { href: "/", label: "Social", icon: FiMessageCircle },
  { href: "/library", label: "Library", icon: FiBookOpen },
  { href: "/library/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/about-us", label: "About", icon: FiInfo },
];

const AuthDesktopNav = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showModRequestModal, setShowModRequestModal] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
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
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
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
    <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 text-gray-950 sm:px-6 lg:px-8">
      {/* Logo */}
      <Link
        href="/"
        onClick={handleLogoClick}
        className="flex shrink-0 items-center gap-3"
      >
        <Image
          src="/shardasocial.png"
          alt="Sharda Social"
          width={84}
          height={84}
          className="h-16 w-16 object-contain drop-shadow-md sm:h-21 sm:w-21"
          priority
        />
      </Link>

      {/* Main Navigation Links */}
      <div className="flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/70 px-2 py-1.5 shadow-sm backdrop-blur-md">
        {navLinks.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              aria-label={link.label}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-all duration-200 sm:h-11 sm:w-11 ${
                active
                  ? "border-sky-200 bg-sky-50 text-sky-700 shadow-sm"
                  : "border-transparent bg-white/0 text-gray-700 hover:border-gray-200 hover:bg-white hover:text-gray-950"
              }`}
            >
              <Icon aria-hidden="true" />
              <span className="sr-only">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right Section: Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Dropdown */}
        <NotificationsDropdown />

        {/* Profile Button */}
        <div className="relative" ref={wrapperRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-white/90 px-2 py-1.5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
          >
            <span className="relative flex h-8 w-8 overflow-hidden rounded-full bg-gray-100">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gray-950 text-xs font-bold text-white">
                  {displayName[0]?.toUpperCase() || "U"}
                </span>
              )}
            </span>
            <FiUser className="h-4 w-4 text-gray-700" />
            <FiChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg shadow-gray-950/10 z-50">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="truncate text-sm font-bold text-gray-950">
                  {displayName}
                </p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <FiMail className="h-4 w-4 shrink-0" />
                  <span>
                    {user?.isEmailVerified ? "Email Verified" : "Verify Email"}
                  </span>
                </button>
                <Link
                  href="/profile-settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <FiSettings className="h-4 w-4 shrink-0" />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  href="/auth/change-password"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <FiKey className="h-4 w-4 shrink-0" />
                  <span>Change Password</span>
                </Link>
                {user?.role === "user" && (
                  <button
                    onClick={() => {
                      setShowModRequestModal(true);
                      setIsProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <FiShield className="h-4 w-4 shrink-0" />
                    <span>Become Moderator</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <FiLogOut className="h-4 w-4 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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

export default AuthDesktopNav;
