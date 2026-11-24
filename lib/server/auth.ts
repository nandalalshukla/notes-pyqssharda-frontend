import { cookies } from "next/headers";

const backendOrigin = (process.env.BACKEND_ORIGIN || "http://localhost:5000").replace(/\/$/, "");

export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }

  try {
    const url = new URL(value, "https://sharda.social");
    return url.origin === "https://sharda.social" ? `${url.pathname}${url.search}${url.hash}` : "/";
  } catch {
    return "/";
  }
}

export async function getServerAuthStatus(): Promise<"authenticated" | "unauthenticated" | "unavailable"> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return "unauthenticated";

  try {
    const response = await fetch(`${backendOrigin}/api/v1/auth/me`, {
      headers: { Cookie: `accessToken=${encodeURIComponent(accessToken)}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) return "authenticated";
    if (response.status === 401 || response.status === 403) return "unauthenticated";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

export async function getServerAuthUser(): Promise<{
  status: "authenticated" | "unauthenticated" | "unavailable";
  user: import("@/lib/api/user/user.api").User | null;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) {
    return { status: "unauthenticated", user: null };
  }

  try {
    const response = await fetch(`${backendOrigin}/api/v1/auth/me`, {
      headers: { Cookie: `accessToken=${encodeURIComponent(accessToken)}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 401 || response.status === 403) {
      return { status: "unauthenticated", user: null };
    }
    if (!response.ok) {
      return { status: "unavailable", user: null };
    }

    const body = await response.json();
    const user = body?.data?.user as
      | import("@/lib/api/user/user.api").User
      | undefined;
    return {
      status: user ? "authenticated" : "unauthenticated",
      user: user ?? null,
    };
  } catch {
    return { status: "unavailable", user: null };
  }
}

export async function getServerAuthCookies() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("accessToken")?.value,
    refreshToken: cookieStore.get("refreshToken")?.value,
  };
}
