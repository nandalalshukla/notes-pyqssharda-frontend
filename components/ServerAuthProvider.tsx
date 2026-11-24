"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import useAuthStore from "@/stores/user/authStore";
import type { User } from "@/lib/api/user/user.api";

interface ServerAuthContextValue {
  user: User | null;
  status: "authenticated" | "unauthenticated" | "unavailable";
}

const ServerAuthContext = createContext<ServerAuthContextValue>({
  user: null,
  status: "unauthenticated",
});

export function ServerAuthProvider({
  children,
  user,
  status,
}: {
  children: React.ReactNode;
  user: User | null;
  status: "authenticated" | "unauthenticated" | "unavailable";
}) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    useAuthStore.setState({
      user,
      isAuthenticated: status === "authenticated" && Boolean(user),
      authLoading: false,
      authInitialized: true,
    });
  }, [status, user]);

  return (
    <ServerAuthContext.Provider value={{ user, status }}>
      {children}
    </ServerAuthContext.Provider>
  );
}

export function useServerAuth() {
  return useContext(ServerAuthContext);
}
