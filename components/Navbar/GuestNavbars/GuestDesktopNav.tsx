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

const GuestDesktopNav = () => {
  const pathname = usePathname();
  const handleLogoClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 text-foreground sm:px-6 sm:py-2 lg:px-8">
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
      <div className="flex items-center justify-center gap-1 rounded-full border border-border bg-card/70 px-1.5 py-1.5 shadow-soft-sm backdrop-blur-md">
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
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-soft-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="text-base" aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/auth/login"
          className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
        >
          <FiLogIn className="mr-1.5 text-base" />
          Login
        </Link>
        <Link
          href="/auth/register"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-all hover:bg-primary-hover hover:shadow-soft-md"
        >
          <FiUserPlus className="mr-1.5 text-base" />
          Register
        </Link>
      </div>
    </div>
  );
};

export default GuestDesktopNav;
