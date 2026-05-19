"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/stores/user/authStore";

export default function AuthProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for Zustand to finish hydrating from localStorage
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // If already hydrated, set immediately
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Show a minimal background instead of null to avoid blank flash
  if (!hydrated) {
    return (
      <div className="min-h-screen" style={{ background: "var(--paper-bg)" }} />
    );
  }

  return <>{children}</>;
}
