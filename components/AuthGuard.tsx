"use client";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to access this page");
      router.replace("/api/v1/auth/login");
    }
  }, [isAuthenticated, router]);

  return <>{children}</>;
}
