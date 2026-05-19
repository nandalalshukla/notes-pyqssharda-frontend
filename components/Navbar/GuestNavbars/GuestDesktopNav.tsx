"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/", label: "Social" },
  { href: "/library", label: "Library" },
  { href: "/about-us", label: "About" },
];

const GuestDesktopNav = () => {
  const pathname = usePathname();

  const handleLogoClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
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

      {/* Auth buttons */}
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
          style={{
            color: "var(--muted-ink)",
          }}
        >
          Login
        </Link>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/auth/register"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all"
            style={{
              background: "var(--ink)",
            }}
          >
            Register
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default GuestDesktopNav;
