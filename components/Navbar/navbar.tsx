"use client";
import useAuthStore from "@/stores/authStore";
import AuthDesktopNav from "./AuthNavbars/AuthDesktopNav";
import AuthMobileNav from "./AuthNavbars/AuthMobileNav";
import GuestDesktopNav from "./GuestNavbars/GuestDesktopNav.tsx";
import GuestMobileNav from "./GuestNavbars/GuestMobileNav";

const Navbar = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <nav className="sticky top-0 z-50">
      <div className="hidden md:block">
        {isAuthenticated ? <AuthDesktopNav /> : <GuestDesktopNav />}
      </div>
      <div className="md:hidden">
        {isAuthenticated ? <AuthMobileNav /> : <GuestMobileNav />}
      </div>
    </nav>
  );
};

export default Navbar;
