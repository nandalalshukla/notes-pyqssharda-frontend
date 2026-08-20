"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiBookOpen,
  FiInfo,
  FiLogIn,
  FiMessageCircle,
  FiUserPlus,
} from "react-icons/fi";
import { ThemeToggle } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/", label: "Social", icon: FiMessageCircle },
  { href: "/library", label: "Library", icon: FiBookOpen },
  { href: "/about-us", label: "About", icon: FiInfo },
];

const GuestMobileNav = () => {
  const pathname = usePathname();
  const handleLogoClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full px-3 py-2 text-foreground sm:px-5">
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

        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <Link
            href="/auth/login"
            aria-label="Login"
            title="Login"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all hover:bg-secondary"
          >
            <FiLogIn className="text-base" />
            <span className="sr-only">Login</span>
          </Link>
          <Link
            href="/auth/register"
            aria-label="Register"
            title="Register"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft-sm transition-all hover:bg-primary-hover"
          >
            <FiUserPlus className="text-base" />
            <span className="sr-only">Register</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestMobileNav;
