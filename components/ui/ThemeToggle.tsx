"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Deliberate one-time mount flag to avoid SSR/client hydration mismatch
  // (server never knows the resolved theme) — not a data sync, so the
  // set-state-in-effect lint rule doesn't apply here.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={cn("feed-filter-pill icon-control nav-control h-11 w-11", className)}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "feed-filter-pill icon-control nav-control h-11 w-11 cursor-pointer",
        className,
      )}
    >
      {isDark ? (
        <Sun className="text-foreground" />
      ) : (
        <Moon className="text-foreground" />
      )}
    </button>
  );
}
