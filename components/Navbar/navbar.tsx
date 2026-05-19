"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import useAuthStore from "@/stores/user/authStore";
import AuthDesktopNav from "./AuthNavbars/AuthDesktopNav";
import AuthMobileNav from "./AuthNavbars/AuthMobileNav";
import GuestDesktopNav from "./GuestNavbars/GuestDesktopNav";
import GuestMobileNav from "./GuestNavbars/GuestMobileNav";

const Navbar = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isScrolled, setIsScrolled] = useState(false);
  const controls = useAnimation();
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        // Always show at the very top
        if (currentY < 60) {
          controls.start({ y: 0, opacity: 1 });
        } else if (delta > 6) {
          // Scrolling down — hide
          controls.start({ y: -90, opacity: 0 });
        } else if (delta < -6) {
          // Scrolling up — reveal
          controls.start({ y: 0, opacity: 1 });
        }

        setIsScrolled(currentY > 8);
        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]);

  return (
    <motion.div
      className="sticky top-0 z-50 flex justify-center px-4 pt-3 pb-2 pointer-events-none"
      animate={controls}
      initial={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav
        className="pointer-events-auto w-full max-w-5xl"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "9999px",
          border: "1.5px solid rgba(15,15,15,0.1)",
          boxShadow: isScrolled
            ? "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)"
            : "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div className="hidden md:block">
          {isAuthenticated ? <AuthDesktopNav /> : <GuestDesktopNav />}
        </div>
        <div className="md:hidden">
          {isAuthenticated ? <AuthMobileNav /> : <GuestMobileNav />}
        </div>
      </nav>
    </motion.div>
  );
};

export default Navbar;
