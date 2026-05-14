import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Social" },
  { href: "/library", label: "Library" },
  { href: "/about-us", label: "About" },
];

const GuestDesktopNav = () => {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 text-gray-950 lg:px-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 flex-shrink-0">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-950 to-gray-800 text-sm font-black text-white shadow-md">
          S
        </span>
        <span className="text-lg font-black tracking-tight">SOL</span>
      </Link>

      {/* Main Navigation Links */}
      <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white/50 p-1 backdrop-blur-sm">
        {navLinks.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ${
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
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
        >
          Login
        </Link>
        <Link
          href="/auth/register"
          className="rounded-lg bg-gray-950 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-gray-950/20"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default GuestDesktopNav;
