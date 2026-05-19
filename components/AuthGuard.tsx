"use client";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/user/authStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.authLoading);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Don't redirect while still loading auth state
    if (!authLoading && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      toast.error("Please log in to access this page");
      router.replace("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state while verifying authentication
  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--paper-bg)" }}
      >
        <div className="text-center">
          <div
            className="w-14 h-14 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--ink)", borderTopColor: "transparent" }}
          />
          <p className="text-base font-bold" style={{ color: "var(--ink)" }}>
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
