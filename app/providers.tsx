"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/stores/user/authStore";

/**
 * Restores the signed-in session on load, then keeps rendering out of the
 * way.
 *
 * This used to return `null` until Zustand had rehydrated from
 * localStorage and `/auth/me` had answered — which meant the entire site
 * rendered as an empty page on the server. Search engines were served a
 * blank document for every route, and the first paint for real users was
 * an empty screen until JavaScript had downloaded, parsed and completed a
 * round trip.
 *
 * Pages now render immediately and independently of it. The thing that
 * gate was protecting against — showing signed-out UI for a moment to
 * someone who is signed in — is handled where it belongs: `AuthGuard`
 * holds protected pages until `authLoading` clears, and public pages are
 * supposed to render for signed-out visitors anyway.
 */
export default function AuthProviders() {
  const [hydrated, setHydrated] = useState(false);
  const { fetchMe, setAuthLoading, setAuthInitialized } = useAuthStore();

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

  // Renders nothing. It used to wrap the page, which put the whole app
  // behind a client component boundary — the server then streamed the
  // footer out before the page content, so the main content of every page
  // appeared *after* the footer in the HTML a crawler reads. As an
  // effect-only sibling it does the same job without owning the tree.
  return null;
}
