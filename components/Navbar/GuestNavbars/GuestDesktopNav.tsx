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
          className="h-11 w-11 rounded-xl object-contain drop-shadow-sm"
          priority
        />
      </Link>

      {/* Main Navigation Links */}
      <div className="flex items-center justify-center gap-2">
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
              aria-current={active ? "page" : undefined}
              data-active={active}
              className={cn(
                "feed-filter-pill cursor-pointer",
                active && "text-primary-foreground",
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
          className="feed-filter-pill cursor-pointer"
        >
          <FiLogIn className="mr-1.5 text-base" />
          Login
        </Link>
        <Link
          href="/auth/register"
          data-active="true"
          className="feed-filter-pill cursor-pointer text-primary-foreground"
        >
          <FiUserPlus className="mr-1.5 text-base" />
          Register
        </Link>
      </div>
    </div>
  );
};

export default GuestDesktopNav;
