"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/stores/user/authStore";

export default function AuthProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const { fetchMe, setAuthLoading } = useAuthStore();

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
      setAuthLoading(true);
      try {
        await fetchMe();
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
          setAuthReady(true);
        }
      }
    };

    initAuth();

    return () => {
      cancelled = true;
    };
  }, [hydrated, fetchMe, setAuthLoading]);

  // Wait for Zustand to hydrate from localStorage
  if (!hydrated || !authReady) {
    return null;
  }

  return <>{children}</>;
}
