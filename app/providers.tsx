"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import useAuthStore from "@/stores/authStore";

const AUTH_ROUTES = ["/login", "/register", "/verify-email"];

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    if (!AUTH_ROUTES.includes(pathname)) {
      fetchMe();
    }
  }, [pathname, fetchMe]);

  return <>{children}</>;
}
