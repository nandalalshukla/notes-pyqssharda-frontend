"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
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
import NotificationsDropdown from "@/components/social/NotificationsDropdown";
import { resendOtp } from "@/lib/api/user/auth.api";
import useAuthStore from "@/stores/user/authStore";
import { ThemeToggle } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useOnClickOutside } from "@/hooks";

// Only rendered when a "user" role clicks "Become Moderator" — keep it out
// of the navbar's initial bundle (shipped on every page).
const ModRequestForm = dynamic(() => import("@/components/forms/ModRequestForm"));

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

  useOnClickOutside(wrapperRef, () => setIsProfileOpen(false), isProfileOpen);

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
    <div className="mx-auto flex min-h-0 w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 text-foreground sm:px-6 sm:py-2 lg:px-8">
      {/* Logo */}
      <Link
        href="/"
        onClick={handleLogoClick}
        className="flex shrink-0 items-center gap-3"
      >
        <Image
          src="/shardasocial.png"
          alt="Sharda Social"
          width={72}
          height={72}
          className="h-14 w-14 object-contain drop-shadow-md sm:h-16 sm:w-16"
          priority
        />
      </Link>

      {/* Main Navigation Links */}
      <div className="flex items-center justify-center gap-1 rounded-full border border-border bg-card/70 px-1.5 py-1.5 shadow-soft-sm backdrop-blur-md">
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
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200 xl:px-4",
                active
                  ? "bg-primary text-primary-foreground shadow-soft-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="text-base" aria-hidden="true" />
              <span className="hidden xl:inline">{link.label}</span>
              <span className="sr-only xl:hidden">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right Section: Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <ThemeToggle />
        <NotificationsDropdown />

        {/* Profile Button */}
        <div className="relative" ref={wrapperRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 shadow-soft-sm transition-all hover:shadow-soft-md cursor-pointer"
          >
            <span className="relative flex h-7 w-7 overflow-hidden rounded-full bg-muted sm:h-8 sm:w-8">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
                  {displayName[0]?.toUpperCase() || "U"}
                </span>
              )}
            </span>
            <FiUser className="h-4 w-4 text-muted-foreground" />
            <FiChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isProfileOpen && "rotate-180",
              )}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 z-50 mt-2 w-56 animate-scale-in overflow-hidden rounded-2xl border border-border bg-card shadow-soft-lg">
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-bold text-foreground">
                  {displayName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer"
                >
                  <FiMail className="h-4 w-4 shrink-0" />
                  <span>
                    {user?.isEmailVerified ? "Email Verified" : "Verify Email"}
                  </span>
                </button>
                <Link
                  href="/profile-settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <FiSettings className="h-4 w-4 shrink-0" />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  href="/auth/change-password"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
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
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer"
                  >
                    <FiShield className="h-4 w-4 shrink-0" />
                    <span>Become Moderator</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
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
