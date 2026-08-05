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

const navLinks = [
  { href: "/", label: "Social", icon: FiMessageCircle },
  { href: "/library", label: "Library", icon: FiBookOpen },
  { href: "/about-us", label: "About", icon: FiInfo },
];

const GuestDesktopNav = () => {
  const pathname = usePathname();
  const handleLogoClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 text-gray-950 sm:px-6 sm:py-2 lg:px-8">
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
      <div className="flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/70 px-2 py-1 shadow-sm backdrop-blur-md">
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
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-base transition-all duration-200 sm:h-10 sm:w-10 ${
                active
                  ? "border-sky-200 bg-sky-50 text-sky-700 shadow-sm"
                  : "border-transparent bg-white/0 text-gray-700 hover:border-gray-200 hover:bg-white hover:text-gray-950"
              }`}
            >
              <Icon aria-hidden="true" />
              <span className="sr-only">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          aria-label="Login"
          title="Login"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950"
        >
          <FiLogIn className="text-base" />
          <span className="sr-only">Login</span>
        </Link>
        <Link
          href="/auth/register"
          aria-label="Register"
          title="Register"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-950 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-gray-950/20"
        >
          <FiUserPlus className="text-base" />
          <span className="sr-only">Register</span>
        </Link>
      </div>
    </div>
  );
};

export default GuestDesktopNav;
