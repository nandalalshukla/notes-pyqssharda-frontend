"use client";
import { useState, useEffect } from "react";
import useAuthStore from "@/stores/authStore";
import AuthDesktopNav from "./AuthNavbars/AuthDesktopNav";
import AuthMobileNav from "./AuthNavbars/AuthMobileNav";
import GuestDesktopNav from "./GuestNavbars/GuestDesktopNav";
import GuestMobileNav from "./GuestNavbars/GuestMobileNav";

const Navbar = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        isScrolled ? "border-b-2 border-black" : ""
      }`}
    >
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
