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
  FiSettings,
  FiShield,
  FiHome,
  FiBookOpen,
  FiUploadCloud,
  FiInfo,
} from "react-icons/fi";
import ModRequestForm from "@/components/forms/ModRequestForm";
import NotificationsDropdown from "@/components/social/NotificationsDropdown";
import { resendOtp } from "@/lib/api/user/auth.api";
import useAuthStore from "@/stores/user/authStore";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/", label: "Social", icon: FiHome },
  { href: "/library", label: "Library", icon: FiBookOpen },
  { href: "/library/dashboard", label: "Dashboard", icon: FiUploadCloud },
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
    <div className="relative" style={{ color: "var(--ink)" }}>
      {/* Single row */}
      <div className="flex h-12 items-center gap-2 px-3">
        {/* Logo */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex-shrink-0"
          aria-label="Sharda Social home"
        >
          <Image
            src="/shardasocial.png"
            alt="Sharda Social"
            width={34}
            height={34}
            className="h-[34px] w-[34px] object-contain"
            priority
          />
        </Link>

      {/* Icon nav links */}
        <nav
          className="flex items-center gap-1 flex-1 justify-center min-w-0"
          aria-label="Main navigation"
        >
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center h-8 w-8 rounded-full transition-all duration-200 flex-shrink-0"
                style={{
                  color: active ? "var(--ink)" : "var(--muted-ink)",
                  background: active ? "rgba(15,15,15,0.07)" : "transparent",
                }}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <NotificationsDropdown />

          <button
            ref={profileButtonRef}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-8 w-8 overflow-hidden rounded-full flex-shrink-0"
            aria-label="Profile menu"
            aria-expanded={isProfileOpen}
          >
            {profileImage ? (
              <Image
                src={profileImage}
                alt={displayName}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className="flex h-full w-full items-center justify-center text-xs font-bold text-white"
                style={{ background: "var(--ink)" }}
              >
                {displayName[0]?.toUpperCase() || "U"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Profile Dropdown */}
      {isProfileOpen && (
        <motion.div
          ref={profileRef}
          className="absolute right-3 z-50 w-56 overflow-hidden rounded-2xl border"
          style={{
            background: "rgba(255,255,255,0.97)",
            borderColor: "rgba(15,15,15,0.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            top: "calc(100% + 6px)",
          }}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: "rgba(15,15,15,0.08)" }}
          >
            <p className="truncate text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {displayName}
            </p>
            <p className="truncate text-xs" style={{ color: "var(--muted-ink)" }}>
              {user?.email}
            </p>
          </div>
          <div className="p-1.5">
            <button
              type="button"
              onClick={handleVerifyEmail}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-black/5"
              style={{ color: "var(--ink)" }}
            >
              <FiMail className="h-4 w-4 flex-shrink-0" />
              {user?.isEmailVerified ? "Email Verified ✓" : "Verify Email"}
            </button>
            <Link
              href="/profile-settings"
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/5"
              style={{ color: "var(--ink)" }}
            >
              <FiSettings className="h-4 w-4 flex-shrink-0" />
              Profile Settings
            </Link>
            <Link
              href="/auth/change-password"
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/5"
              style={{ color: "var(--ink)" }}
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
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-black/5"
                style={{ color: "var(--ink)" }}
              >
                <FiShield className="h-4 w-4 flex-shrink-0" />
                Become Moderator
              </button>
            )}
            <div className="my-1 border-t" style={{ borderColor: "rgba(15,15,15,0.08)" }} />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-red-50"
              style={{ color: "#dc2626" }}
            >
              <FiLogOut className="h-4 w-4 flex-shrink-0" />
              Logout
            </button>
          </div>
        </motion.div>
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
