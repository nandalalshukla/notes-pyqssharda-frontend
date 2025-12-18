"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/stores/authStore";

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

  // Wait for Zustand to hydrate from localStorage
  if (!hydrated) {
    return null;
  }

  return <>{children}</>;
}
