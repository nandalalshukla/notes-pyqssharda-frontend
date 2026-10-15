"use client";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/user/authStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.authLoading);
  const authInitialized = useAuthStore((s) => s.authInitialized);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Never make an auth decision before persisted state and /auth/me have
    // finished. The store starts with isAuthenticated=false on every reload.
    if (
      authInitialized &&
      !authLoading &&
      !isAuthenticated &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;
      toast.error("Please log in to access this page");
      router.replace("/auth/login");
    }
  }, [authInitialized, isAuthenticated, authLoading, router]);

  // Show loading state while persisted auth state and the server session are
  // being restored. This prevents a refresh from rendering or redirecting
  // based on the store's initial logged-out state.
  if (!authInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F4F8]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-bold text-black">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (authInitialized && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
