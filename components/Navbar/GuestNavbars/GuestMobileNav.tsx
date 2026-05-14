"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Social" },
  { href: "/library", label: "Library" },
  { href: "/about-us", label: "About" },
];

const GuestMobileNav = () => {
  const pathname = usePathname();

  return (
    <div className="w-full px-4 py-3 text-gray-950">
      <div className="flex items-center justify-between gap-3 mb-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gray-950 to-gray-800 text-sm font-black text-white">
            S
          </span>
          <span className="text-lg font-black tracking-tight">SOL</span>
        </Link>
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

      {/* Auth Buttons */}
      <div className="flex gap-2">
        <Link
          href="/auth/login"
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-center text-xs font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
        >
          Login
        </Link>
        <Link
          href="/auth/register"
          className="flex-1 rounded-lg bg-gray-950 px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default GuestMobileNav;
