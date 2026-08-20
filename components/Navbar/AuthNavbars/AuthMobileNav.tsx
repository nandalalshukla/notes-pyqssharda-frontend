"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FiGrid,
  FiKey,
  FiLogOut,
  FiMail,
  FiMessageCircle,
  FiSettings,
  FiShield,
  FiBookOpen,
  FiInfo,
} from "react-icons/fi";
import ModRequestForm from "@/components/forms/ModRequestForm";
import NotificationsDropdown from "@/components/social/NotificationsDropdown";
import { resendOtp } from "@/lib/api/user/auth.api";
import useAuthStore from "@/stores/user/authStore";
import { ThemeToggle } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/", label: "Social", icon: FiMessageCircle },
  { href: "/library", label: "Library", icon: FiBookOpen },
  { href: "/library/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/about-us", label: "About", icon: FiInfo },
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
    <div className="relative w-full px-3 py-2 text-foreground sm:px-5">
      <div className="flex items-center gap-2">
        {/* Logo */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex shrink-0 items-center gap-2"
        >
          <Image
            src="/shardasocial.png"
            alt="Sharda Social"
            width={64}
            height={64}
            className="h-11 w-11 object-contain drop-shadow-md sm:h-14 sm:w-14"
            priority
          />
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-1 items-center justify-center gap-1 rounded-full border border-border bg-card/80 px-1 py-1 shadow-soft-sm backdrop-blur-md">
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
                className={cn(
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-soft-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon aria-hidden="true" />
                <span className="sr-only">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Actions: Notifications & Profile */}
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <NotificationsDropdown />

          <button
            ref={profileButtonRef}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border cursor-pointer"
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
              <span className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
                {displayName[0]?.toUpperCase() || "U"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Profile Dropdown */}
      {isProfileOpen && (
        <div
          ref={profileRef}
          className="absolute right-3 left-3 z-50 mt-2 animate-scale-in overflow-hidden rounded-2xl border border-border bg-card shadow-soft-lg sm:right-5 sm:left-5"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
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
