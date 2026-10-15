"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/user/authStore";

export default function GuestOnlyGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const authLoading = useAuthStore((state) => state.authLoading);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (
      authInitialized &&
      !authLoading &&
      isAuthenticated &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;
      router.replace("/library/dashboard");
    }
  }, [authInitialized, authLoading, isAuthenticated, router]);

  if (!authInitialized || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          <p className="text-lg font-bold text-foreground">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
