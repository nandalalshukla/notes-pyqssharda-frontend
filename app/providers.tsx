"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/stores/user/authStore";

export default function AuthProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);
  const {
    fetchMe,
    setAuthLoading,
    setAuthInitialized,
    authInitialized,
  } = useAuthStore();

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

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    const initAuth = async () => {
      const { isAuthenticated, user } = useAuthStore.getState();
      if (!isAuthenticated && !user) {
        setAuthInitialized(true);
        return;
      }

      setAuthLoading(true);
      try {
        await fetchMe();
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      cancelled = true;
    };
  }, [hydrated, fetchMe, setAuthLoading, setAuthInitialized]);

  // Wait for Zustand to hydrate from localStorage
  if (!hydrated || !authInitialized) {
    return null;
  }

  return <>{children}</>;
}
