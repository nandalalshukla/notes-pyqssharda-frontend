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
import ModRequestForm from "@/components/forms/ModRequestForm";
import NotificationsDropdown from "@/components/social/NotificationsDropdown";
import { resendOtp } from "@/lib/api/user/auth.api";
import useAuthStore from "@/stores/user/authStore";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/", label: "Social" },
  { href: "/library", label: "Library" },
  { href: "/library/dashboard", label: "Dashboard" },
  { href: "/about-us", label: "About" },
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
    <div
      className="flex h-14 w-full items-center justify-between px-5"
      style={{ color: "var(--ink)" }}
    >
      {/* Logo */}
      <Link
        href="/"
        onClick={handleLogoClick}
        className="flex items-center gap-2 flex-shrink-0"
        aria-label="Sharda Social home"
      >
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Image
            src="/shardasocial.png"
            alt="Sharda Social"
            width={44}
            height={44}
            className="h-[44px] w-[44px] object-contain"
            priority
          />
        </motion.div>
      </Link>

      {/* Nav links — center */}
      <nav className="flex items-center gap-1" aria-label="Main navigation">
        {navLinks.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{
                color: active ? "var(--ink)" : "var(--muted-ink)",
                background: active ? "rgba(15,15,15,0.06)" : "transparent",
              }}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-2">
        <NotificationsDropdown />

        {/* Profile button */}
        <div className="relative" ref={wrapperRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition-all"
            style={{
              background: "rgba(15,15,15,0.06)",
            }}
            aria-label="Profile menu"
            aria-expanded={isProfileOpen}
          >
            <span className="relative flex h-7 w-7 overflow-hidden rounded-full">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt={displayName}
                  width={28}
                  height={28}
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
            </span>
            <span className="text-sm font-medium max-w-[80px] truncate" style={{ color: "var(--ink)" }}>
              {displayName}
            </span>
            <FiChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
              style={{ color: "var(--muted-ink)" }}
            />
          </button>

          {/* Dropdown */}
          {isProfileOpen && (
            <motion.div
              className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border z-50"
              style={{
                background: "rgba(255,255,255,0.97)",
                borderColor: "rgba(15,15,15,0.12)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
              }}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
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
                {[
                  {
                    icon: <FiMail className="h-4 w-4 flex-shrink-0" />,
                    label: user?.isEmailVerified ? "Email Verified ✓" : "Verify Email",
                    onClick: handleVerifyEmail,
                    isButton: true,
                  },
                  {
                    icon: <FiSettings className="h-4 w-4 flex-shrink-0" />,
                    label: "Profile Settings",
                    href: "/profile-settings",
                    isButton: false,
                  },
                  {
                    icon: <FiKey className="h-4 w-4 flex-shrink-0" />,
                    label: "Change Password",
                    href: "/auth/change-password",
                    isButton: false,
                  },
                ].map((item) =>
                  item.isButton ? (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-black/5"
                      style={{ color: "var(--ink)" }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href!}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/5"
                      style={{ color: "var(--ink)" }}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  )
                )}
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
