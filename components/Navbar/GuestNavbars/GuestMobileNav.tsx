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
            className="h-9 w-9 rounded-lg object-contain drop-shadow-sm"
            priority
          />
        </Link>

        <div className="flex flex-1 items-center justify-center gap-1">
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
                aria-current={active ? "page" : undefined}
                data-active={active}
                className={cn(
                  "feed-filter-pill icon-control h-11 w-11 shrink-0 cursor-pointer",
                  active && "text-primary-foreground",
                )}
              >
                <Icon className="!h-6 !w-6" aria-hidden="true" />
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
            className="feed-filter-pill icon-control h-11 w-11 cursor-pointer"
          >
            <FiLogIn className="!h-6 !w-6" />
            <span className="sr-only">Login</span>
          </Link>
          <Link
            href="/auth/register"
            aria-label="Register"
            title="Register"
            data-active="true"
            className="feed-filter-pill icon-control h-11 w-11 cursor-pointer text-primary-foreground"
          >
            <FiUserPlus className="!h-6 !w-6" />
            <span className="sr-only">Register</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestMobileNav;
