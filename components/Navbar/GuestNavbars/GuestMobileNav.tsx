"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiBookOpen, FiInfo } from "react-icons/fi";

const navLinks = [
  { href: "/", label: "Social", icon: FiHome },
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
    <div className="flex h-12 items-center gap-2 px-3" style={{ color: "var(--ink)" }}>
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

      {/* Auth buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Link
          href="/auth/login"
          className="rounded-full px-3 py-1 text-xs font-medium transition-all"
          style={{ color: "var(--muted-ink)" }}
        >
          Login
        </Link>
        <Link
          href="/auth/register"
          className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-white transition-all"
          style={{ background: "var(--ink)" }}
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default GuestMobileNav;
